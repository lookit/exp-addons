import Ember from 'ember';


/*
    Allow components to specify fullscreen capabilities based on minimal configuration options
 */
export default Ember.Mixin.create({
    fullScreenElementId: null, // String containing the ID of the element to make full screen
    displayFullscreen: false,  // Whether to show this element in fullscreen mode by default
    isFullscreen: false,  // Keep track of state

    didRender: function() { // TODO: Find better event hook
        this._super(arguments);
        this.send('showFullscreen');
    },

    checkFullscreen: function() {  // Abstract away vendor-prefixed APIs
        var opts = ['fullscreenElement', 'webkitFullscreenElement', 'mozFullscreenElement', 'msFullscreenElement'];
        for (var opt of opts) {
            if (!!document[opt]) {return true;}
        }
        return false;
    },

    onFullscreen: function(elementSelector) {
        var isFullscreen = this.checkFullscreen();
        this.set('isFullscreen', isFullscreen);
        if (isFullscreen) {
            elementSelector.addClass('player-fullscreen');
        } else {
            elementSelector.removeClass('player-fullscreen');
        }
    },

    // TODO: Track full screen state using boolean for templates
    // TODO: Add custom styles for fullscreen element (but only when fullscreen)
    // TODO fix fullscreen capitalization
    actions: {
        showFullscreen: function (elementId) {
            elementId = elementId || this.get('fullScreenElementId');
            if (!elementId) {
                throw Error('Must specify element Id to make fullscreen');
            }

            if (!this.get('displayFullscreen')) {
                return;
            }

            var selector = this.$(`#${elementId}`);
            var elem = selector[0];
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

            Ember.$(document).on('webkitfullscreenchange mozfullscreenchange fullscreenchange MSFullscreenChange', this.onFullscreen.bind(this, selector));
        }
    }
});
