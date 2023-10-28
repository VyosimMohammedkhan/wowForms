const express = require('express');
const router = express.Router();

const { fillforms } = require('../formfiller')
router.ws('/', async (ws, req) => {

    ws.on('message', async function (msg) {
        console.log("ws socket opened")
        const url = await JSON.parse(msg).formurl;
        const data = await JSON.parse(msg).formdata;
        let results = await fillforms([url], data);
        console.log(results)
        ws.close();
    });
    
});

module.exports = router;