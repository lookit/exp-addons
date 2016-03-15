import ApplicationAdapter from './application';

export default ApplicationAdapter.extend({
    // TODO: What is the endpoint to find a list of all collections?
    findRecordUrlTemplate: '{+host}/v1/id/collections/{+namespaceId}.{+id}',
    createRecordUrlTemplate: '{+host}/{+namespace}/namespaces/{+namespaceId}/collections'
});
