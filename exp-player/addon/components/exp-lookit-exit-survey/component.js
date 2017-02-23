import layout from './template';

import {validator, buildValidations} from 'ember-cp-validations';

import ExpFrameBaseComponent from '../../components/exp-frame-base/component';
import FullScreen from 'exp-player/mixins/full-screen';

const Validations = buildValidations({
    birthDate: validator('presence', {
        presence: true,
        message: 'This field is required'
    }),
    useOfMedia: validator('presence', {
        presence: true,
        message: 'This field is required',
        disabled(model) {
            return model.get('withdrawal');
        }
    }),
    databraryShare: validator('presence', {
        presence: true,
        message: 'This field is required'
    })
});

export default ExpFrameBaseComponent.extend(Validations, FullScreen, {
    layout: layout,
    type: 'exp-lookit-exit-survey',
    fullScreenElementId: 'experiment-player',
    meta: {
        name: 'ExpLookitExitSurvey',
        description: 'Exit survey for Lookit.',
        parameters: {
            type: 'object',
            properties: {
                id: {
                    type: 'string',
                    description: 'A unique identifier for this item'
                },
                debriefing: {
                    type: 'object',
                    properties: {
                        title: {
                            type: 'string',
                            default: 'Thank you!'
                        },
                        text: {
                            type: 'string'
                        },
                        image: {
                            type: 'object',
                            properties: {
                                src: {
                                    type: 'string'
                                },
                                alt: {
                                    type: 'string'
                                }
                            }
                        }
                    }
                },
                required: ['id', 'debriefing']
            }
        },
        data: {
            type: 'object',
            properties: {
                birthDate: {
                    type: 'string',
                    default: null
                },
                databraryShare: {
                    type: 'string'
                },
                useOfMedia: {
                    type: 'string'
                },
                withdrawal: {
                    type: 'boolean',
                    default: false
                },
                feedback: {
                    type: 'string',
                    default: ''
                }
            }
        }
    },
    section1: true,
    showWithdrawalConfirmation: false,
    showValidation: false,
    actions: {
        advanceToProgressBar() {
            // Move from section 1 (survey) to section 2 (progress bar/ finish button)
            // Mark the session complete at this stage, as all data has been entered
            this.set('section1', false);
            this.sendAction('sessionCompleted');
            this.send('save');
        },
        continue() {
            // Check whether exit survey is valid, and if so, advance to next screen
            if (this.get('validations.isValid')) {
                if (this.get('withdrawal')) {
                    this.set('showWithdrawalConfirmation', true);
                } else {
                    this.send('advanceToProgressBar');
                }
            } else {
                this.set('showValidation', true);
            }
        },
        finish() {
            this.send('next');
        }
    },
    willRender() {
        this.send('exitFullscreen');
    }
});
