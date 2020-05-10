const db = require('../db');
const specAlert = require('./specAlert');
require('dotenv').config();
const logger = require('../logger/logger');
const utils = require('../utils');

const checkIfNeedsMailing = async () => {
  try {
    const carSpec = await findWork();
    let sleepTime;
    if (!carSpec) {
      logger('info', 'No work found, sleeping for 10 mins.');

      let minutes = 10;
      sleepTime = minutes * 60 * 1000;
    } else {
      removeFromQueue(carSpec.id);
      specAlert(carSpec);

      let minutes = 0.16;
      sleepTime = minutes * 60 * 1000;
    }

    await utils.sleep(sleepTime);
    checkIfNeedsMailing();
  } catch (error) {
    logger('error', error.stack);
  }
};

const removeFromQueue = async (id) => {
  try {
    logger('info', `Deleting finished work (id: ${id}) from table.`);
    return await db('working_queue').where('id', id).del();
  } catch (error) {
    logger('error', error.stack);
  }
};

const findWork = async () => {
  try {
    const work = await db('working_queue').where('working', false).first();
    if (work) {
      logger('info', `Found work: ${JSON.stringify(work)}`);
      const id = db('working_queue')
        .where('id', work.id)
        .returning('id')
        .first()
        .update('working', true);
      logger('info', `Updated ${id} on work table`);

      return db('carspec')
        .join('cartype', { 'carspec.cartype': 'cartype.id' })
        .where('carspec.id', id)
        .select(
          'carspec.id',
          'cartype',
          'ccm',
          'fuel',
          'transmission',
          'price',
          'kw',
          'km',
          'zipcode',
          'make',
          'model',
          'age'
        )
        .then((resp) => resp[0]);
    } else {
      return;
    }
  } catch (error) {
    logger('error', error.stack);
  }
};

checkIfNeedsMailing();
