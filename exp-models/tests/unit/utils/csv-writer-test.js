import { NL, squash, uniqueFields, writeCSV} from 'exp-models/utils/csv-writer';
import { module, test, skip } from 'qunit';

module('Unit | Utility | csv writer');

const one = 'one';
const two = 'two';
const three = 'three';
const four = 'four';
const five = 'five';
const six = 'six';
const seven = 'seven';

test('squash', function(assert) {
    assert.deepEqual(
        squash({
            alpha: one,
            bravo: two,
            charlie: {
                delta: three
            },
            echo: {
                foxtrot: {
                    golf: four
                }
            },
            hotel: {
                india: five,
                juliet: {
                    kilo: six
                }
            },
            lima: {
                mike: {
                    november: {
                        oscar: {
                            papa: {
                                quebec: seven
                            }
                        }
                    }
                }
            }
        }),
        {
            alpha: one,
            bravo: two,
            'charlie.delta': three,
            'echo.foxtrot.golf': four,
            'hotel.india': five,
            'hotel.juliet.kilo': six,
            'lima.mike.november.oscar.papa.quebec': seven
        }
    );
});

test('squash with map', function(assert) {
    assert.deepEqual(
        [
            {
                alpha: one,
                bravo: {
                    charlie: one
                }
            },
            {
                alpha: two,
                bravo: {
                    charlie: two
                }
            },
            {
                alpha: three,
                bravo: {
                    charlie: three
                }
            }
        ].map(squash),
        [
            {
                alpha: one,
                'bravo.charlie': one
            },
            {
                alpha: two,
                'bravo.charlie': two
            },
            {
                alpha: three,
                'bravo.charlie': three
            }
        ]
    );
});

test('uniqueFields', function(assert) {
    assert.deepEqual(
        uniqueFields([
            {
                one
            },
            {
                one,
                two
            },
            {
                one,
                two,
                three
            }
        ]),
        [
            one,
            two,
            three
        ]
    );
});

test('writeCSV', function(assert) {
    const data = [
        {
            test1: one,
            test2: one
        },
        {
            test1: two,
            test2: two
        }
    ];

    assert.strictEqual(
        writeCSV(data, ['test1', 'test2']),
        [
            'test1,test2',
            '"one","one"',
            '"two","two"'
        ].join(NL)
    );
});

test('writeCSV with tabs', function(assert) {
    const data = [
        {
            test1: one,
            test2: one
        },
        {
            test1: two,
            test2: two
        }
    ];

    assert.strictEqual(
        writeCSV(data, ['test1', 'test2'], '\t'),
        [
            'test1\ttest2',
            '"one"\t"one"',
            '"two"\t"two"'
        ].join(NL)
    );
});

test('All together', function(assert) {
    const data = [
        {
            a: one,
            mic: {
                check: two
            }
        },
        {
            a: one,
            mic: {
                check: two
            }
        }
    ];

    const squashedData = data.map(squash);
    const fields = uniqueFields(squashedData);
    const result = writeCSV(squashedData, fields);

    assert.strictEqual(
        result,
        [
            'a,mic.check',
            '"one","two"',
            '"one","two"'
        ].join(NL)
    );
});

test('Varied fields', function(assert) {
    const data = [
        {
            alpha: one,
            bravo: {
                charlie: one
            }
        },
        {
            alpha: two,
            delta: {
                echo: two
            }
        },
        {
            alpha: three,
            foxtrot: three,
            golf: three
        }
    ];

    const squashedData = data.map(squash);
    const fields = uniqueFields(squashedData);
    const result = writeCSV(squashedData, fields);

    assert.strictEqual(
        result,
        [
            'alpha,bravo.charlie,delta.echo,foxtrot,golf',
            '"one","one",,,',
            '"two",,"two",,',
            '"three",,,"three","three"'
        ].join(NL)
    );
});

test('Columns with missing data', function(assert) {
    const fields = [
        'alpha',
        'bravo',
        'charlie'
    ];

    const data = [
        {
            alpha: one,
            bravo: one,
        },
        {
            bravo: two,
            charlie: two
        },
        {
            alpha: three,
            charlie: three
        }
    ];

    const result = writeCSV(data, fields);

    assert.strictEqual(
        result,
        [
            'alpha,bravo,charlie',
            '"one","one",',
            ',"two","two"',
            '"three",,"three"'
        ].join(NL)
    );
});

test('Columns with no data', function(assert) {
    const fields = [
        'alpha',
        'bravo',
        'yankee',
        'zulu',
        'charlie'
    ];

    const data = [
        {
            alpha: one,
            bravo: one,
            charlie: one
        },
        {
            alpha: two,
            bravo: two,
            charlie: two
        },
        {
            alpha: three,
            bravo: three,
            charlie: three
        }
    ];

    const squashedData = data.map(squash);
    const result = writeCSV(squashedData, fields);

    assert.strictEqual(
        result,
        [
            'alpha,bravo,yankee,zulu,charlie',
            '"one","one",,,"one"',
            '"two","two",,,"two"',
            '"three","three",,,"three"'
        ].join(NL)
    );
});

test('Multiple types of data', function(assert) {
    const fields = [
        'alpha',
        'bravo',
        'charlie',
        'delta',
        'echo',
        'foxtrot',
        'golf',
        'hotel',
        'juliet',
        'lima',
        'kilo'
    ];

    const data = [
        {
            alpha: 1,
            bravo: null,
            charlie: 'str'
        },
        {
            delta: {obj: 'val'},
            echo: ['a', 'b', 'c'],
            foxtrot: true,
            golf: false,
        },
        {
            hotel: undefined,
            juliet: +Infinity,
            lima: -Infinity,
            kilo: NaN
        }
    ];

    const result = writeCSV(data, fields);

    assert.strictEqual(
        result,
        [
            'alpha,bravo,charlie,delta,echo,foxtrot,golf,hotel,juliet,lima,kilo',
            '1,,"str",,,,,,,,',
            ',,,"{""obj"":""val""}","[""a"",""b"",""c""]",TRUE,FALSE,,,,',
            ',,,,,,,,Infinity,-Infinity,NaN'
        ].join(NL)
    );
});

// Skipping the rest until we find a better way to do benchmarking, the Ember way
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

skip('50k records', function(assert) {
    const data = [];
    const chars = 'abcdefghijklmnopqrstuvwxyz123456789';
    const charsMax = chars.length - 1;

    for (let i = 0; i < 50e3; i++) {
        const obj = data[i] = {};

        for (let j = 0; j < 100; j++) {
            const length = getRandomInt(1, 5);
            let key = '';

            for (let k = 0; k < length; k++) {
                key += chars[getRandomInt(0, charsMax)];
            }

            obj[key] = 'value';
        }
    }

    console.time('Unique Fields');
    uniqueFields(data);
    console.timeEnd('Unique Fields');

    assert.ok(true);
});
