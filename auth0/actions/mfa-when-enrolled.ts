import {Event, PostLoginAPI} from "@auth0/actions/post-login/v3";
const interactive_login = new RegExp('^oidc-');

/*
 * modify claims for donor
 *
 * Author: Amin Abbaspour
 * Date: 2025-08-28
 *
 * @param {Event} event - Details about the context and user that is attempting to register.
 * @param {PostLoginAPI} api - Interface whose methods can be used to change the behavior of the signup.
 */
exports.onExecutePostLogin = async (event: Event, api: PostLoginAPI) => {
    const protocol = event?.transaction?.protocol || 'unknown';

    if (!interactive_login.test(protocol)) {
        //console.log(`skipping mfa for ${protocol}`);
        return;
    }

    const canPromptMfa = event.user.enrolledFactors && event.user.enrolledFactors.length > 0;

    if(!canPromptMfa) {
        //console.log(`skipping mfa not enrooled for ${event.user.email}`);
        return;
    }
    const authenticationMethods = event.authentication?.methods || [];
    const hasDoneMfa = authenticationMethods.some(m => m.name === 'mfa');

    if(hasDoneMfa) {
        //console.log(`skipping mfa already done for ${event.user.email}`);
        return;
    }

    // @ts-ignore
    api.authentication.challengeWithAny(event.user.enrolledFactors);
}