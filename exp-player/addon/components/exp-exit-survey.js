import Ember from 'ember';
import {
    validator,
    buildValidations
} from 'ember-cp-validations';

import moment from 'moment';

import layout from '../templates/components/exp-exit-survey';

import ExpFrameBaseComponent from 'exp-player/components/exp-frame-base';
import FullScreen from 'exp-player/mixins/full-screen';


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
    showWithdrawalConfirmation: false,
    showValidation: false,
    actions: {
        advanceToProgressBar() {
            // Move from section 1 (survey) to section 2 (progress bar/ finish button)
            // Mark the session complete at this stage, as all data has been entered
            this.set('section1', false);
            this.sendAction('sessionCompleted');
            this.send('save');
        },
        continue () {
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
            console.log('Post-study survey complete.');
            this.send('next');
        }
    },
    currentSessionsCompleted: Ember.computed('frameContext', function() {
        var pastSessions = this.get('frameContext.pastSessions');
        if (pastSessions) {
            return pastSessions.get('length') || 1;
        }
        return 1;
    }),
    currentDaysSessionsCompleted: Ember.computed('frameContext', function() {
        // Warning, this implementation may be inaccurate
        // TODO, figure out what the client's expected behavior is here and resolve
        // https://openscience.atlassian.net/browse/LEI-111
        var pastSessionDates = this.get('frameContext.pastSessions').map((session) => {
            return moment(session.get('createdOn'));
        });
        var minDate = moment.min(pastSessionDates);
        var maxDate = moment.max(pastSessionDates);

        return maxDate.diff(minDate, 'days') + 1;
    }),
    progressValue: Ember.computed('currentSessionsCompleted', 'idealSessionsCompleted', function() {
        return Math.min(100, Math.ceil((this.get('currentSessionsCompleted') / this.get('idealSessionsCompleted')) * 100));
    }),
    willRender() {
        this.send('exitFullscreen');
    }
});
