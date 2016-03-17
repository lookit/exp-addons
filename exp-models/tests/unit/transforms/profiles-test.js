import {
    moduleFor, test
}
from 'ember-qunit';

moduleFor('transform:profiles', 'Unit | Transform | profiles', {
    // Specify the other units that are required for this test.
    needs: ['store']
});


test('it exists', function(assert) {
    let serializer = this.subject();

    var store = this.container.lookup('store');
    var account = store.createRecord('account', {
        username: 'tester',
        password: 'password',
        profiles: [
            {
                profileId: 'prof1',
                firstName: 'Foo',
                birthday: '12-12-2012'
            },
            {
                profileId: 'prof2',
                firstName: 'Bar',
                birthday: '11-11-2011'
            }
        ]
    });

    var serialized = serializer.serialize(account);
    debugger;
});
