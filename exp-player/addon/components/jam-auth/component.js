import Ember from 'ember';
import config from 'ember-get-config';
import layout from './template';

export default Ember.Component.extend({
  layout: layout,
  namespace: config.JAMDB.namespace,
  collection: config.JAMDB.collection,

  username: null,
  password: null,

  actions: {
    authenticate() {
      this.get('login')({
        provider: 'self',
        username: this.get('username').trim(),
        password: this.get('password').trim(),
        namespace: this.get('namespace'),
        collection: this.get('collection')
      });
    }
  }
});
