var merge = require('merge');

var defaults = {
    cookie: {
        name: 'ab'
    }
};

function ab(opts) {
    defaults = merge(defaults, opts || {});
    return ab;
}

ab.test = function (testName, opts) {
    if (!testName) throw '.test() requires first parameter "name" (type string)';

    var test = {},
        options = merge(true, defaults, opts || {});

    function respond(req, res, next, variant, skip) {
        if (!skip) {
            res.locals.ab = {
                name: testName,
                id: options.id,
                variantId: variant
            };
        }
        next(skip);
    }

    function create(variant, weight) {
        variant = variant != null ? variant : Object.keys(test).length;
        test[variant] = 0;

        return function (req, res, next) {
            var current = test[variant],
                done = respond.bind(null, req, res, next, variant),
                skip, keys;

            if (weight && !req.ab) {
                req.ab = {
                    random: Math.random(),
                    weightSum: 0
                };
            }

            if (options.cookie && req.cookies) {
                var cookie = JSON.parse(req.cookies[options.cookie.name] || '{}');

                if (cookie.hasOwnProperty(testName)) {
                    return cookie[testName] === variant ? done() : done('route');
                }

                cookie[testName] = variant;
                res.cookie(options.cookie.name, JSON.stringify(cookie));
            }

            if (weight) {
                req.ab.weightSum += weight;
                skip = req.ab.random > req.ab.weightSum;
            } else if (req.ab) {
                skip = false;
            } else {
                keys = Object.keys(test);
                skip = keys.some(function (key) {
                    return test[key] < current;
                });
            }
            if (skip) return done('route');

            test[variant]++;
            done();
        };
    }

    create.getVariant = function (req, res, next) {
        if (options.cookie && req.cookies) {
            var cookie = JSON.parse(req.cookies[options.cookie.name] || '{}');
            if (cookie.hasOwnProperty(testName)) {
                respond(req, res, next, cookie[testName]);
            }
        }
        next();
    };

    return create;
};

ab.filter = function (test) {
    return function (req, res, next) {
        var _res = { locals: {} };
        test.getVariant(req, _res, function () {
            if (_res.locals.ab) {
                next('route');
            } else {
                next();
            }
        });
    };
};

module.exports = ab;
