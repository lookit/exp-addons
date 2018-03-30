import Ember from 'ember';
import layout from './template';

import ExpFrameBaseComponent from '../../components/exp-frame-base/component';
import VideoRecord from '../../mixins/video-record';

/**
 * @module exp-player
 * @submodule frames
 */

/**
Video configuration frame guiding user through making sure permissions are set appropriately and microphone is working, with troubleshooting text. All content is hard-coded for a general-purpose technical setup frame.

```json
"frames": {
    "video-config": {
        "id": "video-config",
        "kind": "exp-video-config"
    }
}
```

@class ExpVideoConfig
@extends ExpFrameBase
@extends VideoRecord
*/

export default ExpFrameBaseComponent.extend(VideoRecord, {
    layout,
    videoRecorder: Ember.inject.service(),
    recorder: null,
    showWarning: false,
    micChecked: Em.computed.alias('recorder.micChecked'),
    hasCamAccess: Ember.computed.alias('recorder.hasCamAccess'),
    hasWebCam: Ember.computed.alias('recorder.hasWebCam'),
    showWebCamWarning: Ember.computed.not('hasWebCam'),

    _setupRecorder() {
        var recorder = this.get('videoRecorder').start('', this.$('#recorder'), {config: true});
        recorder.install();
        this.set('recorder', recorder);
    },

    applyAudioSourceChange() {
        this.get('recorder').set('micChecked', false);
        this.applySourceSelections();
    },

    applySourceSelections() {
        function setSource(stream) {
            $('#pipeVideoInput')[0].srcObject = stream;
        }
        var audioSource = $('select#audioSource')[0].value;
        var videoSource = $('select#videoSource')[0].value;
        var constraints = {
            audio: {deviceId: audioSource ? {exact: audioSource} : undefined},
            video: {deviceId: videoSource ? {exact: videoSource} : undefined}
        };
        console.log(constraints);

        navigator.mediaDevices.getUserMedia(constraints).then(setSource);
    },

    didInsertElement() {
        this._setupRecorder();
        this.send('getSources');
        this._super(...arguments);
    },

    actions: {

        next() {
            this.stopRecorder(); // Don't wait for promise to resolve since we're not uploading
            this.destroyRecorder();
            this._super(...arguments);
        },

        checkAudioThenNext() {
            if (!this.get('micChecked')) {
                this.set('showWarning', true);
            } else {
                this.send('next');
            }
        },

        getSources() {
            var _this = this;
            function gotDevices(deviceInfos) {
                var audioSelect = $('select#audioSource');
                var videoSelect = $('select#videoSource');

                audioSelect.empty();
                videoSelect.empty();

                for (var i = 0; i !== deviceInfos.length; ++i) {
                    var deviceInfo = deviceInfos[i];
                    var option = document.createElement('option');
                    option.value = deviceInfo.deviceId;
                    if (deviceInfo.kind === 'audioinput') {
                        option.text = deviceInfo.label ||
                            'microphone ' + (audioInputSelect.length + 1);
                        audioSelect.append(option);
                    } else if (deviceInfo.kind === 'videoinput') {
                        option.text = deviceInfo.label || 'camera ' + (videoSelect.length + 1);
                        videoSelect.append(option);
                    }
                }
              audioSelect.off('change');
              videoSelect.off('change');
              audioSelect.on('change', _this.applyAudioSourceChange.bind(_this));
              videoSelect.on('change', _this.applySourceSelections.bind(_this));
            }
            // TODO: save current selections when refreshing; error handling
            // TODO: error handling
            navigator.mediaDevices.enumerateDevices().then(gotDevices);
        }
    },

    type: 'exp-videoconfig',
    meta: {
        name: 'Video Recorder Configuration',
        description: 'TODO: a description of this frame goes here.',
        parameters: {
            type: 'object',
            properties: {
                /**
                A unique identifier for this item
                @property {String} id
                */
                id: {
                    type: 'string',
                    description: 'A unique identifier for this item'
                },
                /**
                Text to show as the introduction to the troubleshooting tips section
                @property {String} troubleshootingIntro
                @default "Some families are having trouble initially getting their webcams to work on Lookit. We're sorry, and we're working on switching away from Flash to make recording more reliable! In the meantime, these instructions should fix most problems."
                */
                troubleshootingIntro: {
                    type: 'string',
                    description: 'Text to show as introduction to troubleshooting tips section',
                    default: "We're just getting started with a new method for video recording! If you're having trouble and the instructions below don't fix it, we're sorry - and we'd love to hear from you so we can improve the system."
                }

            },
            required: ['id']
        },
        data: {
            type: 'object',
            properties: {}
        }
    }
});
