const db = require('../db');
const specAlertMail = require('./specAlertMail');

const getAlerts = async () => {
  return await db('specific_alerts')
    .select()
    .then(async resp => {
      const keys = Object.keys(resp[0]);
      const values = resp.map(row => {
        let filter = {};
        for (let i = 0; i < keys.length; i++) {
          if (row[keys[i]]) {
            filter[keys[i]] = row[keys[i]];
          }
        }
        return filter;
      });
      return values;
    });
};

const getAvgPrices = async carType => {
  const vehiclePriceStats = await db('average_prices')
    .select()
    .where('id', carType)
    .then(row => {
      if (row) {
        return row[0];
      } else {
        return null;
      }
    });
  
  if (vehiclePriceStats) {
    return { avg, median } = vehiclePriceStats;
  } else {
    return { avg: 'Nincs adat', median: 'Nincs adat'}
  }
};

const checkAlert = async (carSpec, alerts) => {
  const zip = Number(carSpec.zipcode.toString().slice(0, 2));
  const result = alerts.filter(alert => {
    if (
      (alert.zipcodes ? alert.zipcodes.indexOf(zip) !== -1 : true) &&
      (alert.agemax ? alert.agemax >= carSpec.age : true) &&
      (alert.agemin ? alert.agemin <= carSpec.age : true) &&
      (alert.ccmmax
        ? carSpec.ccm
          ? alert.ccmmax >= carSpec.ccm
          : false
        : true) &&
      (alert.ccmmin
        ? carSpec.ccm
          ? alert.ccmmin <= carSpec.ccm
          : false
        : true) &&
      (alert.kmmax ? (carSpec.km ? alert.kmmax >= carSpec.km : false) : true) &&
      (alert.kmmin ? (carSpec.km ? alert.kmmin <= carSpec.km : false) : true) &&
      (alert.kwmax ? (carSpec.kw ? alert.kwmax >= carSpec.kw : false) : true) &&
      (alert.kwmin ? (carSpec.kw ? alert.kwmin <= carSpec.kw : false) : true) &&
      (alert.fuel
        ? carSpec.fuel
          ? alert.fuel === carSpec.fuel
          : false
        : true) &&
      (alert.transmission
        ? carSpec.transmission
          ? alert.transmission === carSpec.transmission
          : false
        : true) &&
      (alert.pricemax
        ? carSpec.price
          ? alert.pricemax >= carSpec.price
          : false
        : true) &&
      (alert.pricemin
        ? carSpec.price
          ? alert.pricemin <= carSpec.price
          : false
        : true) &&
      (alert.make
        ? carSpec.make
          ? alert.make === carSpec.make
          : false
        : true) &&
      (alert.model
        ? carSpec.model
          ? carSpec.model.includes(alert.model)
          : false
        : true)
    ) {
      return alert;
    }
  });
  console.log('checkAlert/result: ', result);
  const toNotify = await Promise.all(
    result.map(async item => {
      return await db('users')
        .select('email')
        .whereRaw(`${item.id}=ANY(specific_alert)`)
        .then(resp => resp[0].email);
    })
  );
  return toNotify;
};

const specAlert = async carSpec => {
  const alerts = await getAlerts();
  const users = await checkAlert(carSpec, alerts);
  const { avg, median } = await getAvgPrices(carSpec.cartype);
  console.log('specAlert/users: ', users);
  if (users && users.length) {
    const link = await db('carlist')
      .select()
      .where('id', carSpec.id)
      .then(row => `${row[0].platform}${row[0].link}`);
    const type = await db('cartype')
      .select()
      .where('id', carSpec.cartype)
      .then(row => row[0]);
    const fuelType = await db('carspec')
      .select()
      .where('id', carSpec.id)
      .then(row => `${row[0].fuel}`);
    const typeText = `${type.make} ${type.model} - (${type.age}, ${fuelType})`;
    users.map(user => {
      specAlertMail(typeText, carSpec.price, link, avg, median, user);
    });
  }
};

module.exports = specAlert;
