import Ember from 'ember';

let {
    $
} = Ember;

export default Ember.Mixin.create({
    forceExit: false,
    actions: {
        willTransition(transition) {
            if (!this.get('forceExit')) {
                transition.abort();
                window.location = this.get('router').generate(transition.intent.name);
            }
        },
        willDestroy() {
            this._super(...arguments);
            $(window).off('beforeunload');
        },
        allowExit() {
            this.set('forceExit', true);
            $(window).off('beforeunload');
        }
    },
    enter() {
        this._super(...arguments);
        $(window).on('beforeunload', () => {
            return `
If you're sure you'd like to leave this study early
you can press 'Leave this Page' to do so.

We'd appreciate it if before you do so you fill out a
very breif exit survey letting us know how we can use
any video captured during this session. Press 'Stay on
this Page' and press F1 to be taken immediately to the
exit survey.

If this was an accident, just press 'Stay on this Page'
to continue with the study.
`;
        });
    },
    exit() {
        this._super(...arguments);
        $(window).off('beforeunload');
    }
});
