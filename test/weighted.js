var ab = require('../lib/express-ab');
var assert = require('assert');
var express = require('express');
var helpers = require('./helpers');
var request = require('supertest');

describe('weighted', function () {
    function setReqVarMiddleware(req, res, next) {
        if (!req.ab) {
            req.ab = {
                random: req.get('ab-random'),
                weightSum: 0
            };
        }
        next();
    }

    var app = express();

    describe('variant selection', function () {
        var abTest = ab.test('variant-test');

        app.get('/', setReqVarMiddleware, abTest(null, 0.2), helpers.send('variantA'));
        app.get('/', setReqVarMiddleware, abTest(null, 0.8), helpers.send('variantB'));
        app.get('/random', abTest(null, 1), function (req, res) {
            res.send(req.ab);
        });

        it('should set ab object on req', function (done) {
            request(app)
                .get('/random')
                .expect(function (res) {
                    assert('random' in res.body);
                    assert('weightSum' in res.body);
                })
                .end(done);
        });

        it('should select route A', function (done) {
            request(app)
                .get('/')
                .set('ab-random', 0.11)
                .expect(200)
                .expect('variantA', done);
        });

        it('should select route B', function (done) {
            request(app)
                .get('/')
                .set('ab-random', 0.42)
                .expect(200)
                .expect('variantB', done);
        });
    });

    describe('fallthrough', function () {
        var abTest = ab.test('fallthrough-test');

        app.get('/fallthrough', setReqVarMiddleware, abTest('a', 0.3), helpers.send('variantA'));
        app.get('/fallthrough', setReqVarMiddleware, abTest('b', 0.3), helpers.send('variantB'));
        app.get('/fallthrough', setReqVarMiddleware, abTest('c'), helpers.send('variantC'));

        it('should fallthrough to non-weighted path', function (done) {
            request(app)
                .get('/fallthrough')
                .set('ab-random', 0.66)
                .expect('variantC', done);
        });
    });
});