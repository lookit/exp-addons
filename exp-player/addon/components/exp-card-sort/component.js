import Ember from 'ember';
import ExpFrameBaseComponent from 'exp-player/components/exp-frame-base';
import layout from './template';


var cards = {
    "SomoneCountedon": "qsort.rsq.item.SomoneCountedon",
    "abusedVictimized": "qsort.rsq.item.abusedVictimized",
    "adviceYou": "qsort.rsq.item.adviceYou",
    "ambition": "qsort.rsq.item.ambition",
    "anxietyInducing": "qsort.rsq.item.anxietyInducing",
    "art": "qsort.rsq.item.art",
    "askingYou": "qsort.rsq.item.askingYou",
    "assertivenessGoal": "qsort.rsq.item.assertivenessGoal",
    "athleticsSports": "qsort.rsq.item.athleticsSports",
    "blaming": "qsort.rsq.item.blaming",
    "breakingRules": "qsort.rsq.item.breakingRules",
    "clearRules": "qsort.rsq.item.clearRules",
    "closeRelationships": "qsort.rsq.item.closeRelationships",
    "comparingThemselves": "qsort.rsq.item.comparingThemselves",
    "competing": "qsort.rsq.item.competing",
    "complex": "qsort.rsq.item.complex",
    "complimentingYou": "qsort.rsq.item.complimentingYou",
    "conformToOthers": "qsort.rsq.item.conformToOthers",
    "convinceYou": "qsort.rsq.item.convinceYou",
    "countingOnYou": "qsort.rsq.item.countingOnYou",
    "criticizing": "qsort.rsq.item.criticizing",
    "decision": "qsort.rsq.item.decision",
    "desiresGratified": "qsort.rsq.item.desiresGratified",
    "differentRoles": "qsort.rsq.item.differentRoles",
    "disagreeing": "qsort.rsq.item.disagreeing",
    "dominate": "qsort.rsq.item.dominate",
    "emotionalThreats": "qsort.rsq.item.emotionalThreats",
    "emotionsExpressed": "qsort.rsq.item.emotionsExpressed",
    "entertainment": "qsort.rsq.item.entertainment",
    "family": "qsort.rsq.item.family",
    "feelInadequate": "qsort.rsq.item.feelInadequate",
    "femininity": "qsort.rsq.item.femininity",
    "food": "qsort.rsq.item.food",
    "frustrating": "qsort.rsq.item.frustrating",
    "goodImpression": "qsort.rsq.item.goodImpression",
    "happeningOnce": "qsort.rsq.item.happeningOnce",
    "honor": "qsort.rsq.item.honor",
    "hostile": "qsort.rsq.item.hostile",
    "humorous": "qsort.rsq.item.humorous",
    "intellectuallyStimulating": "qsort.rsq.item.intellectuallyStimulating",
    "intelligence": "qsort.rsq.item.intelligence",
    "jobDone": "qsort.rsq.item.jobDone",
    "masculinity": "qsort.rsq.item.masculinity",
    "minorDetails": "qsort.rsq.item.minorDetails",
    "money": "qsort.rsq.item.money",
    "moralIssues": "qsort.rsq.item.moralIssues",
    "music": "qsort.rsq.item.music",
    "needsHelp": "qsort.rsq.item.needsHelp",
    "negativeEmotions": "qsort.rsq.item.negativeEmotions",
    "newRelationships": "qsort.rsq.item.newRelationships",
    "noisy": "qsort.rsq.item.noisy",
    "notClear": "qsort.rsq.item.notClear",
    "oppositeSex": "qsort.rsq.item.oppositeSex",
    "peopleGetAlong": "qsort.rsq.item.peopleGetAlong",
    "physicalAttractiveness": "qsort.rsq.item.physicalAttractiveness",
    "physicalThreats": "qsort.rsq.item.physicalThreats",
    "physicallyActive": "qsort.rsq.item.physicallyActive",
    "physicallyUncomfortable": "qsort.rsq.item.physicallyUncomfortable",
    "playful": "qsort.rsq.item.playful",
    "politics": "qsort.rsq.item.politics",
    "positiveEmotions": "qsort.rsq.item.positiveEmotions",
    "potentiallyEnjoy": "qsort.rsq.item.potentiallyEnjoy",
    "power": "qsort.rsq.item.power",
    "quickAction": "qsort.rsq.item.quickAction",
    "rapidlyChanging": "qsort.rsq.item.rapidlyChanging",
    "reassurance": "qsort.rsq.item.reassurance",
    "reassuringPresent": "qsort.rsq.item.reassuringPresent",
    "relevantHealth": "qsort.rsq.item.relevantHealth",
    "religion": "qsort.rsq.item.religion",
    "romanticPartners": "qsort.rsq.item.romanticPartners",
    "ruminateDaydream": "qsort.rsq.item.ruminateDaydream",
    "selfControl": "qsort.rsq.item.selfControl",
    "sensations": "qsort.rsq.item.sensations",
    "sexuality": "qsort.rsq.item.sexuality",
    "shame": "qsort.rsq.item.shame",
    "simpleClearcut": "qsort.rsq.item.simpleClearcut",
    "smallAnnoyances": "qsort.rsq.item.smallAnnoyances",
    "socialInteraction": "qsort.rsq.item.socialInteraction",
    "successCooperation": "qsort.rsq.item.successCooperation",
    "takenCareOf": "qsort.rsq.item.takenCareOf",
    "talkingExpected": "qsort.rsq.item.talkingExpected",
    "talkingPermitted": "qsort.rsq.item.talkingPermitted",
    "tenseUpset": "qsort.rsq.item.tenseUpset",
    "tryingImpress": "qsort.rsq.item.tryingImpress",
    "underThreat": "qsort.rsq.item.underThreat",
    "unhappySuffering": "qsort.rsq.item.unhappySuffering",
    "unusualIdeas": "qsort.rsq.item.unusualIdeas",
    "verbalFluency": "qsort.rsq.item.verbalFluency",
    "workingHard": "qsort.rsq.item.workingHard",
    "youFocus": "qsort.rsq.item.youFocus"
};

