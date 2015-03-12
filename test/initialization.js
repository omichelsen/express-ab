var ab = require('../lib/express-ab');
var assert = require('assert');

describe('initialization', function () {
    describe('test()', function () {
        it('should throw if unnamed', function () {
            assert.throws(ab.test);
        });
    });
});