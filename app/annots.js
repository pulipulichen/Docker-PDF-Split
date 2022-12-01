let inputFile = 'input.pdf'

const {AnnotationFactory} = require('annotpdf');
const path = require('path');
const fs = require('fs')
const fg = require('fast-glob')

let extractScores = async function (inputFile) {

  let data = []
  let id = null
  let user = null
  let keys = []

  // console.log(AnnotationFactory.loadFile)
  let factory = await AnnotationFactory.loadFile(inputFile)
  let filename = path.basename(inputFile)
  if (filename.indexOf('.') > -1) {
    filename = filename.slice(0, filename.lastIndexOf('.'))
  }
  
    let pages = await factory.getAnnotations()

    pages.forEach(annotations => {
      annotations.forEach(annotation => {
        // console.log(annotation.length)
        if (annotation.type !== '/FreeText') {
          // console.log(annotation)
          return false
        }

        let contents = annotation.contents
        // console.log(annotation.contents)

        contents = contents.toLowerCase()

        if (!contents.startsWith('q')) {
          if (isNaN(contents)) {
            return false
          }

          if (user) {
            data.push(user)
            user = {}
          }
          else {
            user = {}
          }

          user.id = contents
        }
        else {
          let parts = contents.split('.').map(p => p.trim())
          let key = parts[0]
          if (keys.indexOf(key) === -1) {
            keys.push(key)
          }

          let score = Number(parts[1])

          user[key] = score
        }
      })
    })

  if (user) {
    data.push(user)
  }

  keys.sort()

  // ------------------ 輸出

  let rows = []

  rows.push([
    'id',
    ...keys
  ].join(','))

  data.forEach(user => {
    let id = user.id

    let row = [id]

    keys.forEach(key => {
      let score = 0
      if (typeof(user[key]) !== 'undefined') {
        score = user[key]
      }
      row.push(score)
    })

    rows.push(row.join(','))
  })

  console.log(rows)

  fs.writeFileSync(path.join(__dirname, 'output', filename + '.csv'), rows.join('\n'), 'utf8')
}

let main = async function () {
  const entries = await fg(['/app/data/*.pdf'], { dot: true });

  // console.log(entries)

  // extractScores(inputFile)
  for (let i = 0; i < entries.length; i++) {
    await extractScores(entries[i])
  }
}

main()