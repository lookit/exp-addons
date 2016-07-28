import ExpFrameBaseComponent from 'exp-player/components/exp-frame-base';
import layout from './template';
import {validator, buildValidations} from 'ember-cp-validations';

var translations = {
  "measures": {
        "questions": {
            "1": {
                "label": "measures.questions.1.label",
                "options": {
                    "extremelyNeg": "measures.questions.1.options.extremelyNeg",
                    "extremelyPos": "measures.questions.1.options.extremelyPos",
                    "fairlyNeg": "measures.questions.1.options.fairlyNeg",
                    "fairlyPos": "measures.questions.1.options.fairlyPos",
                    "neither": "measures.questions.1.options.neither",
                    "quiteNeg": "measures.questions.1.options.quiteNeg",
                    "quitePos": "measures.questions.1.options.quitePos",
                    "somewhatNeg": "measures.questions.1.options.somewhatNeg",
                    "somewhatPos": "measures.questions.1.options.somewhatPos"
                },
                "selectUnselected": "measures.questions.1.selectUnselected"
            },
            "2": {
                "label": "measures.questions.2.label",
                "options": {
                    "hardleyEver": "measures.questions.2.options.hardleyEver",
                    "never": "measures.questions.2.options.never",
                    "occasionally": "measures.questions.2.options.occasionally",
                    "quiteOften": "measures.questions.2.options.quiteOften"
                }
            },
            "3": {
                "label": "measures.questions.3.label",
                "options": {
                    "fullyPrepared": "measures.questions.3.options.fullyPrepared",
                    "unwilling": "measures.questions.3.options.unwilling"
                }
            },
            "4": {
                "items": {
                    "1": {
                        "label": "measures.questions.4.items.1.label"
                    },
                    "10": {
                        "label": "measures.questions.4.items.10.label"
                    },
                    "11": {
                        "label": "measures.questions.4.items.11.label"
                    },
                    "12": {
                        "label": "measures.questions.4.items.12.label"
                    },
                    "13": {
                        "label": "measures.questions.4.items.13.label"
                    },
                    "14": {
                        "label": "measures.questions.4.items.14.label"
                    },
                    "15": {
                        "label": "measures.questions.4.items.15.label"
                    },
                    "16": {
                        "label": "measures.questions.4.items.16.label"
                    },
                    "2": {
                        "label": "measures.questions.4.items.2.label"
                    },
                    "3": {
                        "label": "measures.questions.4.items.3.label"
                    },
                    "4": {
                        "label": "measures.questions.4.items.4.label"
                    },
                    "5": {
                        "label": "measures.questions.4.items.5.label"
                    },
                    "6": {
                        "label": "measures.questions.4.items.6.label"
                    },
                    "7": {
                        "label": "measures.questions.4.items.7.label"
                    },
                    "8": {
                        "label": "measures.questions.4.items.8.label"
                    },
                    "9": {
                        "label": "measures.questions.4.items.9.label"
                    }
                },
                "label": "measures.questions.4.label",
                "options": {
                    "extremelyChar": "measures.questions.4.options.extremelyChar",
                    "extremelyUnchar": "measures.questions.4.options.extremelyUnchar",
                    "fairlyChar": "measures.questions.4.options.fairlyChar",
                    "fairlyUnchar": "measures.questions.4.options.fairlyUnchar",
                    "neutral": "measures.questions.4.options.neutral",
                    "quiteChar": "measures.questions.4.options.quiteChar",
                    "quiteUnchar": "measures.questions.4.options.quiteUnchar",
                    "somewhatChar": "measures.questions.4.options.somewhatChar",
                    "somewhatUnchar": "measures.questions.4.options.somewhatUnchar"
                }
            },
            "5": {
                "items": {
                    "1": {
                        "label": "measures.questions.5.items.1.label"
                    },
                    "10": {
                        "label": "measures.questions.5.items.10.label"
                    },
                    "11": {
                        "label": "measures.questions.5.items.11.label"
                    },
                    "12": {
                        "label": "measures.questions.5.items.12.label"
                    },
                    "13": {
                        "label": "measures.questions.5.items.13.label"
                    },
                    "14": {
                        "label": "measures.questions.5.items.14.label"
                    },
                    "15": {
                        "label": "measures.questions.5.items.15.label"
                    },
                    "16": {
                        "label": "measures.questions.5.items.16.label"
                    },
                    "17": {
                        "label": "measures.questions.5.items.17.label"
                    },
                    "18": {
                        "label": "measures.questions.5.items.18.label"
                    },
                    "19": {
                        "label": "measures.questions.5.items.19.label"
                    },
                    "2": {
                        "label": "measures.questions.5.items.2.label"
                    },
                    "20": {
                        "label": "measures.questions.5.items.20.label"
                    },
                    "21": {
                        "label": "measures.questions.5.items.21.label"
                    },
                    "22": {
                        "label": "measures.questions.5.items.22.label"
                    },
                    "23": {
                        "label": "measures.questions.5.items.23.label"
                    },
                    "24": {
                        "label": "measures.questions.5.items.24.label"
                    },
                    "25": {
                        "label": "measures.questions.5.items.25.label"
                    },
                    "26": {
                        "label": "measures.questions.5.items.26.label"
                    },
                    "27": {
                        "label": "measures.questions.5.items.27.label"
                    },
                    "28": {
                        "label": "measures.questions.5.items.28.label"
                    },
                    "29": {
                        "label": "measures.questions.5.items.29.label"
                    },
                    "3": {
                        "label": "measures.questions.5.items.3.label"
                    },
                    "30": {
                        "label": "measures.questions.5.items.30.label"
                    },
                    "31": {
                        "label": "measures.questions.5.items.31.label"
                    },
                    "32": {
                        "label": "measures.questions.5.items.32.label"
                    },
                    "33": {
                        "label": "measures.questions.5.items.33.label"
                    },
                    "34": {
                        "label": "measures.questions.5.items.34.label"
                    },
                    "35": {
                        "label": "measures.questions.5.items.35.label"
                    },
                    "36": {
                        "label": "measures.questions.5.items.36.label"
                    },
                    "37": {
                        "label": "measures.questions.5.items.37.label"
                    },
                    "38": {
                        "label": "measures.questions.5.items.38.label"
                    },
                    "39": {
                        "label": "measures.questions.5.items.39.label"
                    },
                    "4": {
                        "label": "measures.questions.5.items.4.label"
                    },
                    "40": {
                        "label": "measures.questions.5.items.40.label"
                    },
                    "41": {
                        "label": "measures.questions.5.items.41.label"
                    },
                    "42": {
                        "label": "measures.questions.5.items.42.label"
                    },
                    "43": {
                        "label": "measures.questions.5.items.43.label"
                    },
                    "44": {
                        "label": "measures.questions.5.items.44.label"
                    },
                    "45": {
                        "label": "measures.questions.5.items.45.label"
                    },
                    "46": {
                        "label": "measures.questions.5.items.46.label"
                    },
                    "47": {
                        "label": "measures.questions.5.items.47.label"
                    },
                    "48": {
                        "label": "measures.questions.5.items.48.label"
                    },
                    "49": {
                        "label": "measures.questions.5.items.49.label"
                    },
                    "5": {
                        "label": "measures.questions.5.items.5.label"
                    },
                    "50": {
                        "label": "measures.questions.5.items.50.label"
                    },
                    "51": {
                        "label": "measures.questions.5.items.51.label"
                    },
                    "52": {
                        "label": "measures.questions.5.items.52.label"
                    },
                    "53": {
                        "label": "measures.questions.5.items.53.label"
                    },
                    "54": {
                        "label": "measures.questions.5.items.54.label"
                    },
                    "55": {
                        "label": "measures.questions.5.items.55.label"
                    },
                    "56": {
                        "label": "measures.questions.5.items.56.label"
                    },
                    "57": {
                        "label": "measures.questions.5.items.57.label"
                    },
                    "58": {
                        "label": "measures.questions.5.items.58.label"
                    },
                    "59": {
                        "label": "measures.questions.5.items.59.label"
                    },
                    "6": {
                        "label": "measures.questions.5.items.6.label"
                    },
                    "60": {
                        "label": "measures.questions.5.items.60.label"
                    },
                    "7": {
                        "label": "measures.questions.5.items.7.label"
                    },
                    "8": {
                        "label": "measures.questions.5.items.8.label"
                    },
                    "9": {
                        "label": "measures.questions.5.items.9.label"
                    }
                },
                "label": "measures.questions.5.label",
                "options": {
                    "agree": "measures.questions.5.options.agree",
                    "agreeStrongly": "measures.questions.5.options.agreeStrongly",
                    "disagree": "measures.questions.5.options.disagree",
                    "disagreeStrongly": "measures.questions.5.options.disagreeStrongly",
                    "neutral": "measures.questions.5.options.neutral"
                }
            },
            "6": {
                "items": {
                    "1": {
                        "label": "measures.questions.6.items.1.label",
                        "options": {
                            "notHappy": "measures.questions.6.items.1.options.notHappy",
                            "veryHappy": "measures.questions.6.items.1.options.veryHappy"
                        }
                    },
                    "2": {
                        "label": "measures.questions.6.items.2.label",
                        "options": {
                            "lessHappy": "measures.questions.6.items.2.options.lessHappy",
                            "moreHappy": "measures.questions.6.items.2.options.moreHappy"
                        }
                    },
                    "3": {
                        "label": "measures.questions.6.items.3.label"
                    },
                    "4": {
                        "label": "measures.questions.6.items.4.label",
                        "options": {
                            "aGreatDeal": "measures.questions.6.items.4.options.aGreatDeal",
                            "notAtAll": "measures.questions.6.items.4.options.notAtAll"
                        }
                    }
                },
                "label": "measures.questions.6.label",
                "options": {
                    "aGreatDeal": "measures.questions.6.options.aGreatDeal",
                    "notAtAll": "measures.questions.6.options.notAtAll"
                }
            },
            "7": {
                "items": {
                    "1": {
                        "label": "measures.questions.7.items.1.label"
                    },
                    "2": {
                        "label": "measures.questions.7.items.2.label"
                    },
                    "3": {
                        "label": "measures.questions.7.items.3.label"
                    },
                    "4": {
                        "label": "measures.questions.7.items.4.label"
                    },
                    "5": {
                        "label": "measures.questions.7.items.5.label"
                    },
                    "6": {
                        "label": "measures.questions.7.items.6.label"
                    },
                    "7": {
                        "label": "measures.questions.7.items.7.label"
                    },
                    "8": {
                        "label": "measures.questions.7.items.8.label"
                    },
                    "9": {
                        "label": "measures.questions.7.items.9.label"
                    }
                },
                "label": "measures.questions.7.label",
                "options": {
                    "agree": "measures.questions.7.options.agree",
                    "agreeStrongly": "measures.questions.7.options.agreeStrongly",
                    "disagree": "measures.questions.7.options.disagree",
                    "disagreeStrongly": "measures.questions.7.options.disagreeStrongly",
                    "neutral": "measures.questions.7.options.neutral"
                }
            },
            "8": {
                "items": {
                    "1": {
                        "label": "measures.questions.8.items.1.label"
                    },
                    "10": {
                        "label": "measures.questions.8.items.10.label"
                    },
                    "11": {
                        "label": "measures.questions.8.items.11.label"
                    },
                    "12": {
                        "label": "measures.questions.8.items.12.label"
                    },
                    "13": {
                        "label": "measures.questions.8.items.13.label"
                    },
                    "14": {
                        "label": "measures.questions.8.items.14.label"
                    },
                    "15": {
                        "label": "measures.questions.8.items.15.label"
                    },
                    "16": {
                        "label": "measures.questions.8.items.16.label"
                    },
                    "17": {
                        "label": "measures.questions.8.items.17.label"
                    },
                    "2": {
                        "label": "measures.questions.8.items.2.label"
                    },
                    "3": {
                        "label": "measures.questions.8.items.3.label"
                    },
                    "4": {
                        "label": "measures.questions.8.items.4.label"
                    },
                    "5": {
                        "label": "measures.questions.8.items.5.label"
                    },
                    "6": {
                        "label": "measures.questions.8.items.6.label"
                    },
                    "7": {
                        "label": "measures.questions.8.items.7.label"
                    },
                    "8": {
                        "label": "measures.questions.8.items.8.label"
                    },
                    "9": {
                        "label": "measures.questions.8.items.9.label"
                    }
                },
                "label": "measures.questions.8.label",
                "options": {
                    "believeLittle": "measures.questions.8.options.believeLittle",
                    "believeStrong": "measures.questions.8.options.believeStrong",
                    "disbelieveLittle": "measures.questions.8.options.disbelieveLittle",
                    "disbelieveStrong": "measures.questions.8.options.disbelieveStrong",
                    "neutral": "measures.questions.8.options.neutral"
                }
            },
            "9": {
                "items": {
                    "1": {
                        "label": "measures.questions.9.items.1.label"
                    },
                    "10": {
                        "label": "measures.questions.9.items.10.label"
                    },
                    "11": {
                        "label": "measures.questions.9.items.11.label"
                    },
                    "12": {
                        "label": "measures.questions.9.items.12.label"
                    },
                    "2": {
                        "label": "measures.questions.9.items.2.label"
                    },
                    "3": {
                        "label": "measures.questions.9.items.3.label"
                    },
                    "4": {
                        "label": "measures.questions.9.items.4.label"
                    },
                    "5": {
                        "label": "measures.questions.9.items.5.label"
                    },
                    "6": {
                        "label": "measures.questions.9.items.6.label"
                    },
                    "7": {
                        "label": "measures.questions.9.items.7.label"
                    },
                    "8": {
                        "label": "measures.questions.9.items.8.label"
                    },
                    "9": {
                        "label": "measures.questions.9.items.9.label"
                    }
                },
                "label": "measures.questions.9.label",
                "options": {
                    "aLittle": "measures.questions.9.options.aLittle",
                    "exactly": "measures.questions.9.options.exactly",
                    "moderately": "measures.questions.9.options.moderately",
                    "notAtAll": "measures.questions.9.options.notAtAll",
                    "veryWell": "measures.questions.9.options.veryWell"
                }
            },
            "10": {
                "items": {
                    "1": {
                        "label": "measures.questions.10.items.1.label"
                    },
                    "2": {
                        "label": "measures.questions.10.items.2.label"
                    },
                    "3": {
                        "label": "measures.questions.10.items.3.label"
                    },
                    "4": {
                        "label": "measures.questions.10.items.4.label"
                    },
                    "5": {
                        "label": "measures.questions.10.items.5.label"
                    },
                    "6": {
                        "label": "measures.questions.10.items.6.label"
                    }
                },
                "label": "measures.questions.10.label",
                "options": {
                    "agree": "measures.questions.10.options.agree",
                    "agreeStrongly": "measures.questions.10.options.agreeStrongly",
                    "disagree": "measures.questions.10.options.disagree",
                    "disagreeStrongly": "measures.questions.10.options.disagreeStrongly",
                    "neutral": "measures.questions.10.options.neutral"
                }
            },
            "11": {
                "label": "measures.questions.11.label",
                "options": {
                    "no": "measures.questions.11.options.no",
                    "yes": "measures.questions.11.options.yes"
                }
            },
            "12": {
                "label": "measures.questions.12.label"
            },
            "13": {
                "items": {
                    "1": {
                        "label": "measures.questions.13.items.1.label"
                    },
                    "2": {
                        "label": "measures.questions.13.items.2.label"
                    },
                    "3": {
                        "label": "measures.questions.13.items.3.label"
                    },
                    "4": {
                        "label": "measures.questions.13.items.4.label"
                    }
                },
                "label": "measures.questions.13.label",
                "options": {
                    "agree": "measures.questions.13.options.agree",
                    "agreeStrongly": "measures.questions.13.options.agreeStrongly",
                    "disagree": "measures.questions.13.options.disagree",
                    "disagreeStrongly": "measures.questions.13.options.disagreeStrongly",
                    "neutral": "measures.questions.13.options.neutral"
                }
            },
            "14": {
                "items": {
                    "1": {
                        "label": "measures.questions.14.items.1.label"
                    },
                    "2": {
                        "label": "measures.questions.14.items.2.label"
                    },
                    "3": {
                        "label": "measures.questions.14.items.3.label"
                    },
                    "4": {
                        "label": "measures.questions.14.items.4.label"
                    },
                    "5": {
                        "label": "measures.questions.14.items.5.label"
                    },
                    "6": {
                        "label": "measures.questions.14.items.6.label"
                    }
                },
                "label": "measures.questions.14.label",
                "options": {
                    "agree": "measures.questions.14.options.agree",
                    "agreeStrongly": "measures.questions.14.options.agreeStrongly",
                    "disagree": "measures.questions.14.options.disagree",
                    "disagreeStrongly": "measures.questions.14.options.disagreeStrongly",
                    "neutral": "measures.questions.14.options.neutral"
                }
            },
            "15": {
                "items": {
                    "1": {
                        "label": "measures.questions.15.items.1.label"
                    },
                    "10": {
                        "label": "measures.questions.15.items.10.label"
                    },
                    "2": {
                        "label": "measures.questions.15.items.2.label"
                    },
                    "3": {
                        "label": "measures.questions.15.items.3.label"
                    },
                    "4": {
                        "label": "measures.questions.15.items.4.label"
                    },
                    "5": {
                        "label": "measures.questions.15.items.5.label"
                    },
                    "6": {
                        "label": "measures.questions.15.items.6.label"
                    },
                    "7": {
                        "label": "measures.questions.15.items.7.label"
                    },
                    "8": {
                        "label": "measures.questions.15.items.8.label"
                    },
                    "9": {
                        "label": "measures.questions.15.items.9.label"
                    }
                },
                "label": "measures.questions.15.label",
                "options": {
                    "agree": "measures.questions.15.options.agree",
                    "agreeStrongly": "measures.questions.15.options.agreeStrongly",
                    "disagree": "measures.questions.15.options.disagree",
                    "disagreeStrongly": "measures.questions.15.options.disagreeStrongly",
                    "neutral": "measures.questions.15.options.neutral"
                }
            },
            "16": {
                "items": {
                    "1": {
                        "label": "measures.questions.16.items.1.label"
                    },
                    "2": {
                        "label": "measures.questions.16.items.2.label"
                    },
                    "3": {
                        "label": "measures.questions.16.items.3.label"
                    },
                    "4": {
                        "label": "measures.questions.16.items.4.label"
                    },
                    "5": {
                        "label": "measures.questions.16.items.5.label"
                    }
                },
                "label": "measures.questions.16.label",
                "options": {
                    "aLittle": "measures.questions.16.options.aLittle",
                    "completely": "measures.questions.16.options.completely",
                    "notAtAll": "measures.questions.16.options.notAtAll",
                    "quiteaBit": "measures.questions.16.options.quiteaBit"
                }
            },
            "17": {
                "label": "measures.questions.17.label"
            }
        }
    }
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
  for (var item in items) {
    var ret = {
      description: items[item]['label'],
      order: parseInt(item),
      value: null
    };
    for (var option in options) {
      ret[option] = options[option];
    }
    schema['items'].push(ret);
  }
  schema.items.sort(function(a, b) {
    if (a.order > b.order) {
      return 1;
    }
    if (a.order < b.order) {
      return -1;
    }
    return 0;
  });
  return schema;
};


