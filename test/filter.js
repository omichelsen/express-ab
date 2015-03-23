var ab = require('../lib/express-ab');
var assert = require('assert');
var cookieParser = require('cookie-parser');
var express = require('express');
var helpers = require('./helpers');
var request = require('supertest');

describe('filter', function () {
    var app = express();
    app.use(cookieParser());

    var abTest1 = ab.test('filter-test-1');
    var abTest2 = ab.test('filter-test-2');

    app.get('/', ab.filter(abTest1), abTest2(), helpers.send('2A'));
    app.get('/', ab.filter(abTest1), abTest2(), helpers.send('2B'));
    app.get('/', helpers.send('fallthrough2'));

    it('should skip test 2 if in test 1', function (done) {
        request(app)
            .get('/')
            .set('Cookie', ['ab=%7B%22filter-test-1%22%3A0%7D'])
            .expect('fallthrough2', done);
    });

    it('should pass filter if in test 2', function (done) {
        request(app)
            .get('/')
            .set('Cookie', ['ab=%7B%22filter-test-2%22%3A1%7D'])
            .expect('2B', done);
    });

    it('should pass filter if not in test 1', function (done) {
        request(app)
            .get('/')
            .expect('2A', done);
    });
});