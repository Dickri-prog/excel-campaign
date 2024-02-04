const ExcelJS = require('exceljs'),
workbook = new ExcelJS.Workbook(),
express = require('express'),
app = express(),
fileUpload = require("express-fileupload"),
path = require('path'),
bodyParser = require('body-parser'),
{ Octokit } = require("octokit")

app.use("/public", express.static(path.join(__dirname, 'public')));
app.use('/upload', fileUpload());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

let shaData = null
let fetchedData = false
let dataArr = []
let detailDataArr = []

const octokit = new Octokit({
  auth: process.env.githubSecretKey
})

async function fetchContentFile() {
  const fetchingData = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
    owner: 'Dickri-prog',
    repo: 'jsonData',
    path: 'excel-campaign/products.json',
    headers: {
      'X-GitHub-Api-Version': '2022-11-28'
    }
  }).then((result) => {
    shaData = result['data']['sha']
    const base64Data = result['data']['content']
    const buffer = Buffer.from(base64Data, 'base64');
    const originalString = buffer.toString();

    let jsonDataContent = JSON.parse(originalString)

    dataArr = jsonDataContent['template']
    detailDataArr = jsonDataContent['template_detail']

    console.log("fetched!!!")
    return true
  }).catch(error => {
    console.error(error)
    return false
  })

  return fetchingData
}

function checkingData(req, res, next) {
    if (process.env.githubSecretKey === undefined) {
      res.status(500).json({
        items: 0,
        message: 'Something wrong system'
      })

    }else {
      if (fetchedData === false) {
        fetchedData = fetchContentFile().then(result => {
          if (result) {
            next()
          } else {
            res.status(400).json({
              items: 0,
              message: 'Something wrong system'
            })
          }
        })
        .catch(error => {
          console.error(error);
          res.status(400).json({
            items: 0,
            message: 'Something wrong system'
          })
        })
      } else {
        next()
      }
    }


}

async function updateFile() {
	const jsonDataContent = {
		"template": dataArr,
		"template_detail": detailDataArr
	}
  const updatedContent = Buffer.from(JSON.stringify(jsonDataContent, null, 2)).toString('base64');
  const updatedData = await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
    owner: 'Dickri-prog',
    repo: 'jsonData',
    sha: shaData,
    path: 'excel-campaign/products.json',
    message: 'update products.json',
    content: updatedContent,
    headers: {
      'X-GitHub-Api-Version': '2022-11-28'
    }
  })
    .then(result => {
      shaData = result['data']['content']['sha']
      return true
    })
    .catch(error => {
      console.error(error.message);
      return false
    })

  return updatedData
}


app.get('/', (req, res) => {
	res.render('index')
});


app.get('/template', checkingData, (req, res) => {
	try {
		const data_id = parseInt(req.query.data_id)


		if (data_id === undefined || isNaN(data_id)) {
				res.json({
					code: 200,
					items: dataArr
				})
				return
		}

		const data = []
		for (var i = 0; i < detailDataArr.length; i++) {
			if (detailDataArr[i].data_id == data_id) {
				data.push(detailDataArr[i])
			}
		}

		res.json({
			code: 200,
			items: data
		})
		return
	} catch (e) {
		res.json({
			code: 400,
			message: 'Someting wrong!!!'
		})
		return
	}
})

app.post('/template', checkingData, async (req, res) => {
	const formData = req.body


	function findIndexOfMaxId() {
		if (dataArr.length === 0) {
			return -1; // Return -1 if the array is empty
		}

		// let maxIndex = 0; // Initialize the index of the maximum ID to the first element
		let maxId = dataArr[0].id; // Initialize the maximum ID to the first element's ID

		for (let i = 1; i < dataArr.length; i++) {
			if (dataArr[i].id > maxId) {
				maxId = dataArr[i].id;
				// maxIndex = i;
			}
		}

		return maxId;
	}

	const maxId = findIndexOfMaxId()
	let id;

	if (maxId !== -1) {
		id = maxId +1
	}else {
		id = 1
	}

	const name = formData.name

	if (name !== undefined) {
		dataArr.push({
			id,
			name
		})

		const updatedContent = await updateFile()


    if (updatedContent) {
			res.json({
				code: 200,
				data_id: id,
				message: 'Add data successfully!!!'
			})
			return;
    } else {
			fetchedData = false
			res.json({
				code: 404,
				message: 'Add data unsuccessfull!!!'
			})
			return;
    }


	}else {
		res.json({
			code: 404,
			message: 'Add data unsuccessfull!!!'
		})
		return;
	}

})

