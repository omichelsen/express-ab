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

The function returned by `ab.test()` (assigned to `myPageTest`), has the following arguments: `myPageTest(variantId[, weight])`

### Weighted distribution

If you prefer to have a custom distribution, you can specify a percentage for each variant. This should be in decimal notation, and the sum should be 1.

```javascript
app.get('/', myPageTest(null, 0.2), function (req, res) {
    res.end('variant A');
});

app.get('/', myPageTest(null, 0.8), function (req, res) {
    res.end('variant B');
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
    res.end('variant X');
});
```

### Disable cookie

If you do not want the user to be sent to the same variant in the test on every return, you can disable cookies like this:

```javascript
var myPageTest = ab.test('my-fancy-test', { cookie: false });
```

## Credits

This project was inspired by [abn](https://github.com/NoumanSaleem/abn) by [NoumanSaleem](https://github.com/NoumanSaleem). express-ab removes external dependencies and adds support for Google Experiments variables.

## Licence

The MIT License (MIT)

[travis-image]: https://img.shields.io/travis/omichelsen/express-ab/master.svg
[travis-url]: https://travis-ci.org/omichelsen/express-ab
[coveralls-image]: https://img.shields.io/coveralls/omichelsen/express-ab/master.svg
[coveralls-url]: https://coveralls.io/r/omichelsen/express-ab?branch=master
