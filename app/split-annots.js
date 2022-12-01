// let inputFile = 'input.pdf'

const {AnnotationFactory} = require('annotpdf');
const path = require('path');
const fs = require('fs')
const fg = require('fast-glob')
const pdf = require('pdf-page-counter')

const exec = require('child_process').exec

let execAsync = function (cmd) {
  return new Promise(function (resolve, reject) {
    exec(cmd,
      function (error, stdout, stderr) {
        // console.log('stdout: ' + stdout);
        // console.log('stderr: ' + stderr);
        if (error !== null) {
          console.error('exec error: ' + error);
          reject(error)
        }
        resolve(stdout)
      });
  })
}

let extractSplitInformation = async function (inputFile) {

  // console.log(AnnotationFactory.loadFile)
  let factory = await AnnotationFactory.loadFile(inputFile)
  let filename = path.basename(inputFile)
  if (filename.indexOf('.') > -1) {
    filename = filename.slice(0, filename.lastIndexOf('.'))
  }
  
  let pages = await factory.getAnnotations()

  let splitInformation = []
  // console.log()
  pages.forEach((annotations, page_number) => {
    annotations.forEach(annotation => {
      // console.log(annotation.length)
      if (annotation.type !== '/FreeText') {
        // console.log(annotation)
        return false
      }

      let contents = annotation.contents.trim()
      // console.log(annotation.contents)

      if (!contents.startsWith('|')) {
				return false
			}

      let sub_filename = contents.slice(1)
			// console.log(page_number, sub_filename)

      splitInformation.push({
        page: (page_number+1),
        filename: sub_filename,
      })
    })
  })

  return splitInformation
}

let splitPDF = async function (inputFile, splitInformation) {

  if (Array.isArray(splitInformation) === false || 
      splitInformation.length < 2) {
    console.error('splitInformation is incompleted: ' + inputFile)
    return false
  }

  let basename = path.basename(inputFile)
  let basenameNoExt = path.parse(inputFile).name

  await execAsync(`mkdir -p ${path.join(__dirname, '../output/' + basenameNoExt)}`)

  let files = []
  for (let i = 0; i < splitInformation.length; i++) {
    files.push('"./' + basenameNoExt + '/' + splitInformation[i].filename + ' - ' + basename + '"')
    break
    let {page, filename} = splitInformation[i]
    let start = page
    let end
    if (i < splitInformation.length - 1) {
      end = splitInformation[(i+1)].page - 1
    }
    else {
      end = (await pdf(fs.readFileSync(inputFile))).numpages
    }

    let cmd = `qpdf "${inputFile}" --pages ${inputFile} ${start}-${end} -- "../${path.join(__dirname, '../output/' + basenameNoExt + '/',  filename + ' - ' + basename)}"`
    console.log(cmd)
    
    await execAsync(cmd)
  }

  // await execAsync(`LC_ALL=C; cd "${path.join(__dirname, '../output/')}"; 7z a -mx=9 -ms=on "./${basenameNoExt}.7z" ${files.join(' ')}`)
  let compressCommand = `LC_ALL=C; cd "${path.join(__dirname, '../output/' + basenameNoExt)}"; zip -j -q -9 "../${basenameNoExt}.zip" *.pdf`
  // console.log(compressCommand)
  await execAsync(compressCommand)
}

let main = async function () {
  const entries = await fg(['/app/input/*.pdf'], { dot: true });

  // console.log(entries)

  // extractScores(inputFile)
  for (let i = 0; i < entries.length; i++) {
    let inputFile = entries[i]
    let splitInformation = await extractSplitInformation(inputFile)
    console.log(splitInformation)
    await splitPDF(inputFile, splitInformation)
  }
}

main()