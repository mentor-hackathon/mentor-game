'use strict';

var express = require('express');
var router = express.Router();
var async = require('async');
var path = require('path');
var config = require(path.join(__dirname, '../config.json'));
var axios = require('axios');
var stravpiAdapter = require(path.join(__dirname, '../', 'adapters/stravpi_adapter.js'));
var request = require('request');

router.post('/', function (req, res, next) {
    var answer_id = req.body.answer;
    var question_id = req.query.questionId;
    var session_id = req.query.sessionId;
    var user_id = req.headers['user_id'];
    var resp = res;
    console.log('user ' + user_id + ' answer ' + answer_id + ' question ' + question_id + ' session ' + session_id);
    var options = {
        uri : 'https://mentor-game-core-api.herokuapp.com/activities',
        method : 'POST',
        json: {
            "user_id": user_id,
            "answer": answer_id,
            "game": session_id
        }
    };
    request(options, function (error, response, body) {
        var res = '';
        if (!error && response.statusCode == 200) {
            res = body;
        }
        else {
            res = 'Not Found';
        }
        console.log(res);
        resp.json({
            'status': 200,
            'data': closeDialog()
        });
        req.io.sockets.emit('answer',{user_id:user_id, session_id: session_id, question_id: question_id, answer_id: answer_id });
    });
});

var closeDialog = function () {
    var body = {
        metadata: {
            app_name: "The Mentor Game",
            app_id: 1,
            title: "Quiz Game",
            submit_button: {
                label: "Close",
                background_color: "#6666ff",
                cta: "close",
                url: ""
            }
        }
    };

    return body;
};

module.exports = router