app.put('/template', checkingData, async (req, res) => {
	const id = parseInt(req.query.id)
	const formData = req.body

	const findIndex = dataArr.findIndex(item => item.id === id)

	if (id === undefined) {
		res.json({
			code: 404,
			message: 'Add data unsuccessfull!!!'
		})
	}

	if (isNaN(id)) {
		res.json({
			code: 404,
			message: 'Add data unsuccessfull!!!'
		})
	}else {
		if (findIndex !== -1) {
			const name = formData.name

			if (name !== undefined) {
				dataArr[findIndex] = {
					id,
					name
				}


				const updatedContent = await updateFile()


		    if (updatedContent) {
					res.json({
						code: 200,
						data_id: id,
						message: 'Add data successfully!!!'
					})
					return
				}else {
					fetchedData = false
					res.json({
						code: 404,
						message: 'Add data unsuccessfull!!!'
					})
					return;
				}
			}else {
				res.json({
					code: 404,
					message: 'Add data unsuccessfull!!!'
				})
				return;
			}

		}else {
			res.json({
				code: 404,
				message: 'Add data unsuccessfull!!!'
			})
		}
	}

})

app.delete('/template', checkingData, async (req, res) => {
	const id = parseInt(req.query.id)


	if (isNaN(id)) {
		res.json({
			code: 400,
			message: 'delete data unsuccessfull!!!'
		})
	}else {
		const findIndex = dataArr.findIndex(item => item.id === id)

		if (findIndex != -1) {
			dataArr.splice(findIndex, 1)

      const filterIndexDetail = detailDataArr.map((item, index) => {
          if (item.data_id === id) {
              return index;
          }
          return null;
      }).filter(id => id !== null);


      let index = filterIndexDetail[0];

        do {
          detailDataArr.splice(index, 1)
          filterIndexDetail.shift()
          index = filterIndexDetail[0] - 1
        } while (filterIndexDetail.length > 0);




			const updatedContent = await updateFile()


	    if (updatedContent) {
				res.json({
					code: 200,
					message: 'delete data successfull!!!'
				})
				return;
	    } else {
				fetchedData = false
				res.json({
					code: 400,
					message: 'delete data unsuccessfull!!!'
				})
				return;
	    }
		}else {
			res.json({
				code: 404,
				message: 'delete data unsuccessfull!!!'
			})
		}
	}

})



app.get('/template/detail', checkingData, (req, res) => {
	try {
		const id = parseInt(req.query.id)


		if (id === undefined || isNaN(id)) {
			res.json({
				code: 400,
				message: 'Cannot get data!!!'
			})
			return
		}


			const index = detailDataArr.findIndex(item => item.id === id)

			if (index != -1) {
				res.json({
					code: 200,
					item: detailDataArr[index]
				})
				return;
			}else {
				res.json({
					code: 400,
					message: 'Cannot get data!!!'
				})
				return
			}
	} catch (e) {
		res.json({
			code: 400,
			message: 'Someting wrong!!!'
		})
		return
	}
})

