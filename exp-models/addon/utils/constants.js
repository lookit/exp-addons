/*
Constants reused throughout the application
 */
import config from 'ember-get-config';


var permissionCreateForAccounts = {
    [`jam-${config.JAMDB.namespace}:accounts-*`] : 'CREATE'
};

export {permissionCreateForAccounts};
