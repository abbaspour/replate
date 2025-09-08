/**
 * @typedef {import('@auth0/actions/post-login/v3').Event} Event
 * @typedef {import('@auth0/actions/post-login/v3').PostLoginAPI} PostLoginAPI
 */

/*
 * modify claims for donor
 *
 * Author: Amin Abbaspour
 * Date: 2025-08-28
 *
 * @param {Event} event - Details about the context and user that is attempting to register.
 * @param {PostLoginAPI} api - Interface whose methods can be used to change the behavior of the signup.
 */

exports.onExecutePostLogin = async (event, api) => {
  const namespace = "https://replate.dev/";
  
  api.accessToken.setCustomClaim(`${namespace}donor`, true);
};