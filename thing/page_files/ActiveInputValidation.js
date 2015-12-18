var cReqPat = '<span class="required-star">*</span>';

var flagCheckMode = 'Full'; // Defined: Full, IndicateOnly, Off
var regex = new RegExp('[\\?&]CheckMode=([^&#]*)');
var results = regex.exec( window.location.href );
if(results != null ) flagCheckMode = results[1];
if(flagCheckMode!='Off') {

	if(typeof bAllowFormSubmit == 'undefined') var bAllowFormSubmit = true;
	var lastVal = '';
	var curVal = 0;
	var curDemoID;
	var curDemo;

	var gaDemos = [];
	var gaValues = [];
	var gsDBG = '';

	ChainLoadEvent(window, InitAIC);

	oForm.onsubmit = function() {
		bAllowFormSubmit = true;
		var firstEmpty = gaValues.length-1;
		for(curVal = firstEmpty; curVal > -1; --curVal) {
			if(gaDemos[gaValues[curVal].Demo].Ctl.style.display == '') {
				curDemoID = gaValues[curVal].Demo;
				curDemo = gaDemos[curDemoID];
				if(!(CtlProc.call(gaValues[curVal].Ctl))) {
					firstEmpty = curVal;
					bAllowFormSubmit=false;
				}
			}
		}

		if(!bAllowFormSubmit) {
			gaValues[firstEmpty].Ctl.focus();
			if(window.jQuery) {
				var oTab = jQuery(gaValues[firstEmpty].Ctl).parents('div.tab.ui-tabs-panel');
				var oCtl = oTab.parents('div.ui-tabs')
				if((oTab.length == 1) && (oCtl.length == 1)) { // jQuey-UI tabs are in use
					oCtl.tabs('option', 'active', oTab.index()-1);
				} else if(jQuery(gaValues[firstEmpty].Ctl).closest('.tabbed').length > 0) { // Adaptive design tabs are in use
					var aTab = jQuery(gaValues[firstEmpty].Ctl).closest('.tabbed').attr('class').match(/(tab[0-9]+)/gi);
					if(aTab.length > 0) {
						jQuery('input.tab#'+aTab.pop()).prop("checked", true).trigger('change');
					}
				}
				setTimeout(function() { // Scroll to the control
					jQuery(window).scrollTop(jQuery(curDemo.Ctl).position().top - jQuery('.header').height());
					}, 20); // Timeout so that it trigger after applyFilters 15 ms timeout
			}
			CtlFocus.call(gaValues[firstEmpty].Ctl);
		}

		return DoSubmit();
	}
}

