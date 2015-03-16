var ab = require('../lib/express-ab');
var cookieParser = require('cookie-parser');
var express = require('express');
var helpers = require('./helpers');
var request = require('supertest');

describe('cookies', function () {
    describe('selection', function () {
        var app = express();
        app.use(cookieParser());

        var abTest = ab.test('unit-test');

        app.get('/', abTest(), helpers.send('variantA'));
        app.get('/', abTest(), helpers.send('variantB'));

        it('should save cookies', function (done) {
            request(app)
                .get('/')
                .expect('set-cookie', 'ab=%7B%22unit-test%22%3A0%7D; Path=/', done);
        });

        it('should select route B from cookie', function (done) {
            request(app)
                .get('/')
                .set('Cookie', ['ab=%7B%22unit-test%22%3A1%7D'])
                .expect(200)
                .expect('variantB', done);
        });
    });

    describe('rename', function () {
        var app = express();
        app.use(cookieParser());

        var abTest = ab.test('unit-test', {cookie: {name: 'testName'}});

        app.get('/', abTest(), helpers.send('variantA'));

        it('should save cookie under new name', function (done) {
            request(app)
                .get('/')
                .expect('set-cookie', 'testName=%7B%22unit-test%22%3A0%7D; Path=/', done);
        });
    });
});