const axios = require('axios');
const cheerio = require('cheerio');
const db = require('./db');
const logger = require('./logger/logger');

const url = 'https://www.autoscout24.hu';
const queryUrl =
  '/lst/?sort=age&desc=1&offer=J%2CU%2CO%2CD&ustate=N%2CU&size=20&page=1&cy=A&atype=C&ac=0&';

const getData = async () => {
  try {
    logger('info', 'Looking from new entries.', 'entryScaper/queryUrl');
    return await axios.get(`${url}${queryUrl}`);
  } catch (error) {
    logger('error', error.message, 'entryScaper/queryUrl');
  }
};

const processData = async () => {
  try {
    logger(
      'info',
      'Collecting entries from main page.',
      'entryScaper/processData'
    );
    let $ = cheerio.load(await getData());
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
    logger('error', error.message, 'entryScaper/processData');
  }
};

const scrapeNew = async () => {
  try {
    logger(
      'info',
      'Saving entries into CARLIST table.',
      'entryScraper/scrapeNew'
    );
    const result = await processData();
    result.map((item) => {
      return db('carlist')
        .select()
        .where('platform_id', item.scoutId)
        .then((rows) => {
          if (rows.length === 0) {
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
    logger('error', error.message, 'entryScaper/scrapeNew');
  }
};

const minutes = 10,
  the_interval = minutes * 60 * 1000;

setInterval(() => {
  scrapeNew();
}, the_interval);
