const axios = require('axios');
const cheerio = require('cheerio');
const pg = require('pg');

const url = 'https://www.autoscout24.hu'
const queryUrl = '/lst?priceto=3000&desc=1&size=20&page=1&fc=0&cy=A&sort=age&ustate=N%2CU&atype=C';


const knex = require('knex')({
    client: 'pg',
    connection: {
      host : 'localhost',
      user : 'postgres',
      password : '',
      database : 'testdb'
    }
  });

// const knex = require('knex')({
//     client: 'pg',
//     connection: 'postgres://postgres:postgres@localhost:5432/testdb'
//   })

const car = []

axios.get(`${url}${queryUrl}`)
    .then((response) => {
        let $ = cheerio.load(response.data)
        return $('.cldt-summary-full-item').each((index, element) => {
            let numberPattern = /\d+/g

            let scoutHtmlId = $(element).attr('id').split('-')
            let scoutId = scoutHtmlId.slice(1, (scoutHtmlId.length)).join('-')
            let htmlPrice = $(element).find($('.cldt-price.sc-font-xl.sc-font-bold')).text()
            let price = Number(htmlPrice.match(numberPattern).join(''))
            let link = $(element).find($('a')).attr('href').split('/')[2]
            
            let vehicle = {
                scoutId,
                price,
                link
            }

            car.push(vehicle)
        })
    })

    console.log(car)

// const insertInfoIntoDb = () => {
//     car.map(item => {
//         // knex('carlist')
//         //     .insert({
//         //         platform: 'https://autoscout24.hu',
//         //         platform_id: item.scoutId,
//         //         price: item.price,
//         //         link: item.link
//         //     })
//         console.log(item)
//     })
// }

// console.log(insertInfoIntoDb());