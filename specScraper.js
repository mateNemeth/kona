const axios = require('axios');
const cheerio = require('cheerio');
const calculateAll = require('./calculateAvg');
const db = require('./db');
const logger = require('./logger/logger');
const utils = require('./utils');

const findToScrape = async () => {
  try {
    logger('info', 'Querying un-crawled entries.');
    return await db('carlist')
      .where('crawled', false)
      .first()
      .then((row) => {
        if (row) {
          let entry = {
            id: row.id,
            platform: row.platform,
            url: row.link,
          };

          logger('info', `Found new entry: ${JSON.stringify(entry)}`);
          return entry;
        }

        logger('info', 'No new entry.');
        return;
      });
  } catch (error) {
    logger('error', error.stack);
  }
};

const scrapeSingle = async () => {
  try {
    const data = await findToScrape();
    if (data) {
      logger('info', `Scraping url: ${data.platform}${data.url}`);
      const raw = await queryUrl(`${data.platform}${data.url}`, data.id);

      const carDetails = raw && (await carProcess(raw.data, data.id));

      if (!carDetails) {
        logger('info', `Updating db to skip: ${JSON.stringify(data)}.`);
        await db('carlist').where('id', data.id).update('crawled', true);
        return 'restart';
      } else {
        return carDetails;
      }
    } else {
      return;
    }
  } catch (error) {
    logger('error', error.stack);
  }
};

const carProcess = async (data, id) => {
  try {
    logger('info', 'Processing the raw html data.');
    const html = await data;
    const numberPattern = /\d+/g;
    const lookFor = (element, keyword) => {
      return $(element).filter(function () {
        return $(this).text().trim() === keyword;
      });
    };

    let $ = cheerio.load(html);

    let make = $("dt:contains('Márka')").next().text().trim();
    let model = $("dt:contains('Modell')").next().text().trim();
    let ageData = $('.sc-font-l.cldt-stage-primary-keyfact')
      .eq(4)
      .text()
      .match(numberPattern);
    let age = ageData ? Number(ageData[1]) : null;
    let km = () => {
      let result = $('.sc-font-l.cldt-stage-primary-keyfact')
        .eq(3)
        .text()
        .match(numberPattern);
      return result && result.length > 1 ? Number(result.join('')) : 0;
    };
    let kw = () => {
      let result = Number(
        $('.sc-font-l.cldt-stage-primary-keyfact')
          .eq(5)
          .text()
          .match(numberPattern)
      );
      return result ? result : 0;
    };
    let fuel = () => {
      if (lookFor($('dt'), 'Üzemanyag').length > 0) {
        if (
          lookFor($('dt'), 'Üzemanyag').next().text().trim() ===
          'Dízel (Particulate Filter)'
        ) {
          return 'Dízel';
        } else if (
          lookFor($('dt'), 'Üzemanyag').next().text().trim() ===
            'Benzin (Particulate Filter)' ||
          lookFor($('dt'), 'Üzemanyag').next().text().trim() === 'Super 95' ||
          lookFor($('dt'), 'Üzemanyag').next().text().trim() ===
            'Super 95 / 91-es normálbenzin' ||
          lookFor($('dt'), 'Üzemanyag').next().text().trim() ===
            '91-es normálbenzin' ||
          lookFor($('dt'), 'Üzemanyag').next().text().trim() ===
            'Super E10 Plus 95-ös / Super 95 (Particulate Filter)'
        ) {
          return 'Benzin';
        } else {
          return lookFor($('dt'), 'Üzemanyag').next().text().trim();
        }
      } else {
        return null;
      }
    };

    let transmission = () => {
      if (lookFor($('dt'), 'Váltó típusa').length > 0) {
        if (
          lookFor($('dt'), 'Váltó típusa').next().text().trim() ===
          'Sebességváltó'
        ) {
          return 'Manuális';
        } else {
          return lookFor($('dt'), 'Váltó típusa').next().text().trim();
        }
      } else {
        return null;
      }
    };

    let ccm = () => {
      if (lookFor($('dt'), 'Hengerűrtartalom').length > 0) {
        return Number(
          lookFor($('dt'), 'Hengerűrtartalom')
            .next()
            .text()
            .match(numberPattern)
            .join('')
        );
      } else {
        return null;
      }
    };
    let price = Number(
      $('.cldt-price').eq(1).find('h2').text().match(numberPattern).join('')
    );
    let city = $('.cldt-stage-vendor-text.sc-font-s')
      .find('span.sc-font-bold')
      .eq(0)
      .text();
    let zipcode = Number(
      $("div[data-item-name='vendor-contact-city']").eq(0).text().split(' ')[0]
    );

    const vehicle = [
      { make, model, age },
      {
        id,
        km: km(),
        kw: kw(),
        fuel: fuel(),
        transmission: transmission(),
        ccm: ccm(),
        price,
        city,
        zipcode,
      },
    ];

    if (!vehicle[0].age || !vehicle[0].model || !vehicle[0].make) {
      logger('warn', 'Missing some data, returning.');
      return;
    } else {
      return vehicle;
    }
  } catch (error) {
    logger('error', error.stack);
  }
};

