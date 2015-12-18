function SetChildToggle(ParentElement, ShowElements, HideElements)
{
// Set ShowElements / HideElements visibility depending on ParentElement checked property
// Parameters: ParentElement, ShowElements, HideElements
// Usefil for radio button group
	if (arguments.length == 3)
	{
		document.getElementById(ParentElement).onkeyup = function(){ChildToggle(ParentElement, ShowElements, HideElements)};
		document.getElementById(ParentElement).onclick = function(){ChildToggle(ParentElement, ShowElements, HideElements)};
		document.getElementById(ParentElement).onchange= function(){ChildToggle(ParentElement, ShowElements, HideElements)};
		if(document.getElementById(ParentElement).checked)
			ChildToggle(ParentElement, ShowElements, HideElements);
	}
}

function ChildToggle(ParentElement, ShowElements, HideElements)
{
	var arShowElements = ShowElements.split(" ");
	var arHideElements = HideElements.split(" ");
	
	if (document.getElementById(ParentElement).style.display == "")
	{
		if (arShowElements[0])
			for(I=0, lenArr=arShowElements.length; I<lenArr; ++I)
				{document.getElementById(arShowElements[I]).style.display = (document.getElementById(ParentElement).checked)?"":"none";}
		if (arHideElements[0])
			for(I=0, lenArr=arHideElements.length; I<lenArr; ++I)
				{document.getElementById(arHideElements[I]).style.display = (document.getElementById(ParentElement).checked)?"none":"";}
	}
	else
	{
		if (arShowElements[0])
			for(I=0, lenArr=arChildElements.length; I<lenArr; ++I)
			{document.getElementById(arShowElements[I]).style.display = "none";}
		if (arHideElements[0])
			for(I=0, lenArr=arChildElements.length; I<lenArr; ++I)
				{document.getElementById(arHideElements[I]).style.display = "none";}
	}
}


function SetChildVisible(ParentElement, ChildElements)
{
// Set ChildElements visibility depending on ParentElement [and it's Value] 
// Parameters: ParentElement, ChildElements, [ParentElementValues]
// If there are 3 parameters then parent is assumed to be a ListBox control
// else parent is assumed to be a CheckBox or a RadioButton.
// When there are 3 parameters: 
//   if the number of ChildElements is the same as the number of ParentElementValues
//   then each ParentElementValue reveal corresponding ChildElement
//   else any ParentElementValue reveal all ChildElements
// Hint: you can add the same value twice or add a dumb value to make the numbers different.
	if (arguments.length > 1)
	{
		if (arguments.length == 2)
		{
			document.getElementById(ParentElement).onkeyup = function(){ChildVisible2(ParentElement, ChildElements)};
			document.getElementById(ParentElement).onclick = function(){ChildVisible2(ParentElement, ChildElements)};
			document.getElementById(ParentElement).onchange= function(){ChildVisible2(ParentElement, ChildElements)};
			ChildVisible2(ParentElement, ChildElements);
		}
		else
		{
			var ParentElementValues = arguments[2];
			document.getElementById(ParentElement).onkeyup = function(){ChildVisible3(ParentElement, ChildElements, ParentElementValues)};
			document.getElementById(ParentElement).onchange= function(){ChildVisible3(ParentElement, ChildElements, ParentElementValues)};
			ChildVisible3(ParentElement, ChildElements, ParentElementValues);
		}
	}
}

function ChildVisible2(ParentElement, ChildElements)
{
	var arChildElements = ChildElements.split(" ");
	for(I=0, lenArr=arChildElements.length; I<lenArr; ++I)
		{document.getElementById(arChildElements[I]).style.display = "none";}

	if (document.getElementById(ParentElement).style.display == "")
	{
		if (document.getElementById(ParentElement).checked)
		{
			for(I=0, lenArr=arChildElements.length; I<lenArr; ++I)
				{document.getElementById(arChildElements[I]).style.display = "";}
		}
	}
}



function ChildVisible3(ParentElement, ChildElements, ParentElementValues)
{
	var arChildElements = ChildElements.split(" ");
	var arElementValues = ParentElementValues.split(" ");

	for(I=0, lenArr=arChildElements.length; I<lenArr; ++I) {
		document.getElementById(arChildElements[I]).style.display = "none";
	}

	if(document.getElementById(ParentElement).style.display == "") {
		if(arChildElements.length == arElementValues.length) {
			for(I=0, lenArr=arChildElements.length; I<lenArr; ++I) {
				if(String(document.getElementById(ParentElement).value)==arElementValues[I]) {
					document.getElementById(arChildElements[I]).style.display = "";
				}
			}
		} else {
			if((" "+ParentElementValues+" ").indexOf(" "+String(document.getElementById(ParentElement).value)+" ")>=0) {
				for(I=0, lenArr=arChildElements.length; I<lenArr; ++I) {
					document.getElementById(arChildElements[I]).style.display = "";
				}
			}
		}
	}
}