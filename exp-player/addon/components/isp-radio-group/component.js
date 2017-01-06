import layout from './template';

import ExpRadioGroupComponent from '../../components/radio-group/component';

export default ExpRadioGroupComponent.extend({
    layout,
    labelTop: null,
    labels: null,
    formatLabel: null,

    // In an RTL rendering, draw the radio buttons in reverse order
    isRTL: null,

    /**
     * Option values that should not be displayed
     * @property hiddenOptions
     * @type: {Array}
     */
    hiddenOptions: []
});
