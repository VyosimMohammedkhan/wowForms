const { Cluster } = require('puppeteer-cluster');
//const createCsvWriter = require('csv-writer').createObjectCsvWriter;
//const fs = require('fs');

const urls = require("./urls.js").urls
const screenshotpath = `/home/dell/Documents/Mohammed Backup/mainfolder/playground/wowAutoforms/frontend/src/images/`
const { isformpresent, identifySubmitButtons, isCaptchaPresent, findVisibleFields, fillFormFields, submitForm, categorizeFields, findFormframe } = require("./form_functions.js")
const { delay, addhttps, scrollToBottom, insertDataToMysql } = require("./work_functions.js")
const puppeteer = require('puppeteer');
const { PuppeteerBlocker } = require('@cliqz/adblocker-puppeteer');
const fetch = require('cross-fetch');
const autoconsent = require('@duckduckgo/autoconsent/dist/autoconsent.puppet.js');
const extraRules = require('@duckduckgo/autoconsent/rules/rules.json');
const consentomatic = extraRules.consentomatic;
const rules = [
    ...autoconsent.rules,
    ...Object.keys(consentomatic).map(name => new autoconsent.ConsentOMaticCMP(`com_${name}`, consentomatic[name])),
    ...extraRules.autoconsent.map(spec => autoconsent.createAutoCMP(spec)),
];


async function fillforms(urls, data) {
    let result = [];
    const blocker = await PuppeteerBlocker.fromLists(fetch, [
        'https://secure.fanboy.co.nz/fanboy-cookiemonster.txt'
    ]);

    const cluster = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_CONTEXT,
        maxConcurrency: 5,
        timeout: 1000 * 1000,
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
    });

    await cluster.task(async ({ page, data: url }) => {
        await blocker.enableBlockingInPage(page);
        let screenshotname = new URL(url).hostname
        let formDetails = {}

        try {
            formDetails.url = url;
            page.once('load', async () => {
                const tab = autoconsent.attachToPage(page, url, rules, 10);
                try {
                    await tab.checked;
                    await tab.doOptIn();
                } catch (e) {
                    console.warn(`CMP error`);
                }
            });

            page.on('dialog', async dialog => {
                console.log(dialog.message());
                try {
                    await dialog.accept();
                } catch {
                    try {
                        await dialog.dismiss();
                    } catch {
                        console.log('unable to accept or dismiss the dialog')
                    }
                }
            })

            await page.goto(url, { waitUntil: 'networkidle2' });
            await page.waitForXPath('//*/body')
            await scrollToBottom(page)
            await delay(5000)

            formDetails.formfound = await isformpresent(page)
            formDetails.captchaFound = await isCaptchaPresent(page)
            formDetails.screenshot = screenshotname;

            if (formDetails.formfound) {
                await handleForm(page, page, formDetails, data, screenshotname)
            } else {
                console.log("form not found in mainframe")
                await delay(3* 1000)
                let possibleformframes = await findFormframe(page, url)
                for (let frame of possibleformframes) {
                    formDetails.formfound = await isformpresent(frame)
                    if (formDetails.formfound)
                        await handleForm(page, frame, formDetails, data, screenshotname)
                }

            }

        } catch (err) {
            console.log(err)
            formDetails.Complete = false
        } finally {
            result.push(formDetails)
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


async function handleForm(page, frame, formDetails, data, screenshotname) {

    let identifiedSubmitButtons = await identifySubmitButtons(frame)
    formDetails.submitButtonFound = identifiedSubmitButtons.submitButtonPresent
    formDetails.submitButtonData = identifiedSubmitButtons.submitButtonList

    const formFields = await findVisibleFields(frame)
    const [textInputs, radioButtons, checkboxes, dropdowns] = await categorizeFields(formFields)

    formDetails.radioButtons = radioButtons;
    formDetails.textInputs = textInputs
    formDetails.checkboxes = checkboxes;
    formDetails.dropdowns = dropdowns;

    await delay(3000)
    await fillFormFields(page, frame, formDetails, data)
    await page.screenshot({ type: 'jpeg', path: `${screenshotpath}${screenshotname}before.jpeg`, fullPage: true });
    await delay(1000)
    // await submitForm(page, identifiedSubmitButtons.submitButtonList)
    // await delay(10000)
    // await delay(2000 * 1000)
    // await page.screenshot({ type:'jpeg', path:`${screenshotpath}${screenshotname}after.jpeg`, fullPage: true });
    // console.log(formDetails)
    formDetails.Complete = true
    await insertDataToMysql(formDetails)
}


//======================================================= Execution ===================================================

// fillforms(
//     [
//         "https://knowink.com/contact-us/",
//         // "wowleads.com",
//         // "allteamcapital.com/contact.html", 
//         // "https://airtable.com/appRJcNfg1eOUYDYJ/shrNijI5rwOHuNod3"
//     ],
//     {
//         phone : '1234567890',
//         email:'myemail@gmail.com',
//         firstname:'myfirstname',
//         lastname:'mylastname',
//         company:'vyosim techlabs',
//         message:'this is a test message',
//         subject:'testing form autofilling',
//         website:'vyosim.com',
//         zip:'12345',
//         address:'myaddress',
//         city:'mycity',
//         state:'mystate',
//         country:'mycountry',
//         fullname:'myfullname',
//     })

module.exports = { fillforms }