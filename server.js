require('dotenv').config()
const express = require('express')
const {associateCheckoutIdWithCart} = require("./dal");
const {getUserByPhone} = require("./dal");
const {getCart} = require("./dal");
const {associateTraitUserIdWithViewerId} = require("./dal");
const {addOrUpdateTraits} = require("./dal");
const {createCheckout} = require("./rapyd-service");
const {createCustomer} = require('./rapyd-service')
const {addUser} = require('./dal');
const cors = require('cors');
const {getCartWithItemsByRapydCheckoutId} = require("./dal");

const app = express()
app.use(express.json());
app.use(cors({origin: '*'}));
const port = process.env.PORT

app.get('/healthz', async (req, res) => {
   res.json({status: 'ok'});
});

// register new user -- Merchant calls this
app.post('/customer', async (req, res) => {
    const {phone, custName} = req.body;
    const resp = await createCustomer(custName, phone);
    const rapydCusId = resp.data['data']['id'];
    console.log(`rapyd create customer: ${JSON.stringify(rapydCusId)}`);
    await addUser({phone, rapydCusId, custName});
    res.json({status: 'ok'});
});

// compute abandoned cart to recover via the ad
app.post('/ads', async (req, res) => {
    try {
        const {userId, viewerId} = req.body;
        // associate viewerId with userId
        await associateTraitUserIdWithViewerId(viewerId, userId);
        // get cart for userId
        const cart = await getCart(userId);
        // console.log(`cart: ${JSON.stringify(cart)}`);
        // create rapyd checkout
        const account = await getUserByPhone(userId)
        // console.log(`userAccount for ${userId}: ${JSON.stringify(account)}`);
        const checkout = await createCheckout(account.rapydCusId, cart.total);
        await associateCheckoutIdWithCart(cart.cartId, checkout.data.data.id);
        // console.log(`create new rapydCheckout: ${JSON.stringify(checkout.data)}`);
        res.json({type: 'checkout', id: checkout.data.data.id})
    } catch (e) {
        console.log(`err:${e}`);
        res.json({status: 'failed'});
    }
})

app.get('/cart', async (req, res) => {
    console.log(`req params: ${JSON.stringify(req.query)}`);
    const rapydCheckoutId = req.query.id;
    if (rapydCheckoutId.length === 0) {
        res.json({status: 'checkout id should not be empty'});
    } else {
        const cart = await getCartWithItemsByRapydCheckoutId(rapydCheckoutId);
        res.json({...cart});
    }
});

// ingest trait events for viewer -- publisher
app.post('/trait', async (req, res) => {
    const {viewerId, traits} = req.body;
    await addOrUpdateTraits({traits, viewerId});
    res.json({status: 'ok'});
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

