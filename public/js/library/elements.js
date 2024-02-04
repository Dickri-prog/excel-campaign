const elements = (function() {
  function createHeaderTable(data) {
    const tr = document.createElement('tr')
    data.forEach(item => {
      const th = document.createElement('th')
      const text = document.createTextNode(item)

      th.setAttribute('scoope', 'col')

      th.appendChild(text)

      tr.appendChild(th)
    })

    return tr
  }

  return {
    headerTable: createHeaderTable
  }

})()
