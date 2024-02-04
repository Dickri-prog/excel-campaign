const {
  useTemplate: useTemplate
} = template

function uploadFile(data) {
  return new Promise((resolve, reject) => {
    fetch('/upload', {
          method: 'POST',
          body: data
      })
      .then(response => {
        if (!response.ok) {
          throw response.json()
        }

        return response.json()
      })
      .then(resolve)
      .catch(reject)
  })
}

function dataTableInitialize(selector) {
  const table = $(selector).DataTable({
    deferRender: false,
    buttons:['copy', 'csv', 'excel', 'pdf', 'print'],
    language: {
          emptyTable: "Loading..."
    },
    "columnDefs": [
      {
         "targets": "_all",
         "defaultContent": ""
      }
   ]
  });

  table.buttons().container()
  .appendTo('#example_wrapper .col-md-6:eq(0)');

  headerCells = null;

  return table
}

function addEditorElement() {
  try {
    $('.container').append(
      `<div class="row position-fixed top-50 end-0">
          <div class="col-sm-12">
            <div class="d-flex flex-column">
            <button class="btn btn-secondary mb-2 p-1" id="edit" tabindex="0" aria-controls="example" type="button" disabled><span>Edit</span></button>
            <button class="btn btn-secondary mb-2 p-1" id="mass-edit" tabindex="0" aria-controls="example" type="button"><span>Mass Edit</span></button>
            <button class="btn btn-primary mb-2 p-1" id="add" tabindex="0" aria-controls="example" type="button"><span>Add</span></button>
            <button class="btn btn-danger mb-2 p-1" id="remove" tabindex="0" aria-controls="example" type="button"><span>Remove</span></button>
            <button class="btn btn-danger p-1" id="mass-remove" tabindex="0" aria-controls="example" type="button"><span>Mass Remove</span></button>
            </div>
          </div>
       </div>
      `)
      return true
  } catch (e) {
      return false
  }
}

