import Ember from 'ember';

import ExpFrameBaseComponent from 'exp-player/components/exp-frame-base';
import layout from '../templates/components/exp-mood-questionnaire';

const modifiedContainer = `<script type="text/x-handlebars-template">
    <div class="exp-mood-questionnaire">
        {{#if options.label}}
        <label class="{{#if options.labelClass}}{{options.labelClass}}{{/if}} alpaca-control-label">{{{options.label}}}</label>
        {{/if}}

        {{#if options.helpers}}
        {{#each options.helpers}}
        <p class="alpaca-helper help-block {{#if options.helperClass}}{{options.helperClass}}{{/if}}">
            <i class="alpaca-icon-16 glyphicon glyphicon-info-sign"></i>
            {{{.}}}
        </p>
        {{/each}}
        {{/if}}
        {{#container}}{{/container}}
    </div>
</script>`;

const modifiedControlRadio = `<script type="text/x-handlebars-template">
    {{#each selectOptions}}
    <div class="radio block">
        {{#if ../options.above}}
            <div>{{{text}}}</div>
        {{/if}}
        <label>
            <input type="radio" {{#if ../options.readonly}}readonly="readonly"{{/if}} name="{{../name}}" value="{{value}}" {{#compare value ../data}}checked="checked"{{/compare}}/>
        </label>
    </div>
    {{/each}}
</script>`;

const modifiedControl = `<script type="text/x-handlebars-template">
    <div>
        <div class="row body">
            {{#if options.label}}
            <span class="col-xs-2 left-side">
                <label class="radio-label {{#if options.labelClass}}{{options.labelClass}}{{/if}} alpaca-control-label" for="{{id}}">{{{options.label}}}</label>
            </span>
            {{/if}}
            <span class="col-xs-6 right-side">
                {{#control}}{{/control}}
            </span>
            <span class="col-xs-10 right-side">
                <label class="radio-label {{#if options.labelClass}}{{options.labelClass}}{{/if}} alpaca-control-label" for="{{id}}">{{{options.label2}}}</label>
            </span>
            </span>
        </div>

        {{#if options.helpers}}
        {{#each options.helpers}}
        <p class="alpaca-helper help-block {{#if options.helperClass}}{{options.helperClass}}{{/if}}">
            <i class="alpaca-icon-16 glyphicon glyphicon-info-sign"></i>
            {{{.}}}
        </p>
        {{/each}}
        {{/if}}

        {{#if options.renderButtons}}
            {{#if options.buttons}}
            <div class="alpaca-control-buttons-container">
                {{#each options.buttons}}
                <button data-key="{{@key}}" type="{{type}}" class="alpaca-control-button alpaca-control-button-{{@key}} {{styles}}" {{#each value}}{{@key}}="{{value}}" {{/each}}>{{{value}}}</button>
                {{/each}}
            </div>
            {{/if}}
        {{/if}}
    </div>
</script>`;

const defaultSchema = {
    schema: {
        type:"object",
        properties: {
            childMood: {
                type: "object",
                title: "How is your CHILD feeling right now?",
                properties: {
                    rested: {
                        type: "string",
                        enum: ["1", "2", "3", "4", "5", "6", "7"]
                    },
                    healthy: {
                        type: "string",
                        enum: ["1", "2", "3", "4", "5", "6", "7"]
                    },
                    happy: {
                        type: "string",
                        enum: ["1", "2", "3", "4", "5", "6", "7"]
                    },
                    active: {
                        type: "string",
                        enum: ["1", "2", "3", "4", "5", "6", "7"]
                    }
                }
            },
            parentMood: {
                type: "object",
                title: "How are YOU feeling right now?",
                properties: {
                    energetic: {
                        type: "string",
                        enum: ["1", "2", "3", "4", "5", "6", "7"]
                    },
                    ontopofstuff: {
                        type: "string",
                        enum: ["1", "2", "3", "4", "5", "6", "7"]
                    },
                    happy: {
                        type: "string",
                        enum: ["1", "2", "3", "4", "5", "6", "7"]
                    }
                }
            }
        }
    },
    options: {
        fields: {
            childMood: {
                //helper: "1 (not at all) to 7 (very much)",
                fields: {
                    rested: {
                        label: "Tired",
                        label2: "Rested",
                        type: "radio",
                        vertical: false,
                        above: false,
                        focus: true
                    },
                    healthy: {
                        label: "Sick",
                        label2: "Healthy",
                        type: "radio",
                        vertical: false
                    },
                    happy: {
                        label: "Fussy",
                        label2: "Happy",
                        type: "radio",
                        vertical: false
                    },
                    active: {
                        label: "Calm",
                        label2: "Active",
                        type: "radio",
                        vertical: false
                    }
                }
            },
            parentMood: {
                //helper: "1 (not at all) to 7 (very much)",
                fields: {
                    energetic: {
                        label: "Tired",
                        label2: "Energetic",
                        type: "radio",
                        vertical: false,
                        above: false // to show 1-7 labels above radio buttons
                    },
                    ontopofstuff: {
                        label: "Overwhelmed",
                        label2: "On top of things",
                        type: "radio",
                        vertical: false
                    },
                    happy: {
                        label: "Upset",
                        label2: "Happy",
                        type: "radio",
                        vertical: false
                    }
                }
            }
        },
        hideInitValidationError: true,
    },
    view: {
        parent: "bootstrap-edit",
        templates: {
            "control-radio": modifiedControlRadio,
            container: modifiedContainer,
            control: modifiedControl
        }
    }
};

