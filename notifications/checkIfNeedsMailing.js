const db = require('../db')
const cheapAlert = require('./cheapAlert')

const checkIfNeedsMailing = async () => {
    const carSpec = await findWork()
    if (carSpec === 'no work found') {
        return minutes = 10;
    } else {
        removeFromQueue(carSpec.id)
        cheapAlert(carSpec)        
        
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

let minutes = 0.16, the_interval = minutes * 60 * 1000;

setInterval(() => {
    checkIfNeedsMailing()
}, the_interval);