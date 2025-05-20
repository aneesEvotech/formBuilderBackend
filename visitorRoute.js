const express = require('express');
const trackerVisitors = require('./middlewares/trackerVisitors.js');
const Visitor = require('./models/visitor.model.js');
const Forms = require('./models/form.model.js');
const Responses = require('./models/response.model.js');
const router = express.Router();

router.post('/track', trackerVisitors, (req, res) => {
    res.json(req.visitorStats);
});

router.get('/count/:url', async (req, res) => {
    try {
        const url = '/' + req.params.url;

        const visitors = await Visitor.find({ url });

        const total = visitors.length;
        const uniqueIPs = new Set(visitors.map(v => v.ip));
        const unique = uniqueIPs.size;

        res.json({ total, unique, data: visitors });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.get("/total", async (req, res) => {
    try {
        const visitors = await Visitor.find({});

        const groupedData = {}; 

        visitors.forEach(visitor => {
            const url = visitor.url;
            if (!url) return;

            if (!groupedData[url]) {
                groupedData[url] = {
                    total: 0,
                    visitors: []
                };
            }
            groupedData[url].total++;
            groupedData[url].visitors.push(visitor);
        });

        const result = Object.entries(groupedData).map(([url, data]) => ({
            url,
            total: data.total,
            visitors: data.visitors 
        }));

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.get("/unique", async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const filter = {};

        // Optional date filtering
        if (startDate || endDate) {
            filter.visitedAt = {};
            if (startDate) filter.visitedAt.$gte = new Date(startDate);
            if (endDate) filter.visitedAt.$lte = new Date(endDate);
        }

        // Get all visitor data based on optional date filter
        const visitors = await Visitor.find(filter);

        // Grouping data
        const groupedData = {};

        visitors.forEach(visitor => {
            const { url, ip } = visitor;
            if (!ip || !url) return;

            // Initialize structure for each URL
            if (!groupedData[url]) {
                groupedData[url] = {
                    ipSet: new Set(),
                    ipToVisitorMap: new Map()
                };
            }

            // Add unique IP and corresponding visitor object (only once per IP)
            if (!groupedData[url].ipSet.has(ip)) {
                groupedData[url].ipSet.add(ip);
                groupedData[url].ipToVisitorMap.set(ip, visitor);
            }
        });

        // Prepare response
        const result = Object.entries(groupedData).map(([url, data]) => ({
            url,
            uniqueVisitors: data.ipSet.size,
            visitors: Array.from(data.ipToVisitorMap.values())  // Only 1 record per IP
        }));

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});




router.get('/getAllmodelsCount', async (req, res) => {
    try {
        const totalForms = await Forms.countDocuments();

        const totalResponses = await Responses.countDocuments();

        const visitors = await Visitor.find({});

        const totalVisitors = visitors.length;
        const uniqueVisitorCombos = new Set(visitors.map(v => `${v.ip}_${v.url}`));
        const uniqueVisitors = uniqueVisitorCombos.size;

        res.json({
            formsCount: totalForms,
            responsesCount: totalResponses,
            visitorCount: {
                totalVisitors,
                uniqueVisitors
            }
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


module.exports = router;