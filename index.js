const getAllColleges = require('./chinaColleges/getAllColleges');
const getMajor = require('./major/getAllMajor');
const getCounty = require('./county/getCounty');
const {getJobTitle, getJobTitleWriteToTxt, readFromTxtWriteToDB} = require('./getJobTitle/jobTitle.js');

const getCredentials = require('./getCredentials/getCredentials');

//爬取所有中国学校
// getAllColleges().catch(e=>console.log(e));

//爬取所有专业
// getMajor().catch(e=>console.log(e));

// 爬取省市县
// getCounty().catch(e=>console.log(e));

// 爬取职位名
// getJobTitle().catch(e=>console.log(e));

// 获取证书名称

getCredentials().catch(e=>console.log(e));


