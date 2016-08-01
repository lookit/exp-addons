import Ember from 'ember';

export default Ember.Mixin.create({
    videoId: Ember.computed('session', 'id', 'experiment', function() {
        return [
            this.get('experiment.id'),
            this.get('id'),
            this.get('session.id')
        ].join('_');
    }).volatile(),
    videoRecorder: Ember.inject.service()
});
