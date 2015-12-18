/* Price List Item wrapper $PLI(tgtCtl) */
function $PLI(oCtl) {
	if(typeof oCtl === 'string') oCtl = document.getElementById(oCtl);
	if(oCtl instanceof jQuery) oCtl = oCtl[0];
	if(oCtl === 'undefined') return null;
	if(oCtl.tagName === 'undefined') return null;
	
	var __PLI = {
		ctl:oCtl,           // Item DOM element
		val:0,              // Current Count
		min:0,              // Minimum Count
		max:0,              // Maximum Count
		amount:0,           // Current Count * Price
		canAdd:false,       // Check if Count can increase
		canRemove:false,    // Check if Count can decrease
		hasChanged:false,   // Check if Count has changed
		add:function() {    // Up the Count (take next from the list)
			if(this.canAdd) {
				if(this.ctl.type == 'checkbox') {
					this.ctl.checked = true;
				} else {
					this.ctl.selectedIndex++;
				}
				
				this.dispatchOnChange();
			}
			return $PLI(this.ctl);
		},
		remove:function() { // Down the Count (take previous from the list)
			if(this.canRemove) {
				if(this.ctl.type == 'checkbox') {
					this.ctl.checked = false;
				} else {
					this.ctl.selectedIndex--;
				}
				this.dispatchOnChange();
			}
			return $PLI(this.ctl);
		},
		set:function(cnt) { // Set the count explicitly
			if(this.ctl.type == 'checkbox') {
				this.ctl.checked = !(cnt == 0);
			} else {
				this.ctl.value = cnt;
			}
			this.dispatchOnChange();

			return $PLI(this.ctl);
		},
		dispatchOnChange:function() {
			if ("createEvent" in document) { // IE > 8
				var evt = document.createEvent("HTMLEvents");
				evt.initEvent("change", false, true);
				this.ctl.dispatchEvent(evt);
			} else if (document.createEventObject) { // IE < 9
				this.ctl.fireEvent('onchange', document.createEventObject())
			} else {
				this.ctl.dispatchEvent(new Event('change'));
			}
		}
	}

	// Get price and currency and store in DOM
	if((typeof oCtl.price === 'undefined') || (typeof oCtl.currency === 'undefined')) {
		var oScout = oCtl;
		while (oScout && oScout.tagName !== 'TR') {
			oScout = oScout.parentNode;
		}
		oScout = oScout.firstChild;
		while (oScout && !(oScout.className.match(/unit-cost/gi))) {
			oScout = oScout.nextSibling;
		}
		
		sPrice = ((oScout.innerText)?(oScout.innerText):(oScout.textContent)).replace(/[ ,]/g, '');
		oCtl.price = parseFloat(sPrice.replace(/[^0-9\.]/g, ''));
		oCtl.currency = sPrice.replace(/[0-9\.]/g, '');
	}
	
	// Get quantity
	if(typeof oCtl.value === 'undefined') {
		if(oCtl.type == 'checkbox') {
			__PLI.val = (oCtl.checked)?1:0;
			__PLI.max = 1;
			__PLI.canAdd = !oCtl.checked;
			__PLI.canRemove = oCtl.checked;
		}
	} else {
		if(oCtl.type == 'checkbox') {
			__PLI.val = (oCtl.checked)?(oCtl.value):0;
			__PLI.max = oCtl.value;
			__PLI.canAdd = !oCtl.checked;
			__PLI.canRemove = oCtl.checked;
		} else {
			if(oCtl.tagName == 'SELECT') {
				__PLI.val = oCtl.value;
				__PLI.min = oCtl.options[0].value;
				__PLI.max = oCtl.options[oCtl.options.length-1].value;
				__PLI.canAdd = oCtl.selectedIndex < oCtl.options.length - 1;
				__PLI.canRemove = oCtl.selectedIndex > 0;
			} else { // Assume hidden
				__PLI.min = __PLI.max = __PLI.val = oCtl.value;
			}
		}
	}
	
	// Get initial value and store in DOM
	if(typeof oCtl.initVal === 'undefined') {
		oCtl.initVal = __PLI.val
	}
	
	// Check whether the quantity has changed since the form open (useful for dropping )
	__PLI.hasChanged = !(oCtl.initVal == __PLI.val);
	
	if(oCtl.price) __PLI.amount = __PLI.val * __PLI.ctl.price;
	
	return __PLI;
}

gaPriceList = []; // Public array for

