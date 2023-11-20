const { delay, scrollToBottom } = require("./work_functions.js");
const { scrollPageToBottom } = require('puppeteer-autoscroll-down')
const xpaths = require("./xpaths.js");
const { copy } = require("copy-paste");
require("copy-paste").global()
//=============================================================================================================
const selectors = {
    textfields: 'input:not([type="button"], [type="hidden"], [type="submit"], [type="radio"], [type="checkbox"], [type="reset"],  [type="file"]), textarea',
    dropdowns: 'select',
    radios: 'input[type="radio"]',
    checkboxes: 'input[type="checkbox"]',
    fileinputs: 'input[type="file"]'
}

const fieldIdentities = {
    phone: /mobile|phone|contact.*number|cell/i,
    email: /mail/i,
    bestTimeToRespond: /time/i,
    date: /date/i,
    roleTitle: /role|title|position/i,
    firstname: /(?=.*first.*)/i,
    middlename: /(?=.*middle.*)/i,
    lastname: /(?=.*last.*)/i,
    company: /(?!.*(mail|Address|type|state|city))(?=.*(company|Business|organization|firm|agency).*)/i,
    website: /website|domain/i,
    subject: /subject|topic/i,
    zip: /zip|post/i,
    city: /city/i,
    state: /state/i,
    country: /country/i,
    address: /(?!.*(mail))(?=.*(address|location).*)/i,
    fullname: /name/i,
    message200: /(?=.*(question|comment|describe|detail).*)/i
}

//=====================================================================================================================
async function handlePopupWidgets(page) {
    let popups = await page.$x(xpaths.xpath_popups)
    popups = await removeInvisibleFields(popups)
    for (let popup of popups) {
        try { await popup.click() } catch { console.log('unable to close popup') }
    }

}

async function getFormElements(page) {
    let formswithtextarea = await page.$x(xpaths.xpath_form)
    formswithtextarea = await removeInvisibleFields(formswithtextarea)
    return formswithtextarea;
}

async function getFieldsFromForm(page, form) {
    await delay(2000)
    const dropdowns = await identifyUngroupedFields(await removeInvisibleFields(await form.$$(selectors.dropdowns)))
    await handleDropdowns(page, dropdowns)
    const radiofields = await identifyGroupedFields(await groupFieldsByNameAttr(await removeInvisibleFields(await form.$$(selectors.radios))))
    await handleRadiosAndCheckbox(radiofields)
    const checkboxes = await identifyGroupedFields(await groupFieldsByNameAttr(await removeInvisibleFields(await form.$$(selectors.checkboxes))))
    await handleRadiosAndCheckbox(checkboxes)

    const fileinputs = await identifyUngroupedFields(await removeInvisibleFields(await form.$$(selectors.fileinputs)));
    await handleFileInputs(fileinputs)

    const textfields = await removeInvisibleFields(await form.$$(selectors.textfields));
    const buttons = await removeInvisibleFields(await form.$x(xpaths.submitbuttonxpath));

    return { textfields, checkboxes, radiofields, dropdowns, buttons }
}

async function removeInvisibleFields(fields) {
    let visibleFields = []
    for (let field of fields) {
        if (await isFieldVisible(field))
            visibleFields.push(field)
    }
    return visibleFields
}

async function isFieldVisible(element) {

    let isElementVisible = false;
    // const fieldid = await element.evaluate(e => e.classList)
    const tagName = await element.evaluate(e => e.tagName)
    const fieldheight = await element.evaluate(e => e.getBoundingClientRect().height)
    const fieldwidth = await element.evaluate(e => e.offsetWidth)
    const ariaHiddenAttribute = await element.evaluate(e => e.getAttribute('hidden'));
    const hiddenAttribute = await element.evaluate(e => e.getAttribute('aria-hidden'));
    const disabledAttribute = await element.evaluate(e => e.getAttribute('disabled'));
    const { display, opacity, visibility } = await element.evaluate(e => {
        const computedStyle = window.getComputedStyle(e)
        const display = computedStyle.getPropertyValue('display');
        const opacity = parseFloat(computedStyle.getPropertyValue('opacity'));
        const visibility = computedStyle.getPropertyValue('visibility');
        return { display, opacity, visibility };
    });
    // console.log('id',fieldid)
    // console.log('fieldheight', fieldheight)
    // console.log('fieldwidth', fieldwidth)
    // console.log('hiddenAttribute', hiddenAttribute)
    // console.log('disabledAttribute', disabledAttribute)
    // console.log('display', display)
    // console.log('opacity', opacity)
    // console.log('visibility', visibility)
    if (
        (display && display !== 'none') &&
        (opacity && opacity > 0) &&
        (visibility && visibility !== 'hidden') &&
        (fieldwidth > 0) &&
        (fieldheight > 0 || tagName == 'FORM') &&//added tagName condition to pass Forms that have height=0 
        !hiddenAttribute &&
        (!ariaHiddenAttribute || ariaHiddenAttribute !== 'true') &&
        !disabledAttribute
    ) {
        isElementVisible = true;
    }

    if (isElementVisible) {
        let invisibleAncestors = await element.$x(`./ancestor::*[contains(translate(@style, 'DISPLAYNOE', 'displaynoe'), 'display: none')]`);
        if (invisibleAncestors.length > 0) {
            isElementVisible = false
        }
    }

    return isElementVisible;
}

