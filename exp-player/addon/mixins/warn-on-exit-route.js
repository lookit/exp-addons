import Ember from 'ember';

export default Ember.Mixin.create({
    _onDirtyExit(controller, transition) {
        this.controller.showExitWarning().then(([confirmed, data, closeModal]) => {
            if(confirmed) {
                controller.set('forceExit', true);
                var session = this.get('controller.session');
                session.set('didComplete', false);
                session.set('earlyExit', data);
                session.save();
                transition.retry();
            }
            closeModal();
            return true;
        });
    },
    setupController(controller, model) {
        this._super(controller, model);
        if (!controller.get('session')) {
            console.log('WarnOnExitRouteMixin expects the corresponding controller to have a session property');
        }
    },
    actions: {
        willTransition(transition) {
            // FIXME: This won't prevent back button or manual URL change. See https://guides.emberjs.com/v2.3.0/routing/preventing-and-1retrying-transitions/#toc_preventing-transitions-via-code-willtransition-code
            if (!this.controller.get('forceExit')) {
                transition.abort();
                this._onDirtyExit(this.controller, transition);
                return false;
            } else {
                // Bubble this action to parent routes
                return true;
            }
        }
    }
});
