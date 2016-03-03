import Ember from 'ember';

import ExpFrameBaseComponent from 'exp-player/components/exp-frame-base';
import layout from '../templates/components/exp-mood-questionnaire';

const defaultSchema = {
    schema: {
        type:"object",
        properties: {
            childMood: {
                type: "object",
                title: "Please rate how much each of these words describes your child right now:",
                properties: {
                    silly: {
                        type: "string",
                        enum: ["1", "2", "3", "4", "5", "6", "7"]
                    },
                    happy: {
                        type: "string",
                        enum: ["1", "2", "3", "4", "5", "6", "7"]
                    },
                    energetic: {
                        type: "string",
                        enum: ["1", "2", "3", "4", "5", "6", "7"]
                    },
                    calm: {
                        type: "string",
                        enum: ["1", "2", "3", "4", "5", "6", "7"]
                    },
                    fussy: {
                        type: "string",
                        enum: ["1", "2", "3", "4", "5", "6", "7"]
                    },
                    tired: {
                        type: "string",
                        enum: ["1", "2", "3", "4", "5", "6", "7"]
                    },
                    focused: {
                        type: "string",
                        enum: ["1", "2", "3", "4", "5", "6", "7"]
                    },
                    hungry: {
                        type: "string",
                        enum: ["1", "2", "3", "4", "5", "6", "7"]
                    },
                    sick: {
                        type: "string",
                        enum: ["1", "2", "3", "4", "5", "6", "7"]
                    }
                }
            },
            parentMood: {
                type: "object",
                title: "Please rate how much each of these words describes you right now:",
                properties: {
                    happy: {
                        type: "string",
                        enum: ["1", "2", "3", "4", "5", "6", "7"]
                    },
                    energetic: {
                        type: "string",
                        enum: ["1", "2", "3", "4", "5", "6", "7"]
                    },
                    calm: {
                        type: "string",
                        enum: ["1", "2", "3", "4", "5", "6", "7"]
                    },
                    frustrated: {
                        type: "string",
                        enum: ["1", "2", "3", "4", "5", "6", "7"]
                    },
                    tired: {
                        type: "string",
                        enum: ["1", "2", "3", "4", "5", "6", "7"]
                    },
                    stressed: {
                        type: "string",
                        enum: ["1", "2", "3", "4", "5", "6", "7"]
                    }
                }
            },
            childStats: {
                type: "object",
                properties: {
                    wakeup: {
                        type: "string",
                        format: "datetime"
                    },
                    schedule: {
                        type: "object",
                        properties: {
                            time: {
                                type: "string",
                                format: "datetime"
                            },
                            other: {
                                type: "string",
                                enum: ["No usual nap schedule", "Already due for a nap"]
                            }

                        }
                    },
                    eat: {
                        type: "string",
                        format: "datetime"
                    },
                    previousActivities: {
                        type: "string"
                    }
                }
            }
        }
    },
    options: {
        fields: {
            childMood: {
                fields: {
                    silly: {
                        label: "Silly",
                        type: "radio",
                        vertical: false,
                        above: true
                    },
                    happy: {
                        label: "Happy",
                        type: "radio",
                        vertical: false
                    },
                    energetic: {
                        label: "Energetic",
                        type: "radio",
                        vertical: false
                    },
                    calm: {
                        label: "Calm",
                        type: "radio",
                        vertical: false
                    },
                    fussy: {
                        label: "Fussy",
                        type: "radio",
                        vertical: false
                    },
                    tired: {
                        label: "Tired",
                        type: "radio",
                        vertical: false
                    },
                    focused: {
                        label: "Focused",
                        type: "radio",
                        vertical: false
                    },
                    hungry: {
                        label: "Hungry",
                        type: "radio",
                        vertical: false
                    },
                    sick: {
                        label: "Sick",
                        type: "radio",
                        vertical: false
                    }
                }
            },
            parentMood: {
                fields: {
                    happy: {
                        label: "Happy",
                        type: "radio",
                        vertical: false,
                        above: true
                    },
                    energetic: {
                        label: "Energetic",
                        type: "radio",
                        vertical: false
                    },
                    calm: {
                        label: "Calm",
                        type: "radio",
                        vertical: false
                    },
                    frustrated: {
                        label: "Frustrated",
                        type: "radio",
                        vertical: false
                    },
                    tired: {
                        label: "Tired",
                        type: "radio",
                        vertical: false
                    },
                    stressed: {
                        label: "Stressed",
                        type: "radio",
                        vertical: false
                    }
                }
            },
            childStats: {
                fields: {
                    wakeup: {
                        label: "When did your child last wake up from sleep or a nap?",
                        picker: {
                            format: "HH:mm"
                        }
                    },
                    schedule: {
                        fields: {
                            time: {
                                label: "If your child has a usual nap schedule, when is he due for his/her next nap?",
                                picker: {
                                    format: "HH:mm"
                                }
                            },
                            other: {
                                type: "radio",
                                vertical: false
                            }
                        }
                    },
                    eat: {
                        label: "When did your child last eat or drink?",
                        picker: {
                            format: "HH:mm"
                        }
                    },
                    previousActivities: {
                        label: "What was your child doing before this?",
                        helper: "e.g., having lunch, playing with his brother outside, going to the store with me",
                        type: "text"
                    }
                }
            }
        }
    },
    view: {
        parent: "bootstrap-edit",
        templates: {
            "control-radio": '<script type="text/x-handlebars-template">{{#each selectOptions}}<div class="radio">{{#if ../options.above}}<div>{{{text}}}</div>{{/if}}<label><input type="radio" {{#if ../options.readonly}}readonly="readonly"{{/if}} name="{{../name}}" value="{{value}}" {{#compare value ../data}}checked="checked"{{/compare}}/></label></div>{{/each}}</script>',
            control: '<script type="text/x-handlebars-template"><div>{{#if options.label}}<span class="col-xs-1"><label class="{{#if options.labelClass}}{{options.labelClass}}{{/if}} alpaca-control-label" for="{{id}}">{{{options.label}}}</label></span>{{/if}}<span class="col-xs-11">{{#control}}{{/control}}</span>{{#if options.helpers}}{{#each options.helpers}}<p class="{{#if options.helperClass}}{{options.helperClass}}{{/if}}"><i class="info-sign"></i>{{{.}}}</p>{{/each}}{{/if}}{{#if options.renderButtons}}{{#if options.buttons}}<div class="alpaca-control-buttons-container">{{#each options.buttons}}<button data-key="{{@key}}" type="{{type}}" class="alpaca-control-button alpaca-control-button-{{@key}} {{styles}}" {{#each value}}{{@key}}="{{value}}" {{/each}}>{{{value}}}</button>{{/each}}</div>{{/if}}{{/if}}</div></script>'
        },
        fields: {
            "/childStats/schedule/other": {
                templates: {
                    control: '<script type="text/x-handlebars-template"><div>{{#if options.label}}<label class="{{#if options.labelClass}}{{options.labelClass}}{{/if}} alpaca-control-label" for="{{id}}">{{{options.label}}}</label>{{/if}}{{#control}}{{/control}}{{#if options.helpers}}{{#each options.helpers}}<p class="{{#if options.helperClass}}{{options.helperClass}}{{/if}}"><i class="info-sign"></i>{{{.}}}</p>{{/each}}{{/if}}{{#if options.renderButtons}}{{#if options.buttons}}<div class="alpaca-control-buttons-container">{{#each options.buttons}}<button data-key="{{@key}}" type="{{type}}" class="alpaca-control-button alpaca-control-button-{{@key}} {{styles}}" {{#each value}}{{@key}}="{{value}}" {{/each}}>{{{value}}}</button>{{/each}}</div>{{/if}}{{/if}}</div></script>', // '../templates/components/exp-form-template.html',
                    "control-radio": '<script type="text/x-handlebars-template">{{#each selectOptions}}<div class="radio"><label><input type="radio" {{#if ../options.readonly}}readonly="readonly"{{/if}} name="{{../name}}" value="{{value}}" {{#compare value ../data}}checked="checked"{{/compare}}/>{{{text}}}</label></div>{{/each}}</script>'
                }
            },
            "/childStats/schedule/time": {
                templates: {
                    control: '<script type="text/x-handlebars-template"><div>{{#if options.label}}<label class="{{#if options.labelClass}}{{options.labelClass}}{{/if}} alpaca-control-label" for="{{id}}">{{{options.label}}}</label>{{/if}}{{#control}}{{/control}}{{#if options.helpers}}{{#each options.helpers}}<p class="{{#if options.helperClass}}{{options.helperClass}}{{/if}}"><i class="info-sign"></i>{{{.}}}</p>{{/each}}{{/if}}{{#if options.renderButtons}}{{#if options.buttons}}<div class="alpaca-control-buttons-container">{{#each options.buttons}}<button data-key="{{@key}}" type="{{type}}" class="alpaca-control-button alpaca-control-button-{{@key}} {{styles}}" {{#each value}}{{@key}}="{{value}}" {{/each}}>{{{value}}}</button>{{/each}}</div>{{/if}}{{/if}}</div></script>', // '../templates/components/exp-form-template.html',
                }
            },
            "/childStats/wakeup": {
                templates: {
                    control: '<script type="text/x-handlebars-template"><div>{{#if options.label}}<label class="{{#if options.labelClass}}{{options.labelClass}}{{/if}} alpaca-control-label" for="{{id}}">{{{options.label}}}</label>{{/if}}{{#control}}{{/control}}{{#if options.helpers}}{{#each options.helpers}}<p class="{{#if options.helperClass}}{{options.helperClass}}{{/if}}"><i class="info-sign"></i>{{{.}}}</p>{{/each}}{{/if}}{{#if options.renderButtons}}{{#if options.buttons}}<div class="alpaca-control-buttons-container">{{#each options.buttons}}<button data-key="{{@key}}" type="{{type}}" class="alpaca-control-button alpaca-control-button-{{@key}} {{styles}}" {{#each value}}{{@key}}="{{value}}" {{/each}}>{{{value}}}</button>{{/each}}</div>{{/if}}{{/if}}</div></script>', // '../templates/components/exp-form-template.html',
                }
            },
            "/childStats/eat": {
                templates: {
                    control: '<script type="text/x-handlebars-template"><div>{{#if options.label}}<label class="{{#if options.labelClass}}{{options.labelClass}}{{/if}} alpaca-control-label" for="{{id}}">{{{options.label}}}</label>{{/if}}{{#control}}{{/control}}{{#if options.helpers}}{{#each options.helpers}}<p class="{{#if options.helperClass}}{{options.helperClass}}{{/if}}"><i class="info-sign"></i>{{{.}}}</p>{{/each}}{{/if}}{{#if options.renderButtons}}{{#if options.buttons}}<div class="alpaca-control-buttons-container">{{#each options.buttons}}<button data-key="{{@key}}" type="{{type}}" class="alpaca-control-button alpaca-control-button-{{@key}} {{styles}}" {{#each value}}{{@key}}="{{value}}" {{/each}}>{{{value}}}</button>{{/each}}</div>{{/if}}{{/if}}</div></script>', // '../templates/components/exp-form-template.html',
                }
            },
            "/childStats/previousActivities": {
                templates: {
                    control: '<script type="text/x-handlebars-template"><div>{{#if options.label}}<label class="{{#if options.labelClass}}{{options.labelClass}}{{/if}} alpaca-control-label" for="{{id}}">{{{options.label}}}</label>{{/if}}{{#control}}{{/control}}{{#if options.helpers}}{{#each options.helpers}}<p class="{{#if options.helperClass}}{{options.helperClass}}{{/if}}"><i class="info-sign"></i>{{{.}}}</p>{{/each}}{{/if}}{{#if options.renderButtons}}{{#if options.buttons}}<div class="alpaca-control-buttons-container">{{#each options.buttons}}<button data-key="{{@key}}" type="{{type}}" class="alpaca-control-button alpaca-control-button-{{@key}} {{styles}}" {{#each value}}{{@key}}="{{value}}" {{/each}}>{{{value}}}</button>{{/each}}</div>{{/if}}{{/if}}</div></script>', // '../templates/components/exp-form-template.html',
                }
            },
            "/childMood": {
                templates: {
                    container: '<script type="text/x-handlebars-template"><div>{{#if options.label}}<label class="{{#if options.labelClass}}{{options.labelClass}}{{/if}} alpaca-control-label">{{{options.label}}}</label>{{/if}}{{#if options.helpers}}{{#each options.helpers}}<p class="alpaca-helper {{#if options.helperClass}}{{options.helperClass}}{{/if}}"><i class="alpaca-icon-helper"></i>{{{.}}}</p>{{/each}}{{/if}}{{#container}}{{/container}}</div></script>', // '../templates/components/exp-form-template.html',
                }
            },
            "/parentMood": {
                templates: {
                    container: '<script type="text/x-handlebars-template"><div>{{#if options.label}}<label class="{{#if options.labelClass}}{{options.labelClass}}{{/if}} alpaca-control-label">{{{options.label}}}</label>{{/if}}{{#if options.helpers}}{{#each options.helpers}}<p class="alpaca-helper {{#if options.helperClass}}{{options.helperClass}}{{/if}}"><i class="alpaca-icon-helper"></i>{{{.}}}</p>{{/each}}{{/if}}{{#container}}{{/container}}</div></script>', // '../templates/components/exp-form-template.html',
                }
            }
        }
    }
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
            var root = this;
            var newOptions = this.get('form.options');
            newOptions.form = {
                buttons: {
                    update: {
                        title: 'Continue',
                        type: 'button',
                        styles: 'btn btn-default'
                    }
                }
            };
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
    formData: [],
    formActions: Ember.computed(function() {
        var root = this;
        return {
            update: function () {
                this.refreshValidationState(true);
                if (this.isValid(true)) {
                   root.set('formData', this.getValue());
                   root.actions.next();
                }
            }
        }
    })
});
