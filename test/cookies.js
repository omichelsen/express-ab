var ab = require('../lib/express-ab');
var cookieParser = require('cookie-parser');
var express = require('express');
var helpers = require('./helpers');
var request = require('supertest');

describe('cookies', function () {
    var app, abTest;

    describe('selection', function () {
        before(function () {
            app = express();
            app.use(cookieParser());
            abTest = ab.test('selection-test');
            app.get('/selection', abTest(), helpers.send('variantA'));
            app.get('/selection', abTest(), helpers.send('variantB'));
            app.get('/selection', abTest(), helpers.send('variantC'));
        });

        it('should save cookies', function (done) {
            request(app)
                .get('/selection')
                .expect('set-cookie', /^ab=%7B%22selection-test%22%3A0%7D;/, done);
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

        it('should not fail on malformed cookie', function (done) {
            request(app)
                .get('/selection')
                .set('Cookie', ['ab=%7B%22selection-test%22%3A%22my-value%22'])
                .expect(200)
                .end(done);
        });
    });

    describe('rename', function () {
        before(function () {
            app = express();
            app.use(cookieParser());
            abTest = ab.test('rename-test', {cookie: {name: 'testName'}});
            app.get('/rename', abTest(), helpers.send('variantC'));
        });

        it('should save cookie under new name', function (done) {
            request(app)
                .get('/rename')
                .expect('variantC')
                .expect('set-cookie', 'testName=%7B%22rename-test%22%3A0%7D; Path=/', done);
        });
    });

    describe('fallthrough to path not in test', function () {
        before(function () {
            app = express();
            app.use(cookieParser());
            abTest = ab.test('fallthrough-test');
            app.get('/', helpers.setReqVar, abTest('a', 0.25), helpers.sendAb());
            app.get('/', helpers.setReqVar, helpers.sendAb());
        });

        it('should not return ab test object to fallthrough', function (done) {
            request(app)
                .get('/')
                .set('ab-random', 0.66)
                .expect({})
                .expect(function (res) {
                    if ('set-cookie' in res.headers) return 'set-cookie is present';
                })
                .end(done);
        });
    });
});