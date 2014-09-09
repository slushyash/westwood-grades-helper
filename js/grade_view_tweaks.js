function date_string_to_unix(string) {
	return moment(string, "MM/DD/YYYY").unix();
}

// Take a HTML table like the follows:
// Name | Grade | Awesomeness (1-10)
// ----------------------------------
// Yash | College | 9001
// Simon | College | 9001
// John | 2         | 5

// .. And convert it into this:
// [{"Name": "Yash", "Grade": "College", "Awesomeness": 9001}, ..., ...]
// Uses first row as the header table, or you can specify in header_row
function getDataFromTable(table, header_row, exclude_last) {
  exclude_last = exclude_last || false;
  var rawTable = []; // array of arrays representing raw table
  var final_data = []; // array of objects
  var query = exclude_last ? "tr:not(:last)" : "tr";
  $(table).find(query).each(function(index, element) {
    //get text of each element in the row and keep it in an array
    var row = _.map(element.children, function(element) { return element.innerText; });
    rawTable.push(row);
  });
  var header_row_from_webpage = rawTable[0]; // first row is the header
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
        ["category_name", "student_points", "maximum_points", "percent", "weight", "category_points"], true);
      var assignments_by_category = _.groupBy(course_obj.assignments, function(assignment) { return assignment.category; });
      course_obj.categories.forEach(function(category, index) {
        var assignments_under_current_category = assignments_by_category[category.category_name];
        course_obj.categories[index].assignments = assignments_under_current_category;
        delete assignments_by_category[category.category_name];
      });
      for(var category_name in assignments_by_category) {
        var assignments_under_current_category = assignments_by_category[category_name];
        course_obj.categories.push({category_name: category_name, student_points: 0, maximum_points: 0, percent: 0, weight: 0, category_points: 0, assignments: assignments_under_current_category});
      }
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
var data = scrapeData();
console.log(data);

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

var new_ui_div = $("<div id='new_ui' />");
$("body").prepend(new_ui_div);

// var CourseInfo = React.createClass({
//   render: function() {
//     var categories = _.map(this.props.data.categories, function(category) {
//       return (<CategoryInfo key={category.name + category.maximum_points} data={category} />);
//     });
//     return (
//       <div class="course_info">
//         <h1>{this.props.data.name}: {this.props.data.grade}</h1>
//         {categories}
//       </div>
//     );
//   }
// });
var CourseInfo = React.createClass({displayName: 'CourseInfo',
  render: function() {
    var categories = _.map(this.props.data.categories, function(category) {
      return (CategoryInfo({key: category.name + category.maximum_points, data: category}));
    });
    return (
      React.DOM.div({className: "course_info"}, 
        React.DOM.h1(null, this.props.data.name, ": ", this.props.data.grade), 
        categories
      )
    );
  }
});


// var CategoryInfo = React.createClass({
//   render: function() {
//     var tableRows = _.map(this.props.data.assignments, function(assignment) {
//       return (
//       <tr key={assignment.assignment_name}>
//         <td>{assignment.assignment_name}</td>
//         <td>{assignment.score}/{assignment.total_points}</td>
//         <td>{assignment.weight}</td>
//         <td>{assignment.average_score}</td>
//       </tr>
//       );
//     });
//     return (
//       <div id="category">
//         <h2>{this.props.data.category_name}: {this.props.data.weight} </h2>
//         <table>
//           <thead>
//             <tr>
//               <th>Assignment Name</th>
//               <th>Score/Total</th>
//               <th>Weight</th>
//               <th>Average Score</th>
//             </tr>
//           </thead>
//           <tbody>
//             {tableRows}
//           </tbody>
//           <tfoot>
//             <tr>
//               <td>Total:</td>
//               <td>{this.props.data.percent}</td>
//               <td></td>
//               <td></td>
//             </tr>
//           </tfoot>

//         </table>
//       </div>
//     )
//   }
// });
var CategoryInfo = React.createClass({displayName: 'CategoryInfo',
  render: function() {
    var tableRows = _.map(this.props.data.assignments, function(assignment) {
      return (
      React.DOM.tr({key: assignment.assignment_name}, 
        React.DOM.td(null, assignment.assignment_name), 
        React.DOM.td(null, assignment.score, "/", assignment.total_points), 
        React.DOM.td(null, assignment.weight), 
        React.DOM.td(null, assignment.average_score)
      )
      );
    });
    return (
      React.DOM.div({id: "category"}, 
        React.DOM.h2(null, this.props.data.category_name, ": ", this.props.data.weight, " "), 
        React.DOM.table(null, 
          React.DOM.thead(null, 
            React.DOM.tr(null, 
              React.DOM.th(null, "Assignment Name"), 
              React.DOM.th(null, "Score/Total"), 
              React.DOM.th(null, "Weight"), 
              React.DOM.th(null, "Average Score")
            )
          ), 
          React.DOM.tbody(null, 
            tableRows
          ), 
          React.DOM.tfoot(null, 
            React.DOM.tr(null, 
              React.DOM.td(null, "Total:"), 
              React.DOM.td(null, this.props.data.percent), 
              React.DOM.td(null), 
              React.DOM.td(null)
            )
          )

        )
      )
    )
  }
});

// var StudentInfo = React.createClass({
//   render: function() {
//     var courses = _.map(this.props.data, function(course) {
//       return (<CourseInfo key={course.name} data={course} />);
//     });
//     return (<div class="course">{courses}</div>);
//   }
// });
var StudentInfo = React.createClass({displayName: 'StudentInfo',
  render: function() {
    var courses = _.map(this.props.data, function(course) {
      return (CourseInfo({key: course.name, data: course}));
    });
    return (React.DOM.div({className: "course"}, courses));
  }
});
// React.renderComponent(
//   <StudentInfo data={data} />,
//   document.getElementById('new_ui')
// );
React.renderComponent(
  StudentInfo({data: data}),
  document.getElementById('new_ui')
);
