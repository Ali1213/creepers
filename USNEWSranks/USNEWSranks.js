const createDB = require('../addToDB');
const config = require('../config.json');
const cheerio = require('cheerio');
const util = require('util');
const url = require('url');
const public = require('../public');
const got = require('got');
const universityDict = require('../universityDist');
const path = require('path');
// const cookie = require('cookie');
let recordStr = '';

const gotWithCookie = function (mainUrl) {
  return got(mainUrl, {
    headers: {
      cookie: "s_cc=true; s_fid=15B4D3A5CF249605-1676086AC945DE1A; _ga=GA1.2.361734384.1514368728; _vwo_uuid_v2=0B44EB3D5ED3545ACE6505EADBE55006|753d332264095af82c1c9fefe7c28211; _vis_opt_s=1%7C; _vis_opt_test_cookie=1; _vwo_uuid=0B44EB3D5ED3545ACE6505EADBE55006; _vis_opt_exp_393_combi=1; display-newsletter-interstitial=false; __qca=P0-1534259387-1514428729402; usn_grad_interstitial=2; HTML_VisitCountCookie=NaN; _gid=GA1.2.731888912.1514882619; JSESSIONID=CF232B7066F89CF3613D63974EB887B6; cmp=web%3Acol_compass%3Ana%3Aranking_lrail_diver%3A20171003; s_sq=%5B%5BB%5D%5D; ak_bmsc=B74545ADCC29F9FD5152C1C63C7F14E3CB458ABC3E020000F57E4C5A49922239~plDh2hXYGPgOcbz4Yvuv4/EDauYL15kIsjoFXCmRM4l3SDY3CWRWl+PexPbLWd3KepEW5IijXAZqi7HgAactboImLiy4ZBlnu8U7Fp//8nh9XWctCFHGp/q8iRM8G0dSAEzjzLUk5OpPLSPgNsFwfVIW8ETyW4sXPnhmIByi0Y6JwvMf7QMaOeWy08pKKvF4YtJ+Mm6jBUAcd8JXbJ8A96N9uFw3qDGHTkcJn6uD+wYro=; bm_sv=C15CE30AAD84D6C8A5B16D4B4329389A~H7cTWhMSpnhuPGEgD2dn0Ui2GrayWkCpo47VRWIlxOWtO4I/8h/oO6o62IklXkdAEJU5brXUzaTygQi1w3VPxy2to0XS5AJc9rqny1w8zwkNTx+cJoK1Ltmmu0yaHDiWnhuNA4LVj+1ijzcqu6EpWws64FlqQRPK3afhJmdbTvk=; utag_main=v_id:01609768f7140012ec4346fb385802079001707100bd0$_sn:6$_ss:1$_st:1514967350942$_pn:1%3Bexp-session$ses_id:1514965550942%3Bexp-session; compass-ad-modal-counter=50; bc-page-views=74; _gat_tealium_0=1; _gat_tealium_1=1; _sp_ses.26f9=*; _sp_id.26f9=c3f687f7785fb1c5.1514369622.12.1514965552.1514953605; _ceg.s=p1yywh; _ceg.u=p1yywh"
    }
  });
};

