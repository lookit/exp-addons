import Ember from 'ember';

import moment from 'moment';

import ExpFrameBaseComponent from 'exp-player/components/exp-frame-base';
import layout from '../templates/components/exp-exit-survey';

const defaultSchema = {
    schema: {
        title: "Post-study survey",
        description: "How was your experience?",
        type: "object",
        properties: {
            birthdate: {
                title: "Please confirm your child's birthdate: *"
            },
            feedback: {
                type:"string",
                title:"Your feedback:"
            },
            privacy: {
                type: "string",
                title: "Select the privacy level for the video of your participation: *",
                enum: ['Publicity and educational use (video may be publicity or educational purposes online or in the press in addition to for research purposes)', 'Scientific use only', 'In-lab use only', 'WITHDRAW your data from this session']
            }
        }
    },
    options: {
        fields: {
            birthdate: {
                type: "date",
                manualEntry: false,
                validator: "required-field",
                message: "Please provide a complete and valid birthday.",
                helper: "We ask again just to check for typos during registration or people accidentally selecting a different child at the start of the study."
            },
            feedback: {
                type: "textarea",
                rows: 5,
                cols: 40,
                helper: "Do you have any ideas about how to make this study easier or more fun for families? Did you experience any technical challenges?"
            },
            privacy: {
                type: "radio",
                removeDefaultNone: true,
                validator: "required-field",
                message: "Please select a privacy level for your video."
            }
        }
    }
};
const emailOptOutSchema = {
    schema: {
        type: "object",
        properties: {
            emailOptOut: {
                title: "You are currently signed up to recieve email reminders about this study."
            }
        }
    },
    options: {
        fields: {
            emailOptOut: {
                type: "checkbox",
                rightLabel: "Opt out"
            }
        },
        form: {
            buttons: {
                finish: {
                    title: "Back to Lookit home page"
                }
            }
        }
    }
};

export default ExpFrameBaseComponent.extend({
    layout: layout,
    type: 'exp-exit-survey',
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
                form: {
                    type: 'jsonschema',
                    description: 'JSON-schema defining this item\'s form',
                    default: defaultSchema
                },
                additionalForm: {
                    type: 'jsonschema',
                    description: 'JSON-schema defining second form.',
                    default: emailOptOutSchema
                },
                idealSessionsCompleted: {
                    type: 'integer',
                    default: 3
                },
                idealDaysSessionsCompleted: {
                    type: 'integer',
                    default: 14
                },
                exitMessage: {
                    type: 'string'
                },
                exitThankYou: {
                    type: 'string'
                }
            },
            required: ['id']
        },
        data: {
            type: 'object',
            properties: {
                formData: {
                    type: 'object'
                }
            }
        }
    },
    formSchema: Ember.computed('form', {
        get() {
            var newOptions = this.get('form.options');
            newOptions.form = {
                buttons: {
                    update: {
                        title: 'Submit',
                        type: 'button',
                        styles: 'btn btn-default'
                    }
                }
            };
            return {
                schema: this.get('form.schema'),
                options: newOptions
            };
        },
        set(_, value) {
            this.set('formSchema', value);
            return value;
        }
    }),
    section1: true,
    formData: [],
    formActions: Ember.computed(function() {
        var root = this;
        return {
            update: function() {
                this.refreshValidationState(true);
                if (this.isValid(true)) {
                    root.set('formData', this.getValue());
                    root.set('section1', false);
                }
            },
            finish: function() {
                var formData = root.get('formData');
                Ember.merge(formData, this.getValue());
                root.set('formData', formData);
                console.log('Post-study survey complete.');
                root.actions.next.apply(root);
            }
        };
    }),
    currentSessionsCompleted: Ember.computed('frameContext', function() {
        var pastSessions = this.get('frameContext.pastSessions');
        if (pastSessions) {
            return pastSessions.get('length');
        }
        return 0;
    }),
    currentDaysSessionsCompleted: Ember.computed('frameContext', function() {
        // Warning, this implementation may be inaccurate1
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
        return (this.get('currentSessionsCompleted') / this.get('idealSessionsCompleted')) * 100;
    })
});
