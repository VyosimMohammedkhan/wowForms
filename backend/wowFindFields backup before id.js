const { Cluster } = require('puppeteer-cluster');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const mysql = require('mysql2/promise');
const fs = require('fs');

//================================================ DB configs =========================================================
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'hrefkeywords',
});

//=============================================== Xpaths Below ========================================================
const xpath_form = '//*/textarea/ancestor::form'
const xpath_placeholders = `//*/input[contains(@placeholder,'')] | //*/textarea[contains(@placeholder,'')]`
const xpath_labelsinform = '//*/textarea/ancestor::form//label'
const xpath_input = `
//*/textarea/ancestor::form//label/following-sibling::input | 
//*/textarea/ancestor::form//label/following-sibling::*/input
`
const xpath_submitButton = `
//*/button[@type='submit'] |
//*/form//button[contains(text(),'Contact')] |
//*/input[translate(@type, 'SUBMIT', 'submit')='submit'] |
//*/input[translate(@value, 'SUBMIT', 'submit')='submit'] |
//*/button[contains(translate(text(), 'SEND', 'send'), 'send')] |
//*/button[contains(translate(text(), 'SUBMIT', 'submit'), 'submit')] |
//*/button//*[contains(translate(text(), 'SEND', 'send'), 'send')]/ancestor::button |
//*/button//*[contains(translate(text(), 'SUBMIT', 'submit'), 'submit')]/ancestor::button
`

const xpath_Captcha = `//*/form//img[@alt='captcha'] | 
//*/form//iframe[@title='reCAPTCHA'] | 
//form//*[contains(text(),'reCAPTCHA')]
`
//=============================================== Form Crawler ========================================================
async function findFormFields(urls) {
    const cluster = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_CONTEXT,
        maxConcurrency: 5,
        timeout: 60 * 1000,
        puppeteerOptions: {
            headless: false,
            defaultViewport: null,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--fast-start', '--disable-extensions', '--start-maximized']
        }
    });

    await cluster.task(async ({ page, data: url }) => {
        let fieldsInfo = []
        let screenshotname = new URL(url).hostname
        // console.log(screenshotname)
        try {

            let [isFormCrawled] = await pool.execute(`select count(*) as count from hrefkeywords.contactforms where url='${url}'`)
            // if (isFormCrawled[0].count > 0) {
                if (false) {
                console.log('siteform is already present in DB for ', url)
            } else {
                await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4182.0 Safari/537.36')
                page.setDefaultTimeout(0)
                let result = { url: url };
                await page.goto(url, { waitUntil: 'domcontentloaded' });

                await page.waitForXPath('//*/body')
                await delay(5000)
                let isFormPresent = await isformpresent(page)
                result.formfound = isFormPresent[0]
                let formframe = await findFormframe(page, url)

                if (result.formfound) {
                    //find all fields from mainframe form
                    fieldsInfo = await findLablelsAndFieldtypes(page, url)
                } else if (formframe) {
                    //find all fields from form iframe
                    let isFormPresent = await isformpresent(formframe)
                    result.formfound = isFormPresent[0]
                    fieldsInfo = await findLablelsAndFieldtypes(page, url)
                } else {
                    fieldsInfo = [{ url: url, formfound: false, submitButtonPresent: null, captchaPresent: null }]
                }
                await insertDataToMysql(fieldsInfo)
                await addresulttocsv(fieldsInfo)
            }
        } catch (err) {
            console.log(err)
        }
        // await delay(1000 * 1000)
    });

    for (let url of urls) {
        if (!url.startsWith('mailto:')) {
            url = addhttps(url)
            cluster.queue(url);
        }
    }

    await cluster.idle();
    await cluster.close();
    pool.end();
}


//--------------------------------------------Work Functions Below -----------------------------------------------
async function isformpresent(page) {
    let formsWithTextarea = await page.$x(xpath_form)
    if (formsWithTextarea.length > 0) {
        return [true, formsWithTextarea[0]]
    }
    return [false]
}

async function findFormframe(page, url) {
    let frames = await page.frames();
    let formframe;
    for (const frame of frames) {
        let frameTitle = await frame.title() + " "
        let frameUrl = await frame.url()
        if (frameUrl != url && frameUrl.includes('form') && !frameTitle.includes('Sign in with Google Button'))
            formframe = frame
    }
    return formframe
}

async function findLablelsAndFieldtypes(page, url) {

    const labelChildren = await page.$x(xpath_labelsinform)
    const placeholders = await page.$x(xpath_placeholders)

    let submitButtonPresent = await findSubmitButton(page)
    let captchaPresent = await findCaptcha(page)

    let fieldsInfoSet = new Set();
    let fieldsInfoArray = [{ formfound: true, url, submitButtonPresent, captchaPresent }]

    for (label of labelChildren) {
        let fieldInfo = {}
        let fieldName = await label.evaluate(labelElement => labelElement.textContent.replace(/\/n\/t/).trim());
        const [fieldTagname, fieldId, fieldnameattr] = await label.evaluate((labelElement) => {
            
            const requiredTags = ['SELECT', 'INPUT', 'TEXTAREA']
            const prevSibling = labelElement.previousElementSibling
            const nextSibling = labelElement.nextElementSibling
            const descendants = labelElement.querySelectorAll('*');
            const siblingdescendants = labelElement.nextElementSibling?.querySelectorAll('*')

            if (requiredTags.includes(nextSibling?.tagName)) {
                return [nextSibling.tagName, nextSibling.id, nextSibling.name]
            } else if (requiredTags.includes(prevSibling?.tagName)) {
                return [prevSibling.tagName, prevSibling.id, prevSibling.name]
            } else if (siblingdescendants) {
                for (let descendant of siblingdescendants) {
                    if (requiredTags.includes(descendant.tagName)) {
                        return [descendant.tagName, descendant.id, descendant.name]
                    }
                }
            } else if (descendants) {
                for (let descendant of descendants) {
                    if (requiredTags.includes(descendant.tagName)) {
                        return [descendant.tagName, descendant.id, descendant.name]
                    }
                }
            }
            return ['']
        });

        let fieldkey = JSON.stringify({ tagname: fieldTagname, id: fieldId, nameattr: fieldnameattr })
        let options = ' '
        let isrequired = await isFieldRequired(label)
        let inputType = await getInputType(label)

        console.log('fieldid', fieldId, ' fieldnameattr ', fieldnameattr)
        if (fieldTagname?.includes('SELECT')) {
            options = await getSelectOptions(label)
        }

        fieldInfo = { fieldName, fieldTagname, inputType, isrequired, options }
        if (!fieldName.trim() == '' && !fieldTagname.trim() == '' && fieldInfo.inputType !== 'hidden' && !fieldsInfoSet.has(fieldkey)) {
            fieldsInfoSet.add(fieldkey);
            fieldsInfoArray.push(fieldInfo);
        }
    }

    for (let placeholder of placeholders) {
        let fieldInfo = {}
        let options = ' '
        let inputType = ''

        let fieldName = await placeholder.evaluate(element => element.placeholder.replace(/\/n\/t/gi, '').trim());
        let fieldTagname = await placeholder.evaluate(element => element.tagName)
        let fieldId = await placeholder.evaluate(element => element.id)
        let fieldnameattr = await placeholder.evaluate(element => element.name)
        let fieldkey = JSON.stringify({ tagname: fieldTagname, id: fieldId, nameattr: fieldnameattr })

        if (fieldTagname.includes('INPUT')) {
            inputType = await placeholder.evaluate(element => element.getAttribute('type'))
        }

        let isrequired = await placeholder.evaluate(element => {
            if (element.hasAttribute('required') || element.classList.contains('required')) {
                return true;
            } else if (element.matches('[aria-required="true"]')) {
                return true;
            }
            return false
        })

        fieldInfo = { fieldName, fieldTagname, inputType, isrequired, options }
        if (fieldInfo.fieldName && !fieldName.trim() == '' && fieldInfo.inputType !== 'hidden' && !fieldsInfoSet.has(fieldkey)) {
            fieldsInfoSet.add(fieldkey);
            fieldsInfoArray.push(fieldInfo);
        }

    }

    return fieldsInfoArray
}

