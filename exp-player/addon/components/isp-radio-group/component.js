import layout from './template';

import ExpRadioGroupComponent from '../../components/radio-group/component';

export default ExpRadioGroupComponent.extend({
    layout,
    labelTop: null,

    options: null,
    labels: null,
    formatLabel: null,

    /*
     * Option values that should not be displayed
     * @property hiddenOptions
     * @type: {Array}
     */
    hiddenOptions: []
});
