import Ember from 'ember';

import DS from 'ember-data';

export default DS.Store.extend({

    _queryEverythingHelper(collectionName, dest, params, options, page=1) {
        // User-specified parameters override any other configuration passed in. For now, assume that all options are
        //   treated as query params; may not always be true.
        let queryParams = Object.assign({}, options, {page}, params);

        return this.query(collectionName, queryParams).then(res => {
            const theseResults = res.toArray();
            dest.push(...theseResults);
            // TODO: This is an imperfect means of identifying the last page, but JamDB doesn't tell us directly
            if (theseResults.length !== 0 && dest.length < res.get('meta.total')) {
                return this._queryEverythingHelper(collectionName, dest, params, options, page + 1);
            } else {
                return dest;
            }
        });
    },

    /**
     * Depaginate the API by performing a query that fetches all records
     * @method queryEverything
     *
     * @param {String} collectionName Name of the collection to query
     * @param {Object} params An object containing user-provided query parameters
     * @param {Object} options Recognized configuration options that control behavior, including `page` (start page) and `page[size]` (# results/page).
     *   For now options are all used as query params, but that may change.
     * @returns {Promise} A (chained) promise that will resolve to an array when all records have been fetched
     */
    queryEverything(collectionName, params, options={}) {
        const results = Ember.A();
        options = Object.assign({}, {'page[size]': 100}, options);
        return this._queryEverythingHelper(collectionName, results, params, options);
    }

});
