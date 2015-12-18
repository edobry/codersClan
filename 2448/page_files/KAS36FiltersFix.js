// Filters Algorithmf
// 1. Get all filters and if they're set.
// 2. Pass each element and all filters to a filter function.
// 3. Show/hide them by the return value.
// 4. Filter remaining items by text.

var weekdayRegex = /(monday|tuesday|wednesday|thursday|friday|saturday|sunday)(?!\s+late)/gi

var filterFields = ["tab", "category", "option"];

var parseFilters = function(filters) {
    return filters.map(function(filter) {
        //filter_0_2_0
        return filter.replace("filter_", '').split('_').map(function(filter, i) {
            return [filterFields[i], filter];
        }).reduce(function(parsed, tuple) {
            parsed[tuple[0]] = tuple[1];
            return parsed;
        }, { raw: filter });
    });
};

var constructPredicate = function(filters) {
    //filter out date filters
    var classFilters = filters.filter(function(filter) {
        return !filter.raw.match(weekdayRegex);
    });

    //group by category
    var groupObj = classFilters.reduce(function(out, filter) {
        //init category
        if(!out[filter.category]) out[filter.category] = [];
        
        out[filter.category].push(filter);
        return out;
    }, {});

    var filterGroups = Object.keys(groupObj).map(function(key) {
        return groupObj[key];
    });

    return function(el) {
        return filterGroups.every(function(group) {
            return group.some(function(filter) {
                return el.hasClass(filter.raw);
            });
        });
    };
};

function filter(f, el) {
    var filters = parseFilters(f);

    // Dates from the element
    var dates = (el.text().toLowerCase().match(weekdayRegex) || [])
        .reduce(function(p,c){(p.indexOf(c)<0&&p.push(c));return p},[]); /* Remove duplicates. http://stackoverflow.com/a/17903018 */
    
    // If a weekday filter is set and the element contains one of the weekdays (or no weekdays at all), continue.
    var wd = false;
    for (var i = 0; i < f.length; i++) {
        if (f[i].match(weekdayRegex) && dates.indexOf(f[i]) >= 0) wd = true;
    }
    //                         ┌─ at least one weekday filter applies ──────────────────────────┐
    if (dates.length && !wd && f.reduce(function(p,c){(c.match(weekdayRegex)&&p.push(c));return p;},[]).length) return false;
    else if (wd) return true;

    // If a different filter is set, just test for the class.
    var filterPred = constructPredicate(filters);
    var cl = filterPred(el);

    //  < has no weekday filter applied >
    if (f.reduce(function(p,c){(c.match(weekdayRegex)||p.push(c));return p;},[]).length && !cl) return false;
    return true;
}


$(window).on("load", function(){setTimeout(function(){
$("#filter_1").off("change", applyFilters); //applyFilters will change, so remove the handler now and add it again later.

// This is a modified version of the applyFilters() function defined in http://www.speeddata.co.uk/Templates/TabForm.v1/TabForm.js:556
applyFilters = function() {
  var sTabId = jQuery('#tabGroup input:checked')[0].id;
  var sFilterText = jQuery('div#filtersPanel .' + sTabId + ' input[id^="itemSearchBox"]').val();
  sFilterText = sFilterText ? sFilterText.toUpperCase() : '';

  // Set filterInUse class
  jQuery('div#filtersPanel div.' + sTabId + ' label[for^="itemSearchBox"]').closest('div').toggleClass('filterInUse', sFilterText != '');
  jQuery('div#filtersPanel div.' + sTabId + ' select.chosen-select').closest('div').toggleClass('filterInUse', jQuery('div#filtersPanel div.' + sTabId + ' select.chosen-select option:selected').length > 0)

  var filters = [];
  jQuery('div#filtersPanel .' + sTabId + ' select.chosen-select option:selected').each(function(i,e) {
    filters.push(e.value);
  })
  jQuery('#centerPanel .tabbed.' + sTabId).css('display', '').filter('.tile').each(function() {
    var oTile = $(this);
    var oCtl = jQuery(this).find('select,input[type="checkbox"],input[type="hidden"]')[0];

    if (oCtl) { // We have a control
      if (filter(filters, oTile)) oTile.show();
      else $(oTile).hide();

      //if($PLI(oCtl).val == 0) { // Hide only empty ones
      if (sFilterText != '') { // Free Text search available
        if (oTile.text().toUpperCase().indexOf(sFilterText) == -1) {
          oTile.hide();
          return true; // Skip Filters.each and carry on with the Tiles.each
        }
      }
    }
  });

  jQuery('#NotingMatch').hide();
  if (jQuery('#centerPanel .tabbed:visible:not(.basketIgnore)').length == 0) {
    if (sTabId == 'tabZ') { // Basket
      jQuery('#NotingMatch').text('Your basket is empty.').show();
    } else {
      jQuery('#NotingMatch').text('No items matching your search criteria were found.').show();
    }
  }
}


// Remove filters for multiple days from the filters picker
var temp_weekdays = []; var temp_remove = [];
$("optgroup[label=Date] option").each(function() { var $this = $(this);
  var wd = ($this.text().toLowerCase().match(weekdayRegex) || [])
  if (wd.length > 1) temp_weekdays = temp_weekdays.concat(wd)
  $this.remove()
  //for(var i = 0; i < wd.length; i++) if (temp_weekdays.indexOf(wd[i]) < 0) temp_weekdays.push(wd[i]);
})
temp_weekdays = temp_weekdays.reduce(function(p,c){(p.indexOf(c)<0&&p.push(c));return p},[]); /* Remove duplicates. http://stackoverflow.com/a/17903018 */
function sortDays(days){var d=new Date().getDay();var l=["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];var s=l.slice(d).concat(l.slice(0,d));return days.sort(function(a,b){return s.indexOf(a)>s.indexOf(b)})} /* Sort dates - http://stackoverflow.com/a/17892824 */
temp_weekdays = sortDays(temp_weekdays);
// Add filters for weekdays only occuring in multiple elements
for (var i = 0; i < temp_weekdays.length; i++) {
    $("#filtersPanel select optgroup[label=Date]").append("<option value='" + temp_weekdays[i] + "'>" + (temp_weekdays[i][0].toUpperCase() + temp_weekdays[i].substr(1)) + "</option>")
}
$("#filtersPanel select").trigger("chosen:updated");

// Add classes for each weekday
$(".tile").each(function() { var $this = $(this);
  var wd = ($this.text().toLowerCase().match(weekdayRegex) || [])
  $this.addClass(wd.join(" "));
})

$("[id^=filter_]").on("change", applyFilters); // Attach the new event handler
},500)})