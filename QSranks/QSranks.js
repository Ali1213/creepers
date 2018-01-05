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

const error = console.error.bind(console);
const log = console.log.bind(console);

let recordStr = '';

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
  if(!universityDict[university.title]){
    recordStr += university.title +'\r\n';
  }
  return {
    name: university.title,
    chineseName: universityDict[university.title] || "",
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
  // console.log(recordStr);
  public.appendFile(path.join(__dirname,'../unsigin.txt'),recordStr);
  // for (let university of rankJson.data) {
  //   let newU = universityDataHandle(university, { rankYear: mainUrl.match(/\d{4}$/)[0] });
  //   await public.insertToDB(config.QSranks.collectionname, newU);
  // }
}

let major_ranks_info = [{ "value": "", "label": "<b>Broad subject area</b>" }, { "value": "/arts-humanities", "label": "Arts & Humanities" }, { "value": "/engineering-technology", "label": "Engineering & Technology" }, { "value": "/life-sciences-medicine", "label": "Life Sciences & Medicine" }, { "value": "/natural-sciences", "label": "Natural Sciences" }, { "value": "/social-sciences-management", "label": "Social Sciences" }, { "value": "-", "label": "<b>Specific subject</b>" }, { "value": "/accounting-finance", "label": "Accounting & Finance" }, { "value": "/agriculture-forestry", "label": "Agriculture & Forestry" }, { "value": "/anatomy-physiology", "label": "Anatomy & Physiology" }, { "value": "/anthropology", "label": "Anthropology" }, { "value": "/archaeology", "label": "Archaeology" }, { "value": "/architecture", "label": "Architecture" }, { "value": "/art-design", "label": "Art & Design" }, { "value": "/biological-sciences", "label": "Biological Sciences" }, { "value": "/business-management-studies", "label": "Business & Management" }, { "value": "/engineering-chemical", "label": "Chemical Engineering" }, { "value": "/chemistry", "label": "Chemistry" }, { "value": "/engineering-civil-structural", "label": "CiviI & Structural Engineering" }, { "value": "/communication-media-studies", "label": "Communication & Media Studies" }, { "value": "/computer-science-information-systems", "label": "Computer Science" }, { "value": "/dentistry", "label": "Dentistry" }, { "value": "/development-studies", "label": "Development Studies" }, { "value": "/earth-marine-sciences", "label": "Earth & Marine Sciences" }, { "value": "/economics-econometrics", "label": "Economics & Econometrics" }, { "value": "/education-training", "label": "Education" }, { "value": "/engineering-electrical-electronic", "label": "Electrical & Electronic Engineering" }, { "value": "/english-language-literature", "label": "English Language & Literature" }, { "value": "/environmental-studies", "label": "Environmental Sciences" }, { "value": "/geography", "label": "Geography" }, { "value": "/history", "label": "History" }, { "value": "/hospitality-leisure-management", "label": "Hospitality & Leisure Management" }, { "value": "/law-legal-studies", "label": "Law" }, { "value": "/linguistics", "label": "Linguistics" }, { "value": "/materials-sciences", "label": "Materials Science" }, { "value": "/mathematics", "label": "Mathematics" }, { "value": "/engineering-mechanical", "label": "Mechanical, Aeronautical & Manufacturing Engineering" }, { "value": "/medicine", "label": "Medicine" }, { "value": "/engineering-mineral-mining", "label": "Mineral & Mining Engineering" }, { "value": "/modern-languages", "label": "Modern Languages" }, { "value": "/nursing", "label": "Nursing" }, { "value": "/performing-arts", "label": "Performing Arts" }, { "value": "/pharmacy-pharmacology", "label": "Pharmacy & Pharmacology" }, { "value": "/philosophy", "label": "Philosophy" }, { "value": "/physics-astronomy", "label": "Physics & Astronomy" }, { "value": "/politics", "label": "Politics & International Studies" }, { "value": "/psychology", "label": "Psychology" }, { "value": "/social-policy-administration", "label": "Social Policy & Administration" }, { "value": "/sociology", "label": "Sociology" }, { "value": "/sports-related-subjects", "label": "Sports-related Subjects" }, { "value": "/statistics-operational-research", "label": "Statistics" }, { "value": "/theology-divinity-religious-studies", "label": "Theology, Divinity & Religious Studies" }, { "value": "/veterinary-science", "label": "Veterinary Science" },]

const qsMajorRank = async function (majorInfos) {
  if (!majorInfos) {
    majorInfos = major_ranks_info.map(item => {
      if (item.value.startsWith('/')) {
        item.value = config.QSranks['major-url'] + item.value;
        return item;
      } else {
        return null;
      }
    })
  }
  for (let majorInfo of majorInfos) {
    if(!majorInfo) continue;
    let rankDatas = await gotMainContext(majorInfo.value);
    await handleMajorsAndWriteToDB(rankDatas,majorInfo.label);
    // console.log(`${majorInfo.label}   done`);
  }
  console.log('done');
  public.appendFile(path.join(__dirname,'../unsigin.txt'),recordStr);

}

const majorDataHandle = function (university, addition) {
  if(!universityDict[university.title]){
    recordStr += university.title +'\r\n';
  }
  return {
    name: university.title,
    chineseName: universityDict[university.title] || "",
    major: addition.major,
    score: university.score,
    rank: university.rank_display,
    country: university.country,
    continent: university.region,
    rankYear: addition.rankYear,
  }
}

const handleMajorsAndWriteToDB = async function(rankDatas,major){
  for (let everyYearRank of rankDatas) {
    let year = everyYearRank.year;
    for (let university of everyYearRank.data) {
      let newU = majorDataHandle(university, { rankYear: year, major });
      await public.insertToDB(config.QSranks.majorCollectionname, newU);
    }
  }
}

// qcMajorRank().catch(e => error(e))

module.exports = {
   qsUniversityRank,
   qsMajorRank,
}