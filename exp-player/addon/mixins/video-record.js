import Ember from 'ember';

/**
 * @module exp-player
 * @submodule mixins
 */

/**
 * A mixin that can be used to add basic support for video recording to a particular experiment frame
 *
 * @class VideoRecordMixin
 */

/**
 * When recorder detects a change in camera access
 *
 * @event hasCamAccess
 * @param {Boolean} hasCamAccess
 */

/**
 * When recorder detects a change in video stream connection status
 *
 * @event videoStreamConnection
 * @param {String} status status of video stream connection, e.g.
 * 'NetConnection.Connect.Success' if successful
 */

/**
 * When pausing study, immediately before request to pause webcam recording
 *
 * @event pauseVideo
 */

/**
 * When unpausing study, immediately before request to resume webcam recording
 *
 * @event unpauseVideo
 */

/**
 * Just before stopping webcam video capture
 *
 * @event stoppingCapture
 */

export default Ember.Mixin.create({

    /**
     * The recorder object, accessible to the consuming frame. Includes properties
     * recorder.hasWebCam, recorder.hasCamAccess, recorder.micChecked, recorder.connected.
     * @property {VideoRecorder} recorder
     */
    recorder: null,

    /**
     * This mixin automatically injects the video recorder service.
     * @property videoRecorder
     */
    videoRecorder: Ember.inject.service(), // equiv to passing 'video-recorder'

    /**
     * A list of all video IDs used in this mixing (a new one is created for each recording).
     * Accessible to consuming frame.
     * @property {List} videoList
     */
    videoList: null,

    /**
     * Whether recording is stopped already, meaning it doesn't need to be re-stopped when
     * destroying frame
     * @property {Boolean} stoppedRecording
     */
    stoppedRecording: false,

    /**
     * JQuery string to identify the recorder element.
     * @property {String} [recorderElement='#recorder']
     */
     recorderElement: '#recorder',

     /**
     * Whether recorder has been set up yet. Automatically set when doing setup.
     * Accessible to consuming frame.
     * @property {Boolean} recorderReady
     */
     recorderReady: false,

     /**
     * Whether to use the camera in this frame. Consuming frame should set this property
     * to override if needed.
     * @property {Boolean} [doUseCamera=true]
     */
     doUseCamera: true,

     /**
     * Whether to start recording ASAP (only applies if doUseCamera). Consuming frame
     * should set to override if needed.
     * @property {Boolean} [startRecordingAutomatically=false]
     */
     startRecordingAutomatically: false,

    /**
     * A video ID to use for the current recording. Format is
     * `pipe_<experimentId>_<frameId>_<sessionId>_timestampMS_RRR`
     * where RRR are random numeric digits.
     *
     * @property {String} videoId
     */
    videoId: '',

    _generateVideoId() {
        return [
            'pipe',
            this.get('experiment.id'),
            this.get('id'),
            this.get('session.id'),
            + Date.now(), // Timestamp in ms
            Math.floor(Math.random() * 1000)
        ].join('_');
    },

    /**
     * Extend any base time event capture with information about the recorded video
     * @method makeTimeEvent
     * @param eventName
     * @param extra
     * @return {Object} Event data object
     */
    makeTimeEvent(eventName, extra) {
        // All frames using this mixin will add videoId and streamTime to every server event
        let base = this._super(eventName, extra);
        const streamTime = this.get('recorder') ? this.get('recorder').getTime() : null;
        Ember.merge(base, {
            videoId: this.get('videoId'),
            pipeId: this.get('recorder') ? this.get('recorder').get('pipeVideoName') : null,
            streamTime: streamTime
        });
        return base;
    },

    /**
     * Set up a video recorder instance
     * @method setupRecorder
     * @param {Node} element A DOM node representing where to mount the recorder
     * @param {Boolean} record Whether to start the recording immediately
     * @param {Object} settings Config to pass to the newly created VideoRecorder
     * @return {Promise} A promise representing the result of installing the recorder
     */
    setupRecorder(element, record, settings = {}) {
        const videoId = this._generateVideoId();
        this.set('videoId', videoId);
        const recorder = this.get('videoRecorder').start(videoId, element, settings);
        const pipeLoc = this.container.lookupFactory('config:environment')['pipeLoc'];
        const installPromise = recorder.install({record}, this.get('videoId'), pipeLoc);

        // Track specific events for all frames that use  VideoRecorder
        recorder.on('onCamAccess', (hasAccess) => {
            this.send('setTimeEvent', 'recorder.hasCamAccess', {
                hasCamAccess: hasAccess
            });
        });
        recorder.on('onConnectionStatus', (status) => {
            this.send('setTimeEvent', 'videoStreamConnection', {
                status: status
            });
        });
        this.set('recorder', recorder);
        return installPromise;
    },

    /**
     * Pause the recorder (and capture timing events). For webRTC recorder, this is
     * just a placeholder and doesn't actually pause the recording. If webRTC used,
     * includes extra data actuallyPaused: false. This is for backwards compatibility
     * with frames that pause/resume recording, and should not be used going forward -
     * instead stop/start and make separate clips if needed.
     * @method pauseRecorder
     * @param [skipIfMissing=false] If provided (and true), don't raise an error if recording isn't ready yet. Not actually used for WebRTC.
     */
    pauseRecorder(skipIfMissing = false) { // leave param for backwards compatibility
        const recorder = this.get('recorder');
        if (recorder) {
            this.send('setTimeEvent', 'pauseCapture', {
                actuallyPaused: false
            });
            // Would pause here!
        }
    },

    /**
     * Resume a paused recording. For webRTC recorder, this is just a placeholder and
     * doesn't actually pause the recording. If webRTC used, includes extra data
     * wasActuallyPaused: false. This is for backwards compatibility
     * with frames that pause/resume recording, and should not be used going forward -
     * instead stop/start and make separate clips if needed.
     * @method resumeRecorder
     */
    resumeRecorder() {
        const recorder = this.get('recorder');
        if (recorder) {
            this.send('setTimeEvent', 'unpauseCapture', {
                wasActuallyPaused: false
            });
            // Would resume here!
        }
    },

    /**
     * Start recording
     * @method startRecorder
     * @return Promise Resolves when recording has started
     */
    startRecorder() {
        const recorder = this.get('recorder');
        if (recorder) {
            return recorder.record().then(() => {
                this.send('setTimeEvent', 'startRecording');
                if (this.get('videoList') == null) {
                    this.set('videoList', [this.get('videoId')]);
                } else {
                    this.set('videoList', this.get('videoList').concat([this.get('videoId')]))
                }
            });
        } else {
            return Ember.RSVP.resolve();
        }
    },

    /**
     * Stop the recording
     * @method stopRecorder
     * @return Promise A promise that resolves when upload is complete
     */
    stopRecorder() {
        const recorder = this.get('recorder');
        if (recorder && recorder.get('recording')) {
            this.send('setTimeEvent', 'stoppingCapture');
            return this.get('recorder').stop();
        } else {
            return Ember.RSVP.resolve(1);
        }
    },

     /**
     * Destroy recorder and stop accessing webcam
     * @method destroyRecorder
     */
    destroyRecorder() {
        const recorder = this.get('recorder');
        if (recorder) {
            this.send('setTimeEvent', 'destroyingRecorder');
            recorder.destroy();
        }
    },

    willDestroyElement() {
        var _this = this;
        if (_this.get('recorder')) {
            if (_this.get('stoppedRecording')) {
                _this.destroyRecorder();
            } else {
                _this.stopRecorder().then(() => {
                    _this.set('stoppedRecording', true);
                    _this.destroyRecorder();
                }, () => {
                    _this.destroyRecorder();
                })
            }
        }
        _this.send('setTimeEvent', 'destroyingElement');
        _this._super(...arguments);
    },

    didInsertElement() {
    	if (this.get('doUseCamera')) {
    		var _this = this;
    	    this.setupRecorder(this.$(this.get('recorderElement')), false).then(() => {
                /**
                 * When video recorder has been installed
                 *
                 * @event recorderReady
                 */
                _this.send('setTimeEvent', 'recorderReady');
                _this.set('recorderReady', true);
                _this.whenPossibleToRecord(); // make sure this fires
            });
    	}
    	this._super(...arguments);
    },

     /**
     * Observer that starts recording once recorder is ready. Override to do additional
     * stuff at this point!
     * @method whenPossibleToRecord
     */
    whenPossibleToRecord: function() {
    	if (this.get('doUseCamera') && this.get('startRecordingAutomatically')) {
    		var _this = this;
			if (this.get('recorder.hasCamAccess') && this.get('recorderReady')) {
				this.startRecorder().then(() => {
					_this.set('recorderReady', false);
				});
			}
    	}
    }.observes('recorder.hasCamAccess', 'recorderReady'),

    init() {
        this._super(...arguments);
        this.set('videoList', []);
    }

});
