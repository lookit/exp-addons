import Ember from 'ember';
import layout from './template';
import ExpFrameBaseUnsafeComponent from '../../components/exp-frame-base-unsafe/component';
import FullScreen from '../../mixins/full-screen';
import VideoRecord from '../../mixins/video-record';

let {
    $
} = Ember;

/**
 * @module exp-player
 * @submodule frames
 */

/**
 * Frame to implement a basic "storybook page" trial, with images placed on the
 * screen within a display area and a sequence of audio files played.
 * Optionally, images may be highlighted at specified times during the audio
 * files.
 *
 * Webcam recording may be turned on or off; if on, the page is not displayed
 * or audio started until recording begins.
 *
 * Frame is displayed fullscreen, but is not paused or otherwise disabled if the
 * user leaves fullscreen. A button appears prompting the user to return to
 * fullscreen mode.
 *
 * The parent may press 'next' to proceed, or the study may proceed
 * automatically when audio finishes (autoProceed).
 *
 * Any number of images may be placed on the screen, and their position
 * specified. (Aspect ratio will be the same as the original image.)
 *
 * These frames extend ExpFrameBaseUnsafe because they are displayed fullscreen
 * and expected to be repeated.

```json
 "frames": {
    "story-intro-1": {
            "doRecording": false,
            "autoProceed": true,
            "baseDir": "https://s3.amazonaws.com/lookitcontents/ingroupobligations/",
            "audioTypes": ["mp3", "ogg"],
            "parentTextBlock": {
                "title": "Parents!",
                "text": "some instructions",
                "emph": true
            },
            "images": [
                {
                    "id": "leftA",
                    "src": "https://s3.amazonaws.com/lookitcontents/ingroupobligations/img/flurps1.jpg",
                    "left": "10",
                    "width": "30",
                    "top": "34.47"
                },
                {
                    "id": "rightA",
                    "src": "https://s3.amazonaws.com/lookitcontents/ingroupobligations/img/zazzes1.jpg",
                    "left": "60",
                    "width": "30",
                    "top": "34.47"
                }
            ],
            "kind": "exp-lookit-story-page",
            "id": "story-intro-1",
            "audioSources": [
                {
                    "audioId": "firstAudio",
                    "sources": [
                        {
                            "src": "https://s3.amazonaws.com/lookitcontents/ingroupobligations/mp3/intro1.mp3",
                            "type": "audio/mp3"
                        },
                        {
                            "src": "https://s3.amazonaws.com/lookitcontents/ingroupobligations/mp3/intro1.ogg",
                            "type": "audio/ogg"
                        }
                    ],
                    "highlights": [
                        {"range": [3.017343,	5.600283], "image": 	"leftA"},
                        {"range": [5.752911,	8.899402], "image": 	"rightA"}
                    ]
                }
            ]
        }
 }

 * ```
 * @class ExpLookitStoryPage
 * @extends ExpFrameBaseUnsafe
 * @uses FullScreen
 * @uses VideoRecord
 */