function InitAIC() {
	var aRows = document.getElementsByTagName('tr');
	for(curRow=0, lenRow=aRows.length; curRow<lenRow; ++curRow)
		if(aRows[curRow].id.indexOf('.FormRow') && (aRows[curRow].className.indexOf('row')==0)) {
			var goDemo = new Object();
			goDemo.Ctl = aRows[curRow];
			goDemo.Hidden = (aRows[curRow].style.display == 'none');

			var aTabs = aRows[curRow].getElementsByTagName('td');
			for(curTab=0, lenTab=aTabs.length; curTab<lenTab; ++curTab) {
				if(aTabs[curTab].className=='caption')
					goDemo.Caption = aTabs[curTab];
				if(aTabs[curTab].className=='validation')
					goDemo.Validation = aTabs[curTab];
				if(aTabs[curTab].className=='field')
					goDemo.Field = aTabs[curTab];
			}

			goDemo.Mandatory = false;
			var aSpans = aRows[curRow].getElementsByTagName('span');
			for(curSpan=0, lenSpan=aSpans.length; curSpan<lenSpan; ++curSpan)
				if((aSpans[curSpan].className=='required-star') && (aSpans[curSpan].textContent=='*' || aSpans[curSpan].innerText=='*')) {
					goDemo.ReqCtl = aSpans[curSpan];
					goDemo.Mandatory = true;
				}
			if(goDemo.Hidden && (gaDemos.length > 0))
				if(gaDemos[gaDemos.length-1].Mandatory) {
					goDemo.ReqCtl = gaDemos[gaDemos.length-1].ReqCtl;
					goDemo.Mandatory = true;
				}


			goDemo.CheckInput = true;
			goDemo.CtlCnt = 0;
			var aInpTypes = ['select', 'input'];
			for(curInpType=0; curInpType<2; ++curInpType) {
				var aCtls = aRows[curRow].getElementsByTagName(aInpTypes[curInpType]);
				for(curCtl=0, lenCtl=aCtls.length; curCtl<lenCtl; ++curCtl) {
					var goCtl = new Object();
					goCtl.Ctl = aCtls[curCtl];
					goCtl.Boolean = (' checkbox radio '.indexOf(' '+aCtls[curCtl].type+' ') > -1);
//					if(' TitleList TitleInput FirstName LastName JobTitle CompanyName StreetLine1 PostalTown PostCode CountryCode TelephoneNo eMailAddress eMailAddressConfirm '.indexOf(' '+aCtls[curCtl].id+' ') > -1)
//						goDemo.Mandatory = true;
					goDemo.CheckInput = (aCtls[curCtl].type=='text');
					goCtl.Demo = gaDemos.length;
					if((aCtls[curCtl].type!='hidden') && (aCtls[curCtl].type!='submit') && (aCtls[curCtl].type!='button')) {
						gaValues.push(goCtl);
						++goDemo.CtlCnt;
//						aCtls[curCtl].title=aCtls[curCtl].id+curCtl+' - '+(gaValues.length-1)+':'+gaDemos.length;

// Respect, http://juixe.com/techknow/index.php/2007/06/20/chain-javascript-events/
						if(!aCtls[curCtl].onfocuses) aCtls[curCtl].onfocuses = []; 
						if(typeof aCtls[curCtl].onfocus == 'function') aCtls[curCtl].onfocuses.push(aCtls[curCtl].onfocus);
						aCtls[curCtl].onfocuses.push( function() {CtlFocus.call(this);} );
						aCtls[curCtl].onfocus = function() {for(i = 0; i < this.onfocuses.length; ++i) this.onfocuses[i].call(this); };

						if(!aCtls[curCtl].onblurs) aCtls[curCtl].onblurs = []; 
						if(typeof aCtls[curCtl].onblur == 'function') aCtls[curCtl].onblurs.push(aCtls[curCtl].onblur);
						aCtls[curCtl].onblurs.push( function() {CtlProc.call(this);} );
						aCtls[curCtl].onblur = function() {for(i = 0; i < this.onblurs.length; ++i) this.onblurs[i].call(this); };

						if(goCtl.Boolean) {
							if(!aCtls[curCtl].onclicks) aCtls[curCtl].onclicks = []; 
							if(typeof aCtls[curCtl].onclick == 'function') aCtls[curCtl].onclicks.push(aCtls[curCtl].onclick);
							aCtls[curCtl].onclicks.push( function() {CtlProc.call(this);} );
							aCtls[curCtl].onclick = function() {for(i = 0; i < this.onclicks.length; ++i) this.onclicks[i].call(this); };

							if(!aCtls[curCtl].onkeyups) aCtls[curCtl].onkeyups = []; 
							if(typeof aCtls[curCtl].onkeyup == 'function') aCtls[curCtl].onkeyups.push(aCtls[curCtl].onkeyup);
							aCtls[curCtl].onkeyups.push( function() {CtlProc.call(this);} );
							aCtls[curCtl].onkeyup = function() {for(i = 0; i < this.onkeyups.length; ++i) this.onkeyups[i].call(this); };
						}

						if(aCtls[curCtl].type=='text') {
							if(!aCtls[curCtl].onkeyups) aCtls[curCtl].onkeyups = []; 
							if(typeof aCtls[curCtl].onkeyup == 'function') aCtls[curCtl].onkeyups.push(aCtls[curCtl].onkeyup);
							aCtls[curCtl].onkeyups.push( function() {if(curDemo.CheckInput) CheckInput.call(this);} );
							aCtls[curCtl].onkeyup = function() {for(i = 0; i < this.onkeyups.length; ++i) this.onkeyups[i].call(this); };
						}
					}
					if(goDemo.CtlCnt>1) gsDBG = aCtls[curCtl].parentNode.style.background;
				}
			}
			gaDemos.push(goDemo);
		}
// Respect, http://www.mkyong.com/javascript/focus-is-not-working-in-ie-solution/
	setTimeout(function() {try {gaValues[0].Ctl.focus();} catch(err) {} }, 10);
	CtlFocus.call(gaValues[0].Ctl);
	
	LPCBR = document.getElementById('LookupPostCode.Button');
	if(LPCBR) {
		LPCB = LPCBR.getElementsByTagName('input')[0];
		if(LPCB) {
			if(!LPCB.onclicks) LPCB.onclicks = []; 
			LPCB.onclicks.push( function() {if(oForm['LookupPostCode'].value != '') PAFClick.call(this);} );
			if(typeof LPCB.onclick == 'function') LPCB.onclicks.push(LPCB.onclick);
			LPCB.onclick = function() {for(i = 0; i < this.onclicks.length; ++i) this.onclicks[i].call(this); };
		}
	}
}

