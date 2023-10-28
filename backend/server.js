const express = require("express");
const cors = require('cors');
const app = express();
const getData = require('./aggridToMysql')
const getStatistics = require('./getStatistics')
const { fillforms } = require('./formfiller')
const PORT = process.env.PORT || 5000;
const tablename = ` 
FROM hrefkeywords.contactforms AS c
INNER JOIN hrefkeywords.formfields AS f
ON c.id = f.formid 
`

app.use(cors());
app.use(express.json({ limit: "10mb", extended: true }))
app.use(express.urlencoded({ limit: "10mb", extended: true, parameterLimit: 50000 }))


app.get('/getstatistics', (req, res) => {
    getStatistics().then(stats => {
        res.json(stats);
    })

});

app.post('/getformfields', function (req, res) {
    getData(req.body, tablename, (rows, lastRow) => {
        res.json({
            rows: rows, lastRow: lastRow
        });
    });
});

app.post('/fillform', async function (req, res) {
    const urls = (req.body.formurl).split(',')
    const formdata = JSON.parse(req.body.formdata)
    let result = await fillforms(urls, formdata)
    res.json(result);
});

app.get('/fillform', async function (req, res) {
    console.log("working")
    res.send("working")
});

app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`)
})