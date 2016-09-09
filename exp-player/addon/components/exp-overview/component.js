import Ember from 'ember';
import ExpFrameBaseComponent from 'exp-player/components/exp-frame-base';
import layout from './template';
import {validator, buildValidations} from 'ember-cp-validations';


var range = function(start, stop) {
  var options = [];
  for (var i=start; i <= stop; i++) {
    var key = 'number' + i;
    options.push(key);
  }
  return options;
};

var generateValidators = function(questions) {
  var validators = {};
  var presence = validator('presence', {
    presence:true,
    message: 'This field is required'
  });
  for (var q=0; q < questions.length; q++) {
    var isOptional = 'optional' in questions[q] && questions[q]['optional'];
    if (!isOptional) {
      var key = 'questions.' + q + '.value';
      validators[key] = presence;
    }
  }
  return validators;
};

const questions = [
  {
    question: 'survey.sections.1.questions.1.label',
    type: 'select',
    scale: range(16, 100),
    value: null
  },
  {
    question: 'survey.sections.1.questions.2.label',
    type: 'select',
    scale: ['survey.sections.1.questions.2.options.male',
        'survey.sections.1.questions.2.options.female',
        'survey.sections.1.questions.2.options.other',
        'survey.sections.1.questions.2.options.na'
    ],
    value: null
  },
  {
    question: 'survey.sections.1.questions.3.label',
    type: 'input',
    value: null
  },
  {
    question: 'survey.sections.1.questions.4.label',
    type: 'input',
    value: null
  },
  {
    question: 'survey.sections.1.questions.5.label',
    type: 'radio',
    scale: range(1, 10),
    labelTop: true,
    value: null
  },
  {
    question: 'survey.sections.1.questions.6.label',
    type: 'input',
    value: null
  },
  {
    question: 'survey.sections.1.questions.7.label',
    type: 'select',
    scale: [
        'survey.sections.1.questions.7.options.remoteRural',
        'survey.sections.1.questions.7.options.rural',
        'survey.sections.1.questions.7.options.suburban',
        'survey.sections.1.questions.7.options.urban'
    ],
    value: null
  },
  {
    question: 'survey.sections.1.questions.8.label',
    type: 'radio',
    scale: ['global.yesLabel', 'global.noLabel'],
    labelTop: true,
    value: null
  },
  {
    question: 'survey.sections.1.questions.9.label',
    type: 'input',
    optional: true,
    value: null
  },
  {
    question: 'survey.sections.1.questions.10.label',
    type: 'radio',
    scale: range(1, 10),
    labelTop: true,
    value: null
  }];

const Validations = buildValidations(generateValidators(questions));


export default ExpFrameBaseComponent.extend(Validations, {
    type: 'exp-overview',
    layout: layout,
    questions: questions,
    responses: Ember.computed('questions', function() {
        var questions = this.get('questions');
        var responses = {};
        for (var i=0; i < questions.length; i++) {
            responses[i] = questions[i].value;
        }
        return responses;
    }),
    meta: {
      name: 'ExpOverview',
        description: 'TODO: a description of this frame goes here.',
        parameters: {
          type: 'object',
          properties: {
            // define parameters here
          }
        },
        data: {
          type: 'object',
          properties: {
            responses: {
              type: 'object'
            }
          }
        }
    },
    actions: {
      continue() {
          this.send('next');
      }
    }
});
