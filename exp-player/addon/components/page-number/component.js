import Ember from 'ember';
import layout from './template';

export default Ember.Component.extend({
    layout,
    pageNumber: null,
    tagName: 'p',
    classNames: ['page-number-right']
});
