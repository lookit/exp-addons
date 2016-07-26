import Ember from 'ember';

let {
    $,
    RSVP
} = Ember;

const HOOKS = ['onRecordingStarted', 'onCamAccess', 'onFlashReady', 'onUploadDone'];

const ATTRIBUTES = {
    align: 'middle',
    id: 'VideoRecorder',
    name: 'VideoRecorder'
};

const FLASHVARS = {
    authenticity_token: '',
    lstext: 'Loading...',
    mrt: '120',
    qualityurl: 'audio_video_quality_profiles/320x240x30x90.xml',
    recorderId: '123',
    sscode: 'php',
    userId: 'XXY'
};

const PARAMS = {
    quality: 'high',
    bgcolor: '#dfdfdf',
    play: 'true',
    loop: 'false',
    allowscriptaccess: 'sameDomain',
    wmode: 'transparent'
};

const VideoRecorder = Ember.Object.extend({
    manager: null,

    height: 'auto',
    width: '100%',
    element: null,

    attributes: {},
    flashVars: {},

    divId: Ember.computed.alias('attributes.id'),
    sscode: Ember.computed.alias('flashVars.sscode'),
    videoId: Ember.computed.alias('flashVars.userId'),
    recorderId: Ember.computed.alias('flashVars.recorderId'),

    started: Ember.computed.alias('_started').readOnly(),
    hasCamAccess: false,
    recording: Ember.computed.alias('_recording').readOnly(),
    flashReady: Ember.computed.alias('_flashReady').readOnly(),

    debug: true,
    hidden: false,
    _started: false,
    _camAccess: false,
    _recording: false,
    _flashReady: false,
    _SWFId: null,

    _recordPromise: null,
    _stopPromise: null,

    recorder: Ember.computed(function() {
        var recorder = window.swfobject.getObjectById(this.get('_SWFId'));
        return recorder;
    }).volatile(),

    install({
        record: record
    } = {
        record: false
    }) {
        this.set('divId', `${this.get('divId')}-${this.get('recorderId')}`);

        var $element = $(this.get('element'));
        let hidden = this.get('hidden');
        if (hidden) {
            $element = $('body');
        }

        let divId = this.get('divId');
        let videoId = this.get('videoId');

        $element.append(
            $('<div>', {
                id: `${divId}-container`,
                'data-videoid': videoId,
                css: {
                    height: '100%'
                }
            }).append(`<div id="${divId}"></div`)
        );

        if (hidden) {
            this.hide();
        }

        return new RSVP.Promise((resolve, reject) => {
            window.swfobject.embedSWF(
                'VideoRecorder.swf',
                document.getElementById(divId),
                this.get('width'),
                this.get('height'),
                '10.3.0',
                '',
                this.get('flashVars'),
                this.get('params'),
                this.get('attributes'),
                vr => {
                    if (!vr.success) {
                        return reject(new Error('Install failed'));
                    }
                    this.set('_started', true);
                    this.set('_SWFId', vr.id);
                    $('#' + vr.id).css('height', '100%');
                    console.log('Install success');
                    if (record) {
                        return this.record();
                    } else {
                        return resolve();
                    }
                });
        });
    },

    record() {
        if (!this.get('started')) {
            throw new Error('Must call start before record');
        }
        if (this.get('recording')) {
            throw new Error('Already recording');
        }
        let count = 0;
        let id = window.setInterval(() => {
            if (++count > 50) {
                if (this.get('onCamAccess')) {
                    this.get('onCamAccess').call(this, false);
                }
                return window.clearInterval(id), this.get('_recordPromise').reject();
            }
            if (!this.get('recorder').record) {
                return null;
            }
            this.get('recorder').record();
            window.clearInterval(id);
            return null;
        }, 100);

        return new Ember.RSVP.Promise((resolve, reject) => {
            this.set('_recordPromise', {
                resolve,
                reject
            });
        });
    },

    // Pause the recorder. If optional skipIfMissing argument is provided (and
    // true), don't raise an error if recording isn't ready yet.
    pause(skipIfMissing) {
        var recorder = this.get('recorder');
        if (!skipIfMissing || recorder.pauseRecording) {
            recorder.pauseRecording();
            console.log('Recording paused');
        }
        this.set('_recording', false);
        return new Ember.RSVP.Promise((resolve) => resolve());
    },
    resume() {
        console.log('Recording resumed');
        this.get('recorder').resumeRecording();
        this.set('_recording', true);
        return new Ember.RSVP.Promise((resolve) => {
            window.setTimeout(() => resolve(), 0);
        });
    },
    getTime() {
        let recorder = this.get('recorder');
        if (recorder && recorder.getStreamTime) {
            return parseFloat(recorder.getStreamTime());
        }
        return null;
    },

    // Stop recording and save the video to the server
    stop({
        destroy: destroy
    } = {
        destroy: false
    }) {
        if (this.get('recording')) {
            // Force at least 1.5 seconds of video to be recorded. Otherwise upload is never called
            if (1.5 - this.getTime() > 0) {
                window.setTimeout(this.stop.bind(this, {
                    destroy: destroy
                }), 1.5 - this.getTime());
            } else {
                try {
                    this.get('recorder').stopVideo();
                } catch (e) {}
                this.set('_recording', false);
            }
            var _stopPromise = new Ember.RSVP.Promise((resolve, reject) => {
                this.set('_stopPromise', {
                    resolve: resolve,
                    reject: reject
                });
            });
            return _stopPromise;
        }
        return new Ember.RSVP.Promise((resolve) => resolve());
    },

    hide() {
        $(`#${this.get('divId')}-container`).css({
            'top': '-10000px',
            'left': '-10000px',
            'z-index': -1,
            'position': 'absolute'
        });
        return true;
    },
    show() {
        $(`#${this.get('divId')}-container`).removeAttr('style');
        $(`#${this.get('divId')}-container`).css({
            height: '100%'
        });
        return true;
    },

    // Uninstall the video recorder
    destroy() {
        console.log('Destroying the videoRecorder');
        $(`#${this.get('divId')}-container`).remove();
        this.set('_SWFId', null);
        this.set('_recording', false);
        window.swfobject.removeSWF(this.get('_SWFId'));
    },

    finish() {
        return new Ember.RSVP.Promise((resolve) => {
            // todo
            resolve();
        });
    },

    on(eName, func) {
        if (HOOKS.indexOf(eName) === -1) {
            throw `Invalid event ${eName}`;
        }
        this.set(eName, func);
    },
    // Begin Flash hooks
    _onRecordingStarted(recorderId) { // jshint ignore:line
        this.set('_recording', true);
        if (this.get('_recordPromise')) {
            this.get('_recordPromise').resolve(this);
        }
    },

    _onUploadDone(streamName, streamDuration, userId, recorderId) { // jshint ignore:line
        this.get('manager').destroy(this);
        if (this.get('_stopPromise')) {
            this.get('_stopPromise').resolve();
        }
    },

    _onCamAccess(allowed) { // jshint ignore:line
        this.set('hasCamAccess', allowed);
    },

    _onFlashReady() {
        this.set('_flashReady', true);
    }
    // End Flash hooks
});