async function identifyFormFields(form) {
    form.textfields = await identifyUngroupedFields(form.textfields)
    return form
}

async function identifyUngroupedFields(fields) {
    let identfiedfields = []
    for (let field of fields) {
        const [tagName, fieldName, Id, nameattr, value, inputType, data_aid] = await getFieldDetails(field)
        const identity = await getFieldIdentity(field, tagName, fieldName, Id, nameattr, value, data_aid, inputType)
        const isrequired = await isFieldRequired(field)

        field = { elementhandle: field, label: fieldName }
        field.identity = identity
        field.isrequired = isrequired
        identfiedfields.push(field)
    }
    return identfiedfields
}

async function identifyGroupedFields(fields) {
    let identifiedfieldgroups = []
    for (let group of fields) {
        let fieldsgroup = []
        for (let field of group) {
            if (!field.groupname) {
                const [tagName, fieldName, Id, nameattr, value, inputType, data_aid] = await getFieldDetails(field)
                const isrequired = await isFieldRequired(field)
                const identity = await getFieldIdentity(field, tagName, fieldName, Id, nameattr, value, data_aid, inputType)
                field = { elementhandle: field, label: fieldName, identity: identity, isrequired: isrequired }
                fieldsgroup.push(field)
            }
        }
        identifiedfieldgroups.push(fieldsgroup)
    }
    return identifiedfieldgroups
}

async function getFieldDetails(field) {
    const fieldName = await getFieldName(field);

    const { tagName, Id, nameattr, value, inputType, data_aid } = await field.evaluate(f => {
        const Id = f.id
        const nameattr = f.name
        const inputType = f.getAttribute('type')
        const data_aid = f.getAttribute('data-aid')
        const tagName = f.tagName
        const value = f.value
        return { tagName, Id, nameattr, value, inputType, data_aid }
    })

    return [tagName, fieldName, Id, nameattr, value, inputType, data_aid]
}

async function getFieldName(field) {

    let fieldName = await field.evaluate((field) => {

        //checking previous siblings of input and their descendants
        let tempElement = field;
        while ((tempElement = tempElement.previousElementSibling)) {

            if (tempElement.tagName == 'LABEL') {
                return tempElement.textContent
            }

            let siblingdescendants = tempElement.querySelectorAll('*')
            if (siblingdescendants) {
                for (let descendant of siblingdescendants) {
                    if (descendant.tagName == 'LABEL') {
                        return descendant.textContent
                    }
                }
            }
        }

        //checking next Siblings of input
        tempElement = field;
        while ((tempElement = tempElement.nextElementSibling)) {
            if (tempElement.tagName == 'LABEL') {
                return tempElement.textContent
            }
        }

        //checking descendants of input
        const descendants = field.querySelectorAll('*');
        if (descendants) {
            for (let descendant of descendants) {
                if (descendant.tagName == 'LABEL') {
                    return descendant.textContent
                }
            }
        }

        //checking previous siblings of parent of input
        tempElement = field.parentNode
        while ((tempElement = tempElement.previousElementSibling)) {
            if (tempElement.tagName == 'LABEL') {
                return tempElement.textContent
            }
            const descendants = tempElement.querySelectorAll('*');
            if (descendants) {
                for (let descendant of descendants) {
                    if (descendant.tagName == 'LABEL') {
                        return descendant.textContent
                    }
                }
            }
        }

        return null
    });

    //checking placeholder..........should be first priority ????
    if (!fieldName) {
        fieldName = await field.evaluate(f => f.placeholder)
    }

    //checking ancestors of input that are label
    if (!fieldName) {
        const labelancestor = await field.$x('./ancestor::label')
        if (labelancestor.length > 0)
            fieldName = await labelancestor[0].evaluate(label => label.textContent)
    }

    //checking legend in case field is in fieldset
    if (!fieldName) {
        const legendText = await field.evaluate((field) => {
            const fieldset = field.closest('fieldset');
            if (fieldset) {
                const legendText = fieldset.querySelector('legend')?.textContent;
                return legendText
            }
            return null
        })
        fieldName = legendText
    }

    //if value is given instead of placeholder. (don't be surprised. People actually do this)
    if (!fieldName) {
        const value = await field.evaluate(field => field.value)
        if (value?.trim() !== '')
            fieldName = value
    }

    //if placeholder and label are not present and fieldname is in a p tag
    if (!fieldName) {
        const ancestorP = await field.$x('./ancestor::p');
        const ancestorForm = await field.$x('./ancestor::form');

        if (ancestorP.length > 0) {
            fieldName = await ancestorP[0].evaluate(p => p.textContent);
        } else if (ancestorForm.length > 0) {
            fieldName = await getTextContent(ancestorForm[0])
        }
    }

    return fieldName?.trim();
}

