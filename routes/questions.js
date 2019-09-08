'use strict';

var express = require('express');
var router = express.Router();
var async = require('async');
var path = require('path');
var config = require(path.join(__dirname, '../config.json'));
var axios = require('axios');
var stravpiAdapter = require(path.join(__dirname, '../', 'adapters/stravpi_adapter.js'));


router.get('/:id', function (req, res, next) {
    var id = req.params.id;
    var sessionId = req.query.sessionId;

    stravpiAdapter.GetQuestion(id, function (error, questionDetail) {
        if (error != null) {
            return res.json({
                'status': 500,
                'message': error.toString(),
            })
        }

        res.json({
            'status': 200,
            'data': generateQuestionDetail(questionDetail.data, sessionId)
        })
    });
});


var generateQuestionDetail = function (data, sessionId) {
    if (data == null) {
        return
    }

    var hookUrl = config.baseUrl + 'answer?questionId='+ data.id + '&sessionId='+sessionId;

    var options = [];

    var i = 0;
    for (i = 0; i < data['answers'].length; i++) {
        var o = {
            label: data.answers[i].answer,
            value: data.answers[i].id
        };
        options[i] = o
    }

    var body = {
        metadata: {
            app_name: "The Mentor Game",
            app_id: 1,
            title: data.question,
            submit_button: {
                label: "Answer",
                background_color: "#6666ff",
                cta: "request",
                url: hookUrl
            },
            elements: [{
                label: data.question,
                type: "radio",
                display_type: "inline",
                required: true,
                name: 'answer',
                placeholder: "111",
                options: options,
            }]
        }
    };

    return body

};

module.exports = router;