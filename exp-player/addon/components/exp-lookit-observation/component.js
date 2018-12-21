import ExpFrameBaseComponent from 'exp-player/components/exp-frame-base/component';
import VideoRecord from '../../mixins/video-record';
import layout from './template';
import Em from 'ember';

let {
    $
} = Em;

/**
 * @module exp-player
 * @submodule frames
 */

/**
 * A frame to collect a video observation with the participant's help. By default the
 * webcam is displayed to the participant and they can choose when to start, pause, and
 * resume recording. The duration of an individual recording can optionally be limited
 * and/or recording can be started automatically. This is intended for cases where we
 * want the parent to perform some test or behavior with the child, rather than
 * presenting stimuli ourselves. E.g., you might give instructions to conduct a structured
 * interview and allow the parent to control recording.
 *
 * Each element of the 'blocks' parameter is rendered using {{#crossLink "ExpTextBlock"}}{{/crossLink}}.
 *
 ```
    "frames": {
        "observation": {
            "kind": "exp-lookit-observation",
            "blocks": [
                {
                    "title": "Time to do the joke!",
                    "listblocks": [
                        {
                            "text": "Rip the paper"
                        },
                        {
                            "text": "Wait ten seconds"
                        }
                    ]
                }
            ],
            "hideWebcam": true,
            "hideControls": false,
            "recordSegmentLength": 10,
            "startRecordingAutomatically": false,
            "nextButtonText": "move on",
            "showPreviousButton": false
        }
    }
```
 * @class ExpLookitObservation
 * @extends ExpFrameBase
 * @extends VideoRecord
 */

