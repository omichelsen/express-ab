# express-ab

[![Build Status][travis-image]][travis-url]
[![Test Coverage][coveralls-image]][coveralls-url]

Middleware for AB/split/multi-variant testing in [Express](http://expressjs.com/). Allows you to specify multiple variants of an endpoint as a part of an experiment. Remembers which variant the user was assigned using a cookie.

Supports outputting Google Experiments variables (`experimentId` and `experimentVariant`).

## Install

```bash
$ npm install express-ab --save
```

## Usage

Notice that express-ab requires the [cookie-parser](https://www.npmjs.org/package/cookie-parser) middleware to remember which variant the user was served.

```javascript
var express = require('express');
var cookieParser = require('cookie-parser');
var ab = require('express-ab');

var app = express();
app.use(cookieParser());

var myPageTest = ab.test('my-fancy-test');

app.get('/', myPageTest(), function (req, res) {
    res.send('variant A');
});

app.get('/', myPageTest(), function (req, res) {
    res.send('variant B');
});

app.listen(8080);
```

In example above users will be presented with either 'variant A' or 'variant B'. Distribution will be 50/50 in a round-robin fashion.

You can add as many alternative endpoints to your test as you like, e.g. also 'variant C' etc.

### Weighted distribution

The function returned by `ab.test()` (assigned to `myPageTest`), has the following arguments: `myPageTest(variantId[, weight])`

If you prefer to have a custom distribution, you can specify a weight percentage for each variant. This should be in decimal notation, and the sum should be 1.

```javascript
app.get('/', myPageTest(null, 0.2), function (req, res) {
    res.send('variant A');
});

app.get('/', myPageTest(null, 0.8), function (req, res) {
    res.send('variant B');
});
```

In this example variant A will be selected 20% of the time, and variant B 80% of the time.

### Google Experiments

If you are using Google Experiments you can add the expriment ID when running the test, and it will be available in the `locals` collection like this:

```javascript
var myPageTest = ab.test('my-fancy-test', { id: 'YByMKfprRCStcMvK8zh1yw' });

app.get('/', myPageTest(), function (req, res) {
    // res.locals.ab.name === 'my-fancy-test'
    // res.locals.ab.id === 'YByMKfprRCStcMvK8zh1yw'
    // res.locals.ab.variantId === 0
    res.send('variant X');
});
```

To use it in your front end, you can expose the `ab` object e.g. on `window`. Then you have to notify Google Analytics that you are running an experiment by setting the following vars:

    ga('set', 'expId', window.ab.id);
    ga('set', 'expVar', window.ab.variantId);

More about setting the experiment variant in Google Analytics is [explained here](https://developers.google.com/analytics/devguides/collection/analyticsjs/experiments).


### Get variant in other routes

If you need the selected variant in other routes not specifically part of the AB test, you can use the middleware function `getVariant()` on the returned test function (assigned to `myPageTest`).

```javascript
app.get('/somepage', myPageTest.getVariant, function (req, res) {
    res.send('variant ' + res.locals.ab.variantId);
});
```

### Usage as passive middleware

If you need the variant information in many routes in your application, and need cookies to be assigned for any/all of them, you can create your variants as general purpose middleware instead of attaching it to specific routes.

```javascript
var variants = ['A', 'B', 'C'];
for (var i = 0; i < variants.length; i++) {
    app.use(myPageTest(variants[i]));
}

app.get('/somepage', myPageTest.getVariant, function(req, res) {
    res.send('variant ' + res.locals.ab.variantId);
});
```

### Disable cookie

If you do not want the user to be sent to the same variant in the test on every return, you can disable cookies like this:

```javascript
var myPageTest = ab.test('my-fancy-test', { cookie: false });
```

Or you can do it for all tests in the constructor:

```javascript
var ab = require('express-ab')({ cookie: false });
```


### Skip route if part of another test

If you are running multiple tests, you can skip routes using `ab.filter(test)`. To create a new test only for users not in the previous test, the code could look something like this:

```javascript
var abTest1 = ab.test('filter-test-1');
var abTest2 = ab.test('filter-test-2');

app.get('/', ab.filter(abTest1), abTest2(), helpers.send('2A'));
app.get('/', ab.filter(abTest1), abTest2(), helpers.send('2B'));
app.get('/', helpers.send('fallthrough2'));
```

In this case, if a user is already in `abTest1`, he will not be able to be in `abTest2` as well. Just remember to include a fall through route.

## Credits

This project was inspired by [abn](https://github.com/NoumanSaleem/abn) by [NoumanSaleem](https://github.com/NoumanSaleem). express-ab removes external dependencies and adds support for Google Experiments variables.

[travis-image]: https://img.shields.io/travis/omichelsen/express-ab/master.svg
[travis-url]: https://travis-ci.org/omichelsen/express-ab
[coveralls-image]: https://img.shields.io/coveralls/omichelsen/express-ab/master.svg
[coveralls-url]: https://coveralls.io/r/omichelsen/express-ab?branch=master
