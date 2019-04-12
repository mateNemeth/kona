const axios = require('axios')

const getData = async () => {
    try {
        return await axios.get('movietrackr.matenemeth.hu')
    } catch (error) {
        console.log(error)
    }
}

const printData = async () => {
    const data = await getData().data;
    data.map(item => {
        return console.log(item)
    })    
}