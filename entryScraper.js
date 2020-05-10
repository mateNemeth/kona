const axios = require('axios');
const cheerio = require('cheerio');
const db = require('./db');
const logger = require('./logger/logger');
const utils = require('./utils');

const url = 'https://www.autoscout24.hu';
const queryUrl =
  '/lst/?sort=age&desc=1&offer=J%2CU%2CO%2CD&ustate=N%2CU&size=20&page=1&cy=A&atype=C&ac=0&';

const getData = async () => {
  try {
    logger('info', 'Looking for new entries.');
    const response = await axios.get(`${url}${queryUrl}`);
    return response.data;
  } catch (error) {
    logger('error', error.message);
  }
};

const processData = async () => {
  try {
    const raw = await getData();
    let $ = cheerio.load(raw);
    const data = [];
    $('.cldt-summary-full-item').each((index, element) => {
      let platform = 'https://autoscout24.hu';
      let scoutHtmlId = $(element).attr('id').split('-');
      let scoutId = scoutHtmlId.slice(1, scoutHtmlId.length).join('-');
      let link = `/ajanlat/${
        $(element).find($('a')).attr('href').split('/')[2]
      }`;

      let vehicle = {
        platform,
        scoutId,
        link,
      };

      data.push(vehicle);
    });

    return data;
  } catch (error) {
    logger('error', error.message);
  }
};

const scrapeNew = async () => {
  try {
    const result = await processData();
    result.map((item) => {
      return db('carlist')
        .select()
        .where('platform_id', item.scoutId)
        .then((rows) => {
          if (rows.length === 0) {
            logger('info', `Saving entry into db: ${JSON.stringify(item)}`);
            return db('carlist').insert({
              platform: item.platform,
              platform_id: item.scoutId,
              link: item.link,
              crawled: false,
            });
          } else {
            return;
          }
        });
    });
  } catch (error) {
    logger('error', error.message);
  }

  let minutes = 10;
  let sleepTime = minutes * 60 * 1000;
  await utils.sleep(sleepTime);
  scrapeNew();
};

scrapeNew();
