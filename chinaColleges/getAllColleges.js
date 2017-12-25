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
    MongoClient.connect(`mongodb://${config.mongodb}`, function(err, opendb){
      if(err){
        return rj(err);
      }
      db = opendb.db('test')
      // console.log(db.admin());
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
        console.log('requestData');
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
          return
        }
        // console.log(res)
        // console.log(222)
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

    let majorUrl = config.majorsUrl.replace(/specialty\d+/, `specialty${collegeId}`);
    console.log(`getCompanyMajorNaturlData${convertData[i].name}`);
    let tempdata = await getCompanyMajorNaturlData(majorUrl);
    await delay(20);

    console.log('handleCompanyMajor');
    let majors = handleCompanyMajor(tempdata);
    for (let [key, value] of majors.entries()) {
      console.log(`getMajorDescription${value.name}`);
      majors[key].description = await getMajorDescription(value.url);

      await delay(20);
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
  console.log(total);
  console.log(size);
  // console.log(total);
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
      // console.log(db.collection);
      db.collection(config.colleges.dbname).insert(college,(err,result)=>{
        if(err){
          console.log('insertError',err);
          console.log(college);
          return rs()
        }
        console.log("insertDB")
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
    console.log(allRequest);
    for (let requestUrl of allRequest) {
      let colleges = await getCollegeData(requestUrl);
      console.log(requestUrl);
      console.log(allRequest.length);
      // let PromiseAll = Promise.all(colleges.map(item => insertDB(item)));
      for(let college of colleges){
        await insertDB(college);
      }
    }
  }catch(e){
    console.log(e);
  }
}

module.exports = run;

// mongoose.connect(`mongodb://${config.mongodb}`);