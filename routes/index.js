'use strict';

var express = require('express');
var router = express.Router();
var path = require('path');
// var generateQrAdapter = require(path.join(__dirname, '../', 'adapters/generate_qr_adapter.js'));
var qrHookAdapter = require(path.join(__dirname, '../', 'adapters/qr_hook_adapter.js'));

/* GET init page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Mentor Game'});
});

router.get('/hook', function (req, res, next) {
    // fake hook response
    console.log(1);
    console.log(req.headers); // receive when scan -> hook
    console.log(req.param("type"));

    // load content
    if (req.param("type") == "init") {
        // trigger send data to mobile to show dialog content
        generateSchemaDialog(req.headers, function (body) {
            // 200 for (qr hook call trigger hook)
            console.log('111');
            return res.json({
                'status': 200,
                'data': body.data
            });
        });
    }else {
        return res.json({
            'status':400
        })
    }

});

router.post('/hook',function (req,res,next) {
    if (req.param("type") == "submit") {
        // submit action
        console.log("submit");
        res.render('/boards',{title:'board',numberBoard:9})
    }
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
    console.log(global.baseUrl)
    var body = {
        data: {
            metadata: {
                app_name: "The Mentor Game",
                app_id: 1,
                title: "Quiz Game",
                submit_button: {
                    label: "Join",
                    background_color: "#6666ff",
                    cta: 1,
                    url: global.baseUrl + "/hook?type=submit"
                },
                elements: [{
                    label: "Bet",
                    type: "input",
                    input_type:"text",
                    required: true,
                    name: "Bet 1",
                    placeholder:"111"
                }]
            }
        }
    };

    callback(body)

};

module.exports = router;
