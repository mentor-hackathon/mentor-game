var axios = require('axios');
var qrCode = require('qrcode');

exports.GenerateCustomerQr = function (callback_url, callback) {
    qrCode.toDataURL(callback_url, {}, function (err, url) {
        callback(err, url)
    })
};

function GenerateCustomerQrPromise(callback_url) {
    return new Promise(function (resolve, reject) {
        qrCode.toDataURL(callback_url, {}, function (err, url) {
            if (err != null) {
                reject(err)
            } else {
                resolve(url)
            }
        })
    });
}

exports.GenerateCustomerQrPromise = GenerateCustomerQrPromise;