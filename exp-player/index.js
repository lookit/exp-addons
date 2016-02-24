/*jshint node:true*/
module.exports = {
    name: 'exp-player',

    isDevelopingAddon: function() {
        return true;
    },

    included: function(app) {
        // TODO: Rename if we switch this project to SASS
        app.import('app/styles/app.css');
    }
};
