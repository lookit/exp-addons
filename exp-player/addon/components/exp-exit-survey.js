import Ember from 'ember';

import moment from 'moment';

import layout from '../templates/components/exp-exit-survey';

import ExpFrameBaseComponent from 'exp-player/components/exp-frame-base';
import FullScreen from '../mixins/full-screen';




const defaultSchema = {
    schema: {
        type: "object",
        properties: {
            birthdate: {
                title: "Please confirm your child's birthdate:",
                required: true
            },
            databrary: {
                type: "string",
                title: "Would you like to share your video and other data from this session with authorized users of the secure data library Databrary?",
                enum: ['Yes', 'No'],
                required: true
            },
            privacy: {
                type: "string",
                title: "Use of video clips and images:",
                enum: ['Private', 'Scientific', 'Publicity'],
                required: true
            },
            withdraw: {
                type: "boolean",
                title: "Withdrawal of video data"
            },
            feedback: {
                type:"string",
                title:"Your feedback:"
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
                helper: "We ask again just to check for typos during registration or accidental selection of a different child at the start of the study.",
                fieldClass: 'exp-physics-time-entry'
            },
            databrary: {
                type: "radio",
                hideNone: true,
                events: {
                    change: function(e) {
                    console.log(this);
                        console.log('postrender');
                        switch (this.data) {
                            case "Yes":
                                $('#scientistDescription').html('authorized scientists (researchers working on the Lookit project and authorized Databrary users).');
                                break;
                            case "No":
                                $('#scientistDescription').html('researchers working on the Lookit project.');
                                break;
                            default:
                                $('#scientistDescription').html('authorized scientists.');
                        }
                    }
                },
                message: "Please select whether to share your data.",
                helper: "Only authorized researchers will have access to information in the library. Researchers who are granted access must agree to maintain confidentiality and not use information for commercial purposes. Data sharing will lead to faster progress in research on human development and behavior. If you have any questions about the data-sharing library, please visit <a target='_blank' href='https://nyu.databrary.org/'> Databrary </a> or email ethics@databrary.org."
            },
            privacy: {
                type: "radio",
                hideNone: true,
                message: "Please select a privacy level for your video.",
                optionLabels: ['<strong>Private:</strong> Video may only be viewed by <span id="scientistDescription">authorized scientists.</span>', '<strong>Scientific and educational:</strong> Video may be shared for scientific or educational purposes. For example, we might show a video clip in a talk at a scientific conference or an undergraduate class about cognitive development, or include an image or video in a scientific paper. In some circumstances, video or images may be available online, for instance as supplemental material in a scientific paper.', "<strong>Publicity:</strong> Please select this option if you'd be excited about seeing your child featured on the Lookit website or in a news article about this study! Your video may be shared for publicity as well as scientific and educational purposes; it will never be used for commercial purposes. Video clips shared may be available online to the general public."],
                sort: function(a, b) { // This is an absurd hack because
                        // I can't get false to work...
                            var vals = ['Private', 'Scientific', 'Publicity']
                    if (vals.indexOf(a.value) > vals.indexOf(b.value)) {
                        return 1;
                    } else if (vals.indexOf(a.value) < vals.indexOf(b.value)) {
                        return -1;
                    }
                    return 0;
                }
            },
            withdraw: {
                type: "checkbox",
                rightLabel: "Every video helps us, even if something went wrong! However, if you need your video deleted (your spouse was discussing state secrets in the background, etc.), check here to completely withdraw your video data from this session from the study. Only your consent video will be retained and it may only be viewed by Lookit researchers; other video will be deleted without viewing."
            },
            feedback: {
                type: "textarea",
                rows: 3,
                cols: 40,
                helper: "Do you have any ideas about how to make this study easier or more fun for families? Did you experience any technical challenges?"
            }
        },
        hideInitValidationError: true
    }
};
const emailOptOutSchema = {
    schema: {
        type: "object",
        properties: {
            emailOptOut: {
                title: "You are currently signed up to receive email reminders about this study."
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

export default ExpFrameBaseComponent.extend(FullScreen, {
    layout: layout,
    type: 'exp-exit-survey',
    displayFullscreen: false,
    fullScreenElementId: 'experiment-player',
    didRender() { // leave fullscreen when starting exit survey
        this._super(...arguments);
        this.send('exitFullscreen');
    },
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
                    type: 'object',
                    default: {}
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
                        styles: 'btn btn-success'
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
    formData: {},
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
                var formData = root.get('formData') || {};
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
            return pastSessions.get('length') || 1;
        }
        return 1;
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
        return Math.ceil((this.get('currentSessionsCompleted') / this.get('idealSessionsCompleted')) * 100);
    })
});
