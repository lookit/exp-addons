import Ember from 'ember';
import ExpFrameBaseComponent from 'exp-player/components/exp-frame-base';
import layout from './template';
import {validator, buildValidations} from 'ember-cp-validations';


function getLength(value) {
    var length = 0;
    if (value !== undefined) {
        length = value.length;
    }
    return length.toString();
}

var presence = validator('presence', {
    presence: true,
    message: 'This field is required'
});

const Validations = buildValidations({
    q1: presence,
    q2: presence,
    q3: presence
});

export default ExpFrameBaseComponent.extend(Validations, {
    type: 'exp-free-response',
    layout: layout,
    i18n: Ember.inject.service(),
    displayTime: Ember.computed(function() {
        var condition = this.get('session').get('experimentCondition');
        if (condition === '7pm') {
            return '19:00 (7pm)';
        } else if (condition === '10am') {
            return '10am';
        }
    }),
    instructions: Ember.computed(function() {
      var instructions = this.get('i18n').t('survey.sections.2.instructions').string;
      instructions = instructions.replace('##', this.get('displayTime'));
      return instructions;
    }),
    label1: Ember.computed(function() {
      var label = this.get('i18n').t('survey.sections.2.questions.11.label').string;
      label = label.replace('##', this.get('displayTime'));
      return label;
    }),
    diff1: Ember.computed('q1', function() {
        var length = getLength(this.get('q1'));
        var message = this.get('i18n').t('survey.sections.2.questions.11.characterCount').string;
        message = message.replace("0", length.toString());
        return message;
    }),
    diff2: Ember.computed('q2', function() {
        var length = getLength(this.get('q2'));
        var message = this.get('i18n').t('survey.sections.2.questions.12.characterCount').string;
        message = message.replace("0", length.toString());
        return message;
    }),
    diff3: Ember.computed('q3', function() {
        var length = getLength(this.get('q3'));
        var message = this.get('i18n').t('survey.sections.2.questions.13.characterCount').string;
        message = message.replace("0", length.toString());
        return message;
    }),
    meta: {
        name: 'ExpFreeResponse',
        description: 'TODO: a description of this frame goes here.',
        parameters: {
            type: 'object',
            properties: {
                // define parameters here
            }
        },
        data: {
            type: 'object',
            properties: {
                q1: {
                    type: 'string'
                },
                q2: {
                    type: 'string'
                },
                q3: {
                    type: 'string'
                }
            }
        }
    },
    actions: {
        continue() {
            this.send('next');
        }
    }
});
