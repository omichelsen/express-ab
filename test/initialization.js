var ab = require('../lib/express-ab')({cookie: false});
var assert = require('assert');
var cookieParser = require('cookie-parser');
var express = require('express');
var request = require('supertest');

describe('initialization', function () {
    describe('constructor', function () {
        var app = express();
        app.use(cookieParser());

        var abTest = ab.test('unit-test');

        app.get('/', abTest(), function (req, res) {
            res.send('variantA');
        });

        it('should not send cookies', function (done) {
            request(app)
                .get('/')
                .expect(function (res) {
                    if ('set-cookie' in res.headers) return 'set-cookie is present';
                })
                .end(done);
        });
    });

    describe('test()', function () {
        it('should throw if unnamed', function () {
            assert.throws(ab.test);
        });
    });
});