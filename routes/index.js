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