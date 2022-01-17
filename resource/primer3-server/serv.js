const { exec } = require("child_process");

const port = 80


var fs = require('fs');
var http = require('http');
var https = require('https');
var tmp = require('tmp');
var cors = require('cors')


var privateKey  = fs.readFileSync('./key.pem', 'utf8');
var certificate = fs.readFileSync('./cert.pem', 'utf8');

console.log ( ' ------------------------------------------- ' );
//console.log ( ' '+ privateKey );
console.log ( ' ------------------------------------------- ' );

var credentials = {key: privateKey, cert: certificate, passphrase:'sp3arGunner!!'};
var express = require('express');
var app = express();

app.use(cors())
app.use(express.json());
// your express configuration here

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

httpServer.listen(80);
httpsServer.listen(443);


app.post('/', ( req, res ) => {
	var seq = req.body.seq;
	var input_f = `SEQUENCE_ID=example
SEQUENCE_TEMPLATE=${seq}
PRIMER_TASK=generic
PRIMER_PICK_LEFT_PRIMER=1
PRIMER_PICK_INTERNAL_OLIGO=0
PRIMER_PICK_RIGHT_PRIMER=1
PRIMER_OPT_SIZE=20
PRIMER_MIN_SIZE=18
PRIMER_MAX_SIZE=22
PRIMER_PRODUCT_SIZE_RANGE=75-150
PRIMER_EXPLAIN_FLAG=1
=
`
	return enya (input_f, res);

});


app.get ('/', ( req, res ) => {
	var seq = req.param('seq')

	var seq = req.param('seq')
	var input_f = `SEQUENCE_ID=example
SEQUENCE_TEMPLATE=${seq}
PRIMER_TASK=generic
PRIMER_PICK_LEFT_PRIMER=1
PRIMER_PICK_INTERNAL_OLIGO=0
PRIMER_PICK_RIGHT_PRIMER=1
PRIMER_OPT_SIZE=20
PRIMER_MIN_SIZE=18
PRIMER_MAX_SIZE=22
PRIMER_PRODUCT_SIZE_RANGE=75-150
PRIMER_EXPLAIN_FLAG=1
=
`
	return enya (input_f, res);

});

function enya (input_f, res) {

	try {
	

	var tmpObj = tmp.fileSync({ mode: 0644, prefix: 'projectA-', postfix: '.txt' });
	console.log("File: ", tmpObj.name);
	console.log("Filedescriptor: ", tmpObj.fd);
	
  	fs.writeFileSync(tmpObj.name, input_f)

	exec(`./primer3/src/primer3_core ${tmpObj.name}`, (error, data, getter) => {
	if(error){
		console.log("error",error.message);
		return;
	}
	//console.log("data",data);

  	let lines = data.split ('\n')
  	let spl = {}
  	for ( let l of lines )
  	 {
		let v = l.split ('=')
		if (v && v.length>1 && v[0] && v[0].length>0)
			spl[v[0]]=v[1]
	 }
	//console.log ( JSON.stringify( spl ));
	return res.json (spl) 

	})

	}catch ( err ) {
		console.error( err );
	}


}

app.get('/primer3', (req, res) => {


	try {
  		fs.writeFileSync('/var/primer3/t.itxt', content)
 		 //file written successfully

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
} catch (err) {
  console.error(err)
}


})


