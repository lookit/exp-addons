import layout from './template';

import {validator, buildValidations} from 'ember-cp-validations';

import ExpFrameBaseComponent from '../../components/exp-frame-base/component';

let pad = function(number) {
    return ('00' + (number || 0)).slice(-2);
};

const Validations = buildValidations({
    napWakeUp: validator('presence', {
        presence: true,
        message: 'This field is required'
    }),
    usualNapSchedule: validator('presence', {
        presence: true,
        message: 'This field is required'
    }),
    lastEat: validator('presence', {
        presence: true,
        message: 'This field is required'
    }),
    doingBefore: validator('presence', {
        presence: true,
        message: 'This field is required'
    }),
    nextNap: validator('presence', {
        presence: true,
        message: 'This field is required',
        dependentKeys: ['usualNapSchedule'],
        disabled(model) {
            return model.get('usualNapSchedule') !== 'yes';
        }
    }),
    rested: validator('presence', {
        presence: true,
        message: 'This field is required'
    }),
    healthy: validator('presence', {
        presence: true,
        message: 'This field is required'
    }),
    childHappy: validator('presence', {
        presence: true,
        message: 'This field is required'
    }),
    active: validator('presence', {
        presence: true,
        message: 'This field is required'
    }),
    energetic: validator('presence', {
        presence: true,
        message: 'This field is required'
    }),
    ontopofstuff: validator('presence', {
        presence: true,
        message: 'This field is required'
    }),
    parentHappy: validator('presence', {
        presence: true,
        message: 'This field is required'
    })
});

export default ExpFrameBaseComponent.extend(Validations, {
    layout: layout,
    type: 'exp-lookit-mood-questionnaire',
    meta: {
        name: 'ExpLookitMoodQuestionnaire',
        description: 'Mood questionnaire for Lookit studies, very slightly generalized from physics version exp-mood-questionnaire',
        parameters: {
            type: 'object',
            properties: {
                id: {
                    type: 'string',
                    description: 'A unique identifier for this item'
                },
                introText: {
                    type: 'string',
                    description: 'Intro paragraph describing why we want mood info',
                    default: 'How are you two doing? We really want to know: we’re interested in how your child’s mood affects his or her looking preferences.'
                }
            },
            required: ['id']
        },
        data: {
            type: 'object',
            properties: {
                rested: {
                    type: 'string'
                },
                healthy: {
                    type: 'string'
                },
                childHappy: {
                    type: 'string'
                },
                active: {
                    type: 'string'
                },
                energetic: {
                    type: 'string'
                },
                ontopofstuff: {
                    type: 'string'
                },
                parentHappy: {
                    type: 'string'
                },
                napWakeUp: {
                    type: 'string',
                    default: null
                },
                usualNapSchedule: {
                    type: 'string'
                },
                nextNap: {
                    type: 'string'
                },
                lastEat: {
                    type: 'string',
                    default: null
                },
                doingBefore: {
                    type: 'string'
                }
            }
        }
    },
    moodOptions: ['1', '2', '3', '4', '5', '6', '7'],
    showValidation: false,
    actions: {
        continue() {
            if (this.get('validations.isValid')) {
                this.send('next');
            } else {
                this.set('showValidation', true);
            }
        },
        setTime(target, value) {
            this.set(target, `${value.hours()}:${pad(value.minutes())}`);
        }
    }
});
