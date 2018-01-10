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
const xlsx = require('node-xlsx');

// 如果第一二排数据为数字的话，则取第一排为排名
const parseData = function(sheet,rankType){
  // 去表头
  sheet.shift();

  let rankIndex = 0, 
      nameIndex = 1,
      off = true, 
      hasEnglishName = false,
      enRe = /[((（）))]/,
      enMatchRe = /^([\s\S]+)([(（][^)）]+([（(][^)）]+[)）])*[^）)]*[)）])$/,
      empty = '';
  //确定name
  while(off){
    if(/^\d+$/.test( (sheet[0][nameIndex]+'').trim()) ){
      nameIndex++;
    }else{
      off = !off;
    }
  }

  // 通过首行是否有两个括号来判断
  if(sheet[0][nameIndex].split(enRe).length>2){
    console.log(rankType);
    hasEnglishName = true;
  }
  
  let companies = [];
  for( let row of sheet ){
    let company = {
      rank:(row[rankIndex]+'').trim(),
      rankType,
    };
    if(hasEnglishName){
      let info = (row[nameIndex]+'').trim().match(enMatchRe);
      company.chineseName = info[1]+'';
      company.englishName = info[2].slice(1,-1);
    }else{
      company.chineseName = (row[nameIndex]+'').trim();
      company.englishName = empty;
    }

    companies.push(company);
  }
  return companies;
}

const importCompany = async function({
  inputfile = path.join(__dirname,'500.xlsx')
}={}){
  const sheets = xlsx.parse(inputfile);
  // console.log(sheets)
  for(let sheet of sheets){
    let companies = parseData(sheet.data,sheet.name);
    await public.insertMany(config.import500Company.collectionname,companies);
  }
  console.log("done");
}

importCompany().catch(e=>console.log(e));