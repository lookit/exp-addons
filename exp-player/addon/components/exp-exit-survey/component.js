import Ember from 'ember';
import layout from './template';

import {validator, buildValidations} from 'ember-cp-validations';

import moment from 'moment';

import ExpFrameBaseComponent from '../../components/exp-frame-base/component';
import FullScreen from 'exp-player/mixins/full-screen';

/**
 * @module exp-player
 * @submodule frames
 */

/**
This is the exit survey used by "Your baby the physicist". Use the updated frame {{#crossLink "ExpLookitExitSurvey"}}{{/crossLink}} instead.

@class ExpExitSurvey
@extends ExpFrameBase
@uses Validations
@uses FullScreen
@deprecated
*/

const Validations = buildValidations({
    birthDate: validator('presence', {
        presence: true,
        message: 'This field is required'
    }),
    useOfMedia: validator('presence', {
        presence: true,
        message: 'This field is required',
        disabled(model) {
            return model.get('withdrawal');
        }
    }),
    databraryShare: validator('presence', {
        presence: true,
        message: 'This field is required'
    })
});

export default ExpFrameBaseComponent.extend(Validations, FullScreen, {
    layout: layout,
    type: 'exp-exit-survey',
    fullScreenElementId: 'experiment-player',
    meta: {
        name: 'ExpExitSurvey',
        description: 'Exit survey for Lookit.',
        parameters: {
            type: 'object',
            properties: {
                id: {
                    type: 'string',
                    description: 'A unique identifier for this item'
                },
                required: ['id']
            }
        },
        data: {
            type: 'object',
            properties: {
                birthDate: {
                    type: 'string',
                    default: null
                },
                databraryShare: {
                    type: 'string'
                },
                useOfMedia: {
                    type: 'string'
                },
                withdrawal: {
                    type: 'boolean',
                    default: false
                },
                feedback: {
                    type: 'string',
                    default: ''
                },
                idealSessionsCompleted: {
                    type: 'integer',
                    default: 3
                },
                idealDaysSessionsCompleted: {
                    type: 'integer',
                    default: 14
                }
            }
        }
    },
    today: new Date(),
    section1: true,
    minVideosToCountSession: 6,
    showWithdrawalConfirmation: false,
    showValidation: false,
    actions: {
        advanceToProgressBar() {
            // Move from section 1 (survey) to section 2 (progress bar/ finish button)
            // Mark the session complete at this stage, as all data has been entered
            this.sendAction('sessionCompleted');
            this._save()
                .then(()=> {
                    this.set('section1', false);
                })
                .catch(err => this.displayError(err));
        },
        continue() {
            // Check whether exit survey is valid, and if so, advance to next screen
            if (this.get('validations.isValid')) {
                if (this.get('withdrawal')) {
                    this.set('showWithdrawalConfirmation', true);
                } else {
                    this.send('advanceToProgressBar');
                }
            } else {
                this.set('showValidation', true);
            }
        },
        finish() {
            this.send('next');
        }
    },
    currentSessionStatus: Ember.computed('frameContext', function() {
        // Count all sessions
        //var pastSessions = this.get('frameContext.pastSessions');
        //if (pastSessions) {
        //    return pastSessions.get('length') || 1;
        //}

        // Count only sessions with at least minVideos pref-phys-videos frames
        var expData = this.get('frameContext.pastSessions').map((session) => session.get('expData'));
        var expDates = this.get('frameContext.pastSessions').map((session) => moment(session.get('createdOn')));
        var nSessions = 0;
        var sessionDates = [];
        for (var iSess = 0; iSess < expData.length; iSess++) {
            var keys = Object.keys(expData[iSess]);
            var nVideos = 0;
            for (let i = 0; i < keys.length; i++) {
                var frameKeyName = keys[i];
                if (frameKeyName.indexOf('pref-phys-videos') !== -1) {
                    nVideos++;
                }
            }
            if (nVideos >= this.get('minVideosToCountSession')) {
                nSessions++;
                sessionDates.push(expDates[iSess]);
            }
        }
        var minDate = moment.min(sessionDates);
        var maxDate = moment.max(sessionDates);
        return [nSessions, maxDate.diff(minDate, 'days') + 1];
    }),
    currentSessionsCompleted: Ember.computed('currentSessionStatus', function()    {
        return this.get('currentSessionStatus')[0];
    }),

    currentDaysSessionsCompleted: Ember.computed('currentSessionStatus', function() {
        return this.get('currentSessionStatus')[1];
    }),

    progressValue: Ember.computed('currentSessionsCompleted', 'idealSessionsCompleted', function() {
        return Math.min(100, Math.ceil((this.get('currentSessionsCompleted') / this.get('idealSessionsCompleted')) * 100));
    }),
    willRender() {
        this.send('exitFullscreen');
    }
});
