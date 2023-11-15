const { text } = require("express");
const { delay } = require("./work_functions.js");
const xpaths = require("./xpaths.js")

async function getFieldName(label) {

    let fieldName = await label.evaluate((labelElement) => {
        return labelElement.textContent.replace(/\/n\/t/).trim();
    })

    if (fieldName != '') {
        return fieldName
    } else {
        return (await getFieldsetLegend(label))
    }


}

async function getFieldsetLegend(label) {
    const legendText = await label.evaluate((label) => {
        const fieldset = label.closest('fieldset');
        if (fieldset) {
            const legendText = fieldset.querySelector('legend')?.textContent;
            return legendText
        }
        return ''
    })
    return legendText
}

async function findVisibleFields(page) {
    const labels = await getLabelsFromPage(page)
    const placeholders = await getPlaceholders(page)

    let fieldKeySet = new Set();
    let fieldsInfoArray = []
    console.log(labels.length, placeholders.length)
    for (let label of labels) {
        let fieldName = await getFieldName(label);
        // console.log('name: ', fieldName)
        const [fieldTagname, fieldId, fieldnameattr, fieldData_id] = await getFieldFromLabel(label)
        let isVisible = await isFieldVisible(page, fieldId, fieldnameattr, fieldData_id)
        let isInHeaderFooter = false//await isFieldInHeaderFooter(page, fieldId, fieldnameattr)
        console.log('fieldname: ', fieldName, ' isvisible:', isVisible, ' headerfooter:', isInHeaderFooter, ' tagname:', fieldTagname)
        // console.log('outside method: ', fieldId, ' ', isVisible)
        if (isVisible && !isInHeaderFooter && (!fieldName.trim() == '') && (!fieldName.match(/indicates/i)) && (!fieldTagname.trim() == '')) {
            let fieldkey = JSON.stringify({ tagname: fieldTagname, id: fieldId, nameattr: fieldnameattr, fieldData_id: fieldData_id })
            let fieldInfo = await getFieldDetails(page, isVisible, fieldName, fieldTagname, fieldId, fieldnameattr, fieldData_id)
            fieldInfo.fieldFilled = false;
            if (fieldInfo.inputType !== 'hidden' && !fieldKeySet.has(fieldkey)) {
                fieldKeySet.add(fieldkey);
                fieldsInfoArray.push(fieldInfo);
            }
        }
    }

    for (let placeholder of placeholders) {
        const [fieldName, fieldTagname, fieldId, fieldnameattr, fieldData_id] = await getFieldFromPlaceholder(placeholder)
        let isVisible = await isFieldVisible(page, fieldId, fieldnameattr, fieldData_id)
        let isInHeaderFooter = false//await isFieldInHeaderFooter(page, fieldId, fieldnameattr)
        // console.log('outside : ', fieldId, ' ', isVisible)
        // console.log(isVisible && !isInHeaderFooter && (!fieldName.match(/indicates/i)) && (!fieldTagname.trim() == ''))
        console.log('fieldname', fieldName, ' isvisible:', isVisible, ' headerfooter:', isInHeaderFooter, ' tagname:', fieldTagname)
        // console.log('|fieldName:', fieldName, '|tag:', fieldTagname, '|id:', fieldId, '|name:', fieldnameattr, '|aid:', fieldData_id, '|visible', isVisible)
        if (isVisible && !isInHeaderFooter && (!fieldName.trim() == '') && (!fieldName.match(/indicates/i)) && (!fieldTagname.trim() == '')) {
            let fieldkey = JSON.stringify({ tagname: fieldTagname, id: fieldId, nameattr: fieldnameattr, fieldData_id: fieldData_id })
            let fieldInfo = await getPlaceholderDetails(placeholder, fieldName, fieldTagname, fieldId, fieldnameattr, fieldData_id)
            fieldInfo.fieldFilled = false;
            if (fieldInfo.inputType !== 'hidden' && !fieldKeySet.has(fieldkey)) {
                fieldKeySet.add(fieldkey);
                fieldsInfoArray.push(fieldInfo);
            }
        }
    }

    // console.log('fieldSet:', fieldKeySet)
    return fieldsInfoArray
}

