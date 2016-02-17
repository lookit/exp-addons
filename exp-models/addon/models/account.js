/*
Manage data about one or more documents in the accounts collection
 */

import DS from 'ember-data';
import JamModel from '../mixins/jam-model';

export default DS.Model.extend(JamModel, {
    username: DS.attr('string'),
    password: DS.attr('string'),
    profiles: DS.attr(),  // TODO: Pages using profiles will be fragile unless there is a clear, explicit contract of what fields ember can always expect to be present. This nested document doesn't inherently specify as such.

    permissions: DS.attr(),

    history: DS.hasMany('history'),

    profileById: function(profileId) {
        // Scan the list of profiles and gets first one with matching ID (else undefined). Assumes profileIds are unique.
        var profiles = this.get('profiles') || [];
        var getProfile = function(item) {return item.profileId === profileId};
        return profiles.filter(getProfile)[0];
    }
});
