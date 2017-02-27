import Ember from 'ember';
import layout from './template';

import {validator, buildValidations} from 'ember-cp-validations';
import config from 'ember-get-config';

import ExpFrameBaseComponent from '../../components/exp-frame-base/component';

// jscs:disable requireDotNotation
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
        'measures.questions.9.items.12.label',
        'measures.questions.9.items.13.label'
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
        'measures.questions.13.items.4.label',
        'measures.questions.13.items.5.label'
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
        'measures.questions.16.items.5.label',
        'measures.questions.16.items.6.label'
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

const TEN_POINT_SCALE = [
    {label: 0, value: 0},
    {label: 1, value: 1},
    {label: 2, value: 2},
    {label: 3, value: 3},
    {label: 4, value: 4},
    {label: 5, value: 5},
    {label: 6, value: 6},
    {label: 7, value: 7},
    {label: 8, value: 8},
    {label: 9, value: 9},
    {label: 10, value: 10}
];
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
    for (var number of Object.keys(pages)) {
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
        var keyName = data.keyName;
        if (data.items.length > 1) {
            keyName = keyName + (i + 1);
        }
        var ret = {
            description: data.items[i],
            keyName: keyName,
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
        keyName: 'PosNeg',
        type: 'select',
        page: 0,
        items: [''],
        scale: [
            {label: 'measures.questions.1.options.extremelyNeg', value: 1},
            {label: 'measures.questions.1.options.quiteNeg', value: 2},
            {label: 'measures.questions.1.options.fairlyNeg', value: 3},
            {label: 'measures.questions.1.options.somewhatNeg', value: 4},
            {label: 'measures.questions.1.options.neither', value: 5},
            {label: 'measures.questions.1.options.somewhatPos', value: 6},
            {label: 'measures.questions.1.options.fairlyPos', value: 7},
            {label: 'measures.questions.1.options.quitePos', value: 8},
            {label: 'measures.questions.1.options.extremelyPos', value: 9}
        ]
    }),
    generateSchema({
        question: 'measures.questions.2.label',
        keyName: 'SitSimilarity',
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
        keyName: 'BBI',
        type: 'radio',
        page: 0,
        items: items['3'],
        scale: [
            {label: 'measures.questions.3.options.extremelyUnchar', value: 1},
            {label: 'measures.questions.3.options.quiteUnchar', value: 2},
            {label: 'measures.questions.3.options.fairlyUnchar', value: 3},
            {label: 'measures.questions.3.options.somewhatUnchar', value: 4},
            {label: 'measures.questions.3.options.neutral', value: 5},
            {label: 'measures.questions.3.options.somewhatChar', value: 6},
            {label: 'measures.questions.3.options.fairlyChar', value: 7},
            {label: 'measures.questions.3.options.quiteChar', value: 8},
            {label: 'measures.questions.3.options.extremelyChar', value: 9}
        ],
        options: {
            labelTop: true,
            formatLabel: 'format-label'
        }
    }),
    generateSchema({
        question: 'measures.questions.4.label',
        keyName: 'Risk',
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
        keyName: 'BFI',
        type: 'radio',
        page: 1,
        items: items['5'],
        scale: [
            {label: 'measures.questions.5.options.disagreeStrongly', value: 1},
            {label: 'measures.questions.5.options.disagree', value: 2},
            {label: 'measures.questions.5.options.neutral', value: 3},
            {label: 'measures.questions.5.options.agree', value: 4},
            {label: 'measures.questions.5.options.agreeStrongly', value: 5}
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
                keyName: 'SWB1',
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
                keyName: 'SWB2',
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
                keyName: 'SWB3',
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
                keyName: 'SWB4',
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
        keyName: 'IntHapp',
        type: 'radio',
        page: 2,
        items: items['7'],
        scale: [
            {label: 'measures.questions.7.options.disagreeStrongly', value: 1},
            {label: 'measures.questions.7.options.disagree', value: 2},
            {label: 'measures.questions.7.options.neutral', value: 3},
            {label: 'measures.questions.7.options.agree', value: 4},
            {label: 'measures.questions.7.options.agreeStrongly', value: 5}
        ],
        options: {labelTop: true}
    }),
    generateSchema({
        question: 'measures.questions.9.label',
        keyName: 'Constru',
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
        keyName: 'Tight',
        type: 'radio',
        page: 4,
        items: items['10'],
        scale: [
            {label: 'measures.questions.10.options.disagreeStrongly', value: 1},
            {label: 'measures.questions.10.options.disagree', value: 2},
            {label: 'measures.questions.10.options.neutral', value: 3},
            {label: 'measures.questions.10.options.agree', value: 4},
            {label: 'measures.questions.10.options.agreeStrongly', value: 5}
        ],
        options: {labelTop: true}
    }),
    {
        question: 'measures.questions.11.label',
        type: 'radio-input',
        page: 4,
        scale: [
            {label: 'measures.questions.11.options.yes', value: 1},
            {label: 'measures.questions.11.options.no', value: 2}
        ],
        items: [
            {
                type: 'radio',
                keyName: 'ChangeYesNo',
                value: null,
                formatLabel: 'negative-margin-top'
            },
            {
                type: 'textarea',
                description: 'measures.questions.12.label',
                keyName: 'ChangeDescribe',
                value: null,
                optional: true
            },
            {
                type: 'radio',
                description: 'measures.questions.18.label',
                keyName: 'ChangeSuccess',
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
        keyName: 'Trust',
        type: 'radio',
        page: 4,
        items: items['13'],
        scale: [
            {label: 'measures.questions.13.options.disagreeStrongly', value: 1},
            {label: 'measures.questions.13.options.disagree', value: 2},
            {label: 'measures.questions.13.options.neutral', value: 3},
            {label: 'measures.questions.13.options.agree', value: 4},
            {label: 'measures.questions.13.options.agreeStrongly', value: 5}
        ],
        options: {labelTop: true}
    }),
    generateSchema({
        question: 'measures.questions.14.label',
        keyName: 'LOT',
        type: 'radio',
        page: 4,
        items: items['14'],
        scale: [
            {label: 'measures.questions.14.options.disagreeStrongly', value: 1},
            {label: 'measures.questions.14.options.disagree', value: 2},
            {label: 'measures.questions.14.options.neutral', value: 3},
            {label: 'measures.questions.14.options.agree', value: 4},
            {label: 'measures.questions.14.options.agreeStrongly', value: 5}
        ],
        options: {labelTop: true}
    }),
    generateSchema({
        question: 'measures.questions.15.label',
        keyName: 'Honest',
        type: 'radio',
        page: 5,
        items: items['15'],
        scale: [
            {label: 'measures.questions.15.options.disagreeStrongly', value: 1},
            {label: 'measures.questions.15.options.disagree', value: 2},
            {label: 'measures.questions.15.options.neutral', value: 3},
            {label: 'measures.questions.15.options.agree', value: 4},
            {label: 'measures.questions.15.options.agreeStrongly', value: 5}
        ],
        options: {labelTop: true}
    }),
    generateSchema({
        question: 'measures.questions.16.label',
        keyName: 'Micro',
        type: 'radio',
        page: 5,
        items: items['16'],
        scale: [
            {label: 'measures.questions.16.options.notAtAll', value: 1},
            {label: 'measures.questions.16.options.aLittle', value: 2},
            {label: 'measures.questions.16.options.quiteaBit', value: 3},
            {label: 'measures.questions.16.options.completely', value: 4}
        ],
        options: {labelTop: true}
    }),
    generateSchema({
        question: 'measures.questions.17.label',
        keyName: 'Narq',
        type: 'radio',
        page: 5,
        items: items['17'],
        scale: [
            {label: 'measures.questions.17.options.disagreeStrongly', value: 1},
            {label: 'measures.questions.17.options.disagree', value: 2},
            {label: 'measures.questions.17.options.neutral', value: 3},
            {label: 'measures.questions.17.options.agree', value: 4},
            {label: 'measures.questions.17.options.agreeStrongly', value: 5}
        ],
        options: {labelTop: true}
    }),
    generateSchema({
        question: 'measures.questions.8.label',
        keyName: 'ReligionScale',
        type: 'radio',
        page: 6,
        items: items['8'],
        scale: [
            {label: 'measures.questions.8.options.disbelieveStrong', value: 1},
            {label: 'measures.questions.8.options.disbelieveLittle', value: 2},
            {label: 'measures.questions.8.options.neutral', value: 3},
            {label: 'measures.questions.8.options.believeLittle', value: 4},
            {label: 'measures.questions.8.options.believeStrong', value: 5},
            {label: 'measures.questions.8.options.preferNoAnswer', value: 6}
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

    extra: {},
    isRTL: Ember.computed.alias('extra.isRTL'),

    progressBarPage: Ember.computed('framePage', function () {
        return this.framePage + 5;
    }),
    questions: questions,
    responses: Ember.computed(function () {
        var questions = this.get('questions');
        var responses = {};
        for (var i = 0; i < questions.length; i++) {
            var question = questions[i];
            responses[i] = {};
            if (i === 0) {
                responses[i][question.keyName] = parseInt(question.items[0].value);
            } else {
                for (var j = 0; j < question.items.length; j++) {
                    var keyName = question.items[j].keyName;
                    responses[i][keyName] = question.items[j].value;
                }
            }
        }
        return responses;
    }).volatile(),
    dataLoaded: false,
    allowNext: Ember.computed(
        'framePage',
        'validations.attrs.page0.isValid',
        'validations.attrs.page1.isValid',
        'validations.attrs.page2.isValid',
        'validations.attrs.page3.isValid',
        'validations.attrs.page4.isValid',
        'validations.attrs.page5.isValid',
        'validations.attrs.page6.isValid',
        function () {
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
            window.scrollTo(0, 0);
        },
        continue() {
            if (this.get('allowNext')) {
                if (this.get('framePage') !== this.get('lastPage')) {

                    this._save()
                        .then(() => {
                            var page = this.get('framePage') + 1;
                            this.set('framePage', page);
                            this.sendAction('updateFramePage', page);
                            window.scrollTo(0, 0);
                        })
                        .catch(err => this.displayError(err));
                } else {
                    this.sendAction('sessionCompleted');
                    this.send('next');
                }
            }
        }
    },
    loadData: function (frameData) {
        // Only load data once when the component loads, not with each page
        if (!this.get('dataLoaded')) {
            var questions = this.get('questions');
            for (var i = 0; i < questions.length; i++) {
                var question = questions[i];
                for (var j = 0; j < question.items.length; j++) {
                    var keyName = question.items[j].keyName;
                    Ember.set(question.items[j], 'value', frameData.responses[i][keyName]);
                }
            }
            this.set('dataLoaded', true);
        }
    }
});
