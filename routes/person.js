var express = require('express');
var router = express.Router();

var person = require('../person');

const _ = require('lodash');

/* GET person page. */
router.get('/', function(req, res, next) {
    console.log(req.query);
    person.findPersons({id: req.query.id}, 0, 50).then(function(people) {
        res.render('person', { title: 'person-get', people: people });
    });
});

module.exports = router;
