function getDataFromTable(table) {
  var jquery_table = $(table);
  var table_rows = $(table).find("tr");
  var header_row = $(table).get(0);
  var rawTableData = [];
  $(table).find("tr").each(function(index, element) {
    var row = _.map(element.children, function(element) { return element.innerText; });
    rawTableData.push(row);
  });
  return rawTableData;
}