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
    }
});
