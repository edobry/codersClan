$(window).on("load", function() {
  // Get value of DirectPopUp parameter from location
  var dpo = location.toString().match(/[&?]DirectPopUp=([^&?]*)/);
  if (!dpo) return;
  dpo = decodeURIComponent(dpo[1]);
  
  // If it refers to a tab, activate the tab.
  function dpoTab(tab) {
    var tabNum = (tab.match(/^tab(\d)$/) ||[,0])[1];
    for (var i = 0; i < tabNum; i++) tabVisited["tab" + i] = true;
    $("#" + tab).click();
  }
  if (dpo.match(/^tab[\d\w]$/)) {
    dpoTab(dpo);
    return;
  }
  
  // If it refers to an element, find out to which tab it refers.
  if (document.getElementById("PriceList." + dpo) != null) {
    var $p = $(document.getElementById("PriceList." + dpo)).parent()
    var tabs = ["tab0", "tab1", "tab2", "tab3", "tab4", "tab5", "tabZ"];
    for (var i = 0; i < tabs.length; i++) if ($p.hasClass(tabs[i])) {
      dpoTab(tabs[i]);
      break;
    }
    $p.click();
  }
});