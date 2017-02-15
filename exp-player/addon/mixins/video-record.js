import Ember from 'ember';

/**
 * @module experimenter
 * @submodule mixins
 */


/**
 * A mixin that can be used to add basic support for video recording to a particular experiment frame
 *
 * @class VideoRecordMixin
 */
export default Ember.Mixin.create({

    /**
     * @property videoRecorder Automatically injects the video recorder service, making its methods available to your
     * component
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
    }).volatile()
});
