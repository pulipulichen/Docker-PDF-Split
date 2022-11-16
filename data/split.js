const fs = require('fs');
const path = require('path');
const CsvReadableStream = require('csv-reader');

const exec = require('child_process').exec

let inputPDFFilename = 'input.pdf'
let configFilename = 'config.csv'

let inputStream = fs.createReadStream(path.resolve(__dirname, configFilename), 'utf8');

let i = 0

inputStream
	.pipe(new CsvReadableStream({ parseNumbers: false, parseBooleans: true, trim: true }))
	.on('data', function (row) {
		if (i === 0) {
			i++
			return false
		}

    // console.log('A row arrived: ', i, row)
		let filename = row[0]
		if (!filename.endsWith('.pdf')) {
			filename = filename + '.pdf'
		}

		let pages = row[1]
		if (pages.indexOf(';') > -1) {
			pages = pages.replace(/;/g, ',')
		}
		if (pages.endsWith(',')) {
			pages = pages.slice(0, -1)
		}

		if (fs.existsSync(path.join(__dirname, filename))) {
			i++
			console.log(`${filename} already exists.`)
			return false
		}

		let cmd = `qpdf ${path.join(__dirname, inputPDFFilename)} --pages ${path.join(__dirname, inputPDFFilename)} ${pages} -- ${path.join(__dirname, 'output', filename)}`
		console.log(cmd)		

		exec(cmd,
	  function (error, stdout, stderr) {
	    // console.log('stdout: ' + stdout);
	    // console.log('stderr: ' + stderr);
	    if (error !== null) {
	      console.log('exec error: ' + error);
	    }
		});

		i++
	})
	.on('end', function () {
    // console.log('No more rows!');
		console.log('finish');
	});