/* http://stackoverflow.com/questions/2308134/trim-in-javascript-not-working-in-ie */
if(typeof String.prototype.trim !== 'function') {
  String.prototype.trim = function() {
    return this.replace(/^\s+|\s+$/g, ''); 
  }
}

Array.prototype.valueAt = function(oSearched) {
	for(var arrPos = 0, arrLen = this.length; arrPos < arrLen; ++arrPos)
		if(this[arrPos] === oSearched)
			return arrPos;
	this.push(oSearched)
	return this.length-1;
}


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //


setTimeout(function() { // Delay interface init to allow splashscreen render
	jQuery(function() {
		// Filters and Tabs
		var aTabs = [];
		var aFilters = [];

		// Scan PreDefinedTabs before adding #NotingMatch
		var aPreDefinedTabs = [];
		jQuery('.tabbed:not(.tile)').each(function() {
			if(this.getAttribute('data-tab-title')) // Skip anonymous
				aPreDefinedTabs.valueAt(this.getAttribute('data-tab-title'));
		});
		
		// Convert PriceListItems into tiles
		jQuery('#centerPanel>form table.price-list').find('select,input').each(function() {
			var jqRow = jQuery(this).closest('tr');

			// Identify Tab
			sTab = (jqRow.find('span.filter[title="Tab"]').html()||"").trim()||undefined;
			if(typeof sTab === 'undefined') sTab = 'Other';

			aTabs.valueAt(sTab);
			
			// Identify Filters
			jqRow.find('span.filter').each(function() {
				var sTitle = this.getAttribute('title');
				if(sTitle !== 'Tab') {
					var sValue = jQuery(this).html();
					
					for(var j = 0, arrLen = aFilters.length; j < arrLen; ++j)
						if((aFilters[j].tab === sTab) && (aFilters[j].title === sTitle) && (aFilters[j].value === sValue))
							return true;

					aFilters.push({tab:sTab, title:sTitle, value:sValue});
				}
				return true;
			})

			// Initialise PriceListItem
			var oItem = $PLI(this);

			oItem.ctl.tile = 
				jQuery('<div class="tile tabbed tabX'+((oItem.val>0)?' tabZ':'')+'" id="'+this.id+'_tile">' + jqRow.find('td.item').html() + '<span class="price" title="Price per Item">' + jqRow.find('td.unit-cost').html() + '</span></div>')
					.append(jQuery(this).detach())
					.appendTo('#centerPanel>form')
					.on('click', function() {
						jQuery('#navigator-descr-header').html(
							((jQuery(this).find('span.Ref').length == 0)?'':(jQuery(this).find('span.Ref')[0].outerHTML)) +
							((jQuery(this).find('span.title').length == 0)?'':(jQuery(this).find('span.title')[0].outerHTML)));
						jQuery('#navigator-descr-text').html(jQuery(this).find('p').clone());
						jQuery('#navigator-descr-text').prepend(jQuery(this).find('img').clone());
						jQuery('#action-frame').html();

						var oCtl = jQuery(this).find('select').eq(0);
						if(oCtl.length == 1) { // We have Select
							jQuery('#dialogueCount').html(oCtl.html()).val(oCtl.val())[0].tgtCtl = oCtl[0]; // Replicate select
							jQuery('#dialogueCountSpan').show();
							jQuery('#dialogueFrame .soldOut').hide();
						} else {
							jQuery('#dialogueCount').html('<option value="0" selected="selected">&nbsp;&nbsp;0</option>').val(0)[0].tgtCtl = null; // Empty select
							jQuery('#dialogueCountSpan').hide();
							jQuery('#dialogueFrame .soldOut').show();
						}
						// jQuery('#action-frame').show() ???
						jQuery('#dialoguePrice').html(jQuery(this).find('span.price').html());

						jQuery('#dialogueFrame').show();
						jQuery('#dialogueShade').show();
					})[0];

			oItem.ctl.index = gaPriceList.length;
			gaPriceList.push(oItem);
					
			if(oItem.max == 0) { // Sold out
				jQuery('<span class="soldOut">Sold Out</span>').insertAfter(this); //.appendTo(oItem.ctl.tile);
			} else {
				jQuery(this)
					.on('click', function(e) {
						e.stopPropagation();
					})
					.on('change', function() {
						var sPrevTotal = jQuery('span.total').html();
						
						gaPriceList[this.index] = $PLI(this); // Update PLI
						var nTotal = 0.00;
						var sCur = '&pound;&nbsp;'; // Default to £
						if((gaPriceList.length > 0) && (typeof gaPriceList[0].ctl.currency != 'undefined')) {
							sCur = gaPriceList[0].ctl.currency + '&nbsp;'; // If available take from the PriceList
						}
						for(var i = gaPriceList.length-1; i > -1; --i) {
							nTotal += gaPriceList[i].amount;
						}

						var sNewTotal = sCur + nTotal.toFixed(2).replace(/([0-9])([0-9]{3,3}\.)/g,'$1 $2').replace(/([0-9])([0-9]{3,3} )/g,'$1 $2').replace(/([0-9])([0-9]{3,3} )/g,'$1 $2');
						if(sPrevTotal !== sNewTotal) {
							jQuery('span.total').html(sNewTotal).addClass('changed');
							setTimeout(function() {jQuery('span.total').html(sNewTotal).removeClass('changed');}, 50);
						}

						if(this.value != 0) {
							jQuery(this.tile).addClass('tabZ');
						} else {
							jQuery(this.tile).removeClass('tabZ');
							applyFilters();
							if(document.getElementById('tabZ').checked) {
								jQuery(this.tile).hide();
								if(jQuery('#centerPanel .tabbed:visible').length == 0) {
									jQuery('#NotingMatch').text('Your basket is empty.').show();
								}
							}
						}
					}); // .eq(0).trigger('change'); // Calculate basket total <-- on interface load this would be triggered for every single tile.
			}
		});
		
		// Init Total !!! test !!!
		var nTotal = 0.00;
		var sCur = '&pound;&nbsp;';
		for(var i = gaPriceList.length-1; i > -1; --i) {
			nTotal += gaPriceList[i].amount;
			// sCur = gaPriceList[i].currency;
		}
		var sNewTotal = sCur + nTotal.toFixed(2).replace(/([0-9])([0-9]{3,3}\.)/g,'$1 $2').replace(/([0-9])([0-9]{3,3} )/g,'$1 $2').replace(/([0-9])([0-9]{3,3} )/g,'$1 $2');
		jQuery('span.total').html(sNewTotal);
		
		
		aTabs = aTabs.sort();
		if(aTabs.length > 0) { // !!! THIS IS A STUB FOR CONVENTIONAL FORM WIDGETS TABBING !!!
			jQuery('#centerPanel>form table.price-list').detach(); // Remove processed price-list table
			jQuery('<div id="NotingMatch" class="tabbed" style="display:none;">Your basket is empty.</div>').appendTo('#centerPanel>form');
		} else { // If there are no tabs => no pricelist items: remove Basket
			jQuery('#tabGroup #tabZ').detach();
			jQuery('#navigationTags label[for="tabZ"]' ).detach();
		}
		
		if(aPreDefinedTabs.length > 0) {
			if(aPreDefinedTabs[0]) {
				jQuery('#navigationTags label[for="tab0"]' ).html(aPreDefinedTabs[0]); // Amend tab0 title if provided
				aPreDefinedTabs.shift();
			}
			// aPreDefinedTabs.pop();
			aTabs = aTabs.concat(aPreDefinedTabs);
		}
		
		for(var i = aTabs.length-1; i > -1; --i) {
			jQuery('#tabGroup #tab0').after('<input class="tab" type="radio" name="tab" id="tab'+(i+1)+'">');
			jQuery('#navigationTags label[for="tab0"]' ).after('\n<label for="tab'+(i+1)+'" class="tab">'+aTabs[i]+'</label>');
			jQuery('div.nav.progress label[for="tab0"]' ).after('\n<label for="tab'+(i+1)+'" class="tab"><div></div></label>');
			if(aTabs[i] != 'Other') { // Other stays on tabX
				jQuery('div.tabbed.tabX').each(function() {
					if(jQuery(this).find('span.filter[title="Tab"]').html() == aTabs[i]) {
						this.className = this.className.replace('tabX','tab'+(i+1));
					}
				})
			}
			
			var aFilterTitles = []; // Filter Titles relevant for the Tab
			for(var j = 0, jMax = aFilters.length; j < jMax; ++j) {
				if(aFilters[j].tab === aTabs[i]) {
					aFilterTitles.valueAt(aFilters[j].title);
				}
			}
			if(aFilterTitles.length > 0) {
				newHTML = '<div class="tab'+(i+1)+'">';
				newHTML += '<label for="filter_'+i+'" class="filterLabel">Filters: </label>';
				newHTML += '<select id="filter_'+i+'" name="filter_'+i+'" size="1" data-placeholder="Click here to filter" class="chosen-select" multiple="" tabindex="-1">';
				
				for(var k = 0, kMax = aFilterTitles.length; k < kMax; ++k) {
					newHTML += '<optgroup label="'+aFilterTitles[k]+'">'

					var aFilterValues = []; // Filter Values relevant for the Tab and Title
					for(var j = 0, jMax = aFilters.length; j < jMax; ++j) {
						if((aFilters[j].tab === aTabs[i]) && (aFilters[j].title === aFilterTitles[k])) {
							aFilterValues.valueAt(aFilters[j].value);
						}
					}
					aFilterValues = aFilterValues.sort();
					
					for(var j = 0, jMax = aFilterValues.length; j < jMax; ++j) {
						sFilterId = 'filter_'+i+'_'+k+'_'+j;
						newHTML += '<option value="'+sFilterId+'">'+aFilterValues[j]+'</option>'
						
						for(var m = gaPriceList.length-1; m > -1; --m) {
							if(jQuery(gaPriceList[m].ctl.tile).find('span.filter').filter(function() {return ((this.getAttribute('title') === aFilterTitles[k]) && (jQuery(this).html() === aFilterValues[j]))}).length > 0) {
								jQuery(gaPriceList[m].ctl.tile).addClass(sFilterId)
							}
						}
					}
					newHTML += '</optgroup>'
				}

				newHTML += '</select></div>';

				// Add free-text search box. Comment out if not needed.
				newHTML += '<div class="tab'+(i+1)+' searchBox">';
				newHTML += '<label for="itemSearchBox'+(i+1)+'" class="filterLabel">Search: </label>';
				newHTML += '<input type="text" id="itemSearchBox'+(i+1)+'" name="itemSearchBox'+(i+1)+'" placeholder="Type here..." onKeyup="applyFilters();" />';
				newHTML += '</div>'				
				
				jQuery('#filtersPanel').append(newHTML);
			}
		}

		if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
			// Mobile bevices seem to handle multiselect just fine
			jQuery('select.chosen-select').on('change', applyFilters); // .before('<label for="'+this.name+'">Filters: </label>');
		} else {
			// Apply chosen for the desktop (giving time to render)
			setTimeout(function() {
				jQuery('select.chosen-select').chosen({width: "12em"}).change(applyFilters);
			}, 10);
		};

	// Prop for the first empty page
	/*if(jQuery('.tab0 input').length == 0) {
		jQuery('#tabGroup #tab0').detach();
		jQuery('#navigationTags label[for="tab0"]').detach();
		jQuery('#tabGroup #tab1')[0].checked = true;
	} else {*/
		jQuery('#tabGroup #tab0')[0].checked = true;
	/*
	}
	*/
		// Remove the Basket if no PriceList
		if(gaPriceList.length == 0) {
			jQuery('#tabGroup #tabZ').detach();
			jQuery('label[for="tabZ"]').detach();
		}
		
		// Modal window events
		jQuery('#dialogueClose,#dialogueShade').on('click', function(e) {
			jQuery('#dialogueFrame').hide();
			jQuery('#dialogueShade').hide();
			// jQuery('#dialogueCount').tgtCtl = {};
		})
		jQuery('#dialogueFrame').on('click', function(e) {
			e.stopPropagation();
		})
		jQuery('#dialogueOK').on('click', function() {
			oCtl = jQuery('#dialogueCount')[0];
			if(oCtl.tgtCtl) {
				$PLI(oCtl.tgtCtl).set(oCtl.value);
			}
			jQuery('#dialogueFrame').hide();
			jQuery('#dialogueShade').hide();
		})
		
		// Tabs always visible
		jQuery('div.tabs').show();

		// Show non-tabbed form controls only on the first tab
		jQuery('#centerPanel>form').children().not('.tabbed,script,[type="hidden"],#filtersPanel,.footer,.event-handler').addClass('tabbed tab0')
		// Show controls outside form on the first tab only
		jQuery('#centerPanel').children().not('.tabbed,script,[type="hidden"],form,#filtersPanel,.footer,.event-handler').addClass('tabbed tab0');

		if(aTabs.length > 0) {
			// Enable footer controls only when there are tabs
			jQuery('div.footer').show();
			
			// Hide form submit button row
			/*
			if(jQuery('#tabGroup #tabZ').length > 0) {
				jQuery('#centerPanel>form input[type="submit"]').closest('tr').hide();
			}
			*/

			// Footer buttons
			jQuery('#tabNext,.nav.next').on('click', function() {jQuery('input.tab:checked').next().click();});
			jQuery('#tabPrev,.nav.prev').on('click', function() {jQuery('input.tab:checked').prev().click();});
		}
		
		if(aTabs.length > 1) { // Affix y-scroll bar to prevent tabs jumping
			document.body.style.overflowY = 'scroll';
		}

		// Tabs actions
		jQuery('input.tab').on('change', function() {
			jQuery('label.tab').removeClass('active');
			jQuery('label.tab[for="'+this.id+'"]').addClass('active');
			jQuery('div#tabTitle').html(jQuery('div#navigationTags label.tab[for="'+this.id+'"]').html()).find('span.total').detach();
			
			// Update navigation buttons
			jQuery('.nav.next').toggleClass('disabled', this.id == jQuery('input.tab').last()[0].id);
			jQuery('.nav.prev').toggleClass('disabled', this.id == jQuery('input.tab').first()[0].id);

			// Hide everyting and use delayed applyFilters to show 
			jQuery('#centerPanel .tabbed').hide();
			
			// Set filters straight away to calculate required width
			jQuery('#FiltersActive:visible').hide();
			jQuery('#filtersPanel>*').hide();
			jQuery('#filtersPanel>.'+this.id).css('display',''); // Do not use .show() that will set display to either block or inline-block regardless of the css
			
			// Reset filters
			jQuery('div.filterGroup.'+this.id+' input[id^="itemSearchBox"]').val('');
			jQuery('div.filterGroup.'+this.id+' input[type="checkbox"]').prop('checked', true).toggleClass('auto', true);
			
			if(typeof applyCustomStyle == 'function')
				applyCustomStyle(this.id);
		
			setTimeout(applyFilters, 15);
			
			doResize = setTimeout(resized, 10);
		}).eq(0).trigger('change');
		
		// Portray filters button
		jQuery(window).on('scroll', onScroll);
		jQuery('#centerPanel').on('touchmove',  onScroll);
		
		jQuery('#FiltersActive').on('click', function() {
			jQuery('#FiltersActive:visible').hide();
			jQuery('html,body').scrollTop(0);
			// jQuery('#filtersPanel label').eq(0).click(); // Focus first filter
		});
		
		// Delayed resource load
		// Comment out when no images used
		(function () {
			var id = -1;

			var intId = setInterval(function(){
				// Get Img source folder or abort
				var srcDir = jQuery('div.header>img').attr('src'); // we also have a basket image
				if(srcDir) {srcDir = srcDir.replace(/\/[^\/]*$/,'');}// else {return false;}
				if(srcDir.length > 0) {srcDir += '/Img/'}// else {return false};

				++id;
				if(id < gaPriceList.length) {
					if(gaPriceList[id].ctl.tile) { // We have the tile
						jQuery(gaPriceList[id].ctl.tile).prepend('<img src="' + srcDir + gaPriceList[id].ctl.id.replace(/^PriceList./,'') + '.jpg" onError="this.parentNode.removeChild(this);" />');
					}
				} else {
					clearInterval(intId);
				}
			}, 25);
		})();
		
		jQuery('#splashscreen p').eq(0).text('Loading...').css('font-size','150%');
		setTimeout(function() {jQuery('#splashscreen').fadeOut('slow', function() {jQuery('#splashscreen').detach();})}, 500);

		jQuery('[id*=".FormRow"] input[type="text"]').not('#LookupPostCode,[type="hidden"],[id*=".Helper"]').on('keydown', function(event) {
			if (event.keyCode == 13) { // Go next control
				var curCtl = this;
				var curCtlFound = false;
				jQuery('[id*=".FormRow"] :input:visible').not('[type="hidden"],[id*=".Helper"]').each(function() {
					// if (this.demo) { // We have the demo
						if (curCtlFound) { // Found on the previous step. Activate current.
							this.focus();
							if(typeof CtlFocus == 'function') CtlFocus.call(this);
							return false; // Exit .each()
						}
						curCtlFound = (this == curCtl);
					//}
				})
				event.stopPropagation();
				return false;
			}
		});


	})
}, 10);
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //
function onScroll() {
	if(jQuery('#filtersPanel').height() > 0) { // We have some filters
		if(jQuery(window).scrollTop() > jQuery('#filtersPanel').height()) {
			jQuery('#FiltersActive:not(:visible)').slideDown();
		} else {
			jQuery('#FiltersActive:visible').slideUp();
		}
	}
};

