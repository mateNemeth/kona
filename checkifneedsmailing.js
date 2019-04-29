const db = require('./db')
const mailIt = require('./mailit')


const checkIfNeedsMailing = async (carSpec, typeId) => {  
    const usersToAlert = await filterUsers(carSpec, typeId)
    console.log(usersToAlert)
}

const filterUsers = async (carSpec, typeId) => {
    //hardcoded for now, need to create new usertable
    const users = [
        {
            id: 1,
            name: 'Kiskos Vajk',
            email: 'kiskosvajk@gmail.com',
            alerts: {
                zipcodes: [10, 11, 12, 22, 24, 71],
                treshold: 25
            }
        },
        {
            id: 2,
            name: 'Nemeth Mate',
            email: 'mate.nemeth@outlook.hu',
            alerts: {
                zipcodes: [10, 11, 12, 22, 24, 71, 40, 88],
                treshold: 15
            }
        }
    ]
    const usersToCheck = await filterByZip(carSpec.zipcode, users)
    return await filterByPriceTreshold(carSpec, typeId, usersToCheck)
}

const filterByZip = (zipcode, filteredUsers) => {
    const zip = Number(zipcode.toString().slice(0, 2))
    return filteredUsers.filter(user => {
        return user.alerts.zipcodes.indexOf(zip) !== -1
    })
}

const filterByPriceTreshold = async (carSpec, typeId, filteredUsers) => {
    if (!filteredUsers) {
        return null
    } else {
        const vehiclePriceStats = await db('average_prices').select().where('id', typeId).then(row => {
            if(row) {
                return row[0]
            } else {
                return
            }
        })
        if(vehiclePriceStats) {
            console.log('got to final')
            const toAlert = filteredUsers.map(user => {
                const treshold = (100 - user.alerts.treshold) / 100
                const { price } = carSpec
                const { avg, median} = vehiclePriceStats
                console.log('treshold: ' + treshold, 'price: ' + price, 'alert at avg: ' + avg * treshold, 'alert at median: ' + median * treshold)
                if(price < (avg * treshold) || price < (median * treshold)) {
                    return user
                } else {
                    return null
                }
            })
            return toAlert
        } 
    }
}

// const sendMailToFilteredUsers = async (carSpec, typeId, filteredUsers) => {
//     const link = await db('carlist').select().where('id', carSpec.id).then(row => `${row[0].platform}${row[0].link}`)
//     const typeText = await db('cartype').select().where('id', typeId).then(row => `${row[0].make} ${row[0].model} (${row[0].age})`)
//     const avgPercent = Math.round(100-(price/avg * 100))
//     const medianPercent = Math.round(100-(price/median * 100))
//     console.log('found a cheap car, mailing it!')
//     filteredUsers.map(user => {
//         mailIt(typeText, price, link, avgPercent, medianPercent, user)
//     })
// }


module.exports = checkIfNeedsMailing