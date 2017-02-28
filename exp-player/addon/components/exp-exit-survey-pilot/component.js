import Ember from 'ember';
import layout from './template';

import {validator, buildValidations} from 'ember-cp-validations';

import moment from 'moment';

import ExpFrameBaseComponent from '../../components/exp-frame-base/component';
import FullScreen from '../../mixins/full-screen';

/**
 * @module exp-player
 * @submodule frames
 */

/**
This is the exit survey used by the "Your baby the physicist" pilot. Use the updated frame {{#crossLink "ExpLookitExitSurvey"}}{{/crossLink}} instead.

@class ExpExitSurveyPilot
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
    type: 'exp-exit-survey-pilot',
    fullScreenElementId: 'experiment-player',
    meta: {
        name: 'ExpExitSurveyPilot',
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
    currentSessionsCompleted: Ember.computed('frameContext', function () {
        var pastSessions = this.get('frameContext.pastSessions');
        if (pastSessions) {
            return pastSessions.get('length') || 1;
        }
        return 1;
    }),
    currentDaysSessionsCompleted: Ember.computed('frameContext', function () {
        // Warning, this implementation may be inaccurate
        // TODO, figure out what the client's expected behavior is here and resolve
        // https://openscience.atlassian.net/browse/LEI-111
        var pastSessionDates = this.get('frameContext.pastSessions').map((session) => moment(session.get('createdOn')));
        var minDate = moment.min(pastSessionDates);
        var maxDate = moment.max(pastSessionDates);

        return maxDate.diff(minDate, 'days') + 1;
    }),
    progressValue: Ember.computed('currentSessionsCompleted', 'idealSessionsCompleted', function () {
        return Math.min(100, Math.ceil((this.get('currentSessionsCompleted') / this.get('idealSessionsCompleted')) * 100));
    }),
    willRender() {
        this.send('exitFullscreen');
    }
});
