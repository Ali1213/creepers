
const request = require('superagent');
const createDB = require('./addToDB');
const util = require('util');
const fs = require('fs');

const requestHTML = function(remoteUrl){
  return new Promise((rs, rj) => {
    request
      .get(remoteUrl)
      .accept('text/html,application/xhtml+xml,application/xml')
      .timeout({
        deadline: 20000, // but allow 1 minute for the file to finish loading.
      })
      .retry(20)
      .set('User-Agent', 'User-Agent:Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36')
      .end((err, res) => {
        if (err) {
          console.log(err);
          return rj(err);
        }
        rs(res.text);
      });
  });
}

const requestHttpsHTML = function(){

}


const sleep = function(milliseconds = 2000){
  return new Promise(rs =>{
    setTimeout(rs,milliseconds)
  })
}

const insertToDB = function(collegeName,doc){
  return createDB().then(db => {
    return new Promise((rs,rj)=>{
      // console.log(db.collection);
      db.collection(collegeName).insert(doc,(err,result)=>{
        if(err){
          console.log('insertError',err);
          return rj(err)
        }
        rs()
      })
    });
  })
}

const hasInDB = function(collectionName,condition){
  return createDB().then(db=>{
    return new Promise( rs => {
      db.collection(collectionName).findOne(condition,(err,result)=>{
        if(err){
          // console.log('insertError',err);
          // console.log(college);
          return rs(false);
        }
        // console.log("insertDB")
        rs(result ? true:false)
      })
    });
  });
}

const findOneDB = function(collectionName,condition,options={}){
  return createDB().then(db=>{
    return new Promise( (rs,rj) => {
      db.collection(collectionName).findOne(condition,options,(err,result)=>{
        if(err){
          // console.log('insertError',err);
          // console.log(college);
          return rj(err);
        }
        // console.log("insertDB")
        rs(result)
      })
    });
  });
}

const findDB = function(collectionName,condition,options={}){
  return createDB().then(db=>{
    return new Promise( (rs,rj) => {
      db.collection(collectionName).find(condition,options).toArray((err,results)=>{
        if(err){
          // console.log('insertError',err);
          // console.log(college);
          return rj(err);
        }
        // console.log("insertDB")
        rs(results)
      })
    });
  });
}

const findOneAndUpdateDB = function(collectionName,filter,update,options={}){
  return createDB().then(db=>{
    return new Promise( (rs,rj) => {
      db.collection(collectionName).findOneAndUpdate(filter,update,options,(err,result)=>{
        if(err){
          // console.log('insertError',err);
          // console.log(college);
          return rj(err);
        }
        // console.log("insertDB")
        rs(result)
      })
    });
  });
}

const updateOneDB = function(collectionName,filter,update,options={}){
  return createDB().then(db=>{
    return new Promise( (rs,rj) => {
      db.collection(collectionName).updateOne(filter,update,options,(err,result)=>{
        if(err){
          // console.log('insertError',err);
          // console.log(college);
          return rj(err);
        }
        // console.log("insertDB")
        rs(result)
      })
    });
  });
}

const insertMany = function(collectionName,docs,options={}){
  return createDB().then(db=>{
    return new Promise( (rs,rj) => {
      db.collection(collectionName).insertMany(docs,options,(err,result)=>{
        if(err){
          // console.log('insertError',err);
          // console.log(college);
          return rj(err);
        }
        // console.log("insertDB")
        rs(result)
      })
    });
  });
}

const dropCollection = function(collectionName){
  return createDB().then(db=>{
    return new Promise( (rs,rj) => {
      db.collection(collectionName).drop((err,result)=>{
        if(err){
          // console.log('insertError',err);
          // console.log(college);
          return rj(err);
        }
        // console.log("insertDB")
        rs(result)
      })
    });
  });
}

const appendFile = function(filepath,data,options){
  const append = util.promisify(fs.appendFile, fs);
  return append(filepath,data,options)
}



// const updateOneDB = function(collectionName,condition,update,options={}){
//   return createDB().then(db=>{
//     return new Promise( (rs,rj) => {
//       db.collection(collectionName).find(condition,update,options,(err,results)=>{
//         if(err){
//           // console.log('insertError',err);
//           // console.log(college);
//           return rj(err);
//         }
//         // console.log("insertDB")
//         rs(results)
//       })
//     });
//   });
// }

module.exports = {
  sleep,
  requestHTML,
  insertToDB,
  hasInDB,
  findDB,
  findOneDB,
  findOneAndUpdateDB,
  updateOneDB,
  insertMany,
  appendFile,
  dropCollection,
  // updateOneDB,
}