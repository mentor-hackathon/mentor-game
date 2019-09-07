'use strict';

var axios = require('axios');
var path = require('path');
var config = require(path.join(__dirname, '../', '/config.json'));

exports.GetQuestions = function (limit, callback) {
    axios.get(config.database_url + '/questions', {
        params: {
            _limit: limit
        }
    })
        .then(function (value) {
            callback(null, value)
        }).catch(function (error) {
            console.log(error)
             callback(error, null)
    })
};