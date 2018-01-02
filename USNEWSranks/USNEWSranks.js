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
  let tagsObj = [];
  for(let tag of $option){
    let $tags = cheerio.load(tag);
    if($tags.attr('value').trim()){
      tagsObj.push({
        tag:$tags.attr('value'),
        name:$tags.text().trim()
      })
    }
  }
  return tagsObj;
}


const getUniversityRanks = async function(mainUrl = config.USNEWSranks.universityRanksUrl){
  const tagObj = getAllRankTagObjs(mainUrl);
}



