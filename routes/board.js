var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
    // request
    // numberBoard: number
    // load data question from file store

    // mock data question
    var questions = [{
        'id': 1,
    }, {
        'id': 2,
    },{
        'id': 3,
    },{
        'id': 4,
    },{
        'id': 5,
    },{
        'id': 6,
    },{
        'id': 7,
    },{
        'id': 8,
    }];

    // async generate qr code

    var numberBoard = req.param("numberBoard")

    res.render('board', {
        title: 'Mentor Game', numberBoard: numberBoard, questions: questions
    });
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