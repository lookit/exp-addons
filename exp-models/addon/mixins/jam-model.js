import Ember from 'ember';
import DS from 'ember-data';

export default Ember.Mixin.create({
    shortId: Ember.computed('id', function() {
        // Short IDs are the part after the last period; may be useful in some edge cases.
        return this.get('id').split('.').reverse()[0]; // TODO: could be more efficient?
    }),
    // Fields found in meta
    createdOn: DS.attr('date'),
    modifiedOn: DS.attr('date'),
    createdBy: DS.attr('string'),
    modifiedBy: DS.attr('string'),
});
