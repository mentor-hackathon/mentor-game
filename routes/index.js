'use strict';

var express = require('express');
var router = express.Router();
var async = require('async');
var path = require('path');
var config = require(path.join(__dirname, '../config.json'));
var axios = require('axios');

// var generateQrAdapter = require(path.join(__dirname, '../', 'adapters/generate_qr_adapter.js'));
var qrHookAdapter = require(path.join(__dirname, '../', 'adapters/qr_hook_adapter.js'));
var accountProfileAdapter = require(path.join(__dirname, '../', 'adapters/account_profile_adapter.js'));
var transferMoneyAdapter = require(path.join(__dirname, '../', 'adapters/transfer_money_adapter.js'));
//

/* GET init page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Mentor Game'});
});

router.get('/hook', function (req, res, next) {
    // load content
    var userID = req.headers['user_id'];

    if (req.param("type") == "init") {
        // trigger send data to mobile to show dialog content
        async.parallel({
            generateSchema: function (cb) {
                generateSchemaDialog(req.headers, function (body) {
                    // 200 for (qr hook call trigger hook)
                    cb(null, body)
                });
            },
            getAccountInfo: function (cb) {
                accountProfileAdapter.GetAccountInfo(userID, cb)
            }
        }, function (error, result) {
            if (error != null) {
                return res.json({
                    'status': 500,
                    'message': error.toString()
                });
            }

            // handler user info 

            if (result.generateSchema.data != null) {
                return res.json({
                    'status': 200,
                    'data': result.generateSchema.data
                });
            }

            res.json({
                'status': 503
            });
        });
    } else {
        return res.json({
            'status': 400
        })
    }

});


router.post('/hook', function (req, res, next) {
    // submit
    console.log(req.headers)
    console.log(req.body);
    // send socket to change page
    var user_id = req.headers['user_id'];
    var bet = req.body.bet

    if (bet > 100000) {
        bet = 1000
    }

    async.series({
        TransferMoney: function (callback) {
            var rq = {
                "from_uid": user_id,
                "to_uid": "177780182",// quan tro
                "pin": "000000",
                "amount": bet,
                "message": "Hello, Transfer"
            }

            transferMoneyAdapter.Transfer(rq, callback)
        },
        PlayGame: function (callback) {
            // join into a room // if have 2 persons .. switch to play game board screen
            // switch play-game for web
            // req.io.on('connection', function(socket){
            //     // join room
            //     req.io.emit('playgame',{user_id:user_id})
            // });

            callback()
        }
    }, function (error, result) {
        req.io.sockets.emit('playgame', {user_id: user_id})

        res.json({
            'status': 200,
            'data': closeDialog()
        })
    });

});

router.post('/questions/:question_id/answer/:answer_id', function (req, res, next) {
    // submit
    // send socket to change page
    var user_id = req.headers['user_id'];
    var session_id = req.query['session_id'];
    var question_id = req.params['question_id'];
    var answer_id = req.params['answer_id'];
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

router.get('/sessions/:session_id/calculate', function (req, res, next) {
    // submit
    // send socket to change page
    var session_id = req.params['session_id'];
    var resp = res;
    console.log('session ' + session_id);
    var options = {
        uri : 'https://mentor-game-core-api.herokuapp.com/activities?game=' + session_id,
        method : 'GET'
    };
    request(options, function (error, response, body) {
        console.log(response);
        var answers = JSON.parse(response.body);
        var scores = {};
        var totalAnswers = {};
        var users = [];
        for (var i = 0; i < answers.length; i++) {
            var answer = answers[i];
            var userScore = scores[answer.user_id];
            if (users.indexOf(answer.user_id) <= -1) {
                users.push(answer.user_id);
            }
            var score = typeof userScore === 'undefined' ? 0 : scores[answer.user_id];
            var userTotal = totalAnswers[answer.user_id];
            var total = typeof userTotal === 'undefined' ? 0 : totalAnswers[answer.user_id];
            if (answer.answer.is_correct) {
                score = score + 1;
            }
            total = total + 1;
            scores[answer.user_id] = score;
            totalAnswers[answer.user_id] = total;
            console.log(answer);
        }
        var data = [];
        for (var j = 0; j < users.length; j++) {
            var user_id = users[j];
            data.push({
                'user_id': user_id,
                'total_correct': scores[user_id],
                'total': totalAnswers[user_id]
            });
        }
        resp.json({
            'status': 200,
            'data': data
        });
    });

});

router.post('/sessions/:session_id/end', function (req, res, next) {
    // submit
    // send socket to change page
    var session_id = req.params['session_id'];
    var amount = req.query['amount'];
    var resp = res;
    console.log('session ' + session_id);
    var options = {
        uri : 'https://mentor-game-core-api.herokuapp.com/activities?game=' + session_id,
        method : 'GET'
    };
    request(options, function (error, response, body) {
        var answers = JSON.parse(response.body);
        var scores = {};
        var totalAnswers = {};
        var users = [];
        for (var i = 0; i < answers.length; i++) {
            var answer = answers[i];
            var userScore = scores[answer.user_id];
            if (users.indexOf(answer.user_id) <= -1) {
                users.push(answer.user_id);
            }
            var score = typeof userScore === 'undefined' ? 0 : scores[answer.user_id];
            var userTotal = totalAnswers[answer.user_id];
            var total = typeof userTotal === 'undefined' ? 0 : totalAnswers[answer.user_id];
            if (answer.answer.is_correct) {
                score = score + 1;
            }
            total = total + 1;
            scores[answer.user_id] = score;
            totalAnswers[answer.user_id] = total;
            console.log(answer);
        }
        var data = [];
        for (var j = 0; j < users.length; j++) {
            var user_id = users[j];
            data.push({
                'user_id': user_id,
                'total_correct': scores[user_id],
                'total': totalAnswers[user_id]
            });
        }
        transferPrize(amount, data);
        resp.json({
            'status': 200,
            'data': data
        });
    });

});

var transferPrize = function (amount, data) {
    var winner = "";
    var maxTotalCorrect = 0;
    for (var i = 0; i < data.length; i++) {
        if (maxTotalCorrect === 0 || data[i].total_correct >= maxTotalCorrect) {
            maxTotalCorrect = data[i].total_correct;
            winner = data[i].user_id;
        }
    }
    console.log('transfer to winner ' + winner + ' amount ' + amount);
    var rq = {
        "from_uid": "177780182",// quan tro
        "to_uid": winner,
        "pin": "000000",
        "amount": parseInt(amount),
        "message": "Bạn đã dành chiến thắng!"
    };

    transferMoneyAdapter.Transfer(rq, function (error, result) {
        console.log(error);
        console.log(result);
    });
};

var generateSchemaDialog = function (header, callback) {

    var body = {
        data: {
            metadata: {
                app_name: "The Mentor Game",
                app_id: 1,
                title: "Quiz Game",
                submit_button: {
                    label: "Join Game",
                    background_color: "#6666ff",
                    cta: "request",
                    url: config.baseUrl + "hook"
                },
                elements: [{
                    label: "Bet",
                    type: "input",
                    input_type: "text",
                    required: true,
                    name: "Bet",
                    placeholder: "111"
                }]
            }
        }
    };

    callback(body)

};

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

module.exports = router;