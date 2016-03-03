import Ember from 'ember';

/*
    Allow any media-containing component to correctly reset.
    Fix LEI-93, an issue where the second of two consecutive videos did not play correctly.
 */
export default Ember.Mixin.create({
    mediaTags: ['audio', 'video'],

    didRender() {
        this._super(...arguments);
        for (var selector of this.get('mediaTags')) {
            Ember.$(selector).each(function(){
                this.pause();
                this.load();
            });
        }
    }
});
