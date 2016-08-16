import Ember from 'ember';
import layout from '../templates/components/radio-group';

export default Ember.Component.extend({
    layout,
    options: null,
    value: null,
    labelLeft: null,
    labelRight: null
});
