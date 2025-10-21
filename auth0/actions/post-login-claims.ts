import {Event, PostLoginAPI} from "@auth0/actions/post-login/v3";

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

    console.log(`event:${JSON.stringify(event)}`);

    const namespace = "https://replate.dev/";

    if(!event.organization) {
        api.accessToken.setCustomClaim(`${namespace}donor`, true);
        api.idToken.setCustomClaim(`${namespace}donor`, true);
    }

    if (event?.authorization?.roles.includes("Logistics Driver")) {
        api.accessToken.setCustomClaim(`${namespace}org_role`, 'driver');
        api.idToken.setCustomClaim(`${namespace}org_role`, 'driver');
    }

    if (event?.authorization?.roles.some(e => ["Supplier Member", "Community Member"].includes(e))) {
        api.accessToken.setCustomClaim(`${namespace}org_role`, 'member');
        api.idToken.setCustomClaim(`${namespace}org_role`, 'member');
    }

    if (event?.authorization?.roles.some(e => ["Supplier Admin", "Logistics Admin", "Community Admin"].includes(e))) {
        api.accessToken.setCustomClaim(`${namespace}org_role`, 'admin');
        api.idToken.setCustomClaim(`${namespace}org_role`, 'admin');
    }

};