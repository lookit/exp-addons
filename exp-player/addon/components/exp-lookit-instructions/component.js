import Ember from 'ember';

import layout from './template';
import ExpFrameBaseComponent from '../../components/exp-frame-base/component';

export default ExpFrameBaseComponent.extend({
    layout: layout,
    type: 'exp-lookit-instructions',
    didFinishSound: false,
    meta: {
        name: 'ExpLookitInstructions',
        description: 'TODO: a description of this frame goes here.',
        parameters: {
            type: 'object',
            properties: {
                id: {
                    type: 'string',
                    description: 'A unique identifier for this item'
                },
                mustPlay: {
                    type: 'boolean',
                    description: 'Should the user be forced to play the clip before leaving the page?',
                    default: true
                },
                audioBlock: {
                    type: 'object',
                    properties: {
                        title: {
                            type: 'string',
                            default: 'Test your audio'
                        },
                        text: {
                            type: 'string',
                            default: 'You should hear "Ready to go?"'
                        },
                        warningText: {
                            type: 'string',
                            default: 'Please try playing the sample audio.'
                        },
                        sources: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    src: {
                                        type: 'string'
                                    },
                                    type: {
                                        type: 'string'
                                    }
                                }
                            }
                        }
                    }
                },
                blocks: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            title: {
                                type: 'string'
                            },
                            text: {
                                type: 'string'
                            },
                            listblocks: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
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
                                }
                            }
                        }
                    },
                    default: []
                },
                showPreviousButton: {
                    type: 'boolean',
                    default: true
                },
                nextButtonText: {
                    type: 'string',
                    default: 'Start the videos! \n (You\'ll have a moment to turn around.)'
                }
            },
            required: ['id']
        },
        data: {
            type: 'object',
            properties: {  // We don't *need* to tell the server about this, but it might be nice to track usage of the setup page
                didFinishSound: {
                    type: 'boolean',
                    default: false
                },
                showWarning: {
                    type: 'boolean',
                    default: false
                }
            },
            required: ['didFinishSound', 'showWarning']
        }
    },

    actions: {
        soundPlayed() {
            this.set('didFinishSound', true);
            this.set('preventNext', false);
            this.set('showWarning', false);
        },
        checkAudioThenNext() {
            if (this.preventNext) {
                this.set('showWarning', true);
            } else {
                this.send('next');
            }
        }
    },

    preventNext: Ember.computed('mustPlay', 'didFinishSound', function() {
        if (!this.get('mustPlay')) {
            return false;
        } else {
            // Optionally force user to listen to clip before continuing
            return !this.get('didFinishSound');
        }
    })
});
