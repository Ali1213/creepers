const createDB = require('../addToDB');
const config = require('../config.json');
const request = require('superagent');
const cheerio = require('cheerio');
const util = require('util');
const url = require('url');
const public = require('../public');
const got = require('got');

const error = console.error.bind(console);
const log = console.log.bind(console);

const getLinks = function ($, year) {
  let links = [];
  $("link").each(function (index, element) {
    if ($(element).attr('rel') === 'shortlink') {
      links.push({ year, trait: $(element).attr('href').match(/\/node\/(\d+)/)[1] });
      return;
    }
  });

  try {
    let $option = $('.year-select option');
    for (let i = 0; i < $option.length; i++) {
      let $i = $option.eq(i);
      if ($i.attr('value').startsWith('/node')) {
        links.push({
          year: $i.text().trim(),
          trait: $i.attr('value').match(/\d+$/)[0]
        })
      }
    }
  } catch (e) {

  }
  return links;
}

const getRankUrls = function (body, mainUrl) {
  // try{
  let $ = cheerio.load(body), rankTrait;
  let year = mainUrl.match(/[^\d](\d{4})([^\d]|$)/)[1];
  let links = getLinks($, year);

  let urlFrags = config.QSranks['rank-txt'].split(/\d+/);

  return links.map(item => {
    item.url = `${urlFrags[0]}${item.trait}${urlFrags[1]}${Date.now()}`;
    return item;
  })
}

/*
* 1. 从首页取到排名的url特征符号
* 2. 拼接得到url的值
* 3. 拿到string数据并parse为json
*/
const gotMainContext = async function (mainUrl) {
  let mainHtml = await got(mainUrl);
  let rankUrls = getRankUrls(mainHtml.body, mainUrl);
  let rankDatas = []
  for (let rankUrl of rankUrls) {
    let rankHTML = await got(rankUrl.url);
    try {
      rankDatas.push({
        year: rankUrl.year,
        data: JSON.parse(rankHTML.body).data
      })
    } catch (e) {

    }
  }
  return rankDatas;
}

const universityDataHandle = function (university, addition) {
  return {
    name: university.title,
    score: university.score,
    rank: university.rank_display,
    country: university.country,
    continent: university.region,
    rankYear: addition.rankYear,
  }
}

const qsUniversityRank = async function (mainUrl = config.QSranks["world-university-rankings-url"]) {
  let rankDatas = await gotMainContext(mainUrl);

  for (let everyYearRank of rankDatas) {
    let year = everyYearRank.year;
    for (let university of everyYearRank.data) {
      let newU = universityDataHandle(university, { rankYear: year });
      await public.insertToDB(config.QSranks.collectionname, newU);
    }
  }
  console.log('done');
  // for (let university of rankJson.data) {
  //   let newU = universityDataHandle(university, { rankYear: mainUrl.match(/\d{4}$/)[0] });
  //   await public.insertToDB(config.QSranks.collectionname, newU);
  // }
}

qsUniversityRank().catch(e => error(e));


// module.exports = {

// }