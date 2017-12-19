const createDB = require('../addToDB');
const config = require('../config.json');
const request = require('superagent');
const cheerio = require('cheerio');

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

const getTotal = function (url) {
  return requestData(url).then(result => result.totalRecord.num - 0);
}

const getAllUrlByTotal = function (url, total) {
  let all = [];
  console.log(url);
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

const getAllUrl = async function(url){
  const total = await getTotal(url);
  return getAllUrlByTotal(url, total);
}

const majorsDataHandle = function(data){
  return {
    name:data.specialname.trim(),
    code:data.code,
    category:data.zytype,
    level:data.zycengci,
    _url:config.domain + data.specialurl
  }
}


const getText = function (url) {
  return new Promise((rs, rj) => {
    request
      .get(url)
      .accept('text/html,application/xhtml+xml,application/xml')
      .set('User-Agent', 'User-Agent:Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36')
      .end((err, res) => {
        if (err) {
          console.log("=========")
          console.log(err);
          return
        }
        // console.log(res)
        // console.log(222)
        rs(res.text);
      });
  });
}

//拿到专业介绍
const getMajorIntroduce = function(introduceUrl){
  return getText(introduceUrl)
          .then((html)=>{
            return new Promise((rs,rj)=>{
              try{
                const $ = cheerio.load(html);
                let introduce = $(".li-majorMess").text().trim;
                rs(introduce);
              }catch(e){
                console.log(e);
                rs('');
              }
            })
          });
}


const sleep = function (millisecond = 2000) {
  return new Promise(rs => {
    setTimeout(() => rs(), millisecond)
  });
}

const getRelateSchoolInfo = async function(majorName){
  let mainUrl = encodeURI(config.MajorRelationSchool.replace(/keyWord1=[^&]+/,"keyWord1="+majorName));
  console.log(mainUrl);
  let total = await getTotal(mainUrl);

  let URLs = getAllUrlByTotal(mainUrl,total);
  // console.log("======")
  let result = []
  for(let url of URLs){
    let data = await requestData(url);
    await sleep(20);
    if(!Array.isArray(data.school)){
      continue;
    }
    for(let school of data.school){
      let r = {
        collegeId: school.schoolid,
        name: school.schoolname,
        majorName: school.specialtyname
      }
      result.push(r);
    }
  }
  return result;
}

const record = function(major){
  return createDB().then(db => {
    return new Promise((rs,rj)=>{
      // console.log(db.collection);
      db.collection('Majors').insert(major,(err,result)=>{
        if(err){
          console.log('insertError',err);
          console.log(major);
          return rs()
        }
        console.log("insertDB")
        rs()
      })
    });
  })
}

const findedInDB = function(code){
  return createDB().then(db=>{
    return new Promise((rs,rj)=>{
      db.collection('Majors').findOne({code:code},(err,result)=>{
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

const getMajorData = async function(url){
  let URLs = await getAllUrl(url);
  console.log("getAllUrls");
  console.log(URLs);
  for(let url of URLs){
    let majorDatas = await requestData(url);
    await sleep();
    for(let majorData of majorDatas.school ){
      let realData = majorsDataHandle(majorData);

      let has = await findedInDB(realData.code);
      console.log("===========",realData.name)
      if(has){
        continue;
      }
      console.log('realData');
      console.log(realData);
      realData.description = await getMajorIntroduce(realData._url);
      realData.relationSchools = await getRelateSchoolInfo(realData.name);
      await record(realData);
    }
  }
}


module.exports = getMajorData;
