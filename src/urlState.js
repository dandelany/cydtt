import _ from 'lodash';

function setURLHash(hash, callback=_.noop) {
    chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
        const tab = tabs[0];
        const [baseURL, oldHash] = tab.url.split('#');
        if(oldHash && oldHash === hash ) { callback(hash); return; }
        chrome.tabs.update(tab.id, {url: `${baseURL}#${hash}`});
        callback(hash);
    });
}
function getURLHash(callback=_.noop) {
    chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
        const tab = tabs[0];
        const urlParts = tab.url.split('#');
        const hash = urlParts.length >= 2 ?
            _.last(urlParts) : null;
        callback(hash);
    });
}

const urlState = {
    set({songBPM, videoBPM}, callback=_.noop) {
        const hash = `cyd/${videoBPM || ''}/${songBPM || ''}`;
        setURLHash(hash, callback);
    },
    get(callback=_.noop) {
        getURLHash(hash => {
            console.log(hash);
            if(!hash) { callback({}); return; }
            const hashParts = hash.split('/');
            if(hashParts.length >= 3 && hashParts[0] === 'cyd') {
                // good saved state in url, parse and return
                let [id, videoBPM, songBPM] = hashParts;
                videoBPM = _.isNaN(parseFloat(videoBPM)) ? undefined : parseFloat(videoBPM);
                songBPM = _.isNaN(parseFloat(songBPM)) ? undefined : parseFloat(songBPM);
                console.log({videoBPM, songBPM});
                callback({videoBPM, songBPM});
            } else {
                callback({});
            }
        })
    }
};

export default urlState;