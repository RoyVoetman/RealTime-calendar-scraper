const puppeteer = require('puppeteer');
const fs = require('fs');

/*
|--------------------------------------------------------------------------
| Initializing the App
|--------------------------------------------------------------------------
*/
let app = {
	browser: null,
	page: null,
	eventLinks: [],
	url: "https://www.sv-realtime.nl/evenementen/calendar",
	from: new Date(2016,1,1), // Date of first event
	till: new Date()
};

/*
|--------------------------------------------------------------------------
| Enhancing the Date object
|--------------------------------------------------------------------------
*/
Date.prototype.differenceInMonths = function(date) {
	var diff = (date.getTime() - this.getTime()) / 1000;
	diff /= (60 * 60 * 24 * 7 * 4);
	return Math.abs(Math.round(diff));
};

/*
|--------------------------------------------------------------------------
| Main function
|--------------------------------------------------------------------------
*/
(async () => {
	app.browser = await puppeteer.launch();
	app.page = await app.browser.newPage();
	await app.page.goto("https://www.sv-realtime.nl/evenementen/calendar", {"waitUntil" : "networkidle0"});

	for (let i = 0; i < app.till.differenceInMonths(app.from); i++) {
		let res = await app.getEventLinks();
		app.eventLinks[res['date']] = res['eventList'];

		// Goto previous month
		await app.page.click('.fc-prev-button.fc-button');
		await app.page.waitFor(500)
	}

	fs.writeFileSync('./data/'+(new Date()).toUTCString()+'.json', JSON.stringify(app.eventLinks), 'utf-8');

	await app.browser.close();
})();

/*
|--------------------------------------------------------------------------
| App function
|--------------------------------------------------------------------------
*/
app.getEventLinks = async () => {
	return await app.page.evaluate(() => {
		let eventList = [...document.querySelectorAll('a.fc-event')];

		eventList = eventList.map((listItem) => {
			return listItem.getAttribute('href').trim();
		});

		return {
			'date': document.querySelector('.fc-center h2').textContent.trim(),
			'eventList': eventList
		}
	});
};