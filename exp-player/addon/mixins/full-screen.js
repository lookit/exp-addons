import Ember from 'ember';

let {
    $
} = Ember;


/*
    Allow components to specify fullscreen capabilities based on minimal configuration options
 */
export default Ember.Mixin.create({
    fullScreenElementId: null, // String containing the ID of the element to make full screen
    displayFullscreen: false,  // Whether to show this element in fullscreen mode by default

    fsButtonID: false, // ID for button element to show if user leaves FS

    // Note: to avoid handler being called repeatedly (bubbling
    // up?) I'm just having components that extend FullScreen call
    // showFullscreen themselves. --kim

    // These are ridiculous workarounds for rare but reproducible problems with
    // updating the isFullscreen field...

    counter: 0,

    updatedIsFullscreen: Ember.computed('counter', function() {
        return this.checkFullscreen();
    }),

    isFullscreen: false, // Keep track of state

    checkFullscreen: function() {  // Abstract away vendor-prefixed APIs

        var opts = ['fullscreenElement', 'webkitFullscreenElement', 'mozFullScreenElement', 'msFullscreenElement'];
        for (var opt of opts) {
            if (!!document[opt]) {return true;}
        }
        return false;
    },

    onFullscreen: function($element) {
        this.set('counter', this.get('counter') + 1);
        if (this.get('isDestroyed')) {
            // Short-circuit if object is destroyed (eg we leave fullscreen because a video frame ended)
            return false;
        }

        var isFS = this.checkFullscreen();
        this.set('isFullscreen', isFS);

	var $button = $(`#${this.get('fsButtonID')}`);
        if (isFS) {
           // alert('went fs');
            $element.addClass('player-fullscreen');
            if (this.displayFullscreen && this.fsButtonID) {
		$button.hide();
            }
        } else {
            //alert('left fs');
            $element.removeClass('player-fullscreen');
            if (this.displayFullscreen && this.fsButtonID) {
                $button.show();
            }
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

            var buttonId = this.get('fsButtonID');
            var buttonSel = Ember.$(`#${buttonId}`);

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

            //this.checkFullscreen();

            Ember.$(document).off('webkitfullscreenchange mozfullscreenchange fullscreenchange MSFullscreenChange');
            Ember.$(document).on('webkitfullscreenchange mozfullscreenchange fullscreenchange MSFullscreenChange', this.onFullscreen.bind(this, selector, buttonSel));
        },

        exitFullscreen: function () {
            console.log('exiting FS mode');
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
