import Ember from 'ember';
import DS from 'ember-data';

export default Ember.Mixin.create({
    // Fields found in meta
    createdOn: DS.attr('date'),
    modifiedOn: DS.attr('date'),
    createdBy: DS.attr('string'),
    modifiedBy: DS.attr('string')
});
