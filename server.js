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
const {getAllCart} = require("./dal");
const {markCartRecovered} = require("./dal");
const {getAllTraits} = require("./dal");
const {getCartWithItemsByRapydCheckoutId} = require("./dal");

const app = express()
app.use(express.json());
app.use(cors({origin: '*'}));
const port = process.env.PORT

// render api health check
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

// compute abandoned cart to recover via the ad -- ad frontend
app.post('/ads', async (req, res) => {
    try {
        const {userId, viewerId} = req.body;
        await associateTraitUserIdWithViewerId(viewerId, userId);
        const cart = await getCart(userId);
        const account = await getUserByPhone(userId)
        const checkout = await createCheckout(account.rapydCusId, cart.total);
        await associateCheckoutIdWithCart(cart.cartId, checkout.data.data.id);
        res.json({type: 'checkout', id: checkout.data.data.id})
    } catch (e) {
        console.log(`err:${e}`);
        res.json({status: 'failed'});
    }
})

// get cart by rapydCheckoutId -- ad frontend
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

// poll customer tracker -- dashboard
app.get('/trait/poll', async (req, res) => {
    const traits = await getAllTraits();
    res.json({data: traits});
});

// called after checkout success -- ad frontend
app.post('/recovered', async (req, res) => {
    const rapydCheckoutId = req.body.rapydCheckoutId;
    await markCartRecovered(rapydCheckoutId);
    res.json({status: 'ok'});
});

// called to get cart status -- dashboard
app.get('/cart/poll', async (req, res) => {
    const data = await getAllCart();
    res.json({data});
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

