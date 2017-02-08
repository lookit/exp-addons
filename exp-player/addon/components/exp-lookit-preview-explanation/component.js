import layout from './template';

import ExpFrameBaseComponent from '../../components/exp-frame-base/component';

export default ExpFrameBaseComponent.extend({
    type: 'exp-lookit-preview-explanation',
    layout: layout,
    meta: {
        name: 'ExpLookitPreviewExplanation',
        description: 'Let parents know about blinding, give option to preview videos.',
        parameters: {
            type: 'object',
            properties: {
                id: {
                    type: 'string',
                    description: 'A unique identifier for this item'
                },
                showPreviousButton: {
                    type: 'boolean',
                    default: true
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
                            emph: {
                                type: 'boolean'
                            }
                        }
                    },
                    default: []
                },
                introBlock: {
                    type: 'object',
                    properties: {
                        title: {
                            type: 'string'
                        },
                        text: {
                            type: 'string'
                        },
                        emph: {
                            type: 'boolean'
                        }
                    }
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
                },
                previewButtonText: {
                    type: 'string',
                    default: 'I\'d like to preview the videos'
                },
                skipButtonText: {
                    type: 'string',
                    default: 'Skip preview'
                }
            }
        },
        data: {
            type: 'object',
            properties: {
                // define data structure here
            }
        }
    },
    actions: {
        skipone: function() {
            this.get('skipone')();
        }
    }
});
