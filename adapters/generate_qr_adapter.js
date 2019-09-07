var axios = require('axios');

exports.GenerateCustomerQr = function (data, callback) {
    axios.get('https://api.qrserver.com/v1/create-qr-code', {
            params: {
                data:{
                    callback_url: data.callback_url, // https://qr.id.vin/hook?url=http://127.0.0.1:3000&method=GET
                    category: data.category,
                    total_question: data.total_question
                },
                size:data.size
            }
        }
    ).then(function (result) {
        callback(result, null)
    }).catch(function (err) {
        console.log(err);
        callback(null, err)
    })
};