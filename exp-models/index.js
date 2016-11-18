/*jshint node:true*/
var path = require('path');

module.exports = {
    name: 'exp-models',

    included: function (app) {
        this.app.import(path.join(this.app.bowerDirectory, 'bcryptjs/dist/bcrypt.js'));
        return this._super.included.apply(this, arguments);
    },

    isDevelopingAddon: function () {
        return true;
    }
};
