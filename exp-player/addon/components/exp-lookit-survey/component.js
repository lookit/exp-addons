import Ember from 'ember';
import layout from './template';
import ExpFrameBaseComponent from 'exp-player/components/exp-frame-base/component';

/**
 * @module exp-player
 * @submodule frames
 */

let {
    $
} = Ember;

/**
 * Basic survey frame allowing researcher to specify question text and types.
 *
 * This frame uses ember-cli-dynamic-forms as a wrapper for alpacajs, a powerful
 * library for generating online forms. To specify the structure of your form
 * (questions, answer types, validation), you provide a single 'formSchema' structure.
 * The 'formSchema' consists of a 'schema' object and an 'options' object, described
 * under Properties.
 *
 * You can choose from any question types listed at http://www.alpacajs.org/documentation.html.
 * In that documentation, you will see that each field type - e.g., Checkbox, Radio, Text -
 * has some 'Schema' properties and some 'Options' properties. The properties under 'Schema'
 * will be defined in the 'schema' object of your formSchema. The properties under 'Options'
 * will be defined in the 'options' object of your formSchema.
 *
 * Many question types allow you to easily validate answers. For instance, for a "number"
 * field you can set minimum and maximum values, and entries will automatically be
 * required to be numeric (http://www.alpacajs.org/docs/fields/number.html). You can also
 * either set required: true in the schema->properties entry for this field OR set
 * validator: required-field in the options->fields entry if you want to require that the
 * participant enters something. A validation error message will be displayed next to
 * any fields that fail validation checks and the participant will not be able to proceed until
 * these are addressed.
 *
 * If a participant returns to this frame after continuing, via a 'Previous' button on the
 * next frame, then the values in this form are pre-filled.
 *
 * No video recording is conducted on this frame.
 *
 * A previous button may optionally be included on this frame.
 *
 * The form itself occupies a maximum of 800px horizontally and takes up 80% of the vertical
 * height of the window (it will scroll to fit).
 *
 * Although this frame provides fairly powerful capabilities via alpacajs, here are some
 * things that would currently still require customization of the frame source code:
 * editing the formatting; displaying images or playing audio/video; custom validation or
 * dynamic addition/removal of fields.


```json
 "frames": {
        "pet-survey": {
            "id": "pet-survey",
            "kind": "exp-lookit-survey",
            "formSchema": {
                "schema": {
                    "type": "object",
                    "title": "Tell us about your pet!",
                    "properties": {
                        "age": {
                            "type": "integer",
                            "title": "Age",
                            "maximum": 200,
                            "minimum": 0,
                            "required": true
                        },
                        "name": {
                            "type": "string",
                            "title": "Name",
                            "required": true
                        },
                        "species": {
                            "enum": [
                                "dog",
                                "cat",
                                "fish",
                                "bird",
                                "raccoon"
                            ],
                            "type": "string",
                            "title": "What type of animal?",
                            "default": ""
                        }
                    }
                },
                "options": {
                    "fields": {
                        "age": {
                            "hideInitValidationError": true
                        },
                        "name": {
                            "placeholder": "a name...",
                            "hideInitValidationError": true
                        },
                        "species": {
                            "type": "radio",
                            "message": "Seriously, what species??",
                            "validator": "required-field",
                            "hideInitValidationError": true
                        }
                    }
                }
            },
            "nextButtonText": "Moving on..."
        }
    }

 * ```
 * @class ExpLookitSurvey
 * @extends ExpFrameBase
 */

export default ExpFrameBaseComponent.extend({
    type: 'exp-lookit-survey',
    layout: layout,
    meta: {
        name: 'ExpLookitSurvey',
        description: 'A basic survey frame.',
        parameters: {
            type: 'object',
            properties: {
                /**
                 * Whether to show a 'previous' button
                 *
                 * @property {Boolean} showPreviousButton
                 * @default true
                 */
                showPreviousButton: {
                    type: 'boolean',
                    default: true
                },
                /**
                 * Text to display on the 'next frame' button
                 *
                 * @property {String} nextButtonText
                 * @default 'Next'
                 */
                nextButtonText: {
                    type: 'string',
                    default: 'Next'
                },
                /**
                Object specifying the content of the form. This is in the same format as
                the example definition of the const 'schema' at http://toddjordan.github.io/ember-cli-dynamic-forms/#/demos/data:
                a schema and options are designated separately. Each field of the form
                must be defined in schema. Options may additionally be specified in options.

                @property {Object} formSchema
                    @param {Object} schema The schema defines the fields in this form. It has the following properties:
                    'type' (which MUST BE THE STRING 'object'),
                    'title' (a form title for display), and
                    'properties'. 'properties' is an object defining the set of fields in this form and
                        their associated data types, at minimum. Each key:value pair in this object is of
                        the form FIELDNAME:object. The FIELDNAME is something you select; it should be
                        unique within this form. The object contains at least 'type' and 'title' values,
                        as well as any additional desired parameters that belong to the 'Schema' for the
                        desired field described at http://www.alpacajs.org/documentation.html.
                    @param {Object} options The options allow additional customization of the forms specified in the schema. This
                        object should have a single key 'fields' mapping to an object. Each key:value pair in this object is of
                        the form FIELDNAME:object, with FIELDNAMEs the same as in the schema.
                        The potential parameters to use are those that belong to the 'Options' for the
                        desired field described at  http://www.alpacajs.org/documentation.html.
                */
                formSchema: {
                    type: 'object',
                    properties: {
                        schema: {
                            type: 'object'
                        },
                        options: {
                            type: 'object'
                        }
                    }
                }
            }
        },
        data: {
            /**
             * Parameters captured and sent to the server
             *
             * @method serializeContent
             * @param {Object} formSchema The same formSchema that was provided as a parameter to this frame, for ease of analysis if randomizing or iterating on experimental design.
             * @param {Object} formData Data corresponding to the fields defined in formSchema['schema']['properties']. The keys of formData are the FIELDNAMEs used there, and the values are the participant's responses. Note that if the participant does not answer a question, that key may be absent, rather than being present with a null value.
             * @param {Object} eventTimings Only events captured during this frame are 'nextFrame'/'previousFrame'; example eventTimings value: `[{u'eventType': u'nextFrame', u'timestamp': u'2016-08-03T00:45:37.157Z'}]`
             * @return {Object} The payload sent to the server
             */
            type: 'object',
            properties: {
                formSchema: {
                    type: 'object'
                },
                formData: {
                    type: 'object'
                }
            }
        }
    },
    form: null,
    formData: null,
    actions: {
        setupForm(form) {
            this.set('form', form);
            // If we've gotten here via 'previous' and so already have data, set the
            // JSON value of this form to that data.
            // Look for any expData keys starting with frameIndex-, e.g. '12-'
            var _this = this;
            $.each(this.session.get('expData'), function(key, val) {
                if (key.startsWith(_this.frameIndex + '-')) {
                    _this.get('form').setValue(val.formData);
                    return;
                }
            });
        },
        finish() {
            var _this = this;
            // Don't allow to progress until validation succeeds. It's important
            // to do the check within the refreshValidationState callback rather than
            // separately because otherwise we may proceed before validation can
            // finish and return false.
            this.get('form').refreshValidationState(true, function() {
                if (_this.get('form').isValid(true)) {
                    _this.set('formData', _this.get('form').getValue());
                    _this.send('next');
                } else {
                    _this.get('form').focus();
                    return;
                }
            });

        }
    }

});

