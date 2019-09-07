var axios = require('axios');

exports.SendSchema = function (header, data, callback) {
    // GET https://qr.id.vin/hook?url=[HOOK_URL]&method=[POST/GET]

    axios.get('https://qr.id.vin/hook?url=' + baseUrl + '/?type=submit' + '&method=GET', {
        headers: header,
        params: data
    }).then(function (response) {
        callback(null, response)
    }).catch(function (error) {
        callback(error, null)
    })
};