const puppeteer = require('puppeteer');
const path = require('path');
const pathConfig = require('./config.js');
const saveImage = require('save-image');

function getSiteName(url) {
    var uri = new URL(url),
        prefixName = uri.hostname.replace(/\./g, '_'),
        now = Date.now(),
        ext = 'jpg';

    return `${prefixName}_${now}.${ext}`;
}

function getFaviconName(url) {
    var uri = new URL(url),
        prefixName = uri.hostname.replace(/\./g, '_'),
        filename = uri.pathname.split('/').pop(),
        now = Date.now();

    console.info('url', url);
    return `${prefixName}_${now}_${filename}`;
}

/**
 * 
 * @param {Page} page 
 * @param {String} pageUrl
 * @returns {Promise<String>}
 */
const findBestFaviconURL = async function(page, pageUrl) {
    const uri = new URL(pageUrl);
    const rootUrl = uri.protocol + "//" + uri.host;
    const selectorsToTry = [
        `link[rel="icon"]`,
        `link[rel="shortcut icon"]`
    ];

    let faviconUrlFromDocument = null;
    for (let i = 0; i < selectorsToTry.length; i++) {
        const href = await getDOMElementHRef(page, selectorsToTry[i]);
        if (typeof href === 'undefined' || href === null || href.length === 0) {
            continue;
        }

        faviconUrlFromDocument = href;
        break;
    }

    if (faviconUrlFromDocument && faviconUrlFromDocument.startsWith('data:image')) {
        return faviconUrlFromDocument;
    }

    if (faviconUrlFromDocument === null) {
        // No favicon link found in document, best URL is likley favicon.ico at root
        return rootUrl + "/favicon.ico";
    }

    if (faviconUrlFromDocument.substr(0, 4) === "http" || faviconUrlFromDocument.substr(0, 2) === "//") {
        // absolute url
        return uri.protocol + faviconUrlFromDocument;
    } else if (faviconUrlFromDocument.substr(0, 1) === '/') {
        // favicon relative to root
        return (rootUrl + faviconUrlFromDocument);
    } else {
        // favicon relative to current (src) URL
        return (pageUrl + "/" + faviconUrlFromDocument);
    }
};

/**
 * 
 * @param {Page} page 
 * @param {String} query 
 * @returns {String}
 */
const getDOMElementHRef = async function(page, query) {
    return await page.evaluate((q) => {
        const elem = document.querySelector(q);
        if (elem) {
            return (elem.getAttribute('href') || '');
        } else {
            return "";
        }
    }, query);
};


async function generateScreenshot(url) {
    const browser = await puppeteer.launch();

    const page = await browser.newPage();
    await page.goto(url);

    let relativePagePath = `${pathConfig.page}/${getSiteName(url)}`;
    let fullpath = path.resolve('public', relativePagePath);
    await page.screenshot({ path: fullpath });

    let faviconUrl = await findBestFaviconURL(page, url);

    // base64 图片
    if (faviconUrl.startsWith('data:image')) {
        return { relativePagePath, relativeIconPath: faviconUrl };
    }

    let relativeIconPath = `${pathConfig.icon}/${getFaviconName(faviconUrl)}`;
    let iconFullpath = path.resolve('public', relativeIconPath);
    console.info('iconFullpath', iconFullpath);
    try {
        await saveImage(faviconUrl, iconFullpath);
    } catch (error) {
        console.info('error', error);
        console.info('图标抓取失败', faviconUrl);
        relativeIconPath = `${pathConfig.defaultIcon}`;
    }

    await browser.close();

    return { relativePagePath, relativeIconPath };
}

module.exports = {
    generateScreenshot
};