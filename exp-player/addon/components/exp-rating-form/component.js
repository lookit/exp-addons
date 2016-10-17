import Ember from 'ember';
import ExpFrameBaseComponent from 'exp-player/components/exp-frame-base';
import layout from './template';
import {validator, buildValidations} from 'ember-cp-validations';
import config from 'ember-get-config';


var items = {
    '3': [
        'measures.questions.3.items.1.label',
        'measures.questions.3.items.2.label',
        'measures.questions.3.items.3.label',
        'measures.questions.3.items.4.label',
        'measures.questions.3.items.5.label',
        'measures.questions.3.items.6.label',
        'measures.questions.3.items.7.label',
        'measures.questions.3.items.8.label',
        'measures.questions.3.items.9.label',
        'measures.questions.3.items.10.label',
        'measures.questions.3.items.11.label',
        'measures.questions.3.items.12.label',
        'measures.questions.3.items.13.label',
        'measures.questions.3.items.14.label',
        'measures.questions.3.items.15.label',
        'measures.questions.3.items.16.label'
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
    '17': [
        'measures.questions.17.items.1.label',
        'measures.questions.17.items.2.label',
        'measures.questions.17.items.3.label',
        'measures.questions.17.items.4.label',
        'measures.questions.17.items.5.label',
        'measures.questions.17.items.6.label'
    ]
};

const TEN_POINT_SCALE = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const SEVEN_POINT_SCALE = TEN_POINT_SCALE.slice(1, 8);
const NINE_POINT_SCALE = TEN_POINT_SCALE.slice(1, 10);

var generateValidators = function (questions) {
    var validators = {};
    var pages = {};
    for (var i = 0; i < questions.length; i++) {
        var page = questions[i].page;
        for (var item = 0; item < questions[i]['items'].length; item++) {
            var isOptional = questions[i]['items'][item].optional;
            if (!isOptional) {
                var key = `questions.${i}.items.${item}.value`;
                if (!pages[page]) {
                    pages[page] = [];
                }
                pages[page].push(key);
                validators[key] = validator('presence', {
                    presence: true
                });
            }
        }
    }
    for (var number in Object.keys(pages)) {
        validators['page' + number] = validator('dependent', {
            on: pages[number]
        });
    }
    return validators;
};

var generateSchema = function (data) {
    var items = [];
    var options = data.options ? data.options : {};

    var setOption = (option) => {
        ret[option] = options[option];
    };
    for (var i = 0; i < data.items.length; i++) {
        var ret = {
            description: data.items[i],
            value: null
        };
        Object.keys(options).forEach(setOption);
        items.push(ret);
    }
    data['items'] = items;
    return data;
};

var questions = [
    generateSchema({
        question: 'measures.questions.1.label',
        type: 'select',
        page: 0,
        items: [''],
        scale: [
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
    }),
    generateSchema({
        question: 'measures.questions.2.label',
        type: 'radio',
        page: 0,
        items: [''],
        scale: SEVEN_POINT_SCALE,
        options: {
            labelTop: false,
            formatLabel: 'format-label',
            labels: [
                {
                    rating: 1,
                    label: 'measures.questions.2.options.never'
                },
                {
                    rating: 3,
                    label: 'measures.questions.2.options.hardlyEver'
                },
                {
                    rating: 5,
                    label: 'measures.questions.2.options.occasionally'
                },
                {
                    rating: 7,
                    label: 'measures.questions.2.options.quiteOften'
                }
            ]
        }
    }),
    generateSchema({
        question: 'measures.questions.3.label',
        type: 'radio',
        page: 0,
        items: items['3'],
        scale: [
            'measures.questions.3.options.extremelyUnchar',
            'measures.questions.3.options.quiteUnchar',
            'measures.questions.3.options.fairlyUnchar',
            'measures.questions.3.options.somewhatUnchar',
            'measures.questions.3.options.neutral',
            'measures.questions.3.options.somewhatChar',
            'measures.questions.3.options.fairlyChar',
            'measures.questions.3.options.quiteChar',
            'measures.questions.3.options.extremelyChar'
        ],
        options: {
            labelTop: true,
            formatLabel: 'format-label'
        }
    }),
    generateSchema({
        question: 'measures.questions.4.label',
        type: 'radio',
        page: 1,
        items: [''],
        scale: TEN_POINT_SCALE,
        options: {
            labelTop: false,
            formatLabel: 'measure-four negative-margin-top',
            labels: [
                {
                    rating: 0,
                    label: 'measures.questions.4.options.unwilling'
                },
                {
                    rating: 10,
                    label: 'measures.questions.4.options.fullyPrepared'
                }
            ]
        }
    }),
    generateSchema({
        question: 'measures.questions.5.label',
        type: 'radio',
        page: 1,
        items: items['5'],
        scale: [
            'measures.questions.5.options.disagreeStrongly',
            'measures.questions.5.options.disagree',
            'measures.questions.5.options.neutral',
            'measures.questions.5.options.agree',
            'measures.questions.5.options.agreeStrongly'
        ],
        options: {labelTop: true}
    }),
    {
        question: 'measures.questions.6.label',
        type: 'radio',
        page: 2,
        scale: SEVEN_POINT_SCALE,
        items: [
            {
                description: 'measures.questions.6.items.1.label',
                value: null,
                labelTop: false,
                formatLabel: 'measure-six',
                labels: [
                    {
                        rating: 1,
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
                value: null,
                labelTop: false,
                formatLabel: 'measure-six',
                labels: [
                    {
                        rating: 1,
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
                value: null,
                labelTop: false,
                formatLabel: 'measure-six',
                labels: [
                    {
                        rating: 1,
                        label: 'measures.questions.6.items.3.options.notAtAll'
                    },
                    {
                        rating: 7,
                        label: 'measures.questions.6.items.3.options.aGreatDeal'
                    }]
            },
            {
                description: 'measures.questions.6.items.4.label',
                scale: SEVEN_POINT_SCALE,
                value: null,
                labelTop: false,
                formatLabel: 'measure-six',
                labels: [
                    {
                        rating: 1,
                        label: 'measures.questions.6.items.4.options.notAtAll'
                    },
                    {
                        rating: 7,
                        label: 'measures.questions.6.items.4.options.aGreatDeal'
                    }]
            }]
    },
    generateSchema({
        question: 'measures.questions.7.label',
        type: 'radio',
        page: 2,
        items: items['7'],
        scale: [
            'measures.questions.7.options.disagreeStrongly',
            'measures.questions.7.options.disagree',
            'measures.questions.7.options.neutral',
            'measures.questions.7.options.agree',
            'measures.questions.7.options.agreeStrongly'
        ],
        options: {labelTop: true}
    }),
    generateSchema({
        question: 'measures.questions.9.label',
        type: 'radio',
        page: 3,
        items: items['9'],
        scale: NINE_POINT_SCALE,
        options: {
            labelTop: false,
            labels: [
                {
                    rating: 1,
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
    }),
    generateSchema({
        question: 'measures.questions.10.label',
        type: 'radio',
        page: 4,
        items: items['10'],
        scale: [
            'measures.questions.10.options.disagreeStrongly',
            'measures.questions.10.options.disagree',
            'measures.questions.10.options.neutral',
            'measures.questions.10.options.agree',
            'measures.questions.10.options.agreeStrongly'
        ],
        options: {labelTop: true}
    }),
    {
        question: 'measures.questions.11.label',
        type: 'radio-input',
        page: 4,
        scale: ['measures.questions.11.options.yes', 'measures.questions.11.options.no'],
        items: [{
            type: 'radio',
            value: null,
            formatLabel: 'negative-margin-top'
        },
        {
            type: 'textarea',
            description: 'measures.questions.12.label',
            value: null,
            optional: true
        },
        {
            type: 'radio',
            description: 'measures.questions.18.label',
            value: null,
            optional: true,
            labelTop: false,
            scale: NINE_POINT_SCALE,
            labels: [
                {
                    rating: 1,
                    label: 'measures.questions.18.options.notatallSuccessful'
                },
                {
                    rating: 3,
                    label: 'measures.questions.18.options.alittleSuccessful'
                },
                {
                    rating: 5,
                    label: 'measures.questions.18.options.moderatelySuccessful'
                },
                {
                    rating: 7,
                    label: 'measures.questions.18.options.verySuccessful'
                },
                {
                    rating: 9,
                    label: 'measures.questions.18.options.completelySuccessful'
                }
            ]
        }]
    },
    generateSchema({
        question: 'measures.questions.13.label',
        type: 'radio',
        page: 4,
        items: items['13'],
        scale: [
            'measures.questions.13.options.disagreeStrongly',
            'measures.questions.13.options.disagree',
            'measures.questions.13.options.neutral',
            'measures.questions.13.options.agree',
            'measures.questions.13.options.agreeStrongly'
        ],
        options: {labelTop: true}
    }),
    generateSchema({
        question: 'measures.questions.14.label',
        type: 'radio',
        page: 4,
        items: items['14'],
        scale: [
            'measures.questions.14.options.disagreeStrongly',
            'measures.questions.14.options.disagree',
            'measures.questions.14.options.neutral',
            'measures.questions.14.options.agree',
            'measures.questions.14.options.agreeStrongly'
        ],
        options: {labelTop: true}
    }),
    generateSchema({
        question: 'measures.questions.15.label',
        type: 'radio',
        page: 5,
        items: items['15'],
        scale: [
            'measures.questions.15.options.disagreeStrongly',
            'measures.questions.15.options.disagree',
            'measures.questions.15.options.neutral',
            'measures.questions.15.options.agree',
            'measures.questions.15.options.agreeStrongly'
        ],
        options: {labelTop: true}
    }),
    generateSchema({
        question: 'measures.questions.16.label',
        type: 'radio',
        page: 5,
        items: items['16'],
        scale: [
            'measures.questions.16.options.notAtAll',
            'measures.questions.16.options.aLittle',
            'measures.questions.16.options.quiteaBit',
            'measures.questions.16.options.completely'
        ],
        options: {labelTop: true}
    }),
    generateSchema({
        question: 'measures.questions.17.label',
        type: 'radio',
        page: 5,
        items: items['17'],
        scale: [
            'measures.questions.17.options.disagreeStrongly',
            'measures.questions.17.options.disagree',
            'measures.questions.17.options.neutral',
            'measures.questions.17.options.agree',
            'measures.questions.17.options.agreeStrongly'
        ],
        options: {labelTop: true}
    }),
    generateSchema({
        question: 'measures.questions.8.label',
        type: 'radio',
        page: 6,
        items: items['8'],
        scale: [
            'measures.questions.8.options.disbelieveStrong',
            'measures.questions.8.options.disbelieveLittle',
            'measures.questions.8.options.neutral',
            'measures.questions.8.options.believeLittle',
            'measures.questions.8.options.believeStrong'
        ],
        options: {labelTop: true}
    })
];

const Validations = buildValidations(generateValidators(questions));

export default ExpFrameBaseComponent.extend(Validations, {
    type: 'exp-rating-form',
    layout: layout,
    framePage: 0,
    lastPage: 6,
    progressBarPage: Ember.computed('framePage', function () {
        return this.framePage + 5;
    }),
    questions: questions,
    responses: Ember.computed(function() {
        var questions = this.get('questions');
        var responses = {};
        for (var i = 0; i < questions.length; i++) {
            var question = questions[i];
            responses[i] = {};
            for (var j = 0; j < question.items.length; j++) {
                responses[i][j] = question.items[j].value;
            }
        }
        return responses;
    }).volatile(),
    allowNext: Ember.computed(
        'framePage',
        'validations.attrs.page0.isValid',
        'validations.attrs.page1.isValid',
        'validations.attrs.page2.isValid',
        'validations.attrs.page3.isValid',
        'validations.attrs.page4.isValid',
        'validations.attrs.page5.isValid',
        'validations.attrs.page6.isValid',
        function() {
            // Check validation for questions on the current page
            var page = this.get('framePage');
            var attr = 'validations.attrs.page' + page + '.isValid';
            return this.get(attr) || !config.featureFlags.validate;
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
                    // TODO: Add validations for types and required properties in future
                    type: 'object'
                }
            }
        }
    },
    actions: {
        previousPage() {
            var page = Math.max(0, this.get('framePage') - 1);
            this.set('framePage', page);
            this.sendAction('updateFramePage', page);
            window.scrollTo(0,0);
        },
        continue() {
            if (this.get('allowNext')) {
                if (this.get('framePage') !== this.get('lastPage')) {
                    this.send('save');
                    var page = this.get('framePage') + 1;
                    this.set('framePage', page);
                    this.sendAction('updateFramePage', page);
                    window.scrollTo(0, 0);
                } else {
                    this.sendAction('sessionCompleted');
                    this.send('next');
                }
            }
        }
    },
    loadData: function(frameData) {
        var questions = this.get('questions');
        for (var i = 0; i < questions.length; i++) {
            var question = questions[i];
            for (var j = 0; j < question.items.length; j++) {
                question.items[j].value = frameData.responses[i][j];
            }
        }
    }
});
