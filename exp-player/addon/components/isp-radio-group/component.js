import ExpRadioGroupComponent from 'exp-player/components/radio-group';
import layout from './template';

export default ExpRadioGroupComponent.extend({
    layout,
    labelTop: null,
    labels: null,
    formatLabel: null,

    /**
     * Option values that should not be displayed
     * @property hiddenOptions
     * @type: {Array}
     */
    hiddenOptions: []
});
