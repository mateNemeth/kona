const db = require('./db')

const checkIfCheap = async (id, type, price) => {
    const vehiclePriceStats = await db('average_prices').select().where('id', type).then(row => row[0])
    if(!vehiclePriceStats) {
        return
    } else {
        const avg = vehiclePriceStats.avg
        const median = vehiclePriceStats.median
        if(price < avg * 0.75) {
            const link = await db('carlist').select().where('id', id).then(row => `${row[0].platform}${row[0].link}`)
            const percentage = Math.round(price/avg * 100)
            console.log(`olcsobb az atlagnal ${percentage}%-kal, itt: ${link}`)
        }
        if(price < median * 0.75) {
            const link = await db('carlist').select().where('id', id).then(row => `${row[0].platform}${row[0].link}`)
            const percentage = Math.round(price/median * 100)
            console.log(`olcsobb az atlagnal ${percentage}%-kal, itt: ${link}`)
        }
    }
}

module.exports = checkIfCheap