export default ExpFrameBaseUnsafeComponent.extend(FullScreen, VideoRecord,  {
    // In the Lookit use case, the frame BEFORE the one that goes fullscreen
    // must use "unsafe" saves (in order for the fullscreen event to register as
    // being user-initiated and not from a promise handler) #LEI-369.
    // exp-alternation frames are expected to be repeated, so they need to be
    // unsafe.
    type: 'exp-lookit-story-page',
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
    currentSegment: 'intro', // 'calibration', 'test', 'finalaudio' (mutually exclusive)
    previousSegment: 'intro', // used when pausing/unpausing - refers to segment that study was paused during

    currentAudioIndex: -1, // during initial sequential audio, holds an index into audioSources

    readyToStartAudio: Ember.computed('hasCamAccess', 'videoUploadConnected',
        function() {
            return (this.get('hasCamAccess') && this.get('videoUploadConnected'));
        }),

    meta: {
        name: 'ExpLookitStoryPage',
        description: 'Frame to [TODO]',
        parameters: {
            type: 'object',
            properties: {
                /**
                 * Whether to do webcam recording (will wait for webcam
                 * connection before starting audio if so)
                 *
                 * @property {Boolean} doRecording
                 */
                doRecording: {
                    type: 'boolean',
                    description: 'Whether to do webcam recording (will wait for webcam connection before starting audio if so'
                },
                /**
                 * Whether to proceed automatically after audio (and hide
                 * replay/next buttons)
                 *
                 * @property {Boolean} autoProceed
                 */
                autoProceed: {
                    type: 'boolean',
                    description: 'Whether to proceed automatically after audio (and hide replay/next buttons)'
                },
                /**
                 * Base directory for where to find stimuli. Any image src
                 * values that are not full paths will be expanded by prefixing
                 * with `baseDir` + `img/`. Any audio src values that are
                 * given as strings rather than lists of src/type pairs will be
                 * expanded to
                 * `baseDir/avtype/name.avtype`, where the potential avtypes are
                 * given by audioTypes and videoTypes.
                 *
                 * Note that baseDir SHOULD include a trailing slash
                 * (e.g., `http://stimuli.org/myexperiment/`, not
                 * `http://stimuli.org/myexperiment`)
                 *
                 * @property {String} baseDir
                 * @default ''
                 */
                baseDir: {
                    type: 'string',
                    default: '',
                    description: 'Base directory for all stimuli'
                },
                /**
                 * List of audio types to expect for any audio specified just
                 * with a string rather than with a list of src/type pairs.
                 * If audioTypes is ['typeA', 'typeB'] and an audio source
                 * (e.g. audioSources[0]['sources']) is given as 'intro', then
                 *  audioSources[0]['sources'] will be expanded out to
                 *
```json
                 [
                        {
                            src: 'baseDir' + 'typeA/intro.typeA',
                            type: 'audio/typeA'
                        },
                        {
                            src: 'baseDir' + 'typeB/intro.typeB',
                            type: 'audio/typeB'
                        }
                ]
```
                 *
                 * @property {String[]} audioTypes
                 * @default ['mp3', 'ogg']
                 */
                audioTypes: {
                    type: 'array',
                    default: ['mp3', 'ogg'],
                    description: 'List of audio types to expect for any audio sources specified as strings rather than lists of src/type pairs'
                },
                /**
                 * Array of objects describing audio to play at the start of
                 * this frame. Each element describes a separate audio segment.
                 *
                 * @property {Object[]} audioSources
                 *   @param {String} audioId unique string identifying this
                 *      audio segment
                 *   @param {Object[]} sources Array of {src: 'url', type:
                 *      'MIMEtype'} objects with audio sources for this segment
                 *
                 *   This can also be given as a single string, which will be
                 * expanded out to the appropriate array based on `baseDir` and
                 * `audioTypes` values; see `audioTypes`.
                 *
                 *   @param {Object[]} highlights Array of {'range': [startT,
                 *      endT], 'image': 'imageId'} objects, where the imageId
                 *      values correspond to the ids given in images
                 */
                audioSources: {
                    type: 'array',
                    description: 'List of objects specifying audio src and type for audio played during test trial',
                    default: [],
                    items: {
                        type: 'object',
                        properties: {
                            'audioId': {
                                type: 'string'
                            },
                            'sources': {
                                type: 'object',
                                properties: {
                                    'src': {
                                        type: 'string'
                                    },
                                    'type': {
                                        type: 'string'
                                    }
                                },
                            },
                            'highlights': {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        'range': {
                                            type: 'array',
                                            items: {
                                                type: 'number'
                                            }
                                        },
                                        'image': {
                                            'type': 'string'
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                /**
                 * Text block to display to parent.
                 *
                 * @property {Object} parentTextBlock
                 *   @param {String} title title to display
                 *   @param {String} text paragraph of text
                 *   @param {Boolean} emph whether to bold this paragraph
                 */
                parentTextBlock: {
                    type: 'object',
                    properties: {
                        title: {
                            type: 'string'
                        },
                        text: {
                            type: 'string'
                        },
                        emph: {
                            type: 'boolean'
                        }
                    },
                    default: []
                },
                /**
                 * Array of images to display and information about their placement
                 *
                 * @property {Object[]} images
                 *   @param {String} id unique ID for this image
                 *   @param {String} src URL of image source. This can be a full
                 *     URL, or relative to baseDir (see baseDir).
                 *   @param {String} left left margin, as percentage of story area width
                 *   @param {String} width image width, as percentage of story area width
                 *   @param {String} top top margin, as percentage of story area height

                 */
                images: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            'id': {
                                type: 'string'
                            },
                            'src': {
                                type: 'string'
                            },
                            'left': {
                                type: 'string'
                            },
                            'width': {
                                type: 'string'
                            },
                            'top': {
                                type: 'string'
                            }
                        }
                    }
                }
            }
        },
        data: {
            /**
             * Parameters captured and sent to the server
             *
             * @method serializeContent
             * @param {String} videoID The ID of any video recorded during this frame
             * @param {Object} eventTimings
             * @return {Object} The payload sent to the server
             */
            type: 'object',
            properties: {
                videoId: {
                    type: 'string'
                }
            }
        }
    },

    audioObserver: Ember.observer('readyToStartAudio', function(frame) {
        if (frame.get('readyToStartAudio')) {
            $('#waitForVideo').hide();
            $('.story-image-container').show();
            frame.set('currentAudioIndex', -1);
            frame.send('playNextAudioSegment');
        }
    }),

    actions: {

        // During playing audio
        updateCharacterHighlighting() {

            var thisAudioData = this.get('audioSources')[this.currentAudioIndex];
            var t = $('#' + thisAudioData.audioId)[0].currentTime;

            $('.story-image-container').removeClass('highlight');

            thisAudioData.highlights.forEach(function (h) {
                if (t > h.range[0] && t < h.range[1]) {
                    $('#' + h.image).addClass('highlight');
                }
            });
        },

        replay() {
            // pause any current audio, and set times to 0
            $('audio').each(function() {
                this.pause();
                this.currentTime = 0;
            });
            // reset to index -1 as at start of study
            this.set('currentAudioIndex', -1);
            // restart audio
            this.send('playNextAudioSegment');
        },

        next() {
            if (this.get('recorder')) {
                /**
                 * Just before stopping webcam video capture
                 *
                 * @event stoppingCapture
                 */
                this.sendTimeEvent('stoppingCapture');
                this.get('recorder').stop();
            }
            this._super(...arguments);
        },

        playNextAudioSegment() {
            this.set('currentAudioIndex', this.get('currentAudioIndex') + 1);
            if (this.currentAudioIndex < this.get('audioSources').length) {
                $('#' + this.get('audioSources')[this.currentAudioIndex].audioId)[0].play();
            } else {
                if (this.get('autoProceed')) {
                    this.send('next');
                } else {
                    $('#nextbutton').prop('disabled', false);
                }
            }
        }

    },

    // Utility to expand strings into either full URLs (for images) or
    // array of {src: 'url', type: 'MIMEtype'} objects (for audio).
    expandAsset(asset, type) {
        var fullAsset = asset;
        if (typeof asset === 'string') {
            if (type === 'image' && !(asset.includes('://'))) {
                // Image: replace stub with full URL if needed
                fullAsset = this.baseDir + 'img/' + asset;
            } else if (type === 'audio') {
                // Audio: if we have just a string, build the src/type list
                fullAsset = [];
                for (var iAudioType = 0; iAudioType < this.audioTypes.length; iAudioType++) {
                    fullAsset.push({
                        src: this.baseDir + this.audioTypes[iAudioType] + '/' + asset + '.' + this.audioTypes[iAudioType],
                        type: 'audio/' + this.audioTypes[iAudioType]
                    });
                }
            }
        }
        return fullAsset;
    },

    // TODO: should this be moved to the recording mixin?
    sendTimeEvent(name, opts = {}) {
        var streamTime = this.get('recorder') ? this.get('recorder').getTime() : null;
        Ember.merge(opts, {
            streamTime: streamTime,
            videoId: this.get('videoId')
        });
        this.send('setTimeEvent', `exp-lookit-story-page:${name}`, opts);
    },

    // TODO: should the events here be moved to the fullscreen mixin?
    onFullscreen() {
        if (this.get('isDestroyed')) {
            return;
        }
        this._super(...arguments);
        if (!this.checkFullscreen()) {
            /**
             * Upon detecting change out of fullscreen mode
             *
             * @event leftFullscreen
            */
            this.sendTimeEvent('leftFullscreen');
        } else {
            /**
             * Upon detecting change to fullscreen mode
             *
             * @event enteredFullscreen
            */
            this.sendTimeEvent('enteredFullscreen');
        }
    },

    didInsertElement() {
        this._super(...arguments);

        // Expand any image src stubs
        var _this = this;
        var images = this.get('images');
        images.forEach(function(im) {
            Ember.set(im, 'src', _this.expandAsset(im['src'], 'image'));
        });
        this.set('images', images);

        // Expand any audio src stubs
        var audioSources = this.get('audioSources');
        audioSources.forEach(function(aud) {
           Ember.set(aud, 'sources', _this.expandAsset(aud['sources'], 'audio'));
        });
        this.set('audioSources', audioSources);

        this.send('showFullscreen');
        $('#nextbutton').prop('disabled', true);

        var buffer = 100; // ms to wait before starting, in order to give audioSources a chance to actually be updated

        window.setTimeout(function() {
            if (_this.get('doRecording')) {
                $('.story-image-container').hide();
                if (_this.get('experiment') && _this.get('id') && _this.get('session')) {
                    let recorder = _this.get('videoRecorder').start(_this.get('videoId'), _this.$('#videoRecorder'), {
                        hidden: true
                    });
                    recorder.install({
                        record: true
                    }).then(() => {
                        _this.sendTimeEvent('recorderReady');
                        _this.set('recordingIsReady', true);
                        _this.notifyPropertyChange('readyToStartAudio');
                    });
                    // TODO: move handlers that just record events to the VideoRecord mixin?
                    /**
                     * When recorder detects a change in camera access
                     *
                     * @event onCamAccess
                     * @param {Boolean} hasCamAccess
                     */
                    recorder.on('onCamAccess', (hasAccess) => {
                        _this.sendTimeEvent('hasCamAccess', {
                            hasCamAccess: hasAccess
                        });
                        _this.notifyPropertyChange('readyToStartAudio');
                    });
                    /**
                     * When recorder detects a change in video stream connection status
                     *
                     * @event videoStreamConnection
                     * @param {String} status status of video stream connection, e.g.
                     * 'NetConnection.Connect.Success' if successful
                     */
                    recorder.on('onConnectionStatus', (status) => {
                        _this.sendTimeEvent('videoStreamConnection', {
                            status: status
                        });
                        _this.notifyPropertyChange('readyToStartAudio');
                    });
                    _this.set('recorder', recorder);
                }
            } else {
                _this.send('playNextAudioSegment');
            }
        }, buffer);

    },

    willDestroyElement() {
        this.sendTimeEvent('destroyingElement');

        // Whenever the component is destroyed, make sure that event handlers are removed and video recorder is stopped
        if (this.get('recorder')) {
            this.get('recorder').hide(); // Hide the webcam config screen
            this.get('recorder').stop();
        }

        this._super(...arguments);
    }

});
