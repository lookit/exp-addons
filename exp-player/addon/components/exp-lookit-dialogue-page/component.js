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

```json
 "frames": {
         "phase-1": {
            "backgroundImage": "https://s3.amazonaws.com/lookitcontents/politeness/img/order1_test1_background.png",
            "doRecording": true,
            "autoProceed": false,
            "parentTextBlock": {
                "title": "Parents!",
                "text": "some instructions",
                "emph": true
            },
            "images": [
                {
                    "id": "protagonist",
                    "src": "https://s3.amazonaws.com/lookitcontents/politeness/img/order1_test1_listener1.png",
                    "left": "40",
                    "bottom": "2",
                    "height": "60"
                }
            ],
            "kind": "exp-lookit-dialogue-page",
            "id": "phase-1",
            "audioSources": [
                {
                    "audioId": "firstAudio",
                    "sources": [
                        {
                            "src": "https://s3.amazonaws.com/lookitcontents/politeness/mp3/polcon_example_1intro.mp3",
                            "type": "audio/mp3"
                        },
                        {
                            "src": "https://s3.amazonaws.com/lookitcontents/politeness/ogg/polcon_example_1intro.ogg",
                            "type": "audio/ogg"
                        }
                    ]
                }
            ]
        },
        "phase-2": {
            "backgroundImage": "https://s3.amazonaws.com/lookitcontents/politeness/img/order1_test1_background.png",
            "doRecording": false,
            "autoProceed": false,
            "parentTextBlock": {
                "title": "Parents!",
                "text": "some instructions",
                "emph": true
            },
            "images": [
                {
                    "id": "protagonist",
                    "src": "https://s3.amazonaws.com/lookitcontents/politeness/img/order1_test1_listener1.png",
                    "left": "40",
                    "bottom": "2",
                    "height": "60"
                },
                {
                    "id": "speaker1",
                    "text": "Click to hear what he said!",
                    "src": "https://s3.amazonaws.com/lookitcontents/politeness/img/order1_test1_speaker1.png",
                    "left": "20",
                    "bottom": "2",
                    "height": "60",
                    "animate": "flyleft",
                    "requireAudio": true,
                    "imageAudio": [
                        {
                            "src": "https://s3.amazonaws.com/lookitcontents/politeness/mp3/polcon_example_2_2speaker1polite.mp3",
                            "type": "audio/mp3"
                        },
                        {
                            "src": "https://s3.amazonaws.com/lookitcontents/politeness/ogg/polcon_example_2_2speaker1polite.ogg",
                            "type": "audio/ogg"
                        }
                    ]
                }
            ],
            "kind": "exp-lookit-dialogue-page",
            "id": "phase-2",
            "audioSources": [
                {
                    "audioId": "firstAudio",
                    "sources": [
                        {
                            "src": "https://s3.amazonaws.com/lookitcontents/politeness/mp3/polcon_example_2_1intro.mp3",
                            "type": "audio/mp3"
                        },
                        {
                            "src": "https://s3.amazonaws.com/lookitcontents/politeness/ogg/polcon_example_2_1intro.ogg",
                            "type": "audio/ogg"
                        }
                    ]
                }
            ]
        },
        "phase-5": {
            "backgroundImage": "https://s3.amazonaws.com/lookitcontents/politeness/img/order1_test1_background.png",
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
                    "src": "https://s3.amazonaws.com/lookitcontents/politeness/img/order1_test1_speaker1.png",
                    "left": "20",
                    "bottom": "2",
                    "height": "60"
                },
                {
                    "id": "speaker2",
                    "src": "https://s3.amazonaws.com/lookitcontents/politeness/img/order1_test1_speaker2.png",
                    "left": "60",
                    "bottom": "2",
                    "height": "60"
                }
            ],
            "kind": "exp-lookit-dialogue-page",
            "id": "phase-5",
            "audioSources": [
                {
                    "audioId": "firstAudio",
                    "sources": [
                        {
                            "src": "https://s3.amazonaws.com/lookitcontents/politeness/mp3/polcon_example_5q1.mp3",
                            "type": "audio/mp3"
                        },
                        {
                            "src": "https://s3.amazonaws.com/lookitcontents/politeness/ogg/polcon_example_5q1.ogg",
                            "type": "audio/ogg"
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
                var whichAudioCompleted = this.imageAudioCompleted;
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
    readyToStartAudio: Ember.computed('hasCamAccess', 'videoUploadConnected',
        function() {
            return (this.get('hasCamAccess') && this.get('videoUploadConnected'));
        }),

    meta: {
        name: 'ExpLookitDialoguePage',
        description: 'Frame to [TODO]',
        parameters: {
            type: 'object',
            properties: {
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
                 *      'MIMEtype'} objects with audio sources for this segment
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
                 *   @param {String} id unique ID for this image. This will be used to refer to the choice made by the user, if any.
                 *   @param {String} src URL of image source
                 *   @param {String} left left margin, as percentage of story area width
                 *   @param {String} height image height, as percentage of story area height
                 *   @param {String} bottom bottom margin, as percentage of story area height
                 *   @param {String} animate animation to use at start of trial on this image, if any. If not provided, image is shown throughout trial. Options are 'fadein', 'fadeout', 'flyleft' (fly from left), and 'flyright'.
                 *   @param {String} text text to display above image, e.g. 'Click to hear what he said!' If omitted, no text is shown.
                 *   @param {Object[]} imageAudio sources Array of {src: 'url',
                 * type: 'MIMEtype'} objects with audio sources for audio to play when this image is clicked, if any. (Omit to not associate audio with this image.)
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
                }
            }
        }
    },

    audioObserver: Ember.observer('readyToStartAudio', function(frame) {
        if (frame.get('readyToStartAudio')) {
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
                this.sendTimeEvent('clickSpeaker', {
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
                    this.sendTimeEvent('startSpeakerAudio', {
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
            this.sendTimeEvent('completeSpeakerAudio', {
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
                    /**
                     * When narration audio is completed
                     *
                     * @event completeMainAudio
                     */
                    this.sendTimeEvent('completeMainAudio');

                    this.set('completedAudio', true);
                    this.notifyPropertyChange('readyToProceed');


                }
            }
        }

    },

    // TODO: should this be moved to the recording mixin?
    sendTimeEvent(name, opts = {}) {
        var streamTime = this.get('recorder') ? this.get('recorder').getTime() : null;
        Ember.merge(opts, {
            streamTime: streamTime,
            videoId: this.get('videoId')
        });
        this.send('setTimeEvent', `exp-lookit-dialogue-page:${name}`, opts);
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
        if (this.get('doRecording')) {
            if (this.get('experiment') && this.get('id') && this.get('session')) {
                let recorder = this.get('videoRecorder').start(this.get('videoId'), this.$('#videoRecorder'), {
                    hidden: true
                });
                recorder.install({
                    record: true
                }).then(() => {
                    this.sendTimeEvent('recorderReady');
                    this.set('recordingIsReady', true);
                    this.notifyPropertyChange('readyToStartAudio');
                });
                // TODO: move handlers that just record events to the VideoRecord mixin?
                /**
                 * When recorder detects a change in camera access
                 *
                 * @event onCamAccess
                 * @param {Boolean} hasCamAccess
                 */
                recorder.on('onCamAccess', (hasAccess) => {
                    this.sendTimeEvent('hasCamAccess', {
                        hasCamAccess: hasAccess
                    });
                    this.notifyPropertyChange('readyToStartAudio');
                });
                /**
                 * When recorder detects a change in video stream connection status
                 *
                 * @event videoStreamConnection
                 * @param {String} status status of video stream connection, e.g.
                 * 'NetConnection.Connect.Success' if successful
                 */
                recorder.on('onConnectionStatus', (status) => {
                    this.sendTimeEvent('videoStreamConnection', {
                        status: status
                    });
                    this.notifyPropertyChange('readyToStartAudio');
                });
                this.set('recorder', recorder);
            }
        } else {
            this.send('playNextAudioSegment');
        }

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
