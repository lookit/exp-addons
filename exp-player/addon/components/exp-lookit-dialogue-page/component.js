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
 * Frame to implement a storybook page with dialogue spoken by characters.
 * First, characters appear and any main narration audio is played.
 * Next, the user can click on the characters to play additional audio
 * associated with each character image, or (for a choice trial) the user clicks
 * one of the images to select it as an answer. Once main narration audio has
 * been played and either a selection has been made (for a choice trial,
 * isChoiceFrame: true) or all
 * required character audio has been played (for a non-choice trial), the user
 * can proceed by pressing 'next'. (A trial with only main narration audio can
 * also simply auto-proceed when audio is finished.)
 *
 * Recording is optional. If webcam recording is conducted (doRecording: true)
 * then audio does not start until recording does, to ensure the entire trial
 * is recorded.
 *
 * The character images are specified in 'images', including an image source,
 * positioning on the screen, any animation at the start of the trial, any
 * associated audio, and whether that audio is required.
 *
 * This frame extends ExpFrameBaseUnsafe because it is displayed fullscreen
 * and expected to be repeated.
 *
 * The examples below show a few expected uses of this frame. In phase-2,
 * two characters are shown; the protagonist is already present, and speaker1
 * flies in from the left. Speaker1 has associated audio (dialogue). After
 * the narrative audio, the user can click on speaker1 to play the audio, and
 * will then be able to proceed.
 *
 * phase-5 is a choice trial, where the user has to click on one of the two
 * images before proceeding.

