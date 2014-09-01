function date_string_to_unix(string) {
	return moment(string, "MM/DD/YYYY").unix();
}

function getDataFromTable(table, header_row) {
  var rawTable = [];
  var final_data = [];
  $(table).find("tr").each(function(index, element) {
    var row = _.map(element.children, function(element) { return element.innerText; });
    rawTable.push(row);
  });
  var header_row_from_webpage = rawTable[0];
  header_row = header_row || header_row_from_webpage;
  for(var i = 1; i < rawTable.length; i++) {
    final_data.push(_.object(header_row, rawTable[i]));
  }
  return final_data;
}

function scrapeData() {
  var courses = [];
  $(".AssignmentClass").each(function(index, raw_element) {
    var course_el_jq = $(raw_element);
    var course_obj = {};
    var course_name = course_el_jq.find(".sg-header-square a").text().trim(); // lol
    course_obj.name = course_name;
    course_obj.grade = course_el_jq.find("span[title='AVG']").text();
    var course_assignments_table = course_el_jq.find(".sg-content-grid > .sg-asp-table");
    if(course_assignments_table.length === 1) {
      course_obj.assignments = getDataFromTable(course_assignments_table,
        ["date_due", "date_assigned", "assignment_name", "category", "score", "total_points",
        "weight", "weighted_score", "average_score", "weighted_total_points"]);
    } else {
      course_obj.assignments = [];
    }
    var category_information_table = course_el_jq.find(".sg-content-grid .sg-asp-table-group .sg-asp-table");
    if(category_information_table.length === 1) {
      course_obj.categories = getDataFromTable(category_information_table,
        ["category_name", "student_points", "maximum_points", "percent", "weight", "category_points"]);
    } else {
      course_obj.categories = [];
    }
    courses.push(course_obj);
  });
  return courses;
}

// $(".AssignmentClass").each(function(index, raw_element) {
// 	var element = $(raw_element);
// 	element.find(".sg-content-grid > .sg-asp-table .sg-asp-table-data-row").sortElements(function(a, b) {
// 		var row_a = $(a);
// 		var row_b = $(b);
		
// 		var row_a_category = row_a.children().get(3).innerText;
// 		var row_b_category = row_b.children().get(3).innerText;
		
// 		var row_a_string_date = row_a.children().get(1).innerText;
// 		var row_b_string_date = row_b.children().get(1).innerText;

// 		var compare_categories = row_a_category.localeCompare(row_b_category);
// 		if(compare_categories !== 0) { // same category
// 			return compare_categories;
// 		} else { // sort by assignment date
// 			var compare_dates = date_string_to_unix(row_a_string_date) - date_string_to_unix(row_b_string_date);
// 			return compare_dates;
// 		}
// 	});
// });

console.log(getDataFromTable($(".sg-asp-table").get(0)));
console.log(scrapeData());

//gotten from github, removes css styles
(function() {
  var attr   = 'data-com-aanandprasad-disable-css';
  var links  = getElements('link[rel=stylesheet]');
  var inline = getElements('style');

  links.forEach(function(el) {
    if (el.hasAttribute(attr)) {
      el.disabled = false;
      el.removeAttribute(attr);
    } else if (!el.disabled) {
      el.disabled = true;
      el.setAttribute(attr, 'true');
    }
  });

  inline.forEach(function(el) {
    if (el.hasAttribute(attr)) {
      el.innerHTML = el.getAttribute(attr);
      el.removeAttribute(attr);
    } else {
      el.setAttribute(attr, el.innerHTML);
      el.innerHTML = '';
    }
  });

  function getElements(selector) {
    return [].slice.call(document.querySelectorAll(selector));
  }
})();
//08/26/2014