const getAllRankTagObjs = async function (mainUrl) {
  // const html = await got(mainUrl, {
  //   headers: {
  //     cookie: "s_cc=true; s_fid=15B4D3A5CF249605-1676086AC945DE1A; _ga=GA1.2.361734384.1514368728; _vwo_uuid_v2=0B44EB3D5ED3545ACE6505EADBE55006|753d332264095af82c1c9fefe7c28211; _vis_opt_s=1%7C; _vis_opt_test_cookie=1; _vwo_uuid=0B44EB3D5ED3545ACE6505EADBE55006; _vis_opt_exp_393_combi=1; display-newsletter-interstitial=false; __qca=P0-1534259387-1514428729402; usn_grad_interstitial=2; HTML_VisitCountCookie=NaN; _gid=GA1.2.731888912.1514882619; JSESSIONID=CF232B7066F89CF3613D63974EB887B6; cmp=web%3Acol_compass%3Ana%3Aranking_lrail_diver%3A20171003; s_sq=%5B%5BB%5D%5D; ak_bmsc=B74545ADCC29F9FD5152C1C63C7F14E3CB458ABC3E020000F57E4C5A49922239~plDh2hXYGPgOcbz4Yvuv4/EDauYL15kIsjoFXCmRM4l3SDY3CWRWl+PexPbLWd3KepEW5IijXAZqi7HgAactboImLiy4ZBlnu8U7Fp//8nh9XWctCFHGp/q8iRM8G0dSAEzjzLUk5OpPLSPgNsFwfVIW8ETyW4sXPnhmIByi0Y6JwvMf7QMaOeWy08pKKvF4YtJ+Mm6jBUAcd8JXbJ8A96N9uFw3qDGHTkcJn6uD+wYro=; bm_sv=C15CE30AAD84D6C8A5B16D4B4329389A~H7cTWhMSpnhuPGEgD2dn0Ui2GrayWkCpo47VRWIlxOWtO4I/8h/oO6o62IklXkdAEJU5brXUzaTygQi1w3VPxy2to0XS5AJc9rqny1w8zwkNTx+cJoK1Ltmmu0yaHDiWnhuNA4LVj+1ijzcqu6EpWws64FlqQRPK3afhJmdbTvk=; utag_main=v_id:01609768f7140012ec4346fb385802079001707100bd0$_sn:6$_ss:1$_st:1514967350942$_pn:1%3Bexp-session$ses_id:1514965550942%3Bexp-session; compass-ad-modal-counter=50; bc-page-views=74; _gat_tealium_0=1; _gat_tealium_1=1; _sp_ses.26f9=*; _sp_id.26f9=c3f687f7785fb1c5.1514369622.12.1514965552.1514953605; _ceg.s=p1yywh; _ceg.u=p1yywh"
  //   }
  // });
  let options = [{ value: "national-universities", label: "National Universities" }, { value: "national-liberal-arts-colleges", label: "National Liberal Arts Colleges" }, { value: "regional-universities-north", label: "Regional Universities North" }, { value: "regional-universities-south", label: "Regional Universities South" }, { value: "regional-universities-midwest", label: "Regional Universities Midwest" }, { value: "regional-universities-west", label: "Regional Universities West" }, { value: "regional-colleges-north", label: "Regional Colleges North" }, { value: "regional-colleges-south", label: "Regional Colleges South" }, { value: "regional-colleges-midwest", label: "Regional Colleges Midwest" }, { value: "regional-colleges-west", label: "Regional Colleges West" }, { value: "business", label: "Business Programs" }, { value: "engineering-doctorate", label: "Engineering (Doctorate Offered)" }, { value: "engineering-no-doctorate", label: "Engineering (Doctorate Not Offered)" }, { value: "hbcu", label: "Historically Black Colleges and Universities" }]
  // const $ = cheerio.load(html);
  // const $option = $(".block-flush option");

  let tagsArr = [];
  for (let tag of options) {
    if (tag.value.trim()) {
      tagsArr.push({
        trait: tag.value,
        name: tag.label
      });
    }
  }
  return tagsArr;
}

const convertTraitToUrl = function (tagsArr) {
  return tagsArr.map(item => {
    return {
      url: config.USNEWSranks.ranksUrlEx.replace('national-universities', item.trait),
      name: item.name,
    }
  });
}

const requestAndHandleData = function () {

}

const requestTags = async function (tagUrl) {
  let page = 1, totalpage = 1,
    mainUrl = tagUrl.url;
  let results = [];
  while (page <= totalpage) {
    let html = await got(mainUrl, {
      headers: {
        cookie: "s_cc=true; s_fid=15B4D3A5CF249605-1676086AC945DE1A; _ga=GA1.2.361734384.1514368728; _vwo_uuid_v2=0B44EB3D5ED3545ACE6505EADBE55006|753d332264095af82c1c9fefe7c28211; _vis_opt_s=1%7C; _vis_opt_test_cookie=1; _vwo_uuid=0B44EB3D5ED3545ACE6505EADBE55006; _vis_opt_exp_393_combi=1; display-newsletter-interstitial=false; __qca=P0-1534259387-1514428729402; usn_grad_interstitial=2; HTML_VisitCountCookie=NaN; _gid=GA1.2.731888912.1514882619; JSESSIONID=CF232B7066F89CF3613D63974EB887B6; cmp=web%3Acol_compass%3Ana%3Aranking_lrail_diver%3A20171003; s_sq=%5B%5BB%5D%5D; ak_bmsc=B74545ADCC29F9FD5152C1C63C7F14E3CB458ABC3E020000F57E4C5A49922239~plDh2hXYGPgOcbz4Yvuv4/EDauYL15kIsjoFXCmRM4l3SDY3CWRWl+PexPbLWd3KepEW5IijXAZqi7HgAactboImLiy4ZBlnu8U7Fp//8nh9XWctCFHGp/q8iRM8G0dSAEzjzLUk5OpPLSPgNsFwfVIW8ETyW4sXPnhmIByi0Y6JwvMf7QMaOeWy08pKKvF4YtJ+Mm6jBUAcd8JXbJ8A96N9uFw3qDGHTkcJn6uD+wYro=; bm_sv=C15CE30AAD84D6C8A5B16D4B4329389A~H7cTWhMSpnhuPGEgD2dn0Ui2GrayWkCpo47VRWIlxOWtO4I/8h/oO6o62IklXkdAEJU5brXUzaTygQi1w3VPxy2to0XS5AJc9rqny1w8zwkNTx+cJoK1Ltmmu0yaHDiWnhuNA4LVj+1ijzcqu6EpWws64FlqQRPK3afhJmdbTvk=; utag_main=v_id:01609768f7140012ec4346fb385802079001707100bd0$_sn:6$_ss:1$_st:1514967350942$_pn:1%3Bexp-session$ses_id:1514965550942%3Bexp-session; compass-ad-modal-counter=50; bc-page-views=74; _gat_tealium_0=1; _gat_tealium_1=1; _sp_ses.26f9=*; _sp_id.26f9=c3f687f7785fb1c5.1514369622.12.1514965552.1514953605; _ceg.s=p1yywh; _ceg.u=p1yywh"
      }
    });
    let universities;
    try {
      universities = JSON.parse(html.body);
    } catch (e) {
      console.error(e);
      break;
    }
    console.log(`handle data in page ${page}`);
    page++;
    totalpage = universities.data.total_pages;
    mainUrl = mainUrl.replace(/page=\d+/, `page=${page}`);

    results = results.concat(universities.data.items);

  }
  return results;
}

