const { exec } = require("child_process");

const port = 80


var fs = require('fs');
var http = require('http');
var https = require('https');



var privateKey  = fs.readFileSync('./rootCA.key', 'utf8');
var certificate = fs.readFileSync('./rootCA.pem', 'utf8');

console.log ( ' ------------------------------------------- ' );
console.log ( ' '+ privateKey );
console.log ( ' ------------------------------------------- ' );

var credentials = {key: privateKey, cert: certificate, passphrase:' '};
var express = require('express');
var app = express();
app.use(express.json());
// your express configuration here

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

httpServer.listen(8080);
httpsServer.listen(80);




app.get('/', (req, res) => {
  exec("./primer3/src/primer3_core ./primer3/example", (error, data, getter) => {
 	if(error){
		console.log("error",error.message);
		return;
	}
		console.log("data",data);

	  	let lines = data.split ('\n')
	  	let spl = {}
	  	for ( let l of lines )
	  	 {
			let v = l.split ('=')
			spl[v[0]]=v[1]
		 }
		return res.json (spl) 

});

})


