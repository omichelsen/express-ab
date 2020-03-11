const ab = require('../lib/express-ab');
const cookieParser = require('cookie-parser');
const express = require('express');
const request = require('supertest');

describe('passive middleware', function() {
  const app = express();
  app.use(cookieParser());

  const abTest = ab.test('unit-test');

  const variants = ['variantA', 'variantB', 'variantC'];
  for (let i = 0; i < variants.length; i++) {
    app.use(abTest(variants[i]));
  }

  app.get('/', abTest.getVariant, function(req, res) {
    res.send(res.locals.ab.variantId);
  });

  it('should assign a cookie and populate res.locals.ab', function(done) {
    request(app)
      .get('/')
      .expect('variantA')
      .expect(
        'set-cookie',
        /^ab=%7B%22unit-test%22%3A%22variantA%22%7D;/,
        done,
      );
  });

  it('should still round robin properly', function(done) {
    request(app)
      .get('/')
      .expect('variantB')
      .expect(
        'set-cookie',
        /^ab=%7B%22unit-test%22%3A%22variantB%22%7D;/,
        done,
      );
  });

  it('should still honor cookies', function(done) {
    request(app)
      .get('/')
      .set('Cookie', ['ab=%7B%22unit-test%22%3A%22variantA%22%7D'])
      .expect('variantA', done);
  });
});
