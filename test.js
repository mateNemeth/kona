const db = require('./db')

const getUsersToAlert = async () => {
    const id = 2
    const users = await db('users').select().then(users => {
       return users.filter(user => {
            return user.alerts.indexOf(id) !== -1
        })
    })
    console.log(users)
}

getUsersToAlert();