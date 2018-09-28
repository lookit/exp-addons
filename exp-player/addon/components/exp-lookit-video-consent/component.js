import Em from 'ember';
import layout from './template';

import ExpFrameBaseComponent from '../../components/exp-frame-base/component';
import VideoRecord from '../../mixins/video-record';

/**
 * @module exp-player
 * @submodule frames
 */

/**
Video consent frame for Lookit studies, with consent document displayed at left and instructions to start recording, read a statement out loud, and send. A standard consent
document is displayed, with additional study-specific information provided by the researcher, in accordance with the Lookit terms of use.

```json
"frames": {
    "video-consent": {
        "id": "video-consent",
        "kind": "exp-lookit-video-consent",
        "PIName": "Jane Smith",
        "institution": "Science University",
        "PIContact": "Jane Smith at 123 456 7890",
        "purpose": "Why do babies love cats? This study will help us find out whether babies love cats because of their soft fur or their twitchy tails.",
        "procedures": "Your child will be shown pictures of lots of different cats, along with noises that cats make like meowing and purring. We are interested in which pictures and sounds make your child smile. We will ask you (the parent) to turn around to avoid influencing your child's responses. There are no anticipated risks associated with participating.",
        "payment": "After you finish the study, we will email you a $5 BabyStore gift card within approximately three days. To be eligible for the gift card your child must be in the age range for this study, you need to submit a valid consent statement, and we need to see that there is a child with you. But we will send a gift card even if you do not finish the whole study or we are not able to use your child's data! There are no other direct benefits to you or your child from participating, but we hope you will enjoy the experience.",
        "datause": "We are primarily interested in your child's emotional reactions to the images and sounds. A research assistant will watch your video to measure the precise amount of delight in your child's face as he or she sees each cat picture."
    }
}
```

@class ExpLookitVideoConsent
@extends ExpFrameBase

@uses VideoRecord
*/

export default ExpFrameBaseComponent.extend(VideoRecord, {
    layout,
    disableRecord: Em.computed('recorder.recording', 'recorder.hasCamAccess', function () {
        return !this.get('recorder.hasCamAccess') || this.get('recorder.recording');
    }),
    startedRecording: false,

    actions: {
        record() {
            this.startRecorder().then(() => {
                this.set('startedRecording', true);
                // Require at least 3 s recording
                setTimeout(function() {
                    $('#submitbutton').prop('disabled', false);
                }, 3000);
            });
        },
        finish() {
            if (!this.get('stoppedRecording')) {
                this.stopRecorder().then(() => {
                    this.set('stoppedRecording', true);
                    this.send('next');
                });
            }
        }
    },

    meta: {
        name: 'Video Consent Form',
        description: 'A video consent form.',
        parameters: {
            type: 'object',
            properties: {
                /**
                A unique identifier for this item
                @property {String} id
                */
                id: {
                    type: 'string',
                    description: 'A unique identifier for this item'
                },

                /**
                Name of PI running this study
                @property {String} PIName
                */
                PIName: {
                    type: 'string',
                    description: 'Name of PI running this study'
                },

                /**
                Name of institution running this study (if ambiguous, list institution whose IRB approved the study)
                @property {String} institution
                */
                institution: {
                    type: 'string',
                    description: 'Name of institution running this study'
                },

                /**
                Contact information for PI or lab in case of participant questions or concerns. This will directly follow the phrase "please contact", so format accordingly: e.g., "the XYZ lab at xyz@science.edu" or "Mary Smith at 123 456 7890".
                @property {String} PIContact
                */
                PIContact: {
                    type: 'string',
                    description: 'Contact information for PI or lab'
                },

                /**
                Brief description of purpose of study - 1-2 sentences that describe what you are trying to find out. Language should be as straightforward and accessible as possible! E.g., "Why do babies love cats? This study will help us find out whether babies love cats because of their soft fur or their twitchy tails."
                @property {String} purpose
                */
                purpose: {
                    type: 'string',
                    description: 'Brief description of purpose of study'
                },

                /**
                Brief description of study procedures, including any risks or a statement that there are no anticipated risks. We add a statement about the duration (from your study definition) to the start (e.g., "This study takes about 10 minutes to complete"), so you don't need to include that. It can be in third person or addressed to the parent. E.g., "Your child will be shown pictures of lots of different cats, along with noises that cats make like meowing and purring. We are interested in which pictures and sounds make your child smile. We will ask you (the parent) to turn around to avoid influencing your child's responses. There are no anticipated risks associated with participating."
                @property {String} procedures
                */
                procedures: {
                    type: 'string',
                    description: 'Brief description of study procedures'
                },

                /**
                Statement about payment/compensation for participation, including a statement that there are no additional benefits anticipated to the participant. E.g., "After you finish the study, we will email you a $5 BabyStore gift card within approximately three days. To be eligible for the gift card your child must be in the age range for this study, you need to submit a valid consent statement, and we need to see that there is a child with you. But we will send a gift card even if you do not finish the whole study or we are not able to use your child's data! There are no other direct benefits to you or your child from participating, but we hope you will enjoy the experience."
                @property {String} payment
                */
                payment: {
                    type: 'string',
                    description: 'Statement about payment/compensation for participation'
                },

                /**
                Study-specific data use statement (optional). This will follow the following more general text: "The research group led by [PIName] at [institution] will have access to video and other data collected during this session. We will also have access to your account profile, demographic survey, and the child profile for the child who is participating, including changes you make in the future to any of this information. We may study your child’s responses in connection with his or her previous responses to this or other studies run by our group, siblings’ responses to this or other studies run by our group, or demographic survey responses."
                You may want to note what measures you will actually be coding for (looking time, facial expressions, parent-child interaction, etc.) and other more specific information about your use of data from this study here. For instance, you would note if you were building a corpus of naturalistic data that may be used to answer a variety of questions (rather than just collecting data for a single planned study).
                @property {String} datause
                */
                datause: {
                    type: 'string',
                    description: 'Study-specific data use statement'
                }
            },
            required: ['PIName', 'institution', 'PIContact', 'purpose', 'procedures', 'payment']
        },
        data: {
            /**
             * Parameters captured and sent to the server
             *
             * @method serializeContent
             * @param {String} consentFormText the exact text shown in the consent document during this frame
             * @param {String} videoID The ID of any webcam video recorded during this frame
             * @param {List} videoList a list of webcam video IDs in case there are >1
             * @param {Object} eventTimings
             * @return {Object} The payload sent to the server
             */
            type: 'object',
            properties: {
                videoId: {
                    type: 'string'
                },
                videoList: {
                    type: 'list'
                },
                consentFormText: {
                    type: 'string'
                }
            },
            required: ['videoId']
        }
    },

    didInsertElement() {
        this._super(...arguments);
        this.set('consentFormText', $('#consent-form-text').text());
    }
});
