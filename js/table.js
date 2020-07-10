"use strict";
var tableBody = document.querySelector('.docs-table-body');

// structure used for generating <td> in table rows
var rowObj = {};

// change structure of rowObj, according to each <td> in <table>
function setRowObj() {
  rowObj = {
    sortType: '',
    sortProperty: '',
    sortItemLevel: '',
    sortRequiredLevel: '',
    sortRarity: '',
    sortGroup: '',
    sortItems: '',
    sortExclusions: ''
  }
}

// creates row with given object
function createRow(obj) {
  var tr = document.createElement('tr');
  Object.keys(obj).forEach(function(key) {
    tr.innerHTML +=
      `<td class="${key}">${obj[key]}</td>`;
  })
  return tr;
}

/**
 * Takes current data from rows, stores in array of objects
 * then sorts and adds back to table
 */
function sortByCategory(category) {
  if(category === undefined || category === NaN || category === null) {
    throw new Error('Bad argument');
  }
  
  var rows = [].slice.call(tableBody.children);
  var unsortedRowValues = [];

  rows.forEach(row => {
    setRowObj();
    [].slice.call(row.children).forEach(column => {
      var key = column.className;
      var value = column.innerHTML;
      rowObj[key] = value;
    })

    unsortedRowValues.push(rowObj);
  });

  // sort by category
  var sortedRowValues = sort.sortArr(unsortedRowValues, category);

  rows = sortedRowValues.map(function(o) {
    return createRow(o);
  });

  tableBody.innerHTML = '';
  rows.forEach(function(row) {
    tableBody.appendChild(row);
  });
}

// closure function to enable two-way sorting
var sort = (function() {
  var reverseSort = false;
  function change() {
    reverseSort = !reverseSort;
  }
  return {
    sortArr: function(arr, category) {
      if(!reverseSort) {
        change();
        return arr.sort((a, b) => a[category] < b[category]?-1:1);
      }
      change();
      return arr.sort((a, b) => a[category] < b[category]?1:-1);
    }
  };
})();
