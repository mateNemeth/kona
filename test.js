const db = require('./db')

const test = async () => {
    const id = 2
    const result = await db('users').whereRaw(`${id}=ANY(specific_alert)`).then(resp => {
        return resp.map(item => item.email)
    })
    console.log(result)
}

test();