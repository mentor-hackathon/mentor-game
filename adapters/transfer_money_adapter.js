'use strict';

var axios = require('axios')
var path = require('path');
var config = require(path.join(__dirname, '../', '/config.json'));

exports.Transfer = function (data, callback) {
    axios.post(config.transferUrl + '/transfer', data, {
        headers: {
            'Authorization': 'Basic bWVudG9yOjEyMzQ1Ng==',
            'X-Device-ID': 'a7ce87d6599440a1',
            'Content-Type': 'application/json'
        }
    }).then(function (value) {
        callback(null, value)
    }).catch(function (reason) {
        callback(reason, null)
    });
};

exports.GetToken = function (data, callback) {
    axios.post(config.transferUrl + '/token', {
        "uid": data
    }).then(function (value) {
        callback(null, value)
    }).catch(function (reason) {
        callback(reason, null)
    });
};

exports.GetWallet = function (token, callback) {
    axios.get(config.vinid_uat + '/wallet/v1/wallets', {
        headers: {
            'Authorization': 'Bearer ' + token,
            'X-Device-ID': 'a7ce87d6599440a1',
            'Content-Type': 'application/json'
        }
    }).then(function (value) {
        callback(null, value)
    }).catch(function (reason) {
        callback(reason, null)
    })
};