/*
 A model for storing raw image data.
*/
import DS from 'ember-data';
import JamModel from '../mixins/jam-model';

export default DS.Model.extend(JamModel, {
    raw: DS.attr('string'),
    history: DS.hasMany('history')
});
