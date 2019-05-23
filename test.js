const db = require('./db')
const specAlertMail = require('')

const getAlerts = async () => {
    return await db('specific_alerts').select().then(async resp => {
        const email = await db('users').select('email').whereRaw(`${resp[0].id}=ANY(specific_alert)`).then(resp => resp[0].email)
        const keys = Object.keys(resp[0])
        const values = resp.map(row => {
            let filter = {
                email
            };
            for(let i = 0; i < keys.length; i++) {
                if(row[keys[i]]) {
                    filter[keys[i]] = row[keys[i]]
                }
            }
            return filter;
        })
        return values;
    })
}

const specAlert = async (carSpec) => {
    const alerts = await getAlerts()
    const filteredAlerts = await checkAlert(carSpec, alerts)
    const users = filteredAlerts.filter((item, index) => filteredAlerts.indexOf(item) === index)
    if(users && users.length) {
        users.map(user => {
            cheapAlertMail(typeText, carSpec.price, link, avgPercent, medianPercent, user)
        })
    }
}

const checkAlert = async (carSpec, alerts) => {
    const zip = Number(carSpec.zipcode.toString().slice(0, 2))
    const result = alerts.filter(alert => {
        if ((alert.zipcodes
                ? alert.zipcodes.indexOf(zip) !== -1 
                : true)
            && (alert.agemax
                ? alert.agemax > carSpec.age 
                : true)
            && (alert.agemin
                ? alert.agemin < carSpec.age 
                : true)
            && (alert.ccmmax
                ? carSpec.ccm 
                    ? alert.ccmmax > carSpec.ccm
                    : false 
                : true)            
            && (alert.ccmmin
                ? carSpec.ccm
                    ? alert.ccmmin < carSpec.ccm
                    : false
                : true)
            && (alert.kmmax
                ? carSpec.km
                    ? alert.kmmax > carSpec.km
                    : false
                : true)
            && (alert.kmmin
                ? carSpec.km
                    ? alert.kmmin < carSpec.km
                    : false
                : true)
            && (alert.kwmax
                ? carSpec.kw
                    ? alert.kwmax > carSpec.kw
                    : false
                : true)
            && (alert.kwmin 
                ? carSpec.kw
                    ? alert.kwmin < carSpec.kw
                    : false
                : true)
            && (alert.fuel
                ? carSpec.fuel
                    ? alert.fuel === carSpec.fuel
                    : false
                : true)
            && (alert.transmission
                ? carSpec.transmission
                    ? alert.transmission === carSpec.transmission
                    : false
                : true)
            && (alert.pricemax
                ? carSpec.price
                    ? alert.pricemax > carSpec.price
                    : false
                : true)
            && (alert.pricemin
                ? carSpec.price
                    ? alert.pricemin < carSpec.price
                    : false
                : true)
            && (alert.make
                ? carSpec.make
                    ? alert.make === carSpec.make
                    :false
                : true)
            && (alert.model
                ? carSpec.model
                    ? carSpec.model.includes(alert.model)
                    : false
                : true)
        ) {
            return alert.email
        }
    })
    const toNotify = result.map(item => item.email)
    return toNotify
}

const carSpec = { 
    id: '12345',
    ccm: 5000,
    cartype: '412',
    fuel: 'Benzin',
    transmission: 'Manuális',
    price: 1000,
    kw: 51,
    km: 158000,
    city: 'Spielberg',
    zipcode: 1210,
    make: 'Mercedes-Benz',
    model: 'S 320',
    age: 1978 
}

specAlert(carSpec)

module.exports = specAlert