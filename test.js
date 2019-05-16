const db = require('./db')

const test = async () => {
    const id = 1
    const result = await db('users').whereRaw(`${id}=ANY(specific_alert)`)
    console.log(result)
}

test();