```json
 "frames":
        "phase-2": {
            "kind": "exp-lookit-dialogue-page",
            "id": "phase-2",
            "baseDir": "https://s3.amazonaws.com/lookitcontents/politeness/",
            "audioTypes": ["mp3", "ogg"],
            "backgroundImage": "order1_test1_background.png",
            "doRecording": false,
            "autoProceed": false,
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
                    "id": "protagonist",
                    "src": "order1_test1_listener1.png",
                    "left": "40",
                    "bottom": "2",
                    "height": "60"
                },
                {
                    "id": "speaker1",
                    "text": "Click to hear what he said!",
                    "src": "order1_test1_speaker1.png",
                    "left": "20",
                    "bottom": "2",
                    "height": "60",
                    "animate": "flyleft",
                    "requireAudio": true,
                    "imageAudio": [
                        {
                            "stub": "polcon_example_2_2speaker1polite"
                        }
                    ]
                }
            ],
            "audioSources": [
                {
                    "audioId": "firstAudio",
                    "sources": [
                        {
                            "stub": "polcon_example_2_1intro"
                        }
                    ]
                }
            ]
        },
        "phase-5": {
            "kind": "exp-lookit-dialogue-page",
            "id": "phase-5",
            "baseDir": "https://s3.amazonaws.com/lookitcontents/politeness/",
            "audioTypes": ["mp3", "ogg"],
            "backgroundImage": "order1_test1_background.png",
            "doRecording": false,
            "autoProceed": false,
            "isChoiceFrame": true,
            "parentTextBlock": {
                "title": "Parents:",
                "text": "click on the character your child selects.",
                "emph": true
            },
            "images": [
                {
                    "id": "speaker1",
                    "src": "order1_test1_speaker1.png",
                    "left": "20",
                    "bottom": "2",
                    "height": "60"
                },
                {
                    "id": "speaker2",
                    "src": "order1_test1_speaker2.png",
                    "left": "60",
                    "bottom": "2",
                    "height": "60"
                }
            ],
            "audioSources": [
                {
                    "audioId": "firstAudio",
                    "sources": [
                        {
                            "stub": "polcon_example_5q1"
                        }
                    ]
                }
            ]
        }
 }

 * ```
 * @class ExpLookitDialoguePage
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
    type: 'exp-lookit-dialogue-page',
    layout: layout,
    displayFullscreen: true, // force fullscreen for all uses of this component
    fullScreenElementId: 'experiment-player',
    fsButtonID: 'fsButton',
    videoRecorder: Ember.inject.service(),
    recorder: null,
    hasCamAccess: Ember.computed.alias('recorder.hasCamAccess'),
    videoUploadConnected: Ember.computed.alias('recorder.connected'),

    // Track state of experiment
    completedAudio: false, // for main narration audio
    imageAudioCompleted: new Set(),
    currentlyHighlighted: null, // id for image currently selected

    currentAudioIndex: -1, // during initial sequential audio, holds an index into audioSources

    // Can the user click the 'next' button yet? Require all 'main' audio to
    // have played. For a choice frame, require that one of the images is
    // selected; for other frames, require that any required image-audio has
    // completed.
    readyToProceed: Ember.computed('completedAudio', 'imageAudioCompleted', 'currentlyHighlighted',
        function() {
            var okayToProceed = this.get('completedAudio');

            if (this.get('isChoiceFrame') && !(this.get('currentlyHighlighted'))) {
                okayToProceed = false;
            } else {
                var whichAudioCompleted = this.get('imageAudioCompleted');
                this.get('images').forEach(function (im) {
                    if (im.requireAudio && !(whichAudioCompleted.has(im.id))) {
                        okayToProceed = false;
                    }
                });
            }
            return okayToProceed;
        }),

    // Are we ready to start playing the audio? Wait for recording (used if
    // doing a recording frame).
    readyToStartAudio: Ember.computed.and('hasCamAccess', 'videoUploadConnected'),

    meta: {
        name: 'ExpLookitDialoguePage',
        description: 'Frame to [TODO]',
        parameters: {
            type: 'object',
            properties: {
                /**
                 * Phase number (just included as a convenience & sent to server, to make handling collected data simpler)
                 *
                 * @property {Number} nPhase
                 * @default 0
                 */
                nPhase: {
                    type: 'number',
                    description: 'Phase number',
                    default: 0
                },
                /**
                 * Trial number (just included as a convenience & sent to server, to make handling collected data simpler)
                 *
                 * @property {Number} nTrial
                 * @default 0
                 */
                nTrial: {
                    type: 'number',
                    description: 'Trial number',
                    default: 0
                },
                /**
                 * URL of background image; will be stretched to width of page
                 *
                 * @property {String} backgroundImage
                 */
                backgroundImage: {
                    type: 'string',
                    description: 'URL of background image; will be stretched to width of page'
                },
                /**
                 * Whether this is a frame where the user needs to click to
                 * select one of the images before proceeding
                 *
                 * @property {Boolean} isChoiceFrame
                 * @default false
                 */
                isChoiceFrame: {
                    type: 'boolean',
                    description: 'Whether this is a frame where the user needs to click to select one of the images before proceeding'
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
                 * Array of objects describing audio to play at the start of
                 * this frame. Each element describes a separate audio segment.
                 *
                 * @property {Object[]} audioSources
                 *   @param {String} audioId unique string identifying this
                 *      audio segment
                 *   @param {Object[]} sources Array of {src: 'url', type:
                 *      'MIMEtype'} objects with audio sources for this segment.
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
                 * Text block to display to parent. (Each field is optional)
                 *
                 * @property {Object} parentTextBlock
                 *   @param {String} title title to display
                 *   @param {String} text paragraph of text
                 *   @param {Boolean} emph whether to bold this paragraph
                 *   @param {Object} css object specifying any css properties
                 *      to apply to this section, and their values - e.g.
                 *      {'color': 'red', 'font-size': '12px'}.
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
                    default: []
                },
                /**
                 * Array of images to display and information about their placement
                 *
                 * @property {Object[]} images
                 *   @param {String} id unique ID for this image. This will be used to refer to the choice made by the user, if any.
                 *   @param {String} src URL of image source (can be full URL, or stub to append to baseDir; see `baseDir`)
                 *   @param {String} left left margin, as percentage of story area width
                 *   @param {String} height image height, as percentage of story area height
                 *   @param {String} bottom bottom margin, as percentage of story area height
                 *   @param {String} animate animation to use at start of trial on this image, if any. If not provided, image is shown throughout trial. Options are 'fadein', 'fadeout', 'flyleft' (fly from left), and 'flyright'.
                 *   @param {String} text text to display above image, e.g. 'Click to hear what he said!' If omitted, no text is shown.
                 *   @param {Object[]} imageAudio sources Array of {src: 'url',
                 * type: 'MIMEtype'} objects with audio sources for audio to play when this image is clicked, if any. (Omit to not associate audio with this image.)
                 *
                 * Can also give a single element {stub: 'filename'}, which will
                 * be expanded out to the appropriate array based on `baseDir`
                 * and `audioTypes` values; see `audioTypes`.
                 *
                 *   @param {Boolean} requireAudio whether to require the user to click this image and complete the audio associated before proceeding to the next trial. (Incompatible with autoProceed.)
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
                            'height': {
                                type: 'string'
                            },
                            'bottom': {
                                type: 'string'
                            },
                            'animate': {
                                type: 'string'
                            },
                            'text': {
                                type: 'string'
                            },
                            'imageAudio': {
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
                            'requireAudio': {
                                type: 'boolean'
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
             * @param {String} currentlyHighlighted which image is selected at
             *   the end of the trial, or null if none is. This indicates the
             *   final selected choice for a choice trial.
             * @return {Object} The payload sent to the server
             */
            type: 'object',
            properties: {
                videoId: {
                    type: 'string'
                },
                currentlyHighlighted: {
                    type: 'string'
                },
                nTrial: {
                    type: 'number'
                },
                nPhase: {
                    type: 'number'
                }
            }
        }
    },

    audioObserver: Ember.observer('readyToStartAudio', function(frame) {
        if (frame.get('readyToStartAudio')) {
            $('#waitForVideo').hide();
            frame.set('currentAudioIndex', -1);
            frame.send('playNextAudioSegment');
        }
    }),

    actions: {

        clickSpeaker(imageId) {
            // On a choice frame, highlight this choice
            if (this.get('isChoiceFrame')) {

                /**
                 * When one of the images is clicked during a choice frame
                 *
                 * @event clickSpeaker
                 * @param {String} imageId
                 */
                this.send('setTimeEvent', 'clickSpeaker', {
                    imageId: imageId
                });

                $('.story-image-container').removeClass('highlight');
                $('#' + imageId).addClass('highlight');
                this.set('currentlyHighlighted', imageId);
                this.notifyPropertyChange('readyToProceed');

            // In general, play audio associated with this image
            } else {
                // Only allow playing image audio once main narration finishes
                if (this.get('completedAudio')) {
                    // pause any current audio, and set times to 0
                    $('audio').each(function() {
                        this.pause();
                        this.currentTime = 0;
                    });
                    // play this image's associated audio
                    $('#' + imageId + ' audio')[0].play();

                    /**
                     * When image audio is started
                     *
                     * @event startSpeakerAudio
                     * @param {String} imageId
                     */
                    this.send('setTimeEvent', 'startSpeakerAudio', {
                        imageId: imageId
                    });
                }
            }
        },

        markAudioCompleted(imageId) {

            /**
             * When image audio is completed (not recorded if interrupted)
             *
             * @event completeSpeakerAudio
             * @param {String} imageId
             */
            this.send('setTimeEvent', 'completeSpeakerAudio', {
                imageId: imageId
            });

            this.imageAudioCompleted.add(imageId);
            this.notifyPropertyChange('readyToProceed');
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
            this.stopRecorder();
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
                    /**
                     * When narration audio is completed
                     *
                     * @event completeMainAudio
                     */
                    this.send('setTimeEvent', 'completeMainAudio');
                    this.set('completedAudio', true);
                    this.notifyPropertyChange('readyToProceed');
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
            fullAsset = this.get('baseDir') + 'img/' + asset;
        } else if (type === 'audio') {
            // Audio: replace any source objects that have a
            // 'stub' attribute with the appropriate expanded source
            // objects
            fullAsset = [];
            var types = this.get('audioTypes');
            asset.forEach(function(srcObj) {
                if (srcObj.hasOwnProperty('stub')) {
                    for (var iType = 0; iType < types.length; iType++) {
                        fullAsset.push({
                            src: _this.get('baseDir') + types[iType] + '/' + srcObj.stub + '.' + types[iType],
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

    makeTimeEvent(eventName, extra) {
        return this._super(`exp-lookit-dialogue-page:${eventName}`, extra);
    },

    didInsertElement() {
        this._super(...arguments);

        // Expand any image src stubs & imageAudio stubs
        var _this = this;
        var images = this.get('images');
        images.forEach(function(im) {
            Ember.set(im, 'src_parsed', _this.expandAsset(im.src, 'image'));
            if (im.hasOwnProperty('imageAudio')) {
                Ember.set(im, 'imageAudio_parsed', _this.expandAsset(im.imageAudio, 'audio'));
            }
        });
        this.set('backgroundImage_parsed', _this.expandAsset(this.backgroundImage, 'image'));

        // Expand any audio src stubs
        var audioSources = this.get('audioSources');
        audioSources.forEach(function(aud) {
            Ember.set(aud, 'sources_parsed', _this.expandAsset(aud.sources, 'audio'));
        });

        this.set('images', images);
        this.set('audioSources', audioSources);

        var parentTextBlock = this.get('parentTextBlock') || {};
        var css = parentTextBlock.css || {};
        $('#parenttext').css(css);

        this.send('showFullscreen');
        $('#nextbutton').prop('disabled', true);

        // Any animations as images are displayed at start of this phase
        $('.story-image-container').hide();
        this.get('images').forEach(function (im) {
            if (im.animate === 'fadein') {
                $('#' + im.id).fadeIn(1000);
            } if (im.animate === 'fadeout') {
                $('#' + im.id).show();
                $('#' + im.id).fadeOut(1000);
            }else if (im.animate === 'flyleft') {
                $('#' + im.id).show();
                $('#' + im.id).css('left', '-20%');
                $('#' + im.id).animate({
                    left: im.left + '%'
                }, 1500);
            } else if (im.animate === 'flyright') {
                $('#' + im.id).show();
                $('#' + im.id).css('left', '100%');
                $('#' + im.id).animate({
                    left: im.left + '%'
                }, 1500);
            }else {
                $('#' + im.id).show();
            }
        });

        // If we're recording this trial, set up, and rely on audioObserver to
        // start audio once recording is ready. Otherwise, start audio right
        // away.
        if (_this.get('doRecording')) {
            if (this.get('experiment') && this.get('id') && this.get('session')) {
                const installPromise = this.setupRecorder(this.$('#videoRecorder'), true, {
                    hidden: true
                });
                /**
                 * When video recorder has been installed
                 *
                 * @event recorderReady
                 */
                installPromise.then(() => {
                    this.send('setTimeEvent', 'recorderReady');
                    this.notifyPropertyChange('readyToStartAudio');
                });

                // Add event handlers on top of what the VideoRecordMixin normally does - TODO: would ideally extend functionality of mixin handlers rather than replacing
                const recorder = this.get('recorder');
                recorder.on('onCamAccess', (hasAccess) => {
                    this.send('setTimeEvent', 'hasCamAccess', {
                        hasCamAccess: hasAccess
                    });
                    this.notifyPropertyChange('readyToStartAudio');
                });

                recorder.on('onConnectionStatus', () => {
                    this.send('setTimeEvent', 'videoStreamConnection', {
                        status: status
                    });
                    this.notifyPropertyChange('readyToStartAudio');
                });
            }
        } else {
            _this.send('playNextAudioSegment');
        }

    },

    willDestroyElement() {
        this.send('setTimeEvent', 'destroyingElement');

        // Whenever the component is destroyed, make sure that event handlers are removed and video recorder is stopped
        const recorder = this.get('recorder');
        if (recorder) {
            recorder.hide(); // Hide the webcam config screen
            this.stopRecorder();
        }

        this._super(...arguments);
    }

});
