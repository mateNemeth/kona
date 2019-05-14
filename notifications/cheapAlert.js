const db = require('../db')
const mailIt = require('./cheapAlertMail')

const checkIfNeedsMailing = async () => {
    const carSpec = await findWork()
    if (carSpec === 'no work found') {
        return minutes = 10;
    } else {
        removeFromQueue(carSpec.id)
        const usersToAlert = await filterUsers(carSpec)
        if(usersToAlert && usersToAlert.length) {
            const link = await db('carlist').select().where('id', carSpec.id).then(row => `${row[0].platform}${row[0].link}`)
            const type = await db('cartype').select().where('id', carSpec.cartype).then(row => row[0])
            const fuelType = await db('carspec').select().where('id', carSpec.id).then(row => `${row[0].fuel}`)
            const typeText = `${type.make} ${type.model} - (${type.age}, ${fuelType})`
            const calculatedPrices = await db('average_prices').select().where('id', carSpec.cartype).then(row=> row[0])
            const avgPercent = Math.round(100-(carSpec.price/calculatedPrices.avg * 100))
            const medianPercent = Math.round(100-(carSpec.price/calculatedPrices.median * 100))
            usersToAlert.map(user => {
                mailIt(typeText, carSpec.price, link, avgPercent, medianPercent, user)
            })
        }
        return minutes = 0.16;
    }
}

const removeFromQueue = async (id) => {
    return await db('working_queue').where('id', id).del()
}

const findWork = async () => {
    return await db('working_queue').where('working', false).first().then(row => {
        if(row) {
            return db('working_queue').where('id', row.id).returning('id').update('working', true).then(resp => {
                return db('carspec').where('id', resp[0]).then(resp => resp[0])
            })
        } else {
            return 'no work found'
        }
    })
}

const filterUsers = async (carSpec) => {
    const users = await db('user_alerts').select().then(resp => resp)
    return applyAllFilter(carSpec, users)
}

const filterByZip = async (zipcode, filteredUsers) => {
    const zip = Number(zipcode.toString().slice(0, 2))
    console.log(filteredUsers)
    return await filteredUsers.filter(user => {
        // console.log(`user: ${user}, zipcodes: ${user.zipcodes}`)
        if(user.zipcodes.length === 0) {
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
                    const getUserData = await db('users').select().where('alerts', )
                    toAlert.push(user)
                } else {
                    return
                }
            })
            return toAlert
        } 
    }
}


let minutes = 0.16, the_interval = minutes * 60 * 1000;

setInterval(() => {
    checkIfNeedsMailing()
}, the_interval);

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