function PAFClick(e) {
	for(curVal = 0; curVal < gaValues.length; ++curVal) {
		if(' CompanyName StreetLine1 StreetLine2 StreetLine3 PostalTown Province GBCounty PostCode CountryCode '.indexOf(' '+gaValues[curVal].Ctl.id+' ') > -1) {
			if(gaValues[curVal].Ctl.style.background.indexOf('yellow') > -1) {
				gaValues[curVal].Ctl.style.background = 'white';
			}
		}
	}
}

function CtlFocus(e) {
	for(curVal = 0; curVal < gaValues.length; ++curVal)
		if(gaValues[curVal].Ctl === this)
			break;

	curDemoID = gaValues[curVal].Demo;
	curDemo = gaDemos[curDemoID];


	if(this.type=='text') {
		if(' FirstName LastName '.indexOf(' '+this.id+' ') > -1) {
			curDemo.CheckInput = (this.value.replace(/^\s+|\s+$/g, '').length = 1);
		} else {
			curDemo.CheckInput = (this.value == '');
		}
	} else {
		curDemo.CheckInput = false;
	}

	if(curDemo.CheckInput && (' TelephoneNo FaxNo MobileNo '.indexOf(' '+this.id+' ') > -1)) {
		switch(document.getElementById('CountryCode').value) {
			case 'GB': this.value = (this.id.indexOf('MobileNo') > -1)?'+447':'+44'; break;
			case 'IE': this.value = '+353'; break;
			case 'AE': this.value = '+971'; break;
			case 'DE': this.value = '+49'; break;
			case 'US': this.value = '+1'; break;
			case 'FR': this.value = '+33'; break;
			case 'HU': this.value = '+36'; break;
			case 'IT': this.value = '+39'; break;
			case 'ES': this.value = '+34'; break;
			case 'NL': this.value = '+31'; break;
			case 'BE': this.value = '+32'; break;
			case 'IN': this.value = '+91'; break;
			case 'NG': this.value = '+234'; break;
			case 'SE': this.value = '+46'; break;
			case 'PL': this.value = '+48'; break;
			case 'EE': this.value = '+372'; break;
			case 'NO': this.value = '+47'; break;
			case 'DK': this.value = '+45'; break;
			case 'PK': this.value = '+92'; break;
			case 'CH': this.value = '+41'; break;
			case 'AU': this.value = '+61'; break;
			case 'PT': this.value = '+351'; break;
			case 'ID': this.value = '+62'; break;
			case 'CA': this.value = '+1'; break;
			case 'TW': this.value = '+886'; break;
			case 'CZ': this.value = '+420'; break;
			case 'FI': this.value = '+358'; break;
			case 'TR': this.value = '+90'; break;
			case 'RO': this.value = '+40'; break;
			case 'GR': this.value = '+30'; break;
			case 'IL': this.value = '+972'; break;
			case 'ZA': this.value = '+27'; break;
			case 'CN': this.value = '+86'; break;
			case 'BG': this.value = '+359'; break;
			case 'UA': this.value = '+380'; break;
			case 'RU': this.value = '+7'; break;
			case 'AT': this.value = '+43'; break;
			case 'BF': this.value = '+226'; break;
			case 'BL': this.value = '+590'; break;
			case 'KR': this.value = '+82'; break;
			case 'SA': this.value = '+966'; break;
			case 'SK': this.value = '+421'; break;
			case 'GH': this.value = '+233'; break;
			case 'MT': this.value = '+356'; break;
			case 'BD': this.value = '+880'; break;
			case 'JP': this.value = '+81'; break;
			case 'SI': this.value = '+386'; break;
			case 'HK': this.value = '+852'; break;
			case 'EC': this.value = '+593'; break;
			case 'BI': this.value = '+257'; break;
			case 'TH': this.value = '+66'; break;
			case 'BR': this.value = '+55'; break;
			case 'CY': this.value = '+357'; break;
			case 'DZ': this.value = '+213'; break;
			case 'LB': this.value = '+961'; break;
			case 'LT': this.value = '+370'; break;
			case 'CI': this.value = '+225'; break;
			case 'HR': this.value = '+385'; break;
			case 'CF': this.value = '+236'; break;
			case 'BB': this.value = '+1 246'; break;
			case 'EG': this.value = '+20'; break;
			case 'JO': this.value = '+962'; break;
			case 'LV': this.value = '+371'; break;
			case 'BA': this.value = '+387'; break;
			case 'KW': this.value = '+965'; break;
			case 'KH': this.value = '+855'; break;
			case 'BJ': this.value = '+229'; break;
			case 'AF': this.value = '+93'; break;
			case 'QA': this.value = '+974'; break;
			case 'SG': this.value = '+65'; break;
			case 'MY': this.value = '+60'; break;
			case 'BH': this.value = '+973'; break;
			case 'BM': this.value = '+1 441'; break;
			case 'LK': this.value = '+94'; break;
			case 'CD': this.value = '+243'; break;
			case 'AR': this.value = '+54'; break;
			case 'KE': this.value = '+254'; break;
			case 'IR': this.value = '+98'; break;
			case 'PH': this.value = '+63'; break;
			case 'MX': this.value = '+52'; break;
			case 'GA': this.value = '+241'; break;
			case 'NZ': this.value = '+64'; break;
			case 'AG': this.value = '+1 268'; break;
			case 'AD': this.value = '+376'; break;
			case 'GD': this.value = '+1 473'; break;
			case 'GI': this.value = '+350'; break;
			case 'SN': this.value = '+221'; break;
			case 'MK': this.value = '+389'; break;
			case 'LU': this.value = '+352'; break;
			case 'MA': this.value = '+212'; break;
			case 'AI': this.value = '+1 264'; break;
			case 'GE': this.value = '+995'; break;
			case 'IS': this.value = '+354'; break;
			case 'NP': this.value = '+977'; break;
			case 'CC': this.value = '+61'; break;
			case 'CM': this.value = '+237'; break;
			case 'LA': this.value = '+856'; break;
			case 'LC': this.value = '+1 758'; break;
			case 'TN': this.value = '+216'; break;
			case 'KG': this.value = '+996'; break;
			case 'LY': this.value = '+218'; break;
			case 'AL': this.value = '+355'; break;
			case 'UG': this.value = '+256'; break;
			case 'OM': this.value = '+968'; break;
			case 'KI': this.value = '+686'; break;
			case 'UZ': this.value = '+998'; break;
			case 'CG': this.value = '+242'; break;
			case 'CO': this.value = '+57'; break;
			case 'SD': this.value = '+249'; break;
			case 'NC': this.value = '+687'; break;
			case 'PE': this.value = '+51'; break;
			case 'SY': this.value = '+963'; break;
			case 'IQ': this.value = '+964'; break;
			case 'MC': this.value = '+377'; break;
			case 'VN': this.value = '+84'; break;
			case 'CL': this.value = '+56'; break;
			case 'ML': this.value = '+223'; break;
			case 'NE': this.value = '+227'; break;
			case 'YE': this.value = '+967'; break;
			case 'JM': this.value = '+1 876'; break;
			case 'NA': this.value = '+264'; break;
			case 'VE': this.value = '+58'; break;
			case 'ZM': this.value = '+260'; break;
			case 'GM': this.value = '+220'; break;
			case 'NI': this.value = '+505'; break;
			case 'TZ': this.value = '+255'; break;
			case 'SZ': this.value = '+268'; break;
			case 'UY': this.value = '+598'; break;
			case 'BY': this.value = '+375'; break;
			case 'KZ': this.value = '+7'; break;
			case 'SL': this.value = '+232'; break;
			case 'ZW': this.value = '+263'; break;
			case 'AO': this.value = '+244'; break;
			case 'BW': this.value = '+267'; break;
			case 'KP': this.value = '+850'; break;
			case 'MD': this.value = '+373'; break;
			case 'MU': this.value = '+230'; break;
			case 'PY': this.value = '+595'; break;
			case 'TG': this.value = '+228'; break;
			case 'TT': this.value = '+1 868'; break;
			case 'AM': this.value = '+374'; break;
			case 'AN': this.value = '+599'; break;
			case 'LI': this.value = '+423'; break;
			case 'MN': this.value = '+976'; break;
			case 'TV': this.value = '+688'; break;
			case 'VU': this.value = '+678'; break;
			case 'BO': this.value = '+591'; break;
			case 'BZ': this.value = '+501'; break;
			case 'GN': this.value = '+224'; break;
			case 'PA': this.value = '+507'; break;
			case 'PR': this.value = '+1'; break;
			case 'SM': this.value = '+378'; break;
			case 'TM': this.value = '+993'; break;
			case 'AS': this.value = '+1 684'; break;
			case 'CR': this.value = '+506'; break;
			case 'ET': this.value = '+251'; break;
			case 'FJ': this.value = '+679'; break;
			case 'FO': this.value = '+298'; break;
			case 'GT': this.value = '+502'; break;
			case 'GW': this.value = '+245'; break;
			case 'HN': this.value = '+504'; break;
			case 'KY': this.value = '+1 345'; break;
			case 'TC': this.value = '+1 649'; break;
			case 'VG': this.value = '+1 284'; break;
			case 'WF': this.value = '+681'; break;
			case 'AZ': this.value = '+994'; break;
			case 'BN': this.value = '+673'; break;
			case 'BS': this.value = '+1 242'; break;
			case 'DM': this.value = '+1 767'; break;
			case 'DO': this.value = '+1 809'; break;
			case 'GL': this.value = '+299'; break;
			case 'GY': this.value = '+592'; break;
			case 'KN': this.value = '+1 869'; break;
			case 'LR': this.value = '+231'; break;
			case 'MM': this.value = '+95'; break;
			case 'MP': this.value = '+1 670'; break;
			case 'MV': this.value = '+960'; break;
			case 'MW': this.value = '+265'; break;
			case 'MZ': this.value = '+258'; break;
			case 'PF': this.value = '+689'; break;
			case 'PG': this.value = '+675'; break;
			case 'RW': this.value = '+250'; break;
			case 'SR': this.value = '+597'; break;
			case 'TO': this.value = '+676'; break;
			case 'VA': this.value = '+39'; break;
			case 'VI': this.value = '+1 340'; break;
			case 'WS': this.value = '+685'; break;
			case 'AQ': this.value = '+672'; break;
			case 'AW': this.value = '+297'; break;
			case 'BT': this.value = '+975'; break;
			case 'CK': this.value = '+682'; break;
			case 'CU': this.value = '+53'; break;
			case 'CV': this.value = '+238'; break;
			case 'CX': this.value = '+61'; break;
			case 'DJ': this.value = '+253'; break;
			case 'ER': this.value = '+291'; break;
			case 'FK': this.value = '+500'; break;
			case 'FM': this.value = '+691'; break;
			case 'GQ': this.value = '+240'; break;
			case 'GU': this.value = '+1 671'; break;
			case 'HT': this.value = '+509'; break;
			case 'IM': this.value = '+44'; break;
			case 'KM': this.value = '+269'; break;
			case 'LS': this.value = '+266'; break;
			case 'ME': this.value = '+382'; break;
			case 'MF': this.value = '+1 599'; break;
			case 'MG': this.value = '+261'; break;
			case 'MH': this.value = '+692'; break;
			case 'MO': this.value = '+853'; break;
			case 'MR': this.value = '+222'; break;
			case 'MS': this.value = '+1 664'; break;
			case 'NR': this.value = '+674'; break;
			case 'NU': this.value = '+683'; break;
			case 'PM': this.value = '+508'; break;
			case 'PN': this.value = '+870'; break;
			case 'PW': this.value = '+680'; break;
			case 'RS': this.value = '+381'; break;
			case 'SB': this.value = '+677'; break;
			case 'SC': this.value = '+248'; break;
			case 'SH': this.value = '+290'; break;
			case 'SO': this.value = '+252'; break;
			case 'ST': this.value = '+239'; break;
			case 'SV': this.value = '+503'; break;
			case 'TD': this.value = '+235'; break;
			case 'TJ': this.value = '+992'; break;
			case 'TK': this.value = '+690'; break;
			case 'TL': this.value = '+670'; break;
			case 'VC': this.value = '+1 784'; break;
			case 'YT': this.value = '+262'; break;
		}
		if (this.createTextRange) {
			var FieldRange = this.createTextRange();
			FieldRange.moveStart('character', this.value.length);
			FieldRange.collapse();
			FieldRange.select();
		} else if (this.setSelectionRange) {
			setTimeout(function() {document.activeElement.setSelectionRange(document.activeElement.value.length, document.activeElement.value.length);}, 1);
		}
//		if(document.getElementById('CountryCode').value=='GB') this.value = '+44';
	}
	lastVal = this.value;
}