var questions = [
  generateSchema(
    translations.measures.questions['1'].label,
    'select',
    {'1': ''},
    [
      translations.measures.questions['1'].options.extremelyNeg,
      translations.measures.questions['1'].options.quiteNeg,
      translations.measures.questions['1'].options.fairlyNeg,
      translations.measures.questions['1'].options.somewhatNeg,
      translations.measures.questions['1'].options.neither,
      translations.measures.questions['1'].options.somewhatPos,
      translations.measures.questions['1'].options.fairlyPos,
      translations.measures.questions['1'].options.quitePos,
      translations.measures.questions['1'].options.extremelyPos
    ]
  ),
  generateSchema(
    translations.measures.questions['2'].label,
    'radio',
    {'1': ''},
    SEVEN_POINT_SCALE,
    {
      labelTop: false,
      labels: [{
          rating: 0,
          label: translations.measures.questions['2'].options.never
        },
        {
          rating: 2,
          label: translations.measures.questions['2'].options.hardleyEver
        },
        {
          rating: 4,
          label: translations.measures.questions['2'].options.occasionally
        },
        {
          rating: 6,
          label: translations.measures.questions['2'].options.quiteOften
        }
      ]
    }
  ),
  generateSchema(
    translations.measures.questions['3'].label,
    'radio',
    {'1': ''},
    TEN_POINT_SCALE,
    {
      labelTop: false,
      labels: [{
          rating: 0,
          label: translations.measures.questions['3'].options.unwilling
        },
        {
          rating: 10,
          label: translations.measures.questions['3'].options.fullyPrepared
        }
      ]
    }
  ),
  generateSchema(
    translations.measures.questions['4'].label,
    'radio',
    translations.measures.questions['4'].items,
    [
      translations.measures.questions['4'].options.extremelyUnchar,
      translations.measures.questions['4'].options.quiteUnchar,
      translations.measures.questions['4'].options.fairlyUnchar,
      translations.measures.questions['4'].options.somewhatUnchar,
      translations.measures.questions['4'].options.neutral,
      translations.measures.questions['4'].options.somewhatChar,
      translations.measures.questions['4'].options.fairlyChar,
      translations.measures.questions['4'].options.quiteChar,
      translations.measures.questions['4'].options.extremelyChar
    ],
    {labelTop: true}
  ),
  generateSchema(
    translations.measures.questions['5'].label,
    'radio',
    translations.measures.questions['5'].items,
    [
      translations.measures.questions['5'].options.disagreeStrongly,
      translations.measures.questions['5'].options.disagree,
      translations.measures.questions['5'].options.neutral,
      translations.measures.questions['5'].options.agree,
      translations.measures.questions['5'].options.agreeStrongly
    ],
    {labelTop: true}
  ),
  {
    question: translations.measures.questions['6'].label,
    type: 'radio',
    scale: SEVEN_POINT_SCALE,
    items: [
      {
        description: translations.measures.questions['6'].items['1'].label,
        value:null,
        labelTop: false,
        labels: [{
            rating: 0,
            label: translations.measures.questions['6'].items['1'].options.notHappy
          },
          {
            rating: 7,
            label: translations.measures.questions['6'].items['1'].options.veryHappy
          }]
      },
      {
        description: translations.measures.questions['6'].items['2'].label,
        scale: SEVEN_POINT_SCALE,
        value:null,
        labelTop: false,
        labels: [{
            rating: 0,
            label: translations.measures.questions['6'].items['2'].options.lessHappy
          },
          {
            rating: 7,
            label: translations.measures.questions['6'].items['2'].options.moreHappy
          }]
      },
      {
        description: translations.measures.questions['6'].items['3'].label,
        scale: SEVEN_POINT_SCALE,
        value:null,
        labelTop: false,
        labels: [{
            rating: 0,
            label: translations.measures.questions['6'].items['4'].options.notAtAll
          },
          {
            rating: 7,
            label: translations.measures.questions['6'].items['4'].options.aGreatDeal
          }]
      },
      {
        description: translations.measures.questions['6'].items['4'].label,
        scale: SEVEN_POINT_SCALE,
        value:null,
        labelTop: false,
        labels: [{
            rating: 0,
            label: translations.measures.questions['6'].items['4'].options.notAtAll
          },
          {
            rating: 7,
            label: translations.measures.questions['6'].items['4'].options.aGreatDeal
          }]
      }]
  },
  generateSchema(
    translations.measures.questions['7'].label,
    'radio',
    translations.measures.questions['7'].items,
    [
      translations.measures.questions['7'].options.disagreeStrongly,
      translations.measures.questions['7'].options.disagree,
      translations.measures.questions['7'].options.neutral,
      translations.measures.questions['7'].options.agree,
      translations.measures.questions['7'].options.agreeStrongly
    ],
    {labelTop: true}
  ),
  generateSchema(
    translations.measures.questions['8'].label,
    'radio',
    translations.measures.questions['8'].items,
    [
      translations.measures.questions['8'].options.disbelieveStrong,
      translations.measures.questions['8'].options.disbelieveLittle,
      translations.measures.questions['8'].options.neutral,
      translations.measures.questions['8'].options.believeLittle,
      translations.measures.questions['8'].options.believeStrong
    ],
    {labelTop: true}
  ),
  generateSchema(
    translations.measures.questions['9'].label,
    'radio',
    translations.measures.questions['9'].items,
    NINE_POINT_SCALE,
    {
      labelTop: false,
      labels: [{
          rating: 0,
          label: translations.measures.questions['9'].options.notAtAll
        },
        {
          rating: 3,
          label: translations.measures.questions['9'].options.aLittle
        },
        {
          rating: 5,
          label: translations.measures.questions['9'].options.moderately
        },
        {
          rating: 7,
          label: translations.measures.questions['9'].options.veryWell
        },
        {
          rating: 9,
          label: translations.measures.questions['9'].options.exactly
        }]
    }
  ),
  generateSchema(
    translations.measures.questions['10'].label,
    'radio',
    translations.measures.questions['10'].items,
    [
      translations.measures.questions['10'].options.disagreeStrongly,
      translations.measures.questions['10'].options.disagree,
      translations.measures.questions['10'].options.neutral,
      translations.measures.questions['10'].options.agree,
      translations.measures.questions['10'].options.agreeStrongly
    ],
    {labelTop: true}
  ),
  {
    question: translations.measures.questions['11'].label,
    type: 'radio-input',
    scale: [translations.measures.questions['11'].options.yes, translations.measures.questions['11'].options.no],
    items: {
      radio: {
        value: null
      },
      input: {
        description: translations.measures.questions['12'].label,
        value:null,
        optional:true
      }
    }
  },
  generateSchema(
    translations.measures.questions['13'].label,
    'radio',
    translations.measures.questions['13'].items,
    [
      translations.measures.questions['13'].options.disagreeStrongly,
      translations.measures.questions['13'].options.disagree,
      translations.measures.questions['13'].options.neutral,
      translations.measures.questions['13'].options.agree,
      translations.measures.questions['13'].options.agreeStrongly
    ],
    {labelTop: true}
  ),
  generateSchema(
    translations.measures.questions['14'].label,
    'radio',
    translations.measures.questions['14'].items,
    [
      translations.measures.questions['14'].options.disagreeStrongly,
      translations.measures.questions['14'].options.disagree,
      translations.measures.questions['14'].options.neutral,
      translations.measures.questions['14'].options.agree,
      translations.measures.questions['14'].options.agreeStrongly
    ],
    {labelTop: true}
  ),
  generateSchema(
    translations.measures.questions['15'].label,
    'radio',
    translations.measures.questions['15'].items,
    [
      translations.measures.questions['15'].options.disagreeStrongly,
      translations.measures.questions['15'].options.disagree,
      translations.measures.questions['15'].options.neutral,
      translations.measures.questions['15'].options.agree,
      translations.measures.questions['15'].options.agreeStrongly
    ],
    {labelTop: true}
  ),
  generateSchema(
    translations.measures.questions['16'].label,
    'radio',
    translations.measures.questions['16'].items,
    [
      translations.measures.questions['16'].options.notAtAll,
      translations.measures.questions['16'].options.aLittle,
      translations.measures.questions['16'].options.quiteaBit,
      translations.measures.questions['16'].options.completely
    ],
    {labelTop: true}
  ),
  {
    question: translations.measures.questions['17'].label,
    type: 'textarea',
    items: {
      input: {
        value:null
      }
    }
  }];

const Validations = buildValidations(generateValidators(questions));

export default ExpFrameBaseComponent.extend(Validations, {
    type: 'exp-rating-form',
    layout: layout,
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
                questions: {
                    default: questions
                }
            }
        }
    }
});
