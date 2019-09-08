'use strict';

var axios = require('axios');
var path = require('path');
var config = require(path.join(__dirname, '../', '/config.json'));
var count = 0;

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

exports.GetQuestion = function (id, callback) {
    axios.get(config.database_url + '/questions/' + id).then(function (value) {
        callback(null, value)
    }).catch(function (reason) {
        callback(reason, null)
    })
};

exports.GetAnswerOfQuestion = function (answerIds, callback) {
    axios.get(config.database_url + '/answers',{
        params:{
            "_in":answerIds
        }
    }).then(function (value) {
        callback(null, value)
    }).catch(function (reason) {
        callback(reason, null)
    })
};

exports.CreateSession = function (title, callback) {
  axios.post(config.database_url + '/sessions',{
        title : "The Quiz Game" + count++,

  })
};