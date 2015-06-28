# google-oath-certs

[![Build Status](https://travis-ci.org/jamestalmage/google-oath-certs.svg)](https://travis-ci.org/jamestalmage/google-oath-certs)
[![Code Climate](https://codeclimate.com/github/jamestalmage/google-oath-certs/badges/gpa.svg)](https://codeclimate.com/github/jamestalmage/google-oath-certs)
[![Coverage Status](https://coveralls.io/repos/jamestalmage/google-oath-certs/badge.svg)](https://coveralls.io/r/jamestalmage/google-oath-certs)
[![Dependency Status](https://david-dm.org/jamestalmage/google-oath-certs.svg)](https://david-dm.org/jamestalmage/google-oath-certs)
[![devDependency Status](https://david-dm.org/jamestalmage/google-oath-certs/dev-status.svg)](https://david-dm.org/jamestalmage/google-oath-certs#info=devDependencies)

Part of validating google oath tokens includes validating they have been signed with one googles public certificate.
Google issues certificates that expire roughly every 24 hours. This utility simply fetches those certificates for you.
It caches the certificate only fetching it from the google servers as required. 

```javascript
var googleCert = require('google-oath-certs');

googleCert(function(err, cert) {
  // use the cert to validate a token
  // ...
});

```
