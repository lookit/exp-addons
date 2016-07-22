import Ember from 'ember';
import ExpFrameBaseComponent from 'exp-player/components/exp-frame-base';
import layout from './template';
import { translationMacro as t } from "ember-i18n";
import {validator, buildValidations} from 'ember-cp-validations';

const MAX_LENGTH = 75;

function getRemaining(value) {
    var length = 0;
    if (value !== null) {
        length = value.length;
    }
    return (MAX_LENGTH - length).toString();
}

var presence = validator('presence', {
    presence:true,
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
    diff1: Ember.computed('q1', function() {
        var remaining = getRemaining(this.get('q1'));
        var translationKey = 'number' + remaining;
        var message = this.get('i18n').t('survey.sections.2.questions.11.characterCount').string;
        message = message.replace("75", this.get('i18n').t('number75').string);
        message = message.replace("0", this.get('i18n').t(translationKey).string);
        return message;
    }),
    diff2: Ember.computed('q2', function() {
        var remaining = getRemaining(this.get('q2'));
        var translationKey = 'number' + remaining;
        var message = this.get('i18n').t('survey.sections.2.questions.12.characterCount').string;
        message = message.replace("##", this.get('i18n').t('number75').string);
        message = message.replace("0", this.get('i18n').t(translationKey).string);
        return message;
    }),
    diff3: Ember.computed('q3', function() {
        var remaining = getRemaining(this.get('q3'));
        var translationKey = 'number' + remaining;
        var message = this.get('i18n').t('survey.sections.2.questions.13.characterCount').string;
        message = message.replace("##", this.get('i18n').t('number75').string);
        message = message.replace("0", this.get('i18n').t(translationKey).string);
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
                    type: 'string',
                    default: null
                },
                q2: {
                    type: 'string',
                    default: null
                },
                q3: {
                    type: 'string',
                    default: null
                }
            }
        }
    },
    actions: {
        continue() {
            if (this.get('validations.isValid')) {
                this.send('next');
            } else {
                this.set('showValidation', true);
            }
        }
    }
});