// http://stackoverflow.com/a/11744120
function windowSize() {
	var w = window,
		d = document,
		e = d.documentElement,
		g = d.getElementsByTagName('body')[0],
		x = w.innerWidth || e.clientWidth || g.clientWidth,
		y = w.innerHeight|| e.clientHeight|| g.clientHeight;
	return {height:y, width:x};	
}

// http://stackoverflow.com/a/5490021
function resized() {
	var iLeftNavigationTabWidth = Math.ceil(jQuery('div#navigationTags').width());
	var iHeaderHeight = Math.ceil(jQuery('div.header').height());

	jQuery('div#centerPanel')
		.css('padding-top', iHeaderHeight + 'px')

	if(iLeftNavigationTabWidth > 1) { // Left panel is visible => landscape mode
		jQuery('div#navigationTags')
			.css('padding-top', iHeaderHeight + 'px');
		var iFilterPanelWidth = Math.ceil(jQuery('div#filtersPanel').css('left', iLeftNavigationTabWidth + 'px').width());
		jQuery('div#centerPanel')
			.css('margin-left', iLeftNavigationTabWidth + iFilterPanelWidth + 'px')
	} else {
		jQuery('div#centerPanel').css('margin-left', '0px');
		jQuery('div#filtersPanel').css('left', '');
	}
}

