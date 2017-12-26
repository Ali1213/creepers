const config = require('../config.json');
const request = require('superagent');
const axios = require('axios');
const fs = require('fs');
const cheerio = require('cheerio');

const jsonp = require('superagent-jsonp');
const MongoClient = require('mongodb').MongoClient;

let db;

const createDB = function () {
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
  }).catch(e=> console.log(e));
}

// db = createDB();

const requestData = function (url) {
  return new Promise((rs, rj) => {
    request
      .get(url)
      .set('User-Agent', 'User-Agent:Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36')
      .end((err, res) => {
        if (err) {
          console.log(err);
          return rj(err);
        }
        rs(JSON.parse(res.text.slice(41, -2)));
      });
  });
}

const delay = function (millisecond = 2000) {
  return new Promise(rs => {
    setTimeout(() => rs(), millisecond)
  });
}

const handleCompanyMajor = function (html) {
  const $ = cheerio.load(html);
  let majors = $(".content ul.li-major li a");
  let result = [];
  for (let i = 0; i < majors.length; i++) {
    result.push({
      name: majors.eq(i).text().trim(),
      url: config.domain + majors.eq(i).attr('href').trim()
    })
  }
  return result;
}

const getCompanyMajorNaturlData = function (url) {
  return new Promise((rs, rj) => {
    request
      .get(url)
      .accept('text/html,application/xhtml+xml,application/xml')
      .set('User-Agent', 'User-Agent:Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36')
      .end((err, res) => {
        if (err) {
          console.log(err);
          rj(err);
          return
        }
        rs(res.text);
      });
  });
}

const getMajorDescription = function (url) {
  return new Promise((rs, rj) => {
    request
      .get(url)
      .accept('text/html,application/xhtml+xml,application/xml')
      .set('User-Agent', 'User-Agent:Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36')
      .end((err, res) => {
        if (err) {
          console.log(err);
          rj(err);
          return
        }
        try {
          const $ = cheerio.load(res.text);
          let description = $(".content").text().trim();
          rs(description)
        } catch (e) {
          console.log(e);
          rj(e);
        }
      });
  });
};

const existData = function(collegeId){
  return createDB().then(db=>{
    return new Promise((rs,rj)=>{
      db.collection(config.colleges.dbname).findOne({collegeId:collegeId},(err,result)=>{
        if(err){
          return rs(false);
        }
        rs(result ? true:false)
      })
    });
  });
}

const getCollegeData = async function (collegeUrl) {
  let data = await requestData(collegeUrl);
  let convertData = dataConvert(data);

  for (let i = 0; i < convertData.length; i++) {
    let collegeId = convertData[i].collegeId;

    //check DB has this Data
    let exist = await existData(collegeId);
    if(exist){
      convertData[i]['DELETE'] = true;
      continue;
    }

    let repeatTime = 0;
    async function getMajors(collegeId){
      let majorUrl = config.majorsUrl.replace(/specialty\d+/, `specialty${collegeId}`);
      let tempdata = await getCompanyMajorNaturlData(majorUrl);
      await delay(20+Math.floor(Math.random()*5));
      let majors = handleCompanyMajor(tempdata);

      if(majors.length === 0 && repeatTime < 5){
        console.log(` ${convertData[i].name}'s major the ${repeatTime} time is not found`)
        repeatTime++;
        await delay(5000);
        majors = await getMajors(collegeId);
      }else{
        repeatTime = 0;
      }
      return majors;
    }

    let majors = await getMajors(collegeId);

    for (let [key, value] of majors.entries()) {
      majors[key].description = await getMajorDescription(value.url);
      console.log(`${value.name} is finding`)
      delete majors[key].url;
      await delay(20+Math.floor(Math.random()*5));
    }
    convertData[i].majors = majors;
  }
  return convertData.filter(item => !item.DELETE);
}

//转换每一个数据结构
const eachDataConvert = function (obj) {
  let newObj = {
    name: obj.schoolname,
    oldName: obj.oldname,
    domain: obj.guanwang,
    description: obj.jianjie,
    membership: obj.membership,
    country: config.country,
    region: obj.province,
    category: obj.schooltype,
    attentionRankName: config.attentionRankName,
    attentionRank: obj.ranking,
    categoryRankName: obj.schoolproperty,
    categoryRank: obj.rankingCollegetype,
    tags: [],
    majors: [],
    collegeId: obj.schoolid,
    code: obj.schoolcode,
  }

  if (obj['f985'] === '1') {
    newObj.tags.push('985');
  }
  if (obj['f211'] === '1') {
    newObj.tags.push('211');
  }
  if (obj['autonomyrs'] === '1') {
    newObj.tags.push('自主招生试点');
  }

  return newObj;
}

const dataConvert = function (data) {
  let { school, totalRecord: total } = data;
  let result = [];
  for (let i = 0; i < school.length; i++) {
    result.push(eachDataConvert(school[i]));
  }
  return result;
}


const getTotal = function (url) {
  return requestData(url).then(result => result.totalRecord.num - 0);
}

const getAllUrl = function (url, total) {
  let all = [];
  let size = /\&size=(\d+)/.exec(url)[1];
  // let size = /\&size=(\d+)/.exec();
  let len = Math.ceil(total / size);
  let page = 1;

  while (page <= len) {
    all.push(url.replace(/page=\d+/g,`page=${page}`));
    page++;
  }

  return all;
}

const insertDB = function(college){
  return createDB().then( db => {
    return new Promise((rs,rj)=>{
      db.collection(config.colleges.dbname).insert(college,(err,result)=>{
        if(err){
          console.log('insertError',err);
          console.log(college);
          return rs()
        }
        rs()
      })
    });
  }) 
}

// insertDB({aaa:111})


const run = async function () {
  try{
    let url = config.collegesUrl;
    let total = await getTotal(url);
    let allRequest = getAllUrl(url,total);
    for (let requestUrl of allRequest) {
      console.log(requestUrl);
      let colleges = await getCollegeData(requestUrl);
      // let PromiseAll = Promise.all(colleges.map(item => insertDB(item)));
      for(let college of colleges){
        await insertDB(college);
      }
    }
    console.log('done');
  }catch(e){
    console.log(e);
  }
}

module.exports = run;

// mongoose.connect(`mongodb://${config.mongodb}`);