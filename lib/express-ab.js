let defaults = {
  cookie: {
    name: 'ab',
    maxAge: 31536000000,
  },
};

function ab(opts) {
  defaults = { ...defaults, ...opts };
  return ab;
}

function isWeightDefined(weight) {
  return typeof weight === 'number' && weight >= 0 && weight <= 1;
}

ab.test = function(testName, opts) {
  if (!testName) {
    throw new Error('.test() requires first parameter "name" (type string)');
  }

  const test = {};
  const options = { ...defaults, ...opts };

  function getCookie(req) {
    if (options.cookie && req.cookies) {
      try {
        return JSON.parse(req.cookies[options.cookie.name] || '{}');
      } catch (error) {}
    }
  }

  function setCookie(res, variant, cookie) {
    cookie[testName] = variant;
    res.cookie(options.cookie.name, JSON.stringify(cookie), options.cookie);
  }

  function respond(res, next, variant, cookie, skip) {
    if (!skip) {
      res.locals.ab = {
        name: testName,
        id: options.id,
        variantId: variant,
      };
      if (cookie) {
        setCookie(res, variant, cookie);
      }
    }
    next(skip);
  }

  function create(variant, weight) {
    variant = variant != null ? variant : Object.keys(test).length;
    test[variant] = 0;

    return function(req, res, next) {
      const current = test[variant];
      const cookie = getCookie(req);
      const done = respond.bind(null, res, next, variant, cookie);
      let skip;
      let keys;

      if (res.locals.ab) {
        return done('route');
      }

      if (cookie && cookie.hasOwnProperty(testName)) {
        return cookie[testName] === variant ? done() : done('route');
      }

      if (isWeightDefined(weight) && !req.ab) {
        req.ab = {
          random: Math.random(),
          weightSum: 0,
        };
      }

      if (isWeightDefined(weight)) {
        req.ab.weightSum += weight;
        skip = req.ab.random > req.ab.weightSum;
      } else if (req.ab) {
        skip = false;
      } else {
        keys = Object.keys(test);
        skip = keys.some(function(key) {
          return test[key] < current;
        });
      }
      if (skip) return done('route');

      test[variant]++;
      done();
    };
  }

  create.getVariant = function(req, res, next) {
    const cookie = getCookie(req);
    if (cookie && cookie.hasOwnProperty(testName)) {
      return respond(res, next, cookie[testName]);
    }
    next();
  };

  return create;
};

ab.filter = function(test) {
  return function(req, res, next) {
    const _res = { locals: {} };
    test.getVariant(req, _res, function() {
      return !_res.locals.ab ? next() : next('route');
    });
  };
};

module.exports = ab;
