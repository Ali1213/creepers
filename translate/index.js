const createDB = require('../addToDB');
const config = require('../config.json');
const cheerio = require('cheerio');
const util = require('util');
const url = require('url');
const public = require('../public');
const got = require('got');
const path = require('path');

const MD5 = require('./md5');

const BaiduTranslate = require('node-baidu-translate')

var appid = '20180111000114294';
var key = '';
const bdt = new BaiduTranslate(appid, key)

// bdt.translate("中国地质大学（北京）", 'en','zh').then(res => {
//   console.log(res)
//   // { from: 'en',
//   //   to: 'zh',
//   //   trans_result: [ { src: 'apple', dst: '苹果' } ] 
//   // }
// }).catch(e=>console.log(e));



const run = async function({
  collectionName = config.colleges.dbname
}={}){
  const colleges = await public.findDB(collectionName,{englishName:""},{fields:{chineseName:1}});
  // let num = 0
  for(let college of colleges){
    // if(++num>3)return;
    try{
      let translate = await bdt.translate(college.chineseName, 'en','zh');
      // console.log(college);
      // console.log(translate);
      console.log(`${college.chineseName}的英文名为${translate.trans_result[0].dst}`)
      await public.updateOneDB(collectionName,{_id:college._id},{$set:{englishName:translate.trans_result[0].dst}});
    }catch(e){
      console.log("============err",e);
    }
  }
  console.log('done');
}

run().catch(e=>console.log(e));

