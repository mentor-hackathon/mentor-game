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
    stravpiAdapter.GetQuestion(id, function (error, questionDetail) {
        if (error != null) {
            return res.json({
                'status': 500,
                'message': error.toString(),
            })
        }

        res.json({
            'status': 200,
            'data':generateQuestionDetail(questionDetail)
        })
    });
});


var generateQuestionDetail = function (data) {
    if (data == null){
        return
    }
    var hookUrl = config.baseUrl + 'question/' + data.id + '/answer?sessionId=1';

    var options = [];

    for (var i = 0; i < data.length; i++) {
        var o = {
            label: 'Answer ' + (i + 1),
            value: data[i].answer,
        };
        options.push(o)
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
                input_type: "dialog",
                required: true,
                name: data.question,
                placeholder: "111",
                options: options,
            }]
        }
    };

    return body

};

module.exports = router;