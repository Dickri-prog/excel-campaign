const createElement = (function() {
  function createSelectElement() {
    const table = $('#example').DataTable()
    const tableHeader = table.table().header();
    const headerCells = $(tableHeader).find('th');

    let textArr = ''
    let index = 0
    headerCells.map(function() {
        const text = $(this).text().trim()
        // const textId = $(this).text().trim().replace(/ /g, '-').toLowerCase();

        textArr += `
          <option value="${index}">${text}</option>
        `

        index++
    })

    return `
      <select class="form-select" aria-label="Default select example">
        ${textArr}
      </select>
    `
  }

  function createInputDetailTemplate(nameValue, table) {
    const { massEditBy } = massEditData
    const { listToEdit } = massToEditData

    return `
      <div class="mb-3">
        <label for="name" class="form-label"><h6> Name </h6> </label>
        <input class="form-control form-control-sm" id="name" type="text" placeholder="Name of product" value="${nameValue}">
      </div>

      <div class="row mass-editBy">
          <div class="col-4">
            Mass Edit By :
          </div>
          <div class="col-8">
            ${massEditBy(table)}
          </div>
      </div>
      <div class="row mt-5 list-editBy">
          <div class="col-4">
              Select list to edit :
          </div>
          <div class="col-8">
          ${listToEdit(table)}
          </div>
      </div>
    `
  }

  return {
    createSelectElement,
    createInputDetailTemplate
  }
})()

const templateDetail = (function() {
  async function getDetailData(url) {
      try {
          const response = await fetch(url);
          if (!response.ok) {
              throw new Error('Network response was not ok');
          }
          const data = await response.json();
          if (data.code === 200) {
            return data;
          }

          return null;
      } catch (error) {
          console.error('There was a problem fetching the data:', error);
          return null;
      }
  }

  return {
    getDetailData
  }
})()

