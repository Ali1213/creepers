const createDB = require('../addToDB');
const config = require('../config.json');
const request = require('superagent');
const cheerio = require('cheerio');
const util = require('util');
const url = require('url');
const public = require('../public');


const getAllCategoryUrl = async function (mainUrl = config.kanzhun.base, pageUrl = config.kanzhun.more) {
  let EXCLUDE_TAGNAME = '全部';
  let urls = [];
  let html = await public.requestHTML(mainUrl);
  let $ = cheerio.load(html);
  let $catergory = $('#right .scroll_box ul');

  for (let i = 0; i < $catergory.length; i++) {
    let className = $('#left ul li').eq(i+1).text().trim();
    let $content = $catergory.eq(i).find('li a');

    for(let j = 0; j < $content.length; j++){
      if ($catergory.eq(j).text().trim() === EXCLUDE_TAGNAME) {
        continue;
      }
      let shortUrl = $content.eq(j).attr('href');
      let base = url.parse(mainUrl);
      console.log("=========");
      console.log(shortUrl);
      console.log(className);
      console.log(className);
      let industryCode = shortUrl.match(/\d+/)[0];
      let pUrl = pageUrl.replace(/industryCode=\d+/, `industryCode=${industryCode}`);
      urls.push({
        industryCode,
        className,
        Page1Url: pUrl.replace(/page=\d+/, "page=1")
      });
    }

  }
  console.log(urls);
  return urls;
}

// const PAGE_MAX = 10;
// const getMorePageUrls = function (urls, pageUrl = config.kanzhun.more) {
//   return urls.map(item => {
//     let pUrl = pageUrl.replace(/industryCode=\d+/, `industryCode=${item.industryCode}`);
//     let pageUrls = [];
//     for (let i = 0; i < PAGE_MAX; i++) {
//       pageUrls.push(pUrl.replace(/page=\d+/, `page=${i + 1}`));
//     }
//     return {
//       pageUrls,
//       ...item
//     }
//   });
// }

// 解析首页
// 貌似所有的都解析more就可以了
const parseFirstPage = function () {

}
// 解析其他页面
const parseOtherPage = function (pageHTML, baseUrl) {
  let companies = [];
  let $ = cheerio.load(pageHTML);
  let $content = $('li a');
  for (let i = 0; i < $content.length; i++) {
    if ($content.eq(i).attr('ka').startsWith('search-gs-')) {
      let $m = $content.eq(i).find('.KZ_elli');
      let name = $m.eq(0).text().trim();
      let ct = $m.eq(1).text().trim().split('|');
      companies.push({
        // name,
        chineseName: name,
        englishName: '',
        scale: ct[2].trim(),
        region: ct[1].trim(),
        industry: ct[0].trim(),
        // kanzhunRank:
        // url: URL.resolve(baseUrl, $content.eq(i).attr('href'))  //这个url好像不需要
      })
    }
  }
  return companies;
}

const getDataRecursionByUrl = async function (pageUrl) {
  let results = [];
  let requestUrl = pageUrl;
  let index = 1;
  let go = true;
  while(go) {
    let data = JSON.parse(await public.requestHTML(requestUrl));
    console.log(requestUrl);
    let base = url.parse(requestUrl);
    results = results.concat(parseOtherPage(data.html, `${base.protocol}//${base.host}/`));
    requestUrl = requestUrl.replace(/page=\d+/, `page=${++index}`)

    go = data.hasMore === 'true';
    await public.sleep( Math.ceil(Math.random()*1000));
  }
  return results;
}


const main = async function () {
  let urls = await getAllCategoryUrl();
  // let moreUrls = getMorePageUrls(urls);

  for (let industryUrl of urls) {
    let campanies = await getDataRecursionByUrl(industryUrl.Page1Url);
    for (let campany of campanies) {
      // console.log('run this')
      if (! await public.hasInDB(config.kanzhun.dbname, { companyName: campany.companyName })) {
        await public.insertToDB(config.kanzhun.dbname, {
          ...campany,
          class:industryUrl.className
        })
        console.log('insertToDB company name is : ' + campany.companyName)
      }
    }
  }
}

main().catch(e => console.log(e));