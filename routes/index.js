var express = require('express');
var router = express.Router();
//var xrayController = require('../Controllers/xrayController');




/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });
router.get('/', function(req, res,next) {
    res.sendfile('views/index.html');
});
router.get('/demo', function(req, res,next) {
    res.sendfile('views/demo.html');
});

module.exports = router;
