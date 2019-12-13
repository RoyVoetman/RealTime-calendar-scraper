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
	eventLinks: {},
	url: "https://www.sv-realtime.nl/evenementen/calendar",
	from: 2016,
	till: new Date().getFullYear()
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

	for (let i = 0; i < app.differenceInMonths(app.from, app.till); i++) {
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

/**
 * @returns {Promise<*>}
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

/**
 * @param fromYear
 * @param tillYear
 * @returns {number}
 */
app.differenceInMonths = function(fromYear, tillYear) {
	// From year is including so we need to subtract one.
	fromYear--;

	return (tillYear - fromYear) * 12
};