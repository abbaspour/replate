import {Event, PostLoginAPI} from "@auth0/actions/post-login/v3";

/**
 * renders a privacy policy form
 *
 * @param {Event} event - Details about the user and the context in which they are logging in.
 * @param {PostLoginAPI} api - Interface whose methods can be used to change the behavior of the login.
 * @returns {Promise<void>}
 */
exports.onExecutePostLogin = async (event: Event, api: PostLoginAPI) => {

    if (event.organization) {   // business login
        return;
    }

    const {user} = event;

    // Check if the user has consent required
    const consentRequired = user.app_metadata?.consent_required === true;

    if (consentRequired) {
        // Get form ID from secret
        const formId = event.secrets.PRIVACY_POLICY_FORM_ID;

        if (!formId) {
            console.error('PRIVACY_POLICY_FORM_ID secret not configured');
            return;
        }

        // Render the privacy policy form
        api.prompt.render(formId);
    }
};

// noinspection JSUnusedLocalSymbols
/**
 * Handler that will be invoked when this action is resuming after an external redirect. If your
 * onExecutePostLogin function does not perform a redirect, this function can be safely ignored.
 *
 * @param {Event} event - Details about the user and the context in which they are logging in.
 * @param {PostLoginAPI} api - Interface whose methods can be used to change the behavior of the login.
 */
exports.onContinuePostLogin = async (event: Event, api: PostLoginAPI) => {
};
