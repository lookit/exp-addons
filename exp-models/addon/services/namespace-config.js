import Ember from 'ember';

import config from 'ember-get-config';

export default Ember.Service.extend({
    session: Ember.inject.service(),
    init() {
        Object.keys(config.JAMDB).map((k) => {
            this.set(k, Ember.copy(config.JAMDB[k], true));
        });
        if (this.get('session.data.namespace')) {
	    this.set('namespace', this.get('session.data.namespace'));
        }
    },
    setNamespace(ns) {
	this.set('namespace', ns);
	this.get('session').set('data.namespace', ns);
    }
});
