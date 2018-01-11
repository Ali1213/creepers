const createDB = require('../addToDB');
const config = require('../config.json');
const request = require('superagent');
const cheerio = require('cheerio');
const util = require('util');
const url = require('url');
const public = require('../public');
const got = require('got');
const universityDict = require('../universityDist');
const path = require('path');

// 递减 终止值默认为2015
const changeUrlYear = function(url, endYear = 2015){
  let urlYear = url.match(/\d{4}/)[0];
  // console.log(urlYear);
  return Number(urlYear) <= endYear ? null : url.replace(urlYear,String(urlYear-1)).replace(/page\/(\d+)/,'page/1');
}

// 增加url页码
const changUrlPage = function(url){
  return url.replace(/page\/(\d+)/,($$,$0) => `page/${Number($0)+1}`);
}


const checkIsCompanyRank = function(name){
  return /证券简称|企业|公司/.test(name);
}

//获取排名的文章
const fetchRankArticles = async function(url){
  let html = await public.requestHTML(url);
  let $ = cheerio.load(html);
  let ranks = [];
  let $main;

  try{
    $main = $('#main_content .bd_main_title');
  }catch(e){
    console.log(e);
    return ranks;
  }

  for(let i = 0;i<$main.length;i++){
    let $content = $main.eq(i).find('a');
    let rankName = $content.attr('title').trim();
    let href = $content.attr('href').trim();

    if(checkIsCompanyRank(rankName)){
      ranks.push({
        rankName,
        href
      })
    }
  }
  return ranks;
}

const fetchRanksFromArticle = async function({rankName,href}){
  let companies = [];
  console.log(href)
  console.log(rankName)
  let html = await public.requestHTML(href);
  let $ = cheerio.load(html);

  let heads = [];
  let $head = $('#show_list thead tr td');

  // 挑表头
  for(let i = 0;i<$head.length;i++){
    let head = $head.eq(i).text().trim();
    if(head){
      heads.push(head);
    }
  }

  // 挑其他内容
  let $rows = $('#show_list tbody tr');
  for(let i=0; i<$rows.length;i++){
    let $row = $rows.eq(i);
    
    let company = {};
    let $td = $row.find('td');
    for(let j=0;j<$td.length;j++){
      let content = $td.eq(j).text().trim();
      company[heads[j]] = content;
    }
    company.tableIndex = i+1;
    company.rankType = rankName;
    companies.push(company);
  }
  return companies;
}

// 清洗数据
const dataClean = function(data){

}

const fetchRanksFromArticles = async function(articles){
  let companies = [];
  for(let article of articles){
    let datas = await fetchRanksFromArticle(article);
    await public.sleep(3000+Math.floor(Math.random()*1000))
    console.log(datas.length)
    companiesEveryArticle = dataFormat(datas);
    companies.push(...companiesEveryArticle);
  }
  return companies;
}


const ranksToDB = async function(companies,collectionName){
  for(let company of companies){
    if(!await public.hasInDB(collectionName,company)){
      await public.insertToDB(collectionName,company);
    }
  }
}

const dataConvertDict = function(data){

  let dict = {};

  for(let key of Object.keys(data)){
    if(/排名/.test(key)){
      dict.rank = key;
      // dict.push({realKey: 'rank',key})
    }else if (/证券简称|企业|公司/.test(key)){
      if(/企业价值/.test(key))continue;
      dict.name = key
      // dict.push({realKey: 'name',key})
    }
  }
  return dict;
}

const CHECK_ROW_NUM = 3;
const checkEnglishNameType = function(companies,dict){
  let pass = 0;
  let englishNameType = 0;
  for(let i = 0; i< CHECK_ROW_NUM;i++){
    // for(let companyKey of Object.keys(companies[i])){
      // if(/证券简称|企业|公司/.test(companyKey)){
        //下面两种公司名称视为有英文名的
        if(companies[i][dict.name].includes('/')){
          pass++;
          englishNameType = 1;
          continue;
        }        
        if(companies[i][dict.name].includes('（') || companies[i][dict.name].includes('(')){
          pass++;
          englishNameType = 2;
          continue;
        }
      // }
    // }
  }
  return pass>=CHECK_ROW_NUM-1 ? englishNameType : 0;
}

const dataFormatEvery = function(data,dict,englishNameType){
  let newData = {
    rank:'',
    tag: data.rankType,
    chineseName: '',
    englishName:''
  };

  if(data[dict.rank]){
    newData.rank = data[dict.rank];
  }
  
  if(!data[dict.name]){
    console.log('============下面数据未找到公司名=========');
    console.log(data);
    return null;
  }
  
  if(englishNameType === 0){
    newData.chineseName = data[dict.name];    
  }else if(englishNameType === 1){
    names = data[dict.name].split('/');
    if( Array.isArray(names) && names.length >=2){
      newData.chineseName = names[0];
      newData.englishName =  names[1];
    }else{
      newData.chineseName = data[dict.name];
    }
  }else if (englishNameType === 2){
    let enMatchRe = /^([\s\S]+)([(（][^)）]+(?:[（(][^)）]+[)）])*[^）)]*[)）])$/;
    let names = data[dict.name].match(enMatchRe);
    // console.log(data[dict.name]);
    if( Array.isArray(names) && names.length >=2){
      newData.chineseName = names[1];
      newData.englishName = names[2].slice(1,-1);
    }else{
      newData.chineseName = data[dict.name];
    }
  }
  return newData;
}

const dataFormat = function(datas){

  // 取出规则
  // 目前取出两个
  //    公司名  --- 取出 中英文名
  //    排名 
  let companies = [];
  if(!datas.length) return companies;

  let dict = dataConvertDict(datas[0])
  let type = checkEnglishNameType(datas,dict);
  console.log(dict);
  for(let data of datas){
    companies.push(dataFormatEvery(data,dict,type));
  }
  return companies;
}

const run = async function({
  mainUrl = config.forbesCompany.url,
  // collectionName = config.import500Company.collectionname
  collectionName = 'test'
}={}){
  let url = mainUrl;
  while(url){
    let ranks;
    try{
      ranks = await fetchRankArticles(url);
    }catch(e){}
    url = changUrlPage(url);
    if( !ranks || !ranks.length){
      url = changeUrlYear(url);
      console.log(url);
      continue;
    }
    let companies = await fetchRanksFromArticles(ranks);
    await ranksToDB(companies,collectionName);

  }
  console.log("done");
}


run().catch(e => console.log(e));