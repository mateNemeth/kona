const db = require('../db');
const specAlert = require('./specAlert');
require('dotenv').config();
const logger = require('../logger/logger');

let minutes = 0.16;
let the_interval = minutes * 60 * 1000;

const checkIfNeedsMailing = async () => {
  try {
    const carSpec = await findWork();
    if (!carSpec) {
      logger(
        'info',
        'No work found, sleeping for 10 mins.',
        'checkIfNeedsMailing/checkIfNeedsMailing'
      );
      minutes = 10;
      return;
    } else {
      removeFromQueue(carSpec.id);
      specAlert(carSpec);

      minutes = 0.16;
      return;
    }
  } catch (error) {
    logger('error', error.stack, 'checkIfNeedsMailing/checkIfNeedsMailing');
  }
};

const removeFromQueue = async (id) => {
  try {
    logger(
      'info',
      `Deleting finished work (id: ${id}) from table.`,
      'checkIfNeedsMailing/removeFromQueue'
    );
    return await db('working_queue').where('id', id).del();
  } catch (error) {
    logger('error', error.stack, 'checkIfNeedsMailing/removeFromQueue');
  }
};

const findWork = async () => {
  try {
    const work = await db('working_queue').where('working', false).first();
    if (work) {
      logger(
        'info',
        `Found work: ${JSON.stringify(row)}`,
        'checkIfNeedsMailing/findWork'
      );
      const id = db('working_queue')
        .where('id', row.id)
        .returning('id')
        .first()
        .update('working', true);
      logger(
        'info',
        `Updated ${id} on work table`,
        'checkIfNeedsMailing/findWork'
      );

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
    logger('error', error.stack, 'checkIfNeedsMailing/findWork');
  }
};

setInterval(() => {
  checkIfNeedsMailing();
}, the_interval);
