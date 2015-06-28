var http = require('follow-redirects').https;
var concat = require('concat-stream');
var unexpired = require('unexpired');
var pickit = require('pickit');
var x509 = require('x509');

var CERT_URL = 'https://www.googleapis.com/oauth2/v1/certs';

function fetch(cb) {
  http.get(CERT_URL, function(res) {
    res.pipe(concat(function(body) {
      try {
        cb(null, parse(body));
      } catch (e) {
        cb(new Error(e));
      }
    })).on('error', cb);
  }).on('error', cb);
}

function parse(body) {
  var certs = JSON.parse(body);
  var parsedCerts = [] ;
  for (var i in certs) {
    /* istanbul ignore else */
    if(certs.hasOwnProperty(i)) {
      var parsedCert = x509.parseCert(certs[i]);
      // console.log(parsedCert);
      parsedCerts.push(parsedCert);
    }
  }
  return parsedCerts;
}

function latestExpiration(certArray) {
  return pickit.max(certArray, 'notAfter').notAfter;
}

function chooseCert(certArray) {
  var now = new Date().getTime();
  var limit = now + 30000;
  for (var i = 0; i < certArray.length; i ++) {
    var cert = certArray[i];
    if (now > cert.notBefore.getTime() && limit < cert.notAfter.getTime()) {
      return cert;
    }
  }
  throw new Error('no certs are valid right now');
}

function make() {
  var fetchArray = unexpired({
    fetch: fetch,
    buffer: '30 seconds',
    prefetch: '5 hours',
    retry: '20 minutes',
    expires: latestExpiration,
    copy: chooseCert
  });

  return unexpired({
    fetch: fetchArray,
    buffer: '30 seconds',
    prefetch: '5 hours',
    retry: '20 minutes',
    expires: 'notAfter'
  });
}

module.exports = make;
