const mysql = require('mysql');

const connection = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'password'
});


async function getStatistics() {
    const totalCountQuery = `Select count(*) as totalCount from hrefkeywords.contactforms`;
    const formsNotFoundQuery = `Select count(*) as formNotFound from hrefkeywords.contactforms where formfound=0`;
    const captchaFormsQuery = `Select count(*) as captchaPresent from hrefkeywords.contactforms where captchaPresent=1`;
    const submitButtonQuery = `Select count(*) as submitButtonNotPresent from hrefkeywords.contactforms where submitButtonPresent=0`;
    const lessthanthreeQuery = `select count(*) as countlessthanthree from 
    (SELECT count(*) as count from
        hrefkeywords.contactforms AS c
    INNER JOIN
        hrefkeywords.formfields AS f
    ON
        c.id = f.formid
    group by url) as newtable where count<3;`

    let totalCount, formsNotFound, captchaPresent, SubmitButtonNotPresent;

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
            return executeQuery(submitButtonQuery);
        })
        .then((results) => {
            SubmitButtonNotPresent = results[0].submitButtonNotPresent;
            return executeQuery(lessthanthreeQuery);
        }).then((results)=>{
            lessThanThreeFields = results[0].countlessthanthree;
            return { totalCount, formsNotFound, captchaPresent, SubmitButtonNotPresent, lessThanThreeFields }
        })
        .catch((error) => {
            console.log(error);
        });

        return stats
}

module.exports = getStatistics