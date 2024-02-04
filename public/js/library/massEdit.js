const elementToModif = (function() {
  function searchDataProduct(element) {
    const columnIndex = parseInt(($(element.target).data('value')))
    const id = $(element.target).prop('id')
    const table = $('#example').DataTable();
    const distinctValues = table
    .column(columnIndex, { search: 'applied' }) // Use 'applied' to consider the applied search
    .data()
    .unique()
    .toArray();
      var datalistElement = $(`#editorModal .modal-body .mass-editBy datalist#${id}-options`);
      datalistElement.empty(); // Clear existing options

      $.each(distinctValues, function(index, value) {
          datalistElement.append('<option value="' + value + '">');
      });

      return true
  }

  function selectElement(e) {
    const element = $(e.target)
    const inputElement = element.parent().parent().find('input')

    const data = `${$(inputElement).attr('id')},${$(inputElement).data('value')}`

    element.data('select-search-element', data)

    $('#editorModal').modal('hide');

  }

  return {
    searchDataProduct: searchDataProduct,
    selectElement: selectElement
  }
})()

const {selectElement, searchDataProduct} = elementToModif

const massToEditData = (function() {
  function listToEdit(table) {
    const tableHeader = table.table().header();
    const headerCells = $(tableHeader).find('th');

    let textArr = ''
    let index = 0
    headerCells.map(function() {
        const text = $(this).text().trim()
        const textId = $(this).text().trim().replace(/ /g, '-').toLowerCase();

        textArr += `
          <li>
          <a class="dropdown-item" href="#">
          <input type="checkbox" class="me-2 checkbox-select-list-edit" id="edit-${textId}" value="${index}" class="me-2">
          <label for="edit-${textId}">${text}</label>
          </a>
          </li>
        `

        index++
    })

    return `
    <div class="dropdown">
      <button class="btn btn-secondary dropdown-toggle p-1" type="button" id="
      edit-listBy" data-bs-toggle="dropdown" aria-expanded="false" data-bs-auto-close="outside">Select</button>
      <ul class="dropdown-menu" aria-labelledby="edit-listBy" style="overflow: scroll; max-height: 200px;">
        ${textArr}
      </ul>
    </div>
    `
  }

  function elementToEditList(element, table) {
    const valueElement = $(element).val()
    const textElement = $(element).parent().find('label').text()
    const elementId = `edit-${valueElement}`
    const elementClass = 'edit-input-by'


    const parentElement = $('#editorModal .modal-body .list-editBy .edit-input-list-row')

    const lengthParentElement = parentElement.length

    if (lengthParentElement > 0) {
          const lengthChildElement = $(parentElement[lengthParentElement-1]).children().length

          if (lengthParentElement <= lengthChildElement) {
            parentElement.append(`
              <div class="col-6">
                <div class="mb-3">
                  <label for="${elementId}" class="form-label">${textElement}</label>
                  <input type="text" class="form-control ${elementClass}" id="${elementId}">
                </div>
              </div>
            `)
          }else {
            const parentElement = $('#editorModal .modal-body .list-editBy')

            parentElement.append(`
                <div class="row mt-5 edit-input-list-row">
                <div class="col-6">
                  <div class="mb-3">
                    <label for="${elementId}" class="form-label">${textElement}</label>
                    <input type="text" class="form-control ${elementClass}" id="${elementId}">
                  </div>
                </div>
                </div>
              `)
          }
    }else {
      const parentElement = $('#editorModal .modal-body .list-editBy')

      parentElement.append(`
          <div class="row mt-5 edit-input-list-row">
          <div class="col-6">
            <div class="mb-3">
              <label for="${elementId}" class="form-label">${textElement}</label>
              <input type="text" class="form-control ${elementClass}" id="${elementId}">
            </div>
          </div>
          </div>
        `)
    }
  }

  function removeElementToEditList(element, table) {
      const valueElement = parseInt($(element).val())
      const elementId = `edit-${valueElement}`

      if ($(`#editorModal .modal-body .list-editBy #${elementId}`).parent().parent().parent().children().length < 2) {
        $(`#editorModal .modal-body .list-editBy #${elementId}`).parent().parent().parent().remove()
      }else{
        $(`#editorModal .modal-body .list-editBy #${elementId}`).parent().parent().remove()
      }

      return true;
    }

  return {
    listToEdit: listToEdit,
    elementToEditList: elementToEditList,
    removeElementToEditList: removeElementToEditList
  }
})()

