import Ember from 'ember';


/*
    Allow components to specify fullscreen capabilities based on minimal configuration options
 */
export default Ember.Mixin.create({
    fullScreenElementId: null, // String containing the ID of the element to make full screen
    displayFullscreen: false,  // Whether to show this element in fullscreen mode by default
    isFullscreen: false,  // Keep track of state

    // Note: to avoid handler being called repeatedly (analogous to bubbling
    // up?) I'm just having components that extend FullScreen call
    // showFullscreen themselves. --kim

    checkFullscreen: function() {  // Abstract away vendor-prefixed APIs
        var opts = ['fullscreenElement', 'webkitFullscreenElement', 'mozFullScreenElement', 'msFullscreenElement'];
        for (var opt of opts) {
            if (!!document[opt]) {return true;}
        }
        return false;
    },

    onFullscreen: function(elementSelector) {
        if (this.get('isDestroyed')) {
            // Short-circuit if object is destroyed (eg we leave fullscreen because a video frame ended)
            return false;
        }
        var isFullscreen = this.checkFullscreen();

        this.set('isFullscreen', isFullscreen);
        if (isFullscreen) {
            elementSelector.addClass('player-fullscreen');
        } else {
            elementSelector.removeClass('player-fullscreen');
        }
    },

    actions: {
        showFullscreen: function () {

            if (!this.get('displayFullscreen')) {
                this.send('exitFullscreen');
                return;
            }

            var elementId = this.get('fullScreenElementId');
            if (!elementId) {
                throw Error('Must specify element Id to make fullscreen');
            }

            var selector = Ember.$(`#${elementId}`);
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
        },

        exitFullscreen: function () {
            console.log('exiting');
            if (document.exitFullscreen) {
              document.exitFullscreen();
            } else if (document.msExitFullscreen) {
              document.msExitFullscreen();
            } else if (document.mozCancelFullScreen) {
              document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
              document.webkitExitFullscreen();
            }
            this.set('isFullscreen', false);
            var elementId = this.get('fullScreenElementId');
            var selector = Ember.$(`#${elementId}`);
            selector.removeClass('player-fullscreen');
        }

    }
});
