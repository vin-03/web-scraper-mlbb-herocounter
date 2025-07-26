const roundIconMap = require('./roundIconMap.json')

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getHeroIdFromImageUrl(imageUrl) {
    return roundIconMap[imageUrl] || null;
}


module.exports = {
    sleep,
    getHeroIdFromImageUrl
}; 