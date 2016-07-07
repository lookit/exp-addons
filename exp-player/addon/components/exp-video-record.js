import Ember from 'ember';
import layout from '../templates/components/exp-video-record';

import ExpFrameBaseComponent from 'exp-player/components/exp-frame-base';
// import FullScreen from '../mixins/full-screen';
import MediaReload from '../mixins/media-reload';
import VideoPause from '../mixins/video-pause';
import VideoId from '../mixins/video-id';


//TODO Fullsceen issues/functionality
export default ExpFrameBaseComponent.extend(MediaReload, VideoPause, VideoId, {
    layout: layout,
    blockUI: false,
    mayProgress: false,
    // displayFullscreen: false,  // force fullscreen for all uses of this component, always
    // fullScreenElementId: 'player-video',
    videoRecorder: Ember.inject.service(),
    spaceHandler: null,
    didInsertElement() {
        this._super(...arguments);

        this.get('videoRecorder').on('onCamAccess', this.send.bind(this, 'camAccess'));

        this.get('videoRecorder').start(this.get('videoId'), this.$('#recorder'), {
            hidden: true,
            record: false
        }).then(() => {
            if (!this.get('videoRecorder.camAccess')) {
                this.set('blockUI', true);
                this.get('videoRecorder').show();
                Ember.$('body').addClass('modal-open');
            }
        });
    },

    actions: {
        videoFinished() {
            this.send('setTimeEvent', 'videoFinished');
            if (!this.get('mayProgress')) {
                this.set('mayProgress', true);
            } else {
                if (this.get('autoforwardOnEnd')) {
                    this.send('next');
                }
            }
        },
        camAccess(hasAccess) {
            if (!hasAccess) {
                return;
            }
            Ember.$('body').removeClass('modal-open');
            this.set('blockUI', false);
            this.get('videoRecorder').hide();
            Ember.run.scheduleOnce('afterRender', this, () => {
                this.$('video')[0].play();
            });
        },
        timeUpdate(event) {
            let currentTime = event.target.currentTime;

            let startStamp = this.get('startRecording') >= 0 ?
                this.get('startRecording') :
                (this.$('video')[0].duration + this.get('startRecording'));

            if (!this.get('recorded') && !this.get('videoRecorder.recording') && startStamp <= currentTime) {
                this.set('recorded', true);
                this.get('videoRecorder').record();
                return;
            }

            let stopStamp = this.get('stopRecording') > 0 ?
                this.get('stopRecording') :
                (this.$('video')[0].duration + this.get('stopRecording'));

            if (this.get('videoRecorder.recording') && stopStamp <= currentTime) {
                this.get('videoRecorder').stop();
                if (this.get('mayProgress')) {
                    if (this.get('autoforwardOnEnd')) {
                        this.send('next');
                    }
                } else {
                    this.set('mayProgress', true);
                }
            }
        }
    },

    meta: {
        name: 'Video player',
        description: 'Component that plays a video',
        parameters: {
            type: 'object',
            properties: {
                autoforwardOnEnd: { // Generally leave this true, since controls will be hidden for fullscreen videos
                    type: 'boolean',
                    description: 'Whether to automatically advance to the next frame when the video is complete',
                    default: true
                },
                autoplay: {
                    type: 'boolean',
                    description: 'Whether to autoplay the video on load',
                    default: true
                },
                poster: {
                    type: 'string',
                    description: 'A still image to show until the video starts playing',
                    default: ''
                },
                startRecording: {
                    type: 'integer',
                    description: 'The in video time, in seconds, to start recording. Negative indexing is supported. Account for up to 1 second of latency. 0 means the start of the video.',
                    default: 0
                },
                stopRecording: {
                    type: 'integer',
                    description: 'The in video time, in seconds, to stop recording. Negative indexing is supported. Account for up to 1 second of latency. 0 means the end of the video.',
                    default: 0
                },
                sources: {
                    type: 'string',
                    description: 'List of objects specifying video src and type',
                    default: []
                }
            }
        },
        data: {
            type: 'object',
            properties: {
                videoId: {
                    type: 'string'
                }
            },
            required: ['videoId']
        }
    }
});