const childStatsSchema = {
    schema: {
        type:"object",
        properties: {
            childStats: {
                type: "object",
                properties: {
                    wakeup: {
                        type: "string",
                        format: "time",
                        required: true
                    },
                    hasSchedule: {
                        type: "object",
                        type: "string",
                        enum: ["Yes", "Yes, and he/she is already due for a nap", "No"],
                        required: true
                    },
                    nextNap: {
                        type: "string",
                        format: "time",
                        dependencies: "hasSchedule",
                        required: true
                    },
                    eat: {
                        type: "string",
                        format: "time",
                        required: true
                    },
                    previousActivities: {
                        type: "string",
                        required: true,
                        minLength: 5
                    }
                }
            }
        },
        dependencies: {
            "time": ["hasSchedule"]
        }
    },
    options: {
        fields: {
            childStats: {
                fields: {
                    wakeup: {
                        //helper: "hours:minutes",
                        placeholder: "hours:minutes",
                        label: "About how long ago did your child last wake up from sleep or a nap?",
                        picker: {
                            format: "HH:mm"
                        },
                        fieldClass: "exp-physics-time-entry",
                        validate: true
                    },

                    hasSchedule: {
                        label: "Does your child have a usual nap schedule?",
                        type: "radio",
                        data: "Yes",
                        removeDefaultNone: true,
                        sort: false,
                        vertical: true
                    },

                    nextNap: {
                        label: "About how much longer until his/her next nap (or bedtime?",
                        //helper: "hours:minutes",
                        placeholder: "hours:minutes",
                        picker: {
                            format: "HH:mm"
                        },
                        fieldClass: "exp-physics-time-entry",
                        dependencies: {
                            hasSchedule: "Yes"
                        },
                        validate: true
                    },

                    eat: {
                        //helper: "hours:minutes",
                        placeholder: "hours:minutes",
                        label: "About how long ago did your child last eat or drink?",
                        picker: {
                            format: "HH:mm"
                        },
                        fieldClass: "exp-physics-time-entry",
                        validate: true
                    },
                    previousActivities: {
                        label: "What was your child doing before this?",
                        placeholder: "examples: having lunch, playing outside, going to the store with me",
                        type: "text",
                        disallowOnlyEmptySpaces: true,
                        validate: true
                    }
                }
            }
        },
        hideInitValidationError: true
    },
    view: "bootstrap-edit"
};

export default ExpFrameBaseComponent.extend({
    layout: layout,
    type: 'exp-mood-questionnaire',
    meta: {
        name: 'ExpMoodQuestionnaire',
        description: 'Mood questionnaire for Lookit.',
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
                childStatsForm: {
                    type: 'jsonschema',
                    description: 'JSON-schema defining this item\'s form',
                    default: childStatsSchema
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
            newOptions.form = {};
            return {
                schema: this.get('form.schema'),
                options: newOptions,
                view: this.get('form.view')
            };
        },
        set(_, value) {
            this.set('formSchema', value);
            return value;
        }

    }),
    childStatsFormSchema: Ember.computed('childStatsForm', {
        get() {
            var newOptions = this.get('childStatsForm.options');
            newOptions.form = {
                buttons: {
                    update: {
                        title: 'Continue',
                        type: 'button',
                        styles: 'btn btn-success'
                    }
                }
            };
            return {
                schema: this.get('childStatsForm.schema'),
                options: newOptions,
                view: this.get('childStatsForm.view')
           };
        },
        set(_, value) {
            this.set('childStatsForm', value);
            return value;
        }

    }),
    formData: [],
    formActions: Ember.computed(function() {
        var root = this;
        return {
            update: function () {

                var moodData = Ember.$(Ember.$('.exp-mood-questionnaire').closest('form')[0]).serializeArray();
                var moodObject = {};
                moodData.forEach(function(currentObj) {
                    moodObject[currentObj.name] = currentObj.value;
                });

                Ember.merge(moodObject, this.getValue().childStats);
                root.set('formData', moodObject);
                root.actions.next.apply(root);

            }
        };
    })
});