function editorButtonListener(table) {
  $('#example tbody').on( 'click', 'tr', function () {
      if ($(this).hasClass('selected')) {
        $(this).removeClass('selected')
        $('.container .row button#edit').prop('disabled', true);
      }else {
        table.$('tr.selected').removeClass('selected');
        $(this).addClass('selected');
        $('.container .row button#edit').prop('disabled', false);


        const searchElement = $('#editorModal .modal-body .mass-editBy button.select-element')

        $(searchElement).each(function() {
          const data = $(this).data('select-search-element')

          if (data !== undefined) {
            selectedSearchElement(data)
          }
        })
      }

  } );

  $('#editorModal button.btn-close').on('click', function(e) {
        $('#editorModal').modal('hide');
        $('#editorModal .modal-header button#add-template').hide()
        $('#editorModal .modal-header button#back-btn-template').hide()
  });

  $('#editorModal button#saveBtn').on('click', saveData);

  $('.container .row button#add').on('click', function(e) {
    const {createInput} = inputElements

    $('#editorModal button#saveBtn').data('editorBy', 'add');
    $('#editorModal button#saveBtn').text('Save Changes');
    $('#editorModal button#saveBtn').removeClass('btn-danger').addClass('btn-primary');

    $('#editorModal .modal-title').html(`
        <h3>Add row </h3>
      `)

      $('#editorModal .modal-body').html(`
         ${createInput(table)}
        `)

    $('#editorModal').modal('show');
  })

  $('.container .row button#remove').on('click', function(e) {

    table.row('.selected').remove().draw()

  })

  $('.container .row button#mass-remove').on('click', function(e) {
    const {massEditBy, elementList, removeElementList} = massEditData

    $('#editorModal button#saveBtn').data('editorBy', 'mass-remove');
    $('#editorModal button#saveBtn').text('remove')
    $('#editorModal button#saveBtn').removeClass('btn-primary').addClass('btn-danger');

    $('#editorModal .modal-title').html(`
        <h3>Mass Remove Row </h3>
      `)
      $('#editorModal .modal-body').html(`
        <div class="row mass-editBy">
            <div class="col-4">
              Mass remove By :
            </div>
            <div class="col-4">
              ${massEditBy(table)}
            </div>
        </div>
        `)
    $('#editorModal').modal('show');

    $('#editorModal .modal-body .mass-editBy input.checkbox-select-list').change(function() {
      // Check if the checkbox is checked
      if ($(this).prop('checked')) {
        elementList($(this), table)
      } else {
        removeElementList($(this), table)
      }
    });

  })

  $('.container .row button#edit').on('click', function(e) {
    const selectedRow = table.row('.selected').data()
    const {editInput} = inputElements

    $('#editorModal button#saveBtn').data('editorBy', 'edit');
    $('#editorModal button#saveBtn').text('Save Changes')
    $('#editorModal button#saveBtn').removeClass('btn-danger').addClass('btn-primary');
    $('#editorModal .modal-title').html(`
        <h3>Edit row </h3>
      `)
      $('#editorModal .modal-body').html(`
        ${editInput(table, selectedRow)}
        `)
    $('#editorModal').modal('show');
  })

  $('.container .row button#mass-edit').on('click', function(e) {
    const {massEditBy, elementList, removeElementList} = massEditData
    const {listToEdit, elementToEditList, removeElementToEditList} = massToEditData

    $('#editorModal button#saveBtn').data('editorBy', 'mass-edit');
    $('#editorModal button#saveBtn').text('Save Changes')
    $('#editorModal button#saveBtn').removeClass('btn-danger').addClass('btn-primary');
    $('#editorModal button#saveBtn').show()
    $('#editorModal button#template').show()

    const addButtonTemplate = $('#editorModal button#add-template')
    const useTemplateBtn = $('#editorModal .modal-header button#use-template')
    const deleteButtonTemplate = $('#editorModal .modal-header button#delete-template')
    const backButtonTemplate = $('#editorModal button#back-btn-template')

    useTemplateBtn.hide()
    addButtonTemplate.hide()
    deleteButtonTemplate.hide()
    backButtonTemplate.hide()


    if ($('#editorModal .modal-header button#template').length === 0) {
      $('#editorModal .modal-header button.btn-close').before(`
        <button class="btn btn-primary ms-5 p-1" id="template" tabindex="0" aria-controls="example" type="button"><span>Template</span></button>
      `)
    }else {
      $('#editorModal .modal-header button#template').show()
    }

    $('#editorModal .modal-title').text(`
        Mass Edit row
    `)

    $('#editorModal .modal-body').html(`
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
      `)
    $('#editorModal').modal('show');

    $('#editorModal .modal-body .mass-editBy input.checkbox-select-list').change(function() {
      // Check if the checkbox is checked
      if ($(this).prop('checked')) {
        elementList($(this), table)
      }else {
        removeElementList($(this), table)
      }
    });

    $('#editorModal .modal-body .list-editBy input.checkbox-select-list-edit').change(function() {
      // Check if the checkbox is checked

      if ($(this).prop('checked')) {
        elementToEditList($(this), table)
      } else {
        removeElementToEditList($(this), table)
      }
    });

    $('#editorModal button#template').on('click', useTemplate)
  })
}

function selectedSearchElement(selector) {
  const table = $('#example').DataTable()
  const selectedRow = table.row('.selected').data()
  const splitSelector = selector.split(',')
  const selectorElement = splitSelector[0]
  const columnIndex = parseInt(splitSelector[1])

  $(`#editorModal .modal-body .mass-editBy input#${selectorElement}`).val(selectedRow[columnIndex])

  $(`#editorModal .modal-body .mass-editBy button:eq(${columnIndex+1}).select-element`).removeData('select-search-element')

  $('#editorModal').modal('show');
}

function saveData(e) {
  const element = $(e.target)
  const value = element.data('editorBy');
  const table = $('#example').DataTable()

  if (value == 'add') {
    addDataSection(table)
  }else if (value == 'edit') {
    editDataSection(table)
  }else if (value == 'mass-edit') {
    massEditDataSection(table)
  }else if (value == 'mass-remove') {
    massRemoveDataSection(table)
  }else if (value == 'template-add') {
    templateAddSection()
  }else if (value == 'template-edit') {
    templateEditSection()
  }
}
