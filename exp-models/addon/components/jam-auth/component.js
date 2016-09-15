import Ember from 'ember';
import layout from './template';

export default Ember.Component.extend({
    layout: layout,
    namespaceConfig: Ember.inject.service(),

    collection: 'accounts',

    username: null,
    password: null,

    authenticating: false,

    actions: {
        authenticate() {
            this.set('authenticating', true);
            return this.get('login')({
                provider: 'self',
                username: this.get('username').trim(),
                password: this.get('password').trim(),
                namespace: this.get('namespaceConfig.namespace'),
                collection: this.get('collection')
            }).finally(() => this.set('authenticating', true));
        }
    }
});
