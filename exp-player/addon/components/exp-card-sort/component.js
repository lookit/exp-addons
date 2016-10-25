import Ember from 'ember';
import ExpFrameBaseComponent from 'exp-player/components/exp-frame-base';
import layout from './template';
import config from 'ember-get-config';


var cards = [
    'qsort.rsq.item.potentiallyEnjoy',
    'qsort.rsq.item.complex',
    'qsort.rsq.item.jobDone',
    'qsort.rsq.item.tryingImpress',
    'qsort.rsq.item.convinceYou',
    'qsort.rsq.item.countingOnYou',
    'qsort.rsq.item.talkingPermitted',
    'qsort.rsq.item.talkingExpected',
    'qsort.rsq.item.askingYou',
    'qsort.rsq.item.needsHelp',
    'qsort.rsq.item.minorDetails',
    'qsort.rsq.item.politics',
    'qsort.rsq.item.intelligence',
    'qsort.rsq.item.notClear',
    'qsort.rsq.item.underThreat',
    'qsort.rsq.item.criticizing',
    'qsort.rsq.item.dominate',
    'qsort.rsq.item.playful',
    'qsort.rsq.item.rapidlyChanging',
    'qsort.rsq.item.unhappySuffering',
    'qsort.rsq.item.reassuringPresent',
    'qsort.rsq.item.blaming',
    'qsort.rsq.item.decision',
    'qsort.rsq.item.selfControl',
    'qsort.rsq.item.competing',
    'qsort.rsq.item.reassurance',
    'qsort.rsq.item.frustrating',
    'qsort.rsq.item.physicalAttractiveness',
    'qsort.rsq.item.goodImpression',
    'qsort.rsq.item.tenseUpset',
    'qsort.rsq.item.smallAnnoyances',
    'qsort.rsq.item.hostile',
    'qsort.rsq.item.disagreeing',
    'qsort.rsq.item.unusualIdeas',
    'qsort.rsq.item.physicalThreats',
    'qsort.rsq.item.emotionalThreats',
    'qsort.rsq.item.moralIssues',
    'qsort.rsq.item.quickAction',
    'qsort.rsq.item.emotionsExpressed',
    'qsort.rsq.item.ruminateDaydream',
    'qsort.rsq.item.noisy',
    'qsort.rsq.item.closeRelationships',
    'qsort.rsq.item.SomoneCountedon',
    'qsort.rsq.item.intellectuallyStimulating',
    'qsort.rsq.item.assertivenessGoal',
    'qsort.rsq.item.desiresGratified',
    'qsort.rsq.item.socialInteraction',
    'qsort.rsq.item.humorous',
    'qsort.rsq.item.youFocus',
    'qsort.rsq.item.sensations',
    'qsort.rsq.item.relevantHealth',
    'qsort.rsq.item.clearRules',
    'qsort.rsq.item.breakingRules',
    'qsort.rsq.item.art',
    'qsort.rsq.item.anxietyInducing',
    'qsort.rsq.item.ambition',
    'qsort.rsq.item.feelInadequate',
    'qsort.rsq.item.sexuality',
    'qsort.rsq.item.abusedVictimized',
    'qsort.rsq.item.oppositeSex',
    'qsort.rsq.item.romanticPartners',
    'qsort.rsq.item.simpleClearcut',
    'qsort.rsq.item.comparingThemselves',
    'qsort.rsq.item.power',
    'qsort.rsq.item.masculinity',
    'qsort.rsq.item.adviceYou',
    'qsort.rsq.item.positiveEmotions',
    'qsort.rsq.item.negativeEmotions',
    'qsort.rsq.item.verbalFluency',
    'qsort.rsq.item.differentRoles',
    'qsort.rsq.item.conformToOthers',
    'qsort.rsq.item.successCooperation',
    'qsort.rsq.item.complimentingYou',
    'qsort.rsq.item.femininity',
    'qsort.rsq.item.religion',
    'qsort.rsq.item.takenCareOf',
    'qsort.rsq.item.happeningOnce',
    'qsort.rsq.item.physicallyActive',
    'qsort.rsq.item.workingHard',
    'qsort.rsq.item.food',
    'qsort.rsq.item.physicallyUncomfortable',
    'qsort.rsq.item.family',
    'qsort.rsq.item.honor',
    'qsort.rsq.item.money',
    'qsort.rsq.item.athleticsSports',
    'qsort.rsq.item.shame',
    'qsort.rsq.item.music',
    'qsort.rsq.item.newRelationships',
    'qsort.rsq.item.peopleGetAlong',
    'qsort.rsq.item.entertainment'
];

