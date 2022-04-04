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

app.post('/', ( req, res, next) => postHandler(req,res)
	.then(()=>{})
	.catch(()=>{}));

const postHandler = async (req,res,next) => {
	if (!req.body.justprobe) {
		reqtemplates(req)
			.then(input_f => {
				enya(input_f)
					.then(out => {
						res.json(out)
				})
			})
			.catch(next);
	} else {
		reqtemplates(req)
			.then(input_f=> {
				enya(input_f)
					.then(async(out) => {
							if (out[`PRIMER_LEFT_0_SEQUENCE`]) {
								req.body.seqprobe = await out[`PRIMER_LEFT_0_SEQUENCE`];
								req.body.justprobe = await null;
								return req;
							} else {
								return req;
							}
						}).then(req=>reqtemplates(req))
								.then(input_f=> {
									enya(input_f)
										.then(async(out) => {
												out[`PRIMER_INTERNAL_0_SEQUENCE`] = req.body.seqprobe;
												return out;
											}).then(out=> res.json(out));
									})
			})
			.catch(next); 
	}
}

async function reqtemplates(req) {
	let seq = req.body.seq;
	let right = null;
	let left = null;
	let mid = null;
	let seqprobe = null;
	let justprobe = null;
	let input_f = null;
	if (req.body.right){
		right = req.body.right;	
		input_f=`SEQUENCE_ID=example
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
	} else if (req.body.left){
		left = req.body.left;
		input_f=`SEQUENCE_ID=example
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
	} else if (req.body.mid){
		mid = req.body.mid;
		input_f=`SEQUENCE_ID=example
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
	} else if (req.body.taqman){
		input_f=`SEQUENCE_ID=example
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
	} else if (req.body.justprobe){
		justprobe = req.body.justprobe;
		seqprobe = req.body.probeseq;
		input_f=`SEQUENCE_ID=example
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
	} else if (req.body.seqprobe){
		seqprobe = req.body.seqprobe;
		input_f=`SEQUENCE_ID=example
SEQUENCE_TEMPLATE=${seq}
SEQUENCE_INTERNAL_OLIGO=${seqprobe}
PRIMER_TASK=generic
PRIMER_PICK_LEFT_PRIMER=1
PRIMER_PICK_INTERNAL_OLIGO=1
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
		input_f=`SEQUENCE_ID=example
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
PRIMER_NUM_RETURN=3
=
`
	}
	return input_f;
};

		

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



function enya (input_f) {
	return new Promise((resolve, reject) => {

		var tmpObj = tmp.fileSync({ mode: 0644, prefix: 'projectA-', postfix: '.txt' });
		console.log("File: ", tmpObj.name);
		console.log("Filedescriptor: ", tmpObj.fd);
		
		fs.writeFileSync(tmpObj.name, input_f)

		exec(`./primer3/src/primer3_core ${tmpObj.name}`, (error, data, getter) => {
		if(error){
			console.log("error",error.message);
			reject(error);
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
		resolve(spl);
		})
	});
}



function dicey_primer (js,amplicon) {

	return new Promise((resolve,reject) => {
	
		let write_str = NULL;
		var tmpObj = tmp.fileSync({ mode: 0644, prefix: 'projectA-', postfix: '.fa' });
		console.log("File: ", tmpObj.name);
		console.log("Filedescriptor: ", tmpObj.fd);
		if ( amplicon ) {
		let fseq = js[`PRIMER_LEFT_0_SEQUENCE`]
		let rseq = js[`PRIMER_RIGHT_0_SEQUENCE`]
		write_str = `>fprimer
	${fseq}
	>rprimer
	${rseq}
	`
		} else {
		let pseq = js[`PRIMER_LEFT_0_SEQUENCE`]
		write_str = `>fprimer
	${pseq}
	`	
		}

		fs.writeFileSync(tmpObj.name, write_str)

		exec(`../dicey_primer/dicey search -i ../dicey_primer/primer3_config/ -c 45 -g ../dicey_primer/*fa.gz ${tmpObj.name}`, (error, data, getter) => {
		if( error ){
			console.log("error",error.message);
			reject(error);
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
		js["Off-target-primers"] = off_primers;
		js["Off-target-amplicons"] = off_amplicons; 
		resolve(js);
		})
	})
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