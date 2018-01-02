const createDB = require('../addToDB');
const config = require('../config.json');
const cheerio = require('cheerio');
const util = require('util');
const url = require('url');
const public = require('../public');
const got = require('got');


const getAllRankTagObjs = async function(mainUrl){
  const html = await got(mainUrl);
  const $ = cheerio.load(html.body);
  const $option = $("[name='school-type'] option");
  let tagsArr = [];
  for(let tag of $option){
    let $tags = cheerio.load(tag);
    if($tags.attr('value').trim()){
      tagsArr.push({
        trait:$tags.attr('value'),
        name:$tags.text().trim()
      });
    }
  }
  return tagsArr;
}

const convertTraitToUrl = function (tagsArr){
  return tagsArr.map(item => {
    return {
      url: config.USNEWSranks.ranksUrlEx.replace('national-universities',item.trait),
      name: item.name,
    }
  });
}


const requestAndWriteToDB = async function(obj){
  
}

const getUniversityRanks = async function(mainUrl = config.USNEWSranks.universityRanksUrl){
  const tagsArr = await getAllRankTagObjs(mainUrl);
  const tagUrls = convertTraitToUrl(tagsArr);
}



