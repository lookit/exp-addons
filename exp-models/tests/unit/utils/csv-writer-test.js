import { NL, squash, uniqueFields, writeCSV} from 'exp-models/utils/csv-writer';
import { module, test } from 'qunit';

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
            test: one
        },
        {
            test: two
        }
    ];

    assert.strictEqual(
        writeCSV(data, ['test']),
        `test${NL}"one"${NL}"two"`
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
        `a,mic.check${NL}"one","two"${NL}"one","two"`
    );
});