async function getTextContent(element) {
    const textcontent = await element.evaluate((element) => {
        let elementText = element.textContent

        const childNodes = element.childNodes;
        for (const childNode of childNodes) {
            let childText = childNode.textContent
            elementText = elementText.replace(childText, '')
        }
        return elementText;
    });

    return textcontent.trim();
}

async function getFieldIdentity(field, tagName, fieldName, id, nameattr, value, data_aid, inputType) {
    // console.log(tagName, fieldName, id, nameattr, value, data_aid, inputType)
    if (tagName == 'SELECT')
        return 'dropdown'

    if (tagName == 'INPUT') {
        if (inputType?.includes("file"))
            return 'fileinput'
        if (inputType?.includes("tel"))
            return 'phone'
        if (inputType?.includes('email'))
            return 'email'
        if (inputType == 'radio')
            return 'radio'
        if (inputType == 'checkbox')
            return 'checkbox'

        for (const [identity, regex] of Object.entries(fieldIdentities)) {
            if (fieldName?.match(regex))
                return identity
            if (data_aid?.match(regex))
                return identity
            if (value?.match(regex))
                return identity
            if (id?.match(regex))
                return identity
            if (nameattr?.match(regex))
                return identity
        }
    }


    if (tagName == 'TEXTAREA') {
        const maxlength = await field.evaluate(field => field.maxlength)
        if (maxlength == undefined)
            return 'messageNoLimit'
        if (maxlength < 400)
            return 'message200'
        if (maxlength < 1000)
            return 'message400'
        if (maxlength >= 1000)
            return 'message1000'
    }

    return 'unidentified'
}

//not using anymore as we decided to take forms in header and footer as well
async function isFieldInHeaderFooter(field) {

    let FieldInHeaderFooter = await field.evaluate(field => {
        const header = field.closest('header');
        const footer = field.closest('footer');
        if (header || footer)
            return true
        return false
    })

    return FieldInHeaderFooter

}

async function isformpresent(page) {
    let textarea = await page.$x(`//*/textarea`)
    let visibleTextAreas = await textarea.map(async (element) => {
        let details = await element.evaluate(e => { return { id: e.id, name: e.name, data_id: e.getAttribute('data-aid') } })
        let textareaVisible = await isFieldVisible(page, details.id, details.name, details.data_id)
        if (textareaVisible)
            return element
    })

    return visibleTextAreas.length > 0 ? true : false
}

async function submitForm(submitbuttons) {

    for (const button of submitbuttons) {
        try {
            await button.evaluate(button => button.scrollIntoView({ behavior: 'smooth', block: 'center' }));
            await delay(1000)
            await button.click();
            //should we break here ? probably. 
        } catch (error) {
            console.log('Error:', error);
        }
    }

    await delay(1000);

}

// async function submitForm(page) {

//     await page.setRequestInterception(true);
//     let formSubmitted = false;
//     let submitbutton = await page.$x(xpaths.submitbuttonxpath)

//     page.on('request', (request) => {
//         request.continue();
//     });


//     page.on('response', response => {
//         const requestHeaders = response.request().headers(); 
//         if (response.ok()) {
//             formSubmitted = true;
//         }
//     }); 

//     await submitbutton[0].click();
//     await page.waitForFunction(() => formSubmitted);
//     if (formSubmitted) {
//         console.log('Form submitted successfully');
//     } else {
//         console.log('Form submission failed');
//     }
// }

async function isCaptchaPresent(forms) {
    let captchas = []
    for (let form of forms) {
        let captcha = await form.$x(xpaths.captchaxpath)
        captcha = await removeInvisibleFields(captcha)
        captchas = captchas.concat(captcha)
    }
    return captchas.length > 0 ? true : false
}

async function isFieldRequired(field) {

    const isRequired = await field.evaluate(field => {
        if (field.hasAttribute('required') ||
            field.classList.contains('required') ||
            field.getAttribute('aria-required') === 'true') {
            return true;
        }
        return false;
    });

    return isRequired;
}


async function getSelectOptions(field) {

    const selectOptions = await field.evaluate(field => {
        const options = Array.from(field.options);
        return options.map(option => option.textContent).join(',');
    });

    return selectOptions
}


