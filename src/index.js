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
            isMuted: false
        }
    },
    componentDidMount() {
        urlState.get(state => this.setBPMState(state, false));
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

    setBPMState(state, shouldSetURL) {
        this.setState(state, () => {
            const {songBPM, videoBPM} = this.state;
            if(shouldSetURL) urlState.set({songBPM, videoBPM});
            const speed = this.state.songBPM / this.state.videoBPM;
            if(_.isFinite(speed)) {
                this.setState({speed});
                videoControls.setSpeed(speed);
            } else {
                videoControls.setSpeed(1);
            }
        });
    },

    onChangeTextInput(key, e) {
        const value = parseFloat(e.target.value);
        if(!_.isNaN(value)) this.setState({[key]: value}, this.updatePlaySpeed);
    },
    onChangeBPM(key, value) {
        if(!_.isNaN(value)) this.setState({[key]: value}, this.updatePlaySpeed);
    },
    onChangeSongBPM(songBPM) {
        this.setState({songBPM}, this.updatePlaySpeed);
        this.setState({tapping: undefined});
    },
    onChangeVideoBPM(videoBPM) {
        this.setState({videoBPM}, this.updatePlaySpeed);
        this.setState({tapping: undefined});
    },
    updatePlaySpeed() {
        const {songBPM, videoBPM} = this.state;
        urlState.set({songBPM, videoBPM});
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
            <h2>CYDTT</h2>

            <button onClick={this.togglePaused}>
                {this.state.isPaused ? 'play' : 'pause'}
            </button>
            <button onClick={this.toggleMuted}>
                {this.state.isMuted ? 'unmute' : 'mute'}
            </button>

            <div>
                Video Speed: {this.state.speed ? this.state.speed.toFixed(2) : "1"}
            </div>
            <div className="section">
                <h4>Song BPM</h4>
                <div>
                    <NumberPicker
                        value={this.state.songBPM}
                        onChange={this.onChangeBPM.bind(null, 'songBPM')}
                        format="##.00"
                        />
                </div>
                <div><button onClick={this.setTapping.bind(null, 'songBPM')}>tap</button></div>
            </div>
            <div className="section">
                <h4>Video BPM</h4>
                <div>
                    <NumberPicker
                        value={this.state.videoBPM}
                        onChange={this.onChangeBPM.bind(null, 'videoBPM')}
                        format="#.00"
                    />
                </div>
                <div><button onClick={this.setTapping.bind(null, 'videoBPM')}>tap</button></div>
            </div>

            {this.state.tapping === 'songBPM' ?
                <TapRegion
                    onChangeBPM={this.onChangeSongBPM}
                    onCancel={this.setTapping.bind(null, undefined)}
                />
                : null
            }
            {this.state.tapping === 'videoBPM' ?
                <TapRegion
                    onChangeBPM={this.onChangeVideoBPM}
                    onCancel={this.setTapping.bind(null, undefined)}
                />
                : null
            }

        </div>
    }
});

const TapRegion = React.createClass({
    propTypes: {
        onChangeBPM: React.PropTypes.func
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
        const bpm = this.bpmTap.tap().avg;
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
            <p>Click in this area or hit any key to tap the rhythm of the song</p>
            <button onClick={this.onReset}>reset</button>
            <button onClick={this.onSave}>save</button>
            <button onClick={this.onCancel}>cancel</button>
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