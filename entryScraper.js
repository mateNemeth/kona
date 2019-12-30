const axios = require('axios');
const cheerio = require('cheerio');
const db = require('./db');

const url = 'https://www.autoscout24.hu';
const queryUrl =
  '/lst/?sort=age&desc=1&offer=J%2CU%2CO%2CD&ustate=N%2CU&size=20&page=1&cy=A&atype=C&ac=0&';

const getData = async () => {
  try {
    return await axios.get(`${url}${queryUrl}`);
  } catch (error) {
    console.log(error);
  }
};

const returnData = async () => {
  const response = await getData();
  return response.data;
};

const processData = async () => {
  let $ = cheerio.load(await returnData());
  const data = [];
  $('.cldt-summary-full-item').each((index, element) => {
    let platform = 'https://autoscout24.hu';
    let scoutHtmlId = $(element)
      .attr('id')
      .split('-');
    let scoutId = scoutHtmlId.slice(1, scoutHtmlId.length).join('-');
    let link = `/ajanlat/${
      $(element)
        .find($('a'))
        .attr('href')
        .split('/')[2]
    }`;

    let vehicle = {
      platform,
      scoutId,
      link
    };

    data.push(vehicle);
  });
  return data;
};

const scrapeNew = async () => {
  const result = await processData();
  try {
    result.map(item => {
      return db('carlist')
        .select()
        .where('platform_id', item.scoutId)
        .then(rows => {
          if (rows.length === 0) {
            return db('carlist').insert({
              platform: item.platform,
              platform_id: item.scoutId,
              link: item.link,
              crawled: false
            });
          } else {
            return;
          }
        });
    });
  } catch (error) {
    throw new Error(error);
  }
};

const minutes = 10,
  the_interval = minutes * 60 * 1000;

setInterval(() => {
  scrapeNew();
}, the_interval);
