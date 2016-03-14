import Ember from 'ember';

export default Ember.Mixin.create({
    _experiment: null,
    _session: null,

    store: Ember.inject.service(),
    currentUser: Ember.inject.service(),

    _getExperiment(params) { // jshint ignore: line

    },
    _getSession(params, experiment) { // jshint ignore: line
        return this.get('currentUser').getCurrentUser().then(([account, profile]) => {
            return this.store.createRecord(experiment.get('sessionCollectionId'), {
                experimentId: experiment.id,
                profileId: profile.get('profileId'),
                completed: false,
                feedback: '',
                hasReadFeedback: '',
                expData: {},
                sequence: []
            });
        });
    },
    model(params) {
        // While a little gross, this ensures all the criteria for participation
        // are met before the route resolves. This has the benefit that the route's
        // loading state is active until all of this is complete.
        return new Ember.RSVP.Promise((resolve, reject) => {
            this._getExperiment(params).then((experiment) => {
                this._getSession(params, experiment).then((session) => {
                    this.set('_experiment', experiment);
                    this.set('_session', session);
                    //experiment.getCurrentVersion().then(versionId => {
                    // TODO: waiting on jam history permissions updates
                    session.set('experimentVersion', '');
                    session.save().then(() => {
                        this.get('currentUser').getCurrentUser().then(([account, profile]) => {
                            account.pastSessionsFor(experiment, profile).then(function(pastSessions) {
                                resolve(pastSessions);
                            });
                        });
                    });
                });
                //});
            }).catch(reject);
        });
    },
    setupController(controller, pastSessions) {
        this._super(controller, pastSessions);

        controller.set('experiment', this.get('_experiment'));
        controller.set('session', this.get('_session'));
        controller.set('pastSessions', pastSessions);
    }
});
