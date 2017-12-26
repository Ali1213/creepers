
const MongoClient = require('mongodb').MongoClient;

let dbcache = {};

const dbConfig = {
  inputDB:{
    mongodb:"127.0.0.1:27017/test",
    name:'input',
    dbname: 'test',
  },
  outputDB:{
    dbuser:"crm-test-170830",
    dbpassword:"qzpdvbdk3gwz3marpn",
    mongodb:"120.27.202.182:7777/crm-test-170830",
    name:'output',
    dbname: 'crm-test-170830',
  }
};

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
        return rj(err);
      }
      db = opendb.db(obj.dbname)
      rs(db);
    })
  });
}

const find = function(collectionName,condition,options={}){
  return createDB(dbConfig.inputDB).then(db=>{
    return new Promise( rs => {
      db.collection(collectionName).find(condition,options).toArray(function(err, docs) {
        if(err){
          // console.log('insertError',err);
          // console.log(college);
          return rs(err);
        }
        // console.log("insertDB")
        rs(docs)
      });
    })
  });
}

//模拟一个meteor的ID
const RandomID = function(len = 17){
  let str = '1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let slen = str.length;
  let r = [];
  for(let i =0 ;i<len;i++){
    r.push( str[Math.floor(Math.random()*slen)]);
  }
  return r.join('');
}

const insertMany = function(collectionName,docs,options={}){
  return createDB(dbConfig.outputDB).then(db=>{
    return new Promise( rs => {
      db.collection(collectionName).insertMany(docs,options,(err,result)=>{
        if(err){
          console.log('insertError',err);
          // console.log(college);
          return rs(err);
        }
        // console.log("insertDB")
        rs(result)
      })
    });
  });
}


const transform = async function(collection){
  let results = await find(collection)

  results = results.map(item => {
    item._id = RandomID();
    return item;
  })

  await insertMany(collection,results);
}

const all = async function(collections){
  let clts;
  if(typeof collections === 'string'){
    clts = [collections];
  }else if(Array.isArray(collections)){
    clts = collections;
  }else{
    throw new Error('collections');
  }

  for(let collection of clts){
    transform(collection);
  }
  console.log('done');
}

all(["ResumeJobTitles"]).catch(e=>console.log(e));