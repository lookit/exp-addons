import Ember from 'ember';

let {
    $
} = Ember;

/**
 * @module exp-player
 * @submodule mixins
 */

/**
 * Allow components to specify fullscreen capabilities based on minimal configuration options
 * @class FullScreen
 */
export default Ember.Mixin.create({
    /**
     *  The element ID of the thing to make full screen (video element, div, etc)
     * @property {String} fullScreenElementId
     */
    fullScreenElementId: null,
    displayFullscreen: false,

    /**
     * The element ID of a button to show if the user leaves fullscreen mode
     * @property {String} fsButtonID
     */
    fsButtonID: false,

    // Note: to avoid handler being called repeatedly (bubbling
    // up?) I'm just having components that extend FullScreen call
    // showFullscreen themselves. --kim

    // These are ridiculous workarounds for rare but reproducible problems with
    // updating the isFullscreen field...

    counter: 0,

    updatedIsFullscreen: Ember.computed('counter', function () {
        return this.checkFullscreen();
    }),

    isFullscreen: false, // Keep track of state

    checkFullscreen: function () {  // Abstract away vendor-prefixed APIs

        var opts = ['fullscreenElement', 'webkitFullscreenElement', 'mozFullScreenElement', 'msFullscreenElement'];
        for (var opt of opts) {
            if (!!document[opt]) {
                return true;
            }
        }
        return false;
    },

    onFullscreen: function ($element) {
        this.set('counter', this.get('counter') + 1);
        if (this.get('isDestroyed')) {
            // Short-circuit if object is destroyed (eg we leave fullscreen because a video frame ended)
            return false;
        }

        var isFS = this.checkFullscreen();
        this.set('isFullscreen', isFS);

        var $button = $(`#${this.get('fsButtonID')}`);
        if (isFS) {
            $element.addClass('player-fullscreen');
            if (this.displayFullscreen && this.fsButtonID) {
                $button.hide();
            }
            /**
             * Upon detecting change to fullscreen mode
             *
             * @event enteredFullscreen
            */
            this.send('setTimeEvent', 'enteredFullscreen');
        } else {
            $element.removeClass('player-fullscreen');
            if (this.displayFullscreen && this.fsButtonID) {
                $button.show();
            }
            /**
             * Upon detecting change out of fullscreen mode
             *
             * @event leftFullscreen
            */
            this.send('setTimeEvent', 'leftFullscreen');
        }
    },

    displayError(error) { // jshint ignore:line
        // Exit fullscreen first to make sure error is visible to users.
        this.send('exitFullscreen');
        return this._super(...arguments);
    },

    actions: {
        /**
         * Make a specified element fullscreen
         * @method showFullscreen
         */
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
        /**
         * Exit fullscreen mode
         * @method exitFullscreen
         */
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
