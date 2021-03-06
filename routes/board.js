'use strict';

var express = require('express');
var router = express.Router();
var async = require('async');
var path = require('path');
var stravpiAdapter = require(path.join(__dirname, '../', 'adapters/stravpi_adapter.js'));
var generateHookAdapter = require(path.join(__dirname, '../', 'adapters/generate_qr_adapter.js'));
var config = require(path.join(__dirname, '../config.json'));

router.get('/', function (req, res, next) {
    var numberBoard = req.query.limit | 6

    async.waterfall([
        getListQuestion,
        createSession,
        generateQrcode
    ], function (err, result) {
        if (err != null) {
            return res.json({
                'status': 500,
                'message': err.toString(),
            })
        }
        res.render('board', {
            title: 'Mentor Game', numberBoard: result.length, questions: result
        });
    });

    function getListQuestion(callback) {
        stravpiAdapter.GetQuestions(numberBoard, function (error, questions) {
            if (error != null) {
                callback(error, null)
            } else {
                callback(null, questions.data)
            }
        })
    }

    function createSession(questions, callback) {
        var questionIds = [];
        for (var i = 0; i < questions.length; i++) {
            questionIds.push(questions[i].id)
        }

        var data = {
            questions: questionIds
        };

        stravpiAdapter.CreateSession(data, function (error, result) {
            if (error != null) {
                return callback(error, questions, null)
            } else {
                console.log(result)
                return callback(null, questions, result.data)
            }
        })
    }

    function generateQrcode(questions, session, callback) {
        async.mapSeries(questions, function (question, cb) {
            var callback_url = "https://qr.id.vin/hook?url=" + config.baseUrl + "question/" + question.id + "?sessionId=" + session.id + "&method=GET"
            generateHookAdapter.GenerateCustomerQr(callback_url, function (error, qr) {

                cb(null, qr)
            });
        }, function (err, results) {
            callback(null, results)
        });
    }

});



var startCountdown = function (seconds, callback) {
    var counter = seconds;

    var interval = setInterval(function () {
        console.log(counter)
        callback(counter)
        counter--;

        if (counter < 0) {
            clearInterval(interval);
            console.log('Hết Giờ!');
        }
        ;
    }, 1000);
};

module.exports = router;