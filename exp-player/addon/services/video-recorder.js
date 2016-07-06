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

export default Ember.Service.extend({
    height: 'auto',
    width: '100%',
    params: PARAMS,
    flashVars: FLASHVARS,
    attributes: ATTRIBUTES,

    divId: Ember.computed.alias('attributes.id'),
    sscode: Ember.computed.alias('flashVars.sscode'),
    videoId: Ember.computed.alias('flashVars.userId'),

    started: Ember.computed.alias('_started').readOnly(),
    camAccess: Ember.computed.alias('_camAccess').readOnly(),
    recording: Ember.computed.alias('_recording').readOnly(),
    flashReady: Ember.computed.alias('_flashReady').readOnly(),

    debug: true,
    _started: false,
    _camAccess: false,
    _recording: false,
    _flashReady: false,
    _SWFId: null,
    _hidden: false,

    _recordPromise: null,

    //Initial setup, installs flash hooks into the page
    init() {
        this.set('_started', false);

        let self = this;
        HOOKS.forEach(hookName => {
            window[hookName] = function() {
                if (self.get('debug')) {
                    console.log(hookName, arguments);
                }
                if (self.get('_' + hookName)) {
                    self.get('_' + hookName).apply(self, arguments);
                }
                if (self.get(hookName)) {
                    self.get(hookName).apply(self, arguments);
                }
            };
        });
    },

    //Insert the recorder and start recording
    //Returns a promise that resolve to true or false to indicate
    //whether or not recording has started.
    //IE a user might not have granted access to their webcam
    start(videoId, element, {
        config: config,
        hidden: hidden,
        record: record
    } = {
        config: false,
        hidden: false,
        record: true
    }) {
        if (this.get('started')) {
            throw new Error('Video recorder already started');
        }
        if (typeof(videoId) !== 'string') {
            throw new Error('videoId must be a string');
        }

        this.set('videoId', videoId);
        this.set('sscode', config ? 'asp' : 'php');

        var divId = this.get('divId');
        // Remove any old recorders
        return this.destroy().then(() => {

            var $element = $(element);
            if (hidden) {
                $element = $('body');
            }
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
                this.set('_hidden', true);
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
                            reject(new Error('Install failed'));
                        }
                        this.set('_started', true);
                        this.set('_SWFId', vr.id);
                        this.set('recorder', window.swfobject.getObjectById(vr.id));
                        $('#' + vr.id).css('height', '100%');

                        if (record) {
                            return resolve(this.record());
                        }
                        return resolve();
                    });
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
        let getStreamTime = (this.get('recorder') || {}).getStreamTime;
        if (getStreamTime) {
            return getStreamTime();
        }
        return null;
    },

    // Stop recording and save the video to the server
    // By default destroys the flash element
    stop({
        destroy: destroy
    } = {
        destroy: false
    }) {
        if (this.get('recording')) {
            // Force at least 1.5 seconds of video to be recorded. Otherwise upload is never called
            if (1.5 - this.get('recorder').getStreamTime() > 0) {
                return setTimeout(this.stop.bind(this, {
                    destroy: destroy
                }), 1.5 - this.getTime());
            }
            this.get('recorder').stopVideo();
            this.set('_recording', false);
            if (this.get('_hidden')) {
                var divId = this.get('divId');
                $(`#${divId}`).attr({
                    id: null
                });
                $(`#${divId}-container`).attr({
                    id: null
                });
                this.set('_hidden', false);
            }
        }
        if (!this.get('started')) {
            return null;
        }
        this.set('_started', false);
        if (destroy) {
            this.destroy();
        }
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
            if (++count > 1000) {
                return window.clearInterval(id), this.get('_recordPromise').reject(new Error('Could not start recording'));
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

    // Uninstall the video recorder
    destroy() {
        $(`#${this.get('divId')}-container`).remove();
        this.set('recorder', null);
        this.set('_recording', false);
        window.swfobject.removeSWF(this.get('_SWFId'));
        return new Ember.RSVP.Promise((resolve) => {
            window.setTimeout(function() {
                resolve();
            }, 0);
        });
    },
    // TODO: right now this may prematurely cancel an upload if still uploading when called
    finished() {
        $('.video-recorder-bg').remove();
        return new Ember.RSVP.Promise((resolve) => {
            window.setTimeout(function() {
                resolve();
            }, 0);
        });
    },

    show() {
        $(`#${this.get('divId')}-container`).removeAttr('style');
        $(`#${this.get('divId')}-container`).css({
            height: '100%'
        });
        return true;
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

    _onUploadDone(_, __, videoId) {
        this.set('_recording', false);
        $(`div[data-videoid="${videoId}"]`).remove();
    },

    _onCamAccess(allowed, recorderId) { // jshint ignore:line
        this.set('_camAccess', allowed);
    },

    _onFlashReady() {
        console.log('Flash is ready');
        this.set('_flashReady', true);
    }
    // End Flash hooks
});
