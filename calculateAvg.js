const db = require('./db')

const getPricesFromDb = async (typeId) => {
    return await db('carspec').select().where('cartype', typeId).then(rows => {
        const priceCount = rows.map(item => {
            return item.price
        })
        return priceCount
    })
}

const calculateAverage = async (typeId) => {
    return await getPricesFromDb(typeId).then(prices => {
        return prices.reduce((prev, curr) => prev + curr) / prices.length
    })
}

const calculateMedian = async (typeId) => {
    return await getPricesFromDb(typeId).then(prices => {
        const sorted = prices.slice().sort()
        const middle = Math.floor(sorted.length / 2)

        if(sorted.length % 2 === 0) {
            return (sorted[middle - 1] + sorted[middle]) / 2
        }
        return sorted[middle]
    })
}

const checkIfItsCheaper = async (typeId, newPrice) => {    
    const median = await calculateMedian(typeId)
    const alertMedianTreshold = median * 0.65    
    console.log(`median is ${median}, alerting at ${alertMedianTreshold}`)

    const average = await calculateAverage(typeId)
    const alertAvgTreshold = average * 0.65
    console.log(`avg is ${average}, alerting at ${alertAvgTreshold}`)

    if (newPrice < alertAvgTreshold) {
        return true
    }
    return false
}

// checkIfItsCheaper(258, 1700)

module.exports = checkIfItsCheaper