async function isFieldRequired(label) {

    const isRequired = await label.evaluate((labelElement) => {

        const descendants = labelElement.querySelectorAll('*');
        const prevSibling = labelElement.previousElementSibling
        const nextSibling = labelElement.nextElementSibling
        const nextSiblingChild = labelElement.nextElementSibling?.children[0];

        function checkRequiredValue(field) {
            let required = false;

            if (field.hasAttribute('required') || field.classList.contains('required')) {
                required = true;
            } else if (field.matches('[aria-required="true"]')) {
                required = true;
            }
            return required
        }


        for (let descendant of descendants) {
            if (descendant?.tagName === 'SELECT' || descendant?.tagName === 'INPUT' || descendant?.tagName === 'TEXTAREA') {
                return checkRequiredValue(descendant)
            }
        }
        if (prevSibling?.tagName === 'SELECT' || prevSibling?.tagName === 'INPUT' || prevSibling?.tagName === 'TEXTAREA') {
            return checkRequiredValue(prevSibling)
        } else if (nextSibling?.tagName === 'SELECT' || nextSibling?.tagName === 'INPUT' || nextSibling?.tagName === 'TEXTAREA') {
            return checkRequiredValue(nextSibling)
        } else if (nextSiblingChild?.tagName === 'SELECT' || nextSiblingChild?.tagName === 'INPUT' || nextSiblingChild?.tagName === 'TEXTAREA') {
            return checkRequiredValue(nextSiblingChild)
        }

        return false;
    });
    return isRequired
}

async function getInputType(label) {

    const inputType = await label.evaluate((labelElement) => {

        let inputtype = ''
        const descendants = labelElement.querySelectorAll('*');
        const prevSibling = labelElement.previousElementSibling
        const nextSibling = labelElement.nextElementSibling
        const nextSiblingDescendants = labelElement.nextElementSibling?.querySelectorAll('*');

        function getInputType(element) {
            return element.getAttribute('type');
        }

        for (let descendant of descendants) {
            if (descendant?.tagName.includes('INPUT') && !(descendant?.type.includes('hidden'))) {
                inputtype = getInputType(descendant)
            }
        }

        if (nextSiblingDescendants) {
            for (let descendant of nextSiblingDescendants) {
                if (descendant?.tagName.includes('INPUT') && !(descendant?.type.includes('hidden'))) {
                    inputtype = getInputType(descendant)
                }
            }
        }

        if (prevSibling?.tagName.includes('INPUT')) {
            inputtype = getInputType(prevSibling)
        } else if (nextSibling?.tagName.includes('INPUT')) {
            inputtype = getInputType(nextSibling)
        }
        return inputtype
    })

    return inputType
}

async function getSelectOptions(labelElement) {
    const selectOptions = await labelElement.evaluate(label => {
        const prevSibling = label.previousElementSibling
        const nextSibling = label.nextElementSibling
        const nextSiblingChild = label.nextElementSibling?.children[0];

        if (prevSibling && prevSibling.tagName === 'SELECT') {
            const options = Array.from(prevSibling.options);
            return options.map(option => option.textContent).join(',');
        } else if (nextSibling && nextSibling.tagName === 'SELECT') {
            const options = Array.from(nextSibling.options);
            return options.map(option => option.textContent).join(',');
        } else if (nextSiblingChild && nextSiblingChild.tagName === 'SELECT') {
            const options = Array.from(nextSiblingChild.options);
            return options.map(option => option.textContent).join(',');
        }
        return '';
    });

    return selectOptions
}

function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time)
    })
}

function addhttps(url) {
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
        return "https://" + url;
    }
    return url = url.trim();
}

async function findSubmitButton(page) {
    let submitbutton = await page.$x(xpath_submitButton)
    let submitButtonPresent = submitbutton.length > 0 ? true : false
    return submitButtonPresent
}

async function findCaptcha(page) {
    let captcha = await page.$x(xpath_Captcha)
    let captchaPresent = captcha.length > 0 ? true : false
    return captchaPresent
}

