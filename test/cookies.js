var ab = require('../lib/express-ab');
var cookieParser = require('cookie-parser');
var express = require('express');
var helpers = require('./helpers');
var request = require('supertest');

describe('cookies', function () {
    var app = express();
    app.use(cookieParser());

    describe('selection', function () {
        var abTest = ab.test('selection-test');

        app.get('/selection', abTest(), helpers.send('variantA'));
        app.get('/selection', abTest(), helpers.send('variantB'));
        app.get('/selection', abTest(), helpers.send('variantC'));

        it('should save cookies', function (done) {
            request(app)
                .get('/selection')
                .expect('set-cookie', 'ab=%7B%22selection-test%22%3A0%7D; Path=/', done);
        });

        it('should select route A from cookie', function (done) {
            request(app)
                .get('/selection')
                .set('Cookie', ['ab=%7B%22selection-test%22%3A0%7D'])
                .expect(200)
                .expect('variantA', done);
        });

        it('should select route C from cookie', function (done) {
            request(app)
                .get('/selection')
                .set('Cookie', ['ab=%7B%22selection-test%22%3A2%7D'])
                .expect(200)
                .expect('variantC', done);
        });
    });

    describe('rename', function () {
        var abTest = ab.test('rename-test', {cookie: {name: 'testName'}});

        app.get('/rename', abTest(), helpers.send('variantC'));

        it('should save cookie under new name', function (done) {
            request(app)
                .get('/rename')
                .expect('variantC')
                .expect('set-cookie', 'testName=%7B%22rename-test%22%3A0%7D; Path=/', done);
        });
    });
});