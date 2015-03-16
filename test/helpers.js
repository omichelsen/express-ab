module.exports = {
    send: function (message) {
        return function (req, res) {
            res.send(message);
        };
    },
    skipRoute: function (req, res, next) {
        next('route');
    }
};