async function handleDropdowns(page, dropdowns) {
    for (let dropdown of dropdowns) {
        // if (dropdown.isrequired == true) {
        //let optionToSelect = ''
        //await selectDropdownOption(page, fieldDetails.fieldId, fieldDetails.fieldnameattr, optionToSelect)
        await dropdown.elementhandle.click();
        delay(500)
        await page.keyboard.press('ArrowDown');
        delay(500)
        await page.keyboard.press('Enter');
        // }
    }
}

async function handleRadiosAndCheckbox(fieldGroups) {
    for (let fieldGroup of fieldGroups) {
        let firstField = fieldGroup[0].elementhandle
        await firstField.evaluate((field) => {
            field.scrollIntoView({ behavior: "smooth", block: "center" });
        })
        await delay(1000)
        await firstField.click()
    }
}

async function handleFileInputs(fileInputs) {
    for (let input of fileInputs) {
        await input.elementhandle.uploadFile('./fileinput.pdf')
    }
}
// async function fillFormFields(page, form, data) {
//     await handleTextInputs(page, form.textfields, data)
// }

async function fillTextInputs(page, fields, data) {
    for (let field of fields) {
        let input = data[field.identity].toString() 
        if (field.identity.startsWith('message')) await pasteIntoField(page, field.elementhandle, input)
        else await typeDatainField(page, field.elementhandle, input)
    }
}

async function typeDatainField(page, field, data) {
    await field.evaluate(field => { field.scrollIntoView({ behavior: "smooth", block: "center" }) })
    await field.click({ clickCount: 3 });
    await page.keyboard.press('Backspace');
    await delay(500)
    await field.type(data, { delay: 100 });
    await delay(500)
}

async function groupFieldsByNameAttr(fields) {
    const groupedFields = [];
    for (let field of fields) {
        let fieldnameattr = await field.evaluate(field => field.name);
        const rowIndex = groupedFields.findIndex((group) => group.length > 0 && group[0].groupname == fieldnameattr);
        if (rowIndex === -1) {
            groupedFields.push([{ groupname: fieldnameattr }, field])
        } else {
            groupedFields[rowIndex].push(field);
        }
    };
    return groupedFields
}

async function selectDropdownOption(dropdown, optionToSelect) {
    await dropdown.select(optionToSelect);
}

async function findFormframe(page, url) {
    let frames = await page.frames();
    console.log('iframes :', frames.length)
    let possibleformframes = [];
    for (const frame of frames) {
        let frameTitle = await frame.title() + " "
        let frameUrl = await frame.url()
        let formsInFrame = await frame.$$('form');
        console.log('forms in iframe :', formsInFrame.length)
        if ((frameUrl != url && frameUrl.includes('form') &&
            !frameTitle.includes('Sign in with Google Button')) ||
            formsInFrame.length > 0)
            possibleformframes.push(frame)
    }
    return possibleformframes
}

async function confirmSubmitStatus(page, form, url, fieldToCheck, data) {

    await waitForNavigation(page)
    for (let cycle = 0; cycle < 30; cycle++) {

        const UrlChanged = await isUrlChange(page, url)
        if (UrlChanged) {
            return "Successful"
        } else {
            if (cycle == 0) await scrollPageToBottom(page, { size: 100, delay: 100 })
            const formVisible = await isFieldVisible(form)
            const formRefreshed = await isFormRefreshed(fieldToCheck, data)

            if (!formVisible || formRefreshed) {
                return "Successful"
            }
        }
        await delay(1000)
    }

    return "Failed"
}

async function waitForNavigation(page) {
    try {
        await page.waitForNetworkIdle()
    } catch {
        console.log('waitForNavigationFailed')
    }
}

async function isUrlChange(page, url) {
    let currentUrl = await page.url()
    return currentUrl.replaceAll('/', '') != url.replaceAll('/', '')
}

async function isFormRefreshed(fieldToCheck, data) {
    const fieldInputData = data[fieldToCheck.identity]
    const fieldValue = await fieldToCheck.elementhandle.evaluate(field => {
        return field.value
    })

    return (fieldValue == '' || fieldValue != fieldInputData)
}

async function pasteIntoField(page, element, text) {

    await copy(text)
    await element.click()
    await delay(500);
    await page.keyboard.down('Control');
    await page.keyboard.down('Shift');
    await page.keyboard.press('KeyV');
    await page.keyboard.up('Control');
    await page.keyboard.up('Shift');
}

module.exports = { isformpresent, isCaptchaPresent, fillTextInputs, submitForm, findFormframe, getFormElements, getFieldsFromForm, identifyFormFields, handlePopupWidgets, confirmSubmitStatus }