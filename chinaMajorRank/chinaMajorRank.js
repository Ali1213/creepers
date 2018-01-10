const createDB = require('../addToDB');
const config = require('../config.json');
const request = require('superagent');
const cheerio = require('cheerio');
const util = require('util');
const url = require('url');
const public = require('../public');
const path = require('path');
const fs = require('fs');

const readData = function(inputFile){
  return util.promisify(fs.readFile,fs)(inputFile,'utf8').then(data => JSON.parse(data));
}

const run = async function({
  inputFile = path.join(__dirname,'majorRank.json'),
  collectionName = config.chinaMajorRank.collectionname
}={}){
  let ranks = await readData(inputFile);
  ranks = ranks.map(item =>{
    return {
      chineseName:item.majorName,
      englishName: '',
      majorCode: item.code,
      ranks: item.ranks.map(item=>{
        return {
          rank: item.score,
          universityCode: item.code,
          universityName: item.name
        }
      })
    };
  });

  await public.insertMany(collectionName,ranks);
  console.log("done");
}


// run().catch(e=>console.log(e));

module.export = run;