export default Ember.Service.extend({
    _recorders: {},

    //Initial setup, installs flash hooks into the page
    init() {
        var runHandler = function(recorder, hookName, args) {
            if (recorder.get('debug')) {
                console.log(hookName, args);
            }

            if (recorder.get('_' + hookName)) {
                recorder.get('_' + hookName).apply(recorder, args);
            }
            if (recorder.get(hookName)) {
                recorder.get(hookName).apply(recorder, args);
            }
        };

        HOOKS.forEach(hookName => {
            var self = this;
            window[hookName] = function() {
                var args = Array.prototype.slice.call(arguments);
                var recorder;
                if (hookName === 'onUploadDone') {
                    recorder = self.get(`_recorders.${args[3]}`);
                } else {
                    var recorderId = args.pop();
                    recorder = self.get(`_recorders.${recorderId}`);
                }
                if (!recorder) {
                    Object.keys(self.get('_recorders')).forEach((id) => {
                        recorder = self.get(`_recorders.${id}`);
                        runHandler(recorder, hookName, args);
                    });
                } else {
                    runHandler(recorder, hookName, args);
                }
            };
        });
    },

    //Insert the recorder and start recording
    //IE a user might not have granted access to their webcam
    start(videoId, element, {
        config: config,
        hidden: hidden
    } = {
        config: false,
        hidden: false
    }) {
        if (typeof(videoId) !== 'string') {
            throw new Error('videoId must be a string');
        }

        var props = {
            params: Ember.copy(PARAMS, true),
            flashVars: Ember.copy(FLASHVARS, true),
            attributes: Ember.copy(ATTRIBUTES, true),
            manager: this
        };
        props.flashVars.sscode = config ? 'asp' : 'php';
        props.flashVars.userId = videoId;
        props.flashVars.recorderId = (new Date().getTime() + '');
        props.element = element;
        props.hidden = hidden;
        let handle = new VideoRecorder(props);
        this.set(`_recorders.${props.flashVars.recorderId}`, handle);
        return handle;
    },
    destroy(recorder) {
        var recorders = this.get('_recorders');
        delete recorders[recorder.get('videoId')];
        this.set('_recorders', recorders);
        recorder.destroy();
    }
});
