const puppeteer = require('puppeteer');
const fetch = require("node-fetch");
const fs = require('fs');

/*
|--------------------------------------------------------------------------
| Initializing the App
|--------------------------------------------------------------------------
*/
let app = {
	browser: null,
	page: null,
	events: [],
	from: "2016-01-01",
	till: new Date()
};

/*
|--------------------------------------------------------------------------
| Main function
|--------------------------------------------------------------------------
*/
(async () => {
	app.browser = await puppeteer.launch();
	app.page = await app.browser.newPage();

	let url = `https://www.sv-realtime.nl/evenementen/calendar/json?start=${app.from}&end=${app.dateToString(app.till)}`;
	app.events = await (await fetch(url)).json();

	// Fetch all event data
	for (let i = 0; i < app.events.length; i++) {
		await app.page.goto("https://www.sv-realtime.nl" + app.events[i]['url'], {waitUntil: 'networkidle2'});
		await app.page.waitForSelector('.paragraphs .row .col-sm-12.paragraph-text');
		app.events[i]['description'] = await app.getEventDetails();
	}

	fs.writeFileSync('./data/'+(new Date()).toUTCString()+'.json', JSON.stringify(app.events), 'utf-8');

	await app.browser.close();
})();

/*
|--------------------------------------------------------------------------
| App function
|--------------------------------------------------------------------------
*/

/**
 * @returns {Promise<*>}
 */
app.getEventDetails = async () => {
	return await app.page.evaluate(() => {
		return document.querySelector('.paragraphs .row .col-sm-12.paragraph-text').textContent.trim()
	});
};

/**
 * @param date
 * @returns {string}
 */
app.dateToString = function (date) {
	return date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate();
};