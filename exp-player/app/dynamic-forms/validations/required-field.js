import Ember from 'ember';

export default Ember.Object.extend({
    validate(callback) {
        var value = this.getValue();
        var message = this.options.message;
        if (value === "") {
            callback({"status": false, "message": message});
            return;
        }
        callback({"status": true});
        return;
    }
});
