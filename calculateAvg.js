const db = require('./db')

const getPricesFromDb = async (typeId) => {
    return await db('carspec').select().where('cartype', typeId).then(rows => {
        if(rows.length >= 5) {
            const priceCount = rows.map(item => {
                return Number(item.price)
            })
            return priceCount
        } else {
            return
        }
    })
}

const calculateAverage = async (typeId) => {
    return await getPricesFromDb(typeId).then(prices => {
        if(prices) {
            return Math.round(prices.reduce((prev, curr) => prev + curr) / prices.length)
        } else {
            return
        }
    })
}

const calculateMedian = async (typeId) => {
    return await getPricesFromDb(typeId).then(prices => {
        if(prices) {
            const sorted = prices.slice().sort((a, b) => a- b)
            const middle = Math.floor(sorted.length / 2)

            if(sorted.length % 2 === 0) {
                return Math.round((sorted[middle - 1] + sorted[middle]) / 2)
            }
            return Math.round(sorted[middle])
        } else {
            return
        }        
    })
}

const calculateAll = async (typeId) => {    
    const median = await calculateMedian(typeId)
    const average = await calculateAverage(typeId)
    if (median && average) {
        // const alertMedianTreshold = median * 0.65
        // const alertAvgTreshold = average * 0.65
        db('average_prices').select().where('id', typeId).then(rows => {
            if(rows.length === 0) {
                return db('average_prices').insert({
                    id: typeId,
                    avg: average,
                    median: median
                })
            } else {
                return db('average_prices').where('id', rows[0].id).update({
                    id: typeId,
                    avg: average,
                    median: median
                })
            }
        })
    } else {
        return false
    }
}

module.exports = calculateAll