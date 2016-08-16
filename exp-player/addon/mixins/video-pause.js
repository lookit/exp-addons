import Ember from 'ember';

export default Ember.Mixin.create({
    spaceHandler: null,
    didInsertElement() {
        this._super(...arguments);
        var player = this.$().find('video')[0];
        var spaceHandler = function(e) {
            if (e.keyCode === 32) {
                if (player.paused) {
                    player.play();
                }
                else {
                    player.pause();
                }
            }
        };
        Ember.$(document).on('keypress', spaceHandler);
        this.set('spaceHandler', spaceHandler);
    },
    didDestroyElement() {
        this._super(...arguments);
        Ember.$(document).off('keypress', this.get('spaceHandler'));
    }
});
