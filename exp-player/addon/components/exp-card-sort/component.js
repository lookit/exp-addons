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
    })
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
  buckets: null,
  buckets2: null,
  responses: Ember.computed(function() {
    return this.get('session.expData')['1-1-free-response']
  }),
  isValid: Ember.computed(
    'buckets2.group1.extremely_uncharacteristic.cards.[]',
    'buckets2.group1.quite_uncharacteristic.cards.[]',
    'buckets2.group1.fairly_uncharacteristic.cards.[]',
    'buckets2.group2.somewhat_uncharacteristic.cards.[]',
    'buckets2.group2.relatively_neutral.cards.[]',
    'buckets2.group2.somewhat_characteristic.cards.[]',
    'buckets2.group3.fairly_characteristic.cards.[]',
    'buckets2.group3.quite_characteristic.cards.[]',
    'buckets2.group3.extremely_characteristic.cards.[]',
    function() {
      var buckets = this.buckets2;
      for (var group in buckets) {
        for (var category in buckets[group]) {
          var bucket = buckets[group][category];
            if (bucket.cards.length !== bucket.max) {
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
      for (var category in buckets) {
        if (buckets[category].contains(card)) {
          source = buckets[category];
        }
      }
      for (var group in buckets2) {
        for (var category in buckets2[group]) {
          var bucket = buckets2[group][category];
            if (bucket['cards'].contains(card)) {
             source = bucket['cards'];
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
        properties: {}
    },
    data: {
        type: 'object',
        properties: {
            cardSortResponse: null
        }
    }
  }
});