var doResize;
window.onresize = function(){ // With throttle
	clearTimeout(doResize);
	doResize = setTimeout(resized, 10);
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //
function fixChosenTouch(e) {
	e.preventDefault(); $(e.target).trigger('click'); return false;
}


function applyFilters() {
	var sTabId = jQuery('#tabGroup input:checked')[0].id;
	var sFilterText = jQuery('div#filtersPanel .'+sTabId+' input[id^="itemSearchBox"]').val();
	sFilterText = sFilterText?sFilterText.toUpperCase():'';

	// Set filterInUse class
	jQuery('div#filtersPanel div.'+sTabId+' label[for^="itemSearchBox"]').closest('div').toggleClass('filterInUse', sFilterText!='');
	jQuery('div#filtersPanel div.'+sTabId+' select.chosen-select').closest('div').toggleClass('filterInUse', jQuery('div#filtersPanel div.'+sTabId+' select.chosen-select option:selected').length > 0)
	
	jQuery('#centerPanel .tabbed.'+sTabId).css('display','').filter('.tile').each(function() {
		var oTile = this;
		var oCtl = jQuery(this).find('select,input[type="checkbox"],input[type="hidden"]')[0];
		
		if(oCtl) { // We have a control
			//if($PLI(oCtl).val == 0) { // Hide only empty ones
				if(sFilterText != '') {// Free Text search available
					if(jQuery(oTile).text().toUpperCase().indexOf(sFilterText) == -1) {
						jQuery(oTile).hide();
						return true; // Skip Filters.each and carry on with the Tiles.each
					}
				}

				jQuery('div#filtersPanel .'+sTabId+' select.chosen-select option:selected').siblings('option:not(:selected)').each(function() { // Filters
					if(jQuery(oTile).hasClass(this.value)) {
						jQuery(oTile).hide();
						return false; // Exit Filters.each and carry on with the Tiles.each
					}
				})
			//}
		}
	});
	
	jQuery('#NotingMatch').hide();
	if(jQuery('#centerPanel .tabbed:visible:not(.basketIgnore)').length == 0) {
		if(sTabId == 'tabZ') { // Basket
			jQuery('#NotingMatch').text('Your basket is empty.').show();
		} else {
			jQuery('#NotingMatch').text('No items matching your search criteria were found.').show();
		}
	}
}

function applyStyle(css) {
	var head = document.head || document.getElementsByTagName('head')[0];
	var aStyles = head.getElementsByTagName('style');
	for(var i = aStyles.length - 1; i > -1; --i) if(aStyles[i].id == 'dynamicCSS') head.removeChild(aStyles[i]);
	
	var style = document.createElement('style');
	style.type = 'text/css';
	style.id = 'dynamicCSS';
	if (style.styleSheet) {
		style.styleSheet.cssText = css;
	} else {
		style.appendChild(document.createTextNode(css));
	}

	head.appendChild(style);
}