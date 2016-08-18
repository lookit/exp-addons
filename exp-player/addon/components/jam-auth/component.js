import Ember from 'ember';
import config from 'ember-get-config';
import layout from './template';

export default Ember.Component.extend({
  layout: layout,
  namespace: config.JAMDB.namespace,
  collection: config.JAMDB.collection,

  studyId: null,
  participantId: null,

  actions: {
    authenticate() {
      this.get('login')({
        provider: 'self',
        username: this.get('participantId'),
        password: 'password',
        studyId: this.get('studyId'),
        namespace: this.get('namespace'),
        collection: this.get('collection')
      });
    }
  }
});
