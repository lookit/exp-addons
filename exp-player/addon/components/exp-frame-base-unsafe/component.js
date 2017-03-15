import ExpFrameBaseComponent from '../../components/exp-frame-base/component';

/**
 * @module exp-player
 * @submodule frames
 */

/**
 * A modified version of the base frame, specifically designed to allow "unsafe" saves and let the user
 *   advance even if data from this frame did not save
 *
 * The primary use case for this component is experiments that need to move through a series of frames without leaving
 * fullscreen mode: if next is fired as a promise, it does not count as a user interaction event
 *  https://openscience.atlassian.net/browse/LEI-369?focusedCommentId=46133&page=com.atlassian.jira.plugin.system.issuetabpanels%3Acomment-tabpanel#comment-46133
 *
  * This frame has no configuration options because all of its logic is internal, and is almost never directly used
 *   in an experiment. It exports no data. Sample experiment definition usage (provided for completeness):
 ```json
 "frames": {
       "my-sample-frame": {
         "kind": "exp-base-frame-unsafe"
       }
    }
 * ```
 *
 *
 *  @class ExpFrameBaseUnsafe
 *  @extends ExpFrameBase
 */
export default ExpFrameBaseComponent.extend({
    actions: {
        save() {
            this._save();
        },

        next() {
            this.send('save');
            this.sendAction('next');
            window.scrollTo(0, 0);
        }
    }
});
