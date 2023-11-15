const mysql = require('mysql');

const connection = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'password'
});

async function getFormFields(url) {
    const formQuery = `
    Select url, form_count, captcha, screenshot_name
    from hrefkeywords.contactforms where url='${url}';
    `
    const fieldsquery = `
    Select F.field_name, F.isrequired, F.identity, F.form_number
    FROM
    hrefkeywords.contactforms C join hrefkeywords.formfields F on C.id=F.domain_id
    where url='${url}'
    order by F.form_number;`
    let formsummary = await new Promise((resolve, reject) => {
        connection.query(formQuery, (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        })
    })

    let fields = await new Promise((resolve, reject) => {
        connection.query(fieldsquery, (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        })
    })

    let form_count = formsummary[0]?.form_count 
    let captcha = formsummary[0]?.captcha
    let screenshot_name = formsummary[0]?.screenshot_name
    fields = fields.map(field => {
        return {
            field_name: field?.field_name,
            isrequired: field?.isrequired,
            identity: field?.identity,
            form_number : field?.form_number
        };
    });
    let result = {
        url,
        form_count,
        captcha,
        screenshot_name,
        fields: fields
    }

    return result
}

async function getStatistics() {
    const totalCountQuery = `Select count(*) as totalCount from hrefkeywords.contactforms`;
    const formsNotFoundQuery = `Select count(*) as formNotFound from hrefkeywords.contactforms where form_count=0`;
    const captchaFormsQuery = `Select count(*) as captchaPresent from hrefkeywords.contactforms where captcha=1`;
    // const submitButtonQuery = `Select count(*) as submitButtonNotPresent from hrefkeywords.contactforms where submitButtonPresent=0`;
    // const lessthanthreeQuery = `select count(*) as countlessthanthree from 
    // (SELECT count(*) as count from
    //     hrefkeywords.contactforms AS c
    // INNER JOIN
    //     hrefkeywords.formfields AS f
    // ON
    //     c.id = f.formid
    // group by url) as newtable where count<3;`

    let totalCount, formsNotFound, captchaPresent;

    const executeQuery = (query) => {
        return new Promise((resolve, reject) => {
            connection.query(query, (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });
    };

    let stats = await executeQuery(totalCountQuery)
        .then((results) => {
            totalCount = results[0].totalCount;
            return executeQuery(formsNotFoundQuery);
        })
        .then((results) => {
            formsNotFound = results[0].formNotFound;
            return executeQuery(captchaFormsQuery);
        })
        .then((results) => {
            captchaPresent = results[0].captchaPresent;
            // return executeQuery(submitButtonQuery);
            return { totalCount, formsNotFound, captchaPresent }
        // })
        // .then((results) => {
        //     SubmitButtonNotPresent = results[0].submitButtonNotPresent;
        //     return { totalCount, formsNotFound, captchaPresent, SubmitButtonNotPresent }
            // return executeQuery(lessthanthreeQuery);
            // }).then((results)=>{
            //     lessThanThreeFields = results[0].countlessthanthree;
            //     return { totalCount, formsNotFound, captchaPresent, SubmitButtonNotPresent, lessThanThreeFields }
        })
        .catch((error) => {
            console.log(error);
        });

    return stats
}

module.exports = { getStatistics, getFormFields }