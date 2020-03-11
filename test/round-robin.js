const ab = require('../lib/express-ab');
const express = require('express');
const helpers = require('./helpers');
const request = require('supertest');

describe('round robin', function() {
  const app = express();
  const abTest = ab.test('unit-test');

  app.get('/', abTest(), helpers.send('variantA'));
  app.get('/', abTest(), helpers.send('variantB'));

  describe('variant selection', function() {
    it('should select route A in first call', function(done) {
      request(app)
        .get('/')
        .expect(200)
        .expect('variantA', done);
    });

    it('should select route B in second call', function(done) {
      request(app)
        .get('/')
        .expect(200)
        .expect('variantB', done);
    });

    it('should select route A in third call', function(done) {
      request(app)
        .get('/')
        .expect(200)
        .expect('variantA', done);
    });
  });
});
