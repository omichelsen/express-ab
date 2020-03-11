const ab = require('../lib/express-ab');
const assert = require('assert');
const express = require('express');
const helpers = require('./helpers');
const request = require('supertest');

describe('weighted', function() {
  let app;
  let abTest;

  describe('variant selection', function() {
    before(function() {
      app = express();
      abTest = ab.test('variant-test');
      app.get(
        '/',
        helpers.setReqVar,
        abTest(null, 0.2),
        helpers.send('variantA'),
      );
      app.get(
        '/',
        helpers.setReqVar,
        abTest(null, 0.8),
        helpers.send('variantB'),
      );
      app.get('/random', abTest(null, 1), function(req, res) {
        res.send(req.ab);
      });
    });

    it('should set ab object on req', function(done) {
      request(app)
        .get('/random')
        .expect(function(res) {
          assert('random' in res.body);
          assert('weightSum' in res.body);
        })
        .end(done);
    });

    it('should select route A', function(done) {
      request(app)
        .get('/')
        .set('ab-random', 0.11)
        .expect(200)
        .expect('variantA', done);
    });

    it('should select route B', function(done) {
      request(app)
        .get('/')
        .set('ab-random', 0.42)
        .expect(200)
        .expect('variantB', done);
    });
  });

  describe('fallthrough catch-all', function() {
    before(function() {
      app = express();
      abTest = ab.test('fallthrough-test');
      app.get(
        '/',
        helpers.setReqVar,
        abTest('a', 0.3),
        helpers.send('variantA'),
      );
      app.get(
        '/',
        helpers.setReqVar,
        abTest('b', 0.3),
        helpers.send('variantB'),
      );
      app.get('/', helpers.setReqVar, abTest('c'), helpers.send('variantC'));
    });

    it('should fallthrough to non-weighted path', function(done) {
      request(app)
        .get('/')
        .set('ab-random', 0.66)
        .expect('variantC', done);
    });
  });

  describe('0%/100% variants', function() {
    before(function() {
      app = express();
      abTest = ab.test('fallthrough-test');
      app.get('/', helpers.setReqVar, abTest('a', 0), helpers.send('variantA'));
      app.get('/', helpers.setReqVar, abTest('b', 1), helpers.send('variantB'));
    });

    it('should always go to variant B when A set to 0', function(done) {
      request(app)
        .get('/')
        .set('ab-random', 0.11)
        .expect('variantB', done);
    });

    it('should always go to variant B when A set to 0', function(done) {
      request(app)
        .get('/')
        .set('ab-random', 1)
        .expect('variantB', done);
    });
  });
});
