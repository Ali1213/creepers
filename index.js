const getAllColleges = require('./chinaColleges/getAllColleges');
const getMajor = require('./major/getAllMajor');
const getCounty = require('./county/getCounty');
const {getJobTitle, getJobTitleWriteToTxt, readFromTxtWriteToDB} = require('./getJobTitle/jobTitle.js');

const getCredentials = require('./getCredentials/getCredentials');

const {qsUniversityRank, qsMajorRank} = require('./QSranks/QSranks.js');

const {getUniversityRanks, getMajorRanks} = require('./USNEWSranks/USNEWSranks.js');

const chinaMajorRank = require('./chinaMajorRank/chinaMajorRank');

//爬取所有中国学校
// getAllColleges().catch(e=>console.log(e));

//爬取所有专业
// getMajor().catch(e=>console.log(e));

// 爬取省市县
// getCounty().catch(e=>console.log(e));

// 爬取职位名
// getJobTitle().catch(e=>console.log(e));

// 获取证书名称
// getCredentials().catch(e=>console.log(e));

// 爬取QS排名榜单学校
// qsUniversityRank().catch(e=>console.log(e));
// qsMajorRank().catch(e=>console.log(e));


// 爬取USNEWS排名榜单学校
// getUniversityRanks().catch(e=>console.log(e));
// getMajorRanks().catch(e=>console.log(e));


// 爬取中国大学专业排名
// chinaMajorRank().catch(e=>console.log(e));