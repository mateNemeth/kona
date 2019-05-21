const db = require('../db')
const cheapAlertMail = require('./cheapAlertMail')

// GET ALL CHEAP_ALERTS SETTINGS FROM DB
const getUsers = async () => {
    return await db('cheap_alerts').join('users', {'cheap_alerts.id': 'users.cheap_alert'}).select('email', 'treshold', 'zipcodes').then(resp => resp)
}

//SEND DB DATA THROGUH FILTERING FUNCTIONS
const cheapAlert = async (carSpec) => {
    const allUsers = await getUsers()
    const users =  await applyAllFilter(carSpec, allUsers)
    if(users && users.length) {
        const link = await db('carlist').select().where('id', carSpec.id).then(row => `${row[0].platform}${row[0].link}`)
        const type = await db('cartype').select().where('id', carSpec.cartype).then(row => row[0])
        const fuelType = await db('carspec').select().where('id', carSpec.id).then(row => `${row[0].fuel}`)
        const typeText = `${type.make} ${type.model} - (${type.age}, ${fuelType})`
        const calculatedPrices = await db('average_prices').select().where('id', carSpec.cartype).then(row=> row[0])
        const avgPercent = Math.round(100-(carSpec.price/calculatedPrices.avg * 100))
        const medianPercent = Math.round(100-(carSpec.price/calculatedPrices.median * 100))
        users.map(user => {
            cheapAlertMail(typeText, carSpec.price, link, avgPercent, medianPercent, user)
        })
    }
}



//FILTER USERS WHOM NEEDS TO BE NOTIFIED BY ZIP CODE SETTINGS
const filterByZip = async (zipcode, filteredUsers) => {
    const zip = Number(zipcode.toString().slice(0, 2))
    return await filteredUsers.filter(user => {
        //NO ZIPCODE MEANS USER WANTS NOTIFICATIONS FROM EVERYWHERE
        if(!user.zipcodes || user.zipcodes.length === 0) {
            return user
        } else {
            return user.zipcodes.indexOf(zip) !== -1
        }
    })
}

const applyAllFilter = async (carSpec, users) => {
    const filteredUsers = await filterByZip(carSpec.zipcode, users)
    if (!filteredUsers) {
        return null
    } else {
        const vehiclePriceStats = await db('average_prices').select().where('id', carSpec.cartype).then(row => {
            if(row) {
                return row[0]
            } else {
                return null
            }
        })
        if(vehiclePriceStats) {
            const toAlert = [];
            filteredUsers.map(user => {
                const treshold = (100 - (user.treshold)) / 100
                const { price } = carSpec
                const { avg, median} = vehiclePriceStats
                if(price < (avg * treshold) || price < (median * treshold)) {
                    toAlert.push(user)
                } else {
                    return
                }
            })
            return toAlert
        } 
    }
}

module.exports = cheapAlert

//hardcoded for now, need to create new usertable
    // const users = [
    //     {
    //         id: 1,
    //         first_name: 'Vajk',
    //         last_name: 'Kiskos',
    //         email: 'kiskosvajk@gmail.com',
    //         alerts: {
    //             zipcodes: [10, 11, 12, 22, 24, 71],
    //             treshold: 25,
    //             specific: [
    //                 {
    //                     type: {make: '', model: '', ageMin: '', ageMax: 1980}
    //                 },
    //                 {
    //                     type: {make: '', model: '', ageMin: '', ageMax: 1990},
    //                     spec: {ccmMax: 4000}
    //                 },
    //                 {
    //                     type: {make: 'Jaguar', model: '', ageMin: '',  ageMax: 1996},
    //                 },
    //                 {
    //                     type: {make: 'Mercedes-Benz', model: 'S *', ageMin: '', ageMax: 2004}
    //                 }
    //             ]
    //         }
    //     },
        // {
        //     id: 2,
        //     first_name: 'Mate',
        //     last_name: 'Nemeth',
        //     email: 'mate.nemeth@outlook.hu',
        //     alerts: {
        //         zipcodes: [10, 11, 12, 22, 24, 71],
        //         treshold: 25
        //     }
        // }
    // ]