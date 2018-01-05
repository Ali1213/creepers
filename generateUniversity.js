const fs = require('fs');
const path = require('path');
const util = require('util');


const parse = async function(inputFile = path.join(__dirname,'distResource','usuniversity.txt'), outputFile = path.join(__dirname,'universityDist.json')){
  const readFile = util.promisify(fs.readFile,fs);
  let content = await readFile(inputFile,'utf-8');
  let datas = content.split('\n');
  datas.shift();
  // let re = /[-\d]+\s+([^a-zA-z]+)\s+([^\u4e00-\u9fa5\-\d]+)/;
  
  let dict = {};
  for(let data of datas){
    if(!data.trim()) continue;
    // let matchs = data.match(re).map(item => item.trim());
    // dict[matchs[1]] = matchs[2];
    let matchs = data.split('\t').filter(item=> item.trim());
    dict[matchs[2]] = matchs[1];
  }
  const writeFile = util.promisify(fs.writeFile,fs);
  const stat = util.promisify(fs.stat,fs);
  console.log(111)
  try{
    await stat(outputFile)
  }catch(e){
    console.log(222)
    await writeFile(outputFile,JSON.stringify(dict));
    return;
  }

  console.log(333)
  let originData = await readFile(outputFile);
  let copyJSON = Object.assign(JSON.parse(originData),dict);
  await writeFile(outputFile,JSON.stringify(copyJSON));
}
// ['usEnglandUniversity','unAustraliaUniversity','usCanadaUniversity']
// parse(path.join(__dirname,'distResource','uschinaUniversity.txt')).catch(e=>console.log(e));

const parseFile = async function(dirpath = path.join(__dirname,'distResource')){
  let readDir = util.promisify(fs.readdir,fs);
  let files = await readDir(dirpath);
  for(let file of files){
    await parse(path.join(dirpath,file)).catch(e=>console.log(e))
  }
}
parseFile();