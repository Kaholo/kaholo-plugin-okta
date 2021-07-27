const parsers = require("./parsers");
const { getClient } = require("./helpers");

async function createSamlApp(action, settings){
    const client = getClient(settings);

    const { audienceURI, defRelayState, nameIdFormat, appUsername, 
            customRule, attributeStats, groups, users, label, recipient, 
            destination, resNotSigned, assertionNotSigned, sigAlgo, 
            digestAlgo, noHonorForceAuth, authContext, idpIssuer} = action.params;
    const ssoUrl = parsers.string(action.params.ssoUrl);

    if (!ssoUrl || !audienceURI || !label) {
        throw "One of the required parameters was not provided";
    }

    const request = {
        label,
        signOnMode: "SAML_2_0",
        visibility: {
            autoSubmitToolbar: false,
            hide: {
              iOS: false,
              web: false
            }
        },
        settings: {
            signOn: {
                ssoAcsUrl: ssoUrl,
                recipient: parsers.string(recipient) || ssoUrl, 
                destination: parsers.string(destination) || ssoUrl,
                audience: parsers.string(audienceURI),
                defaultRelayState: parsers.string(defRelayState) || "",
                subjectNameIdFormat: nameIdFormat || "urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress",
                subjectNameIdTemplate: !appUsername || appUsername == "None" ? "" :
                    appUsername == "Custom" && customRule ?  `$\{${customRule}\}` : 
                    `$\{user.${appUsername}\}`,
                attributeStatements: attributeStats || undefined,
                responseSigned: !parsers.boolean(resNotSigned),
                assertionSigned: !parsers.boolean(assertionNotSigned),
                signatureAlgorithm: sigAlgo || "RSA_SHA256",
                digestAlgorithm: digestAlgo || "SHA256",
                honorForceAuthn: !parsers.boolean(noHonorForceAuth),
                authnContextClassRef: authContext || "urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport",
                idpIssuer: idpIssuer || "http://www.okta.com/${org.externalKey}",
                slo: { enabled: false },
                requestCompressed: false,
                allowMultipleAcsEndpoints: false
            }
        }
    };
    const result = await client.createApplication(request);
    if (groups || users){
        try {
            action.params.apps = [result.id];
            await assignToApps(action, settings);
            return (await appAction(action, settings, "Get"))[0];
        }
        catch(err){
            await result.deactivate();
            await result.delete;
            throw err;
        }
    }
    return result;
}

async function appAction(action, settings, overrideAction){
    const client = getClient(settings);
    const { action: actionType } = action.params;
    const apps = parsers.autocompleteOrArray(action.params.apps);
    const promises = apps.map(app => {
        switch (overrideAction || actionType){
            case "Get":
                return client.getApplication(app);
            case "Delete":
                return  client.deactivateApplication(app).then(() =>
                        client.deleteApplication(app));
            case "Activate":
                return client.activateApplication(app);
            case "Deactivate":
                return client.deactivateApplication(app);
            default:
                throw "Unsupported Application Action Type!";
        };
    });
    return Promise.all(promises);
}

async function createUser(action, settings){
    const client = getClient(settings);
    const { firstName, lastName, email, login, mobilePhone, password, groups, apps} = action.params;
    const result = await client.createUser({
        profile: {
            firstName: parsers.string(firstName),
            lastName: parsers.string(lastName),
            email: parsers.string(email),
            login: parsers.string(login),
            mobilePhone: parsers.string(mobilePhone)
          },
          credentials: !password ? undefined : {
            password : { value: password }
          }
    });
    
    action.params.users = [result.id];
    if (groups){
        try {
            await addUsersToGroups(action, settings);
        }
        catch(err){
            await result.delete();
            throw err;
        }
    }
    if (apps){
        try {
            action.params.groups = undefined;
            await assignToApps(action, settings);
        }
        catch(err){
            await result.delete();
            throw err;
        }
    }
    if (apps || groups){
        try {
            return (await userAction(action, settings, "Get"))[0];
        }
        catch(err){}
    }
    return result;
}

async function userAction(action, settings, overrideAction){
    const client = getClient(settings);
    const { action: actionType } = action.params;
    const users = parsers.autocompleteOrArray(action.params.users);
    const promises = users.map(userId => {
        switch (overrideAction || actionType){
            case "Get":
                return client.getUser(userId);
            case "Delete":
                return client.getUser(userId).then(user => user.deactivate().then(() => user.delete()).then(() => ({msg: "user has been deleted", user})));
            case "Activate":
                return client.activateUser(userId);
            case "Deactivate":
                return client.deactivateUser(userId);
            default:
                throw "Unsupported User Action Type!";
        };
    });
    return Promise.all(promises);
}

