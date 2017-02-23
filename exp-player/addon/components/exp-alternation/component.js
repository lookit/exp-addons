import Ember from 'ember';
import layout from './template';
import ExpFrameBaseUnsafeComponent from '../../components/exp-frame-base-unsafe/component';
import FullScreen from '../../mixins/full-screen';
import VideoRecord from '../../mixins/video-record';

let {
    $
} = Ember;

// Events recorded:
// hasCamAccess
// onConnectionStatus
//    status
// 'stoppingCapture' - immediately before stopping webcam stream
// 'exp-alternation:startTestTrial' - immediately before starting test trial block
// 'leftFullscreen'
// 'enteredFullscreen'
// 'exp-alternation:clearTriangles'
// 'exp-alternation:presentTriangles', {
//                        Lshape: Lshapes[0],
//                        LX: LX,
//                        LY: LY,
//                        LRot: LRot,
//                        LFlip: LFlip,
//                        LSize: LSize,
//                        Rshape: Rshapes[0],
//                        RX: RX,
//                        RY: RY,
//                        RRot: RRot,
//                        RFlip: RFlip,
//                        RSize: RSize
// exp-alternation:startCalibration
//     location
// exp-alternation:startIntro
// pauseVideo (immediately before request to stop recording)
// unpauseVideo (immediately before request to resume recording)

