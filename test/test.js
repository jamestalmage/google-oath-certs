describe('google-oath-certs', function() {
  var sinon = require('sinon');
  var nock = require('nock');
  var assert = require('assert');

  var CERT_HOST = 'https://www.googleapis.com';
  var CERT_PATH = '/oauth2/v1/certs';

  var createFetch = require('../new');

  var sampleDates = [
    // sample 1
    {
      notBefore: new Date('Mon Jun 15 2015 05:28:34 GMT-0400 (EDT)'),
      notAfter: new Date('Tue Jun 16 2015 18:28:34 GMT-0400 (EDT)')
    },
    {
      notBefore: new Date('Tue Jun 16 2015 05:13:34 GMT-0400 (EDT)'),
      notAfter: new Date('Wed Jun 17 2015 18:13:34 GMT-0400 (EDT)')
    },

    // sample2
    {
      notBefore: new Date('Fri Jun 26 2015 02:43:34 GMT-0400 (EDT)'),
      notAfter: new Date('Sat Jun 27 2015 15:43:34 GMT-0400 (EDT)')
    },
    {
      notBefore: new Date('Sat Jun 27 2015 02:28:34 GMT-0400 (EDT)'),
      notAfter: new Date('Sun Jun 28 2015 15:28:34 GMT-0400 (EDT)')
    }
];

  var sampleTimes = sampleDates.map(function(val){
    return {
      notBefore: val.notBefore.getTime(),
      notAfter: val.notAfter.getTime()
    };
  });

  var sampleCert = require('./sample-certificate.json');
  var sampleCert2 = require('./sample-certificate2.json');

  var clock, scope, fetch;


  before(function() {
    nock.disableNetConnect();
    scope = nock(CERT_HOST);
  });

  beforeEach(function() {
    clock = sinon.useFakeTimers('Date');
    fetch = createFetch();
  });

  afterEach(function() {
    clock.restore();
    scope.done();
  });

  after(function() {
    nock.enableNetConnect();
    nock.cleanAll();
    nock.restore();
  });

  it('fetches and returns the 1st cert', function(done) {
    clock.tick(sampleTimes[0].notBefore+1);
    scope.get(CERT_PATH).once().reply(200, sampleCert);
    fetch(function(err, result){
      if(err) {
        return done(err);
      }
      assert.equal(result.notBefore.getTime(), sampleTimes[0].notBefore);
      done();
    });
  });

  it('fetches and returns the 2nd cert', function(done) {
    clock.tick(sampleTimes[0].notAfter+1);
    scope.get(CERT_PATH).once().reply(200, sampleCert);
    fetch(function(err, result){
      if(err) {
        return done(err);
      }
      assert.equal(result.notBefore.getTime(), sampleTimes[1].notBefore);
      done();
    });
  });

  it('returns both certs over time', function(done) {
    clock.tick(sampleTimes[0].notBefore+1);
    scope.get(CERT_PATH).once().reply(200, sampleCert);
    scope.get(CERT_PATH).once().reply(200, sampleCert2);
    fetch(function(err, result){
      if(err) {
        return done(err);
      }
      assert.equal(result.notBefore.getTime(), sampleTimes[0].notBefore);
      test2();
    });

    function test2(){
      console.log('test2');
      clock.tick(sampleTimes[0].notAfter - sampleTimes[0].notBefore);
      fetch(function(err, result){
        if(err) {
          return done(err);
        }
        assert.equal(result.notBefore.getTime(), sampleTimes[1].notBefore);
        test3();
      });
    }

    function test3(){
      console.log('test3');
      clock.tick(sampleTimes[2].notBefore - sampleTimes[0].notAfter);
      fetch(function(err, result){
        if(err) {
          return done(err);
        }
        assert.equal(result.notBefore.getTime(), sampleTimes[2].notBefore);
        done();
      });
    }
  });

  it('not JSON throws an error', function(done) {
    clock.tick(sampleTimes[1].notAfter+1);
    scope.get(CERT_PATH).reply(200, "not json");
    fetch(function(err, result){
      if(err) {
        return done();
      }
      done(new Error('should have returned error, got: ' + result));
    });
  });

  it('expired certificates throw an error', function(done) {
    clock.tick(sampleTimes[1].notAfter+1);
    scope.get(CERT_PATH).reply(200, sampleCert);
    fetch(function(err, result){
      if(err) {
        return done();
      }
      done(new Error('should have returned error, got: ' + result));
    });
  });
});


