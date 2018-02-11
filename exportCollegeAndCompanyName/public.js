
const MongoClient = require('mongodb').MongoClient;
const fs = require('fs');
const path = require('path');
const util = require('util');

const dbConfig = {
  testDB:{
    dbuser:"crm-test-170830",
    dbpassword:"qzpdvbdk3gwz3marpn",
    mongodb:"120.27.202.182:7777/crm-test-170830",
    name:'output',
    dbname: 'crm-test-170830',
  }
};
const dbcache = {};

const createDB = function (obj) {
  if (dbcache[obj.name]) {
    return Promise.resolve(dbcache[obj.name]);
  }
  return new Promise((rs, rj) => {
    let connectStr;
    if(obj.dbuser){
      var user = encodeURIComponent(obj.dbuser);
      var password = encodeURIComponent(obj.dbpassword);
      var authMechanism = 'DEFAULT';
      connectStr = `mongodb://${user}:${password}@${obj.mongodb}?authMechanism=${authMechanism}`;
    }else{
      connectStr = `mongodb://${obj.mongodb}`;
    }
    MongoClient.connect(connectStr, function(err, opendb){
      if(err){
        console.log(err);
        return rj(err);
      }
      db = opendb.db(obj.dbname)
      rs(db);
    })
  });
}


const createFind = (dbname)=>{
  return function(collectionName,condition={},options={}){
    return createDB(dbConfig[dbname]).then(db=>{
      return new Promise( rs => {
        db.collection(collectionName).find(condition,options).toArray(function(err, docs) {
          if(err){
            console.log('findError',err);
            // console.log(college);
            return rs(err);
          }
          // console.log("insertDB")
          rs(docs)
        });
      })
    });
  }
}

const writeFile = util.promisify(fs.writeFile);

module.exports = function(dbname='testDB'){
  return {
    find: createFind(dbname),
    writeFile,
    path,
  };
}