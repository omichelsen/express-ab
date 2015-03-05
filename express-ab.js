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
        options = merge(defaults, opts || {});

    return function (variant) {
        variant = variant || Object.keys(test).length;
        test[variant] = 0;

        return function (req, res, next) {
            var current = test[variant],
                skip;

            res.locals.ab = {
                name: testName,
                id: options.id,
                variantId: variant
            };

            if (options.cookie) {
                var cookie = JSON.parse(req.cookies[options.cookie.name] || '{}');

                if (cookie.hasOwnProperty(testName)) {
                    return cookie[testName] === variant ? next() : next('route');
                }

                cookie[testName] = variant;
                res.cookie(options.cookie.name, JSON.stringify(cookie));
            }

            skip = Object.keys(test).some(function (index) {
                return test[index] < current;
            });
            if (skip) return next('route');

            test[variant]++;
            next();
        };
    };
};

module.exports = ab;
