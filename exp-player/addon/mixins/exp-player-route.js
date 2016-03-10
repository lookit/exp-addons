import Ember from 'ember';

export default Ember.Mixin.create({
    _experiment: null,
    _session: null,

    currentUser: Ember.inject.service(),

    _getExperiment(params) { // jshint ignore: line

    },
    _getSession(params, experiment) { // jshint ignore: line

    },
    model(params) {
        // While a little gross, this ensures all the criteria for participation
        // are met before the route resolves. This has the benefit that the route's
        // loading state is active until all of this is complete.
        return this._getExperiment(params).then((experiment) => {
            return this._getSession(params, experiment).then((session) => {

                this.set('_experiment', experiment);
                this.set('_session', session);

                return experiment.getCurrentVersion().then(versionId => {
                    session.set('experimentVersion', versionId);
                    return session.save().then(() => {
                        return this.get('currentUser').getCurrentUser((account) => {
                            return account.pastSessionsFor(experiment);
                        });
                    });
                });
            });
        });
    },
    setupController(controller, pastSessions) {
        this._super(controller, pastSessions);

        controller.set('experiment', this.get('_experiment'));
        controller.set('session', this.get('_session'));
        controller.set('pastSessions', pastSessions);
    }
});
