import Ember from 'ember';
import layout from '../templates/components/exit-warning';

export default Ember.Component.extend({
    layout,
    warn: false,
    exitReason: null,
    exitPrivacy: null,
    actions: {
        onConfirm() {
            this.get('onConfirm')({
                reason: this.get('exitReason'),
                privacy: this.get('exitPrivacy'),
                databrary: this.get('databraryShare')
            });
        },
        onReject() {
            this.get('onReject')();
        }
    }
});
