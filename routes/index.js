var express = require('express');
var router = express.Router();

var person = require('../person');

const _ = require('lodash');

/* GET home page. */
router.get('/', function(req, res, next) {
  person.findPersons({}, 0, 50).then(function(people) {
      res.render('index', { title: 'person-get', people: people });
  });
});

module.exports = router;
