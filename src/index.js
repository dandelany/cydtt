import React from 'react';
import ReactDOM from 'react-dom';
import BPM from 'bpm';
import _ from 'lodash';

import {NumberPicker} from 'react-widgets';
import moment from 'moment';
import momentLocalizer from 'react-widgets/lib/localizers/moment';
momentLocalizer(moment);
import numberLocalizer from 'react-widgets/lib/localizers/simple-number.js';
numberLocalizer();


import videoControls from './videoControls';
import urlState from './urlState';

urlState.get();

const Panel = React.createClass({
    getInitialState() {
        return {
            songBPM: undefined,
            videoBPM: undefined,
            tapping: undefined,
            isPaused: false,
            isMuted: false,
            songId: undefined
        }
    },
    componentDidMount() {
        urlState.get(state => {
            this.setBPMState(state, false);
            if(state.songId) this.setState({songId: state.songId});
        });
        videoControls.paused(([isPaused]) => this.setState({isPaused}));
        videoControls.muted(([isMuted]) => this.setState({isMuted}));
    },
    togglePaused() {
        if(this.state.isPaused) videoControls.play(() => this.setState({isPaused: false}));
        else videoControls.pause(() => this.setState({isPaused: true}));
    },
    toggleMuted() {
        if(this.state.isMuted) videoControls.unMute(() => this.setState({isMuted: false}));
        else videoControls.mute(() => this.setState({isMuted: true}));
    },

    setBPMState(state, shouldSetURL=true) {
        this.setState(state, () => {
            const {songBPM, videoBPM} = this.state;
            if(shouldSetURL) this.setURLState();
            const speed = songBPM / videoBPM;
            if(_.isFinite(speed)) {
                this.setState({speed});
                videoControls.setSpeed(speed);
            } else {
                videoControls.setSpeed(1);
            }
        });
    },
    setURLState() {
        urlState.set(this.state);
    },

    onChangeBPM(key, value) {
        this.setState({tapping: undefined});
        if(!_.isNaN(value)) this.setBPMState({[key]: value});
        //if(!_.isNaN(value)) this.setState({[key]: value}, this.updatePlaySpeed);
    },
    onChangeSongBPM(songBPM) {
        this.setState({songBPM}, this.updatePlaySpeed);
        this.setState({tapping: undefined});
    },
    onChangeVideoBPM(videoBPM) {
        this.setState({videoBPM}, this.updatePlaySpeed);
        this.setState({tapping: undefined});
    },
    onSetSongId(e) {
        const songId = this.refs.songId.value;
        if(songId) this.setState({songId}, this.setURLState);
    },

    updatePlaySpeed() {
        const {songBPM, videoBPM} = this.state;
        this.setURLState();
        const speed = this.state.songBPM / this.state.videoBPM;
        if(_.isFinite(speed)) {
            this.setState({speed});
            videoControls.setSpeed(speed);
        }
    },

    setTapping(key) {
        this.setState({tapping: key});
    },

    render() {
        return <div>
            <h2>Can You Dance To This?!</h2>

            <div>
                Video Speed: {this.state.speed ? this.state.speed.toFixed(2) : "1"}
            </div>
            <button>reset</button>

            <div className="section">
                <h4>Video</h4>
                <div>
                    <button onClick={this.togglePaused}>
                        {this.state.isPaused ? 'play' : 'pause'}
                    </button>
                    <button onClick={this.toggleMuted}>
                        {this.state.isMuted ? 'unmute' : 'mute'}
                    </button>
                </div>
                <div className="bpm-input">
                    <NumberPicker
                        value={this.state.videoBPM}
                        onChange={this.onChangeBPM.bind(null, 'videoBPM')}
                        format="#.00"
                        />
                    BPM
                </div>
                <div><button onClick={this.setTapping.bind(null, 'videoBPM')}>tap</button></div>
            </div>

            {this.state.tapping === 'videoBPM' ?
                <TapRegion
                    onChangeBPM={this.onChangeBPM.bind(null, 'videoBPM')}
                    onCancel={this.setTapping.bind(null, undefined)}
                    label="video"
                    />
                : null
            }

            <div className="section">
                <h4>Song</h4>
                {this.state.songId ?
                    this.renderSpotifyEmbed(this.state.songId) : null
                }
                <div>
                    <input ref="songId" type="text" placeholder="spotify track URI"/>
                    <button onClick={this.onSetSongId}>embed</button>
                </div>
                <div className="bpm-input">
                    <NumberPicker
                        value={this.state.songBPM}
                        onChange={this.onChangeBPM.bind(null, 'songBPM')}
                        format="##.00"
                        />
                    BPM
                </div>
                <div><button onClick={this.setTapping.bind(null, 'songBPM')}>Tap BPM</button></div>
            </div>

            {this.state.tapping === 'songBPM' ?
                <TapRegion
                    onChangeBPM={this.onChangeBPM.bind(null, 'songBPM')}
                    onCancel={this.setTapping.bind(null, undefined)}
                    label="song"
                />
                : null
            }
        </div>
    },
    renderSpotifyEmbed(songId) {
        return <iframe
            src={`https://embed.spotify.com/?uri=${songId}`}
            width="250" height="80" frameborder="0" allowtransparency="true"
        />;
    }
});

const TapRegion = React.createClass({
    propTypes: {
        onChangeBPM: React.PropTypes.func,
        onCancel: React.PropTypes.func,
        label: React.PropTypes.string
    },
    getDefaultProps() {
        return {label: 'song'};
    },
    getInitialState() {
        return {bpm: null};
    },
    componentWillMount() {
        this.initBPM();
    },
    initBPM() {
        this.bpmTap = new BPM();
    },

    onClick() {
        let bpm = this.bpmTap.tap().avg;
        bpm = bpm ? +bpm.toFixed(2) : null;
        this.setState({bpm});
    },
    onSave(e) {
        e.stopPropagation();
        this.props.onChangeBPM(this.state.bpm);
    },
    onReset(e) {
        e.stopPropagation();
        this.initBPM();
        this.setState({bpm: null});
    },
    onCancel(e) {
        e.stopPropagation();
        if(this.props.onCancel) this.props.onCancel();
    },
    render() {
        return <div onClick={this.onClick}>
            <h3>{_.isFinite(this.state.bpm) ? this.state.bpm.toFixed(2) : ''} BPM</h3>
            <p>Click in this area to tap the rhythm of the {this.props.label}</p>
            <button onClick={this.onSave}>Save BPM</button>
            <button onClick={this.onReset}>Start over</button>
            <button onClick={this.onCancel}>Cancel</button>
        </div>
    }
});

document.addEventListener('DOMContentLoaded', function() {
    ReactDOM.render(<Panel />, document.getElementById('container'));
});

// beastie boys make some noise
// 98.5

// video
// astaire girl hunt ballet https://www.youtube.com/watch?v=2C9CoAbwxy0
// 67.5

//fresh and clean 166

// uptown funk 115