const template = (function() {
  function checkAndInsertBeforeElement(selector, element, to) {
    if ($(selector).length === 0) {
      $(to).before(element)
    }else {
      $(selector).show()
    }
  }

  function ShowLoadingData() {
    $('#editorModal .modal-body').html(`
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    `)
  }

  function hideLoadingData() {
    const spinnerElement = $('#editorModal .modal-body .spinner-border')

    spinnerElement.hide()
  }

  function useTemplate() {
    $('#editorModal button#saveBtn').hide()
    $('#editorModal button#template').hide()




    $('#editorModal .modal-title').html(`
        <h3>Template</h3>
    `)

    templateData()

    checkAndInsertBeforeElement('#editorModal .modal-header button#back-btn-template', `
    <button type="button" class="btn btn-outline-primary" id="back-btn-template" style="padding: 0; border: none; margin: 5px; margin-right: 12px;">
    <svg xmlns="http://www.w3.org/2000/svg" width="27" height="27" fill="currentColor" class="bi bi-backspace" viewBox="0 0 16 16">
    <path d="M5.83 5.146a.5.5 0 0 0 0 .708L7.975 8l-2.147 2.146a.5.5 0 0 0 .707.708l2.147-2.147 2.146 2.147a.5.5 0 0 0 .707-.708L9.39 8l2.146-2.146a.5.5 0 0 0-.707-.708L8.683 7.293 6.536 5.146a.5.5 0 0 0-.707 0z"/>
    <path d="M13.683 1a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-7.08a2 2 0 0 1-1.519-.698L.241 8.65a1 1 0 0 1 0-1.302L5.084 1.7A2 2 0 0 1 6.603 1h7.08zm-7.08 1a1 1 0 0 0-.76.35L1 8l4.844 5.65a1 1 0 0 0 .759.35h7.08a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1h-7.08z"/>
    </svg>
    </button>
    `, '#editorModal .modal-header .modal-title')

    checkAndInsertBeforeElement('#editorModal .modal-header button#add-template', `
    <button class="btn btn-primary ms-5 p-1" id="add-template" tabindex="0" aria-controls="example" type="button"><span>Add</span></button>
    `, '#editorModal .modal-header button.btn-close')

    checkAndInsertBeforeElement('#editorModal .modal-header button#use-template', `
    <button class="btn btn-primary ms-2 p-1" id="use-template" tabindex="0" aria-controls="example" type="button"><span>Use</span></button>
    `, '#editorModal .modal-header button.btn-close')

    checkAndInsertBeforeElement('#editorModal .modal-header button#delete-template', `
    <button class="btn btn-danger ms-2 p-1" id="delete-template" tabindex="0" aria-controls="example" type="button"><span>Delete</span></button>
    `, '#editorModal .modal-header button.btn-close')


    const addButtonTemplate = $('#editorModal button#add-template')
    const useTemplateBtn = $('#editorModal .modal-header button#use-template')
    const deleteButtonTemplate = $('#editorModal .modal-header button#delete-template')
    const backButtonTemplate = $('#editorModal button#back-btn-template')

    useTemplateBtn.hide()
    addButtonTemplate.hide()
    deleteButtonTemplate.hide()


    if (addButtonTemplate.data('events') === undefined && addButtonTemplate.data('events') != 'click') {
      $('#editorModal button#add-template').on('click', function() {

        const sectionData = $('#editorModal').data('section')

          if (sectionData == 'templateItem') {
            templateDataAddInput()
          }else if (sectionData == 'templateItemChild') {
            templateDataAddInputChild()
          }

        addButtonTemplate.data('events', 'click')
        $('#editorModal .modal-body button#next-template').on('click', submitTemplate)
      })
    }

    if (useTemplateBtn.data('events') === undefined && useTemplateBtn.data('events') != 'click') {
      useTemplateBtn.on('click', async function(event) {

        const sectionData = $('#editorModal').data('section')
        const sectionId = $('#editorModal').data('sectionId')

        event.disabled = true

        if (sectionData == 'templateItemChild') {
            const result = await RequestDataTempate(`/template?data_id=${sectionId}`)

            if (result !== null) {
              const items = result.items
              const table = $('#example').DataTable()
              const tableHeader = table.table().header();
              const headerCells = $(tableHeader).find('th');

              function checkColumnIndex(attributeKey) {
                let columnIndex;

                $(headerCells).each(function(index, value) {
                  if ($(value).text() == attributeKey) {
                    columnIndex = index
                  }
                })

                return columnIndex
              }

              function attributeChecking(attributeKey, value, filteredIndexes = null) {
                const columnIndex = checkColumnIndex(attributeKey)

                // console.log(columnIndex, attributeKey, value);

                if (filteredIndexes === null) {
                  filteredIndexes = table.rows(function (idx, data, node) {
                    return data[columnIndex] == value;
                  }).indexes();

                  return filteredIndexes;
                }else {
                  const setData = new Set()

                  // console.log(filteredIndexes);

                  $(filteredIndexes).each(function(indexEl, indexData) {
                    const rowData = table.row(indexData).data();

                    if(isNaN(value)) {

                      if(rowData[columnIndex].toLowerCase().includes(value.toLowerCase())){
                          setData.add(indexData)
                      }

                    }else{
                      if (value == rowData[columnIndex]) {
                          setData.add(indexData)
                      }
                    }
                  })

                  return Array.from(setData);
                }



              }

              if (items.length > 0) {
                try {
                  const setData = new Set()

                  $(items).each(function(index, element) {
                    const item = element
                    const attributeKeys = Object.keys(item.attribute)
                    const contentKeys = Object.keys(item.content)

                    const value = item['attribute'][attributeKeys[0]]

                    let filteredIndexes = attributeChecking(attributeKeys[0], value)

                    const setData = new Set()

                    if ($(filteredIndexes).length > 0) {

                      if ($(attributeKeys).length > 1) {
                        $(attributeKeys).each(function(indexData, dataKey) {
                          if (indexData >= 1) {
                                const value = item['attribute'][dataKey]

                                filteredIndexes = attributeChecking(dataKey, value, filteredIndexes)

                            }
                          })

                          const filteredIndexArray = table.rows(filteredIndexes).indexes();

                          $(contentKeys).each(function(indexData, dataKey) {
                            const value = item['content'][dataKey]
                            const columnIndex = checkColumnIndex(dataKey)

                            $(filteredIndexArray).each(function(indexEl, indexData) {
                                const rowData = table.row(indexData).data();
                                rowData[columnIndex] = value
                                table.row(indexData).data(rowData)
                             })
                          })
                        }
                    }
                  })

                  event.disabled = false

                  showModalMessage({
                    code: 200,
                    message: "Successfully!!!"
                  })
                } catch (e) {
                  showModalMessage({
                    code: 400,
                    message: 'Something wrong!!!'
                  })
                }
              }
            }else {
              showModalMessage({
                code: 400,
                message: 'Something wrong!!!'
              })
            }
        }

        useTemplateBtn.data('events', 'click')
      })
    }

    if (deleteButtonTemplate.data('events') === undefined && deleteButtonTemplate.data('events') != 'click') {
      deleteButtonTemplate.on('click', async function() {

        const sectionData = $('#editorModal').data('section')
        const sectionId = $('#editorModal').data('sectionId')
        const sectionChildId = $('#editorModal').data('sectionChildId')

        const option = {
          method: 'DELETE'
        }

        if (sectionData == 'templateAttributeItem') {
            const result = await RequestDataTempate(`/template/detail?id=${sectionChildId}`, option)

            if (result !== null) {
              showModalMessage(result)
              templateDataChild(sectionId)
            }else {
              showModalMessage({
                code: 400,
                message: 'Something wrong!!!'
              })
            }
        }else if (sectionData == 'templateItemChild') {
          const result = await RequestDataTempate(`/template?id=${sectionId}`, option)

          if (result !== null) {
            showModalMessage(result)
            templateData()
          }else {
            showModalMessage({
              code: 400,
              message: 'Something wrong!!!'
            })
          }
        }

        deleteButtonTemplate.data('events', 'click')
      })
    }

    if (backButtonTemplate.data('events') === undefined && backButtonTemplate.data('events') != 'click') {
        backButtonTemplate.on('click', function() {
          const sectionData = $('#editorModal').data('section')

            if (sectionData == 'templateItem') {
              $('.container .row button#mass-edit').click()
            }else if (sectionData == 'templateItemChild') {
              templateData()
            }else if (sectionData == 'templateAttributeItem') {
              const id = $('#editorModal').data('sectionId')
              if (id !== undefined) {
                templateDataChild(id)
              }else {
                templateData()
              }
            }

            backButtonTemplate.data('events', 'click')
        })
    }

  }

  function templateDataAddInput() {
    $('#editorModal .modal-body').html(`
        <div class="row">
            <div class="col-6">
              <div class="mb-3">
                <label for="templateInput" class="form-label">Template Name</label>
                <input type="text" class="form-control" id="templateInput">
              </div>
            </div>
            <div class="col-2">
                <button class="btn btn-primary p-1" id="next-template" tabindex="0" aria-controls="example" type="button"><span>Next</span></button>
            </div>
        </div>
    `)
  }

  function templateDataAddInputChild() {
    $('#editorModal .modal-body').html(`
      <div class="row">
          <div class="col-6">
          <div class="mb-3">
            <label for="title-template" class="form-label">Title Name</label>
            <input type="text" class="form-control" id="title-template">
          </div>
          </div>
          <div class="col-2">
              <button class="btn btn-primary p-1" id="generate-template" tabindex="0" aria-controls="example" type="button"><span>generate</span></button>
          </div>
      </div>
    `)
    generateTemplateBy()
  }

  async function templateData()  {
    ShowLoadingData()

    const result = await RequestDataTempate('/template')

    if (result !== null) {
      const items = result.items
      if ($(items).length > 0) {
        templateItem($(items))
        templateItemListener()
        hideLoadingData()
      }else {
        $('#editorModal .modal-header button#delete-template').hide()
        $('#editorModal .modal-header button#use-template').hide()
        $('#editorModal').data('section', 'templateItem')
        $('#editorModal .modal-body').html(`
            <p>No Template</p>
        `)
      }
    }else {
      $('#editorModal .modal-header button#delete-template').hide()
      $('#editorModal .modal-header button#use-template').hide()
      $('#editorModal').data('section', 'templateItem')
      $('#editorModal .modal-body').html(`
          <p>Someting wrong!!!</p>
      `)
    }
  }

  function templateItem(items) {
    let htmlEl = ''
    $(items).each(function() {
      htmlEl += `
        <div class="row">
            <div class="col-12">
                <button type="button" class="btn btn-secondary p-2 mt-2 mb-2 template-item-btn" style="min-width: 100%;" data-id="${this.id}">${this.name}</button>
            </div>
        </div>
      `
    })
    $('#editorModal .modal-body').html(htmlEl)
    $('#editorModal').data('section', 'templateItem')
  }

  function templateItemListener() {
    const templateBtn = $('#editorModal .modal-body .template-item-btn')
    $('#editorModal button#saveBtn').hide()
    $('#editorModal .modal-header button#add-template').show()
    $('#editorModal .modal-header button#delete-template').hide()
    $('#editorModal .modal-header button#use-template').hide()
    if (templateBtn.data('events') === undefined && templateBtn.data('events') != 'click') {
      templateBtn.on('click', function() {
        const id = $(this).data('id')

        templateDataChild(id)

        $('#editorModal .modal-header button#use-template').show()
        $('#editorModal .modal-body .template-item-btn').data('events', 'click')
        $('#editorModal').data('sectionId', id)
      })
    }

  }

  async function templateDataChild(id){
    ShowLoadingData()

    const result = await RequestDataTempate(`/template?data_id=${id}`)

    if (result !== null) {
      let htmlEl = ''
      let item = result.items
      if (item.length > 0) {
        $(item).each(function() {
          htmlEl += `
            <div class="row">
                <div class="col-12">
                    <button type="button" class="btn btn-secondary p-2 mt-2 mb-2 template-item-child" style="min-width: 100%;" data-id="${this.id}">${this.name}</button>
                </div>
            </div>
          `
        })

        $('#editorModal .modal-body').html(htmlEl)
        $('#editorModal').data('section', 'templateItemChild')
        templateItemChildListener()
        hideLoadingData()
      }else {
        htmlEl = `
          <h2> No Data</h2>
        `
        $('#editorModal .modal-body').html(htmlEl)
        $('#editorModal').data('section', 'templateItemChild')
      }
    }else {
      templateData()
    }
  }

  function templateItemChildListener() {
    const templateChildBtn = $('#editorModal .modal-body button.template-item-child')
    $('#editorModal button#saveBtn').hide()
    $('#editorModal .modal-header button#delete-template').show()
    $('#editorModal .modal-header button#add-template').show()
    $('#editorModal .modal-header button#use-template').show()
    if (templateChildBtn.data('events') === undefined && templateChildBtn.data('events') != 'click') {
      const { getDetailData } = templateDetail
      const { createInputDetailTemplate } = createElement
      templateChildBtn.on('click', async function() {

          ShowLoadingData()

          $('#editorModal .modal-header button#add-template').hide()
          $('#editorModal .modal-header button#use-template').hide()

            const id = $(this).data('id')
            const url = `template/detail?id=${id}`
            let data = await getDetailData(url)

          if (data !== null) {
              data = data.item
              const table = $('#example').DataTable()
              const keysAttributeOnly = Object.keys(data['attribute']);
              const keysContentOnly = Object.keys(data['content']);


              $('#editorModal .modal-body').html(createInputDetailTemplate(data.name, table))

              $('#editorModal .modal-header button#delete-template').show()

              generateBtnListener(table)

              keysAttributeOnly.forEach((item, i) => {
                const attribute = 'select-'+item.trim().replace(/ /g, '-').toLowerCase()
                const list = $(`#editorModal .modal-body .mass-editBy ul li input#${attribute}`)

                list.click()
                $(`#editorModal .modal-body .mass-editBy .search-input-list-row input#search-${list.val()}`).val(data['attribute'][item])
              });

              keysContentOnly.forEach((item, i) => {
                const content = 'edit-'+item.trim().replace(/ /g, '-').toLowerCase()
                const list = $(`#editorModal .modal-body .list-editBy ul li input#${content}`)

                list.click()
                $(`#editorModal .modal-body .list-editBy .edit-input-list-row input#edit-${list.val()}`).val(data['content'][item])
              });


              $('#editorModal').data('section', 'templateAttributeItem')
              $('#editorModal').data('sectionChildId', data.id)
              $('#editorModal button#saveBtn').data('editorBy', 'template-edit');
              templateChildBtn.data('events', 'click')
            }else {
              const id = $('#editorModal').data('sectionId', id)

              templateDataChild(id)
            }
        })
        }
    }

  function generateTemplateBy() {
    const input = $('#editorModal .modal-body input#title-template')
    const generateTemplateByBtn = $('#editorModal .modal-body button#generate-template')
    const { createInputDetailTemplate } = createElement
    const table = $('#example').DataTable()

    if (generateTemplateByBtn.data('events') === undefined && generateTemplateByBtn.data('events') != 'click') {
      generateTemplateByBtn.on('click', function() {
        $('#editorModal .modal-header button#add-template').hide()
        $('#editorModal .modal-header button#use-template').hide()
        $('#editorModal .modal-body').html(createInputDetailTemplate(input.val(), table))

        generateBtnListener(table)

        generateTemplateByBtn.data('events', 'click')
        $('#editorModal').data('section', 'templateAttributeItem')
      })
    }
  }

  function generateBtnListener(table) {
    const {massEditBy, elementList, removeElementList} = massEditData
    const {listToEdit, elementToEditList, removeElementToEditList} = massToEditData

    const editListByElement = $('#editorModal .modal-body .mass-editBy input.checkbox-select-list')
    const listToEditElement = $('#editorModal .modal-body .list-editBy input.checkbox-select-list-edit')

    editListByElement.change(function() {
      if ($(this).prop('checked')) {
        elementList($(this), table)

      }else {
        removeElementList($(this), table)
      }
    });

    listToEditElement.change(function() {
      if ($(this).prop('checked')) {
        elementToEditList($(this), table)
      } else {
        removeElementToEditList($(this), table)
      }
    });

    $('#editorModal button#saveBtn').data('editorBy', 'template-add');

    $('#editorModal button#saveBtn').show()
  }

  async function submitTemplate() {
      const InputName = $('#editorModal .modal-body input').val().trim()
      const sectionData = $('#editorModal').data('section')

      if (InputName == '' || InputName == ' ') {
        showModalMessage({
          code: 400,
          message: 'Please fill the input name!!!'
        })
      }else {

        if (sectionData == 'templateItem') {
          const values = {}

          values['name'] = InputName


          let formBody = [];
          for (const property in values) {
            const encodedKey = encodeURIComponent(property);
            const encodedValue = encodeURIComponent(values[property]);
            formBody.push(encodedKey + "=" + encodedValue);
          }
          formBody = formBody.join("&");

          $('#editorModal button#next-template').prop('disabled', true)

          const option = {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
            },
            body: formBody
          }

          const result = await RequestDataTempate('/template', option)

          if (result !== null) {
            $('#editorModal button#next-template').prop('disabled', false)
            $('#editorModal').data('sectionId', result.data_id)
            $('#editorModal').data('sectionChildId', result.id)

              showModalMessage(result)

              templateDataAddInputChild()
          }else {
            $('#editorModal button#next-template').prop('disabled', false)
              showModalMessage({
                code: 400,
                message: 'Something Error'
              })
          }

        }
      }

  }

  function showModalMessage(messageObj) {
    $('#editorModal .modal-footer .messages').text(messageObj.message)

    if (messageObj.code === 200) {
      $('#editorModal .modal-footer .messages').addClass('text-success')
    }else {
      $('#editorModal .modal-footer .messages').addClass('text-danger')
    }
    $('#editorModal .modal-footer .messages').show()

    setTimeout(() => {
      $('#editorModal .modal-footer .messages').hide()
      if (messageObj.code === 200) {
        $('#editorModal .modal-footer .messages').removeClass('text-success')
      }else {
        $('#editorModal .modal-footer .messages').removeClass('text-danger')
      }
    }, 2000)
  }

  async function RequestDataTempate(url, option = null) {
    try {
        let response;

        if (option !== null) {
          response = await fetch(url, option);
        }else {
          response = await fetch(url);
        }
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();

        if (data.code === 200) {
          return data;
        }

        return null;
    } catch (error) {
        console.error('There was a problem fetching the data:', error);
        return null;
    }
}


  return {
    useTemplate,
    showModalMessage,
    templateData,
    RequestDataTempate
  }
})()
