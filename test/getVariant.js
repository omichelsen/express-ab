const ab = require('../lib/express-ab');
const cookieParser = require('cookie-parser');
const express = require('express');
const helpers = require('./helpers');
const request = require('supertest');

describe('getVariant', function() {
  const app = express();
  app.use(cookieParser());

  const abTest = ab.test('unit-test');

  app.get('/', abTest.getVariant, function(req, res) {
    if (res.locals.ab) {
      res.send('variant' + res.locals.ab.variantId);
    } else {
      res.send('no cookie');
    }
  });

  it('should read cookie variant from res.locals.ab', function(done) {
    request(app)
      .get('/')
      .set('Cookie', ['ab=%7B%22unit-test%22%3A42%7D'])
      .expect('variant42', done);
  });

  it('should continue if no cookie is set', function(done) {
    request(app)
      .get('/')
      .expect('no cookie', done);
  });

  it('should continue if no cookie parser is present', function(done) {
    const app = express();
    const abTest = ab.test('unit-test');

    app.get('/', abTest.getVariant, helpers.send('success'));

    request(app)
      .get('/')
      .expect('success', done);
  });
});