const handleUniversitysData = function (universities) {
  return universities.map((item, index) => {
    if (!item) {
      console.log(universities);
      return null;
    }

    let u = item.institution;
    if(!universityDict[u.displayName]){
      recordStr += u.displayName + '\r\n';
    }
    return {
      // name: u.displayName,
      chineseName: '',
      englishName: u.displayName,
      chineseName: universityDict[u.displayName]|| '',
      alias: u.aliasNames || '',
      city: u.city,
      controlBy: u.institutionalControl,
      score: u.rankingDisplayScore || '',
      rank: u.rankingSortRank +'',
      rankType: u.rankingDisplayName,
      description: item.blurb,
    };
  }).filter(item => item);
}

const universityRankWriteToDB = async function (ranks) {
  await public.insertMany(config.USNEWSranks.collectionname, ranks);
}

const requestAndWriteToDB = async function (tagUrls) {
  let results = [];
  for (let tagUrl of tagUrls) {
    let universities = await requestTags(tagUrl);
    let handleUniversities = handleUniversitysData(universities);
    console.log(`write to db nums of ${handleUniversities.length}`);
    await universityRankWriteToDB(handleUniversities);
  }
}

const getUniversityRanks = async function (mainUrl = config.USNEWSranks.universityRanksUrl) {
  const tagsArr = await getAllRankTagObjs(mainUrl);
  const tagUrls = convertTraitToUrl(tagsArr);
  await requestAndWriteToDB(tagUrls);
  console.log('done');
  public.appendFile(path.join(__dirname,'../unsign2.txt'),recordStr);
}

// getUniversityRanks().catch(e => console.log(e));

const convertMajorTraitsToUrl = function (traits) {
  return traits.map(item=>{
    return {
      name: item.name,
      url: config.USNEWSranks.majorRanksUrlEx.replace('arts-and-humanities',item.trait)
    }
  })
}

const getAllMajorUrls = async function (mainUrl) {
  let traits = await getAllMajorTraits(mainUrl);
  let urls = convertMajorTraitsToUrl(traits);
  return urls;
}

const getAllMajorTraits = async function (mainUrl) {
  let html = await gotWithCookie(mainUrl);
  const $ = cheerio.load(html.body);
  const $options = $('#subject option');
  let tags = [];
  for (let i=0;i<$options.length;i++) {
    let $option = $options.eq(i);
    let trait = $option.attr('value').trim()
    if (trait) {
      tags.push({
        trait,
        name: $option.text().trim()
      });
    }
  }
  // console.log(tags);
  return tags;
}

const requestMajorUrls = async function (majorUrl) {
  let page = 1, totalpage = 1,
    mainUrl = majorUrl.url;
  let results = [];
  while (page <= totalpage) {
    let html = await gotWithCookie(mainUrl);
    let universities;
    try {
      universities = JSON.parse(html.body);
    } catch (e) {
      console.error(e);
      break;
    }
    console.log(`handle data in page ${page}`);
    page++;
    totalpage = universities.pagination.last_page;
    mainUrl = mainUrl.replace(/page=\d+/, `page=${page}`);

    results = results.concat(universities.results);

  }
  return results;
}

const handleMajorsData = function (universities,rankType) {
  return universities.map((item, index) => {
    if (!item) {
      console.log(universities);
      return null;
    }
    if(!universityDict[item.name]){
      recordStr += item.name + '\r\n';
    }
    return {
      // name: rankType,
      chineseName: '',
      englishName: rankType,
      country:item.country_name,
      rank: item.rank + '',
      score: item.score + '',
      city: item.city,
      universityName: item.name,
      universityNameCN: universityDict[item.name]||'',
    };
  }).filter(item => item);
}

const MajorsRankWriteToDB = async function (ranks) {
  await public.insertMany(config.USNEWSranks.majorcollectionname, ranks);
}
 
const requestRanksAndWriteToDB = async function (majorUrls) {
  let results = [];
  for (let majorUrl of majorUrls) {
    let universities = await requestMajorUrls(majorUrl);
    let majorRanks = handleMajorsData(universities,majorUrl.name);
    console.log(`write to db nums of ${majorRanks.length}`);
    await MajorsRankWriteToDB(majorRanks);
  }
}

const getMajorRanks = async function (mainUrl = config.USNEWSranks.majorRanksUrl) {
  const majorUrls = await getAllMajorUrls(mainUrl);
  await requestRanksAndWriteToDB(majorUrls);
  console.log('done');
  public.appendFile(path.join(__dirname,'../unsign2.txt'),recordStr);
}

getMajorRanks().catch(e => console.log(e));

module.exports = {
  getUniversityRanks,
  getMajorRanks,
};
