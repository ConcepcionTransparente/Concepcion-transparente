var express = require('express');
var router = express.Router();
//var xrayController = require('../Controllers/xrayController');




/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/circle', function(req, res) {
    res.sendfile('views/index.html');
});

module.exports = router;
