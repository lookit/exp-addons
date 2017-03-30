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
     * The recorder object. It is the responsibility of the consuming frame to set up the recorder when appropriate,
     *   and to set this property. If present, the mixin will automatically use it for things such as capturing stream
     *   time.
     * @property {VideoRecorder} recorder
     */
    recorder: null,

    /**
     * This mixin automatically injects the video recorder service, making its methods available to your frame
     * @property videoRecorder
     */
    videoRecorder: Ember.inject.service(),

    /**
     * A video ID to use for this recording. Defaults to the format `<experimentId>_<frameId>_<sessionId>_`
     *
     * There may be additional prefixes/suffixes added elsewhere in the video recording process. A final video
     * captured via this mixin might this have a name like:
     *   `videoStream_123mcGee_4-phys_eieio5_utctimestamp_random999.flv`
     * @property {String} videoId
     */
    videoId: Ember.computed('session', 'id', 'experiment', function() {
        return [
            this.get('experiment.id'),
            this.get('id'),
            this.get('session.id')
        ].join('_');
    }).volatile(),

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
        const videoId = this.get('videoId');
        const recorder = this.get('videoRecorder').start(videoId, element, settings);
        const installPromise = recorder.install({record});

        // Track specific events for all frames that use  VideoRecorder
        recorder.on('onCamAccess', (hasAccess) => {
            this.send('setTimeEvent', 'hasCamAccess', {
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
     * Pause the recorder (and capture timing events)
     * @method pauseRecorder
     * @param [skipIfMissing=false] If provided (and true), don't raise an error if recording isn't ready yet.
     */
    pauseRecorder(skipIfMissing = false) {
        const recorder = this.get('recorder');
        if (recorder) {
            this.send('setTimeEvent', 'pauseVideo');
            recorder.pause(skipIfMissing);
        }
    },

    /**
     * Resume a paused recording
     * @method resumeRecorder
     * @throws an exception if recorder fails to resume TODO: Based on existing usage anyway
     */
    resumeRecorder() {
        const recorder = this.get('recorder');
        if (recorder) {
            this.send('setTimeEvent', 'unpauseVideo');
            recorder.resume();
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
            return recorder.record();
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
        if (recorder) {
            this.send('setTimeEvent', 'stoppingCapture');
            return this.get('recorder').stop();
        } else {
            return Ember.RSVP.resolve();
        }
    },
});
