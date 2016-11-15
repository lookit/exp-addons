import Ember from 'ember';

/**
 * @module exp-models
 * @submodule mixins
 */

/**
 * Add support for bulk operations, as defined by the (deprecated) JSONAPI Bulk Operations extension proposal
 *   https://github.com/json-api/json-api/blob/9c7a03dbc37f80f6ca81b16d444c960e96dd7a57/extensions/bulk/index.md
 *   https://github.com/CenterForOpenScience/jamdb/blob/master/features/document/create.feature#L167
 *
 * @class BulkAdapterMixin
 */
export default Ember.Mixin.create({
    ajaxOptions(_, __, options) {
        const ret = this._super(...arguments);
        if (options && options.isBulk) {
            ret.contentType = 'application/vnd.api+json; ext=bulk';
        }
        return ret;
    }
});
