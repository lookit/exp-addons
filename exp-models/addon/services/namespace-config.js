import Ember from 'ember';

import config from 'ember-get-config';

export default Ember.Service.extend({
    init() {
	Object.keys(config.JAMDB).map((k) => {
	    this.set(k, Ember.copy(config.JAMDB[k], true));
	});
    }
});
