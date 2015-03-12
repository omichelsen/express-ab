var ab = require('../lib/express-ab');
var express = require('express');
var request = require('supertest');

describe('weighted', function () {
    var app = express();
    var abTest = ab.test('unit-test');

    function setReqVarMiddleware(req, res, next) {
        req.ab = {
            random: req.get('ab-random'),
            weightSum: 0
        };
        next();
    }

    app.get('/', setReqVarMiddleware, abTest(null, 0.2), function (req, res) {
        res.status(200).send('variantA');
    });

    app.get('/', setReqVarMiddleware, abTest(null, 0.8), function (req, res) {
        res.status(200).send('variantB');
    });

    describe('variant selection', function () {
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
});