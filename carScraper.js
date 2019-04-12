const axios = require('axios');
const cheerio = require('cheerio');

const url = 'https://www.autoscout24.hu';
const queryUrl = '/lst?priceto=3000&desc=1&size=20&page=1&fc=0&cy=A&sort=age&ustate=N%2CU&atype=C';

const knex = require('knex')({
    client: 'pg',
    connection: 'postgres://matenemeth:password@localhost:5432/testdb'
});

const getData = async () => {
    try {
        return await axios.get(`${url}${queryUrl}`);
    } catch (error) {
        console.log(error);
    }
};

const returnData = async () => {
    const response = await getData();
    return response.data;
};

const processData = async () => {
    let $ = cheerio.load(await returnData());
    const data = [];
    $('.cldt-summary-full-item').each((index, element) => {        
        let platform = 'https://autoscout24.hu'
        let scoutHtmlId = $(element)
            .attr('id')
            .split('-');
        let scoutId = scoutHtmlId.slice(1, scoutHtmlId.length).join('-');
        let link = `/ajanlat/${$(element)
            .find($('a'))
            .attr('href')
            .split('/')[2]}`;
        
        let vehicle = {
            platform,
            scoutId,
            link
        };
        
        data.push(vehicle);
    });
    return data;
};

const saveResult = async () => {
    const result = await processData();
    try {
        result.map(item => {
            return knex('carlist').select().where('platform_id', item.scoutId)
                .then(rows => {
                    if (rows.length === 0) {
                        return knex('carlist').insert({
                            platform: item.platform,
                            platform_id: item.scoutId,
                            link: item.link
                        })
                    } else {
                        return;
                    }
                })
        })
    } catch (error) {
        throw (error)
    }
};


const minutes = 30, the_interval = minutes * 60 * 1000;

setInterval(() => {
    saveResult()
}, the_interval);
