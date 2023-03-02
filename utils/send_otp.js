const axios = require('axios');
const createHttpError = require('http-errors');


async function sendOtp(phone) {
    const otp = Math.floor(1000 + Math.random() * 9000);
    const response = (await axios.post('https://msgn.mtalkz.com/api', {
        apikey: "2VOaLcC7YdTSvFl0",
        senderid: "MTAMOI",
        number: phone,
        message: `Your OTP- One Time Password is ${otp} to authenticate your login with CreditDari Powered By mTalkz`,
        format: "json"
    }, { json: true })).data
    if (response['status'] == "OK") {
        return otp
    } else {
        throw new Error(createHttpError(500, response['message']))
    }
}

module.exports = sendOtp