// Tab switch event
var TabEvents = new (function() {

  this.handlers = {};
  this.storage = {};
  this.storage.activeTab = null;

  this.loop = function() {
    //changed
    var tabs = ["0", "1", "2", "3", "4", "5", "6", "Z"];
    for (var tab = 0; tab < tabs.length; tab++)
    if (this.storage.activeTab !== tabs[tab] && $(".nav.tabs .tab[for=tab" + tabs[tab] + "]").hasClass("active")) {
        this.storage.activeTab = tabs[tab];
        this.fire("changed", [this.storage.activeTab]);
        break;
    }
    if (this.loopInterval === undefined) this.loopInterval = setInterval(this.loop, 10);
  }.bind(this)
  
  this.register = function(event, handler) {
    if (this.handlers[event] === undefined) this.handlers[event] = [];
    this.handlers[event].push(handler);
    return this.handlers[event].length - 1;
  }.bind(this)
  
  this.unregister = function(event, id) {
    this.handlers[event].slice(id, 1);
  }.bind(this)
  
  this.fire = function(event, args) {
    if (this.handlers[event] === undefined) return;
    for (var i = 0; i < this.handlers[event].length; i++) this.handlers[event][i].apply(this, args);
  }.bind(this)

})();

// Unvisited tabs are invisible
var tabVisited = {};
TabEvents.register("changed", function() {
  $(".nav.tabs .tab, .nav.progress .tab").each(function(i, e) {
    if ($(e).hasClass("active")) tabVisited[e.getAttribute("for")] = true;
    if (tabVisited[e.getAttribute("for")] == true || e.getAttribute("for") == "tabZ") $(e).removeClass("inactive");
    else $(e).addClass("inactive");
  });
});

// Autofocus
TabEvents.register("changed", function(tab) {
  //if ($(".portrait").css("display") != "block") return; //Only on mobile
  if (tab == "3") setTimeout(function(){ $("#FirstName")[0].focus(); }, 200);
});

// Different tile styling in basket
TabEvents.register("changed", function(tab) {
  //if ($(".portrait").css("display") != "block") return; //Only on mobile
  if (tab == "Z") $("body").addClass("basket");
  else $("body").removeClass("basket");
});

// Mobile continue button
function openLastTab() {
  var lastTab = "tab0";
  for (var i = 0; i <= 5; i++) if (tabVisited["tab" + i] == true) lastTab = "tab" + i;
  console.log(lastTab);
  jQuery('input.tab#' + lastTab).click();
}
function submitForm() {
  if (tabVisited.tab0 && tabVisited.tab1 && tabVisited.tab2 && tabVisited.tab3 && tabVisited.tab4 && tabVisited.tab5 && tabVisited.tab6)
    $(".RegistrationSubmitButton").click()
  else
    openLastTab();
}
TabEvents.register("changed", function(tab) {
  if (tab == "Z") {
    $(".nav.next").removeClass("disabled");
    $(".nav.next").html("Continue");
    $(".nav.next").on("click", submitForm);
    $(".nav.prev").on("click", openLastTab);
  } else {
    $(".nav.next").html("Next");
    $(".nav.next").off("click", submitForm);
    $(".nav.prev").off("click", openLastTab);
  }
});

$(".tab").on("click", function(event){ if ($(this).hasClass("inactive")) event.preventDefault(); });

TabEvents.loop();

// Wrap form and event handler in their own div
$("#Form\\.0").wrap("<div id='filters-fix'>");
jQuery(".event-handler").detach().prependTo("#filters-fix");
	
// Set active tabs on load
function setTabActive(tab){tabVisited[tab]=true;$("#" + tab).removeClass("inactive")}
setTabActive("tab1")
setTabActive("tab2")
setTabActive("tab3")
