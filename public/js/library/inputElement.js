let headerCells = null
const inputElements = (function() {

  function createInput(table){
      const tableHeader = table.table().header();

      headerCells = $(tableHeader).find('th');

      let arrayHtml = '';
      let rowHtml = '';

      let count = 1

      headerCells.map(function() {
        const textElementId = $(this).text().trim().replace(/ /g, '-').toLowerCase();
        const textElement = $(this).text().trim()

        if (count++ <= 2) {
          rowHtml +=
            `
            <div class="col-6">
              <div class="mb-3">
                <label for="${textElementId}" class="form-label">${textElement}</label>
                <input type="text" class="form-control" id="${textElementId}">
              </div>
            </div>
            `
        }

        if(count > 2){
          arrayHtml += `
            <div class="row">
                ${rowHtml}
            </div>
            `

          rowHtml = ''
          count = 1
        }

      })



      return arrayHtml
  }

  function editInput(table, data) {
    const tableHeader = table.table().header();

    const headerCells = $(tableHeader).find('th');

    let arrayHtml = '';
    let rowHtml = '';

    let count = 1
    let countToSelectVal = 0

    // Extract text content from each header cell
    headerCells.map(function() {
      const textElementId = $(this).text().trim().replace(/ /g, '-').toLowerCase();
      const textElement = $(this).text().trim()

      if (count++ <= 2) {
        rowHtml +=
          `
          <div class="col-6">
            <div class="mb-3">
              <label for="${textElementId}" class="form-label">${textElement}</label>
              <input type="${typeof data[countToSelectVal] == 'string' ? 'text' : 'number'}" class="form-control" id="${textElementId}" value="${data[countToSelectVal]}">
            </div>
          </div>
          `
          countToSelectVal++
      }

      if(count > 2){
        arrayHtml += `
          <div class="row">
              ${rowHtml}
          </div>
          `

        rowHtml = ''
        count = 1
      }

    })



    return arrayHtml
  }

  return {
    createInput: createInput,
    editInput: editInput
  }
})()
