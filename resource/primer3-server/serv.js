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
	//Really confusing, but LEFT = RIGHT and RIGHT = LEFT because we're dealing with RNA and 
	//Primer3 just assumes that they are arbitrary.
	let input_f = null;
	var seq = req.body.seq;
	if (req.body.right) {
		console.log ( 'Variant primers' );
		var right = req.body.right;
		input_f = `SEQUENCE_ID=example
SEQUENCE_TEMPLATE=${seq}
SEQUENCE_FORCE_LEFT_END=${right}
PRIMER_TASK=generic
PRIMER_PICK_LEFT_PRIMER=1
PRIMER_PICK_INTERNAL_OLIGO=1
PRIMER_PICK_RIGHT_PRIMER=1
PRIMER_OPT_SIZE=20
PRIMER_MIN_SIZE=18
PRIMER_MAX_SIZE=25
PRIMER_MIN_TM=52
PRIMER_INTERNAL_MAX_TM=70
PRIMER_INTERNAL_MIN_TM=62
PRIMER_INTERNAL_OPT_TM=67
PRIMER_PRODUCT_SIZE_RANGE=75-200
PRIMER_EXPLAIN_FLAG=1
PRIMER_NUM_RETURN=1
=
`
	} else if (req.body.left) {
		console.log ( 'Variant primers' );
		var left = req.body.left;
		input_f = `SEQUENCE_ID=example
SEQUENCE_TEMPLATE=${seq}
SEQUENCE_FORCE_RIGHT_END=${left}
PRIMER_TASK=generic
PRIMER_PICK_LEFT_PRIMER=1
PRIMER_PICK_INTERNAL_OLIGO=1
PRIMER_PICK_RIGHT_PRIMER=1
PRIMER_OPT_SIZE=20
PRIMER_MIN_SIZE=18
PRIMER_MAX_SIZE=25
PRIMER_MIN_TM=52
PRIMER_INTERNAL_MAX_TM=70
PRIMER_INTERNAL_MIN_TM=62
PRIMER_INTERNAL_OPT_TM=67
PRIMER_PRODUCT_SIZE_RANGE=75-200
PRIMER_EXPLAIN_FLAG=1
PRIMER_NUM_RETURN=1
=
`
	} else if (req.body.mid && !req.body.justprobe) {
		console.log ( 'Variant primers' );
		var mid = req.body.mid;
		input_f = `SEQUENCE_ID=example
SEQUENCE_TEMPLATE=${seq}
SEQUENCE_INTERNAL_OVERLAP_JUNCTION_LIST=${mid}
PRIMER_INTERNAL_MIN_5_PRIME_OVERLAP_OF_JUNCTION=1
PRIMER_INTERNAL_MIN_3_PRIME_OVERLAP_OF_JUNCTION=19
PRIMER_INTERNAL_MAX_SIZE=23
PRIMER_TASK=generic
PRIMER_PICK_LEFT_PRIMER=1
PRIMER_PICK_INTERNAL_OLIGO=1
PRIMER_PICK_RIGHT_PRIMER=1
PRIMER_OPT_SIZE=20
PRIMER_MIN_SIZE=20
PRIMER_MAX_SIZE=23
PRIMER_MIN_TM=52
PRIMER_PRODUCT_SIZE_RANGE=75-200
PRIMER_EXPLAIN_FLAG=1
PRIMER_NUM_RETURN=1
=
`
	} else if (req.body.taqman) {
		console.log( 'Total primers with taqman' );
		input_f = `SEQUENCE_ID=example
SEQUENCE_TEMPLATE=${seq}
PRIMER_TASK=generic
PRIMER_PICK_LEFT_PRIMER=1
PRIMER_PICK_INTERNAL_OLIGO=1
PRIMER_PICK_RIGHT_PRIMER=1
PRIMER_OPT_SIZE=20
PRIMER_MIN_SIZE=18
PRIMER_MAX_SIZE=25
PRIMER_INTERNAL_MAX_TM=70
PRIMER_INTERNAL_MIN_TM=62
PRIMER_INTERNAL_OPT_TM=67
PRIMER_PRODUCT_SIZE_RANGE=75-200
PRIMER_EXPLAIN_FLAG=1
PRIMER_NUM_RETURN=3
=
`
	} else if ( req.body.justprobe ) {
		console.log( 'Find probe with overlap' );
		var justprobe = req.body.mid;
		var seqprobe = req.body.seqprobe;
		input_f = `SEQUENCE_ID=example
SEQUENCE_TEMPLATE=${seqprobe}
PRIMER_PICK_INTERNAL_OLIGO=0
PRIMER_PICK_LEFT_PRIMER=1
PRIMER_PICK_RIGHT_PRIMER=0
PRIMER_MIN_3_PRIME_OVERLAP_OF_JUNCTION=12
PRIMER_MIN_5_PRIMER_OVERLAP_OF_JUNCTION=1
SEQUENCE_OVERLAP_JUNCTION_LIST=${justprobe}
PRIMER_MAX_SIZE=25
PRIMER_MIN_SIZE=18
PRIMER_MUST_MATCH_FIVE_PRIME=hnnnn
PRIMER_OPT_TM=66
PRIMER_MAX_TM=70
PRIMER_MIN_TM=62
PRIMER_EXPLAIN_FLAG=1
PRIMER_NUM_RETURN=1
=
`
	} else if ( req.body.provideprobe ) {
		console.log( 'Finding primers given probe sequence ');
		var internal = req.body.internal;
		input_f = `SEQUENCE_ID=example
SEQUENCE_TEMPLATE=${seq}
SEQUENCE_INTERNAL_OLIGO=${internal}
PRIMER_TASK=generic
PRIMER_PICK_LEFT_PRIMER=1
PRIMER_PICK_INTERNAL_OLIGO=0
PRIMER_PICK_RIGHT_PRIMER=1
PRIMER_OPT_SIZE=20
PRIMER_MIN_SIZE=18
PRIMER_MAX_SIZE=22
PRIMER_PRODUCT_SIZE_RANGE=75-150
PRIMER_EXPLAIN_FLAG=1
PRIMER_NUM_RETURN=1
=
`
	} else {
		console.log ( 'Regular primer probe' );
		input_f = `SEQUENCE_ID=example
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
	} 
	if ( !req.body.justprobe ) {
		return enya (input_f, res);
	} else {
		probe_json = enya (input_f, res);
		console.log( 'Finding primers given probe sequence' );
		var internal = probe_json[`PRIMER_LEFT_0_SEQUENCE`];
		input_f = `SEQUENCE_ID=example
SEQUENCE_TEMPLATE=${seq}
SEQUENCE_INTERNAL_OLIGO=${internal}
PRIMER_TASK=generic
PRIMER_PICK_LEFT_PRIMER=1
PRIMER_PICK_RIGHT_PRIMER=1
PRIMER_OPT_SIZE=20
PRIMER_MIN_SIZE=18
PRIMER_MAX_SIZE=22
PRIMER_PRODUCT_SIZE_RANGE=75-150
PRIMER_EXPLAIN_FLAG=1
PRIMER_NUM_RETURN=1
=
`
		return dicey_primer ( enya (input_f,res), true );
	}

});

/*
app.get ('/', ( req, res ) => {
	var seq = req.param('seq')
	console.log( 'Check' );
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
*/

function oligotm ( oligos, res ) {
	let tms = {}
	for ( const [oligo, seq] of Object.entries(oligos)) {
		try {
			exec(`./primer3/src/oligotm ${seq}`, ( error, data, getter ) => {
				if ( error ) {
					console.log('error', error.message);
					return;
				}
				tms[oligo] = data
			})

		} catch ( err ) {
			console.error ( err )
		}
	}
	return res.json ( tms );
}



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

function dicey_primer (res,amplicon) {

	try {
	
	let write_str = NULL;
	var tmpObj = tmp.fileSync({ mode: 0644, prefix: 'projectA-', postfix: '.fa' });
	console.log("File: ", tmpObj.name);
	console.log("Filedescriptor: ", tmpObj.fd);
	if ( amplicon ) {
	let fseq = res[`PRIMER_LEFT_0_SEQUENCE`]
	let rseq = res[`PRIMER_RIGHT_0_SEQUENCE`]
	write_str = `>fprimer
${fseq}
>rprimer
${rseq}
`
	} else {
	let pseq = res[`PRIMER_LEFT_0_SEQUENCE`]
	write_str = `>fprimer
${pseq}
`	
	}

  	fs.writeFileSync(tmpObj.name, write_str)

	exec(`../dicey_primer/dicey search -i ../dicey_primer/primer3_config/ -c 45 -g ../dicey_primer/*fa.gz ${tmpObj.name}`, (error, data, getter) => {
	if( error ){
		console.log("error",error.message);
		return;
	}
	//console.log("data",data);

	data = JSON.parse(data);
	let off_primers = 0;
	for (let i of data["data"]["primers"]) {
		off_primers += 1;
	}
	let off_amplicons = 0;
	for (let i of data["data"]["amplicons"]){
		off_amplicons += 1;
	}

	let js = {"Off-targets": [
				"Off-target-primers": off_primers,
				"Off-target-amplicosn": off_amplicons,
			]
			}
	let merge = {
				res,
				js
				}
	//console.log ( JSON.stringify( spl ));
	return merge;

	})

	}catch ( err ) {
		console.error( err );
	}
}

/*
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
*/