async function addresulttocsv(data) {
    const csvWriter = createCsvWriter({
        path: 'Results.csv',
        header: [
            { id: 'url', title: 'url' },
            { id: 'fieldName', title: 'fieldName' },
            { id: 'fieldTagname', title: 'fieldTagname' },
            { id: 'inputType', title: 'inputType' },
            { id: 'isrequired', title: 'isrequired' },
            { id: 'submitButtonPresent', title: 'submitButtonPresent' },
            { id: 'captchaPresent', title: 'captchaPresent' }
        ],
        append: true
    });
    const fileExists = fs.existsSync('Results.csv');
    if (!fileExists) {
        csvWriter.writeRecords([{
            url: 'URL',
            fieldName: 'fieldName',
            fieldTagname: 'fieldTagname',
            inputType: 'inputType',
            isrequired: 'isrequired',
            submitButtonPresent: 'submitButtonPresent',
            captchaPresent: 'captchaPresent'
        }]);
    }

    csvWriter
        .writeRecords(data)
        .then(() => {

        })
        .catch(err => {
            console.error('Error appending data to CSV file:', err.message);
        });
}
//====================================== DB functions =============================================================
async function insertDataToMysql(formData) {

    let query = 'INSERT INTO contactforms (url, formfound, captchaPresent, submitButtonPresent) VALUES (?, ?, ?, ?)'
    let values = [formData[0].url, formData[0].formfound, formData[0].captchaPresent, formData[0]?.submitButtonPresent]

    try {
        const [rows, fields] = await pool.execute(query, values);

        const formId = rows.insertId;

        for (let i = 1; i < formData.length; i++) {
            await pool.execute(
                'INSERT INTO formfields (formid, fieldname, fieldtagname, inputtype, isrequired, dropdownoptions) VALUES (?, ?, ?, ?, ?, ?)',
                [formId, formData[i].fieldName, formData[i].fieldTagname, formData[i].inputType, formData[i].isrequired, formData[i].options]
            );
        }
        console.log(`Inserted contactform with ID ${formId} and related formfields.`);
    } catch (error) {
        console.error('Error:', error);
    } finally {

    }
}
//===================================== Execution =================================================================
let urls = [
    // "https://www.revdesignstudio.com/contact",
    // 'https://seopalmbay.com/contact/',
    // 'https://servicezoomsmm.com/contact/',
    // 'https://choitax.com/contact/',
    // 'https://www.sfkorean.com/subs/footer_contactus.php',       //==========
    // 'https://www.yicompany.com/contact-3/',
    // 'http://www.cpastevenlee.com/index.php#request', //placeholders //captcha not detected
    // 'http://www.newsunny7.com/pages/contact-us/',
    // 'https://dasomweb.com/contact/',        //need some analysis
    // 'https://www.brkimcpa.com/contact',      //form present but textarea not present        //==========
    // 'https://getskt.com/contact-us/',        //no textarea
    // 'https://www.hbctax.com/',      //placeholders
    // 'https://www.jackzc.com/#contact',       //==========
    // 'http://www.fengfancpa.ca/contact-us/',
    // 'https://www.launchabove.com/contact-us',       //iframe present and visibility is not hidden but cant see iframe
    // 'https://www.caoandassociates.net/contact',
    // 'https://www.jhihan.com/contact-us.html',
    // 'http://www.elitehunt.com/en/lianxi.asp',       //==========
    // 'https://webdesignmelbournefl.us/#!/contact',
    // 'https://seobrevard.com/contact/',
    // "https://servicezoomsmm.com/contact/",
    // "https://choitax.com/contact/",
    // "https://www.sfkorean.com/subs/footer_contactus.php",
    // "https://www.yicompany.com/contact-3/",
    // "http://www.cpastevenlee.com/index.php#request",
    // "http://www.newsunny7.com/pages/contact-us/",
    // "https://dasomweb.com/contact/",
    // "https://www.brkimcpa.com/contact",
    // "https://getskt.com/contact-us/",
    // "https://www.hbctax.com/",
    // "https://www.jackzc.com/#contact",
    // "http://www.fengfancpa.ca/contact-us/",
    // "https://www.launchabove.com/contact-us",
    // "https://www.caoandassociates.net/contact",
    // "https://www.jhihan.com/contact-us.html",
    // "http://www.elitehunt.com/en/lianxi.asp",
    // "https://webdesignmelbournefl.us/#!/contact",
    // "https://seopalmbay.com/contact/",
    // "https://seobrevard.com/contact/",
    // "https://www.phoenixsearchengineoptimization.com/contact/#top",
    // "https://www.seattleseo.biz/free/",
    // "https://www.seattlesearchengineoptimization.net/contact-us/",
    // "https://www.scottsdalewebdesign.com/contact/",
    // "https://www.phoenixwebsitedesign.com/contact/",
    // "https://www.olympiaseo.net/contact/#top",
    // "https://www.stevemapua.com/contact-us/",
    // "https://accountsdaddy.in/contact/",
    // "https://www.kraftgrp.com/contact-us/",
    // "https://hatchhi.com/contact/",
    // "http://www.zmediaagency.com/contact-us.html",
    // "https://letlydiastage.com/contact-us",
    // "https://innovativesmallbusinesssolutions.com/contact/",
    // "http://www.portletoasis.com/contact",
    // "https://www.taxccllc.com/contact",
    // "https://ubrcortex.com/contact",
    // "http://www.paddycollins.com/contact.html",
    // "http://www.thelexingtongroupinc.com/contact-us.html",
    // "https://www.sharriebrooksdesign.com/form__map",
    // "https://planitgeo.com/contact-us/",
    // "https://www.navasdesignconcepts.com/contact",
    // "https://fusion-and.com/contact-us.html",
    // "https://www.anniemillerdesigns.com/contact",
    // "https://accountingcafe.net/#contact",
    // "http://www.optstaffing.com/contact-us.html",
    // "mailto:contact@householdstaff.agency",
    // "http://www.lauranayinteriors.com/contact.html",
    // "https://heidelbergaccounting.com/contact-us",
    // "https://www.fctaxservices.com/contact.html",
    // "https://accesstaxes.com/contact-us",
    // "https://thearkjewelry.com/pages/contact-us",
    // "https://rubyleafdesign.com/contact/",
    // "https://www.sulcmedia.com/contact",
    // "https://oviyadesignstudio.com/contact/",
    // "https://theatmangroup.com/contact-us/",
    // "https://a-clef.net/pages/contact",
    // "https://www.uberbuilt.com/contact",
    // "https://www.eclate.ca/contact/",
    // "https://evocateurstyle.com/pages/contact",
    // "https://amecreatives.com/contact",
    // "https://www.alvarezdiazvillalon.com/contact-us",
    // "https://www.revdesignstudio.com/contact",
    // "https://mattsonaccounting.com/tools/",
    // "https://webtech.consulting/#contact_us",
    // "mailto:sbcre8tivemarketing@gmail.com?subject=Website%20Inquiry",
    // "https://www.zulucrewtaxes.com/contact-us/",
    // "https://zu.com/contact?like-to=work-with-zu",
    // "http://www.zolidesign.com/contact-us",
    // "https://zo.agency/contact-us/",
    // "https://zninteriordesign.com/contact/",
    // "https://zingfit.com/about/#contact",
    // "https://www.ionos.com/contact",
    // "https://www.zen-tec.us/#",
    // "http://www.zenboxdesign.com/contact",
    // "https://www.zenclaire.com/contact",
    // "https://zeejaydev.com/#contact",
    // "https://home.zdscada.com/contact-us/",
    // "https://www.wgcpas.com/contact/",
    // "https://www.zbjewelers.com/articles.asp?ID=83",
    // "https://zanthos.com/#contact",
    // "https://zakotech.com/freeCamp/portfolio/#contact",
    // "https://www.zaitano.com/policies/contact-information",
    // "https://zaecreatives.com/contact/",
    // "https://zwebdeveloper.com/contact/",
    // "http://ztrace.com/Contact.asp",
    // "https://zonnyzone.com/contact/",
    // "http://www.zelement.com/contact",
    // "https://www.z25marketing.com/contact/",
    // "https://www.z2marketing.com/",
    // "https://www.hugedomains.com/contact.cfm",
    // "https://ypscity.com/#14269336-a91c-486d-b8ab-d4cca1a92c2a",
    // "https://www.yourcfo.us/contact",
    // "https://www.yourpowersearch.com/about/contact.htm",
    // "https://yourplacedesigns.com/contact-us/",
    // "https://yourcmto.com/contact-your-cmto/",
    // "https://www.youbiquicast.com/?page_id=35",
    // "https://yomez.com/contact-us/",
    // "https://www.landofyogg.com/contact",
    // "https://www.yerkdesign.com/",
    // "https://www.fetchyellowdog.com/contact",
    // "https://yellow.ai/voice-channel/",
    // "https://yearofthedad.com/contact/",
    // "http://ydniquedesign.com/contact.html",
    // "https://www.ycfaccountingbookkeepingservices.com/contact",
    // "https://ycartdesign.com/contact.html",
    // "https://www.yalealberg.com/contact",
    // "https://yzign.com/pages/contact",
    // "https://www.yuco.com/contact",
    // "https://www.discountedcondominiumrentals.com/contact-us.html",
    // "https://www.xylogix.net/contact",
    // "https://xtremeimarketing.com/#contact",
    // "https://wa.me/+13053018241",
    // "http://www.xtreamsolution.net/contact",
    // "https://www.xtendsocial.com/contact",
    // "https://www.xquisitecreationzs.com/contact",
    // "https://www.xpertreview.com/Contact.html",
    // "https://xpertus.com/contact-us",
    // "https://xpdoffice.com/contact-us/",
    // "https://www.xoxoterysa.com/",
    // "https://xoolooloo.com/contact-us/bug-report",
    // "https://xlysi.com/contact-us",
    // "https://www.xkzero.com/contact-us/",
    // "https://www.xelits.com/contactus/",
    // "https://www.xclntdesign.com/contact.html",
    // "https://xavyconnect.com/your-success/",
    // "https://support.xtuple.com/contact",
    // "https://xtechland.com/contacto",
    // "https://www.xsuite.com/en/general-contact/",
    // "https://www.xrdef.com/contact-1",
    // "https://www.xga.ai/contact",
    // "https://www.xfusiontech.com/company/contact/",
    // "https://xfanatical.com/contact-us",
    // "https://www.xassets.com/contact",
    // "https://www.x911mobileresponse.com/home/Contact",
    // "https://x7judy.com/index.php/contact/",
    // "https://www.themessxpress.com/contact",
    // "https://www.securityguardtrack.com/contact-us",
    // "https://www.officeperfect.com/contactus",
    // "https://mauleciaclaydesigns.com/pages/contact",
    // "https://www.letgodhelp.org/contact",
    // "https://www.judysantamarina.com/contact/",
    // "https://www.johngoldie.com/contact",
    // "https://www.indiefaves.com/pages/contact-us",
    // "https://ikan-ikon.com/contact/index.html",
    // "https://homesweethomedesignsllc.com/#contact",
    // "mailto:admin@goyonebydesign.com",
    // "https://gemstonedagain.com/contact-us/",
    // "https://www.findvaccinenow.com/home/contactus",
    // "https://www.fantasyroom.net/contact",
    // "https://daysoffdesigns.com/contact/",
    // "https://www.davidtarcza.com/",
    // "https://bonhomiedesign.co/contact-1",
    // "http://squarespace.com/",
    // "https://www.thecpaattorney.com/contact",
    // "https://www.lifesizecustomcutouts.com/contact-us",
    // "https://jewelstones.com/contact-us",
    // "http://www.hamradiolicenseexam.com/contact.htm",
    // "https://www.borsystems.com/ContactUs.html",
    // "https://customsewnproducts.com/contact/",
    // "http://www.whatwedobest.com/contact.php",
    // "https://clients.wswd.net/contact.php",
    // "https://wrist-raps-by-design.com/contact/",
    // "https://www.deluxehosting.com/help/contact-us/",
    // "https://wponcall.com/contact/",
    // "https://worxand.co/contact/",
    // "https://www.worldwideriches.com/contact.php",
    // "http://worken.mx/contacto/",
    // "https://workbysimon.com/contact/",
    // "https://designerchad.com/contact/",
    // "https://wordimagemedia.com/contact/",
    // "https://wordandroger.com/#contact",
    // "https://woodstaxes.com/diane-r-woods-1",
    // "https://www.woodpilestudios.com/contact",
    // "http://www.woodhousecreative.com/contact",
    // "https://woodenship3d.com/contact-us/",
    // "https://www.wondercorp.us/contact",
    // "https://www.wolfssl.com/contact/",
    // "https://www.wkbcpa.com/contact.php",
    // "http://www.wjgcpa.com/contact",
    // "http://www.ipage.com/support/contact.bml",
    // "http://www.wisdominfosys.com/#contact",
    // "https://www.wintnerdesign.com/#contact",
    // "https://www.windsandwater.com/#contact",
    // "https://win2wininc.com/#contactPage",
    // "https://wimgo.com/contact/",
    // "https://wilsonbauhaus.com/contact-us/",
    // "http://www.mywbcplan.com/contact-us/",
    // "http://www.williamsharden.com/contactus.html",
    // "https://williamo.com/contact/#top",
    // "https://www.walcpa.com/contact",
    // "https://www.wilkensdesignstudio.com/read-me",
    // "https://wildflowermarketinganddesign.com/contact-us",
    // "https://www.wilderbydesign.com/contact-us",
    // "https://wholesalecreative.com/contact/",
    // "http://www.whitneyandcompanyinteriors.com/contact-us.html",
    // "https://www.gardenscout.com/profile/b.507.r.8429.u.a2dfad.html#contact",
    // "https://whitehotlogic.com/#contact",
    // "https://whitespacemarketinggroup.com/marketing-coaching-for-smbs/",
    // "https://whatsinfotech.com/contact/",
    // "https://www.westelm.com/customer-service/email-us/?cm_re=GlobalLinks-_-Footer-_-ContactUs",
    // "mailto:wendysmithdesign@gmail.com",
    // "https://www.wendyinteriors.com/contact-us",
    // "https://www.wendolyne.design/contact",
    // "https://wemzite.com/#contact",
    // "https://wemarch.io/contact",
    // "https://weirdesigns.com/contact.html",
    // "https://www.webstyle.com/contact/",
    // "https://websoftwareing.com/contact/",
    // "https://www.websites2day.com/contact-us",
    // "https://www.carlosbauza.com/contact-us",
    // "https://websitedesignbyrich.com/contact-website-design-by-rich",
    // "https://graphicsmediagroup.com/contact/",
    // "https://redballoon.in/contact/",
    // "https://websightpro.com/#contact",
    // "https://www.websidedesigner.com/contact-us",
    // "https://www.webroot.com/gb/en/business/about/contact-us/find-channel-partner-contact-us",
    // "https://www.flowmeters.com/contact",
    // "http://www.webnet101.com/index.php/contact.html",
    // "https://www.webmoo.com/contact",
    // "https://www.webgostudios.com/contact-us",
    // "https://www.webbroi.com/contact-us",
    // "http://webajo.com/contact/",
    // "https://www.webwah.com/contact/",
    // "https://www.webwahofbuffalo.com/contact/",
    // "https://webvdeo.com/contact-us",
    // "https://webshine.com/contact/",
    // "https://www.webodoctor.com/#contact",
    // "https://webabcsllc.com/a/locations/contact/48864?return_to=%2F",
    // "https://web-worx.ca/#contact",
    // "https://office-experts.web-guardian.technology/ContactUs.aspx",
    // "http://www.webprosinc.net/contact_web_pros.html",
    // "http://thompsonphotoanddesign.com/index.php/contact-us/",
    // "http://tricities-webdesign.com/contact-us/",
    // "https://960humboldt.com/contact-us/",
    // "https://weavix.com/contact-us/",
    // "https://weatherhillsgroup.com/#contact",
    // "https://wearestudiodesign.us/contact/",
    // "https://wearablesbyb.com/pages/contact",
    // "http://weandbold.com/#contact",
    // "https://weformspro.com/features/",
    // "https://www.wecreate.com/contact/",
    // "https://www.weaudit.com/contact",
    // "https://jolietprinting.com/contact",
    // "http://wavestechnology.net/contact/",
    // "https://wavespawn.com/contact-us/",
    // "https://watersandstone.com/pages/contact",
    // "https://www.warrenendeavor.com/contact",
    // "https://www.waptechusa.com/contact/",
    // "https://wancose.com/contact-us/",
    // "https://rcpmarketing.com/contact-us/",
    // "https://sites.google.com/a/walkeraccountinggroup.com/walker-accounting-group/contact-us",
    // "https://walkstarentertainment.com/contact-us/",
    // "https://www.wagamama.us/contact-us",
    // "https://www.wow360virtualtour.com/contact.php?lan=en",
    // "https://www.winc.digital/contact-us",
    // "https://vxfusion.com/contact/",
    // "https://vteams.com/contact-us/",
    // "https://www.voxeljet.com/contact/",
    // "https://vonwolf.co/contact-us/",
    // "https://vonrockohome.com/lets-create/",
    // "https://www.vonhentschelmotorsports.com/contact",
    // "https://volumebilling.com/",
    // "https://www.vnwmedia.com/#contact",
    // "https://www.vkhaccountingservices.com/contact-us",
    // "mailto:admin@viws.io",
    // "https://vivianwestermanart.com/price-list%2Fcontact",
    // "https://www.visualdraft.com/contact",
    // "https://www.visualchemist.com/?page_id=20202",
    // "https://visualdestini.com/contact-me/",
    // "https://vista-quote.com/home/ContactUs",
    // "https://www.visionsconnect.com/contact/",
    // "http://www.visionasp.com/contact/",
    // "https://www.virtualinkproductions.com/contact",
    // "https://www.virtualcloudworks.com/contact-us/",
    // "https://www.vrm360pro.com/contacts/",
    // "http://www.viro.dev/ShoppingCartPage/ShoppingCart?returnUrl=%2FHome%2FContact",
    // "https://www.vintrace.com/contact/",
    // "https://www.vinsuite.com/contact-us",
    // "https://www.vinsite.com/contact.php",
    // "http://www.vigeomedia.com/#contact",
    // "https://paparazziaccessories.com/contact/",
    // "https://vidswap.com/contact",
    // "https://www.viagood.app/contact/",
    // "https://www.vilogics.com/contact/",
    // "mailto:contact@veteranitpro.com",
    // "https://vestique.com/pages/contact-us",
    // "https://v-rs.com/contact/",
    // "https://www.verso-creative.com/contact",
    // "https://www.vernonstaffing.com/",
    // "https://hawaiivp.com/contact-1",
    // "https://verdigrisinteriordesign.com/contact-us/",
    // "https://www.ver5design.com/home",
    // "http://venturagems.com/contact/",
    // "http://vedikit.com/contactus.html",
    // "http://www.vector-careers.com/contact/",
    // "https://vejov.com/contact/",
    // "https://vdesignu.com/contact/",
    // "https://www.vangodesign.net/",
    // "https://www.vanderveenjewelers.com/contact",
    // "https://vandenbergdesign.com/about-me",
    // "https://valuemanagementresources.com/contact-us/",
    // "https://www.valmardesignstudio.com/work-with-us",
    // "https://www.valleyoaktaxadvantage.com/contact-1",
    // "https://www.theselectronics.com/contact",
    // "http://www.varenderings.com/contact-2",
    // "https://vstacks.in/contact-us/",
    // "https://www.vspatial.com/contact",
    // "https://vsource-software.com/home/Contact",
    // "https://vplannerapp.io/contact",
    // "https://vlinktaxpros.com/contact/",
    // "https://vcreativeinc.com/contact-us",
    // "https://www.ahead.com/contact/",
    // "https://v2idesign.studio/contact",
    // "https://vimageryanddesign.com/contact/",
    // "http://www.bluehost.com/cgi/info/contact_us",
    // "http://www.usatax.live/#contact_form",
    // "http://www.uscreativetypes.com/contact",
    // "http://www.urontax.com/contact/",
    // "https://uromero.com/contact-us",
    // "mailto:contact@urlstarter.com?subject=Appointment%20Request",
    // "https://urbancrackerdesigns.com/contact/",
    // "http://www.upstartwebsitedesign.com/contact.html",
    // "https://www.uppboost.com/contact-us/",
    // "https://untitld.io/#contact",
    // "https://universek.com/contact",
    // "http://unitedesolutions.com/services/contact-lists/",
    // "https://www.uniquestaffingllc.com/contact/",
    // "http://unboxedesign.com/contact/",
    // "https://ummhumm.com/contact/",
    // "http://umbrellatechosolutions.com/contact",
    // "https://www.coroflot.com/contact",
    // "https://ucbbank.com/contact-us",
    // "https://ubifire.com/contact/",
    // "https://uadvertisehere.com/contact",
    // "https://uvisionpartners.com/contact-us/",
    // "https://uviewdesign.com/contact-us/",
    // "https://www.upundit.com/contact/",
    // "https://unikadditions.com/#contact_us",
    // "https://ulouder.com/#contact",
    // "https://ulocally.com/contact/",
    // "https://www.ugreenit.com/contact-us/",
    // "https://uflourishdigital.com/contact-us/",
    // "https://www.ufinpay.com/book-a-consultation",
    // "https://ucreativ.com/contact.html",
    // "https://www.ucalc.com/contact.html",
    // "https://ublankski.com/contact-us/",
    // "https://ubizmedia.com/contact-us",
    // "http://www.u-niquedesignstudios.com/#contact",
    // "https://www.u-fab.com/contact",
    // "https://tyduprie.com/contact",
    // "https://www.txdocs.com/contact/",
    // "https://twocompo.com/contact",
    // "https://twosilvermoons.com/pages/contact",
    // "http://www.twinimagedesign.com/contact.html",
    // "https://www.twillboutique.com/pages/contact-us",
    // "https://www.tw-design.us/contact",
    // "https://turn-signal.com/#contact",
    // "https://tttaxaz.com/contact-us/",
    // "https://www.usattg.com/contact/",
    // "http://www.tssonweb.com/contactus.html",
    // "https://tsncreative.com/contact-us",
    // "https://truxio.com/contact/",
    // "https://www.trutaxandcredit.com/contact-us",
    // "https://www.trustaff.com/contact-us",
    // "https://www.tbt4solutions.com/contact-us/",
    // "https://truit.io/get-started/",
    // "http://www.troyking.com/contact-us",
    // "https://troxal.com/#contact",
    // "http://www.rcworlds.net/html/contact_us.html",
    // "https://www.trilynx.systems/support-overview/contact/",
    // "https://www.triedata.com/Home/ContactTriedata",
    // "https://www.trivansys.com/index.php/contact/",
    // "https://trihead.com/contact/",
    // "https://trescanicas.com/contact/",
    // "https://treisi.com/pages/contact-us",
    // "https://treetreeagency.com/contact/",
    // "https://treetrunkarts.com/pages/contact",
    // "https://www.trbm.marketing/contact",
    // "https://transformier.com/contact-us",
    // "http://transartdesign.com/?page_id=40",
    // "https://www.tracyleighdesign.com/contact/",
    // "https://www.trackcoreinc.com/sales",
    // "https://googlextpr.ai/contact-us/",
    // "https://toxilab.com/#contact",
    // "https://tovodesign.com/contact-us/",
    // "https://www.tovedesign.com/contact-tove",
    // "https://www.tournamentbowl.com/Open/Contact.cfm",
    // "https://www.touchstone-inc.com/#contact",
    // "http://www.touchstone-llc.com/Contact_Us.html",
    // "https://totallymerri.com/pages/lets-talk-about-what-you-would-like-me-to-create-for-you",
    // "https://www.tcsoft.com/contact-us/",
    // "https://www.torosaccounting.com/book-a-consultation",
    // "https://www.topshelftaxpros.com/contact",
    // "https://www.topfloorstore.com/home_h/hme-con.shtml",
    // "http://www.toptechjobs.com/in/en/Content/Help/Contact-Us.htm",
    // "https://top-effective.com/contact/",
    // "https://topofminddesign.com/contact/",
    // "https://acsondhi.com/contact/",
    // "https://tobdesignfirm.com/contact/",
    // "https://topointc.com/contact-us/",
    // "https://tokernel.com/#contact",
    // "https://to-combine.com/contact",
    // "https://www.tnmaccounting.com/contact.html",
    // "http://www.tmfaccountingservices.com/contact_us.html",
    // "https://terrymclark.wordpress.com/contact/",
    // "https://www.tmarksdesign.com/contact/",
    // "https://www.tlkinteriordesign.com/contact/",
    // "https://www.tlbhelp.com/contact",
    // "https://www.bluepalmbookkeepers.com/",
    // "https://california.avevaselect.com/localsupport/contactus.aspx",
    // "https://www.davidriewe.com/contact/",
    // "https://infobytes.com/apply/contact.html",
    // "mailto:information@ellzeycodingsolutions.com?Subject=Contact%20Us",
    // "https://soderstedtcpa.com/contact/",
    // "http://www.mcinerneycpa.com/contact%20me.html",
    // "https://sandsfinancialservices.com/contact/",
    // "https://www.tuelautomation.com/contact",
    // "https://www.naturetrak.com/contact-us/",
    // "https://www.osaasllc.com/contact",
    // "https://chautrancpa.com/contact-us/",
    // "https://unitaryaccounting.com/contact/",
    // "https://www.fitsw.com/contact-us/",
    // "https://mbcsolutionsllc.com/contact/",
    // "https://solvefixedincome.com/contact-us/",
    // "https://timestudy.com/contact-us",
    // "https://fusiontechnologies.us/contact/",
    // "https://www.acumedia.com/connect",
    // "https://watsontaxcpa.com/contact/",
    // "https://www.semrush.com/company/contacts/",
    // "https://corebitweb.com/contact-us/",
    // "https://ruthsadinsky.com/contact",
    // "https://garrosoft.com/contact-us/",
    // "https://arxisfinancial.com/contact-us/",
    // "https://www.sparkcognition.com/contact/",
    // "https://www.fintegrity.us/contact",
    // "https://www.levelupdigitalmarketing.com/contact/",
    // "https://www.koritsusolutions.com/contact-us",
    // "https://www.svtrobotics.com/contact/",
    // "https://www.digitalarcsystems.com/contact",
    // "https://efileny.com/contact-us",
    // "https://www.brandingbrand.com/contact",
    // "https://mangansoftware.com/contact-us/",
    // "https://calendly.com/coachjenlove/15-min-discovery-call",
    // "http://www.tjpfs.com/contact.html",
    // "https://www.simplexservicespa.com/contact",
    // "https://www.veritlabs.com/contact/",
    // "https://digitalwebgeeks.com/contact/",
    // "https://www.project6.com/contact",
    // "http://texascollegestation.com/#contact",
    // "http://www.coastalaccountingandtax.com/contact.html",
    // "https://bcimedia.com/contact-us/",
    // "http://www.ce-cpa.com/contact/#careers",
    // "https://streamie.co/contact",
    // "http://www.bontsoftware.com/contact/",
    // "https://www.cutlerfinancialservice.com/",
    // "https://www.wirelessgeekphone.com/contact-us",
    // "https://nicelydonesites.com/contact/",
    // "https://www.cnwr.com/contact-cnwr",
    // "https://www.cgmaccounting.com/contact",
    // "https://www.ilink-digital.com/contact/",
    // "https://www.stridestrategic.com/home/contact-us",
    // "https://www.coupa.com/contact-us",
    // "https://www.rudolphtechnology.com/contact-us/",
    // "https://www.e2developers.com/projects/ramtechcorp/contact-us/",
    // "https://vynyl.com/contact",
    // "http://realvisionmfgsolutions.com/contact/",
    // "mailto:bcornett@smurke.com",
    // "https://www.wengercopc.com/contact/",
    // "https://www.webscribble.com/contact",
    // "https://www.atlantisitgroup.com/contact-us",
    // "https://wvco.com/contact-us/",
    // "https://www.excelaccountingandtax.co/contact-us",
    // "https://www.mys3tech.com/contact",
    // "http://www.smebusinessconsultants.com/contact-us.html",
    // "https://revotyx.com/contact/",
    // "https://ouraccountingmanager.com/contact-us-1",
    // "http://lss-cpas.com/contact/",
    // "https://lvprotools.com/#section-2QjWhAJYD",
    // "https://www.crs-cpas.com/contact",
    // "https://www.pwc.com/gx/en/global/forms/contactUs.en_gx.html?source=footer&parentPagePath=/content/pwc/gx/en",
    // "https://www.tellisandcompanycpas.com/#contact-us",
    // "mailto:contact@schooldata.net",
    // "https://www.escribemeetings.com/contact-us/",
    // "https://www.fivepointsfinancial.com/contact",
    // "http://mcmullancpas.com/contact/",
    // "https://carlsontaxconsultants.com/contact-us/",
    // "https://www.integrityaccountingservice.com/contact-us.html",
    // "https://www.kbshealthtax.com/contact",
    // "https://www.taxlevelservice.info/contact-us",
    // "https://cumaccountingservices.com/contact-us",
    // "https://kaniassociates.com/contact/",
    // "https://www.facebook.com/sharer.php?u=https://www.ameripriseadvisors.com/michael.barth/?openFormModal=request-contact&display=popup",
    // "https://betterbusinessbookkeeper.com/contact/",
    // "https://www.pincusandgoldberg.com/contact1",
    // "https://www.sanderstaxpro.com/#contact",
    // "https://www.owenlarue.com/contact",
    // "https://www.biggsfinancialservices.com/",
    // "http://bauerpikelaw.com/contact-the-law-office-of-bauer-and-pike-in-great-bend-ks/",
    // "https://cpckokomo.com/contact/",
    // "https://www.raymondjames.com/back9wmg/contact-us",
    // "https://www.rootworks.com/contact-us/",
    // "https://www.kennedywealthgroup.com/",
    // "https://www.gjmadvisory.com/contact",
    // "https://www.rushtonandcompany.com/contact",
    // "https://schofieldlawfirm.com/contact/",
    // "mailto:contact@thepursergroup.com",
    // "https://www.bentonadvisor.com/contact",
    // "https://khazaallaw.com/contacts/",
    // "https://www.brightbooksusa.com/contact",
    // "https://www.joselitotaxservice.com/contact",
    // "https://www.mattcalhouncpa.com/contact-us/",
    // "https://rmvtaxinc.com/contact-us",
    // "https://www.financialservicesplattsburgh.com/contact",
    // "https://www.318technology.com/",
    // "https://nabilcpa.com/contact-me/",
    // "https://www.riverathefraudexaminer.com/contact",
    // "https://www.devinocpa.com/contact",
    // "https://www.simpsonandassociates.ca/contact-us/",
    // "https://heritageincometax.com/contact-us/",
    // "https://www.elitepayroll.net/contact-us/",
    // "https://www.larryhoicowitzcpa.com/contact_us/",
    // "https://www.citaxes.com/#contact",
    // "https://www.bradleytricecpa.com/blank-2",
    // "http://www.availabletaxservices.com/contact_us",
    // "https://www.ngcpasolutions.com/",
    // "https://www.insaudit.com/Public/ContactUs.aspx",
    // "https://www.bizsvc4u.com/contact-us/",
    // "https://www.inspirationmultiservices.com/multi-services-company-contact-us",
    // "https://kavanaughprosperityllc.com/contact-us",
    // "https://www.facebook.com/login/help/637205020878504",
    // "https://rmooretax.com/contact.php",
    // "https://www.datasyscorp.com/contact/",
    // "https://taxservicesinfinity.com/contact-us",
    // "https://www.jt-am.com/contact",
    // "https://htaxes.net/contact-us/",
    // "https://www.makeyourllc.com/contact",
    // "https://txmsp.com/contact-us",
    // "https://www.discountpropertytaxes.com/contact.htm",
    // "https://www.loupusbookkeeping.com/pages/contact-bookkeeping-professionals-gastonia-nc",
    // "http://www.columbustaxpreparation.com/contact-us.html",
    // "https://www.valerieaxtcpa.com/contact.html",
    // "http://www.numbercrunch.net/contact-us.html",
    // "https://qbsolutioneers.com/contact/",
    // "http://www.rodmoecpa.com/contact/",
    // "https://www.minettetax.com/",
    // "https://www.meetjohnsonfinancial.com/#block-footer-ascend",
    // "https://sunshinebooks.net/client-contact-information/",
    // "https://www.taxsolutionspc.com/contact",
    // "https://www.rnraccountants.com/contact/",
    // "https://cpylecpa.com/contact/",
    // "https://mnco-global.com/contact/",
    // "https://www.williamssolidsolution.com/contact.htm",
    // "https://www.pmcaccountinggroup.com/contact/",
    // "https://www.luporiandassociates.com/contact",
    // "https://andersongroupcpas.com/contact-us/",
    // "https://sudhirtax.org/contact/",
    // "https://www.desmondwealth.com/#block-nodeblock-97978",
    // "https://www.parseccomputer.com/contact-us/",
    // "https://www.readysign.com/contact-us",
    // "https://www.ptbservices.com/contact",
    // "https://www.businessaffairsmanagement.com/contact",
    // "https://millerjohnson.com/contact/",
    // "https://www.gabridgeco.com/contact/",
    // "https://doninsleycpa.com/home/contact/",
    // "https://www.mcgrathcpaservices.com/contact/",
    // "https://suzannebeckbookkeepingservices.com/contact-us",
    // "https://abusinesssolutions.com/contact/",
    // "https://www.realtime-it.com/contact-realtime-it",
    // "https://californiaincometaxcounsel.com/#contact-us",
    // "https://internetaccountant.com/contact-us/",
    // "http://www.accountaxbiz.com/#contact",
    // "https://cswestcpas.com/contact-us",
    // "https://www.experttaxsolutions.com/contact-us/",
    // "http://cumplemas.com/?seccion=contacto",
    // "https://westhoucpa.com/contact/",
    // "https://www.brookshirewealth.com/contact_us/",
    // "https://www.thirdwavedigital.com/talk-to-us/contact-us/",
    // "http://aim-nw.com/contact/",
    // "https://www.exelatech.com/contact-us",
    // "https://wynterexpress.com/contact-us",
    // "https://www.managemytaxes.com/contact-us",
    // "http://www.elitemdbilling.com/contact/contact.htm",
    // "https://tfosolutionsllc.com/contact-us/",
    // "https://dforbesley.com/zh/node/18/contact/site/%E8%81%AF%E7%B5%A1%E6%88%91%E5%80%91/Contact%20Us",
    // "https://pellner.com/contact/",
    // "https://www.tarmika.com/contact-us/",
    // "https://taxresolutiondrs.com/index.php/contact-us/",
    // "mailto:webmaster@sterlingsvcs.com",
    // "http://www.joebennie.com/contact-us",
    // "https://sunshinestatehomeloans.com/contactus.php",
    // "http://www.jbtaxesofhalliellc.com/Contact-Us/Contact-Us.html",
    // "https://bookstogo.co/contact/",
    // "http://cfobend.com/contact/",
    // "https://www.actdynamics.com/contact/",
    // "https://www.colbytax.com/contact.html",
    // "https://www.irvingtax.com/contact-us",
    // "mailto:info@tyler-accounting.com?subject=Tyler%20Accounting%20website%20contact",
    // "http://www.hogueaccountancy.com/Contact-Us.html",
    // "https://restineaccounting.com/#contact-us",
    // "https://www.ziontaxandinsurance.com/pages/contactanos",
    // "https://www.tsnamerica.com/transportationservices/contactus",
    // "https://www.etsfirm.com/blank-2",
    // "https://www.hrbizsolutions.net/contactus",
    // "http://www.diserafinoquinn.com/contact/",
    // "https://kramerjensen.com/contact-us/",
    // "https://www.terencemcguire.com/contact",
    // "https://www.cbh.com/contact/",
    // "https://www.mmulcaheycpa.com/contact-us/",
    // "https://www.fastax.com/contact/",
    // "https://www.californiaaccountsservice.com/contact/",
    // "https://www.t3w.com/contact/",
    // "https://rapidpos.com/contact-us/",
    // "https://coast2coastaccountingsolutions.com/contact-us",
    // "https://www.elcorsolutions.com/contact",
    // "https://yetibooks.com/contact-us",
    // "https://taulanetaxes.com/contact-us/",
    // "https://www.probiztechnology.com/contact.htm",
    // "https://johnsantorocpa.com/contact.php",
    // "https://www.aldersoncpas.com/contact",
    // "https://shelton-inc.com/contact-us",
    // "https://www.collinsassoccorp.com/contact",
    // "http://miscinc.com/MISCcontact2.html",
    // "http://www.andersenfinancialgroup.com/contact-us/",
    // "https://www.tuckertaxllc.com/contact-us",
    // "https://trustpointinc.com/contact-us/",
    // "https://bizfinancialmgt.com/contact-us-%26-testimonials",
    // "https://www.paulsalverpa.com/contact-us/",
    // "https://vigilantllc.com/contact-us/request-for-proposal",
    // "https://www.boyercpa.net/contact",
    // "https://www.cpastpete.com/contact-us",
    // "https://mortgageflex.com/contact-us/",
    // "https://noolawllc.com/contact-us/",
    // "https://www.primetaxjax.com/contact",
    // "https://absolutewages.com/contact/",
    // "https://www.hbgcpa.com/contact-us/",
    // "https://www.jackndot.com/copy-of-team",
    // "https://www.taxgeaks.com/contact-us",
    // "https://growthoperators.com/lets-talk/contact",
    // "https://www.kitchenwitchaccounting.com/contact-us",
    // "https://www.ge.com/digital/lp/sales-contact-me",
    // "http://itstaxsoftware.com/contact.html",
    // "https://www.bayareacpa.com/contact/",
    // "https://www.zealaccountingsolutions.com/contact-us",
    // "https://www.colbertballtax.com/contact",
    // "https://www.richardpreiserjr.com/contact",
    // "https://www.mklpc.com/contact",
    // "https://www.thenuagegroup.com/contact-us/",
    // "https://www.mcfarlandassociates.com/contact-us/",
    // "https://sjstem.com/contact.php",
    // "https://www.rccpa.com/contact-waterford",
    // "https://www.manisha-cpa.com/contact",
    // "http://www.cpapracticeadvisor.com/contact/10267629/doug-sleeter",
    // "https://navitance.com/contact-us/",
    // "https://maxestaxes.com/contact-us/",
    // "https://www.ramos-cpa.com/contact.htm",
    // "https://bianchitax.com/contact-us/",
    // "https://ellynschaefercpa.com/contact/",
    // "https://imaccounting.com/contact/",
    // "http://www.glenwoodspringslawfirm.com/contact-us.html",
    // "https://myrallypoint.net/contact-us/",
    // "https://www.pargofinancial.com/contact.htm",
    // "https://randeecookfinancial.com/contact/",
    // "https://help.encyro.com/conversation/new",
    // "https://www.lafinco.com/contact/",
    // "https://etacpa.com/contact/",
    // "https://loricmonkcpa.com/contact/",
    // "https://www.nsoftware.com/company/contact",
    // "https://microscribepub.com/contact-us/",
    // "https://quarshieandassociates.com/contact-us/",
    // "https://www.selbycpa.com/contact",
    // "http://mrfriendlystaxservice.com/contact-tax-services-near-you",
    // "https://www.tjtpa.com/contact",
    // "https://ebbandflowbk.com/contact-us",
    // "https://paylidify.com/us-en/call-paylidifys-phone-number/",
    // "https://www.retiresfs.com/contact-us",
    // "https://www.laser1040.com/contact-us/",
    // "https://www.smallworldtaxes.com/contact",
    // "https://shoeboxaccountingandconsulting.com/about-us/#contact",
    // "https://ebmcpa.com/#contact-us",
    // "https://www.extremeaccountingsolutions.com/contact.php",
    // "https://www.bssconsulting.com/about-us/contact-us/",
    // "https://www.hwafirm.com/contactus.php",
    // "https://lapinvest.com/contact-two/",
    // "https://www.latinotiservice.com/contact/",
    // "http://www.dougmassey.com/contact_us/",
    // "http://www.fullerbentley.com/contact.html",
    // "https://www.acpa4you.com/contactus.php",
    // "https://www.legnasoftware.com/contact",
    // "https://hwl.cpa/contact/",
    // "https://taylorbonascpas.com/contact",
    // "https://www.mcduffycpa.com/contact",
    // "https://www.financialconceptsllc.net/contact",
    // "https://www.davidhennickcpa.com/contact.htm",
    // "http://www.entendu.net/contact-us.html",
    // "https://www.franchisescpa.com/contact.htm",
    // "https://www.oemamerica.com/contact-us/",
    // "https://shoecpa.com/contact-us",
    // "https://taxsolutionsattorneys.com/Contact-Us",
    // "https://www.advancetaxservices.org/contact",
    // "https://mycpacoach.com/contact/",
    // "https://excellefinancial.com/contact-us/",
    // "https://www.payrollnh.com/contact-us/",
    // "https://www.riversmoorehead.com/contact-us/",
    // "https://www.gbgroupaccounting.com/contact",
    // "https://snyderbrowncpas.com/contact-us-1",
    // "https://online2553.com/contact/",
    // "https://irstaxattorneynetwork.com/contact/",
    // "https://itesoftwaresolutions.com/#contact",
    // "https://www.ameriprise.com/customer-service/contact",
    // "https://www.esterbrooks.com/splash#",
    // "https://www.lawsoncpas.com/contact-us",
    // "https://www.annerosscpa.com/contact",
    // "https://www.ststaxes.com/contact",
    // "http://www.samvassallopc.com/contactus",
    // "https://www.christinezfreelandcpa.com/contact",
    // "https://www.martincpa.net/contact",
    // "https://www.abbottprivee.com/contact.html",
    // "https://uchistax.com/#contact",
    // "http://www.condonlapsley.com/contact/",
    // "https://cm-cpas.com/contact/",
    // "https://www.rjbaccountingservicesinc.org/contact-us",
    // "https://www.ingic.com/contact-us/",
    // "https://www.marcusherbertbankruptcy.com/contact",
    // "https://allmancpa.com/contact/",
    // "https://hirschtaxlaw.com/contact-us/",
    // "https://amfenaccounting.com/contact-us/",
    // "https://www.fairvalueadvisors.com/contact-us/",
    // "https://salgadovpro.com/",
    // "https://accountableaccountants.net/contact-us",
    // "https://www.prospecttaxes.com/contact",
    // "https://www.robinsontaxservice.org/contact-10",
    // "http://www.servpromanassas.com/contact/index.htm",
    // "https://masseyandcompanycpa.com/contact/",
    // "https://www.bondesq.com/contact.html",
    // "https://www.mitchellcpa.com/contact",
    // "https://www.practicalaccountingva.com/contact",
    // "https://aviation.wfscorp.com/contact-us",
    // "https://www.coomercpa.biz/contact",
    // "https://batesincometaxca.com/Contact",
    // "https://www.ubiquityinsurance.com/#",
    // "https://www.kerrandcompanypc.com/contact",
    // "https://tetris.com/contact-us",
    // "https://thetaxe.com/contact-us/",
    // "https://neaditsolutions.com/about/contact-us/",
    // "https://ibmsb.com/contact/",
    // "https://flighttaxsystems.com/contact-us/",
    // "https://absetax.com/contact/",
    // "http://www.nvbizbuilders.com/contact-us.html",
    // "https://fasttaxrefund.com/contact",
    // "https://perfectdomain.com/contact-us",
    // "https://www.accuityllp.com/contact/",
    // "https://wymerbrownlee.com/contact-us/",
    // "https://www.badmancpa.com/contact",
    // "https://www.ericksoncpa.net/contact-us/",
    // "http://www.southeastacctg.com/contact.html",
    // "https://www.websteraccounting.com/contact",
    // "https://www.yabllp.com/contact",
    // "https://nationaltaxreliefinc.com/contact/",
    // "https://bowlingcpa.com/#form",
    // "https://www.sbtpartners.com/contact/#top",
    // "http://ganesancpa.com/contact-us/",
    // "http://www.vermeulencpa.com/contact/",
    // "https://www.altalomatax.com/contact-us",
    // "https://rickawayswishergroup.bairdwealth.com/#contact",
    // "http://www.kbotax.com/contact.php",
    // "http://taxhelprr.com/contact-us/",
    // "https://www.centuryks.com/contact",
    // "https://hbwtitle.com/contacttitleservices/",
    // "https://jcraincpa.com/contact/",
    // "https://dougfreemancpa.com/contact-us/",
    // "https://voyageuradvisorygroup.com/contact",
    // "https://www.rjpcpa.net/contact",
    // "https://mathis.ws/contact-mathis-it-consulting-temecula/",
    // "https://www.pinnaclepointgroup.com/contact-stockton-ca",
    // "http://greatincometax.com/contact/",
    // "https://rocklingroup.io/contact/",
    // "https://andrewbusinesssolutions.com/contact-us/",
    // "https://s2accounting.com/contact-us",
    // "https://www.northcompassfinancial.com/contact",
    // "https://rojascpa.com/contact/",
    // "https://www.cpahsa.com/index.php/about/location-and-contact",
    // "https://www.molvicpa.com/contact.htm",
    // "https://www.snicompanies.com/staffing-recruiting/",
    // "https://foresightcpa.com/#contact",
    // "https://tidelinecpas.com/contact-us/",
    // "http://cab-cpa.com/contact-us/",
    // "https://www.jjordancpa.com/contact",
    // "https://www.mansontaxservices.com/contact",
    // "https://quickclientportal.com/contact-us/",
    // "https://www.ksmbassociates.com/contact-ksmb",
    // "https://www.foundationfinancial.org/",
    // "https://beringcpa.com/contact-us",
    // "https://www.faneuil.com/contact-us/",
    // "https://www.wagefiling.com/contact/",
    // "mailto:contactus@newsometax.com",
    // "https://www.brianskeltoncpa.com/contact-us.html",
    // "https://www.cookaccountingpc.com/contact.htm",
    // "https://www.bco-cpa.com/contact.php",
    // "https://www.accountingbypro.com/contact",
    // "https://www.coppercoinbookkeeping.com/contact-us",
    // "https://espinalbusinessgroup.com/contact-us/",
    // "https://www.andersonspector.com/contact",
    // "https://www.madisonrandolph.com/contact/",
    // "https://www.cpatmc.com/contact",
    // "https://utaxs.com/contact-us",
    // "https://scharfpera.com/contact-us/",
    // "https://www.swartz-retson.com/#contact",
    // "https://www.slocumdeangelus.com/contact-us/",
    // "https://www.texastaxattorneys.net/contact-us/",
    // "https://www.etaxexpress.com/contact/",
    // "http://crystalclearaccting.com/contact-an-accountant/",
    // "http://www.taxtimelewisville.com/contact-us/",
    // "https://www.forsythsoftware.com/contact/",
    // "https://www.ssb-cpa.com/contact/",
    // "https://www.datanat.com/contact.php",
    // "https://www.cpapartnersllc.com/contact",
    // "https://irstaxconsultant.com/contact-us/",
    // "https://www.gba-cpas.com/contact.php",
    // "https://www.cpasatx.com/Contact_Us.php",
    // "https://www.hscompanies.com/contact-us/",
    // "https://amylarsenaccounting.com/contact-us",
    // "https://lambtax.com/contact-us",
    // "https://www.sorensencpa.com/contact",
    // "https://www.speicherwealth.com/contact",
    // "https://www.sbbsyubacity.com/contact.html",
    // "https://asamllp.com/contact.html",
    // "https://www.bepcocpa.com/contact-us",
    // "http://murraysupplycorp.com/contact.html",
    // "https://inkandcanvasdesign.com/contact",
    // "https://www.waynejgriffinelectric.com/contact",
    // "https://www.erincondroninteriors.com/contact",
    // "https://sales.eztouse.com/contact-us/",
    // "http://simplygrande.com/contact-us/",
    // "https://www.pageonewebsolutions.com/contact/",
    // "https://www.jheganinteriors.com/contact",
    // "https://shopzane.com/pages/contact",
    // "https://www.lehouxart.com/news-events",
    // "https://blondedesignstudio.com/contact-1",
    // "https://magnoliaofthebayou.com/pages/contact",
    // "https://www.abstractdistractionsky.com/contact",
    // "https://www.decoratebydesignwithmarycynthia.com/#section-5b0a4ba521825",
    // "http://inkinablink.com/contact-us.html",
    // "http://superiorelectriccoinc.com/contact/",
    // "https://bldgsolutions.net/contact-us/",
    // "https://www.silverfoxrealty.org/contact-us/",
    // "https://www.cecelectric.us/contact",
    // "mailto:jakerains@gmail.com?subject=Website%20Contact",
    // "https://www.thehorsewithnoname.com/pages/contact-us",
    "https://www.dataaxleusa.com/about-us/contact-us/",
    // "https://www.timelessinteriorsmn.com/contact",
    // "https://www.pixelspc.com/contact",
    // "https://www.derbyprintingky.com/contact-us",
    // "https://momentum-creations.com/#contact_us",
    // "https://alwaysrelevantdigital.com/contact/",
    // "https://www.lilliansonline.com/t8/contact-us.html",
    // "http://www.midwestcolorprinting.com/contact2.html",
    // "https://wrimaging.com/contact-us",
    // "https://www.vintagechicbridalboutique.com/contact",
    // "https://mykeystonehomes.com/contact-us",
    // "https://www.worthprintingidaho.com/contact-us",
    // "http://www.appliedsurfacestechnology.com/contact",
    // "http://www.nemyrdesign.com/contact.html",
    // "https://gatecity-graphics.com/contact-us",
    // "https://johnsonsgems.com/contact/",
    // "https://jillmansfieldinteriors.com/contact-us/",
    // "http://www.csecinc.com/contact-us.html",
    // "https://datmediafl.com/contact/",
    // "https://www.panopticde.com/clientapplication",
    // "https://www.neongrowth.com/contact",
    // "https://dujardindesign.com/contact",
    // "https://annystern.com/pages/contact-us",
    // "https://www.zeroingraphics.com/contact",
    // "https://www.chasergaffney.com/contact",
    // "https://geigerawards.com/contact/",
    // "https://transouthelectrical.com/contact-us/",
    // "https://mrtechxpertelectrical.com/contact-us/",
    // "https://tuckerpainter.c21.com/contact",
    // "https://www.cliffordcreative.com/contact/",
    // "https://watchus.com/pages/contact-us",
    // "https://www.breckenridge-jewels.com/contact-us",
    // "https://elevationgoods.co/pages/contact-us",
    // "http://www.jeffreythrasher.com/contact",
    // "https://schausvorhies.com/contact-schaus-vorhies-companies/",
    // "https://www.prostarplanet.com/Contact.php",
    // "http://www.aceplattsburgh.com/contact_info.html",
    // "https://www.visitmanitoga.org/contact",
    // "https://jmj-studios.com/?page_id=80",
    // "mailto:johnnyandcarlo@gmail.com",
    // "https://www.creativeedgeia.com/contact",
    // "https://www.ahlstrom-schaeffer-elec.com/contact",
    // "https://carldelucia.com/contact_us/",
    // "https://birchdesignsco.com/contact-us/",
    // "https://www.romanelli.com/#contact",
    // "https://leescfi.com/contact",
    // "https://nickelelectricinc.com/contact-us/",
    // "https://nextstepdigital.com/contact/",
    // "https://www.cabinetdesigners.com/contact-1",
    // "https://ideographyny.com/contact/",
    // "https://www.rendertribe.com/work-with-us/",
    // "https://williamsandwilliamsdesigners.com/contact.php",
    // "https://crystalricotta.com/contact/lets-chat-crystal-ricotta/",
    // "https://www.jewelzngemzbykim.com/pages/contact",
    // "https://www.glidesigners.com/",
]
findFormFields(urls)