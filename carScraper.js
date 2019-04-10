const axios = require('axios');
const cheerio = require('cheerio');

const url = 'https://www.autoscout24.hu'
const queryUrl = '/lst?priceto=3000&desc=1&size=20&page=1&fc=0&cy=A&sort=age&ustate=N%2CU&atype=C';


axios.get(`${url}${queryUrl}`)
    .then((response) => {
        let $ = cheerio.load(response.data)
        let entries = {}
        $('.cldt-summary-full-item').each((index, element) => {
            let numberPattern = /\d+/g

            let htmlId = $(element).attr('id').split('-')
            let id = htmlId.slice(1, (htmlId.length)).join('-')
            let model = $(element).find($('.cldt-summary-makemodel.sc-font-bold.sc-ellipsis')).text()
            let htmlPrice = $(element).find($('.cldt-price.sc-font-xl.sc-font-bold')).text()
            let price = Number(htmlPrice.match(numberPattern).join(''))
            let htmlYear = $(element).find($('ul[data-item-name="vehicle-details"]')).find($('li')).slice(1, 2).text()
            let year = Number(htmlYear.match(numberPattern)[1])
            let link = `${url}${$(element).find($('a')).attr('href')}`
            let car = {
                model,
                price,
                year,
                link
            }


            entries[id] = car
        })
        console.log(entries)
    })