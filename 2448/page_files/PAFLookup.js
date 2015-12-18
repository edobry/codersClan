if(typeof PAFLookup === 'undefined') { // Initialise only once
	PAFLookup = {
		oLastCtl: undefined,
		go: function(oSrcCtl) {
			PAFLookup.oLastCtl = oSrcCtl;
			var sLookupPostCode = oSrcCtl.value.replace(/\s/gi,'').toUpperCase();

			if(sLookupPostCode.length < 5) {
				if(typeof jQuery === 'undefined') { // Can't use jQuery -> fallback to alert
					alert("Please enter a post code.");
					oSrcCtl.focus();
				} else {			
					jQuery('[id="PAFLookupMessage"]').detach();
					jQuery(oSrcCtl)
						.focus()
						.parent()
						.append('<span id="PAFLookupMessage" style="margin-left:1em; color:red; font-weight:bold;">Please enter a valid post code.</span>');
					setTimeout(function() {jQuery('[id="PAFLookupMessage"]').detach()}, 3000);
				}
			} else {
				if(typeof jQuery === 'undefined') { // Can't use jQuery -> fallback to PAFResult.aspx
					window.open(("https:" == document.location.protocol ? "https" : "http") + "://www.speeddata.co.uk/Library/PAFResult.aspx?PostCode=" + sLookupPostCode + "&OpenerForm=" + oForm.name + "&OverrideIdentifier=" + oSrcCtl.tgtPrefix, "PAFResult", "left=200,top=200,width=375,height=150,resizable=yes,toolbar=no,location=no,directories=no,status=no,menubar=no,copyhistory=no");
				} else if(typeof jQuery.parseXML === 'undefined') { // Can't use AJAX -> fallback to PAFResult.aspx
					window.open(("https:" == document.location.protocol ? "https" : "http") + "://www.speeddata.co.uk/Library/PAFResult.aspx?PostCode=" + sLookupPostCode + "&OpenerForm=" + oForm.name + "&OverrideIdentifier=" + oSrcCtl.tgtPrefix, "PAFResult", "left=200,top=200,width=375,height=150,resizable=yes,toolbar=no,location=no,directories=no,status=no,menubar=no,copyhistory=no");
				} else {
					jQuery(oSrcCtl).css({
						"background-image": "url('" + ("https:" == document.location.protocol ? "https" : "http") + "://www.speeddata.co.uk/Forms/Resource/LoadingSpinner.gif')",
						"background-repeat": "no-repeat",
						"background-position": "right"
					});	
					
					jQuery.ajax({
						url: ("https:" == document.location.protocol ? "https" : "http") + '://www.speeddata.co.uk/Library/PAF/XML/AddressList.aspx?PostCode='+sLookupPostCode,
						type: 'GET',
						async: true,
						dataType: 'text',
						headers: {'cache-control': 'no-cache'},
						contentType: 'multipart/form-data',
						success: function(data, textStatus, jqXHR) { // Deprecated: use "done" in future
							try {
								var joAddress = jQuery(jQuery.parseXML(data)).findTagCI('Address');
								if(joAddress.length == 0) {
									jQuery('[id="PAFLookupMessage"]').detach();
									jQuery(oSrcCtl)
										.css({"background-image": "none"})
										.focus()
										.parent()
										.append('<span id="PAFLookupMessage" style="margin-left:1em; color:red; font-weight:bold;">Postcode not found.</span>');
									setTimeout(function() {jQuery('[id="PAFLookupMessage"]').detach()}, 3000);
								} else {
									jQuery(oSrcCtl).css({"background-image": "none"});
									if(joAddress.length == 1) {
										PAFLookup.PokeAddress(joAddress, oSrcCtl);
									} else {
										PAFLookup.PickAddress(joAddress, oSrcCtl);
									}
								}
							}
							catch(err) {
								jQuery('[id="PAFLookupMessage"]').detach();
								jQuery(oSrcCtl)
									.css({"background-image": "none"})
									.parent()
									.append('<span id="PAFLookupMessage" style="margin-left:1em; color:red; font-weight:bold;">Lookup failed.</span>');
								setTimeout(function() {jQuery('[id="PAFLookupMessage"]').detach()}, 3000);
								jQuery('[id="'+oSrcCtl.tgtPrefix+'CompanyName"]').focus().select(); // Try advancing from the field
							}
						},
						fail: function(jqXHR, textStatus, errorThrown) { // Deprecated: use "error" in futire
							jQuery('[id="PAFLookupMessage"]').detach();
							jQuery(oSrcCtl)
								.css({"background-image": "none"})
								.parent()
								.append('<span id="PAFLookupMessage" style="margin-left:1em; color:red; font-weight:bold;">Lookup failed.</span>');
							setTimeout(function() {jQuery('[id="PAFLookupMessage"]').detach()}, 3000);
							jQuery('[id="'+oSrcCtl.tgtPrefix+'CompanyName"]').focus().select(); // Try advancing from the field
						}
					});
				}
			}
		},

		PokeAddress: function(joAddress, oSrcCtl) {
			// Do not overwrite company name if already present
			if(jQuery('[id="'+oSrcCtl.tgtPrefix+'CompanyName"]').val() == '')
				jQuery('[id="'+oSrcCtl.tgtPrefix+'CompanyName"]').val(joAddress.findTagCI('Organisation').text().trim()).blur().focus().select(); // Blur triggers ActiveInputValidation
			else
				jQuery('[id="'+oSrcCtl.tgtPrefix+'CompanyName"]').focus().select();

			var aAddressLine = []; var sAddressLine = '';
			sAddressLine = joAddress.findTagCI('Premise'                ).text().trim(); if(sAddressLine != '') aAddressLine.push(sAddressLine);
			sAddressLine = joAddress.findTagCI('DependentStreet'        ).text().trim(); if(sAddressLine != '') aAddressLine.push(sAddressLine);
			sAddressLine = joAddress.findTagCI('Street'                 ).text().trim(); if(sAddressLine != '') aAddressLine.push(sAddressLine);
			sAddressLine = joAddress.findTagCI('DoubleDependentLocality').text().trim(); if(sAddressLine != '') aAddressLine.push(sAddressLine);
			sAddressLine = joAddress.findTagCI('DependentLocality'      ).text().trim(); if(sAddressLine != '') aAddressLine.push(sAddressLine);
			
			if(aAddressLine.length > 1) {
				if(aAddressLine[0].length < 10) // First line is short: probably a number
					aAddressLine[0] = aAddressLine.shift() + ', ' + aAddressLine[0];  // merge Number with Street
				while(aAddressLine.length > 3) { // Too many lines to fit
					// Identify the shortest pair of adjacent strings
					var minIdx = aAddressLine.length - 1, minLen = 2048; // Too long
					for(var i = minIdx; i > 0; --i) {
						if(aAddressLine[i].length + aAddressLine[i-1].length < minLen) {
							minIdx = i; minLen = aAddressLine[i].length + aAddressLine[i-1].length
						}
					}
					// ... and merge them.
					aAddressLine[minIdx-1] += ', ' + aAddressLine.splice(minIdx, 1);
				}
			}
			for(var i = aAddressLine.length - 1; i > -1; --i) {
				jQuery('[id="'+oSrcCtl.tgtPrefix+'StreetLine'+(i+1)+'"]').val(aAddressLine[i]).blur();
			}
			for(var i = aAddressLine.length + 1; i < 4; ++i) {
				jQuery('[id="'+oSrcCtl.tgtPrefix+'StreetLine'+i+'"]').val('').blur(); // Clear the rest
			}
			
			jQuery('[id="'+oSrcCtl.tgtPrefix+'PostalTown"]').val(joAddress.findTagCI('PostTown').text().trim()).blur();
			jQuery('[id="'+oSrcCtl.tgtPrefix+'Province"]'  ).val(joAddress.findTagCI('County'  ).text().trim()).blur();
			jQuery('[id="'+oSrcCtl.tgtPrefix+'GBCounty"]'  ).val(joAddress.findTagCI('County'  ).text().trim()).blur();
			jQuery('[id="'+oSrcCtl.tgtPrefix+'PostCode"]'  ).val(joAddress.findTagCI('PostCode').text().trim()).blur();

			jQuery('[id="'+oSrcCtl.tgtPrefix+'CountryCode"]').val('GB').blur();
			
			jQuery('[id="PAFLookupMessage"]').detach();
			jQuery(oSrcCtl).parent().append('<span id="PAFLookupMessage" style="margin-left:1em; color:green; font-weight:bold;">Address found.</span>');
			setTimeout(function() {jQuery('[id="PAFLookupMessage"]').detach()}, 3000);
		},

		PickAddress: function(joAddressList, oSrcCtl) {
			jQuery('body').append(
				'<div id="pickAddressDialogueShade" style="position:fixed; top:0; left:0; height:100%; width:100%; z-index:9999; background-image: url('+"'"+'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAAOwgAADsIBFShKgAAAABp0RVh0U29mdHdhcmUAUGFpbnQuTkVUIHYzLjUuMTAw9HKhAAAADUlEQVQYV2NgYGBwAAAARQBB66uzngAAAABJRU5ErkJggg=='+"'"+');">'+ /* 25% opacity black png because background-color:rgba(0,0,0,.25); does not work in IE*/
				' <div id="pickAddressDialogueFrame" style="position:relative; top:50%; max-height:30em; max-width:30em; width:80%; margin-left:auto; margin-right:auto; margin-top:-15em; background:white; text-align: left; -moz-box-shadow: .3em .3em .6em 0 rgb(0,0,0); -webkit-box-shadow: .3em .3em .6em 0 rgb(0,0,0); box-shadow: .2em .2em 1em .2em rgb(0,0,0); padding:1em; border-top:1px solid silver; border-left:1px solid silver; border-bottom:1px solid grey; border-right:1px solid grey;">'+
				'  <p style="font-weight:bold; font-size:120%;">Please pick your address from the list below:</p>'+
				'  <div id="pickAddressDialogueList" class="selectList" style="height:20em; overflow-y:auto;"></div>'+
				' </div>'+
				'</div>'
				);

			var joSelect = jQuery('[id="pickAddressDialogueList"]').focus();
			joAddressList.each(function(index) {
				joAddress = jQuery(this);
				// Gather non-empty values
				var aAddressLine = []; var sAddressLine = '';
				sAddressLine = joAddress.findTagCI('Organisation'           ).text().trim(); if(sAddressLine != '') aAddressLine.push(sAddressLine);
				sAddressLine = joAddress.findTagCI('Premise'                ).text().trim(); if(sAddressLine != '') aAddressLine.push(sAddressLine);
				sAddressLine = joAddress.findTagCI('DependentStreet'        ).text().trim(); if(sAddressLine != '') aAddressLine.push(sAddressLine);
				sAddressLine = joAddress.findTagCI('Street'                 ).text().trim(); if(sAddressLine != '') aAddressLine.push(sAddressLine);
				sAddressLine = joAddress.findTagCI('DoubleDependentLocality').text().trim(); if(sAddressLine != '') aAddressLine.push(sAddressLine);
				sAddressLine = joAddress.findTagCI('DependentLocality'      ).text().trim(); if(sAddressLine != '') aAddressLine.push(sAddressLine);

				jQuery('<a style="border:none; display:block; color:black; text-decoration:none; cursor:pointer; padding:.5em 0;">'+aAddressLine.join(', ')+'</a>')
					.appendTo(joSelect)
					.bind('click', function(event) {
						PAFLookup.PokeAddress(jQuery(jQuery.parseXML(this.address)), oSrcCtl);
						jQuery('[id="pickAddressDialogueShade"]').detach();
						event.stopPropagation();
					})[0].address = joAddress.xml();
				
			});

			jQuery('[id="pickAddressDialogueShade"]').bind('click', function(event) {
				jQuery(this).detach();
				jQuery('[id="PAFLookupMessage"]').detach();
				jQuery(oSrcCtl)
					.focus().
					parent().append('<span id="PAFLookupMessage" style="margin-left:1em; color:red; font-weight:bold;">Lookup cancelled.</span>');
				setTimeout(function() {jQuery('[id="PAFLookupMessage"]').detach()}, 3000);
				event.stopPropagation();
			});
			
			jQuery('[id="pickAddressDialogueFrame"]').bind('click', function(event) {
				event.stopPropagation();
			});
		},
		
		bind: function(sSrcCtlId, sTgtCtlPrefix) {
			var oSrcCtl = document.getElementById(sSrcCtlId);
			if(typeof oSrcCtl !== 'undefined') {
				oSrcCtl.tgtPrefix = sTgtCtlPrefix;
				
				if(typeof jQuery == 'undefined') {
					oSrcCtl.onblur = function() {
						oTgtCtl = document.getElementById(this.tgtPrefix+'PostCode');
						if((this.value != "") && (oTgtCtl.value == ""))
							oTgtCtl.value = this.value;
					}
					oSrcCtl.onkeydown = function(evt) {
						evt = (evt) ? evt : event;
						if(evt) return (((evt.charCode) ? evt.charCode : ((evt.which) ? evt.which : evt.keyCode)) != 13);
					}
					oSrcCtl.onkeypress = function(evt) {
						evt = (evt) ? evt : event;
						if(evt) return (((evt.charCode) ? evt.charCode : ((evt.which) ? evt.which : evt.keyCode)) != 13);
					}
					oSrcCtl.onkeyup = function(evt) {
						evt = (evt) ? evt : event;
						if(evt) if(((evt.charCode) ? evt.charCode : ((evt.which) ? evt.which : evt.keyCode)) == 13)
							{PAFLookup.go(this); return false;}
						else return true;
					}
				} else {
					jQuery(oSrcCtl)
						.bind('blur', function() {
							if(this.value != "")
								jQuery('[id="'+this.tgtPrefix+'PostCode"]')
									.filter(function() {return this.value == ""})
									.val(this.value);
						})
						.bind('keydown keypress', function(event) {
							if(event.which == 13) {
								event.stopPropagation();
								event.preventDefault();
								return false;
							} else return true;
						})
						.bind('keyup', function(event) {
							if(event.which == 13) {
								PAFLookup.go(this);
								event.stopPropagation();
								event.preventDefault();
								return false;
							} else return true;
						});
				}
			}
		}
	}

	// Initialise default
	// String trim for older browser versions
	if (typeof String.prototype.trim === "undefined") {
		(function(){
			String.prototype.trim = function () {
				return this.replace(/^[\s\xA0]+|[\s\xA0]+$/g, ""); // Trim spacees and &nbsp;
			}
		})();
	}

	jQuery(function() {
		// Case-insensitive tag search for IE that capitalise XML tag names
		if (typeof jQuery.fn.findTagCI === "undefined") {
			(function(){
				jQuery.fn.extend({
					findTagCI: function(sTagName) {
						return this.find('*').filter(function() {
							return this.tagName.match(new RegExp('^'+sTagName+'$', 'i'));
						});
					}
				});
			})();
		}

		// XML serialiser: .html() does not always work
		if (typeof jQuery.fn.xml === "undefined") {
			(function(){
				jQuery.fn.extend({
					xml: function() {
						var xmlString = undefined;
						if(window.ActiveXObject) {
							xmlString = this[0].xml;
						}
						if(typeof xmlString === "undefined") {
							return (new XMLSerializer()).serializeToString(this[0]);
						}
						return xmlString;
					}
				});
			})();
		}

		jQuery(document)
			.bind('keydown', function(event) {
				if((event.which == 27) && (jQuery('[id="pickAddressDialogueShade"]').length > 0)) {
					jQuery('[id="pickAddressDialogueShade"]').detach();
					jQuery('[id="PAFLookupMessage"]').detach();
					if(typeof PAFLookup.oLastCtl !== 'undefined') {
						jQuery(PAFLookup.oLastCtl)
							.focus()
							.parent()
							.append('<span id="PAFLookupMessage" style="margin-left:1em; color:red; font-weight:bold;">Lookup cancelled.</span>');
						setTimeout(function() {jQuery('[id="PAFLookupMessage"]').detach()}, 3000);
					}
					event.stopPropagation();
					event.preventDefault();
					return false;
				}
			});
	});
}