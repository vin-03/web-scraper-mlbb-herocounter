const puppeteer = require('puppeteer');
const { sleep, getHeroIdFromImageUrl } = require('./utils');
const fs = require('fs');
const { isMainThread } = require('worker_threads');

async function scrapeHero(page, heroId) {
    const url = `https://m.mobilelegends.com/hero/detail?channelid=3054554&heroid=${heroId}`;
    console.log("Scraping hero:", heroId);
    await page.goto(url);

    // obj init
    const heroData = {
        id: heroId,
        counters: [],
        counteredBy: [],
        synergy: [],
        antiSynergy: [],
    }

    await sleep(2000);
    // click on the COUNTERS tab
    try {
        await page.evaluate(() => {
            const spans = document.querySelectorAll('span');
            for (let span of spans) {
                if (span.textContent.trim() === 'COUNTERS') {
                    span.click();
                    return true;
                }
            }
            return false;
        })
        await sleep(1000);
    } catch (e) {
        console.log('Errore click COUNTERS:', e.message);
    }

    // DATA EXTR

    // DATA - counters
    const counters = await page.evaluate(() => {
        const images = document.querySelectorAll('.mt-tab-pane img');
        const imagesUrl = [];

        for (i = 3; i <= 7; i++) {
            if (images[i]) {
                imagesUrl.push(images[i].src);
            }
        }

        return imagesUrl;
    })
    for (i = 0; i < counters.length; i++) {
        heroData.counters.push(getHeroIdFromImageUrl(counters[i]));
    }

    // DATA - synergy
    const synergy = await page.evaluate(() => {
        const images = document.querySelectorAll('.mt-tab-pane img');
        const imagesUrl = [];

        for (i = 10; i <= 14; i++) {
            if (images[i]) {
                imagesUrl.push(images[i].src);
            }
        }

        return imagesUrl;
    })
    for (i = 0; i < synergy.length; i++) {
        heroData.synergy.push(getHeroIdFromImageUrl(synergy[i]));
    }

    // click on the "MOST COUNTERED BY" and "NOT COMPATIBLE"
    try {
        await page.evaluate(() => {
            const spans = document.querySelectorAll('span');
            for (let span of spans) {
                if (span.textContent.trim() === 'Most Countered by') {
                    span.click();
                    return true;
                }
            }
            return false;
        })
        await sleep(500);
    } catch (e) {
        console.log('Errore click "Most Countered by":', e.message);
    }
    try {
        await page.evaluate(() => {
            const spans = document.querySelectorAll('span');
            for (let span of spans) {
                if (span.textContent.trim() === 'Not Compatible') {
                    span.click();
                    return true;
                }
            }
            return false;
        })
        await sleep(500);
    } catch (e) {
        console.log('Errore click "Not Compatible":', e.message);
    }


    // DATA - counteredBy
    const counteredBy = await page.evaluate(() => {
        const images = document.querySelectorAll('.mt-tab-pane img');
        const imagesUrl = [];

        for (i = 3; i <= 7; i++) {
            if (images[i]) {
                imagesUrl.push(images[i].src);
            }
        }

        return imagesUrl;
    })
    for (i = 0; i < counteredBy.length; i++) {
        heroData.counteredBy.push(getHeroIdFromImageUrl(counteredBy[i]));
    }

    // DATA - antiSynergy
    const antiSynergy = await page.evaluate(() => {
        const images = document.querySelectorAll('.mt-tab-pane img');
        const imagesUrl = [];

        for (i = 10; i <= 14; i++) {
            if (images[i]) {
                imagesUrl.push(images[i].src);
            }
        }

        return imagesUrl;
    })
    for (i = 0; i < antiSynergy.length; i++) {
        heroData.antiSynergy.push(getHeroIdFromImageUrl(antiSynergy[i]));
    }

    console.log(heroData)
    return heroData;

}

async function scrapeMultiple(idFrom, idTo) {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    const url = `https://m.mobilelegends.com/hero/detail?channelid=3054554&heroid=1`;
    await page.goto(url);

    await sleep(1000);
    // Gestisci popup Privacy Policy (se presente)
    try {
        await page.waitForSelector('.mt-cb-policy-close', { timeout: 3000 });
        await page.click('.mt-cb-policy-close'); // Click X per chiudere
        console.log('Popup Privacy Policy chiuso');
    } catch (e) {
        console.log('Nessun popup Privacy Policy');
    }
    await sleep(1000);

    // Gestisci popup cookies (se presente)
    try {
        await page.waitForSelector('#mt-cb-p', { timeout: 3000 });
        await page.click('#mt-cb-p'); // Click "Accept All"
        console.log('Popup cookies chiuso');
    } catch (e) {
        console.log('Nessun popup cookies');
    }
    await sleep(1000);

    let heroesCounter = [];

    for (let i = idFrom; i <= idTo; i++) {
        const hero = await scrapeHero(page, i);
        heroesCounter.push(hero);
    }

    console.log(JSON.stringify(heroesCounter, null, 2));
    fs.writeFileSync('./data/heroescounter.json', JSON.stringify(heroesCounter, null, 2))

    await browser.close();
}

scrapeMultiple(1, 10)