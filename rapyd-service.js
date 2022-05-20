const axios = require('axios');
const CryptoJS = require("crypto-js");


const config = {
    accessKey: process.env.RAPYD_ACCESS_KEY,
    secretKey: process.env.RAPYD_SECRET_KEY,
    baseRapydApiUrl: process.env.BASERAPYDAPIURL,
    port: parseInt(process.env.PORT) || 5000,
};

const createRequest = (method, urlPath, body) => {
    const salt = generateRandomString(8);
    const timestamp = (Math.floor(new Date().getTime() / 1000) - 10).toString();
    console.log(body)
    const signature = generateSignature(method, urlPath, salt, timestamp, body);
    const access_key = config.accessKey;
    return {salt, timestamp, signature, access_key, 'Content-Type': 'application/json'};
}

const createCustomer = (name, phone) => {
    const path = '/v1/customers';
    const url = config.baseRapydApiUrl + path;
    const body = {"name":name,"phone_number":phone}
    return axios.post(url, body, {headers: createRequest('post', path, body)});
}

const createCheckout = async (customer, amount) => {
    const path = '/v1/checkout';
    const url = config.baseRapydApiUrl + path;
    const body = {"amount":amount,"country":"IN","currency":"INR","customer":customer,"merchant_reference_id":"OD-100","language":"en","payment_method_type":"in_debit_mastercard_card"}
    return axios.post(url, body, {headers: createRequest('post', path, body)});
}

const generateRandomString = () => {
    try {
        return CryptoJS.lib.WordArray.random(12);
    } catch (error) {
        console.log('Error generating salt');
        throw error;
    }
}

const generateSignature = (method, urlPath, salt, timestamp, body) => {
    try {
        let bodyString = '';
        if (body) {
            bodyString = JSON.stringify(body);
            bodyString = bodyString === '{}' ? '' : bodyString;
        }
        const toSign = method.toLowerCase() + urlPath + salt + timestamp + config.accessKey + config.secretKey + bodyString;
        console.log(`rapyd toSign: ${toSign}`);
        return hashSignature(toSign, config.secretKey);
    } catch (error) {
        console.log('Error generating signature');
        throw error;
    }
}

const hashSignature = (signature, secret) => {
    let rapyd_signature = CryptoJS.enc.Hex.stringify(CryptoJS.HmacSHA256(signature, secret));
    rapyd_signature = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(rapyd_signature));
    return rapyd_signature;
}

module.exports = {
    createCustomer,
    createCheckout
}
