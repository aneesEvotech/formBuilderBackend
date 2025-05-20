const Visitor = require('../models/visitor.model.js');
const requestIp = require('request-ip');

const trackerVisitors = async (req, res, next) => {
    if (req.path.startsWith('/api/')) {
        return next();
    }

    const ip = requestIp.getClientIp(req);
    const url = req.body.url || req.originalUrl || req.url;
    const ua = req.useragent || {};
    console.log('url' , url)

    try {
        await Visitor.create({
            url,
            ip,
            browser: ua.browser || 'Unknown',
            os: ua.os || 'Unknown',
            device: ua.platform || 'Unknown',
        });
        next();
    } catch (error) {
        console.error('Visitor tracking failed:', error.message);
        next();
    }
};

module.exports = trackerVisitors;