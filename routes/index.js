var express = require('express');
var router = express.Router();
var rp = require('request-promise');
var co = require('co');

/* OpenID server variable */
var clientId = 'test';
var clientSecret = 'testSecret';
var redirectUri = 'http://localhost:3000/cb';
var grant_type = 'authorization_code';

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

function getToken(code) {
  return new Promise((resolve, reject) => {
    co(function*() {
      var options = {
        method: 'POST',
        uri: 'https://tutorial-h1.dev.ekoapp.com/oauth/token',
        auth: {
          'user': clientId,
          'pass': clientSecret
        },
        form: {
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: redirectUri
        },
      };
      var response = yield rp(options);
      return resolve(response);
    }).catch(function(err) {
      return reject(err);
    });
  });
}

function getUserinfo(accessToken) {
  return new Promise((resolve, reject) => {
    co(function*() {
      var options = {
        method: 'GET',
        uri: 'https://tutorial-h1.dev.ekoapp.com/userinfo',
        "headers": {
          "Authorization": "Bearer " + accessToken,
        }
      };
      var response = yield rp(options);
      return resolve(response);
    }).catch(function(err) {
      return reject(err);
    });
  });
}

router.get('/cb', function(req, res, next) {
  co(function*() {
    var code = req.query.code;

    var token = JSON.parse(yield getToken(code));
    console.log(token.access_token);
    var userinfo = yield getUserinfo(token.access_token);
    console.log(userinfo);
    return res.send(token.access_token);
  
  }).catch(function(err) {
    console.log(err);
  });
});


router.post('/cb', function(req, res, next) {
  co(function*() {
    console.log(req.body);    
  }).catch(function(err) {
    console.log(err);
  });
  res.send('post');
});

module.exports = router;
