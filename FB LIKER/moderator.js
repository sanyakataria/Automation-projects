let puppeteer = require("puppeteer");
let fs = require("fs");
let credentialsFile = process.argv[2];

(async function () {
    try {
        let data = await fs.promises.readFile(credentialsFile, "utf-8");
        let credentials = JSON.parse(data);
        login = credentials.login;
        email = credentials.email;
        pwd = credentials.pwd;

        //starts browser
        let browser = await puppeteer.launch({
            headless: false,
            defaultViewport: null,
            args: ["--start-maximized", "--disable-notifications"],
            //slowMo: 400
        });

        //create an empty page
        // await browser.newPage();
        
        // returns array of currently open tab
        let numberofPages = await browser.pages();
        // this tab means one page of browser => in documentory of puppeteer this tab=page.
        let tab = numberofPages[0];

        //goto page
        //1.
        await tab.goto(login, {
            waitUntil: "networkidle2",
        });

        // wait for element
        //2.
        await tab.waitForSelector("#input-1");
        await tab.type("#input-1", email, { delay: 100 });
        await tab.waitForSelector("#input-2");
        await tab.type("#input-2", pwd, { delay: 100 });
        await tab.waitForSelector("button[data-analytics='LoginPassword']");
        // if a click causes navigation then some inbuilt functions execute
        // //3.
        // await Promise.all([tab.waitForNavigation({
        //     waitUntil: "networkidle2"
        // }), tab.click("button[data-analytics='LoginPassword']")]);
        navigator(tab, "button[data-analytics='LoginPassword']");
        await tab.waitForSelector("a[data-analytics='NavBarProfileDropDown']");
        await tab.click("a[data-analytics='NavBarProfileDropDown']");
        await tab.waitForSelector("a[data-analytics='NavBarProfileDropDownAdministration']");
        navigator(tab, "a[data-analytics='NavBarProfileDropDownAdministration']");

        //github has different code for lines 55 as sir has emulated slenium into puppeteer and he had selected this element differently.
        await tab.waitForSelector(`a[href ='/administration/challenges']`);
        navigator(tab, `a[href ='/administration/challenges']`);

        await handleSinglePage(tab, browser);
        console.log("all questions processed");

    } catch (err) {
        console.log(err);
    }
})();

async function navigator(tab, selector) {
    await Promise.all([tab.waitForNavigation({
        waitUntil: "networkidle2"
    }), tab.click(selector)]);
}

async function handleSinglePage(tab, browser) {
    await tab.waitForSelector(".backbone.block-center")
    let qonPage = await tab.$$(".backbone.block-center");
    let cPageQsolvedp = [];
    for (let i = 0; i < qonPage.length; i++) {
        //qonPage[i].getAttribute("href"); this function doesnot exit in puppeteer
        let href = await tab.evaluate(function (q) {
            return q.getAttribute("href");
        }, qonPage[i]);

        let chref = "https://www.hackerrank.com" + href;
        let newTab = await browser.newPage();
        // this will give promise to solve that question
        let cPageQwillBeSolvedP = solveOnequestion(chref, newTab);
        cPageQsolvedp.push(cPageQwillBeSolvedP);
    }
    // 1 page all process completes at line 97
    await Promise.all(cPageQsolvedp);
    console.log("visited all questions of one page");

    //if next button is enabled => click next
    let pList = await tab.$$(".pagination ul li");
    let nextBtn = pList[pList.length - 2];
    let className = await tab.evaluate(function (elem) {
        return elem.getAttribute("class");
    }, nextBtn);

    //the above code means this => passing two arguments in functio => one is function according to which u need to change, and other is element
    // function getter(elem){
    //     return elem.getAttribute("class");
    // }
    // let classname = await tab.evaluate(getter, nextBtn);

    
    // you have reached the last page
    // go to next page until reached the last page
    
    if (className === "disabled") {
        return;
    } else {
        await Promise.all([nextBtn.click(), tab.waitForNavigation({ waitUntil: "networkidle2" })]);
        handleSinglePage(tab, browser);
    }
}

// promise => resolve when a new tab is opened
async function solveOnequestion(chref, newTab) {
    await newTab.goto(chref, { waitUntil: "networkidle0" });
    await newTab.waitForSelector("li[data-tab='moderators']");
    await navigator(newTab, "li[data-tab='moderators']");
    await newTab.waitForSelector("#moderator", { visible: true });
    await newTab.type("#moderator", "vejohom272");
    await newTab.keyboard.press("Enter");
    await newTab.waitForSelector(".save-challenge.btn.btn-green")
    await newTab.click(".save-challenge.btn.btn-green");
    await newTab.close();
}