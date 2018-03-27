import ExpFrameBaseComponent from 'exp-player/components/exp-frame-base/component';
import VideoRecord from '../../mixins/video-record';
import layout from './template';

export default ExpFrameBaseComponent.extend(VideoRecord, {
    type: 'exp-lookit-observation',
    layout: layout,

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
             * @param {Object} eventTimings
             * @return {Object} The payload sent to the server
             */
            type: 'object',
            properties: {
                videoId: {
                    type: 'string'
                }
            },
            required: ['videoId']
        }
    },
    videoRecorder: Em.inject.service(),
    recorder: null,
    hasCamAccess: Em.computed.alias('recorder.hasCamAccess'),
    videoUploadConnected: Ember.computed.alias('recorder.connected'),
    disableRecord: Em.computed('recorder.recording', 'hasCamAccess', function () {
        return !this.get('hasCamAccess') || this.get('recorder.recording');
    }),
    readyObserver: Ember.observer('hasCamAccess', function(frame) {
        if (frame.get('hasCamAccess')) {
            if (frame.get('startRecordingAutomatically')) {
                frame.send('record');
            } else {
                $('#recordButton').show();
                $('#recordingText').text('Not recording yet');
            }
        }
    }),
    recordingStarted: false,
    warning: null,
    showVideoWarning: false,
    toggling: false,
    hidden: false,

    makeTimeEvent(eventName, extra) {
        return this._super(`exp-lookit-observation:${eventName}`, extra);
    },

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

   didInsertElement() { // Immediately try to set up

        var _this = this;
        $('#hiddenWebcamMessage').hide();
        $('#recordButton').hide();
        $('#pauseButton').hide();
        $('#recordingIndicator').hide();
        $('#recordingText').text('');
        $('#recordButtonText').text('Record');
        if (this.get('experiment') && this.get('id') && this.get('session')) {
            // Start recorder
            this.setupRecorder(this.$('.recorder'), false, {
                hidden: false
            });
        }

        this._super(...arguments);
    },

    willDestroyElement() {
        // Whenever the component is destroyed, make sure that video recorder is stopped
        const recorder = this.get('recorder');
        if (recorder) {
            recorder.hide();
            this.stopRecorder();
        }
        this.send('setTimeEvent', 'destroyingElement');
        this._super(...arguments);
    },

    recordingTimer: null,
    hasStartedRecording: false,

    actions: {
        record() {
            if (this.get('hasStartedRecording')) {
                this.resumeRecorder();
            } else {
                this.set('hasStartedRecording', true);
                this.startRecorder();
            }

            var _this = this;
            if (this.get('recordSegmentLength')) { // no timer if 0
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
        finish() {
            this.stopRecorder().then(() => {
                this.send('next');
            });
        },
        pause() {
            this.pauseRecorder(true);
            $('#pauseButton').hide();
            $('#recordButton').show();
            $('#recordingIndicator').hide();
            $('#recordingText').text('Paused');
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
