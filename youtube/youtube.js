let puppeteer = require("puppeteer");
let fs = require("fs");
let url = "https://www.youtube.com/";
let song = process.argv.splice(2);
console.log(song);

(async function () {
    try {
        let browser = await puppeteer.launch({
            headless: false,
            defaultViewport: null,
            args: ["--start-maximized", "--disable-notifications"],
            slowMo: 200
        });

        let numOfP = await browser.pages();
        let page = numOfP[0];

        await page.goto(url, {
            waitUntil: "networkidle2",
        })

        let searchbox = await page.waitForSelector('.style-scope ytd-searchbox #search');
        await page.click('.style-scope ytd-searchbox #search');

        await searchbox.type(song);

        await page.click("#search-form #search-icon-legacy");

        await page.waitForSelector('.style-scope.ytd-item-section-renderer #dismissable');
        let links = await page.$$('.style-scope.ytd-item-section-renderer #dismissable');
        await links[0].click();

        await waitForSelector('.ytp-ad-text.ytp-ad-skip-button-text');
        page.click('.ytp-ad-text.ytp-ad-skip-button-text');
    }
    catch (err) {
        console.log(err);
    }
})();