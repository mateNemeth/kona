const axios = require('axios')
const cheerio = require('cheerio')
const db = require('./db')


const findToScrape = async () => {
    return await db('carlist').where('crawled', false).first().then(row => {
        if (row) {
            let entry = {
                id: row.id,
                platform: row.platform,
                url: row.link
            }
            return entry
        } else {
            return 
        }       
    })
}

const scrapeSingle = async () => {
    const data = await findToScrape()
    try {
        if (data) {
            const id = data.id
            const carDetails = await queryUrl(`${data.platform}${data.url}`, id).then(async (resp) => {
               return await carProcess(resp.data, id)
            })
            return carDetails 
        } else {
            console.log('no entries')
        }
    } catch (error) {
        console.log(error, 'at scrapeSingle')
    }
}

const carProcess = async (data, id) => {
    const html = await data
    const numberPattern = /\d+/g;
    const lookFor = (element, keyword) => {
        return $(element).filter(function() {
            return (
                $(this).text().trim() === keyword
            )
        })
    }
                
    let $ = cheerio.load(html)

    let make = $("dt:contains('Márka')").next().text().trim();
    let model = $("dt:contains('Modell')").next().text().trim();
    let age = Number($(".sc-font-l.cldt-stage-primary-keyfact").eq(4).text().match(numberPattern)[1]);
    let km = Number($(".sc-font-l.cldt-stage-primary-keyfact").eq(3).text().match(numberPattern).join(""));
    let kw = Number($(".sc-font-l.cldt-stage-primary-keyfact").eq(5).text().match(numberPattern));
    let fuel = lookFor($("dt"), "Üzemanyag").next().text().trim();
    let transmission = lookFor($("dt"), "Váltó típusa").next().text().trim();
    let ccm = Number($('dd:contains("cm³")').text().match(numberPattern).join(""));
    let price = Number($(".cldt-price").eq(1).find("h2").text().match(numberPattern).join(""));
    let city = $('.cldt-stage-vendor-text.sc-font-s').find('span.sc-font-bold').eq(0).text()
    const vehicle = [
        { make, model, age },
        { id, km, kw, fuel, transmission, ccm, price, city }
    ]
    return vehicle
}

const queryUrl = async (url, id) => {
    try {
        return await axios.get(url)
    } catch (error) {
        console.log(error.response.status)
        if (error.response.status === 410) {
            return await ifEntryDoesntExist(id).then(response => {
                if(response) {
                    makeItFireInInterval(0)
                }
            })
        }
    }
}

const ifEntryDoesntExist = async (id) => {
    return await db('carlist').where('id', id).del()
}

const saveIntoTable = async () => {
    const result = await scrapeSingle().then(resp => {
        const spec = resp[1]
        const type = resp[0]
        if (resp) {
            return saveTypeIntoDb(type).then(resp => {
                let typeId = resp
                console.log(typeId)
                saveSpecIntoDb(spec, typeId)
            })
        } else {
            return
        }
    })
    return result
}

const saveSpecIntoDb = async (spec, typeId) => {
    return await db('carspec').select().where('id', spec.id).then(rows => {
        if (rows.length === 0) {
            return db('carspec')
            .returning('id')
            .insert({
                id: spec.id,
                km: spec.km,
                kw: spec.kw,
                fuel: spec.fuel,
                transmission: spec.transmission,
                ccm: spec.ccm,
                price: spec.price,
                city: spec.city,
                cartype: typeId
            }).then(resp => {
                return db('carlist').where('id', resp[0]).update('crawled', true)
            })
        } else {
            return
        }
    })
}

const saveTypeIntoDb = async (type) => {
    return await db('cartype').select().where({
        make: type.make,
        model: type.model,
        age: type.age
    }).then(rows => {
        if(rows.length === 0) {
            return db('cartype')
            .returning('id')
            .insert({
                make: type.make,
                model: type.model,
                age: type.age
            }).then(resp => {
                return resp[0]
            })
        } else {
            console.log(rows[0].id)
            return rows[0].id
        }
    })
}


const makeItFireInInterval = async (delay) => {
    const intoDb = await saveIntoTable()
    setTimeout(() => {
        const newTiming = () => (Math.floor(Math.random() * 180000) + 30000)
        return makeItFireInInterval(newTiming())
    }, delay)
    return intoDb;
}

makeItFireInInterval(0);