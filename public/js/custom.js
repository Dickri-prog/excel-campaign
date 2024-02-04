const {headerTable} = elements

const btn = document.querySelector('#btnUpload')
const inpFile = document.querySelector('input#inpFile')

$(inpFile).on('click' , (e) => {
      const element = $(e.target)
      element.parent().find('#loading').addClass("active")
      element.parent().find("#process").removeClass("active")
})

$(inpFile).on('change' , (e) => {
      const element = $(e.target)
      element.parent().find("#loading").removeClass("active")
      element.parent().find("#error").removeClass("active")
})

btn.addEventListener('click', async function() {
  $('#error').removeClass("active")
  $('#loading').removeClass("active")
  $('#process').text('Processing...')
  $('#process').addClass("active")
  if (inpFile.files.length === 0) {
    $('#error').addClass("active")
    $('#error').text("No file changes")
    $('#process').text()
    $('#process').removeClass("active")
    return;
  }
  const formData = new FormData()

  formData.append("docFile", inpFile.files[0])

  const result = await uploadFile(formData)

  const data = result.content
  const table = $('table')
  const header = table.find('thead')
  const body = table.find('tbody')


  header.html("")
  body.html("")

  data.forEach((item, index) => {
    if (index === 0) {
      const element = headerTable(item)

      $(header).append(element)
      return;
    }
  })

  const dataTable = dataTableInitialize('#example')

  data.shift()
  dataTable.clear().rows.add(data).draw();

  if (addEditorElement()) {
    editorButtonListener(dataTable)
    $('#process').text('Success...')
    setTimeout(() => {
      $('#process').removeClass('active')
    }, 2000)
  }

})
