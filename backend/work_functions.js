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

async function insertDataToMysql(formData) {

  let query = 'INSERT INTO contactforms (url, formfound, captchaPresent, submitButtonPresent) VALUES (?, ?, ?, ?)'
  let values = [formData.url, formData.formfound, formData.captchaFound, formData.submitButtonFound]

  try {
    const [rows, fields] = await pool.execute(query, values);
    const formId = rows.insertId;

    await insertDataInFormFieldsTable(formId, formData.textInputs)
    await insertDataInFormFieldsTable(formId, formData.radioButtons)
    await insertDataInFormFieldsTable(formId, formData.checkboxes)
    await insertDataInFormFieldsTable(formId, formData.dropdowns)

    console.log(`Inserted contactform with ID ${formId} and related formfields.`);
  } catch (error) {
    console.error('Error:', error);
  } finally {

  }
}

async function insertDataInFormFieldsTable(formId, formfields) {
  console.log(formfields)
  let query = 'INSERT INTO formfields (formid, fieldid, fieldname, fieldtagname, fieldnameattr, inputtype, isrequired, dropdownoptions, identity) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
  formfields.forEach(async field => {
    try{
      let values = [formId, field.fieldId, field.fieldName, field.fieldTagname, field.fieldnameattr, field.inputType, field.isrequired, field.options, field.result]
      await pool.execute(query, values);
    }catch{
      console.log('unable to add field to database: ', field.fieldName )
    }
  });
}
module.exports = { delay, addhttps, scrollToBottom, insertDataToMysql }