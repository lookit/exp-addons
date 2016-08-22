import Ember from 'ember';

let {
    $,
    RSVP
} = Ember;

const HOOKS = ['onRecordingStarted', 'onCamAccess', 'onFlashReady', 'onUploadDone', 'userHasCamMic', 'onConnectionStatus'];

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
    hasWebCam: false,
    recording: Ember.computed.alias('_recording').readOnly(),
    flashReady: Ember.computed.alias('_flashReady').readOnly(),
    connected: false,

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
        return window.swfobject.getObjectById(this.get('_SWFId'));
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

        var $container = $('<div>', {
            id: `${divId}-container`,
            'data-videoid': videoId,
            css: {
                height: '100%'
            }
        });
        this.set('$container', $container);
        if (hidden) {
            $container.append(
                `
<div class="col-md-12">
    <h3> Please make sure your webcam is configured correctly </h3>
    <div class="row">
	<div class="col-md-12">
	    <p>There was a problem connecting to your webcam! Please try selecting your webcam again below and clicking "allow" and "remember", like you did at the start of the study. If that doesn't work, you can end the study early by pressing F1. </p>
	    <p class="pull-right"><em>* Please note: we are <strong>not</strong> recording any video during setup.</em></p>
	</div>
    </div>
</div>
`
            );
        }

        $container.append(`<div id="${divId}"></div`);
        $element.append($container);
        if (hidden) {
            $container.append(
                $('<div>').addClass('row').append(
                    $('<div>').addClass('col-md-12').append(
                        ['<br>',
                            $('<button>', {
                                text: 'Continue'
                            }).addClass('btn btn-success pull-right disabled')
                        ]
                    )
                )
            );
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
        // Force at least 1.5 seconds of video to be recorded. Otherwise upload is never called
        if (1.5 - this.getTime() > 0) {
            window.setTimeout(this.stop.bind(this, {
                destroy: destroy
            }), 1.5 - this.getTime());
        } else {
	    var recorder = this.get('recorder');
	    if (recorder) {
		Ember.run.next(this, () => {
		    try {
			recorder.stopVideo();
		    } catch (e) {}
		    this.set('_recording', false);
		});
	    }
        }
        var _stopPromise = new Ember.RSVP.Promise((resolve, reject) => {
            this.set('_stopPromise', {
                resolve: resolve,
                reject: reject
            });
        });
        return _stopPromise;
    },

    hide() {
        this.get('$container').removeClass('video-recorder-visible');
        this.get('$container').addClass('video-recorder-hidden');
    },
    show() {
        this.get('$container').removeClass('video-recorder-hidden');
        this.get('$container').addClass('video-recorder-visible');
        return true;
    },

    // Uninstall the video recorder
    destroy() {
        console.log(`Destroying the videoRecorder: ${this.get('divId')}`);
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
        if (HOOKS.indexOf(eName) === -1 && eName !== 'onCamAccessConfirm') {
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
        if (this.get('hidden')) {
            this.get('$container').find('button').removeClass('disabled').on(
                'click',
                () => {
                    if (this.get('onCamAccessConfirm')) {
                        this.get('onCamAccessConfirm').call(this);
                    }
                }
            );
        }
    },

    _onFlashReady() {
        this.set('_flashReady', true);
    },

    _userHasCamMic(hasCam) {
        this.set('hasWebCam', Boolean(hasCam));
    },

    _onConnectionStatus(status) {
	if (status === 'NetConnection.Connect.Success') {
	    this.set('connected', true);
	}
	else {
	    this.set('connected', false);
	}
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
    start(videoId, element, settings = {}) {
        if (typeof(videoId) !== 'string') {
            throw new Error('videoId must be a string');
        }
        var defaults = {
            config: false,
            hidden: false
        };
        Ember.merge(defaults, settings);

        var props = {
            params: Ember.copy(PARAMS, true),
            flashVars: Ember.copy(FLASHVARS, true),
            attributes: Ember.copy(ATTRIBUTES, true),
            manager: this
        };
        props.flashVars.sscode = defaults.config ? 'asp' : 'php';
        props.flashVars.userId = videoId;
        props.flashVars.recorderId = (new Date().getTime() + '');
        props.element = element;
        props.hidden = defaults.hidden;
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
