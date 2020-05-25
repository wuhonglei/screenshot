var express = require('express');
var router = express.Router();
var util = require('./util/screenshot.js');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

router.get('/screenshot', async function(req, res, next) {
    let url = req.query.site;
    let { relativePagePath, relativeIconPath } = await util.generateScreenshot(url);
    console.info('path', path);

    return res.status(200).json({
        pagePath: relativePagePath,
        iconPath: relativeIconPath
    });
});

module.exports = router;