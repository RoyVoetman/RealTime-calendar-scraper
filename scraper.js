const puppeteer = require('puppeteer');
const fs = require('fs');

let app = {
  browser: null,
  page: null,

  result: []
};

(async () => {
    app.browser = await puppeteer.launch({
      headless: false
    });
    app.page = await app.browser.newPage();

	await app.page.goto('https://www.sv-realtime.nl/evenementen/calendar', {"waitUntil" : "networkidle0"});

	app.result = app.result.concat( await app.getEvents() );

   // fs.writeFileSync('./data.json', JSON.stringify(app.result), 'utf-8');

    await app.browser.close();
})();

app.getEvents = async () => {
    return await app.page.evaluate(() => {
        // let productList = [...document.querySelectorAll('ul.products-grid li')];
		//
        // return productList.map((listItem) => {
        //     return {
        //         'image': listItem.querySelector('.product-image img').getAttribute('src').trim(),
        //         'name': listItem.querySelector('.product-name').textContent.trim(),
        //         'price': listItem.querySelector('.price').textContent.trim()
        //     };
        // });
    });
};