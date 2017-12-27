const xlsx = require('node-xlsx');
const fs = require('fs');
const path = require('path');

const createDB = require('../addToDB');
const config = require('../config.json');
const public = require('../public');


const getCredentials = async function(collection=config.getCredentials.collectionname){
  const sheets = xlsx.parse(path.join(__dirname,config.getCredentials.readFilename));
  let results=[];
  for(let sheet of sheets){
    let heads = sheet.data.shift();
    for(let [x,classname] of heads.entries()){
      if(!classname.trim()){
        continue;
      }
      for(let [y, names] of sheet.data.entries()){
        console.log(names);
        if(!names[x] || !names[x].trim()){
          continue;
        }
        results.push({
          class: classname.trim(),
          name: names[x].trim()
        });
      }
    }

  }
  await public.insertMany(collection,results);
  console.log('done');
  // process.exit(0);
}


module.exports = getCredentials;