export default ExpFrameBaseComponent.extend(VideoRecord, {
    type: 'exp-lookit-observation',
    layout: layout,

    recordingTimer: null,
    progressTimer: null,
    okayToProceedTimer: null,

    timerStart: null,
    hasStartedRecording: false,
    recordingStarted: false,
    toggling: false,
    hidden: false,
    recorderElement: '#recorder',

    meta: {
        name: 'ExpLookitObservation',
        description: 'This frame allows the participant to record an event, intended for observational studies.',
        parameters: {
            type: 'object',
            properties: {
                /**
                 * Array of blocks for {{#crossLink "ExpTextBlock"}}{{/crossLink}}, specifying text/images of instructions to display
                 *
                 * @property {Object[]} blocks
                 *   @param {String} title Title of this section
                 *   @param {String} text Paragraph text of this section
                 *   @param {Object[]} listblocks Object specifying bulleted points for this section. Each object is of the form:
                 *   {text: 'text of bullet point', image: {src: 'url', alt: 'alt-text'}}. Images are optional.
                 */
                blocks: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            title: {
                                type: 'string'
                            },
                            text: {
                                type: 'string'
                            },
                            listblocks: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        text: {
                                            type: 'string'
                                        },
                                        image: {
                                            type: 'object',
                                            properties: {
                                                src: {
                                                    type: 'string'
                                                },
                                                alt: {
                                                    type: 'string'
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    default: []
                },
                /**
                 * Number of seconds to record for before automatically pausing. Use
                 * 0 for no limit.
                 *
                 * @property {String} recordSegmentLength
                 * @default 300
                 */
                recordSegmentLength: {
                    type: 'number',
                    default: 300
                },
                /**
                 * Whether to automatically begin recording upon frame load
                 *
                 * @property {Boolean} startRecordingAutomatically
                 * @default false
                 */
                startRecordingAutomatically: {
                    type: 'boolean',
                    default: false
                },
                /**
                 * Whether a recording must be made to proceed to next frame. 'Next' button
                 * will be disabled until recording is made if so. 0 to not require recording;
                 * any positive number to require that many seconds of recording
                 *
                 * @property {Boolean} startRecordingAutomatically
                 * @default false
                 */
                recordingRequired: {
                    type: 'number',
                    default: 0
                },
                /**
                 * Whether to hide video recording controls (only use with startRecordingAutomatically)
                 *
                 * @property {Boolean} hideControls
                 * @default false
                 */
                hideControls: {
                    type: 'boolean',
                    default: false
                },
                /**
                 * Whether to hide webcam view when frame loads (participant will still be able to show manually)
                 *
                 * @property {Boolean} hideWebcam
                 * @default false
                 */
                hideWebcam: {
                    type: 'boolean',
                    default: false
                },
                /**
                 * Text to display on the 'next frame' button
                 *
                 * @property {String} nextButtonText
                 * @default 'Next'
                 */
                nextButtonText: {
                    type: 'string',
                    default: 'Next'
                },
                /**
                 * Whether to show a 'previous' button
                 *
                 * @property {Boolean} showPreviousButton
                 * @default true
                 */
                showPreviousButton: {
                    type: 'boolean',
                    default: true
                }
            }
        },
        data: {
            /**
             * Parameters captured and sent to the server
             *
             * @method serializeContent
             * @param {String} videoID The ID of any webcam video recorded during this frame
             * @param {List} videoList a list of webcam video IDs in case there are >1
             * @param {Object} eventTimings
             * @return {Object} The payload sent to the server
             */
            type: 'object',
            properties: {
                videoId: {
                    type: 'string'

                },
                videoList: {
                    type: 'list'
                }
            },
            required: ['videoId']
        }
    },

    // Override to deal with whether or not recording is starting automatically
    whenPossibleToRecord: function() {
        if (this.get('startRecordingAutomatically')) {
            if (this.get('recorder.hasCamAccess') && this.get('recorderReady')) {
                this.send('record');
            }
        } else {
            $('#recordButton').show();
            $('#recordingText').text('Not recording yet');
        }

        if (this.get('hideWebcam')) {
            $('#webcamToggleButton').html('Show');
            $('#hiddenWebcamMessage').show();
            $(this.get('recorderElement') + ' div').addClass('exp-lookit-observation-hidevideo');
            this.set('hidden', true);
            /**
             * Webcam display hidden from participant
             *
             * @event hideWebcam
             */
            this.send('setTimeEvent', 'hideWebcam');
        }
    }.observes('recorder.hasCamAccess', 'recorderReady'),

    didInsertElement() { // initial state of all buttons/text
        $('#hiddenWebcamMessage').hide();
        $('#recordButton').hide();
        $('#pauseButton').hide();
        $('#recordingIndicator').hide();
        $('#recordingText').text('');
        $('#recordButtonText').text('Record');
        if (this.get('recordingRequired')) {
            $('#nextbutton').prop('disabled', true);
            $('#nextbutton').text('Recording required to continue');
        }
        this._super(...arguments);
    },

    enableNext() {
        $('#nextbutton').prop('disabled', false);
        $('#nextbutton').text(this.get('nextButtonText'));
    },

    actions: {
        record() {

            this.startRecorder(); // TODO: use then

            var _this = this;
            if (this.get('recordSegmentLength')) { // no timer if 0
                window.clearTimeout(this.get('recordingTimer')); // as a precaution in case still running
                window.clearInterval(this.get('progressTimer'));
                window.clearTimeout(this.get('okayToProceedTimer'));
                this.set('timerStart', new Date().getTime());
                this.set('recordingTimer', window.setTimeout(function() {
                    /**
                     * Video recording automatically paused upon reaching time limit
                     *
                     * @event recorderTimeout
                     */
                    _this.send('setTimeEvent', 'recorderTimeout');
                    _this.send('pause');
                }, _this.get('recordSegmentLength') * 1000));
                this.set('progressTimer', window.setInterval(function() {
                    var prctDone =  (_this.get('recordSegmentLength') * 1000 - (new Date().getTime() - _this.get('timerStart'))) / (_this.get('recordSegmentLength') * 10);
                    $('.progress-bar').css('width', prctDone + '%');
                }, 100));
                if (this.get('recordingRequired')) {
                    this.set('okayToProceedTimer', window.setTimeout(function() {
                        _this.enableNext();
                    }, 1000 * this.get('recordingRequired')));
                }
            }
            $('#pauseButton').show();
            $('#recordButton').hide();
            $('#recordingIndicator').show();
            $('#recordingText').text('Recording...');
            $('#recordButtonText').text('Resume');
        },

        proceed() { // make sure 'next' fires while still on this frame
            window.clearTimeout(this.get('recordingTimer')); // no need for current timer
            window.clearTimeout(this.get('okayToProceedTimer'));
            window.clearInterval(this.get('progressTimer'));
            this.stopRecorder().finally(() => {
                this.destroyRecorder();
                this.send('next');
            });
        },
        pause() {
            var _this = this;
            $('#recordingText').text('Stopping and uploading...');
            $('#pauseButton').hide();
            window.clearTimeout(_this.get('recordingTimer')); // no need for current timer
            window.clearTimeout(this.get('okayToProceedTimer'));
            window.clearInterval(_this.get('progressTimer'));
            $('.progress-bar').css('width', '100%');
            $('#recordingIndicator').hide();
            this.stopRecorder().finally(() => {
                $('#recordButton').show();
                $('#recordingText').text('Paused');
                _this.destroyRecorder();
                _this.setupRecorder(_this.$(_this.get('recorderElement')), false);
            });
        },
        toggleWebcamButton() {
            if (!this.toggling) {
                this.set('toggling', true);
                if (!this.get('hidden')) {
                    $('#webcamToggleButton').html('Show');
                    $('#hiddenWebcamMessage').show();
                    $(this.get('recorderElement') + ' div').addClass('exp-lookit-observation-hidevideo');
                    this.set('hidden', true);
                    /**
                     * Webcam display hidden from participant
                     *
                     * @event hideWebcam
                     */
                    this.send('setTimeEvent', 'hideWebcam');
                } else {
                    $('#webcamToggleButton').html('Hide');
                    $('#hiddenWebcamMessage').hide();
                    $(this.get('recorderElement') + ' div').removeClass('exp-lookit-observation-hidevideo');
                    this.set('hidden', false);
                    /**
                     * Webcam display shown to participant
                     *
                     * @event showWebcam
                     */
                    this.send('setTimeEvent', 'showWebcam');
                }
                this.set('toggling', false);
            }
        }
    }
});