app.post('/template/detail', checkingData, async (req, res) => {
	const formData = req.body
	const data_id = parseInt(formData.data_id)


	function findIndexOfMaxId() {
		if (detailDataArr.length === 0) {
			return -1; // Return -1 if the array is empty
		}

		// let maxIndex = 0; // Initialize the index of the maximum ID to the first element
		let maxId = detailDataArr[0].id; // Initialize the maximum ID to the first element's ID

		for (let i = 1; i < detailDataArr.length; i++) {
			if (detailDataArr[i].id > maxId) {
				maxId = detailDataArr[i].id;
				// maxIndex = i;
			}
		}

		return maxId;
	}

	const maxId = findIndexOfMaxId()

	if (data_id === undefined || isNaN(data_id)) {
		res.json({
			code: 400,
			message: 'Add data unsuccessfully!!!'
		})
		return;
	}else {
		let id;

		if (maxId !== -1) {
			id = maxId +1
		}else {
			id = 1
		}

		detailDataArr.push({
			id,
			data_id,
			...formData
		})


		const updatedContent = await updateFile()


		if (updatedContent) {
			res.json({
				code: 200,
				message: 'add data successfull!!!'
			})
			return;
		} else {
			fetchedData = false
			res.json({
				code: 400,
				message: 'add data unsuccessfull!!!'
			})
			return;
		}
	}

})

app.put('/template/detail', checkingData, async (req, res) => {
		const formData = req.body
		const id = parseInt(formData.id)

		if (id === undefined || isNaN(id)) {
			res.json({
				code: 404,
				message: 'Something wrong data!!!'
			})
			return;
		}else {
				const findIndex = detailDataArr.findIndex(item => item.id == id)
				const keysOfData = Object.keys(formData)

				if (findIndex != -1) {
					if (keysOfData.length > 0) {
						keysOfData.forEach((item, i) => {
							let key = item.trim()

							detailDataArr[findIndex][key] = formData[item]
						});

						const updatedContent = await updateFile()


				    if (updatedContent) {
							res.json({
								code: 200,
								message: 'Data has changed!!!'
							})
							return;
				    } else {
							fetchedData = false
							res.json({
								code: 400,
								message: 'Data cannot change!!!'
							})
							return;
				    }


					}else {
						res.json({
							code: 400,
							message: 'Data cannot change!!!'
						})
						return;
					}
				}else {
					res.json({
						code: 404,
						message: 'Data not found!!!'
					})
					return;
				}
		}
})

app.delete('/template/detail', checkingData, async (req, res) => {
	const id = parseInt(req.query.id)


	if (isNaN(id)) {
		res.json({
			code: 400,
			message: 'delete data unsuccessfull!!!'
		})
	}else {
		const findIndexDetail = detailDataArr.findIndex(item => item.id === id)

		if (findIndexDetail != -1) {
			detailDataArr.splice(findIndexDetail, 1)

			const updatedContent = await updateFile()


	    if (updatedContent) {
				res.json({
					code: 200,
					message: 'delete data successfull!!!'
				})
				return;
	    } else {
				fetchedData = false
				res.json({
					code: 400,
					message: 'delete data unsuccessfull!!!'
				})
				return;
	    }
		}else {
			res.json({
				code: 404,
				message: 'delete data unsuccessfull!!!'
			})
			return
		}
	}

})

app.get('/template/detail/json', checkingData, (req, res) => {
	res.json({
		items: detailDataArr
	})
})


app.post('/upload', (req, res) => {

    if (req.files.docFile !== undefined) {

      if (req.files.docFile.mimetype == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {


                workbook.xlsx.load(req.files.docFile.data)
            		    .then(async function () {
            		        // const worksheet = workbook.getWorksheet('Sheet1');
                        const excelData = []

            		        workbook.worksheets[0].eachRow({ includeEmpty: false }, function (row, rowNumber) {
                            if (rowNumber === 1) {

                              const headerData = []

                              for (var i = 1; i < row.values.length; i++) {
                                headerData.push(row.values[i])
                              }
                              excelData.push(headerData)
                            }else {

                              const contentData = []
                              for (var i = 1; i < row.values.length; i++) {
                                contentData.push(row.values[i])
                              }
                              excelData.push(contentData)
                            }

            		        });

                        // console.log(excelData);

                        res.json({
                          content: excelData
                        })

            		        });
      }else {
        res.status(400)
        .json({
          message: "File should be zip or excel file!!!"
        })
      }

    }else {
      res.status(400)
      .json({
        message: "No data File!!!"
      })
    }
})


const port = 3002;

app.listen(port, () => console.log(`Server started on port ${port}`));
