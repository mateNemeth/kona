const db = require('./db')

const getPricesFromDb = async (typeId) => {
    return await db('carspec').select().where('cartype', typeId).then(rows => {
        if(rows.length > 0) {
            const priceCount = rows.map(item => {
                return item.price
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
            return prices.reduce((prev, curr) => prev + curr) / prices.length
        } else {
            return
        }
    })
}

const calculateMedian = async (typeId) => {
    return await getPricesFromDb(typeId).then(prices => {
        if(prices) {
            const sorted = prices.slice().sort()
            const middle = Math.floor(sorted.length / 2)

            if(sorted.length % 2 === 0) {
                return (sorted[middle - 1] + sorted[middle]) / 2
            }
            return sorted[middle]
        } else {
            return
        }        
    })
}

const checkIfItsCheaper = async (typeId, newPrice) => {    
    const median = await calculateMedian(typeId)
    const average = await calculateAverage(typeId)
    if (median && average) {
        const alertMedianTreshold = median * 0.65
        const alertAvgTreshold = average * 0.65
        console.log(`median is ${median}, alerting at ${alertMedianTreshold}`)
        console.log(`avg is ${average}, alerting at ${alertAvgTreshold}`)
        if (newPrice < alertAvgTreshold) {
            return true
        }
    }
    return false
}

// checkIfItsCheaper(258, 1700)

module.exports = checkIfItsCheaper