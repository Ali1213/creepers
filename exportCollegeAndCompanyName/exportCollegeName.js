const public = require('./public')();

const tableName = new Map([
  ['ResumeQSUniversityRanks', ['chineseName','englishName']],
  ['ResumeUSNEWSUniversityRanks', ['chineseName','englishName']],
  ['ResumeColleges', ['chineseName','englishName']]
]);

const needFields = arr => (
  arr.reduce((prev,cur) => {
    prev[cur] = 1;
    return prev;
  },{})
)

const exportCompany = async() => {
  let names = new Set();
  for(let [collection,fields] of tableName){
    let data = await public.find(collection,{},{fields: needFields(fields)});
    data.forEach(item=>{
      for(let field of fields){
        if(item[field]){
          names.add(item[field]);
        }
      };
    })
  }
  await public.writeFile(public.path.join(__dirname,'./collegeName.json'),JSON.stringify({
    collegeNames:[...names]
  }));
  console.log('done');
}

exportCompany().catch(e=>console.log(e));