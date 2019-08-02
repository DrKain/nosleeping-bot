var config      = require('config');
var Datastore   = require('nedb');
var users       = new Datastore(config.get('store.users'));

// Load users database first
users.loadDatabase(function(err){
    if(err){
        throw new Error(err);
    }
    // If no error, Initialize client
    require('./client')(users);
});