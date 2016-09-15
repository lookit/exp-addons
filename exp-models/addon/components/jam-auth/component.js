import Ember from 'ember';
import layout from './template';

export default Ember.Component.extend({
    layout: layout,
    namespaceConfig: Ember.inject.service(),

    namespace: Ember.computed.alias('namespaceConifg.namespace'),
    collection: 'accounts',

    username: null,
    password: null,

    actions: {
        authenticate() {
            return this.get('login')({
                provider: 'self',
                username: this.get('username').trim(),
                password: this.get('password').trim(),
                namespace: this.get('namespace'),
                collection: this.get('collection')
            });
        }
    }
});
