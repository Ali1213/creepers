// 得到TKK
var exec = require('child_process').exec; 
var cmdStr = 'python getTKK.py';



var gettrans=function(text){
	exec(cmdStr, function(err,stdout,stderr){
		if(err) {
			console.log('get TKK is error' + stderr);
		} else {
			//console.log(stdout);
			// 读取TKK
			var rf=require("fs");  
			var tkk=rf.readFileSync("TKK","utf-8");  
			//console.log(tkk);
			var gettk= require('./gettk.js')
			res=gettk.tk(text, tkk.toString())
			//console.log(res)
			var testenc = encodeURI(text)
			//console.log(encodeURI(text))
	
			var exec2 = require('child_process').exec; 
			var cmdStr2 = 'python http.py '+testenc+' '+res+' ';
			exec2(cmdStr2, function(err,stdout,stderr){
				if(err) {
					console.log('http is error' + err);
				} else {
					// 最终的结果
					console.log(stdout);
				}
			});
		}
	}); 
}



module.exports.gettrans=gettrans;
