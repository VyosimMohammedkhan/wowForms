const { query } = require('express');
const mysql = require('mysql2/promise')

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'hrefkeywords',
});

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

async function scrollToBottom(page) {
  await page.evaluate(() => new Promise((resolve) => {
    var scrollTop = -1;
    const interval = setInterval(() => {
      window.scrollBy(0, 100);
      if (document.documentElement.scrollTop !== scrollTop) {
        scrollTop = document.documentElement.scrollTop;
        return;
      }
      clearInterval(interval);
      resolve();
    }, 10);
  }));
}

async function handleCookiePopups(page, url, rules, autoconsent) {
  const tab = autoconsent.attachToPage(page, url, rules, 10);
  try {
    await tab.checked;
    await tab.doOptIn();
  } catch (e) {
    console.warn(`CMP error`);
  }
}

async function handleDialog(dialog) {
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
}

async function filterDataforDB(data) {

  let dataForDB = { url: data.url, captcha: data.captcha, screenshot_name: data.screenshotname, form_count: data.formsData.length }
  let forms = []

  for (let form of data.formsData) {
    let formData = { submitbuttonPresent: form.buttons.length > 0 }
    const textfields = form.textfields.map(({ elementhandle, ...rest }) => rest)
    const checkboxes = form.checkboxes.flat().map(({ elementhandle, ...rest }) => rest)
    const radios = form.radiofields.flat().map(({ elementhandle, ...rest }) => rest)
    const dropdowns = form.dropdowns.map(({ elementhandle, ...rest }) => rest)
    formData.fields = [...textfields, ...checkboxes, ...radios, ...dropdowns];
    formData.submit_status = form.submit_status
    forms.push(formData)
  }
  dataForDB.forms = forms

  return dataForDB
}


async function insertDataToMysql(formData) {
  console.log('formdata', formData)
  const field_count = formData.forms.reduce((count, form) => count + form.fields.length, 0);

  console.log('field_count', field_count)
  let query = `
  INSERT IGNORE INTO contact_forms (url, form_count, field_count, captcha, screenshot_name, submit_status) VALUES (?, ?, ?, ?, ?, ?)
  ON DUPLICATE KEY UPDATE
    form_count = VALUES(form_count),
    field_count = VALUES(field_count),
    captcha = VALUES(captcha),
    screenshot_name = VALUES(screenshot_name),
    submit_status = VALUES(submit_status);`

  let values = [formData.url, formData.form_count, field_count, formData.captcha, formData.screenshot_name, formData.forms[0].submit_status]
  console.log(formData.url, formData.form_count, field_count, formData.captcha, formData.screenshot_name, formData.forms[0].submit_status)
  try {
    const [rows, fields] = await pool.execute(query, values);
    let domainId = rows.insertId;
    await insertDataInFormFieldsTable(domainId, formData.forms, formData.url)
    console.log(`Inserted contactform for ${formData.url} with ID ${domainId} and related formfields.`);
  } catch (error) {
    console.error('Error:', error);
  } finally {

  }
}

async function insertDataInFormFieldsTable(domainId, forms, url) {
  let deletequery = `
  DELETE FROM hrefkeywords.formfields
  WHERE domain_id IN (
    SELECT id
    FROM hrefkeywords.contact_forms
    WHERE url = '${url}'
  );`
  let getdomainIdquery = `select id from contact_forms where url='${url}'`
  const [rows, fields] = await pool.execute(getdomainIdquery)
  await pool.execute(deletequery);
  domainId = domainId == 0 ? rows[0].id : domainId

  let form_number = 1;
  for (let form of forms) {

    let insertquery = `INSERT INTO formfields (domain_id, form_number, field_number, field_name, isrequired, identity, submit_status) 
    VALUES (?, ?, ?, ?, ?, ?, ?);`

    let field_number = 1
    form.fields.forEach(async field => {

      try {
        let values = [domainId, form_number, field_number, field.label, field.isrequired, field.identity, form.submit_status]
        await pool.execute(insertquery, values);
        // console.log('added new row to domainID ',domainId )
      } catch {
        console.log('unable to add field to database: ', field.label)
      } finally {
        field_number++
      }
    });
    form_number++
  }

}


function splitToArray(value) {
  let urlList = value.split(/\r?\n|\r|\t/);
  urlList = urlList.flatMap(element => element.split(/[,|;]/));
  urlList = urlList.flatMap(element => element.trim())
  urlList = urlList.flatMap(element => element.split(' '))
  urlList = urlList.filter(element => element)
  urlList = [...new Set(urlList)]
  return urlList
}

function print(content) {
  console.log(content)
}
module.exports = { splitToArray, print, delay, addhttps, scrollToBottom, handleDialog, handleCookiePopups, filterDataforDB, insertDataToMysql }