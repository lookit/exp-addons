import Ember from 'ember';

/**
 * @module exp-player
 * @submodule services
 */

let {
    $,
    RSVP
} = Ember;

// List of hooks and internal flash widget recorder methods:
//    https://addpipe.com/docs#javascript-events-api
//    New events available in HTML5: onRecorderInit, onRecorderReady, onConnectionClosed,
//     onMicActivityLevel, onSaveOk
const HOOKS = [ 'onRecordingStarted',
                'onCamAccess',
                'onRecorderReady',
                'onUploadDone',
                'userHasCamMic',
                'onConnectionStatus',
                'onMicActivityLevel'];

const ATTRIBUTES = {
    align: 'middle',
    id: 'hdfvr-content',
    name: 'VideoRecorder'
};

const MIN_VOLUME = 5;

const FLASHVARS = {
    recorderId: '123',
    qualityurl: "avq/480p.xml",
    accountHash: "daad899f51576eff62be94f2ec1b1952",
    eid: 1, // environment
    showMenu: "false", // show recording button menu
    mrt: 100000000, // max recording time in seconds (don't use)
    sis: 1, // skip initial screen
    asv: 1, // autosave recordings
    mv: 0,
    dpv: 0,
    ao: 0, // audio-only
    dup: 0 // allow file uploads
};

/**
 * An instance of a video recorder tied to or used by one specific page. A given experiment may use more than one
 *   video recorder depending on the number of video capture frames.
 * @class VideoRecorderObject
 */
