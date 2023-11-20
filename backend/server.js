const express = require("express");
const cors = require('cors');
const app = express();
const expressWs = require('express-ws')(app);
const getData = require('./aggridToMysql')
const { getStatistics, getFormFields } = require('./getStatistics')
const {splitToArray} = require('./work_functions')
const { fillforms } = require('./formfiller')
const PORT = process.env.PORT || 5000;
// const tablename = `
// FROM hrefkeywords.contactforms C 
// INNER JOIN
// hrefkeywords.formfields F 
// on C.id=F.domain_id
// `

const tablename = `From hrefkeywords.contact_forms`


app.use(cors());
app.use(express.json({ limit: "10mb", extended: true }))
app.use(express.urlencoded({ limit: "10mb", extended: true, parameterLimit: 50000 }))


app.get('/getstatistics', (req, res) => {
    getStatistics().then(stats => {
        res.json(stats);
    })

});

app.get('/getformfields', (req, res) => {
    getFormFields(req.query.url).then(fields => {
        res.json(fields);
    })

});

app.post('/getforms', function (req, res) {
    getData(req.body, tablename, (rows, lastRow) => {
        res.json({
            rows: rows, lastRow: lastRow
        });
    });
});

app.ws('/fillform', async function (ws, req) {
    ws.on('message', async function (data) {

        data = await JSON.parse(data)
        const submitEnabled = data.submitEnabled;
        const urlList = splitToArray(data.formurl);
        const formdata = await JSON.parse(data.formdata);

        let result = await fillforms(ws, urlList, formdata, submitEnabled)
        
        ws.close()
    }) 
});

app.get('/fillform', async function (req, res) {
    console.log("working")
    res.send("working")
});

app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`)
})