var formatCards = function(items) {
  var cards = [];
  for (var item in items) {
    cards.push({
      id: item,
      content: items[item]
    });
  }
  return cards;
};

// h/t: http://stackoverflow.com/a/6274398
var shuffle = function(array) {
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
  page: 'cardSort1',
  cards: Ember.computed(function() {
    return shuffle(formatCards(cards));
  }),
  responses: Ember.computed(function() {
    return this.get('session.expData')['1-1-free-response'];
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
    function() {
      for (var group = 0; group < this.buckets2.length; group++) {
        for (var category = 0; category < this.buckets2[group].categories.length; category++) {
          var bucket = this.buckets2[group].categories[category];
          if (bucket['cards'].length !== bucket['max']) {
            return false;
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
      this.set('page', 'cardSort2');
    },
    continue() {
      this.set('cardSortResponse', this.buckets2);
      this.send('next');
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
                 max: 3
               },
               {
                 cards: [],
                 name: 'qsort.sections.2.categories.quiteUnchar',
                 max: 6
               },
               {
                 cards: [],
                 name: 'qsort.sections.2.categories.fairlyUnchar',
                 max: 11
               }
             ]
           },
           {
             categories: [
               {
                 cards: [],
                 name: 'qsort.sections.2.categories.somewhatUnchar',
                 max: 15
               },
               {
                 cards: [],
                 name: 'qsort.sections.2.categories.neutral',
                 max: 20
               },
               {
                 cards: [],
                 name: 'qsort.sections.2.categories.somewhatChar',
                 max: 15
               }
             ]
           },
           {
             categories: [
               {
                 cards: [],
                 name: 'qsort.sections.2.categories.fairlyChar',
                 max: 11
               },
               {
                 cards: [],
                 name: 'qsort.sections.2.categories.quiteChar',
                 max: 6
               },
               {
                 cards: [],
                 name: 'qsort.sections.2.categories.extremelyChar',
                 max: 3
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
        cardSortResponse: {
          type: 'array'
        }
      }
    }
  }
});
