/*
Manage data about one or more documents in the accounts collection
 */
import Ember from 'ember';
import DS from 'ember-data';

import JamModel from '../mixins/jam-model';

import config from 'ember-get-config';


export default DS.Model.extend(JamModel, {
    username: DS.attr('string'),
    name: DS.attr('string'),
    password: DS.attr('string'),
    profiles: DS.attr('profiles'),
    permissions: DS.attr(),

    history: DS.hasMany('history'),

    profileById: function(profileId) {
        // Scan the list of profiles and gets first one with matching ID (else undefined). Assumes profileIds are unique.
        var profiles = this.get('profiles') || [];
        var getProfile = function(item) {
            return item.get('profileId') === profileId;
        };

        return profiles.filter(getProfile)[0];
    },
    pastSessionsFor(experiment, profile) {
        // A hack: jam _search doesn't support implicit read access (if user is creator), so we have
        // to do a findAll then filter by profile.
        var profileId = Ember.get(profile, 'id') || '*';
        if (config.modulePrefix === 'experimenter') {
            return this.get('store').queryRecord(experiment.get('sessionCollectionId'), {
                q: `profileId:${this.get('id')}${profileId}`
            });
        }
        else {
            return this.get('store').findAll(experiment.get('sessionCollectionId')).then((sessions) => {
                return sessions.filter((session) => {
                    return (profileId === '*')? true: session.get('profileId') === profileId;
                });
            });
        }
    }
});
