import layout from './template';
import ExpFrameBaseComponent from '../../components/exp-frame-base/component';

/**
 * @module exp-player
 * @submodule frames
 */

/**
 * A frame to display text-only instructions, etc. to the user.

```json
"frames": {
    "study-intro": {
        "blocks": [
            {
                "emph": true,
                "text": "Important: your child does not need to be with you until the videos begin. First, let's go over what will happen!",
                "title": "Your baby, the physicist"
            },
            {
                "text": "Some introductory text about this study."
            },
            {
                "text": "Another paragraph about this study."
            }
        ],
        "showPreviousButton": false,
        "kind": "exp-lookit-text"
    }
 }

 * ```
 * @class ExpLookitText
 * @extends ExpFrameBase
 */

export default ExpFrameBaseComponent.extend({
    type: 'exp-lookit-text',
    layout: layout,
    meta: {
        name: 'ExpLookitText',
        description: 'Text-only frame for a Lookit study',
        parameters: {
            type: 'object',
            properties: {
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
                 * Array of text blocks (paragraphs) to display.
                 *
                 * @property {Object} blocks
                 *   @param {String} title title to display
                 *   @param {String} text paragraph of text
                 *   @param {Boolean} emph whether to bold this paragraph
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
                            emph: {
                                type: 'boolean'
                            }
                        }
                    },
                    default: []
                }
            }
        },
        data: {
            type: 'object',
            properties: {

            }
        }
    }
});
