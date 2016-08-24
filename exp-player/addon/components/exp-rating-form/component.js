import Ember from 'ember';
import ExpFrameBaseComponent from 'exp-player/components/exp-frame-base';
import layout from './template';
import {validator, buildValidations} from 'ember-cp-validations';

var items = {
  '4': [
      'measures.questions.4.items.1.label',
      'measures.questions.4.items.2.label',
      'measures.questions.4.items.3.label',
      'measures.questions.4.items.4.label',
      'measures.questions.4.items.5.label',
      'measures.questions.4.items.6.label',
      'measures.questions.4.items.7.label',
      'measures.questions.4.items.8.label',
      'measures.questions.4.items.9.label',
      'measures.questions.4.items.10.label',
      'measures.questions.4.items.11.label',
      'measures.questions.4.items.12.label',
      'measures.questions.4.items.13.label',
      'measures.questions.4.items.14.label',
      'measures.questions.4.items.15.label',
      'measures.questions.4.items.16.label'
  ],
  '5': [
      'measures.questions.5.items.1.label',
      'measures.questions.5.items.2.label',
      'measures.questions.5.items.3.label',
      'measures.questions.5.items.4.label',
      'measures.questions.5.items.5.label',
      'measures.questions.5.items.6.label',
      'measures.questions.5.items.7.label',
      'measures.questions.5.items.8.label',
      'measures.questions.5.items.9.label',
      'measures.questions.5.items.10.label',
      'measures.questions.5.items.11.label',
      'measures.questions.5.items.12.label',
      'measures.questions.5.items.13.label',
      'measures.questions.5.items.14.label',
      'measures.questions.5.items.15.label',
      'measures.questions.5.items.16.label',
      'measures.questions.5.items.17.label',
      'measures.questions.5.items.18.label',
      'measures.questions.5.items.19.label',
      'measures.questions.5.items.20.label',
      'measures.questions.5.items.21.label',
      'measures.questions.5.items.22.label',
      'measures.questions.5.items.23.label',
      'measures.questions.5.items.24.label',
      'measures.questions.5.items.25.label',
      'measures.questions.5.items.26.label',
      'measures.questions.5.items.27.label',
      'measures.questions.5.items.28.label',
      'measures.questions.5.items.29.label',
      'measures.questions.5.items.30.label',
      'measures.questions.5.items.31.label',
      'measures.questions.5.items.32.label',
      'measures.questions.5.items.33.label',
      'measures.questions.5.items.34.label',
      'measures.questions.5.items.35.label',
      'measures.questions.5.items.36.label',
      'measures.questions.5.items.37.label',
      'measures.questions.5.items.38.label',
      'measures.questions.5.items.39.label',
      'measures.questions.5.items.40.label',
      'measures.questions.5.items.41.label',
      'measures.questions.5.items.42.label',
      'measures.questions.5.items.43.label',
      'measures.questions.5.items.44.label',
      'measures.questions.5.items.45.label',
      'measures.questions.5.items.46.label',
      'measures.questions.5.items.47.label',
      'measures.questions.5.items.48.label',
      'measures.questions.5.items.49.label',
      'measures.questions.5.items.50.label',
      'measures.questions.5.items.51.label',
      'measures.questions.5.items.52.label',
      'measures.questions.5.items.53.label',
      'measures.questions.5.items.54.label',
      'measures.questions.5.items.55.label',
      'measures.questions.5.items.56.label',
      'measures.questions.5.items.57.label',
      'measures.questions.5.items.58.label',
      'measures.questions.5.items.59.label',
      'measures.questions.5.items.60.label'
  ],
  '7': [
      'measures.questions.7.items.1.label',
      'measures.questions.7.items.2.label',
      'measures.questions.7.items.3.label',
      'measures.questions.7.items.4.label',
      'measures.questions.7.items.5.label',
      'measures.questions.7.items.6.label',
      'measures.questions.7.items.7.label',
      'measures.questions.7.items.8.label',
      'measures.questions.7.items.9.label'
  ],
  '8': [
      'measures.questions.8.items.1.label',
      'measures.questions.8.items.2.label',
      'measures.questions.8.items.3.label',
      'measures.questions.8.items.4.label',
      'measures.questions.8.items.5.label',
      'measures.questions.8.items.6.label',
      'measures.questions.8.items.7.label',
      'measures.questions.8.items.8.label',
      'measures.questions.8.items.9.label',
      'measures.questions.8.items.10.label',
      'measures.questions.8.items.11.label',
      'measures.questions.8.items.12.label',
      'measures.questions.8.items.13.label',
      'measures.questions.8.items.14.label',
      'measures.questions.8.items.15.label',
      'measures.questions.8.items.16.label',
      'measures.questions.8.items.17.label'
  ],
  '9': [
      'measures.questions.9.items.1.label',
      'measures.questions.9.items.2.label',
      'measures.questions.9.items.3.label',
      'measures.questions.9.items.4.label',
      'measures.questions.9.items.5.label',
      'measures.questions.9.items.6.label',
      'measures.questions.9.items.7.label',
      'measures.questions.9.items.8.label',
      'measures.questions.9.items.9.label',
      'measures.questions.9.items.10.label',
      'measures.questions.9.items.11.label',
      'measures.questions.9.items.12.label'
  ],
  '10': [
      'measures.questions.10.items.1.label',
      'measures.questions.10.items.2.label',
      'measures.questions.10.items.3.label',
      'measures.questions.10.items.4.label',
      'measures.questions.10.items.5.label',
      'measures.questions.10.items.6.label'
  ],
  '13': [
      'measures.questions.13.items.1.label',
      'measures.questions.13.items.2.label',
      'measures.questions.13.items.3.label',
      'measures.questions.13.items.4.label'
  ],
  '14': [
      'measures.questions.14.items.1.label',
      'measures.questions.14.items.2.label',
      'measures.questions.14.items.3.label',
      'measures.questions.14.items.4.label',
      'measures.questions.14.items.5.label',
      'measures.questions.14.items.6.label'
  ],
  '15': [
      'measures.questions.15.items.1.label',
      'measures.questions.15.items.2.label',
      'measures.questions.15.items.3.label',
      'measures.questions.15.items.4.label',
      'measures.questions.15.items.5.label',
      'measures.questions.15.items.6.label',
      'measures.questions.15.items.7.label',
      'measures.questions.15.items.8.label',
      'measures.questions.15.items.9.label',
      'measures.questions.15.items.10.label'
  ],
  '16': [
      'measures.questions.16.items.1.label',
      'measures.questions.16.items.2.label',
      'measures.questions.16.items.3.label',
      'measures.questions.16.items.4.label',
      'measures.questions.16.items.5.label'
  ],
  '18': [
      'measures.questions.18.items.1.label',
      'measures.questions.18.items.2.label',
      'measures.questions.18.items.3.label',
      'measures.questions.18.items.4.label',
      'measures.questions.18.items.5.label',
      'measures.questions.18.items.6.label'
  ]
};

