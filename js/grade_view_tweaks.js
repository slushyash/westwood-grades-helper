function date_string_to_unix(string) {
	return moment(string, "MM/DD/YYYY").unix();
}

$(".AssignmentClass").each(function(index, raw_element) {
	var element = $(raw_element);
	element.find(".sg-content-grid > .sg-asp-table .sg-asp-table-data-row").sortElements(function(a, b) {
		var row_a = $(a);
		var row_b = $(b);
		
		var row_a_category = row_a.children().get(3).innerText;
		var row_b_category = row_b.children().get(3).innerText;
		
		var row_a_string_date = row_a.children().get(1).innerText;
		var row_b_string_date = row_b.children().get(1).innerText;

		var compare_categories = row_a_category.localeCompare(row_b_category);
		if(compare_categories !== 0) { // same category
			return compare_categories;
		} else { // sort by assignment date
			var compare_dates = date_string_to_unix(row_a_string_date) - date_string_to_unix(row_b_string_date);
			return compare_dates;
		}
	});
});

//08/26/2014