const massEditData = (function() {
  function massEditBy(table) {
    const tableHeader = table.table().header();
    const headerCells = $(tableHeader).find('th');

    let textArr = ''
    let index = 0
    headerCells.map(function() {
        const text = $(this).text().trim()
        const textId = $(this).text().trim().replace(/ /g, '-').toLowerCase();

        textArr += `
          <li>
          <a class="dropdown-item" href="#">
          <input type="checkbox" class="me-2 checkbox-select-list" id="select-${textId}" value="${index}" class="me-2">
          <label for="select-${textId}">${text}</label>
          </a>
          </li>
        `

        index++
    })

    return `
    <div class="dropdown">
      <button class="btn btn-secondary dropdown-toggle p-1" type="button" id="editBy" data-bs-toggle="dropdown" aria-expanded="false" data-bs-auto-close="outside">Select</button>
      <ul class="dropdown-menu" aria-labelledby="editBy" style="overflow: scroll; max-height: 200px;">
        ${textArr}
      </ul>
    </div>
    `
  }

  function elementList(element, table) {
    const valueElement = $(element).val()
    const textElement = $(element).parent().find('label').text()
    const elementId = `search-${valueElement}`
    const elementClass = 'search-input-by'

    const parentElement = $('#editorModal .modal-body .mass-editBy .search-input-list-row')

    const lengthParentElement = parentElement.length

    if (lengthParentElement > 0) {
          const lengthChildElement = $(parentElement[lengthParentElement-1]).children().length

          if (lengthParentElement <= lengthChildElement) {
            parentElement.append(`
              <div class="col-6">
                <div class="mb-3">
                    <div class="row">
                        <div class="col-8">
                          <label for="${elementId}" class="form-label">${textElement}</label>
                          <input type="search" list="${elementId}-options" class="form-control ${elementClass}" id="${elementId}" data-value="${valueElement}" placeholder="Search...">
                          <datalist id="${elementId}-options">

                          </datalist>
                        </div>
                        <div class="col-4">
                            <button type="button" class="btn btn-primary p-1 mt-3 select-element">Or Select</button>
                        </div>
                    </div>
                  </div>
                </div>
            `)
          }else {
            const parentElement = $('#editorModal .modal-body .mass-editBy')

            parentElement.append(`
                <div class="row mt-5 search-input-list-row">
                <div class="col-6">
                  <div class="mb-3">
                  <div class="row">
                    <div class="col-8">
                      <label for="${elementId}" class="form-label">${textElement}</label>
                      <input type="search" list="${elementId}-options" class="form-control ${elementClass}" id="${elementId}" data-value="${valueElement}" placeholder="Search...">
                      <datalist id="${elementId}-options">

                      </datalist>
                    </div>
                    <div class="col-4">
                        <button type="button" class="btn btn-primary p-1 mt-3 select-element">Or Select</button>
                    </div>
                    </div>
                  </div>
                </div>
                </div>
              `)
          }
    }else {
      const parentElement = $('#editorModal .modal-body .mass-editBy')

      parentElement.append(`
          <div class="row mt-5 search-input-list-row">
          <div class="col-6">
            <div class="mb-3">
              <div class="row">
                  <div class="col-8">
                    <label for="${elementId}" class="form-label">${textElement}</label>
                    <input type="search" list="${elementId}-options" class="form-control ${elementClass}" id="${elementId}" data-value="${valueElement}" placeholder="Search...">
                    <datalist id="${elementId}-options">

                    </datalist>
                  </div>
                  <div class="col-4">
                      <button type="button" class="btn btn-primary p-1 mt-3 select-element">Or Select</button>
                  </div>
              </div>
            </div>
          </div>
          </div>
        `)
    }

    $(`#editorModal .modal-body .mass-editBy input#${elementId}`).on('keydown', searchDataProduct)

    $(`#editorModal .modal-body .mass-editBy button.select-element`).on('click', selectElement)

    return true;
  }

  function removeElementList(element, table) {
    const valueElement = $(element).val()
    const elementId = `search-${valueElement}`

    if ($(`#editorModal .modal-body .mass-editBy #${elementId}`).parent().parent().parent().parent().parent().children().length < 2) {
      $(`#editorModal .modal-body .mass-editBy #${elementId}`).parent().parent().parent().parent().parent().remove()
    }else{
      $(`#editorModal .modal-body .mass-editBy #${elementId}`).parent().parent().parent().parent().remove()
    }

    $(`#editorModal .modal-body .mass-editBy #${elementId}`).off('keydown', searchDataProduct)

    return true
  }

  return {
    massEditBy: massEditBy,
    elementList: elementList,
    removeElementList: removeElementList
  }
})()

const validateInput = (function() {
  function validateEditInput() {
    const dataElement = $('#editorModal .modal-body .mass-editBy input.search-input-by')
    const inputElements = $('#editorModal .modal-body .list-editBy .edit-input-list-row input')

    let inputValue = $(dataElement[0]).val()
    let columnIndex = $(dataElement[0]).data('value')

    if ($(dataElement).length <= 0) {
        return {
          code: 400,
          message: 'Please select input!!!'
        }
    }else if ($(inputElements).length <= 0) {
      return {
        code: 400,
        message: 'Please select input!!!'
      }
    }

    if (inputValue == '' || inputValue == ' ') {
      return {
        code: 400,
        message: 'Fill input value!!!'
      }
    }


    return {
      code: 200,
      message: 'Successfully!!!',
      selectors: {
        dataElement,
        inputElements,
        columnIndex,
        inputValue
      }
    }
  }

  return {
    validateEditInput
  }
})()
