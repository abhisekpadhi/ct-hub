require('dotenv').config()
const express = require('express')
const {createCheckout} = require("./rapyd-service");
const {createCustomer} = require('./rapyd-service')
const {addUser} = require('./dal');

const app = express()
app.use(express.json());
const port = 3010

// register new user -- Merchant calls this
app.post('/', async (req, res) => {
    console.log(`body: ${JSON.stringify(req.body)}`)
    await addUser({phone: req.body.phone, foo: 'bar'});
    res.send('ok')
});

app.post('/customer', async (req, res) => {
    try {
        const resp = await createCustomer(req.body.name, req.body.phone);
        console.log(`data: ${JSON.stringify(resp.data)}`);
    } catch (e) {
        console.error(e);
    }
    res.send(`ok`)
})

// Ingest abandoned cart event -- Merchant
app.get('/cart', async (req, res) => {
    try {
        const res = await createCheckout();
        console.log(`data: ${JSON.stringify(res.data)}`);
    } catch (e) {
        console.error(e.message);
    }
    res.send('ok')
});


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

