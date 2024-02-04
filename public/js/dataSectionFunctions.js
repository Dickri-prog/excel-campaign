function addDataSection(table) {
  const inputElements = $('#editorModal input')
  const rowData = []

  inputElements.map(function() {
    const value = $(this).val().trim()

    rowData.push(value)
  })

  table.row.add(rowData).draw()
  $('#editorModal').modal('hide');
}

function editDataSection(table) {
  const inputElements = $('#editorModal input')
  const rowData = []

  inputElements.map(function() {
    const value = $(this).val().trim()

    rowData.push(value)
  })

  const element = table.$('tr.selected')

  table.row(element).data(rowData)
  $('#editorModal').modal('hide');
}

function massEditDataSection(table) {
  try {
    const { validateEditInput } = validateInput
    const { showModalMessage } = template
    const validation = validateEditInput()
    if (validation.code !== 200) {
      throw new Error(JSON.stringify(validation))
    }

    const { columnIndex, dataElement, inputValue, inputElements } = validation.selectors

    let filteredIndexes = table.rows(function (idx, data, node) {
      return data[columnIndex] == inputValue; // Your filter condition here
    }).indexes();

    const setData = new Set()

    // Get the DOM nodes of the filtered rows
    $(filteredIndexes).each(function(indexEl, indexData) {
          const rowData = table.row(indexData).data();
          if ($(dataElement).length > 1) {
            $(dataElement).each(function(indexElChild, indexDataChild) {
                if (indexElChild > 0) {
                    const inputValue = $(indexDataChild).val()
                    const columnIndex = $(indexDataChild).data('value')
                      if (inputValue == '' || inputValue == ' ') {
                        throw new Error('Fill input value!!!')
                      } else if(isNaN(inputValue)) {

                          if(rowData[columnIndex].toLowerCase().includes(inputValue.toLowerCase())){
                              setData.add(indexData)
                          }

                      }else{
                          if (inputValue == rowData[columnIndex]) {
                              setData.add(indexData)
                          }
                      }
                }
            })
          }else {
            setData.add(indexData)
          }
        });

    const filteredIndexArray = table.rows(Array.from(setData)).indexes();

    const newData = []

    inputElements.each(function() {
      const value = $(this).val()
      let id = $(this).prop('id').split('-')
          id = parseInt(id[1])

        if (value == '' || value == ' ') {
          throw new Error('Fill input value!!!')
        }else {
            $(filteredIndexArray).each(function(indexEl, indexData) {
                const rowData = table.row(indexData).data();
                rowData[id] = value
                table.row(indexData).data(rowData)
             })
        }

    })

    $('#editorModal').modal('hide');
  } catch (e) {
    const { showModalMessage } = template
    console.log(e);
    if (e.name == 'Error') {
      showModalMessage(JSON.parse(e.message))
    }else {
      showModalMessage('Something wrong!!!')
    }
    return;
  }
}

function massRemoveDataSection(table) {
  try {
    const dataElement = $('#editorModal .modal-body .mass-editBy input.search-input-by')

    let inputValue = $(dataElement[0]).val()
    let columnIndex = $(dataElement[0]).data('value')

    if ($(dataElement).length <= 0) {
        throw new Error('Please select input!!!')
    }

    let filteredIndexes = table.rows(function (idx, data, node) {
      if(isNaN(inputValue)) {

          if(data[columnIndex].toLowerCase().includes(inputValue.toLowerCase())){
              return true
          }

      }else{
          if (inputValue == data[columnIndex]) {
              return true
          }
      }
    }).indexes();

    const setData = new Set()

    // Get the DOM nodes of the filtered rows
    $(filteredIndexes).each(function(indexEl, indexData) {
          const rowData = table.row(indexData).data();
          if ($(dataElement).length > 1) {
            $(dataElement).each(function(indexElChild, indexDataChild) {
                if (indexElChild > 0) {
                    const inputValue = $(indexDataChild).val()
                    const columnIndex = $(indexDataChild).data('value')
                      if (inputValue == '' || inputValue == ' ') {
                        throw new Error('Fill input value!!!')
                      } else if(isNaN(inputValue)) {

                          if(rowData[columnIndex].toLowerCase().includes(inputValue.toLowerCase())){
                              setData.add(indexData)
                          }

                      }else{
                          if (inputValue == rowData[columnIndex]) {
                              setData.add(indexData)
                          }
                      }
                }
            })
          }else {
            setData.add(indexData)
          }
        });

    const filteredIndexArray = table.rows(Array.from(setData)).indexes().toArray();


    table.rows(filteredIndexArray).remove().draw()

    $('#editorModal').modal('hide');
    $('#editorModal button#saveBtn').text('Save Changes')
    $('#editorModal button#saveBtn').removeClass('btn-danger').addClass('btn-primary');
  } catch (e) {
    if (e.name == 'Error') {
      $('#editorModal .messages').text(e.message)
      $('#editorModal .messages').show()
    }else {
      $('#editorModal .messages').text('Something wrong!!!')
      $('#editorModal .messages').show()
    }

    setTimeout(function() {
      $('#editorModal .messages').hide()
    }, 3000)
  }

}