export default ExpFrameBaseUnsafeComponent.extend(FullScreen, VideoRecord,  {
    // In the Lookit use case, the frame BEFORE the one that goes fullscreen must use "unsafe" saves (in order for
    //   the fullscreen event to register as being user-initiated and not from a promise handler) #LEI-369. exp-alternation frames are expected to be repeated, so they need to be unsafe.
    type: 'exp-alternation',
    layout: layout,
    displayFullscreen: true, // force fullscreen for all uses of this component
    fullScreenElementId: 'experiment-player',
    fsButtonID: 'fsButton',
    videoRecorder: Ember.inject.service(),
    recorder: null,
    hasCamAccess: Ember.computed.alias('recorder.hasCamAccess'),
    videoUploadConnected: Ember.computed.alias('recorder.connected'),

    // Track state of experiment
    completedAudio: false,
    completedAttn: false,
    currentSegment: 'intro', // 'calibration', 'test' (mutually exclusive)

    readyToStartCalibration: Ember.computed('hasCamAccess', 'videoUploadConnected', 'completedAudio', 'completedAttn',
        function() {
            return (this.get('hasCamAccess') && this.get('videoUploadConnected') && this.get('completedAudio') && this.get('completedAttn'));
        }),

    // used only by template
    doingCalibration: Ember.computed('currentSegment', function() {
        return (this.get('currentSegment') === 'calibration');
    }),
    doingIntro: Ember.computed('currentSegment', function() {
        return (this.get('currentSegment') === 'intro');
    }),

    isPaused: false,
    hasBeenPaused: false,

    // Timers for intro & stimuli
    introTimer: null, // minimum length of intro segment
    stimTimer: null,

    // Store data about triangles to show, display lengths, etc. in frame
    settings: null,
    triangleBases: null,

    meta: {
        name: 'ExpAlternation',
        description: 'Frame to implement specific test trial structure for geometry alternation experiment. Includes announcement, calibration, and alternation (test) phases. During "alternation," two streams of triangles are shown, in rectangles on the left and right of the screen: one one side both size and shape change, on the other only size changes. Frame is displayed fullscreen and video recording is conducted during calibration/test.',
        parameters: {
            type: 'object',
            properties: {
                context: {
                    type: 'boolean',
                    description: 'True to use big fat triangle as context, or false to use small skinny triangle as context.',
                    default: true
                },
                altOnLeft: {
                    type: 'boolean',
                    description: 'Whether to put the shape+size alternating stream on the left.',
                    default: true
                },
                triangleColor: {
                    type: 'string',
                    description: 'color of triangle outline (3 or 6 char hex, starting with #)',
                    default: '#056090'
                },
                triangleLineWidth: {
                    type: 'integer',
                    description: 'triangle line width in pixels',
                    default: 5
                },
                attnLength: {
                    type: 'number',
                    description: 'minimum amount of time to show attention-getter in seconds',
                    default: 5
                },
                trialLength: {
                    type: 'number',
                    description: 'length of alternation trial in seconds',
                    default: 6
                },
                calibrationLength: {
                    type: 'number',
                    description: 'length of single calibration segment in ms',
                    default: 3000
                },
                audioSources: {
                    type: 'array',
                    description: 'List of objects specifying audio src and type for instructions during attention-getter video',
                    default: [],
                    items: {
                        type: 'object',
                        properties: {
                            'src': {
                                type: 'string'
                            },
                            'type': {
                                type: 'string'
                            }
                        }
                    }
                },
                musicSources: {
                    type: 'array',
                    description: 'List of objects specifying audio src and type for music during attention-getter video',
                    default: [],
                    items: {
                        type: 'object',
                        properties: {
                            'src': {
                                type: 'string'
                            },
                            'type': {
                                type: 'string'
                            }
                        }
                    }
                },
                endAudioSources: {
                    type: 'array',
                    description: 'Supply this to play audio at the end of the trial; list of objects specifying audio src and type',
                    default: [],
                    items: {
                        type: 'object',
                        properties: {
                            'src': {
                                type: 'string'
                            },
                            'type': {
                                type: 'string'
                            }
                        }
                    }
                },
                calibrationAudioSources: {
                    type: 'array',
                    description: 'list of objects specifying audio src and type for calibration audio',
                    default: [],
                    items: {
                        type: 'object',
                        properties: {
                            'src': {
                                type: 'string'
                            },
                            'type': {
                                type: 'string'
                            }
                        }
                    }
                },
                calibrationVideoSources: {
                    type: 'array',
                    description: 'list of objects specifying video src and type for calibration audio',
                    default: [],
                    items: {
                        type: 'object',
                        properties: {
                            'src': {
                                type: 'string'
                            },
                            'type': {
                                type: 'string'
                            }
                        }
                    }
                },
                videoSources: {
                    type: 'array',
                    description: 'List of objects specifying video src and type for attention-getter video',
                    default: [],
                    items: {
                        type: 'object',
                        properties: {
                            'src': {
                                type: 'string'
                            },
                            'type': {
                                type: 'string'
                            }
                        }
                    }
                },
                pauseAudio: {
                    type: 'array',
                    description: 'List of objects specifying audio src and type for audio played when pausing study',
                    default: [],
                    items: {
                        type: 'object',
                        properties: {
                            'src': {
                                type: 'string'
                            },
                            'type': {
                                type: 'string'
                            }
                        }
                    }
                },
                unpauseAudio: {
                    type: 'array',
                    description: 'List of objects specifying audio src and type for audio played when pausing study',
                    default: [],
                    items: {
                        type: 'object',
                        properties: {
                            'src': {
                                type: 'string'
                            },
                            'type': {
                                type: 'string'
                            }
                        }
                    }
                },
                fsAudio: {
                    type: 'array',
                    description: 'List of objects specifying audio src and type for audio played when pausing study if study is not fullscreen',
                    default: [],
                    items: {
                        type: 'object',
                        properties: {
                            'src': {
                                type: 'string'
                            },
                            'type': {
                                type: 'string'
                            }
                        }
                    }
                }
            }
        },
        data: {
            type: 'object',
            properties: {
                altOnLeft: {
                    type: 'boolean'
                },
                videoId: {
                    type: 'string'
                },
                hasBeenPaused: {
                    type: 'boolean'
                }
            }
        }
    },

    calObserver: Ember.observer('readyToStartCalibration', function(frame, key) {
        if (frame.get('readyToStartCalibration') && frame.get('currentSegment') === 'intro') {
            if (!frame.checkFullscreen()) {
                frame.pauseStudy();
            } else {
                frame.set('currentSegment', 'calibration');
            }
        }
    }),

    segmentObserver: Ember.observer('currentSegment', function(frame, key) {
        // Don't trigger starting intro; that'll be done manually.
        if (frame.get('currentSegment') === 'calibration') {
            frame.startCalibration();
        } else if (frame.get('currentSegment') === 'test') {
            frame.startTrial();
        }
    }),

    actions: {

        // When intro audio is complete
        endAudio() {
            this.set('completedAudio', true);
            this.notifyPropertyChange('readyToStartCalibration');
        },

        next() {
            //window.clearInterval(this.get('testTimer'));
            //this.set('testTime', 0);

            if (this.get('recorder')) {
                this.sendTimeEvent('stoppingCapture');
                this.get('recorder').stop();
            }
            this._super(...arguments);
        }

    },

    startIntro() {
        // Allow pausing during intro
        var frame = this;
        $(document).off('keyup.pauser');
        $(document).on('keyup.pauser', function(e) {frame.handleSpace(e, frame);});

        // Start placeholder video right away
        frame.sendTimeEvent('exp-alternation:startIntro');
        $('#player-video')[0].play();

        // Set a timer for the minimum length for the intro/break
        $('#player-audio')[0].play();
        frame.set('introTimer', window.setTimeout(function(){
            frame.set('completedAttn', true);
        }, frame.get('attnLength') * 1000));

    },

    startCalibration() {
        var frame = this;

        // Don't allow pausing during calibration/test.
        $(document).off('keyup.pauser');

        var calAudio = $('#player-calibration-audio')[0];
        var calVideo = $('#player-calibration-video')[0];
        $('#player-calibration-video').show();

        // Show the calibration segment at center, left, right, center, each
        // time recording an event and playing the calibration audio.
        var doCalibrationSegments = function(calList, lastLoc) {
            if (calList.length === 0) {
                $('#player-calibration-video').hide();
                frame.set('currentSegment', 'test');
            } else {
                var thisLoc = calList.shift();
                frame.sendTimeEvent('exp-alternation:startCalibration',
                    {location: thisLoc});
                calAudio.pause();
                calAudio.currentTime = 0;
                calAudio.play();
                calVideo.pause();
                calVideo.currentTime = 0;
                calVideo.play();
                $('#player-calibration-video').removeClass(lastLoc);
                $('#player-calibration-video').addClass(thisLoc);
                window.setTimeout(function(){
                    doCalibrationSegments(calList, thisLoc);
                }, frame.settings.calLength);
            }
        };

        doCalibrationSegments(['center', 'left', 'right', 'center'], '');

    },

    startTrial() {

        var frame = this;

        frame.sendTimeEvent('exp-alternation:startTestTrial');

        // Begin playing music; fade in and set to fade out at end of trial
        var musicPlayer = $('#player-music');
        musicPlayer.prop("volume", 0.1);
        musicPlayer[0].play();
        musicPlayer.animate({volume: 1}, frame.settings.musicFadeLength);
        window.setTimeout(function(){
            musicPlayer.animate({volume: 0}, frame.settings.musicFadeLength);
        }, frame.settings.trialLength * 1000 - frame.settings.musicFadeLength);

        // Start presenting triangles and set to stop after trial length
        frame.presentTriangles( frame.settings.LshapesStart,
                                        frame.settings.RshapesStart,
                                        frame.settings.LsizeBaseStart,
                                        frame.settings.RsizeBaseStart);
        window.setTimeout(function(){
            window.clearTimeout(frame.get('stimTimer'));
            frame.clearTriangles();
            frame.endTrial();
            }, frame.settings.trialLength * 1000);
    },

    // When triangles have been shown for time indicated: play end-audio if
    // present, or just move on.
    endTrial() {


        if (this.get('recorder')) {
            this.sendTimeEvent('stoppingCapture');
            this.get('recorder').stop();
        }

        if (this.get('endAudioSources').length) {
            $('#player-endaudio')[0].play();
        }
        else {
            this.send('next');
        }
    },

    sendTimeEvent(name, opts = {}) {
        var streamTime = this.get('recorder') ? this.get('recorder').getTime() : null;
        Ember.merge(opts, {
            streamTime: streamTime,
            videoId: this.get('videoId')
        });
        this.send('setTimeEvent', `exp-alternation:${name}`, opts);
    },

    onFullscreen() {
        if (this.get('isDestroyed')) {
            return;
        }
        this._super(...arguments);
        if (!this.checkFullscreen()) {
            this.sendTimeEvent('leftFullscreen');
        } else {
            this.sendTimeEvent('enteredFullscreen');
        }
    },



    getRandomElement(arr) {
      return arr[Math.floor(Math.random() * arr.length)];
    },

    getRandom(min, max) {
      return Math.random() * (max - min) + min;
    },



    drawTriangles(Lshape, LX, LY, LRot, LFlip, LSize, Rshape, RX, RY, RRot, RFlip, RSize) {

        var leftTriangle = `${this.triangleBases[Lshape]}
            transform=" translate(${LX}, ${LY})
                        translate(37.5, 56)
                        rotate(${LRot})
                        scale(${LFlip * LSize})" />`;
        var rightTriangle = `${this.triangleBases[Rshape]}
            transform=" translate(${RX}, ${RY})
                        translate(162.5, 56)
                        rotate(${RRot})
                        scale(${RFlip * RSize})" />`;
        $('#stimuli').html(leftTriangle + rightTriangle);
    },

    clearTriangles() {
        $('#stimuli').html('');
    },

    presentTriangles(Lshapes, Rshapes, LsizeBase, RsizeBase) {
        // select X and Y positions for each shape
        var LX = this.getRandom(this.settings.XRange[0],
                                this.settings.XRange[1]);
        var RX = this.getRandom(this.settings.XRange[0],
                                this.settings.XRange[1]);
        var LY = this.getRandom(this.settings.YRange[0],
                                this.settings.YRange[1]);
        var RY = this.getRandom(this.settings.YRange[0],
                                this.settings.YRange[1]);
        // select rotation, flip, size per shape
        var LRot = this.getRandom(this.settings.rotRange[0],
                                  this.settings.rotRange[1]);
        var RRot = this.getRandom(this.settings.rotRange[0],
                                  this.settings.rotRange[1]);
        var LFlip = this.getRandomElement(this.settings.flipVals);
        var RFlip = this.getRandomElement(this.settings.flipVals);
        var LSize = this.getRandom(this.settings.sizeRange[0],
                                   this.settings.sizeRange[1]) * LsizeBase[0];
        var RSize = this.getRandom(this.settings.sizeRange[0],
                                   this.settings.sizeRange[1]) * RsizeBase[0];

        var frame = this;
        frame.sendTimeEvent(`exp-alternation:clearTriangles`);
        frame.clearTriangles();
        frame.set('stimTimer', window.setTimeout(function() {
            frame.sendTimeEvent(`exp-alternation:presentTriangles`, {
                        Lshape: Lshapes[0],
                        LX: LX,
                        LY: LY,
                        LRot: LRot,
                        LFlip: LFlip,
                        LSize: LSize,
                        Rshape: Rshapes[0],
                        RX: RX,
                        RY: RY,
                        RRot: RRot,
                        RFlip: RFlip,
                        RSize: RSize
                    });
            frame.drawTriangles(  Lshapes[0], LX, LY, LRot, LFlip, LSize,
                            Rshapes[0], RX, RY, RRot, RFlip, RSize);
            frame.set('stimTimer', window.setTimeout(function(){
                frame.presentTriangles(Lshapes.reverse(), Rshapes.reverse(),
                                    LsizeBase.reverse(), RsizeBase.reverse());
            }, frame.settings.msTriangles));
        }, frame.settings.msBlank));
    },

    handleSpace(event, frame) {
        if (frame.checkFullscreen() || !frame.isPaused) {
            if (event.which === 32) { // space
                frame.pauseStudy();
            }
        }
    },

    // Pause/unpause study; only called if doing intro.
    pauseStudy() {

        $('#player-audio')[0].pause();
        $('#player-audio')[0].currentTime = 0;
        $('#player-pause-audio')[0].pause();
        $('#player-pause-audio')[0].currentTime = 0;
        $('#player-pause-audio-leftfs')[0].pause();
        $('#player-pause-audio-leftfs')[0].currentTime = 0;

        this.set('completedAudio', false);
        this.set('completedAttn', false);

        Ember.run.once(this, () => {
            this.set('hasBeenPaused', true);
            var wasPaused = this.get('isPaused');
            this.set('currentSegment', 'intro');

            // Currently paused: RESUME
            if (wasPaused) {
                this.sendTimeEvent('unpauseVideo');
                try {
                    this.get('recorder').resume();
                } catch (_) {
                    return;
                }
                this.startIntro();
                this.set('isPaused', false);
            } else { // Not currently paused: PAUSE
                window.clearTimeout(this.get('introTimer'));
                this.sendTimeEvent('pauseVideo');
                if (this.get('recorder')) {
                    this.get('recorder').pause(true);
                }

                if (this.checkFullscreen()) {
                    $('#player-pause-audio')[0].play();
                } else {
                    $('#player-pause-audio-leftfs')[0].play();
                }
                this.set('isPaused', true);
            }
        });

    },

    didInsertElement() {
        this._super(...arguments);


        // Define basic properties for two triangle shapes used. It would be
        // more natural to define these in the template, and then use the
        // <use xlink:href="#name" .../> syntax to transform them as
        // appropriate, but although this worked fine on experimenter I couldn't
        // get the links working on lookit. The code was correctly generated,
        // but while a direct use of polygon showed up, nothing that used
        // xlink:href showed up at all (even when hard-coded into the template).
        // Possibly related to issues like
        // https://github.com/emberjs/ember.js/issues/14752.
        // --kim

        this.set('triangleBases', {
            'fat': `<polygon stroke="${this.get('triangleColor')}"
                     stroke-width="${this.get('triangleLineWidth')}"
                     fill="none"
                     points="-12.1369327415 ,  -5.63277008813,
                              14.5176215029 ,  -5.63277008813,
                              -2.38068876146 ,  11.2655401763"
                     vector-effect="non-scaling-stroke"
                     stroke-linejoin="round"`,
            'skinny': `<polygon stroke="${this.get('triangleColor')}"
                     stroke-width="${this.get('triangleLineWidth')}"
                     fill="none"
                     points="-27.5259468096 ,  -3.25208132666,
                              18.6410953948 ,  -3.25208132666,
                               8.88485141479 ,  6.50416265333"
                     vector-effect="non-scaling-stroke"
                     stroke-linejoin="round"`

        });

        // COUNTERBALANCING (2x2):
        // context: whether to use big fat triangle or
        // small skinny triangle as context figure. If 'fat', contrasts are
        // big fat/small fat and big fat/small skinny. If 'skinny', contrasts
        // are big skinny/small skinny and big fat/small skinny.
        // altOnLeft: whether to put size-and-shape alteration on left

        var diffShapes;
        var sameShapes;
        var shapeSizes;
        if (this.get('context')) {
            sameShapes = ['fat']; // context: big fat triangle
            shapeSizes = [1, 0.7071]; // big fat vs. small fat/small skinny
                // sqrt(0.5) = 0.7071, to get factor of two difference in area
            diffShapes = ['fat', 'skinny']; // start with context
        } else {
            sameShapes = ['skinny']; // context: small skinny triangle
            shapeSizes = [0.7071, 1]; // small skinny vs. big skinny/big fat
            diffShapes = ['skinny', 'fat']; // start with context
        }

        var Lshapes, Rshapes;
        if (this.get('altOnLeft')) {
            Lshapes = diffShapes;
            Rshapes = sameShapes;
        } else {
            Lshapes = sameShapes;
            Rshapes = diffShapes;
        }

        this.set('settings', {
            msBlank: 300,
            msTriangles: 500,
            LsizeBaseStart: shapeSizes,
            RsizeBaseStart: shapeSizes.slice(),
            XRange: [-3.125, 3.125],
            YRange: [-3.125, 3.125],
            rotRange: [0, 360],
            flipVals: [-1, 1],
            sizeRange: [0.921954, 1.072381], // 15% by AREA: sqrt(0.85), sqrt(1.15)
            trialLength: this.get('trialLength'),
            LshapesStart: Lshapes,
            RshapesStart: Rshapes,
            musicFadeLength: 2000,
            calLength: this.get('calibrationLength')});

        this.send('showFullscreen');
        this.startIntro();

        if (this.get('experiment') && this.get('id') && this.get('session')) {
            let recorder = this.get('videoRecorder').start(this.get('videoId'), this.$('#videoRecorder'), {
                hidden: true
            });
            recorder.install({
                record: true
            }).then(() => {
                this.sendTimeEvent('recorderReady');
                this.set('recordingIsReady', true);
            });
            recorder.on('onCamAccess', (hasAccess) => {
                this.sendTimeEvent('hasCamAccess', {
                    hasCamAccess: hasAccess
                });
            });
            recorder.on('onConnectionStatus', (status) => {
                this.sendTimeEvent('videoStreamConnection', {
                    status: status
                });
            });
            this.set('recorder', recorder);
        }

    },

    willDestroyElement() {
        this.sendTimeEvent('destroyingElement');

        // Whenever the component is destroyed, make sure that event handlers are removed and video recorder is stopped
        if (this.get('recorder')) {
            this.get('recorder').hide(); // Hide the webcam config screen
            this.get('recorder').stop();
        }
        // Remove pause handler
        $(document).off('keyup.pauser');

        this._super(...arguments);
    }

});