async function createGroup(action, settings){
    const client = getClient(settings);
    const { name, description, users, apps } = action.params;
    const result = await client.createGroup({
        profile: {
            name: parsers.string(name),
            description: parsers.string(description)
        }
    })
    action.params.groups = [result.id];
    if (users){
        try {
            await addUsersToGroups(action, settings);
            
        }
        catch(err){
            await result.delete();
            throw err;
        }
    }
    if (apps){
        try {
            action.params.users = undefined;
            await assignToApps(action, settings);
        }
        catch(err){
            await result.delete();
            throw err;
        }
    }
    if (users || apps) {
        try {
            return (await groupAction(action, settings, "Get"))[0];
        }
        catch(err){}
    }
    return result;
}

async function groupAction(action, settings, overrideAction){
    const client = getClient(settings);
    const { action: actionType } = action.params;
    const groups = parsers.autocompleteOrArray(action.params.group);
    const promises = groups.map(group => {
        switch (overrideAction || actionType){
            case "Get":
                return client.getGroup(group);
            case "Delete":
                return client.deleteGroup(group);
            default:
                throw "Unsupported Group Action Type!";
        };
    });
    return Promise.all(promises);
}

async function addUsersToGroups(action, settings){
    const client = getClient(settings);
    const groups = parsers.autocompleteOrArray(action.params.groups);
	const users = parsers.autocompleteOrArray(action.params.users);
    if (groups.length == 0 || users.length == 0) throw "Required Parameters was not given";
    const promises = groups.map(groupId => users.map(userId => {
        return client.addUserToGroup(groupId, userId);
    })).flat();
    return Promise.all(promises);
}

async function assignToApps(action, settings){
    const client = getClient(settings);
    const apps = parsers.autocompleteOrArray(action.params.apps);
	const groups = parsers.autocompleteOrArray(action.params.groups);
	const users = parsers.autocompleteOrArray(action.params.users);
    if (apps.length == 0 || (groups.length == 0 && users.length == 0)){
        throw "One of the required Parameters was not given";
    } 
    let promises = apps.map(app =>
        groups.map(groupId => 
            client.createApplicationGroupAssignment(app, groupId)   
        ).concat(users.map(userId => 
            client.assignUserToApplication(app, {id: userId})
        ))
    );
    return Promise.all(promises);
}

async function getSystemLogs(action, settings){
    const client = getClient(settings);
    const since = parsers.autocomplete(action.params.since);
    const result = client.getLogs({since});
    const logs = [];
    await result.each(log => logs.push(log)); // retreive all logs before returning
    return logs;
}

async function createEventHook(action, settings){
    const client = getClient(settings);
    const { url, active, name } = action.params;
    const result = await client.createEventHook({
        activate: active || false,
        name: parsers.string(name),
        events: {
            type: "EVENT_TYPE",
            items: parsers.autocompleteOrArray(action.params.events)
        },
        channel: {
            type: "HTTP",
            version: "1.0.0",
            config: {
                uri: url,
                headers: parsers.object(action.params.headers) || {},
                authScheme: {
                    type: "HEADER",
                    key: "Authorization",
                    value: parsers.string(action.params.secret) || ""
                }
            }
        }
    });
    try {
        action.params.eventHook = result.id;
        await eventHookAction(action, settings, "Verify");
        return eventHookAction(action, settings, "Get");
    }
    catch (err){
        await eventHookAction(action, settings, "Delete");
        throw err;
    }
}

async function eventHookAction(action, settings, overrideAction){
    const client = getClient(settings);
    const { action: actionType } = action.params;
    const eventHook = parsers.autocomplete(action.params.eventHook);
    switch (overrideAction || actionType){
        case "Get":
            return client.getEventHook(eventHook);
        case "Delete":
            return  client.deactivateEventHook(eventHook).then(()=>
                    client.deleteEventHook(eventHook));
        case "Verify":
            return client.verifyEventHook(eventHook);
        case "Activate":
            return client.activateEventHook(eventHook);
        case "Deactivate":
            return client.deactivateEventHook(eventHook);
        default:
            throw "Unsupported Event Hook Action Type!";
    };
} 

module.exports = {
    createSamlApp,
	appAction,
	createUser,
	userAction,
	createGroup,
	groupAction,
	addUsersToGroups,
	assignToApps,
	getSystemLogs,
	createEventHook,
	eventHookAction,
// Autocomplete Functions
    ...require("./autocomplete")
}