async function templateAddSection() {
  try {
    const { validateEditInput } = validateInput
    const { RequestDataTempate, showModalMessage } = template
    const validation = validateEditInput()

    if (validation.code !== 200) {
      throw new Error(JSON.stringify(validation))
    }else {
      let values = {
        attribute: {},
        content: {}
      }
      const { dataElement, inputElements } = validation.selectors

      $(dataElement).each((index, item) => {
        const label = $(item).parent().find('label')
        values['attribute'][$(label).text()] = $(item).val()
        $(item).attr('disabled', true)
      });

      $(inputElements).each((index, item) => {
        const label = $(item).parent().find('label')
        values['content'][$(label).text()] = $(item).val()
        $(item).attr('disabled', true)
      });

      values['data_id'] = $('#editorModal').data('sectionId')

      values['name'] = $('#editorModal .modal-body  input#name').val()

      values = JSON.stringify(values)

      const option = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: values
      }

        const result = await RequestDataTempate('/template/detail', option)
        if (result !== null) {
          showModalMessage(result)
          $(dataElement).each((index, item) => {
            $(item).attr('disabled', false)
          });

          $(inputElements).each((index, item) => {
            $(item).attr('disabled', false)
          });
        }else {
          showModalMessage({
            code: 400,
            message: 'Something wrong!!!'
          })
        }


    }
  } catch (e) {
    const { showModalMessage } = template

    console.log(e);
    if (e.name == 'Error') {
      showModalMessage(JSON.parse(e.message))
    }else {
      showModalMessage('Something wrong!!!')
    }
    return;
  }
}

async function templateEditSection () {
  try {
    const { validateEditInput } = validateInput
    const { RequestDataTempate, showModalMessage } = template
    const validation = validateEditInput()

    if (validation.code !== 200) {
      throw new Error(JSON.stringify(validation))
    }else {
      let values = {
        attribute: {},
        content: {}
      }
      const { dataElement, inputElements } = validation.selectors

      $(dataElement).each((index, item) => {
        const label = $(item).parent().find('label')
        values['attribute'][$(label).text()] = $(item).val()
        $(item).attr('disabled', true)
      });

      $(inputElements).each((index, item) => {
        const label = $(item).parent().find('label')
        values['content'][$(label).text()] = $(item).val()
        $(item).attr('disabled', true)
      });

      values['id'] = $('#editorModal').data('sectionChildId')

      values['name'] = $('#editorModal .modal-body  input#name').val()

      values = JSON.stringify(values)

      const option = {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: values
      }

      const result = await RequestDataTempate('/template/detail', option)
      if (result !== null) {
        showModalMessage(result)
        $(dataElement).each((index, item) => {
          $(item).attr('disabled', false)
        });

        $(inputElements).each((index, item) => {
          $(item).attr('disabled', false)
        });
      }else {
        showModalMessage({
          code: 400,
          message: 'Something wrong!!!'
        })
      }
    }
  } catch (e) {
    const { showModalMessage } = template

    console.log(e);
    if (e.name == 'Error') {
      showModalMessage(JSON.parse(e.message))
    }else {
      showModalMessage('Something wrong!!!')
    }
    return;
  }
}
