const db = require('./db');

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
    const { avg, median } = vehiclePriceStats;
    return {avg, median}
  } else {
    return {avg: 'Nincs adat', median: 'Nincs adat'}
  }
};

const printData = async () => {
    const {avg, median} = await getAvgPrices(4534);
    console.log(avg, median)
}

printData();
