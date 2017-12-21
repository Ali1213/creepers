const createDB = require('../addToDB');
const config = require('../config.json');
const request = require('superagent');
const cheerio = require('cheerio');
const public = require('../public');
const util = require('util');
const fs = require('fs');
const got = require('got');
const path = require('path');

const TEXTNAME = '1.txt';

const writeFile = function(datas){
  let writeFile = util.promisify(fs.writeFile,fs);
  let str = '';
  datas.forEach(data => {
    data.forEach(item =>{
      str += item.classTitle + '\t' + item.catergoryTitle + '\t' + item.jobTitle + '\r\n';
    })
  })
  return writeFile(path.join(__dirname,TEXTNAME),str)
}
//
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'

const getJobTitleWriteToTxt = async function(mainUrl = config.jobTitle.base){
  const html = await got(mainUrl);
  const $ = cheerio.load(html.body);
  let head1 = [];
  let $HEAD = $('.search_left li a');
  for(let i=0; i<$HEAD.length; i++){
    head1.push($HEAD.eq(i).text())
  }

  let content = [];
  let $CONTENT = $('#search_right_demo div');
  for(let i=0; i<$CONTENT.length; i++){
    let head2 = [];
    let $HEAD2 = $CONTENT.eq(i).find('p');

    for(let j=0; j< $HEAD2.length;j++){
      let catergoryTitle = $HEAD2.eq(j).text().trim().replace('>>','');
      let $JOB = $CONTENT.eq(i).find('div').eq(j).find('a');
      for(let z=0;z<$JOB.length;z++){
        head2.push({
          catergoryTitle: catergoryTitle,
          jobTitle: $JOB.eq(z).text().trim(),
        })
      }
    }
    //排除一些空选项
    if(head2[0]){
      content.push(head2);
    }
  }
  for(let i=0; i<head1.length; i++){
    for(let j=0; j<content[i].length; j++){
      content[i][j].classTitle = head1[i];
    }
  }
  // console.log(content);
  //写入到文本文件中,这一步可以去修改文件，然后再进行下一步
  await writeFile(content);
  //
}

const readFromTxtWriteToDB = async function(){
  let jobs = await convertTextToWriteToDB();
  for(let job of jobs){
    if(job){
      await public.insertToDB('JobTitle',job);
      console.log(`get ${job.jobTitle}`)
    }
  }
}


const getJobTitle = async function(mainUrl = config.jobTitle.base){
  await getJobTitleWriteToTxt(mainUrl = config.jobTitle.base);
  await readFromTxtWriteToDB();
}

const convertTextToWriteToDB = async function(){
  let readFile = util.promisify(fs.readFile,fs);
  let str = await readFile(path.join(__dirname,TEXTNAME),'utf-8');
  console.log(str)
  let data = str.split('\r\n').map(item => {
    if(!item.trim()){
      return null;
    }
    let words = item.trim().split(/\s+/);
    return {
      class: words[0],
      catergory: words[1],
      title: words[2],
    }
  });
  return data;
}


module.exports ={
  getJobTitle,
  getJobTitleWriteToTxt,
  readFromTxtWriteToDB
}