const queryUrl = async (url, id) => {
  try {
    return await axios.get(url);
  } catch (error) {
    // if a car is no longer listed the response status code is 410
    // i figured there's no need to keep it's link in the db anymore, so i delete it in ifEntryDoesntExist(), then restarting the script
    if (error.response.status === 410 || error.response.status === 404) {
      logger('info', 'Advert does not exist anymore.');
      return await ifEntryDoesntExist(id).then((response) => {
        if (response) {
          return;
        }
      });
    }
    logger('error', error.stack);
  }
};

const ifEntryDoesntExist = async (id) => {
  try {
    logger('info', 'Deleting unexisting advert.');
    return await db('carlist').where('id', id).del();
  } catch (error) {
    logger('error', error.stack);
  }
};

const saveEntryToWorkingQueue = async (id) => {
  try {
    return await db('working_queue')
      .select()
      .where('id', id)
      .then((rows) => {
        if (rows.length === 0) {
          logger('info', `Saving ${id} into working queue table.`);
          return db('working_queue').insert({ id });
        }
        return;
      });
  } catch (error) {
    logger('error', error.stack);
  }
};

const saveSpecIntoDb = async (spec, typeId) => {
  try {
    return await db('carspec')
      .select()
      .where('id', spec.id)
      .then((rows) => {
        if (rows.length === 0) {
          logger(
            'info',
            `Saving car data into carspec table: ${JSON.stringify(spec)}`
          );
          return db('carspec')
            .returning('id')
            .insert({
              id: spec.id,
              km: spec.km,
              kw: spec.kw,
              fuel: spec.fuel,
              transmission: spec.transmission,
              ccm: spec.ccm,
              price: spec.price,
              city: spec.city,
              zipcode: spec.zipcode,
              cartype: typeId,
            })
            .then((resp) => {
              return db('carlist').where('id', resp[0]).update('crawled', true);
            });
        } else {
          return;
        }
      });
  } catch (error) {
    logger('error', error.stack);
  }
};

const saveTypeIntoDb = async (type) => {
  try {
    return await db('cartype')
      .select()
      .where({
        make: type.make,
        model: type.model,
        age: type.age,
      })
      .then((rows) => {
        if (rows.length === 0) {
          logger(
            'info',
            `New type, saving it into db: ${JSON.stringify(type)}`
          );
          return db('cartype')
            .returning('id')
            .insert({
              make: type.make,
              model: type.model,
              age: type.age,
            })
            .then((resp) => {
              return resp[0];
            });
        } else {
          logger(
            'info',
            `Type already exist, returning it: ${JSON.stringify(rows[0])}`
          );
          return rows[0].id;
        }
      });
  } catch (error) {
    logger('error', error.stack);
  }
};

const saveIntoTable = async () => {
  try {
    const result = await scrapeSingle().then(async (resp) => {
      if (resp && resp !== 'restart') {
        logger('info', `Saving data to db: ${JSON.stringify(resp)}`);
        const spec = resp[1];
        const type = resp[0];
        await saveTypeIntoDb(type).then((typeId) => {
          calculateAll(typeId);
          saveSpecIntoDb(spec, typeId);
          saveEntryToWorkingQueue(spec.id);
        });

        let minutes = Math.random() * 2 + 0.16;
        let sleepTime = minutes * 60 * 1000;

        await utils.sleep(sleepTime);
        return saveIntoTable();
      } else if (resp === 'restart') {
        await utils.sleep(10000);
        return saveIntoTable();
      } else {
        let minutes = 5;
        let sleepTime = minutes * 60 * 1000;

        logger(
          'info',
          `No entry found to scrape, sleeping for ${minutes} minutes.`
        );
        await utils.sleep(sleepTime);
        return saveIntoTable();
      }
    });

    return result;
  } catch (error) {
    logger('error', error.stack);
  }
};

saveIntoTable();
