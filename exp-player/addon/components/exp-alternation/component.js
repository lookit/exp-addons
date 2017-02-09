import Ember from 'ember';
import layout from './template';
import ExpFrameBaseComponent from '../../components/exp-frame-base/component';
//import MediaReload from '../../mixins/media-reload';
import FullScreen from '../../mixins/full-screen';
import VideoRecord from '../../mixins/video-record';

let {
    $
} = Ember;

export default ExpFrameBaseComponent.extend(FullScreen, VideoRecord, {
    type: 'exp-alternation',
    layout: layout,
    displayFullscreen: true, // force fullscreen for all uses of this component
    fullScreenElementId: 'experiment-player',
    fsButtonID: 'fsButton',
    videoRecorder: Ember.inject.service(),
    recorder: null,
    recordingIsReady: false,
    warning: null,
    hasCamAccess: Ember.computed.alias('recorder.hasCamAccess'),
    videoUploadConnected: Ember.computed.alias('recorder.connected'),

    completedAudio: false,
    completedAttn: false,

    doingIntro: Ember.computed('completedAudio', 'completedAttn',
        function() {
            return (!this.get('completedAudio') || !this.get('completedAttn'));
        }),

    settings: null,

    meta: {
        name: 'ExpAlternation',
        description: 'TODO: a description of this frame goes here.',
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
                }
            }
        }
    },

    actions: {

        startVideo() {
            // Set a timer to start the trial
            $('#player-audio')[0].play();
            var frame = this;
            window.setTimeout(function(){
                frame.set('completedAttn', true);
                if (!frame.get('doingIntro')) {
                    frame.startTrial();
                }
            }, frame.get('attnLength') * 1000);
        },

        endAudio() {
            this.set('completedAudio', true);
            if (!this.get('doingIntro')) {
                    this.startTrial();
            }
        }

    },


    startTrial() {
        var frame = this;
        frame.presentTriangles( frame.settings.LshapesStart,
                                        frame.settings.RshapesStart,
                                        frame.settings.LsizeBaseStart,
                                        frame.settings.RsizeBaseStart);
        window.setTimeout(function(){
            window.clearTimeout(frame.get('stimTimer'));
            frame.clearTriangles();
            frame.send('next');
            }, frame.settings.trialLength * 1000);
    },

    sendTimeEvent(name, opts = {}) {
        var streamTime = this.get('recorder') ? this.get('recorder').getTime() : null;

        Ember.merge(opts, {
            streamTime: streamTime,
            videoId: this.get('videoId')
        });
        this.send('setTimeEvent', `exp-physics:${name}`, opts);
    },

    onFullscreen() {
        if (this.get('isDestroyed')) {
            return;
        }
        this._super(...arguments);
        if (!this.checkFullscreen()) {
            this.sendTimeEvent('leftFullscreen');
            // TODO: if setting up pausing of experiment, also pause here.
            //if (!this.get('isPaused')) {
            //    this.pauseStudy();
            //}
        } else {
            this.sendTimeEvent('enteredFullscreen');
        }
    },

    stimTimer: null,

    getRandomElement(arr) {
      return arr[Math.floor(Math.random() * arr.length)];
    },

    getRandom(min, max) {
      return Math.random() * (max - min) + min;
    },

    triangleBases: null,

    drawTriangles(Lshape, LX, LY, LRot, LFlip, LSize, Rshape, RX, RY, RRot, RFlip, RSize) {

        var leftTriangle = [this.triangleBases[Lshape],
            '" transform=" translate(', LX, ', ', LY, ') ',
            'translate(37.5, 56) rotate(', LRot, ') ',
            'scale(', LFlip * LSize, ')" />'].join(' ');
        var rightTriangle = [this.triangleBases[Rshape],
            '" transform=" translate(', RX, ', ', RY, ') ',
            'translate(162.5, 56) rotate(', RRot, ') ',
            'scale(', RFlip * RSize, ')" />'].join(' ');
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
        frame.send('setTimeEvent', `exp-alternation:clearTriangles`);
        frame.clearTriangles();
        this.set('stimTimer', window.setTimeout(function() {
            // TODO: switch to a sendTimeEvent action once doing recording
            frame.send('setTimeEvent', `exp-alternation:presentTriangles`, {
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
            'fat': ['<polygon stroke="', this.get('triangleColor'), '"',
                     'stroke-width="', this.get('triangleLineWidth'), '"',
                     'fill="none"',
                     'points="-15.1908081668 ,  -7.05007860547, ',
                      '18.1705219916 ,  -7.05007860547, ',
                      '-2.97971382479 ,  14.1001572109"',
                     'vector-effect="non-scaling-stroke"',
                     'stroke-linejoin="round"'
                    ].join(' '),
            'skinny': ['<polygon stroke="', this.get('triangleColor'), '"',
                       'stroke-width="', this.get('triangleLineWidth'), '"',
                       'fill="none"',
                       'points="-34.4519811143 ,  -4.07036478068,',
                        '23.3315377282 ,  -4.07036478068,',
                        '11.1204433861 ,  8.14072956135"',
                       'vector-effect="non-scaling-stroke"',
                       'stroke-linejoin="round"'
                      ].join(' ')
        });

        // COUNTERBALANCING (2x2):
        // context: whether to use big fat triangle or
        // small skinny triangle as context figure. If 'fat', contrasts are
        // big fat/small fat and big fat/small skinny. If 'skinny', contrasts
        // are big skinny/small skinny and big fat/small skinny.
        // altOnLeft: whether to put size-and-shape alteration on left

        var diffShapes = ['fat', 'skinny'];
        var sameShapes;
        if (this.get('context')) {
            sameShapes = ['fat'];
        } else {
            sameShapes = ['skinny'];
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
            LsizeBaseStart: [1, 0.5],
            RsizeBaseStart: [1, 0.5],
            XRange: [-5, 5],
            YRange: [-5, 5],
            rotRange: [0, 360],
            flipVals: [-1, 1],
            sizeRange: [0.75, 1.2],
            trialLength: this.get('trialLength'),
            LshapesStart: Lshapes,
            RshapesStart: Rshapes});

        this.send('showFullscreen');
    }

});
