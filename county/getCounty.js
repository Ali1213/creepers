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
      console.log(provice,city)
      // 判断省名称为市的情况
      if(provice.endsWith('市')){
        city = provice;
        cId = pId;
      }
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


const countiesToProvices = function(counties){
  let provices = {};
  counties.forEach(item => {
    if(!provices[item.provinceId]){
      provices[item.provinceId] = {
        name: item.provinceName,
        code: item.provinceId,
        citiesJson:{}
      }
    }

    if(!provices[item.provinceId].citiesJson[item.cityId]){
      provices[item.provinceId].citiesJson[item.cityId] = {
        name: item.provinceName,
        code: item.provinceId,
        counties:[]
      }
    }

    provices[item.provinceId].citiesJson[item.cityId].counties.push({
      name: item.countryName,
      code: item.countryId
    })
  })
  return Object.values(provices).map(item =>{
    item.cities = Object.values(item.citiesJson);
    delete item.citiesJson;
    return item;
  })
}

const getCounty = async function () {
  // 拿到最新的省市县表的url
  let resourceUrl = await getMainUrl(config.county.base);
  let counties = await getCountyByUrl(resourceUrl);
  //省市县是之前写的代码，不想看了，写一个data handle
  let provices = countiesToProvices(counties);
  for(let provice of provices){
    await public.insertToDB(config.county.dbname,provice);
    console.log(`get ${provice.name}`)
  }
  process.exit(0);
}
// console.log(util.promisify)






module.exports = getCounty;