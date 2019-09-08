'use strict';

var account_url = 'https://api-uat.vinid.net:6443/account/v1/internal/profile';
var axios = require('axios');
var path = require('path');
var config = require(path.join(__dirname, '../', '/config.json'));

exports.GetAccountInfo = function (user_id, callback) {
    // axios.get(account_url, {
    //     // auth:{
    //     //   username:"account-profile-service",
    //     //   password:"j=wVw=#NWZ7wY7kV",
    //     // },
    //     headers: {
    //         'Authorization': 'Basic ' + config.account_key,
    //         'Content-Type': 'application/json',
    //         'X-User-ID': user_id,
    //         'X-User-ID-Type': 'USER_ID',
    //         'cache-control': 'no-cache',
    //         'Accept': '*/*'
    //     }
    // }).then(function (response) {
    //     console.log(response)
    //     callback(null, response)
    // }).catch(function (error) {
    //     console.log(error)
    //     callback(error, null)
    // });

    var data = {
        'data': {
            'id': 345,
            'phone_number': '0986899787',
            'full_name': 'Lữ Hồng Hải',
            'dob': null,
            "email": "luhonghai@gmail.com",
            "referral_code": "0986899787",
            "referred_by": ""
        },
        "meta": {
            "code": 200
        }
    }

    callback(null,data)
};