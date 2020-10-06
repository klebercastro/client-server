var express = require('express');
var assert = require('assert');
var clients = require('restify-clients');
var router = express.Router();

var client = clients.createJsonClient({
  url: 'http://192.168.0.101:8080',
  version: '~1.0'
});

/* GET users listing. */
router.get('/', function(req, res, next) {
  
  client.get('/users', function (err, request, response, obj) {
    assert.ifError(err);
    res.end(JSON.stringify(obj, null, 2));
    
  });
});

module.exports = router;
