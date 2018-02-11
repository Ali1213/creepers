const public = require('./public')();

const tableName = new Map([
  ['ResumeCompanies', ['chineseName','englishName']],
  ['ResumeCompanyRanks', ['chineseName','englishName']]
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
  await public.writeFile('./companyName.json',JSON.stringify({
    companyNames:[...names]
  }));
  console.log('done');
}

exportCompany().catch(e=>console.log(e));