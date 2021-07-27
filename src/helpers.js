const okta = require('@okta/okta-sdk-nodejs');

/***
 * @returns {okta.Client} Okta Client
 ***/
function getClient(settings){
    const {orgUrl, token} = settings;
    if (!orgUrl || !token) throw "One of the settings was not provided!";
    return new okta.Client({orgUrl, token});
}

module.exports = {
    getClient
}