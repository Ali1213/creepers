const MongoClient = require('mongodb').MongoClient;
const config = require('./config.json');

let db;

const init = function () {
  if (db) {
    return Promise.resolve(db);
  }

  return new Promise((rs, rj) => {
    MongoClient.connect(`mongodb://${config.mongodb}`, function(err, opendb){
      if(err){
        return rj(err);
      }
      db = opendb.db(config.dbname)
      // console.log(db.admin());
      rs(db);
    })
  }).catch(e=> console.log(e));
}


module.exports = init;