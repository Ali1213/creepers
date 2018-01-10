const createDB = require('../addToDB');
const config = require('../config.json');
const cheerio = require('cheerio');
const util = require('util');
const url = require('url');
const public = require('../public');
const got = require('got');
const path = require('path');
const fs = require('fs');


const toTwo = function(num){
  return string(num).length === 1 ? '0'+num : num + '';
}

/*
 * 1.备份数据库
 * 2.删除当前数据库
 * 3.更新数据
 */
const adjust = async function({
  collectionName,
  middleHandle
}={}){
  const now = new Date(),
        yearMonth = now.getFullYear() + '' + (now.getMonth() + 1),
        backCollectionName = collectionName + '_backup_' + yearMonth;

  if(typeof middleHandle !== 'function'){
    throw new Error('middleHandle must be an function');
  }
  //暂时不考虑内存爆表
  let datas = await public.findDB(collectionName,{});

  await public.insertMany(backCollectionName,datas);
  let newDatas = datas.map( item => {
    delete item._id;
    return middleHandle(item);
  } );

  await public.dropCollection(collectionName);
  await public.insertMany(collectionName,newDatas);
  console.log('done');
};


const collegesHandle = function(data){
  let chineseName = data.name;
  delete data.name;
  return {
    chineseName,
    englishName:'',
    ...data,
  }
}

// adjust({
//   collectionName:"ResumeColleges",
//   middleHandle:collegesHandle
// }).catch(e=>console.log(e));

const majorsHandle = function(data){
  let chineseName = data.name;
  delete data.name;
  return {
    chineseName,
    englishName:'',
    ...data,
  }
}


// adjust({
//   collectionName:"ResumeMajors",
//   middleHandle:majorsHandle
// }).catch(e=>console.log(e));

const companiesHandle = function(data){
  let chineseName = data.name;
  delete data.name;
  return {
    chineseName,
    englishName:'',
    ...data,
  }
}

// adjust({
//   collectionName:"ResumeCompanies",
//   middleHandle:companiesHandle
// }).catch(e=>console.log(e));

const credentialHandle = function(data){
  let chineseName = data.name;
  return {
    class: data.class,
    chineseName,
    englishName:'',
  }
}

// adjust({
//   collectionName:"ResumeCredentials",
//   middleHandle:credentialHandle
// }).catch(e=>console.log(e));


const jobTitlesHandle = function(data){
  let chineseName = data.title;
  delete data.title;
  return {
    ...data,
    chineseName,
    englishName:'',
  }
}

// adjust({
//   collectionName:"ResumeJobTitles",
//   middleHandle:jobTitlesHandle
// }).catch(e=>console.log(e));

const QSUniversityRanksHandle = function(data){
  let chineseName = data.chineseName;
  delete data.chineseName;
  let englishName = data.name;
  delete data.name;
  return {
    chineseName,
    englishName,
    ...data,
  }
}

// adjust({
//   collectionName:"ResumeQSUniversityRanks",
//   middleHandle:QSUniversityRanksHandle
// }).catch(e=>console.log(e));

const QSMajorRanksHandle = function(data){
  let englishName = data.name;
  delete data.name;
  return {
    chineseName:'',
    englishName,
    ...data,
  }
}

// adjust({
//   collectionName:"ResumeQSMajorRanks",
//   middleHandle:QSMajorRanksHandle
// }).catch(e=>console.log(e));

const USNEWSUniversityRanksHandle = function(data){
  let chineseName = data.chineseName;
  delete data.chineseName;
  let englishName = data.name;
  delete data.name;
  return {
    chineseName,
    englishName,
    ...data,
  }
}

// adjust({
//   collectionName:"ResumeUSNEWSUniversityRanks",
//   middleHandle:USNEWSUniversityRanksHandle
// }).catch(e=>console.log(e));

const USNEWSMajorRanksHandle = function(data){
  let englishName = data.name;
  delete data.name;
  return {
    chineseName:'',
    englishName,
    ...data,
  }
}

// adjust({
//   collectionName:"ResumeUSNEWSMajorRanks",
//   middleHandle:USNEWSMajorRanksHandle
// }).catch(e=>console.log(e));