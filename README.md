# kaholo-plugin-okta
Kaholo plugin for integration with Okta API.

## Settings
1. Okta Org URL (String) **Required** - The URL of the Okta Org to make all requests to. For example **https://example.okta.com/** .
2. API Token (Vault) **Required** - Okta admin API token used to authenticate.

## Method: Create SAML 2.0 Application
Creates a new SAML 2.0 Application.

### Parameters
1. App Label (String) **Required** - The label of the new app.
2. Single Sign On(SSO) URL (String) **Required** - The Single Sign-On URL for SAML.
3. Recipient URL (String) **Optional** - The location where the app may present the SAML assertion. **Default value is the SSO URL.**
4. Destination URL (String) **Optional** - Identifies the location where the SAML response is intended to be sent inside of the SAML assertion. **Default value is the SSO URL.**
5. Audience URI (SP Entity ID) (String) **Required** - The Audience URI (SP Entity ID) for SAML.
6. Default RelayState (String) **Optional** - Identifies a specific application resource in an IDP-initiated SSO scenario.
7. Name ID Format (Options) **Optional** - Identifies the SAML processing rules. Possible values: **Unspecified | EmailAddress | x509SubjectName | Persistent | Transient**.
Default value is EmailAddress.
8. Application Username (Options) **Optional** - Template for app user's username when a user is assigned to the app. Possible values: **None | Okta Username | Email | Custom**.
Default value is None.
9. Custom Username Rule (String) **Optional** - In case Custom Application Username was selected, specify the custom rule for the username here.
10. Attribute Statements (Array of Objects) **Optional** - Specifies optional attribute statements for a SAML application. Check [this documentation](https://developer.okta.com/docs/reference/api/apps/#attribute-statements-object) to see the format of the object to provide, or the [SAML Technical Overview](http://docs.oasis-open.org/security/saml/Post2.0/sstc-saml-tech-overview-2.0-cd-02.html) for more info on SAML attributes.
11. Assigned Groups (Autocomplete/Array) **Optional** - If specified, assign the specified groups to this application. Can be provided either as a single group chosen from Autocomplete dropdown menu, or passed as an array of the groups IDs from code.
12. Assigned Users (Autocomplete/Array) **Optional** - If specified, assign the specified users to this application. Can be provided either as a single user chosen from Autocomplete dropdown menu, or passed as an array of the users IDs from code.
#### Advanced Parameters
13. Response Not Signed (Boolean) **Optional** - Determines whether the SAML authentication response message is digitally signed by the IDP or not. Please Notice Default value is false which means **on default, the response is signed**.
14. Assertion Not Signed (Boolean) **Optional** - 	Determines whether the SAML assertion is digitally signed or not. Please Notice Default value is false which means **on default, the assertion is signed**.
15. Signature Algorithm (Options) **Optional** - Determines the signing algorithm used to digitally sign the SAML assertion and response. Possible values: **RSA-SHA256 | RSA-SHA1**.
Default value is RSA-SHA256.
16. Digest Algorithm (Options) **Optional** - Determines the digest algorithm used to digitally sign the SAML assertion and response. Possible values: **SHA256 | SHA1**.
Default value is SHA256.
17. No Honor Force Authentication (Boolean) **Optional** - If true, don't prompt user to re-authenticate if SP asks for it. If false, prompt user to re-authenticate.
18. Authentication Context Class (Options) **Optional** - Identifies the SAML authentication context class for the assertion's authentication statement. Possible values: **PasswordProtectedTransport | Integrated Windows Authentication | Kerberos | Password | TLS Client | Unspecified | X509 Certificate**.
Default value is PasswordProtectedTransport.
19. SAML Issuer ID (String) **Optional** - Issuer ID for SAML. Default value is http://www.okta.com/${org.externalKey}.

## Method: Application Action
Run the specified action on the specified application(s).

### Parameters
1. Applications (Autocomplete/Array) **Required** - The application(s) to run the action on. Can be provided either as a single application chosen from Autocomplete dropdown menu, or passed as an array of the applications IDs from code.
2. Action (Options) **Required** - The action to run on the specified application(s). Possible values: **Get | Activate | Deactivate | Delete**.

## Method: Create User
Create a new User. If specified, assign to the specified groups or applications.

### Parameters
1. First Name (String) **Required** - The first name of the user. 
2. Last Name (String) **Required** - The last name of the user.
3. Email (String) **Required** - The main email address of the user.
4. Login (String) **Required** - The user's login username. Usually the same as email, but depands on your organization's Okta settings.
5. Mobile Phone (String) **Optional** - The mobile phone of the username.
6. Password (Vault) **Optional** - If specified, create the new user with the specified password. Otherwise prompt him to provide on next login.
7. Assigned Groups (Autocomplete/Array) **Optional** - If specified, assign this user to the specified groups. Can be provided either as a single group chosen from Autocomplete dropdown menu, or passed as an array of the groups IDs from code.
8. Assigned Applications (Autocomplete/Array) **Optional** - If specified, assign this user to the specified applications. Can be provided either as a single application chosen from Autocomplete dropdown menu, or passed as an array of the applications IDs from code.

## Method: User Action
Run the specified action on the specified user(s).

### Parameters
1. Users (Autocomplete/Array) **Required** - The user(s) to run the action on. Can be provided either as a single user chosen from Autocomplete dropdown menu, or passed as an array of the users IDs from code.
2. Action (Options) **Required** - The action to run on the specified user(s). Possible values: **Get | Activate | Deactivate | Delete**

## Method: Create Group
Create a new group.

### Parameters
1. Name (String) **Required** - The name of the new group.
2. Description (Text) **Optional** - Description of the new group.
3. Assigned Users (Autocomplete/Array) **Optional** - If specified, assign the specified users to this group. Can be provided either as a single user chosen from Autocomplete dropdown menu, or passed as an array of the users IDs from code.
4. Assigned Applications (Autocomplete/Array) **Optional** - If specified, assign this group to the specified applications. Can be provided either as a single application chosen from Autocomplete dropdown menu, or passed as an array of the applications IDs from code.

## Method: Group Action
Run the specified action on the specified group(s).

### Parameters
1. Groups (Autocomplete/Array) **Required** - The group(s) to run the action on. Can be provided either as a single group chosen from Autocomplete dropdown menu, or passed as an array of the groups IDs from code.
2. Action (Options) **Required** - Possible values: **Get | Delete**.

## Method: Add Users To Groups
Adds the specified user(s) to the specified group(s).

### Parameters
1. Groups (Autocomplete/Array) **Required** - The group(s) to assign all specified users to. Can be provided either as a single group chosen from Autocomplete dropdown menu, or passed as an array of the groups IDs from code.
2. Users (Autocomplete/Array) **Required** - The user(s) to assign to all the specified users. Can be provided either as a single user chosen from Autocomplete dropdown menu, or passed as an array of the users IDs from code.

## Method: Assign Users/Groups To Applications
Assign the specified users and groups to the specified application.

### Parameters
1. Applications (Autocomplete) **Required** - The application(s) to assign the users or groups to. Can be provided either as a single application chosen from Autocomplete dropdown menu, or passed as an array of the applications IDs from code.
2. Groups (Autocomplete/Array) **Optional** - If specified, assign the provided group(s) to the specified application. Can be provided either as a single group chosen from Autocomplete dropdown menu, or passed as an array of the groups IDs from code.
3. Users (Autocomplete/Array) **Optional** - If specified, assign the provided user(s) to the specified applications. Can be provided either as a single user chosen from Autocomplete dropdown menu, or passed as an array of the users IDs from code.

## Method: Get System Logs
Get Okta system logs since the date and time specified, until now.

### Parameters
1. Since (Autocomplete) **Required** - The date and time to get the logs from.

## Method: Create Event Hook
Creates a new event hook for the specified webhook, and sends a new

### Parameters
1. Events (Autocomplete/Array) **Required** - The events to send to the specified webhook. Can be provided either as a single events chosen from Autocomplete dropdown menu, or passed as an array of events from code.
2. Event Hook Name (String) **Required** - The name of the new event hook.
3. Webhook URL (String) **Required** - The URL of the webhook to send all the events data to.
4. Secret (Vault) **Optional** - The value to attach as the token for the HTTP authorazation header in the requests sent to the webhook. If not specified, uses API token.
5. HTTP Headers (Text/Object) **Optional** - If specified, attach the specified headers to requests sent to the webhook. Can be passed either as key=value pairs, each header seperated with a new line, or as an object from code.
6. Active (Boolean) **Optional** - If specified, activate the new event hook.
7. Verify (Boolean) **Optional** - If specified, also send a verify event hook request after creating the hook.
8. Delete Unverified (Boolean) **Optional** - **Only relevant if checked 'Verify' Parameter.** If specified, and the event hook wasn't verified successfully, than delete the new event hook.

## Method: Event Hook Action
Runs the specified action on the specified event hook.

### Parameters
1. Event Hook (Autocomplete) **Required** - The event hook to run the specified action on.
2. Action (Options) **Required** - The action to run on the specified event. Possible values: **Get | Activate | Deactivate | Verify | Delete**

