const createDB = require('../addToDB');
const config = require('../config.json');
const cheerio = require('cheerio');
const util = require('util');
const url = require('url');
const public = require('../public');
const got = require('got');
const universityDict = require('../universityDist');
const path = require('path');
const fs = require('fs');

const fetchCodeDicts = async function(inputFilepath){
  let dataStr = await util.promisify(fs.readFile,fs)(inputFilepath,'utf8');
  let datas = dataStr.split('\n');
  let dicts = [];
  for(let data of datas){
    //空字符串返回
    if(!data.trim())continue;

    let info = data.split(/\s+/);
    dicts.push({
      code:info[0],
      name:info[1],
    });
  }
  return dicts;
}

const checkNeedMount = async function(){
  let schools = await public.findDB(
    config.colleges.dbname,
    {code:{$exists:0}},
    {fields:{name:1}}
  )
  console.log(schools);
}

const insertCollegeCode = async function({
  inputFilepath = path.join(__dirname, 'collegeCode.txt')
}={}){
  const codeDicts = await fetchCodeDicts(inputFilepath);
  for(let dict of codeDicts){
    console.log(dict.name);
    await public.findOneAndUpdateDB(
      config.colleges.dbname,
      {name:dict.name},
    {$set:{code:dict.code}})
  }
  await checkNeedMount();
  console.log('done');
}

// insertCollegeCode().catch(e=>console.log(e));

module.exports = insertCollegeCode;