const VideoRecorder = Ember.Object.extend({
    manager: null,

    height: 'auto',
    width: '100%',
    element: null,

    attributes: {},
    flashVars: {},

    divId: Ember.computed.alias('attributes.id'),
    videoId: Ember.computed.alias('flashVars.userId'),
    recorderId: Ember.computed.alias('flashVars.recorderId'),

    started: Ember.computed.alias('_started').readOnly(),
    hasCamAccess: false,
    hasWebCam: false,
    recording: Ember.computed.alias('_recording').readOnly(),
    flashReady: Ember.computed.alias('_recorderReady').readOnly(),
    connected: false,

    debug: true,
    hidden: false,
    _started: false,
    _camAccess: false,
    _recording: false,
    _recorderReady: false,

    _recordPromise: null,
    _stopPromise: null,

    micChecked: false,

    //recorder: null,

    recorder: Ember.computed(function () {
        return document.VideoRecorder;
    }).volatile(),

    /**
     * Install a recorder onto the page and optionally begin recording immediately.
     *
     * @method install
     * @param record
     * @return {Promise} Indicate whether widget was successfully installed and started
     */
    install({record: record} = {record: false}) {
        let origDivId = this.get('divId');
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
        if (hidden) { // Showing this upon 'hidden' has some unexpected side effects.
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
        $container.append($('<div>', {id: origDivId})); // TODO: remove magic text
        $element.append($container);
        if (hidden) { // TODO: is there a way to link this to something other than 'hidden'?
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
            window.size = { // just display size when showing to user. We override css.
                width: 320,
                height: 240
            };
            // Make flashvars available globally for Pipe.
            window.flashvars = Ember.copy(FLASHVARS, true);

            // TODO: can we put this elsewhere instead of loading here?
            $.getScript('https://cdn.addpipe.com/1.3/pipe.js');

            this.set('_started', true);

            if (record) {
                return this.record();
            } else {
                return resolve();
            }
        });
    },

    /**
     * Start recording a video, and allow the state of the recording to be accessed for later usage
     *
     * @method record
     * @return {Promise}
     */
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

    /**
     * Pause the recorder. If optional skipIfMissing argument is provided (and
     *   true), don't raise an error if recording isn't ready yet.
     * @method pause
     * @param skipIfMissing
     */
    pause(skipIfMissing) {
        var recorder = this.get('recorder');
        if (!skipIfMissing || recorder.pauseRecording) {
            recorder.pauseRecording();
            console.log('Recording paused');
        }
        this.set('_recording', false);
        return new Ember.RSVP.Promise((resolve) => resolve());
    },
    /**
     * Resume the recording
     * @method resume
     */
    resume() {
        console.log('Recording resumed');
        this.get('recorder').resumeRecording();
        this.set('_recording', true);
        return new Ember.RSVP.Promise((resolve) => {
            window.setTimeout(() => resolve(), 0);
        });
    },

    /**
     * Get a timestamp based on the current recording position. Useful to ensure that tracked timing events
     *  line up with the video.
     * @method getTime
     * @return {Date|null}
     */
    getTime() {
        let recorder = this.get('recorder');
        if (recorder && recorder.getStreamTime) {
            return parseFloat(recorder.getStreamTime());
        }
        return null;
    },

    /**
     * Stop recording and save the video to the server
     * @method stop
     * @param destroy
     */
    stop({destroy: destroy} = {destroy: false}) {
        // Force at least 1.5 seconds of video to be recorded. Otherwise upload is never called
        // We optimistically start the connection before checking for camera access. For now, let recorder stop
        // immediately if recorder never had camera access- the video would be meaningless anyway
        if (this.get('hasCamAccess') && (1.5 - this.getTime() > 0)) {
            window.setTimeout(this.stop.bind(this, {
                destroy: destroy
            }), 1.5 - this.getTime());
        } else {
            var recorder = this.get('recorder');
            if (recorder) {
                Ember.run.next(this, () => {
                    try {
                        recorder.stopVideo();
                    } catch (e) {
                        // TODO: Under some conditions there is no stopVideo method- can we do a better job of
                        //  identifying genuine errors?
                    }
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

    /**
     * Hide the recorder from display. Useful if you would like to keep recording without extra UI elements to
     *   distract the user.
     * @method hide
     */
    hide() {
        this.get('$container').removeClass('video-recorder-visible');
        this.get('$container').addClass('video-recorder-hidden');
    },

    /**
     * Show the recorder to the user. Useful if you want to temporarily show a hidden recorder- eg to let the user fix
     *   a problem with video capture settings
     * @method show
     * @return {boolean}
     */
    show() {
        this.get('$container').removeClass('video-recorder-hidden');
        this.get('$container').addClass('video-recorder-visible');
        return true;
    },

    /**
     * Uninstall the video recorder from the page
     *
     * @method destroy
     */
    destroy() {
        console.log(`Destroying the videoRecorder: ${this.get('divId')}`);
        $(`#${this.get('divId')}-container`).remove();
        removePipeRecorder(); // TODO: this may destroy ALL recorders, not just this one.
        this.set('_recording', false);
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

    _onRecorderReady() {
        this.set('_recorderReady', true);
    },

    _userHasCamMic(hasCam) {
        this.set('hasWebCam', Boolean(hasCam));
    },

    _onConnectionStatus(status) {
        if (status === 'NetConnection.Connect.Success') {
            this.set('connected', true);
        } else {
            this.set('connected', false);
        }
    },

    _onMicActivityLevel(activityLevel) {
        if (activityLevel > MIN_VOLUME) {
            this.set('micChecked', true);
        }
    }
    // End Flash hooks
});

/**
 * A service designed to facilitate video recording by providing helper methods and managing multiple recorder objects
 *  Using a persistent service is intended to ensure we destroy recorder elements when the video is done uploading,
 *  rather than just when the user exits the frame
 *
 * @class videoRecorder
 */
export default Ember.Service.extend({
    _recorders: {},

    //Initial setup, installs webcam hooks into the page
    init() {
        var runHandler = function (recorder, hookName, args) {
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
            var _this = this;
            window[hookName] = function () {
                var args = Array.prototype.slice.call(arguments);
                var recorder;
                if (hookName === 'onUploadDone') {
                    recorder = _this.get(`_recorders.${args[3]}`);
                } else {
                    var recorderId = args.shift();
                    // Make sure this recorder ID is actually in _recorders;
                    // otherwise fails by returning all of _recorders in this case.
                    if (_this._recorders.hasOwnProperty(recorderId)) {
                        recorder = _this.get(`_recorders.${recorderId}`);
                    }
                }
                if (!recorder) {
                    Object.keys(_this.get('_recorders')).forEach((id) => {
                        recorder = _this.get(`_recorders.${id}`);
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
        if (typeof (videoId) !== 'string') {
            throw new Error('videoId must be a string');
        }
        var defaults = {
            config: false,
            hidden: false
        };
        Ember.merge(defaults, settings);

        var props = {
            flashVars: Ember.copy(FLASHVARS, true),
            attributes: Ember.copy(ATTRIBUTES, true),
            manager: this
        };
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
