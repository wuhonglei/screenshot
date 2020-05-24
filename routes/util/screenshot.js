const puppeteer = require('puppeteer');
const path = require('path');

function getSiteName(url) {
    var uri = new URL(url),
        prefixName = uri.hostname.replace(/\./g, '_'),
        now = Date.now(),
        ext = 'jpg';

    return `${prefixName}_${now}.${ext}`;
}

async function generateScreenshot(url) {
    const browser = await puppeteer.launch();

    const page = await browser.newPage();
    await page.goto(url);

    let relativePath = `./assets/${getSiteName(url)}`;
    let fullpath = path.resolve('public', relativePath);
    await page.screenshot({ path: fullpath });

    await browser.close();

    return relativePath;
}

module.exports = {
    generateScreenshot
};