async function isFieldInHeaderFooter(page, id, name) {

    let FieldInHeaderFooter = await page.evaluate((id, name) => {
        let fieldElement;
        if (id) {
            fieldElement = document.querySelector(`[id = '${id}']`);
        } else if (name) {
            fieldElement = document.querySelector(`[name = '${name}']`)
        } else {
            console.log('Field not found', id, ' ', name);
            return false;
        }

        const header = document.querySelector('header');
        const footer = document.querySelector('footer');

        return (
            (header && header.contains(fieldElement)) || (footer && footer.contains(fieldElement))
        );
    }, id, name)

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

async function identifySubmitButtons(page) {
    let submitbutton = await page.$x(xpaths.submitbuttonxpath)
    let submitButtonList = []
    for (let button of submitbutton) {
        let buttonData = await button.evaluate(button => {
            return {
                buttonText: button.textContent.replace(/\/n\/t/).trim(),
                buttonValue: button.value,
                buttonTagname: button.tagName,
                buttonId: button.id,
                buttonclass: button.className
            }
        })
        submitButtonList.push(buttonData)
    }


    // is it better to store id and class and of the first button and use that or is it better to use same xpath again ???
    return submitbutton.length > 0 ? { submitButtonPresent: true, submitButtonList } : { submitButtonPresent: false, submitButtonList }
}

async function submitForm(page, submitButtons) {
    for (let button of submitButtons) {
        try {
            let selector = button.buttonId
                ? `#${button.buttonId}`
                : button.buttonValue
                    ? `input[value*='${button.buttonValue}']`
                    : button.buttonclass
                        ? `.${button.buttonclass.replaceAll(' ', '.')}`
                        : null


            console.log(selector)
            const element = await page.$(selector, { visible: true, timeout: 10000 });

            if (!element) {
                //find by button.buttonText or xpaths.submitbuttonxpath;
            }

            if (element) {
                await page.evaluate((el) => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), element);
                await delay(1000)
                await element.click();
            } else {
                console.log(`Button not found with selector: ${selector}`);
            }
        } catch (error) {
            console.log('Error:', error);
        }

        await delay(1000);
    }

    // let submitbutton = await page.$x(xpaths.submitbuttonxpath)
    // await submitbutton[0].scrollIntoView({ behavior: "smooth", block: "center" });
    // await submitbutton[0].click()
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

async function isCaptchaPresent(page) {
    let captcha = await page.$x(xpaths.capchaxpath)
    return captcha.length > 0 ? true : false
}

async function getLabelsFromPage(page) {
    let labels = await page.$x(xpaths.xpath_labels)
    return labels
}

async function getPlaceholders(page) {
    let elementsWithPlaceholders = await page.$x(xpaths.xpath_placeholders)
    return elementsWithPlaceholders
}

async function getFieldFromLabel(label) {

    const [fieldTagname, fieldId, fieldnameattr, fieldData_id] = await label.evaluate((labelElement) => {

        const requiredTags = ['SELECT', 'INPUT', 'TEXTAREA']

        let tempElement = labelElement;
        while ((tempElement = tempElement.nextElementSibling)) {
            if (requiredTags.includes(tempElement.tagName)) {
                // console.log('first condition')
                return [tempElement.tagName, tempElement.id, tempElement.name, tempElement.getAttribute('data-aid')]
            }
        }

        tempElement = labelElement;
        while ((tempElement = tempElement.previousElementSibling)) {
            if (requiredTags.includes(tempElement.tagName)) {
                // console.log('second condition')
                return [tempElement.tagName, tempElement.id, tempElement.name, tempElement.getAttribute('data-aid')]
            }
        }

        tempElement = labelElement;
        while ((tempElement = tempElement.nextElementSibling)) {
            let siblingdescendants = tempElement.querySelectorAll('*')
            if (siblingdescendants) {
                for (let descendant of siblingdescendants) {
                    if (requiredTags.includes(descendant.tagName)) {
                        // console.log('third condition')
                        return [descendant.tagName, descendant.id, descendant.name, descendant.getAttribute('data-aid')]
                    }
                }
            }
        }


        const descendants = labelElement.querySelectorAll('*');
        if (descendants) {
            for (let descendant of descendants) {
                if (requiredTags.includes(descendant.tagName)) {
                    // console.log('fourth condition')
                    return [descendant.tagName, descendant.id, descendant.name, descendant.getAttribute('data-aid')]
                }
            }
        }

        // tempElement = labelElement.parentNode
        // while ((tempElement = tempElement.nextElementSibling)) {
        //     const descendants = tempElement.querySelectorAll('*');
        //     if (descendants) {
        //         for (let descendant of descendants) {
        //             if (requiredTags.includes(descendant.tagName)) {
        //                 return [descendant.tagName, descendant.id, descendant.name, descendant.getAttribute('data-aid')]
        //             }
        //         }
        //     }
        // }
        console.log('no condition satisfied')
        return ['', '', '', '']

    });

    return [fieldTagname, fieldId, fieldnameattr, fieldData_id]
}

async function isFieldRequired(page, id, name) {

    const isRequired = await page.evaluate((id, name) => {

        let fieldElement;

        if (id) {
            fieldElement = document.querySelector(`[id = '${id}']`);
        } else if (name) {
            fieldElement = document.querySelector(`[name = '${name}']`)
        } else {
            console.log('Field not found for isRequired', id, ' ', name);
            return false;
        }

        if (fieldElement && fieldElement.hasAttribute('required') || fieldElement.classList.contains('required')) {
            return true;
        }

        if (fieldElement && fieldElement.getAttribute('aria-required') === 'true') {
            return true;
        }
        return false;
    }, id, name);

    return isRequired;
}

async function getInputType(page, id, name) {

    const inputType = await page.evaluate((id, name) => {
        if (id) {
            let fieldElement = document.querySelector(`[id = '${id}']`);
            return fieldElement.getAttribute('type')
        }
        if (name) {
            let fieldElement = document.querySelector(`[name = '${name}']`)
            return fieldElement.getAttribute('type')
        }
        console.log('Field not found', id, ' ', name);
        return '';

    }, id, name);

    return inputType ? inputType : ''
}

async function isFieldVisible(page, id, name, data_aid) {

    let isFieldVisible = await page.evaluate((id, name, data_aid) => {
        let fieldElement;
        if (data_aid && !fieldElement) {
            try { fieldElement = document.querySelector(`[data-aid = '${data_aid}']`) } catch { };
        }
        if (id && !fieldElement) {
            try { fieldElement = document.querySelector(`[id = '${id}']`) } catch { };
        }

        if (name && !fieldElement) {
            try { fieldElement = document.querySelector(`[name = '${name}']`) } catch { }
        }

        if (!fieldElement) {
            console.log('Field not found', id, ' ', name);
            return false;
        }

        const computedStyle = window.getComputedStyle(fieldElement);
        const fieldheight = fieldElement.offsetHeight
        const fieldwidth = fieldElement.offsetWidth
        const display = computedStyle.getPropertyValue('display');
        const opacity = parseFloat(computedStyle.getPropertyValue('opacity'));
        const visibility = computedStyle.getPropertyValue('visibility');
        const hiddenAttribute = fieldElement.getAttribute('hidden');
        const disabledAttribute = fieldElement.getAttribute('disabled');

        console.log(id, ' height ', fieldheight, ' width ', fieldwidth, 'display ', display, 'opacity ', opacity, 'visibility', visibility, 'hiddenAttribute ', hiddenAttribute, 'disabledAttribute ', disabledAttribute)

        if (
            (display && display !== 'none') &&
            // (opacity && opacity > 0) &&
            (visibility && visibility !== 'hidden') &&
            (fieldwidth > 0) &&
            (fieldheight > 0) &&
            !hiddenAttribute &&
            !disabledAttribute
        ) {
            return true;
        }

        return false;
    }, id, name, data_aid);

    // console.log('field is visible :', isFieldVisible, ' ', name)
    if (isFieldVisible) {
        let invisibleAncestors = await page.$x(`//*[@id='${id}']//ancestor::*[contains(@style,'display: none')]`)
        if (invisibleAncestors.length > 0) {
            isFieldVisible = false
        }
    }
    // console.log('field ancestors also visible :', isFieldVisible)
    // console.log('inside method :', id, ' ', isFieldVisible)
    return isFieldVisible;
}

async function getSelectOptions(page, id, name) {
    const selectOptions = await page.evaluate((id, name) => {
        let fieldElement;

        if (id) {
            fieldElement = document.querySelector(`[id = '${id}']`);
        } else if (name) {
            fieldElement = document.querySelector(`[name = '${name}']`)
        } else {
            console.log('Field not found', id, ' ', name);
            return '';
        }
        const options = Array.from(fieldElement.options);
        return options.map(option => option.textContent).join(',');

    }, id, name);

    return selectOptions
}

async function getFieldDetails(page, isVisible, fieldName, fieldTagname, fieldId, fieldnameattr, fieldData_id) {

    let options = fieldTagname?.includes('SELECT') ? await getSelectOptions(page, fieldId, fieldnameattr) : ''
    let isrequired = await isFieldRequired(page, fieldId, fieldnameattr)
    let inputType = await getInputType(page, fieldId, fieldnameattr)
    let fieldInfo = { fieldId, fieldnameattr, fieldName, fieldTagname, inputType, isrequired, options, fieldData_id }
    return fieldInfo

}

async function isPlaceholderElementRequired(placeholderElement) {
    let isrequired = placeholderElement.evaluate(element => {
        if (element.hasAttribute('required') ||
            element.classList.contains('required') ||
            element.matches('[aria-required="true"]')) {
            return true;
        }
        return false;
    })

    return isrequired
}

async function getFieldFromPlaceholder(placeholder) {
    let fieldName = await placeholder.evaluate(element => element.placeholder.replace(/\/n\/t/gi, '').trim());
    let fieldTagname = await placeholder.evaluate(element => element.tagName)
    let fieldId = await placeholder.evaluate(element => element.id)
    let fieldnameattr = await placeholder.evaluate(element => element.name)
    let fieldData_id = await placeholder.evaluate(element => element.getAttribute('data-aid'))

    return [fieldName, fieldTagname, fieldId, fieldnameattr, fieldData_id]
}

async function getPlaceholderDetails(placeholder, fieldName, fieldTagname, fieldId, fieldnameattr, fieldData_id) {
    let inputType = fieldTagname.includes('INPUT') ? await placeholder.evaluate(element => element.getAttribute('type')) : ''
    let isrequired = await isPlaceholderElementRequired(placeholder)
    let fieldInfo = { fieldId, fieldnameattr, fieldName, fieldTagname, inputType, isrequired, options: '', fieldData_id }
    return fieldInfo
}


async function fillIfFieldIsMessage(page, frame, fieldDetails, data) {

    if (fieldDetails.fieldTagname == 'TEXTAREA') {
        fieldDetails.fieldFilled = true
        fieldDetails.result = "field is Message"
        await fillDatainField(page, frame, fieldDetails.fieldId, fieldDetails.fieldnameattr, fieldDetails.fieldData_id, data.message)
        return true
    }
    return false
}

async function fillIfFieldIsSubject(page, frame, fieldDetails, data) {

    if (fieldDetails.fieldId.match(/subject/i) ||
        fieldDetails.fieldnameattr.match(/subject/i) ||
        fieldDetails.fieldName.match(/subject/i)) {
        fieldDetails.fieldFilled = true
        fieldDetails.result = "field is subject"
        await fillDatainField(page, frame, fieldDetails.fieldId, fieldDetails.fieldnameattr, fieldDetails.fieldData_id, data.subject)
        return true
    }
    return false
}

async function fillIfFieldIsWebsite(page, frame, fieldDetails, data) {
    if (!fieldDetails.inputType.includes('checkbox') && !fieldDetails.inputType.includes('radio')) {
        if (fieldDetails.fieldId.match(/website|domain/i) ||
            fieldDetails.fieldnameattr.match(/website|domain/i) ||
            fieldDetails.fieldName.match(/website|domain/i)) {
            fieldDetails.fieldFilled = true
            fieldDetails.result = "field is website"
            await fillDatainField(page, frame, fieldDetails.fieldId, fieldDetails.fieldnameattr, fieldDetails.fieldData_id, data.website)
            return true
        }
    }
    return false
}

async function fillIfFieldIsEmail(page, frame, fieldDetails, data) {

    if (fieldDetails.inputType.includes("email") ||
        fieldDetails.fieldId?.toLowerCase().includes("mail") ||
        fieldDetails.fieldnameattr?.toLowerCase().includes("mail") ||
        fieldDetails.fieldName.toLowerCase().includes("mail")) {
        fieldDetails.fieldFilled = true
        fieldDetails.result = "field is email"
        await fillDatainField(page, frame, fieldDetails.fieldId, fieldDetails.fieldnameattr, fieldDetails.fieldData_id, data.email)
        return true
    }
    return false
}

async function fillIfFieldIsContactNumber(page, frame, fieldDetails, data) {
    if (fieldDetails.inputType?.includes("tel") ||
        fieldDetails.fieldId.match(/mobile|phone|contact.*number|cell.*number/i) ||
        fieldDetails.fieldnameattr.match(/mobile|phone|contact.*number|cell.*number/i) ||
        fieldDetails.fieldName.match(/mobile|phone|contact.*number|cell.*number/i)) {
        fieldDetails.fieldFilled = true
        fieldDetails.result = "field is contact number"
        await fillDatainField(page, frame, fieldDetails.fieldId, fieldDetails.fieldnameattr, fieldDetails.fieldData_id, (data.phone).toString())
        return true
    }
    return false
}

async function fillIfFieldIsFirstName(page, frame, fieldDetails, data) {

    if (fieldDetails.inputType.includes("text")) {
        if (
            fieldDetails.fieldId.match(/(?=.*first.*)/i) ||
            fieldDetails.fieldnameattr.match(/(?=.*first.*)/i) ||
            fieldDetails.fieldName.match(/(?=.*first.*)/i)) {
            fieldDetails.fieldFilled = true
            fieldDetails.result = "field is first name"
            await fillDatainField(page, frame, fieldDetails.fieldId, fieldDetails.fieldnameattr, fieldDetails.fieldData_id, data.firstname)
            return true
        }
    }
    return false
}

async function fillIfFieldIsLastName(page, frame, fieldDetails, data) {

    if (fieldDetails.inputType.includes("text")) {
        if (
            fieldDetails.fieldId.match(/(?=.*last.*)/i) ||
            fieldDetails.fieldnameattr.match(/(?=.*last.*)/i) ||
            fieldDetails.fieldName.match(/(?=.*last.*)/i)) {
            fieldDetails.fieldFilled = true
            fieldDetails.result = "field is last name"
            await fillDatainField(page, frame, fieldDetails.fieldId, fieldDetails.fieldnameattr, fieldDetails.fieldData_id, data.lastname)
            return true
        }
    }
    return false
}

async function fillIfFieldIsCompanyName(page, frame, fieldDetails, data) {

    if (fieldDetails.inputType.includes("text")) {
        if (
            fieldDetails.fieldId.match(/(?!.*(mail|Address|type|state|city))(?=.*(company|Business|organization|firm|agency))/i) ||
            fieldDetails.fieldnameattr.match(/(?!.*(mail|Address|type|state|city))(?=.*(company|Business|organization|firm|agency))/i) ||
            fieldDetails.fieldName.match(/(?!.*(mail|Address|type|state|city))(?=.*(company|Business|organization|firm|agency))/i)) {
            fieldDetails.fieldFilled = true
            fieldDetails.result = "field is company name"
            await fillDatainField(page, frame, fieldDetails.fieldId, fieldDetails.fieldnameattr, fieldDetails.fieldData_id, data.company)
            return true
        }
    }
    return false
}

async function fillIfFieldIsFullName(page, frame, fieldDetails, data) {
    if (fieldDetails.fieldFilled == false && fieldDetails.inputType.includes("text")) {
        if (
            fieldDetails.fieldId.match(/name/i) ||
            fieldDetails.fieldnameattr.match(/name/i) ||
            fieldDetails.fieldName.match(/name/i)) {
            fieldDetails.fieldFilled = true
            fieldDetails.result = "field is full name"
            await fillDatainField(page, frame, fieldDetails.fieldId, fieldDetails.fieldnameattr, fieldDetails.fieldData_id, data.fullname)
            return true
        }
    }
    return false
}

async function fillIfFieldIsAddress(page, frame, fieldDetails, data) {

    if (fieldDetails.inputType.includes("text")) {
        if (
            fieldDetails.fieldId.match(/(?!.*(mail))(?=.*(address|location))/i) ||
            fieldDetails.fieldnameattr.match(/(?!.*(mail))(?=.*(address|location))/i) ||
            fieldDetails.fieldName.match(/(?!.*(mail))(?=.*(address|location))/i)) {
            fieldDetails.fieldFilled = true
            fieldDetails.result = "field is address"
            await fillDatainField(page, frame, fieldDetails.fieldId, fieldDetails.fieldnameattr, fieldDetails.fieldData_id, data.address)
            return true
        }
    }
    return false
}

async function fillIfFieldIsZip(page, frame, fieldDetails, data) {

    if (fieldDetails.inputType.includes("text")) {
        if (
            fieldDetails.fieldId.match(/zip|post/i) ||
            fieldDetails.fieldnameattr.match(/zip|post/i) ||
            fieldDetails.fieldName.match(/zip|post/i)) {
            fieldDetails.fieldFilled = true
            fieldDetails.result = "field is zip code"
            await fillDatainField(page, frame, fieldDetails.fieldId, fieldDetails.fieldnameattr, fieldDetails.fieldData_id, (data.zip).toString())
            return true
        }
    }
    return false
}

async function fillIfFieldIsCity(page, frame, fieldDetails, data) {

    if (fieldDetails.inputType.includes("text")) {
        if (
            fieldDetails.fieldId.match(/city/i) ||
            fieldDetails.fieldnameattr.match(/city/i) ||
            fieldDetails.fieldName.match(/city/i)) {
            fieldDetails.fieldFilled = true
            fieldDetails.result = "field is city name"
            await fillDatainField(page, frame, fieldDetails.fieldId, fieldDetails.fieldnameattr, fieldDetails.fieldData_id, data.city)
            return true
        }
    }
    return false
}

async function fillIfFieldIsState(page, frame, fieldDetails, data) {

    if (fieldDetails.inputType.includes("text")) {
        if (
            fieldDetails.fieldId.match(/state/i) ||
            fieldDetails.fieldnameattr.match(/state/i) ||
            fieldDetails.fieldName.match(/state/i)) {
            fieldDetails.fieldFilled = true
            fieldDetails.result = "field is state name"
            await fillDatainField(page, frame, fieldDetails.fieldId, fieldDetails.fieldnameattr, fieldDetails.fieldData_id, data.state)
            return true
        }
    }
    return false
}

async function fillIfFieldIsCountry(page, frame, fieldDetails, data) {

    if (fieldDetails.inputType.includes("text")) {
        if (
            fieldDetails.fieldId.match(/country/i) ||
            fieldDetails.fieldnameattr.match(/country/i) ||
            fieldDetails.fieldName.match(/country/i)) {
            fieldDetails.fieldFilled = true
            fieldDetails.result = "field is country name"
            await fillDatainField(page, frame, fieldDetails.fieldId, fieldDetails.fieldnameattr, fieldDetails.fieldData_id, data.country)
            return true
        }
    }
    return false
}

async function fillIfFieldIsUnidentified(page, frame, fieldDetails, data) {
    fieldDetails.fieldFilled = true
    fieldDetails.result = "unidentified field"
    await fillDatainField(page, frame, fieldDetails.fieldId, fieldDetails.fieldnameattr, fieldDetails.fieldData_id, '1234567890')
    return true
}

async function handleDropdowns(page, frame, dropdowns) {
    for (let dropdown of dropdowns) {
        // if (dropdown.isrequired == true) {
        //let optionToSelect = ''
        //await selectDropdownOption(page, fieldDetails.fieldId, fieldDetails.fieldnameattr, optionToSelect)
        await frame.click(`#${dropdown.fieldId}`);
        delay(500)
        await page.keyboard.press('ArrowDown');
        delay(500)
        await page.keyboard.press('Enter');
    }
    // }
}

async function handleRadiosAndCheckbox(page, frame, fieldGroups) {
    for (let fieldGroup of fieldGroups) {
        let firstField = fieldGroup[0]
        // if (firstField.isrequired == true) {
        if (firstField.fieldId) {
            await page.evaluate((id) => {
                const field = document.getElementById(id);
                field.scrollIntoView({ behavior: "smooth", block: "center" });
            }, firstField.fieldId)
            await delay(1000)
            await frame.click(`#${firstField.fieldId}`)
        } else {
            console.log('unable to find checkbox/radio button for group: ', firstField.fieldnameattr)
        }
        // }
    }
}

async function handleTextInputs(page, frame, textFields, data) {

    const fieldFillers = [
        fillIfFieldIsContactNumber,
        fillIfFieldIsEmail,
        fillIfFieldIsFirstName,
        fillIfFieldIsLastName,
        fillIfFieldIsCompanyName,
        fillIfFieldIsMessage,
        fillIfFieldIsWebsite,
        fillIfFieldIsSubject,
        fillIfFieldIsZip,
        fillIfFieldIsAddress,
        fillIfFieldIsCity,
        fillIfFieldIsState,
        fillIfFieldIsCountry,
        fillIfFieldIsFullName,
        fillIfFieldIsUnidentified
    ];

    for (let field of textFields) {
        //if (field.isrequired == true) {
        let done = false;
        for (let fieldfiller of fieldFillers) {
            try {
                done = await fieldfiller(page, frame, field, data);
                if (done) break;
            } catch {
                done = true;
            }
        }
        // }
    }

}


async function fillFormFields(page, frame, formfields, data) {

    await handleDropdowns(page, frame, formfields.dropdowns)
    await handleRadiosAndCheckbox(page, frame, formfields.radioButtons)
    await handleRadiosAndCheckbox(page, frame, formfields.checkboxes)
    await handleTextInputs(page, frame, formfields.textInputs, data)

}


async function fillDatainField(page, frame, id, name, fieldData_id, data) {

    // console.log(id, name, fieldData_id)
    if (fieldData_id) {
        await frame.evaluate((data_id) => {
            const field = document.querySelector(`[data-aid="${data_id}"]`);
            field.scrollIntoView({ behavior: "smooth", block: "center" });
        }, fieldData_id)
        await frame.click(`[data-aid="${fieldData_id}"]`, { clickCount: 3 });
        await page.keyboard.press('Backspace');
        await frame.type(`[data-aid="${fieldData_id}"]`, data, { delay: 100 });
    } else if (id) {
        await frame.evaluate((id) => {
            const field = document.getElementById(id);
            field.scrollIntoView({ behavior: "smooth", block: "center" });
        }, id)
        await frame.click(`[id="${id}"]`, { clickCount: 3 });
        await page.keyboard.press('Backspace');
        await frame.type(`[id="${id}"]`, data, { delay: 100 });
    } else if (name) {
        await frame.evaluate((name) => {
            const field = document.querySelector(`[name="${name}"]`);
            field.scrollIntoView({ behavior: "smooth", block: "center" });
        }, name)
        await frame.click(`[name="${name}"]`, { clickCount: 3 });
        await page.keyboard.press('Backspace');
        await frame.type(`[name="${name}"]`, data, { delay: 100 });
    } else {
        console.log('Field not found', id, ' ', name);
    }

}

async function categorizeFields(fields) {

    let dropdowns = []
    let checkboxes = []
    let textInputs = []
    let radioButtons = []

    for (let field of fields) {
        if (field.inputType == 'checkbox') {
            field.result = 'field is checkbox'
            checkboxes.push(field)
        } else if (field.inputType == 'radio') {
            field.result = 'field is radio'
            radioButtons.push(field)
        } else if (field.fieldTagname == 'SELECT') {
            field.result = 'field is dropdown'
            dropdowns.push(field)
        } else {
            textInputs.push(field)
        }
    }

    checkboxes = groupFieldsByNameAttr(checkboxes)
    radioButtons = groupFieldsByNameAttr(radioButtons)

    return [textInputs, radioButtons, checkboxes, dropdowns]
}

function groupFieldsByNameAttr(fields) {
    const groupedFields = [];

    for (let field of fields) {
        let fieldnameattr = field.fieldnameattr;
        const rowIndex = groupedFields.findIndex((group) => group.length > 0 && group[0].fieldnameattr === fieldnameattr);

        if (rowIndex === -1) {
            groupedFields.push([field]);
        } else {
            groupedFields[rowIndex].push(field);
        }
    };

    return groupedFields
}

async function selectDropdownOption(page, id, name, optionToSelect) {

    let dropdownElement
    if (id) {
        dropdownElement = await page.$x(`//Select[@id=${id}]`);
        await dropdownElement[0].select(optionToSelect);
    } else if (name) {
        dropdownElement = await page.$x(`//Select[@name=${name}]`);
        await dropdownElement[0].select(optionToSelect);
    } else {
        console.log('Field not found', id, ' ', name);
        return 'Field not found';
    }
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

module.exports = { isformpresent, identifySubmitButtons, isCaptchaPresent, findVisibleFields, fillFormFields, submitForm, categorizeFields, findFormframe }