var formatCards = function (items) {
    var cards = [];
    for (var i=0; i < items.length; i++) {
        cards.push({
            id: 'rsq' + (i + 1),
            content: items[i]
        });
    }
    return cards;
};

// h/t: http://stackoverflow.com/a/6274398
var shuffle = function (array) {
    let n = array.length;
    while (n > 0) {
        let index = Math.floor(Math.random() * n);
        n--;  //1
        let temp = array[n];
        array[n] = array[index];
        array[index] = temp;
    }
    return array;
};

export default ExpFrameBaseComponent.extend({
    type: 'exp-card-sort',
    layout: layout,
    framePage: 0,

    cards: Ember.computed(function () {
        return shuffle(formatCards(cards));
    }),

    freeResponses: Ember.computed(function () {
        return this.get('session.expData')['1-1-free-response']['responses'];
    }),

    // Represent the sorted cards in a human-readable format for storage in the database
    responses: Ember.computed(function () {
        // Final data should be returned as {
        //    cardSort1: object {cardId: categoryId,...}
        //    cardSort2: object {cardId: categoryId,...}
        // }
        // E.g. {
        //    cardSort1: object {SomoneCountedon: 3,...}
        //    cardSort2: object {SomoneCountedon: 8,...}
        // }
        let responses = {};
        let cardSortResponse = this.get('cardSortResponse');
        if (cardSortResponse) {
            responses['ThreeCat'] = {};
            for (var i = 0; i < cardSortResponse.length; i++) {
                for (let card of cardSortResponse[i].cards) {
                    responses['ThreeCat'][card.id] = i + 1;
                }
            }
        }
        if (this.get('framePage') === 1) {
            cardSortResponse = this.get('buckets2');
            responses['NineCat'] = {};
            // Assumption: this unpacks a list of category objects:
            // { categories: [ {id: id, cards: [cards]},...] }
            for (let categorySet of cardSortResponse) {
                for (var j = 0; j < categorySet.categories.length; j++) {
                    for (let card of categorySet.categories[j].cards) {
                        responses['NineCat'][card.id] = categorySet.categories[j].id;
                    }
                }
            }
        }
        return responses;
    }).volatile(),

    allowNext: Ember.computed('cards.[]', function() {
        if (config.featureFlags.validate) {
            return this.get('cards').length === 0;
        }
        return true;
    }),

    isValid: Ember.computed(
        'buckets2.0.categories.0.cards.[]',
        'buckets2.0.categories.1.cards.[]',
        'buckets2.0.categories.2.cards.[]',
        'buckets2.1.categories.0.cards.[]',
        'buckets2.1.categories.1.cards.[]',
        'buckets2.1.categories.2.cards.[]',
        'buckets2.2.categories.0.cards.[]',
        'buckets2.2.categories.1.cards.[]',
        'buckets2.2.categories.2.cards.[]',
        function () {
            if (config.featureFlags.validate) {
                for (var group = 0; group < this.buckets2.length; group++) {
                    for (var category = 0; category < this.buckets2[group].categories.length; category++) {
                        var bucket = this.buckets2[group].categories[category];
                        if (bucket['cards'].length !== bucket['max']) {
                            return false;
                        }
                    }
                }
            }
            return true;
        }),

    actions: {
        dragCard(card, ops) {
            var cards = ops.target.cards;
            var buckets = ops.target.buckets;
            var buckets2 = ops.target.buckets2;
            var source;
            var target = ops.target.bucket;

            if (cards && cards.contains(card)) {
                source = cards;
            }
            for (var i = 0; i < buckets.length; i++) {
                if (buckets[i].cards.contains(card)) {
                    source = buckets[i].cards;
                }
            }
            if (buckets2) {
                for (var group = 0; group < buckets2.length; group++) {
                    for (var category = 0; category < buckets2[group].categories.length; category++) {
                        var bucket = buckets2[group].categories[category];
                        if (bucket['cards'].contains(card)) {
                            source = bucket['cards'];
                        }
                    }
                }
            }
            source.removeObject(card);
            target.unshiftObject(card);
        },
        nextPage() {
            if (this.get('allowNext')) {
                this.set('cardSortResponse', Ember.copy(this.get('buckets'), true));
                this.send('save');
                this.set('framePage', 1);
                this.sendAction('updateFramePage', 1);
                window.scrollTo(0, 0);
            }
        },
        continue() {
            if (this.get('isValid')) {
                this.send('next');
            }
        }
    },

    meta: {
        name: 'ExpCardSort',
        description: 'TODO: a description of this frame goes here.',
        parameters: {
            type: 'object',
            properties: {
                buckets: {
                    default: [
                        {
                            name: 'qsort.sections.1.categories.uncharacteristic',
                            cards: []
                        },
                        {
                            name: 'qsort.sections.1.categories.neutral',
                            cards: []
                        },
                        {
                            name: 'qsort.sections.1.categories.characteristic',
                            cards: []
                        }
                    ]
                },
                buckets2: {
                    default: [
                        {
                            categories: [
                                {
                                    cards: [],
                                    name: 'qsort.sections.2.categories.extremelyUnchar',
                                    max: 3,
                                    id: 1
                                },
                                {
                                    cards: [],
                                    name: 'qsort.sections.2.categories.quiteUnchar',
                                    max: 6,
                                    id: 2
                                },
                                {
                                    cards: [],
                                    name: 'qsort.sections.2.categories.fairlyUnchar',
                                    max: 11,
                                    id: 3
                                }
                            ]
                        },
                        {
                            categories: [
                                {
                                    cards: [],
                                    name: 'qsort.sections.2.categories.somewhatUnchar',
                                    max: 15,
                                    id: 4
                                },
                                {
                                    cards: [],
                                    name: 'qsort.sections.2.categories.neutral',
                                    max: 20,
                                    id: 5
                                },
                                {
                                    cards: [],
                                    name: 'qsort.sections.2.categories.somewhatChar',
                                    max: 15,
                                    id: 6
                                }
                            ]
                        },
                        {
                            categories: [
                                {
                                    cards: [],
                                    name: 'qsort.sections.2.categories.fairlyChar',
                                    max: 11,
                                    id: 7
                                },
                                {
                                    cards: [],
                                    name: 'qsort.sections.2.categories.quiteChar',
                                    max: 6,
                                    id: 8
                                },
                                {
                                    cards: [],
                                    name: 'qsort.sections.2.categories.extremelyChar',
                                    max: 3,
                                    id: 9
                                }
                            ]
                        }
                    ]
                }
            }
        },
        data: {
            type: 'object',
            properties: {
                responses: {
                    type: 'object',
                    properties: {
                        responses: {
                            type: 'object'
                        }
                    }
                }
            }
        }
    },

    loadData: function(frameData) {
        var cardSort1 = frameData.responses['ThreeCat'];
        if (cardSort1 && this.get('framePage') === 1) {
            var buckets = {
                uncharacteristic: [],
                neutral: [],
                characteristic: []
            };
            // Load cards to be sorted
            for (let cardId of Object.keys(cardSort1)) {
                var bucketNumber = cardSort1[cardId];
                var cardIndex = parseInt(cardId.split('rsq').pop()) - 1;
                var card = {
                    id: cardId,
                    content: cards[cardIndex]
                };
                if (bucketNumber === 1) {
                    buckets.uncharacteristic.push(card);
                } else if (bucketNumber === 2) {
                    buckets.neutral.push(card);
                } else if (bucketNumber === 3) {
                    buckets.characteristic.push(card);
                }
            }
            for (let bucket of this.get('buckets')) {
                let name = bucket.name.split('.').pop();
                Ember.set(bucket, 'cards', buckets[name]);
            }
        }
    }
});
