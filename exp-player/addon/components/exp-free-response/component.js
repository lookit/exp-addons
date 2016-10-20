var $ = Ember.$;
import Ember from 'ember';
import ExpFrameBaseComponent from 'exp-player/components/exp-frame-base';
import layout from './template';
import {validator, buildValidations} from 'ember-cp-validations';
import config from 'ember-get-config';


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
    q3: presence,
    q4: presence
});

export default ExpFrameBaseComponent.extend(Validations, {
    type: 'exp-free-response',
    layout: layout,
    i18n: Ember.inject.service(),
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
    times: [
        {'12h': '12:00 AM', '24h': '0:00'},
        {'12h': '1:00 AM', '24h': '1:00'},
        {'12h': '2:00 AM', '24h': '2:00'},
        {'12h': '3:00 AM', '24h': '3:00'},
        {'12h': '4:00 AM', '24h': '4:00'},
        {'12h': '5:00 AM', '24h': '5:00'},
        {'12h': '6:00 AM', '24h': '6:00'},
        {'12h': '7:00 AM', '24h': '7:00'},
        {'12h': '8:00 AM', '24h': '8:00'},
        {'12h': '9:00 AM', '24h': '9:00'},
        {'12h': '10:00 AM', '24h': '10:00'},
        {'12h': '11:00 AM', '24h': '11:00'},
        {'12h': '12:00 PM', '24h': '12:00'},
        {'12h': '1:00 PM', '24h': '13:00'},
        {'12h': '2:00 PM', '24h': '14:00'},
        {'12h': '3:00 PM', '24h': '15:00'},
        {'12h': '4:00 PM', '24h': '16:00'},
        {'12h': '5:00 PM', '24h': '17:00'},
        {'12h': '6:00 PM', '24h': '18:00'},
        {'12h': '7:00 PM', '24h': '19:00'},
        {'12h': '8:00 PM', '24h': '20:00'},
        {'12h': '9:00 PM', '24h': '21:00'},
        {'12h': '10:00 PM', '24h': '22:00'},
        {'12h': '11:00 PM', '24h': '23:00'},
        {'12h': '12:00 AM', '24h': '24:00'}
    ],
    placeholder: Ember.computed(function() {
       return this.get('i18n').t('global.selectUnselected');
    }),
    q4: null,

    responses: Ember.computed('q1', 'q2', 'q3', 'q4', function() {
        return {
            q1: this.get('q1'),
            q2: this.get('q2'),
            q3: this.get('q3'),
            q4: this.get('q4')
        };
    }),

    allowNext: Ember.computed('validations.isValid', function() {
        if (config.featureFlags.validate) {
            return this.get('validations.isValid');
        }
        return true;
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
                responses: {
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
                        },
                        q4: {
                            type: 'string'
                        }
                    }
                }
            }
        }
    },
    actions: {
        continue() {
            if (this.get('allowNext')) {
                this.send('next');
            }
        },
    },
    loadData: function(frameData) {
        var responses = frameData.responses;
        this.set('q1', responses.q1);
        this.set('q2', responses.q2);
        this.set('q3', responses.q3);
        this.set('q4', responses.q4);
    }
});
