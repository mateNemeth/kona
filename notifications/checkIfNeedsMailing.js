const db = require('../db')
const cheapAlert = require('./cheapAlert')
const specAlert = require('./specAlert')

const checkIfNeedsMailing = async () => {
    const carSpec = await findWork()
    if (carSpec === 'no work found') {
        return minutes = 10;
    } else {
        removeFromQueue(carSpec.id)
        specAlert(carSpec)
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
                return db('carspec').join('cartype', {'carspec.cartype': 'cartype.id'}).where('carspec.id', resp[0]).select('carspec.id', 'cartype', 'ccm', 'fuel', 'transmission', 'price', 'kw', 'km', 'zipcode', 'make', 'model', 'age').then(resp => resp[0])
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