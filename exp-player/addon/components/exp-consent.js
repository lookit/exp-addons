import Ember from 'ember';
import ExpFrameBaseComponent from 'exp-player/components/exp-frame-base';
import layout from '../templates/components/exp-consent';

export default ExpFrameBaseComponent.extend({
    layout: layout,
    meta: {
        name: 'Consent Form',
        description: 'A simple consent form.',
        parameters: {
            type: 'object',
            properties: {
                id: {
                    type: 'string',
                    description: 'A unique identifier for this item'
                },
                title: {
                    type: 'string',
                    default: 'Notice of Consent'
                },
                body: {
                    type: 'string',
                    default: 'Do you consent to take this experiment?'
                },
                consentLabel: {
                    type: 'string',
                    default: 'I agree'
                },
                buttonLabel: {
                    type: 'string',
                    default: 'Continue'
                }
            }
        },
        data: {
            type: 'object',
            properties: {
                consentGranted: {
                    type: 'boolean',
                    default: false
                }
            },
            required: ['consentGranted']
        }
    },
    consentNotGranted: Ember.computed.not('consentGranted')
});
