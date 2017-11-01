var express = require('express');
var router = express.Router();
var rp = require('request-promise');
var co = require('co');
var jwtDecode = require('jwt-decode');

/* OpenID server variable */
var clientId = process.env.CLIENT_ID;
var clientSecret = process.env.CLIENT_SECRET;
var redirectUri = process.env.REDIRECT_URI;
var tokenUri = process.env.TOKEN_URI;
var userinfoUri = process.env.USERINFO_URI;

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* This function is used to get all kind of token by using code */
function getAllToken(code) {
  return new Promise((resolve, reject) => {
    co(function*() {
      var options = {
        method: 'POST',
        uri: tokenUri,
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

function getAccessToken(refreshToken) {
  return new Promise((resolve, reject) => {
    co(function*() {
      var options = {
        method: 'POST',
        uri: tokenUri,
        auth: {
          'user': clientId,
          'pass': clientSecret
        },
        form: {
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
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

/* This function is used to get user information by using access token */
function getUserinfo(accessToken) {
  return new Promise((resolve, reject) => {
    co(function*() {
      var options = {
        method: 'GET',
        uri: userinfoUri,
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

/* This callback is used to receive authorization code from IdP */
router.get('/cb', function(req, res, next) {
  co(function*() {
    var code = req.query.code;
    var token = JSON.parse(yield getAllToken(code));
    var id_token = jwtDecode(token.id_token);
    var userinfo = JSON.parse(yield getUserinfo(token.access_token));
    return res.render('index.ejs', {
      token: token,
      userinfo: userinfo,
      id_token: id_token
    });
  
  }).catch(function(err) {
    console.log(err);
    return res.render('error.ejs', {
      error: err
    });
  });
});

router.get('/access_token', function(req, res, next) {
  co(function*() {
    var refreshToken = req.query.refresh_token;
    console.log('refresh',refreshToken);
    var token = JSON.parse(yield getAccessToken(refreshToken));
    return res.send(token);
  }).catch(function(err) {
    console.log(err);
  });
});

module.exports = router;
