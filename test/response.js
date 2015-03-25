var ab = require('../lib/express-ab');
var express = require('express');
var helpers = require('./helpers');
var request = require('supertest');

describe('response', function () {
    var app, abTest;

    describe('output chosen test', function () {
        before(function () {
            app = express();
            var abTest1 = ab.test('response-test-1');
            var abTest2 = ab.test('response-test-2');
            app.get('/1', abTest1(), helpers.sendAb());
            app.get('/2', abTest2(), helpers.sendAb());
        });

        it('should output req.ab object for variant A', function (done) {
            request(app)
                .get('/1')
                .expect({
                    name: 'response-test-1',
                    variantId: 0
                }, done);
        });

        it('should output req.ab object for variant B', function (done) {
            request(app)
                .get('/2')
                .expect({
                    name: 'response-test-2',
                    variantId: 0
                }, done);
        });
    });

    describe('set id', function () {
        before(function () {
            app = express();
            abTest = ab.test('id-test', { id: 'google' });
            app.get('/', abTest(), helpers.sendAb());
        });

        it('should output google id', function (done) {
            request(app)
                .get('/')
                .expect({
                    name: 'id-test',
                    id: 'google',
                    variantId: 0
                }, done);
        });
    });

    describe('fallthrough to path not in test', function () {
        before(function () {
            app = express();
            abTest = ab.test('fallthrough-test');
            app.get('/', helpers.setReqVar, abTest('a', 0.25), helpers.sendAb());
            app.get('/', helpers.setReqVar, helpers.sendAb());
        });

        it('should not return ab test object to fallthrough', function (done) {
            request(app)
                .get('/')
                .set('ab-random', 0.66)
                .expect({}, done);
        });
    });
});