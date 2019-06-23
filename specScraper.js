const axios = require('axios')
const cheerio = require('cheerio')
const calculateAll = require('./calculateAvg')
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
			if(carDetails === 'error with data') {
				const errorCar = await db('carlist').where('crawled', false).first().then(row => row.id);
				return db('carlist').where('id', errorCar).update('crawled', false);
			} else {
				return carDetails
			}
		} else {
			return
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
	let ageData = $(".sc-font-l.cldt-stage-primary-keyfact").eq(4).text().match(numberPattern)
	let age = ageData ? Number(ageData[1]) : null;
	let km = () => {
		let result = $(".sc-font-l.cldt-stage-primary-keyfact").eq(3).text().match(numberPattern)
		return (result && result.length > 1) ? Number(result.join("")) : 0
	}
	let kw = () => {
		let result = Number($(".sc-font-l.cldt-stage-primary-keyfact").eq(5).text().match(numberPattern))
		return result ? result : 0
	} 
	let fuel = () => {
		if (lookFor($("dt"), "Üzemanyag").length > 0) {
			if (lookFor($("dt"), "Üzemanyag").next().text().trim() === "Dízel (Particulate Filter)") {
				return "Dízel";
			} else if (lookFor($("dt"), "Üzemanyag").next().text().trim() === "Benzin (Particulate Filter)" || 
					   lookFor($("dt"), "Üzemanyag").next().text().trim() === "Super 95" || 
					   lookFor($("dt"), "Üzemanyag").next().text().trim() === "Super 95 / 91-es normálbenzin" || 
					   lookFor($("dt"), "Üzemanyag").next().text().trim() === "91-es normálbenzin") {
				return "Benzin";
			} else {
				return lookFor($("dt"), "Üzemanyag").next().text().trim();
			}
		} else {
			return null;
		}
	};
		
	let transmission = () => {
		if (lookFor($("dt"), "Váltó típusa").length > 0) {
			if (lookFor($("dt"), "Váltó típusa").next().text().trim() === "Sebességváltó") {
				return "Manuális";
			} else {
				return lookFor($("dt"), "Váltó típusa").next().text().trim();
			}
		} else {
			return null;
		}
	};
		
	let ccm = () => {
		if (lookFor($("dt"), "Hengerűrtartalom").length > 0) {
			return Number(lookFor($("dt"), "Hengerűrtartalom").next().text().match(numberPattern).join(""));
		} else {
			return null;
		}
	};
	let price = Number($(".cldt-price").eq(1).find("h2").text().match(numberPattern).join(""));
	let city = $('.cldt-stage-vendor-text.sc-font-s').find('span.sc-font-bold').eq(0).text()
	let zipcode = Number($("div[data-item-name='vendor-contact-city']").eq(0).text().split(' ')[0])

	const vehicle = [
		{ make, model, age },
		{ id, km: km(), kw: kw(), fuel: fuel(), transmission: transmission(), ccm: ccm(), price, city, zipcode }
	]

	if(vehicle[0].age === null) {
		return 'error with data'
	} else {
		return vehicle
	}
}
	
const queryUrl = async (url, id) => {
	try {
		return await axios.get(url)
	} catch (error) {
		// if a car is no longer listed the response status code is 410
		// i figured there's no need to keep it's link in the db anymore, so i delete it in ifEntryDoesntExist(), then restarting the script
		if (error.response.status === 410 || error.response.status === 404) {
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
		if (resp && resp !== 1) {
			const spec = resp[1]
			const type = resp[0]
			return saveTypeIntoDb(type).then(typeId => {
				calculateAll(typeId)
				saveSpecIntoDb(spec, typeId)
				saveEntryToWorkingQueue(spec.id)
			})
		} else {
			return
		}
	})
	return result
}

const saveEntryToWorkingQueue = async (id) => {
	return await db('working_queue').select().where('id', id).then(rows => {
		if(rows.length === 0) {
			return db('working_queue').insert({ id })
		} 
		return;
	})
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
					zipcode: spec.zipcode,
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
				return rows[0].id
			}
	})
}
	

const makeItFireInInterval = async (delay) => {
	const intoDb = await saveIntoTable()
	setTimeout(() => {
		const newTiming = () => (Math.floor(Math.random() * 90000) + 30000)
		return makeItFireInInterval(newTiming())
	}, delay)
	return intoDb;
}
	
makeItFireInInterval(30000);