const TEN_POINT_SCALE = [
  'number0',
  'number1',
  'number2',
  'number3',
  'number4',
  'number5',
  'number6',
  'number7',
  'number8',
  'number9',
  'number10'
];
const SEVEN_POINT_SCALE = TEN_POINT_SCALE.slice(0, 8);
const NINE_POINT_SCALE = TEN_POINT_SCALE.slice(0, 10);

var generateValidators = function(questions) {
  var validators = {};
  var presence = validator('presence', {
      presence:true,
      message: 'This field is required'
  });
  for (var question in questions) {
    for (var item in questions[question]['items']) {
      var isOptional = questions[question]['items'][item].optional;
      if (!isOptional) {
        var key = 'questions.' + question + '.items.' + item + '.value';
        validators[key] = presence;
      }
    }
  }
  return validators;
};

var generateSchema = function(question, type, items, scale, options) {
  var schema = {
    question: question,
    type: type,
    scale: scale,
    items: []
  };
  for (var i=0; i < items.length; i++) {
    var ret = {
      description: items[i],
      value: null
    };
    for (var option in options) {
      ret[option] = options[option];
    }
    schema['items'].push(ret);
  }
  return schema;
};


var questions = [
  generateSchema(
    'measures.questions.1.label',
    'select',
    [''],
    [
      'measures.questions.1.options.extremelyNeg',
      'measures.questions.1.options.quiteNeg',
      'measures.questions.1.options.fairlyNeg',
      'measures.questions.1.options.somewhatNeg',
      'measures.questions.1.options.neither',
      'measures.questions.1.options.somewhatPos',
      'measures.questions.1.options.fairlyPos',
      'measures.questions.1.options.quitePos',
      'measures.questions.1.options.extremelyPos'
    ]
  ),
  generateSchema(
    'measures.questions.2.label',
    'radio',
    [''],
    SEVEN_POINT_SCALE,
    {
      labelTop: false,
      labels: [{
          rating: 0,
          label:'measures.questions.2.options.never'
        },
        {
          rating: 2,
          label: 'measures.questions.2.options.hardleyEver'
        },
        {
          rating: 4,
          label: 'measures.questions.2.options.occasionally'
        },
        {
          rating: 6,
          label: 'measures.questions.2.options.quiteOften'
        }
      ]
    }
  ),
  generateSchema(
    'measures.questions.3.label',
    'radio',
    [''],
    TEN_POINT_SCALE,
    {
      labelTop: false,
      labels: [{
          rating: 0,
          label: 'measures.questions.3.options.unwilling'
        },
        {
          rating: 10,
          label: 'measures.questions.3.options.fullyPrepared'
        }
      ]
    }
  ),
  generateSchema(
    'measures.questions.4.label',
    'radio',
    items['4'],
    [
      'measures.questions.4.options.extremelyChar',
      'measures.questions.4.options.quiteUnchar',
      'measures.questions.4.options.fairlyUnchar',
      'measures.questions.4.options.somewhatUnchar',
      'measures.questions.4.options.neutral',
      'measures.questions.4.options.somewhatChar',
      'measures.questions.4.options.fairlyChar',
      'measures.questions.4.options.quiteChar',
      'measures.questions.4.options.extremelyChar'
    ],
    {
        labelTop: true,
        formatLabel: true
    }
  ),
  generateSchema(
    'measures.questions.5.label',
    'radio',
    items['5'],
    [
      'measures.questions.5.options.disagreeStrongly',
      'measures.questions.5.options.disagree',
      'measures.questions.5.options.neutral',
      'measures.questions.5.options.agree',
      'measures.questions.5.options.agreeStrongly'
    ],
    {labelTop: true}
  ),
  {
    question: 'measures.questions.6.label',
    type: 'radio',
    scale: SEVEN_POINT_SCALE,
    items: [
      {
        description: 'measures.questions.6.items.1.label',
        value:null,
        labelTop: false,
        labels: [{
            rating: 0,
            label: 'measures.questions.6.items.1.options.notHappy'
          },
          {
            rating: 7,
            label: 'measures.questions.6.items.1.options.veryHappy'
          }]
      },
      {
        description: 'measures.questions.6.items.2.label',
        scale: SEVEN_POINT_SCALE,
        value:null,
        labelTop: false,
        labels: [{
            rating: 0,
            label: 'measures.questions.6.items.2.options.lessHappy'
          },
          {
            rating: 7,
            label: 'measures.questions.6.items.2.options.moreHappy'
          }]
      },
      {
        description: 'measures.questions.6.items.3.label',
        scale: SEVEN_POINT_SCALE,
        value:null,
        labelTop: false,
        labels: [{
            rating: 0,
            label: 'measures.questions.6.items.4.options.notAtAll'
          },
          {
            rating: 7,
            label: 'measures.questions.6.items.4.options.aGreatDeal'
          }]
      },
      {
        description:'measures.questions.6.items.4.label',
        scale: SEVEN_POINT_SCALE,
        value:null,
        labelTop: false,
        labels: [{
            rating: 0,
            label: 'measures.questions.6.items.4.options.notAtAll'
          },
          {
            rating: 7,
            label: 'measures.questions.6.items.4.options.aGreatDeal'
          }]
      }]
  },
  generateSchema(
    'measures.questions.7.label',
    'radio',
    items['7'],
    [
      'measures.questions.7.options.disagreeStrongly',
      'measures.questions.7.options.disagree',
      'measures.questions.7.options.neutral',
      'measures.questions.7.options.agree',
      'measures.questions.7.options.agreeStrongly'
    ],
    {labelTop: true}
  ),
  generateSchema(
    'measures.questions.8.label',
    'radio',
    items['8'],
    [
      'measures.questions.8.options.disbelieveStrong',
      'measures.questions.8.options.disbelieveLittle',
      'measures.questions.8.options.neutral',
      'measures.questions.8.options.believeLittle',
      'measures.questions.8.options.believeStrong'
    ],
    {labelTop: true}
  ),
  generateSchema(
    'measures.questions.9.label',
    'radio',
    items['9'],
    NINE_POINT_SCALE,
    {
      labelTop: false,
      labels: [{
          rating: 0,
          label: 'measures.questions.9.options.notAtAll'
        },
        {
          rating: 3,
          label: 'measures.questions.9.options.aLittle'
        },
        {
          rating: 5,
          label: 'measures.questions.9.options.moderately'
        },
        {
          rating: 7,
          label: 'measures.questions.9.options.veryWell'
        },
        {
          rating: 9,
          label: 'measures.questions.9.options.exactly'
        }]
    }
  ),
  generateSchema(
    'measures.questions.10.label',
    'radio',
    items['10'],
    [
      'measures.questions.10.options.disagreeStrongly',
      'measures.questions.10.options.disagree',
      'measures.questions.10.options.neutral',
      'measures.questions.10.options.agree',
      'measures.questions.10.options.agreeStrongly'
    ],
    {labelTop: true}
  ),
  {
    question: 'measures.questions.11.label',
    type: 'radio-input',
    scale: ['measures.questions.11.options.yes', 'measures.questions.11.options.no'],
    items: {
      radio: {
        value: null
      },
      input: {
        description: 'measures.questions.12.label',
        value:null,
        optional:true
      }
    }
  },
  generateSchema(
    'measures.questions.13.label',
    'radio',
    items['13'],
    [
      'measures.questions.13.options.disagreeStrongly',
      'measures.questions.13.options.disagree',
      'measures.questions.13.options.neutral',
      'measures.questions.13.options.agree',
      'measures.questions.13.options.agreeStrongly'
    ],
    {labelTop: true}
  ),
  generateSchema(
    'measures.questions.14.label',
    'radio',
    items['14'],
    [
      'measures.questions.14.options.disagreeStrongly',
      'measures.questions.14.options.disagree',
      'measures.questions.14.options.neutral',
      'measures.questions.14.options.agree',
      'measures.questions.14.options.agreeStrongly'
    ],
    {labelTop: true}
  ),
  generateSchema(
    'measures.questions.15.label',
    'radio',
    items['15'],
    [
      'measures.questions.15.options.disagreeStrongly',
      'measures.questions.15.options.disagree',
      'measures.questions.15.options.neutral',
      'measures.questions.15.options.agree',
      'measures.questions.15.options.agreeStrongly'
    ],
    {labelTop: true}
  ),
  generateSchema(
    'measures.questions.16.label',
    'radio',
    items['16'],
    [
      'measures.questions.16.options.notAtAll',
      'measures.questions.16.options.aLittle',
      'measures.questions.16.options.quiteaBit',
      'measures.questions.16.options.completely'
    ],
    {labelTop: true}
  ),
  {
    question: 'measures.questions.17.label',
    type: 'textarea',
    items: {
      input: {
        value: null
      }
    }
  },
  generateSchema(
    'measures.questions.18.label',
    'radio',
    items['18'],
    [
      'measures.questions.18.options.disagreeStrongly',
      'measures.questions.18.options.disagree',
      'measures.questions.18.options.neutral',
      'measures.questions.18.options.agree',
      'measures.questions.18.options.agreeStrongly'
    ],
    {labelTop: true}
  )
];

const Validations = buildValidations(generateValidators(questions));

export default ExpFrameBaseComponent.extend(Validations, {
    type: 'exp-rating-form',
    layout: layout,
    questions: questions,
    responses: Ember.computed('questions', function() {
        var questions = this.get('questions');
        var responses = {};
        for (var i=0; i < questions.length; i++) {
            var question = questions[i];
            responses[i] = {};
            for (var j=0; j < question.items.length; j++) {
                responses[i][j] = question.items[j].value;
            }
        }
        return responses;
    }),
    meta: {
        name: 'ExpRatingForm',
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
    }
});
