import Ember from 'ember';
import layout from './template';

import ExpRadioGroupComponent from '../../components/radio-group/component';

export default ExpRadioGroupComponent.extend({
    layout,
    labelTop: null,

    options: null,
    labels: null,
    formatLabel: null,

    // In an RTL rendering, draw the radio buttons in reverse order
    isRTL: null,

    optionsItems: Ember.computed('options', 'isRTL', function() {
        const isRTL = this.get('isRTL');
        const options = this.get('options') || [];

        if (!isRTL) {
            return options;
        } else {
            return Ember.copy(options, true).reverse();
        }
    }),

    labelsItems: Ember.computed('labels', 'isRTL', function() {
        const isRTL = this.get('isRTL');
        const labels = this.get('labels') || [];

        if (!isRTL) {
            return labels;
        } else {
            return Ember.copy(labels, true).reverse();
        }
    }),

    /**
     * Option values that should not be displayed
     * @property hiddenOptions
     * @type: {Array}
     */
    hiddenOptions: []
});
