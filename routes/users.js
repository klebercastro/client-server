var express = require('express');
var assert = require('assert');
var clients = require('restify-clients');
var router = express.Router();

var client = clients.createJsonClient({
  url: 'http://192.168.0.105:8080',
  version: '~1.0'
});

/* GET users listing. */
router.get("/", function(req, res, next) {
  
  client.get("/users", function (err, request, response, obj) {
    assert.ifError(err);
    res.json(obj);
    
  });

});
router.get('/:id', function(req, res, next) {
  client.get(`/users/${req.params.id}`, function (err, request, response, obj) {
    assert.ifError(err);
    res.json(obj);
  
  });

});
router.put('/:id', function(req, res, next) {
  client.put(`/users/${req.params.id}`, req.body, function (err, request, response, obj) {
    assert.ifError(err);
    res.json(obj);
  
  });

});
router.delete('/:id', function(req, res, next) {
  client.del(`/users/${req.params.id}`, function (err, request, response, obj) {
    assert.ifError(err);
    res.json(obj);
    
  });

});
router.post('/', function(req, res, next) {
  client.post('/users', req.body, function (err, request, response, obj) {
    assert.ifError(err);
    res.json(obj);
    
  });

});

module.exports = router;
