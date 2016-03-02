import Ember from 'ember';


/*
    Allow components to specify fullscreen capabilities based on minimal configuration options
 */
export default Ember.Mixin.create({
    fullScreenElementId: null, // String containing the ID of the element to make full screen
    displayFullScreen: false,  // Whether to show this element in fullscreen mode by default
    isFullScreen: false,  // Keep track of state

    didRender: function() { // TODO: Find better event hook
        this._super(arguments);
        this.send('showFullscreen');
    },

    // TODO: Track full screen state using boolean for templates
    // TODO: Fire events to set state based on fullscreenchange/fullscreenerror event
    // TODO: Add custom styles for fullscreen element (but only when fullscreen)
    // TODO: add experiment player and frame configuration control over fullscreen state




    actions: {
        showFullscreen: function (element) {
            element = element || this.get('fullScreenElementId');
            if (!element) {
                throw Error('Must specify element Id to make fullscreen');
            }

            if (!this.get('displayFullscreen')) {
                return;
            }

            var elem = this.$(`#${element}`)[0];
            if (elem.requestFullscreen) {
                elem.requestFullscreen();
            } else if (elem.msRequestFullscreen) {
                elem.msRequestFullscreen();
            } else if (elem.mozRequestFullScreen) {
                elem.mozRequestFullScreen();
            } else if (elem.webkitRequestFullscreen) {
                elem.webkitRequestFullscreen();
            } else {
                console.log('Your browser does not appear to support fullscreen rendering.');
            }
        }
    }
});
