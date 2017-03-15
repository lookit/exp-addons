import Ember from 'ember';
import layout from './template';

import {validator, buildValidations} from 'ember-cp-validations';
import config from 'ember-get-config';

import ExpFrameBaseComponent from '../../components/exp-frame-base/component';

function getLength(value) {
    var length = 0;
    if (value !== undefined) {
        length = value.length;
    }
    return length.toString();
}

var presence = validator('presence', {
    presence: true,
    ignoreBlank: true,
    message: 'This field is required'
});

const Validations = buildValidations({
    WhatResponse: presence,
    WhereResponse: presence,
    WhoResponse: presence,
    EventTime: presence
});

export default ExpFrameBaseComponent.extend(Validations, {
    type: 'exp-free-response',
    layout: layout,
    i18n: Ember.inject.service(),
    pageNumber: 2,

    extra: {},
    isRTL: Ember.computed.alias('extra.isRTL'),

    diff1: Ember.computed('WhatResponse', function () {
        var length = getLength(this.get('WhatResponse'));
        var message = this.get('i18n').t('survey.sections.2.questions.11.characterCount').string;
        message = message.replace('0', length.toString());
        return message;
    }),
    diff2: Ember.computed('WhereResponse', function () {
        var length = getLength(this.get('WhereResponse'));
        var message = this.get('i18n').t('survey.sections.2.questions.12.characterCount').string;
        message = message.replace('0', length.toString());
        return message;
    }),
    diff3: Ember.computed('WhoResponse', function () {
        var length = getLength(this.get('WhoResponse'));
        var message = this.get('i18n').t('survey.sections.2.questions.13.characterCount').string;
        message = message.replace('0', length.toString());
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
    placeholder: Ember.computed(function () {
        return this.get('i18n').t('global.selectUnselected');
    }),
    EventTime: null,

    responses: Ember.computed('WhatResponse', 'WhereResponse', 'WhoResponse', 'EventTime', function () {
        var time = this.get('EventTime');
        if (time !== null) {
            time = time['24h'];
        }
        return {
            EventTime: time,
            WhatResponse: this.get('WhatResponse'),
            WhereResponse: this.get('WhereResponse'),
            WhoResponse: this.get('WhoResponse')
        };
    }),

    allowNext: Ember.computed('validations.isValid', function () {
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
                        EventTime: {
                            type: 'string'
                        },
                        WhatResponse: {
                            type: 'string'
                        },
                        WhereResponse: {
                            type: 'string'
                        },
                        WhoResponse: {
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
        }
    },
    loadData: function (frameData) {
        var responses = frameData.responses;
        var times = this.get('times');
        var eventTime = null;
        for (var i = 0; i < times.length; i++) {
            if (times[i]['24h'] === responses.EventTime) {
                eventTime = times[i];
            }
        }
        this.set('EventTime', eventTime);
        this.set('WhatResponse', responses.WhatResponse);
        this.set('WhereResponse', responses.WhereResponse);
        this.set('WhoResponse', responses.WhoResponse);
    }
});
