var express = require('express');
var router = express.Router();
var readxls = require('../model/readxls');

/* GET home page. */
router.get('/', function(req, res, next) {
	readxls.read(res);
});

module.exports = router;
