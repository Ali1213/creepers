
const request = require('superagent');
const createDB = require('./addToDB');

const requestHTML = function(remoteUrl){
  return new Promise((rs, rj) => {
    request
      .get(remoteUrl)
      .accept('text/html,application/xhtml+xml,application/xml')
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




module.exports = {
  sleep,
  requestHTML,
  insertToDB,
}