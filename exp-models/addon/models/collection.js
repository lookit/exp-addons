/*
 Manage data about a given collection
 */

import Ember from 'ember';
import DS from 'ember-data';
import JamModel from '../mixins/jam-model';

export default DS.Model.extend(JamModel, {
    name: Ember.computed('id', function () {
        return this.get('id').split('.')[1];
    }),

    schema: DS.attr(),
    permissions: DS.attr(),
    plugins: DS.attr(),

    namespace: DS.belongsTo('namespace')
});
