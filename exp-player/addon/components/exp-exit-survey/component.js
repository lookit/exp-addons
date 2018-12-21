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

    currentSessionStatus: Ember.computed('frameContext.pastSessions', function() {
        let nSessions = 0;
        const sessionDates = [];
        this.get('frameContext.pastSessions').forEach(session => {
            let nVideos = 0;
            Object.keys(session.get('expData')).forEach(frameKeyName => {
                if (frameKeyName.includes('pref-phys-videos')) {
                    nVideos++;
                }
            });
            // Count only sessions with at least minVideos pref-phys-videos frames
            if (nVideos >= this.get('minVideosToCountSession')) {
                nSessions++;
                sessionDates.pushObject(moment(session.get('createdOn')));
            }
        });
        return {'nSessions': nSessions, 'daysSessionsCompleted': moment.max(sessionDates).diff(moment.min(sessionDates), 'days') + 1 };
    }),

    currentSessionsCompleted: Ember.computed('currentSessionStatus', function()    {
        return this.get('currentSessionStatus.nSessions');
    }),

    currentDaysSessionsCompleted: Ember.computed('currentSessionStatus', function() {
        return this.get('currentSessionStatus.daysSessionsCompleted');
    }),

    progressValue: Ember.computed('currentSessionsCompleted', 'idealSessionsCompleted', function() {
        return Math.min(100, Math.ceil((this.get('currentSessionsCompleted') / this.get('idealSessionsCompleted')) * 100));
    }),
    willRender() {
        this.send('exitFullscreen');
    }
});
