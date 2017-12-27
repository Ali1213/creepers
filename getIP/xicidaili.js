const createDB = require('../addToDB');
const config = require('../config.json');
const request = require('superagent');
const cheerio = require('cheerio');
const public = require('../public');
const util = require('util');
const fs = require('fs');
const got = require('got');
const path = require('path');

const getNextUrl = async function(mainUrl){
  
};


const getIPs = async function(mainUrl=config.getIP.xicidaili.hide){
  // 获取所有主页面
  let allUrls = await getAllUrls(mainUrl);
};