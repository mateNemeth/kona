const db = require('./db')

const getUsers = async () => {
    return await db('cheap_alerts').join('users', {'cheap_alerts.id': 'users.cheap_alert'}).select('email', 'treshold', 'zipcodes').then(resp => resp)
}

const checkZips = async () => {
    const users = await getUsers()
    const hasIt = users.filter(user => {
        let zip = 12
        if(!user.zipcodes || user.zipcodes.length === 0) {
            return user
        } else {
            return user.zipcodes.indexOf(zip) !== -1
        }
    })
    const doesnt = users.filter(user => {
        let zip = 33
        if(!user.zipcodes || user.zipcodes.length === 0) {
            return user
        } else {
            return user.zipcodes.indexOf(zip) !== -1
        }
    })
    console.log(hasIt)
    console.log(doesnt)
}

checkZips();