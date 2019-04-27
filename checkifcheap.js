const db = require('./db')
const mailIt = require('./mailit')

const checkIfCheap = async (id, type, price) => {
    const vehiclePriceStats = await db('average_prices').select().where('id', type).then(row => {
        if(row) {
            return row[0]
        } else {
            return
        }
    })
    if(vehiclePriceStats) {
        const avg = vehiclePriceStats.avg
        const median = vehiclePriceStats.median
        if(price < avg * 0.75 || price < median * 0.75) {
            const link = await db('carlist').select().where('id', id).then(row => `${row[0].platform}${row[0].link}`)
            const typeText = await db('cartype').select().where('id', type).then(row => `${row[0].make} ${row[0].model} (${row[0].age})`)
            const avgPercent = Math.round(price/avg * 100)
            const medianPercent = Math.round(price/median * 100)
            return await mailIt(typeText, price, link, avgPercent, medianPercent)
        }
    }
}





module.exports = checkIfCheap