let puppeteer = require("puppeteer");
let fs = require("fs");
let url = "https://www.myntra.com/";
let yt = "https://www.youtube.com/"
let song = process.argv[2];
let min = process.argv[3];
let max = process.argv[4];
console.log(song);

(async function () {
    try {
        let browser = await puppeteer.launch({
            headless: false,
            defaultViewport: null,
            args: ["--start-maximized", "--disable-notifications"],
            slowMo: 200,
        });

        let numOfP = await browser.pages();
        let page = numOfP[0];

        await page.goto(yt, {
            waitUntil: "networkidle2",
        })

        let searchbox = await page.waitForSelector('.style-scope ytd-searchbox #search');
        await page.click('.style-scope ytd-searchbox #search');
        await searchbox.type(song);

        await page.click("#search-form #search-icon-legacy");

        await page.waitForSelector('.style-scope.ytd-item-section-renderer #dismissable');
        let links = await page.$$('.style-scope.ytd-item-section-renderer #dismissable');
        await links[0].click();

        await page.keyboard.press("t");

        // await page.waitForSelector(".sty le-scope.ytd-button-renderer.style-text.size-default");
        // await page.click(".style-scope.ytd-button-renderer.style-text.size-default");

        function delay(time) {
            return new Promise(function(resolve) { 
                setTimeout(resolve, time)
            });
         }

        //  await delay(5000)

        // await waitForSelector('.ytp-ad-text.ytp-ad-skip-button-text');
        // page.click('.ytp-ad-text.ytp-ad-skip-button-text');
        
        await delay(30000);
        page = await browser.newPage();

        await page.goto(url, {
            waitUntil: "networkidle2",
        })

        await page.waitForSelector('.desktop-navLink a[data-group="women"]');
        await page.hover('.desktop-navLink a[data-group="women"]');
        
        await Promise.all([page.waitForNavigation({
            waitUntil: "networkidle2"
        }), page.click('a[href="/western-wear-dresses-menu"]')]);

        await page.waitForSelector('.categories-list .common-checkboxIndicator');
        let allCboxes = await page.$$('.categories-list .common-checkboxIndicator');
        console.log(allCboxes.length);
        await allCboxes[0].click();

        await page.waitForSelector('.brand-list .common-checkboxIndicator');
        let allBboxes = await page.$$('.brand-list input');
        await allBboxes[0].click();
        await allBboxes[1].click();
        await allBboxes[5].click();

        await page.waitForSelector('.colour-listItem .common-checkboxIndicator');
        let allColboxes = await page.$$('.colour-listItem .common-checkboxIndicator');
        await allColboxes[0].click();

        // page.evaluate(_ => {
        //     window.scrollBy(0, window.innerHeight);
        //   });

        await page.waitForSelector('.discount-list .discount-input');
        let allDboxes = await page.$$('.discount-list .discount-input');
        console.log(allDboxes.length);
        await allDboxes[0].click();

        await page.waitForSelector('.product-discountedPrice');
        let pricesArr = await page.$$('.product-discountedPrice');

        let actualPrices = [];

        for (let i = 0; i < pricesArr.length; i++) {
            let pric = await page.evaluate(function (oneprice) {
                return oneprice.textContent;
            }, pricesArr[i]);
            let words = pric.split(" ");
            actualPrices.push(words[1]);
            // console.log(pric)
        }

        console.log(actualPrices.length)
        console.log(actualPrices);

        let budgetPrice = 0;
        let idx = -1;
        for (let i = 0; i < actualPrices.length; i++) {
            if (actualPrices[i] < max && actualPrices[i] > min) {
                budgetPrice = actualPrices[i];
                idx = i;
                break;
            }
        }

        console.log(budgetPrice);
        console.log(idx);

        await pricesArr[idx].click();

        // this is used as to wait for second page to open fully 
        // also for broser.pages() to identify this new page i have to do this
        const timeout = ms => new Promise(resolve => setTimeout(resolve, ms));
        await Promise.race([
            await timeout(500),
            page.waitForNavigation({
                waitUntil: 'networkidle2',
            }),
        ]);

        const [tabOne, tabTwo, tabThree] = (await browser.pages());
        // await page.waitForNavigation();

        console.log("Tab One Title ", await tabOne.title());

        console.log("Tab Two Title ", await tabTwo.title());

        console.log("Tab Three Title ", await tabThree.title());

        numOfP = await browser.pages();
        console.log(numOfP.length);
        page = numOfP[2];

        await page.waitForSelector('.size-buttons-size-button.size-buttons-size-button-default')
        let sizes = await page.$$('.size-buttons-size-button.size-buttons-size-button-default');
        await sizes[0].click();

        await page.click('.pdp-add-to-bag.pdp-button.pdp-flex.pdp-center');

        await page.click('.pdp-add-to-bag.pdp-button.pdp-flex.pdp-center');

        await page.screenshot({ path: 'screenshot.png' });

        browser.close();

    } catch (err) {
        console.log(err);
    }
})()

