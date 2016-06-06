import Ember from 'ember';

export default Ember.Mixin.create({
    actions: {
        willTransition(transition) {
	    // This propagates the Ember transition into a new GET request. This
	    // allows for easier capture of onbeforeunload events without disrupting
	    // intra-app navigation.
            transition.abort();
            window.location = this.get('router').generate(transition.intent.name);
        }
    }
});
