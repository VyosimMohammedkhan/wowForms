const puppeteer = require('puppeteer');
const fetch = require('cross-fetch');
const { Cluster } = require('puppeteer-cluster');
const { PuppeteerBlocker } = require('@cliqz/adblocker-puppeteer');
const { scrollPageToBottom } = require('puppeteer-autoscroll-down')
const { isCaptchaPresent, fillTextInputs, submitForm, findFormframe, getFormElements, getFieldsFromForm, identifyFormFields, handlePopupWidgets, confirmSubmitStatus } = require("./form_functions.js")
const { print, delay, addhttps, handleDialog, handleCookiePopups, filterDataforDB, insertDataToMysql } = require("./work_functions.js")
const autoconsent = require('@duckduckgo/autoconsent/dist/autoconsent.puppet.js');
const extraRules = require('@duckduckgo/autoconsent/rules/rules.json');
const consentomatic = extraRules.consentomatic;

const xpaths = require('./xpaths.js');
const urls = require("./urls.js").urls
const screenshotpath = `/home/dell/Documents/Mohammed Backup/mainfolder/playground/wowAutoforms/frontend/src/images/`
const rules = [
    ...autoconsent.rules,
    ...Object.keys(consentomatic).map(name => new autoconsent.ConsentOMaticCMP(`com_${name}`, consentomatic[name])),
    ...extraRules.autoconsent.map(spec => autoconsent.createAutoCMP(spec)),
];
const pupClusOptions = {
    concurrency: Cluster.CONCURRENCY_CONTEXT,
    maxConcurrency: 1,
    timeout: 120 * 1000,
    puppeteerOptions: {
        headless: false,
        defaultViewport: null,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--fast-start',
            '--disable-extensions',
            '--start-maximized',
            '--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4182.0 Safari/537.36'
        ]
    }
}

//====================================================================================================================

async function fillforms(ws, urls, data, submitEnabled) {

    let result = [];
    let count = urls.length
    let remaining = count
    
    let currentProgressPercent =0
    let pcpp = Number.parseInt(((((count - remaining + 1) / count) * 100)/3 ).toFixed(2))


    const blocker = await PuppeteerBlocker.fromLists(fetch, ['https://secure.fanboy.co.nz/fanboy-cookiemonster.txt']);
    const cluster = await Cluster.launch(pupClusOptions);

    await cluster.task(async ({ page, data: url }) => {
        console.log(remaining, " forms remaining")
        
        let screenshotname = new URL(url).hostname
        
        let formDetails = { url, screenshotname, captcha: false };
        let dataForDB = { url, captcha: false, screenshot_name: screenshotname, form_count: 0, forms: [] }
  
        await blocker.enableBlockingInPage(page);
        
        try {
            ws.send(JSON.stringify({ progress: currentProgressPercent+=pcpp }))
            ws.send(JSON.stringify({ progressInfo: `navigating to ${url}` }))
            
            page.once('load', () => handleCookiePopups(page, url, rules, autoconsent));
            page.on('dialog', async (dialog) => await handleDialog(dialog))

            await page.goto(url, { waitUntil: 'networkidle2' });
            await page.waitForXPath('//*/body')
            await scrollPageToBottom(page, { size: 100, delay: 100 })
            await handlePopupWidgets(page)

            ws.send(JSON.stringify({ progress: currentProgressPercent+=pcpp }))
            ws.send(JSON.stringify({ progressInfo: `filling form on ${url}` }))
            
            formDetails.formsData = await handleForm(page, data, formDetails, submitEnabled) 
            dataForDB = await filterDataforDB(formDetails)

            ws.send(JSON.stringify({ progress: currentProgressPercent+=pcpp }))
            ws.send(JSON.stringify({ progressInfo: `sending data to DB` }))
            


        } catch (err) {

            console.log(err)
            ws.send(JSON.stringify({ progressInfo: `got error on ${url} : ${err.message}` }))
            

        } finally {
            
            await insertDataToMysql(dataForDB)
            await delay(1000)
            await ws.send(JSON.stringify(dataForDB)) 
            
            result.push(dataForDB)
            remaining--
        }

    });

    for (let url of urls) {
        url = await addhttps(url.trim())
        console.log(url)
        cluster.queue(url);
    }

    await cluster.idle();
    await cluster.close();
    return result;
}



//=======================================================================================================================


async function handleForm(page, data, formDetails, submitEnabled) {
    let formsData = []
    let formData = {}
    let url = formDetails.url
    let screenshotname = formDetails.screenshotname
    let formElements = await getFormElements(page)

    const possibleformframes = await findFormframe(page, url)
    for (let frame of possibleformframes) {
        if (formElements.length > 0) break;
        formElements = await getFormElements(frame)
    }

    if (formElements.length > 0) {
        formDetails.captcha = await isCaptchaPresent(formElements)

        for (let element of formElements) {

            formData = await identifyFormFields(await getFieldsFromForm(page, element))

            await fillTextInputs(page, formData.textfields, data)
            await delay(1000)
            await page.screenshot({ type: 'jpeg', path: `${screenshotpath}${screenshotname}before.jpeg`, fullPage: true });

            if (!formDetails.captcha && submitEnabled) {
                await submitForm(formData.buttons)
                formData.submit_status = await confirmSubmitStatus(page, element, url, formData.textfields[0], data)
                await page.screenshot({ type: 'jpeg', path: `${screenshotpath}${screenshotname}after.jpeg`, fullPage: true });
            } else {
                formData.submit_status = "NA"
            }

            
            console.log('submitStatus for ', url, ' :', formData.submit_status)
            formsData.push(formData)
        }


    } else {

    }

    
    await delay(1 * 1000)
    return formsData
}



//======================================================= Execution ===================================================
const data = {
    phone: '8291342205',
    email: 'mkkhan0936@gmail.com',
    firstname: 'Mohammed',
    lastname: 'khanna',
    company: 'khannaservices enterprises',
    subject: 'aprreciation',
    website: 'khannaenterprises.com',
    zip: '400061',
    address: 'Andheri',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    fullname: 'Mohammed',
    message200: 'Hi, you did a good job with the website design. Keep it up!!!!',
    message400: 'Hi, you did a good job with the website design. Keep it up!!!!',
    message1000: 'Hi, you did a good job with the website design. Keep it up!!!!',
    messageNoLimit: 'Hi, you did a good job with the website design. Keep it up!!!!',
    roleTitle: 'marketing associate',
    bestTimeToRespond: 'immediately',
    unidentified: '123'
}
// fillforms(ws, [], data, false)

module.exports = { fillforms }