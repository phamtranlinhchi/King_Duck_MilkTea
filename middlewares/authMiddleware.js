const asyncHandle = require('./asyncHandle');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const ErrorResponse = require('../common/ErrorResponse');

module.exports.protect = asyncHandle(async (req, res, next) => {
    if (req.signedCookies) {
        const token = req.signedCookies[process.env.LABEL_ACCESS_TOKEN];
        // const token = req.headers.authorization.split(' ')[1];
        jwt.verify(token, process.env.PRIVATE_KEY, function (err, decoded) {
            if (err) return next(new ErrorResponse('Invalid token'), 401);
            else return next();
        });
    } else {
        next(new ErrorResponse('Not authorized', 401));
        return res.redirect('./auth/login');
    }
});

module.exports.admin = asyncHandle(async (req, res, next) => {
    const token = req.signedCookies[process.env.LABEL_ACCESS_TOKEN];
    jwt.verify(token, process.env.PRIVATE_KEY, async function (err, decoded) {
        const user = await User.findOne({ username: decoded.username });
        if (user.role === 'admin') {
            return next();
        }
        return next(new ErrorResponse('Not admin', 401));
    });
});