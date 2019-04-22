const db = require('./db')

const calculateNewAvg = async (typeId, price) => {
    const prices = await db('carspec').select().where('cartype', typeId).then(rows => {
        const priceCount = rows.map(item => {
            return item.price
        })
        return priceCount
    })
    console.log(prices)
}

calculateNewAvg(2, '1500')