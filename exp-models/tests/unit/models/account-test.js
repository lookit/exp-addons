import {
    moduleForModel, test
}
from 'ember-qunit';

moduleForModel('account', 'Unit | Model | account', {
    // Specify the other units that are required for this test.
    needs: []
});

test('#profileById', function(assert) {
    let account = this.subject({
        username: 'tester',
        password: 'password',
        profiles: [
            {

            }
        ]
    });
});
