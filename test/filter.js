const ab = require('../lib/express-ab');
const cookieParser = require('cookie-parser');
const express = require('express');
const helpers = require('./helpers');
const request = require('supertest');

describe('filter', function() {
  const app = express();
  app.use(cookieParser());

  const abTest1 = ab.test('filter-test-1');
  const abTest2 = ab.test('filter-test-2');

  app.get('/', ab.filter(abTest1), abTest2(), helpers.send('2A'));
  app.get('/', ab.filter(abTest1), abTest2(), helpers.send('2B'));
  app.get('/', helpers.send('fallthrough2'));

  it('should skip test 2 if in test 1', function(done) {
    request(app)
      .get('/')
      .set('Cookie', ['ab=%7B%22filter-test-1%22%3A0%7D'])
      .expect('fallthrough2', done);
  });

  it('should pass filter if in test 2', function(done) {
    request(app)
      .get('/')
      .set('Cookie', ['ab=%7B%22filter-test-2%22%3A1%7D'])
      .expect('2B', done);
  });

  it('should pass filter if not in test 1', function(done) {
    request(app)
      .get('/')
      .expect('2A', done);
  });
});