function CheckInput(e) {
	this.style.background = 'white';

	if((this.value.indexOf(lastVal)!=0) && (lastVal != '')) {
		lastVal = this.value;
		curDemo.CheckInput = false;
		this.style.background = 'white';
	} else {
		this.style.background = 'rgb(216, 255, 255)';

		var newVal = this.value;

		newVal = newVal
			.replace(/[\x00-\x1F]/g, ' ')
			.replace(/ +/g, ' ');

		var demoType = this.id // Handle Child registrations with Name.1, Name.2 ...
		if(demoType.indexOf('.') > 7) demoType = demoType.substr(0,demoType.indexOf('.'))
		// Handle all variations of these fields in the same manner
		if(demoType.indexOf('FirstName') > -1) demoType = 'FirstName';
		if(demoType.indexOf('LastName') > -1) demoType = 'LastName';
		if(demoType.indexOf('PostCode') > -1) demoType = 'PostCode';
		if(demoType.indexOf('eMailAddress') > -1) demoType = 'eMailAddress';

		switch(demoType) {
			case 'TitleInput':
				newVal = newVal
					.toLowerCase()
					.replace(/(^|\W)([a-z])/g, function(m,p1,p2){return p1+p2.toUpperCase();} )
				break;

			case 'FirstName':
				newVal = newVal
					.toLowerCase()
					.replace(/\W/g, ' ')
					.replace(/ +/g, ' ')
					.replace(/([^a-z ])/g, '')
					.replace(/(^| )([a-z])/g, function(m,p1,p2){return p1+p2.toUpperCase();} )
				break;

			case 'LastName':
				newVal = newVal
					.toLowerCase()
					.replace(/[^\w-\(\)`\']/g, ' ')
					.replace(/ +/g, ' ')
					.replace(/([^a-z `\'-])/g, '')
					.replace(/(^| |\-|\(|\)|`|\')([a-z])/g, function(m,p1,p2){return p1+p2.toUpperCase();} )
					.replace(/(^Mc| Mc)([a-z])/g, function(m,p1,p2){return p1+p2.toUpperCase();} )
					.replace(/(.*)( Mw$)/g, function(m,p1,p2){return p1+p2.toUpperCase();} )
				break;

			case 'JobTitle':
				newVal = newVal
					.replace(/[^\w-\(\)\.']/g, ' ')
					.replace(/ +/g, ' ')
					.replace(/(^)([a-z])/g, function(m,p1,p2){return p1+p2.toUpperCase();} )
				break;

			case 'PostalTown':
				newVal = newVal
					.replace(/[^\w-']/g, ' ')
					.replace(/ +/g, ' ')
					.replace(/(^| )([a-z])/g, function(m,p1,p2){return p1+p2.toUpperCase();} )
				break;

			case 'TelephoneNo':
				newVal = newVal
					.replace(/[^\d +]/gi,'')
					.replace(/(.)(\++)/gi,'$1')
					.replace(/ +/g,' ');
				break;

			case 'FaxNo':
				newVal = newVal
					.replace(/[^\d +]/gi,'')
					.replace(/(.)(\++)/gi,'$1')
					.replace(/ +/g,' ');
				break;

			case 'MobileNo':
				newVal = newVal
					.replace(/[^\d +]/gi,'')
					.replace(/(.)(\++)/gi,'$1')
					.replace(/ +/g,' ');
				break;

			case 'PostCode':
				newVal = newVal
					.replace(/[^\w ]/gi,'')
					.replace(/ +/g,' ').toUpperCase();
				break;

			case 'eMailAddress':
				newVal = newVal
					.replace(/[^a-z0-9\.@!\x23$%&'*+/=?^_`{|}~-]/gi,'');
				break;

//   CompanyName StreetLine1
		}
		if(newVal != this.value) {
			if(flagCheckMode == 'IndicateOnly') {
				if(newVal.toUpperCase() == this.value.toUpperCase()) {
					this.style.background = 'lightgreen';
					this.value = newVal;
				} else {
					this.style.background = 'red';
					newVal = this.value;
				}
			} else {
				this.value = newVal;
			}
		}
		lastVal = newVal;
	}
}

function CtlProc(e) {
	for(curVal = 0; curVal < gaValues.length; ++curVal)
		if(gaValues[curVal].Ctl === this)
			break;

	curDemoID = gaValues[curVal].Demo;
	curDemo = gaDemos[curDemoID];
	curDemo.CheckInput = ((this.type=='text') && (this.value==''));


	var isValueSet = false;

	if((' TelephoneNo FaxNo MobileNo '.indexOf(' '+this.id+' ') > -1) && (this.value.length < 7)) this.value = '';
// this.value == '+44'

	for(i = 0; i < gaValues.length; ++i)
		if(gaValues[i].Demo == curDemoID) {
			if(gaValues[i].Boolean) {
				isValueSet |= gaValues[i].Ctl.checked;
			} else {
				if(' FirstName LastName '.indexOf(' '+this.id+' ') > -1) {
					isValueSet |= (gaValues[i].Ctl.value.replace(/^\s+|\s+$/g, '').length > 1);
				} else {
					isValueSet |= (gaValues[i].Ctl.value != '');
				}
			}
		}

	// Ireland Exception PostCode
	if(this.id=='CountryCode') {
		if(this.value=='IE') {
			if(document.getElementById('PostCode').parentNode.parentNode.getElementsByTagName('span')[0])
				document.getElementById('PostCode').parentNode.parentNode.getElementsByTagName('span')[0].style.display='none';
			document.getElementById('PostCode').style.background = 'white';
		} else {
			if(document.getElementById('PostCode').parentNode.parentNode.getElementsByTagName('span')[0])
				document.getElementById('PostCode').parentNode.parentNode.getElementsByTagName('span')[0].style.display='';
		}
	}

	if(curDemo.Mandatory && !(isValueSet)) {
		// Ireland Exception PostCode
		if(this.id=='PostCode' && document.getElementById('CountryCode').value=='IE') {this.style.background = 'white'; return true;}
		
		if(curDemo.CtlCnt==1)
			{this.style.background = 'yellow'}
		else {
			for(i = 0; i < gaValues.length; ++i)
				if(gaValues[i].Demo == curDemoID)
					gaValues[i].Ctl.parentNode.style.background = 'yellow';
		}
		Blink(curDemo.ReqCtl,6);
		bAllowFormSubmit = false;
		return false;
	} else {
		if(curDemo.CtlCnt==1)
			{this.style.background = 'white'}
		else {
			for(i = 0; i < gaValues.length; ++i)
				if(gaValues[i].Demo == curDemoID)
					gaValues[i].Ctl.parentNode.style.background = gsDBG;
		}
		return true;
	}
}

function Blink(inCtl, inCnt) {
	if(inCnt>0) {
		inCtl.style.display = (inCnt%2)?'':'none';
		setTimeout(function() {Blink(inCtl, --inCnt)},300);
	}
}