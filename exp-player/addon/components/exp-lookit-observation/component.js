import ExpFrameBaseComponent from 'exp-player/components/exp-frame-base/component';
import VideoRecord from '../../mixins/video-record';
import layout from './template';

export default ExpFrameBaseComponent.extend(VideoRecord, {
    type: 'exp-lookit-observation',
    layout: layout,

    recordingTimer: null,
    hasStartedRecording: false,
    recorder: null,
    recordingStarted: false,
    warning: null,
    showVideoWarning: false,
    toggling: false,
    hidden: false,

    meta: {
        name: 'ExpLookitObservation',
        description: 'This frame allows the participant to record an event, intended for observational studies.',
        parameters: {
            type: 'object',
            properties: {
                /**
                 * Array of objects specifying text/images of instructions to display
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

    disableRecord: Em.computed('recorder.recording', 'recorder.hasCamAccess', function () {
        return !this.get('recorder.hasCamAccess') || this.get('recorder.recording');
    }),

    // Override to deal with whether or not recording is starting automatically
    whenPossibleToRecord: function() {
    	if (this.get('startRecordingAutomatically')) {
    		var _this = this;
			if (this.get('hasCamAccess') && this.get('recorderReady')) {
				this.startRecorder().then(() => {
					_this.set('recorderReady', false);
				});
			}
    	} else {
    	    $('#recordButton').show();
            $('#recordingText').text('Not recording yet');
    	}
    }.observes('recorder.hasCamAccess', 'recorderReady'),

    showWarning() {
        if (!this.get('showVideoWarning')) {
                this.set('showVideoWarning', true);
                this.send('setTimeEvent', 'webcamNotConfigured');

                // If webcam error, save the partial frame payload immediately, so that we don't lose timing events if
                // the user is unable to move on.
                this.send('save');

                var recorder = this.get('recorder');
                recorder.show();
                recorder.on('onCamAccessConfirm', () => {
                    this.send('removeWarning');
                    this.startRecorder();
                });
        }
    },

    removeWarning() {
        this.set('showVideoWarning', false);
    },

    didInsertElement() { // initial state of all buttons/text
        var _this = this;
        $('#hiddenWebcamMessage').hide();
        $('#recordButton').hide();
        $('#pauseButton').hide();
        $('#recordingIndicator').hide();
        $('#recordingText').text('');
        $('#recordButtonText').text('Record');
        this._super(...arguments);
    },

    actions: {
        record() {

            this.startRecorder(); // TODO: use then

            var _this = this;
            if (this.get('recordSegmentLength')) { // no timer if 0
                window.clearTimeout(this.get('recordingTimer')); // as a precaution in case still running
                this.set('recordingTimer', window.setTimeout(function() {
                    /**
                     * Video recording automatically paused upon reaching time limit
                     *
                     * @event recorderReady
                     */
                    _this.send('setTimeEvent', 'recorderTimeout');
                    _this.send('pause');
                }, _this.get('recordSegmentLength') * 1000));
            }
            $('#pauseButton').show();
            $('#recordButton').hide();
            $('#recordingIndicator').show();
            $('#recordingText').text('Recording...');
            $('#recordButtonText').text('Resume');
        },

        proceed() {
            this.stopRecorder().then(() => {
                this.destroyRecorder();
                this.send('next');
            });
        },
        pause() {
            window.clearTimeout(this.get('recordingTimer')); // no need for current timer
            this.stopRecorder().then(() => {
                $('#pauseButton').hide();
                $('#recordButton').show();
                $('#recordingIndicator').hide();
                $('#recordingText').text('Paused');
                this.setupRecorder(this.$('.recorder'), false);
            });
        },
        toggleWebcamButton() {
            var _this = this;
            if (!this.toggling) {
                this.set('toggling', true);
                var recorder = this.get('recorder');
                if (!this.get('hidden')) {
                    $('#webcamToggleButton').html('Show');
                    $('#hiddenWebcamMessage').show();
                    $('.recorder div').addClass('exp-lookit-observation-hidevideo');
                    this.set('hidden', true);
                } else {
                    $('#webcamToggleButton').html('Hide');
                    $('#hiddenWebcamMessage').hide();
                    $('.recorder div').removeClass('exp-lookit-observation-hidevideo');
                    this.set('hidden', false);
                }
                this.set('toggling', false);
            }
        }
    }
});
