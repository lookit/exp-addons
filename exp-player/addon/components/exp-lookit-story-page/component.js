import Ember from 'ember';
import layout from './template';
import ExpFrameBaseComponent from '../../components/exp-frame-base/component';
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
 * This frame is displayed fullscreen; if the frame before it is not, that frame
 * needs to include a manual "next" button so that there's a user interaction
 * event to trigger fullscreen mode. (Browsers don't allow us to switch to FS
 * without a user event.)

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
                "emph": true,
                "css": {
                    "color": "red",
                    "font-size": "12px"
                }
            },
            "images": [
                {
                    "id": "leftA",
                    "src": "flurps1.jpg",
                    "left": "10",
                    "width": "30",
                    "top": "34.47"
                },
                {
                    "id": "rightA",
                    "src": "zazzes1.jpg",
                    "left": "60",
                    "width": "30",
                    "top": "34.47"
                }
            ],
            "kind": "exp-lookit-story-page",
            "audioSources": [
                {
                    "audioId": "firstAudio",
                    "sources": [
                        {
                            "stub": "intro1"
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
 * @extends ExpFrameBase
 * @uses FullScreen
 * @uses VideoRecord
 */

export default ExpFrameBaseComponent.extend(FullScreen, VideoRecord,  {
    type: 'exp-lookit-story-page',
    layout: layout,
    displayFullscreen: true, // force fullscreen for all uses of this component
    fullScreenElementId: 'experiment-player', // which element to send fullscreen
    fsButtonID: 'fsButton', // ID of button to go to fullscreen

    // Track state of experiment
    completedAudio: false,
    completedAttn: false,
    currentSegment: 'intro', // 'calibration', 'test', 'finalaudio' (mutually exclusive)
    previousSegment: 'intro', // used when pausing/unpausing - refers to segment that study was paused during

    currentAudioIndex: -1, // during initial sequential audio, holds an index into audioSources

    // Override setting in VideoRecord mixin - only use camera if doing recording
    doUseCamera: Ember.computed.alias('doRecording'),
    // Don't need to override startRecordingAutomatically as we override the observer
    // whenPossibleToRecord directly.

    meta: {
        name: 'ExpLookitStoryPage',
        description: 'Frame to display a basic storybook page trial, with images and audio',
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
                 * with `baseDir` + `img/`. Any audio/video src values that give
                 * a value for 'stub' rather than 'src' and 'type' will be
                 * expanded out to
                 * `baseDir/avtype/[stub].avtype`, where the potential avtypes
                 * are given by audioTypes and videoTypes.
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
                 * is given as [{'stub': 'intro'}], the audio source will be
                 * expanded out to
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
                 * Can also give a single element {stub: 'filename'}, which will
                 * be expanded out to the appropriate array based on `baseDir`
                 * and `audioTypes` values; see `audioTypes`.
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
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        'src': {
                                            type: 'string'
                                        },
                                        'type': {
                                            type: 'string'
                                        },
                                        'stub': {
                                            type: 'string'
                                        }
                                    }
                                }
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
                 * Text block to display to parent.  (Each field is optional)
                 *
                 * @property {Object} parentTextBlock
                 *   @param {String} title title to display
                 *   @param {String} text paragraph of text
                 *   @param {Boolean} emph whether to bold this paragraph
                 *   @param {Object} css object specifying any css properties
                 *      to apply to this section, and their values - e.g.
                 *      {'color': 'red', 'font-size': '12px'}
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
                        },
                        css: {
                            type: 'object',
                            default: {}
                        }
                    },
                    default: {}
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
            type: 'object',
            /**
             * Parameters captured and sent to the server
             *
             * @method serializeContent
             * @param {Object} eventTimings
             * @param {String} videoID The ID of any webcam video recorded during this frame
             * @param {List} videoList a list of webcam video IDs in case there are >1
             * @return {Object} The payload sent to the server
             */
            properties: {
                videoId: {
                    type: 'string'
                },
                videoList: {
                    type: 'list'
                }
            },
        }
    },

    // Override to do a bit extra when recording
    whenPossibleToRecord: function() {
        if (this.get('doRecording')) {
            var _this = this;
            if (this.get('recorder.hasCamAccess') && this.get('recorderReady')) {
                this.startRecorder().then(() => {
                    _this.set('currentAudioIndex', -1);
                    _this.send('playNextAudioSegment');
                    _this.set('recorderReady', false);
                    $('#waitForVideo').hide();
                    $('.story-image-container').show();
                });
            }
        }
    }.observes('recorder.hasCamAccess', 'recorderReady'),

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

        finish() {
            var _this = this;
            this.stopRecorder().then(() => {
                _this.set('stoppedRecording', true);
                _this.send('next');
            }, () => {
                _this.send('next');
            });
        },

        playNextAudioSegment() {
            this.set('currentAudioIndex', this.get('currentAudioIndex') + 1);
            if (this.currentAudioIndex < this.get('audioSources').length) {
                $('#' + this.get('audioSources')[this.currentAudioIndex].audioId)[0].play();
            } else {
                if (this.get('autoProceed')) {
                    this.send('finish');
                } else {
                    $('#nextbutton').prop('disabled', false);
                }
            }
        }

    },

    // Utility to expand stubs into either full URLs (for images) or
    // array of {src: 'url', type: 'MIMEtype'} objects (for audio).
    expandAsset(asset, type) {
        var fullAsset = asset;
        var _this = this;

        if (type === 'image' && typeof asset === 'string' && !(asset.includes('://'))) {
            // Image: replace stub with full URL if needed
            fullAsset = this.baseDir + 'img/' + asset;
        } else if (type === 'audio') {
            // Audio: replace any source objects that have a
            // 'stub' attribute with the appropriate expanded source
            // objects
            fullAsset = [];
            var types = this.audioTypes;
            asset.forEach(function(srcObj) {
                if (srcObj.hasOwnProperty('stub')) {
                    for (var iType = 0; iType < types.length; iType++) {
                        fullAsset.push({
                            src: _this.baseDir + types[iType] + '/' + srcObj.stub + '.' + types[iType],
                            type: type + '/' + types[iType]
                        });
                    }
                } else {
                    fullAsset.push(srcObj);
                }
            });
        }
        return fullAsset;
    },

    didInsertElement() {

        this._super(...arguments);

        // Expand any image src stubs

        var images = this.get('images');
        images.forEach((im) => {
            Ember.set(im, 'src', this.expandAsset(im.src, 'image'));
        });
        this.set('images_parsed', images);

        // Expand any audio src stubs
        var audioSources = this.get('audioSources');
        audioSources.forEach((aud) => {
            Ember.set(aud, 'sources_parsed', this.expandAsset(aud.sources, 'audio'));
        });
        this.set('audioSources', audioSources);

        // Apply user-provided CSS to parent text block
        var parentTextBlock = this.get('parentTextBlock') || {};
        var css = parentTextBlock.css || {};
        $('#parenttext').css(css);

        this.send('showFullscreen');
        $('#nextbutton').prop('disabled', true);

        // If not recording, go to audio right away! Otherwise will be triggered when
        // recording starts.
        if (!this.get('doRecording')) {
            this.send('playNextAudioSegment');
        }

    },

    // Hide story once rendered (as long as story hasn't started yet anyway)
    didRender() {
        if (this.get('doRecording') && this.get('currentAudioIndex') == -1) {
            $('.story-image-container').hide();
        }
    }

});
