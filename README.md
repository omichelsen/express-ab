# express-js

Middleware for AB/split/multi-variant testing in ExpressJS. Allows you to specify multiple variants of an endpoint as a part of an experiment. Will per default remember which variant the user was assigned with a cookie.

Supports outputting Google Experiments variables (`experimentId` and `experimentVariant`).

## Install

```bash
$ npm install express-ab --save
```

## Usage

_Notice_ that express-js requires the [cookie-parser](https://www.npmjs.org/package/cookie-parser) middleware to remember which variant the user was served.

```javascript
var app = express();
var cookieParser = require('cookie-parser');

server.use(cookieParser());

var myPageTest = ab.test('my-fancy-test');

app.get('/', myPageTest(), function (req, res) {
    res.end('variant A');
});

app.get('/', myPageTest(), function (req, res) {
    res.end('variant B');
});

app.listen(8080)
```

In example above users will be presented with either 'variant A' or 'variant B'. Distribution will be 50/50 in a round-robin fashion.

You can add as many alternative endpoints to your test as you like, e.g. also 'variant C' etc.

### Google Experiments

If you are using Google Experiments you can add the expriment ID when running the test, and it will be available in the `locals` collection like this:

```javascript
var myPageTest = ab.test('my-fancy-test', { id: 'YByMKfprRCStcMvK8zh1yw' });

app.get('/', myPageTest(), function (req, res) {
    // res.locals.ab.name === 'home'
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

This project was inspired by [abn](https://github.com/NoumanSaleem/abn) by [NoumanSaleem](https://github.com/NoumanSaleem). express-js removes external dependencies and adds support for Google Experiments variables.

## Licence

The MIT License (MIT)
