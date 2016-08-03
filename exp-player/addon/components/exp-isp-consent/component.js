import Ember from 'ember';
import ExpConsentComponent from 'exp-player/components/exp-consent';
import layout from './template';


export default ExpConsentComponent.extend({
    i18n: Ember.inject.service(),
    type: 'exp-isp-consent',
    layout: layout,
    meta: {
        name: 'Consent Form',
        description: 'A simple consent form.',
        parameters: {
            type: 'object',
            properties: {
                p1: {
                    type: 'string',
                    default: 'consent.firstSection'
                },
                p2: {
                    type: 'string',
                    default: 'consent.secondSection'
                },
                p3: {
                    type: 'string',
                    default: 'consent.thirdSection'
                }
            }
        },
        data: {
            type: 'object',
            properties: {
                // data structure defined in exp-consent.js
            }
        }
    }
});
