import Ember from 'ember';

export default Ember.Mixin.create(Ember.Evented, {
    showWarning: false,
    forceExit: false,

    session: Ember.computed(function() {
        return this.get('model.session') || this.get('model');
    }),
    _closeModal() {
        this.set('showWarning', false);
    },
    showExitWarning() {
        this.set('showWarning', true);
        return new Ember.RSVP.Promise((resolve) => {
            var close = this.get('_closeModal').bind(this);
            this.on('onConfirm', (data) => {
                resolve([true, data, close]);
            });
            this.on('onReject', () => {
                resolve([false, null, close]);
            });
        });
    },
    actions: {
        onConfirmExit(data) {
            this.trigger('onConfirm', data);
        },
        onRejectExit() {
            this.trigger('onReject');
        }
    }
});
