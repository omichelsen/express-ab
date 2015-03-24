module.exports = {
    send: function (message) {
        return function (req, res) {
            res.send(message);
        };
    },
    sendAb: function () {
    	return function (req, res) {
    		res.send(res.locals.ab);
    	};
    },
    skipRoute: function (req, res, next) {
        next('route');
    },
    setReqVar: function (req, res, next) {
        if (!req.ab) {
            req.ab = {
                random: req.get('ab-random'),
                weightSum: 0
            };
        }
        next();
    }
};