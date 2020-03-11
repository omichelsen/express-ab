const ab = require('../lib/express-ab');
const assert = require('assert');
const cookieParser = require('cookie-parser');
const express = require('express');
const helpers = require('./helpers');
const request = require('supertest');

describe('initialization', function() {
  let app;
  let abTest;

  describe('constructor', function() {
    before(function() {
      ab({ cookie: false });

      app = express();
      app.use(cookieParser());
      abTest = ab.test('unit-test');
      app.get('/', abTest(), helpers.send('variantA'));
    });

    after(function() {
      ab({ cookie: { name: 'ab' } });
    });

    it('should not send cookies', function(done) {
      request(app)
        .get('/')
        .expect(function(res) {
          if ('set-cookie' in res.headers) return 'set-cookie is present';
        })
        .end(done);
    });
  });

  describe('test()', function() {
    it('should throw if unnamed', function() {
      assert.throws(ab.test);
    });
  });
});
