function Popup(name, innerID) {
  this.name = name;
  this.isOpen = false;
  this.outerID = this.name;
  this.innerID = innerID;
}

Popup.prototype.show = function() {
  var outer = document.getElementById(this.outerID);
  outer.style.opacity = 1;
  outer.style.height = 100 + "vh";
  outer.style.width = 100 + "vw";
  var inner = document.getElementById(this.innerID);
  inner.style.display = "block";
  this.isOpen = true;
};

Popup.prototype.hide = function() {
  var outer = document.getElementById(this.outerID);
  outer.style.opacity = 0;
  outer.style.height = 0;
  outer.style.width = 0;
  var inner = document.getElementById(this.innerID);
  inner.style.display = "none";
  inner.innerHTML = "";
  this.isOpen = 0;
};

Popup.prototype.getHTML = function(code) {
  var s = "";
  s += "<div id=" + this.outerID + " class=\"popup\" style=\"opacity:0; height:0; width:0\">";
  s += "<div id=" + this.innerID + ">";
  s += code || "";
  s += "</div>";
  s += "<button onclick=" + this.name + ".hide() style=\"z-index:50\" class=\"btn-popup normal\">✖</button>";
  s += "</div>";
  return s;
};
