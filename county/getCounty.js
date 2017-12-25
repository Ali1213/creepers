const createDB = require('../addToDB');
const config = require('../config.json');
const request = require('superagent');
const cheerio = require('cheerio');
const util = require('util');
const url = require('url');
const public = require('../public');


const getMainUrl = async function (baseUrl) {
  let html = await public.requestHTML(baseUrl);
  return url.resolve(baseUrl, cheerio.load(html)("ul.center_list_contlist a").attr("href"));
}


const parseCounty = function($content){
  let cities = [];
  let provice = "",
    pId = 0,
    city = "",
    cId = "";

  let prvcRe = /0000$/g,
    cityRe = /[1-9]00$/g;
  let code, region;
  for (let i = 0, len = $content.length; i < len; i++) {
    let words =  $content.eq(i).text().trim().split(/\s+/);
    code = words[0];
    region = words[1];

    if (/^市辖区$/ig.test(region) || /^县$/.test(region)) {
      continue;
    };
    if (prvcRe.test(code)) {
      pId = code;
      provice = region;
    } else if (cityRe.test(code)) {
      cId = code;
      city = region;
    } else {

      cities.push({
        provinceName: provice,
        provinceId: pId,
        cityName: city,
        cityId: cId,
        countryName: region,
        countryId: code
      })
    };
  }
  return cities;
}

const getCountyByUrl = async function (baseUrl) {
  let html = await public.requestHTML(baseUrl);
  let $content = cheerio.load(html)(".xilan_con .MsoNormal");
  return parseCounty($content);
}

const getCounty = async function () {
  // 拿到最新的省市县表的url
  let resourceUrl = await getMainUrl(config.county.base);
  let counties = await getCountyByUrl(resourceUrl);
  for(let county of counties){
    await public.insertToDB(config.county.dbname,county);
    console.log(`get ${county.countryName}`)
  }
}
// console.log(util.promisify)






module.exports = getCounty;