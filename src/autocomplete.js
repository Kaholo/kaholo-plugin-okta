const parsers = require("./parsers");
const { getClient } = require("./helpers");
const { eventTypes } = require("./eventTypes.json");

// auto complete helper methods

const MAX_RESULTS = 10;

function mapAutoParams(autoParams){
  const params = {};
  autoParams.forEach(param => {
    params[param.name] = parsers.autocomplete(param.value);
  });
  return params;
}

/***
 * @returns {Promise<[{id, value}]>} filtered result items
 ***/
async function handleResult(result, query, getName){
  const items = [];
  try {
    await result.each(item => {
      if (!query && items.length >= MAX_RESULTS) return;
      item.val =  getName       ? getName(item) :
                  item.name || (item.profile  ? (
                    item.profile.name || item.profile.displayName
                  ) : item.id);
      items.push({
        id:     item.id || item.val, 
        value:  item.val
      });
    });
  } catch (err) {}
  return filterItems(items, query);
}

async function filterItems(items, query){
  if (query){
    const qWords = query.split(/[. ]/g).map(word => word.toLowerCase()); // split by '.' or ' ' and make lower case
    items = items.filter(item => qWords.every(word => item.value.toLowerCase().includes(word)));
    items = items.sort((word1, word2) => word1.value.toLowerCase().indexOf(qWords[0]) - word2.value.toLowerCase().indexOf(qWords[0]));
  }
  return items.splice(0, MAX_RESULTS);
}

// auto complete main methods
async function listGroups(query, pluginSettings){
  const settings = mapAutoParams(pluginSettings); 
  const client = getClient(settings);
  const result = client.listGroups();
  return handleResult(result, query);
}

async function listUsers(query, pluginSettings){
  const settings = mapAutoParams(pluginSettings); 
  const client = getClient(settings);
  const result = client.listUsers();
  return handleResult(result, query, user=>
    user.profile.displayName || `${user.profile.firstName} ${user.profile.lastName}`);
}

async function listApps(query, pluginSettings){
  const settings = mapAutoParams(pluginSettings); 
  const client = getClient(settings);
  const result = client.listApplications();
  return handleResult(result, query);
}

async function listEventHooks(query, pluginSettings){
  const settings = mapAutoParams(pluginSettings); 
  const client = getClient(settings);
  const result = client.listEventHooks();
  return handleResult(result, query);
}

async function getDateTime(query, pluginSettings, pluginActionParams){
  const params = mapAutoParams(pluginActionParams);
  query = query || params.since;
  let queryTime = new Date().toISOString();
  if (query){
    try {
      queryTime = new Date(query).toISOString();;
    } catch (err) {}
  }
  return [{id: queryTime, value: queryTime}];
}

function listEventTypes(query){
  const items = eventTypes.map(item => ({id: item, value: item}));
  return filterItems(items, query);
}

module.exports = {
  listGroups,
	listUsers,
	listApps,
	listEventTypes,
	listEventHooks,
	getDateTime
}