import ExpFrameBaseComponent from 'exp-player/components/exp-frame-base/component';
import VideoRecord from '../../mixins/video-record';
import layout from './template';

export default ExpFrameBaseComponent.extend(VideoRecord, {
    type: 'exp-lookit-observation',
    layout: layout,
    meta: {
        name: 'ExpLookitObservation',
        description: 'TODO: a description of this frame goes here.',
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
    disableRecord: Em.computed('recorder.recording', 'hasCamAccess', function () {
        return !this.get('hasCamAccess') || this.get('recorder.recording');
    }),
    recordingStarted: false,

    didInsertElement() {
        this.setupRecorder(this.$('.recorder'), false);
    },

    actions: {
        record() {
            this.startRecorder();
            window.setTimeout(() => {
                this.set('recordingStarted', true);
            }, 2000);
        },
        finish() {
            this.stopRecorder().then(() => {
                this.send('next');
            });
        },
        toggleWebcamButton() {
            $('.recorder div').fadeToggle(400, "swing", function(){
                if($('.recorder div').css('display') === "none") {
                    $('#webcamToggleButton').html('Show');
                } else {
                    $('#webcamToggleButton').html('Hide');
                };
            });
        }
    }
});
