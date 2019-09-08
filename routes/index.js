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
    //
    // async.series({
    //     getToken:function(callback){
    //         callback()
    //     },
    //     TransferMoney:function (callback) {
    //         // transfer money for quan tro
    //         callback()
    //     },
    //     PlayGame:function (callback) {
    //         // join into a room // if have 2 persons .. switch to play game board screen
    //         // switch play-game for web
    //         req.io.on('connection', function(socket){
    //             // join room
    //             req.io.emit('playgame',{user_id:user_id})
    //         });
    //
    //         callback()
    //     }
    // },function (error, result) {
    //     res.json({
    //         'status': 200,
    //         'data': closeDialog()
    //     })
    // });
    //
    req.io.sockets.emit('playgame',{user_id:user_id})

    res.json({
        'status': 200,
        'data': closeDialog()
    });


});

var generateSchemaDialog = function (header, callback) {
    // validate header data

    // var header_fake = {
    //     "Content-Type": "Application/json",
    //     user_id: 45,
    //     device_id: "11",
    //     scanner_version: "1",
    //     os_version: "1",
    //     timestamp: 111111111111,
    //     session: "session"
    // };
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
        data: {
            metadata: {
                app_name: "The Mentor Game",
                app_id: 1,
                title: "Quiz Game",
                submit_button: {
                    label: "Close",
                    background_color: "#6666ff",
                    cta: "close",
                    url:""
                }
            }
        }
    };

    return body;
};

module.exports = router;