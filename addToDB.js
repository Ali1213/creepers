const MongoClient = require('mongodb').MongoClient;
const config = require('./config.json');

let db;

const init = function () {
  if (db) {
    return Promise.resolve(db);
  }

  return new Promise((rs, rj) => {
    let connectStr;
    if(config.dbuser){
      var user = encodeURIComponent(config.dbuser);
      var password = encodeURIComponent(config.dbpassword);
      var authMechanism = 'DEFAULT';
      connectStr = `mongodb://${user}:${password}@${config.mongodb}?authMechanism=${authMechanism}`;
    }else{
      connectStr = `mongodb://${config.mongodb}`;
    }
    MongoClient.connect(connectStr, function(err, opendb){
      if(err){
        return rj(err);
      }
      db = opendb.db(config.dbname)
      rs(db);
    })
  });
};


module.exports = init;