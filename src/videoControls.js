import _ from 'lodash';

const videoEl = `document.getElementsByTagName("video")[0]`;

function execOnActiveTab(code, callback=_.noop) {
    chrome.tabs.executeScript({code}, callback);
}
function callOnVideo(method, args=[], callback=_.noop) {
    // call a method on the Youtube <video> element
    if(!_.isArray(args)) args = [];
    execOnActiveTab(`${videoEl}.${method}(${args.join(',')})`, callback);
}
function getVideoProp(key, callback=_.noop) {
    execOnActiveTab(`${videoEl}.${key}`, callback);
}
function setVideoProp(key, value, callback= _.noop) {
    execOnActiveTab(`${videoEl}.${key}=${value}`, callback);
}

const videoControls = _.assign(
    // getters for video properties - get prop keys on <video> object
    _.object(['paused', 'muted'].map(key =>
        [key, (cb) => getVideoProp(key, cb)]
    )),
    // basic controls - proxy to the methods on <video> object
    _.object(['play', 'pause'].map(method =>
        [method, (cb) => callOnVideo(method, [], cb)]
    )),
    // other controls
    {
        mute(callback) {
            setVideoProp('muted', true, callback);
        },
        unMute(callback) {
            setVideoProp('muted', false, callback);
        },
        setSpeed(speed, callback) {
            setVideoProp('playbackRate', speed, callback);
        }
    }
);

export default videoControls;