import Ember from 'ember';

import layout from './template';
import ExpFrameBaseComponent from '../../components/exp-frame-base/component';

export default ExpFrameBaseComponent.extend({

    extra: {},
    isRTL: Ember.computed.alias('extra.isRTL'),

    type: 'exp-thank-you',
    layout: layout,
    meta: {
        name: 'ExpThankYou',
        description: 'TODO: a description of this frame goes here.',
        parameters: {
            type: 'object',
            properties: {
                exitUrl: {
                    type: 'string',
                    default: 'exit'
                },
                resultsUrl: {
                    type: 'string',
                    default: 'participate.survey.results'
                }
            }
        },
        data: {
            type: 'object',
            properties: {
                // define data structure here
            }
        }
    }
});
