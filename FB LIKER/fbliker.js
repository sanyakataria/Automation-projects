let puppeteer = require("puppeteer");
let fs = require("fs");
let credentialsFile = process.argv[2];
let pageName = process.argv[3];
let postToLike = process.argv[4];

(async function () {
    try {
        let data = await fs.promises.readFile(credentialsFile, "utf-8");
        let credentials = JSON.parse(data);
        let url = credentials.url;
        let email = credentials.email;
        let pwd = credentials.pwd;

        //starts browser
        let browser = await puppeteer.launch({
            headless: false,
            defaultViewport: null,
            args: ["--start-maximized", "--disable-notifications"],
            slowMo: 200
        });

        let numberofPages = await browser.pages();
        let tab = numberofPages[0]

        await tab.goto(url, {
            waitUntil: "networkidle2",
        })

        await tab.waitForSelector("input[name='email']");
        await tab.type("input[name='email']", email, { delay: 100 });
        await tab.waitForSelector("input[name='pass']");
        await tab.type("input[name='pass']", pwd, { delay: 100 });
        // await tab.waitForSelector("#u_0_b");
        await navigator(tab, 'button[data-testid="royal_login_button"]');
        //  await tab.click('input[data-testid="royal_login_button"]');
        console.log("User logged in");
        await tab.goto(`https://www.facebook.com/${pageName}/`, { waitUntil: "networkidle2" });
        // multiple url  change
        await navigator(tab, "div[data-key='tab_posts']");
        //await Promise.all([tab.click("div[data-key='tab_posts']"), tab.waitForNavigation({ waitUntil: "networkidle2" })]);
        await tab.waitForNavigation({ waitUntil: "networkidle2" });
        let idx = 0;
        do {
            // _1xnd> ._4-u2.4-u8
            await tab.waitForSelector("#pagelet_timeline_main_column ._1xnd .clearfix.uiMorePager");

            let allposts = await tab.$$("#pagelet_timeline_main_column ._1xnd>._4-u2._4-u8");
            let cPost = allposts[idx];
            let cPostLike = await cPost.$("._666k ._8c74 a");
            await cPostLike.click({ delay: 200 });
            idx++;

            await tab.waitForSelector(".uiMorePagerLoader", { hidden: true });

        } while (idx < postToLike)
    } catch (err) {
        console.log(err);
    }
})();

async function navigator(tab, selector) {
    await Promise.all([tab.waitForNavigation({
        waitUntil: "networkidle2"
    }), tab.click(selector)]);
}