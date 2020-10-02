const db = require('./db');
const logger = require('./logger/logger');

const getPricesFromDb = async (typeId) => {
  try {
    logger('info', `Calculating average prices for cartype: [${typeId}]`);
    const carType = await db('cartype')
      .select()
      .where('id', typeId)
      .then((row) => row[0]);
    const { make, model, age } = carType;
    const older = await db('cartype')
      .select()
      .where('make', make)
      .andWhere('model', model)
      .andWhere('age', age - 1)
      .then((row) => (row[0] ? row[0].id : null));
    const newer = await db('cartype')
      .select()
      .where('make', make)
      .andWhere('model', model)
      .andWhere('age', age + 1)
      .then((row) => (row[0] ? row[0].id : null));

    return await db('carspec')
      .select()
      .where('cartype', typeId)
      .orWhere('cartype', older)
      .orWhere('cartype', newer)
      .then(async (rows) => {
        if (rows.length >= 5) {
          const priceCount = rows.map((item) => {
            return Number(item.price);
          });
          return priceCount;
        } else {
          return;
        }
      });
  } catch (error) {
    logger('error', error.stack);
  }
};

const calculateAverage = (typeId, prices) => {
  let newAvg = Math.round(
    prices.reduce((prev, curr) => prev + curr) / prices.length
  );

  logger('info', `New average for [${typeId}] is €${newAvg},-.`);
  return newAvg;
};

const calculateMedian = (typeId, prices) => {
  const sorted = prices.slice().sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  let newMedian;

  if (sorted.length % 2 === 0) {
    newMedian = Math.round((sorted[middle + 1] + sorted[middle]) / 2);
  } else {
    newMedian = Math.round(sorted[middle]);
  }

  logger('info', `New median for [${typeId}] is €${newMedian},-.`);
  return newMedian;
};

const calculateAll = async (typeId) => {
  try {
    const prices = await getPricesFromDb(typeId);
    const median = calculateMedian(typeId, prices);
    const average = calculateAverage(typeId, prices);
    if (median && average) {
      db('average_prices')
        .select()
        .where('id', typeId)
        .then((rows) => {
          if (rows.length === 0) {
            logger('info', 'Saving avg & median prices into db.');
            return db('average_prices').insert({
              id: typeId,
              avg: average,
              median: median,
            });
          } else {
            logger('info', 'Updating avg & median prices into db.');
            return db('average_prices').where('id', rows[0].id).update({
              id: typeId,
              avg: average,
              median: median,
            });
          }
        });
    } else {
      logger('info', 'Not enough data to calculate prices.');
      return false;
    }
  } catch (error) {
    logger('error', error.stack);
  }
};

module.exports = calculateAll;
