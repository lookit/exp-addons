import Ember from 'ember';

import layout from './template';
import ExpFrameBaseUnsafeComponent from '../../components/exp-frame-base-unsafe/component';

/**
 * @module exp-player
 * @submodule frames
 */

/**
 * A frame to display bulleted instructions to the user, along with an audio clip to make sure sound playback is working (this may, optionally, be required to move on). This is intended to come immediately before test trials which may be fullscreen, and is therefore an 'unsafe' frame (allows proceeding even if data isn't saved); no user data from this frame is critical.

```json
 "frames": {
"final-instructions": {
            "mustPlay": true,
            "kind": "exp-lookit-instructions",
            "nextButtonText": "Start the videos! \n (You'll have a moment to turn around.)",
            "id": "final-instructions",
            "blocks": [
                {
                    "text": "The video section will take about 6 minutes to complete. After that, you will be able to select a level of privacy for your data."
                },
                {
                    "title": "Study overview",
                    "listblocks": [
                        {
                            "text": "There will be four videos, each a little over a minute long. "
                        },
                        {
                            "text": "You’ll hear spoken updates between videos."
                        }
                    ]
                },
                {
                    "title": "During the videos",
                    "listblocks": [
                        {
                            "text": "Please face away from the screen, holding your infant so they can look over your shoulder. Please don't look at the videos yourself, as we may not be able to use your infant’s data in that case.",
                            "image": {
                                "src": "https://s3.amazonaws.com/lookitcontents/exp-physics/OverShoulder.jpg",
                                "alt": "Father holding child looking over his shoulder"
                            }
                        },
                        {
                            "text": "Don’t worry if your baby isn’t looking at the screen the entire time! Please just try to keep them facing the screen so they can look if they want to."
                        },
                        {
                            "text": "If you’d like, you can direct your infant’s attention to the screen by saying things like, 'What’s happening?' But don’t talk about specific things that might be happening in the videos."
                        }
                    ]
                },
                {
                    "title": "Pausing and stopping",
                    "listblocks": [
                        {
                            "text": "If your child gets fussy or distracted, or you need to attend to something else for a moment, you can pause the study during the breaks between videos. "
                        },
                        {
                            "text": "If you need to end the study early, just close the window or tab. You’ll be prompted to note any technical problems you might be experiencing and to select a privacy level for your videos."
                        }
                    ]
                }
            ],
            "audioBlock": {
                "text": "You should hear 'Ready to go?'",
                "warningText": "Please try playing the sample audio.",
                "title": "Test your audio",
                "sources": [
                    {
                        "src": "https://s3.amazonaws.com/lookitcontents/ready.mp3",
                        "type": "audio/mp3"
                    },
                    {
                        "src": "https://s3.amazonaws.com/lookitcontents/ready.ogg",
                        "type": "audio/ogg"
                    }
                ]
            }
        }
 }

 * ```
 * @class ExpLookitInstructions
 * @extends ExpFrameBaseUnsafe
 */

export default ExpFrameBaseUnsafeComponent.extend({
    // 'Unsafe' allows this component to come immediately before a full-screen
    // trial component if needed; no user data from this frame is critical.
    layout: layout,
    type: 'exp-lookit-instructions',
    didFinishSound: false,
    meta: {
        name: 'ExpLookitInstructions',
        description: 'A frame to display bulleted instructions to the user, along with an audio clip to make sure sound playback is working.',
        parameters: {
            type: 'object',
            properties: {
                /**
                 * A unique identifier for this item
                 *
                 * @property {String} id
                 */
                id: {
                    type: 'string',
                    description: 'A unique identifier for this item'
                },
                /**
                 * Whether the user should be forced to play the audio clip before leaving the page
                 *
                 * @property {Boolean} mustPlay
                 */
                mustPlay: {
                    type: 'boolean',
                    description: 'Should the user be forced to play the clip before leaving the page?',
                    default: true
                },
                /**
                 * Object specifying the audio clip to include (optional)
                 *
                 * @property {Object} audioBlock
                 *    @param {String} title Title text to show above audio controls
                 *    @param {String} text Text to show below audio controls
                 *    @param {String} warningText Text to show in red if user tries to proceed but hasn't played audio; only used if mustPlay is true
                 *    @param {Object[]} sources Array of {src: 'url', type: 'MIMEtype'} objects specifying audio sources
                 */
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
                /**
                 * Array of objects specifying text/images of instructions to display
                 *
                 * @property {Object[]} blocks
                 *   @param {String} title Title of this section
                 *   @param {String} text Paragraph text of this section
                 *   @param {Object[]} listblocks Object specifying bulleted points for this section. Each object is of the form:
                 *   {text: 'text of bullet point', image: {src: 'url', alt: 'alt-text'}}. Images are optional.
                 */
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
                /**
                 * Whether to show a 'previous' button
                 *
                 * @property {Boolean} showPreviousButton
                 * @default true
                 */
                showPreviousButton: {
                    type: 'boolean',
                    default: true
                },
                /**
                 * Text to display on the 'next frame' button
                 *
                 * @property {String} nextButtonText
                 * @default 'Start the videos! \n (You\'ll have a moment to turn around.)'
                 */
                nextButtonText: {
                    type: 'string',
                    default: 'Start the videos! \n (You\'ll have a moment to turn around.)'
                }
            },
            required: ['id']
        },
        data: {
            /**
             * Parameters captured and sent to the server
             *
             * @method serializeContent
             * @param {Boolean} showWarning whether the warning about sound being played is currently shown
             * @param {Boolean} didFinishSound whether the user played the sound clip
             * @return {Object} The payload sent to the server
             */
            type: 'object',
            properties: {
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
            if (this.get('preventNext')) {
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
