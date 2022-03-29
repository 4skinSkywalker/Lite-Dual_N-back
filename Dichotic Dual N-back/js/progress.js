function Progress(name, height, background, color) {
  this.name = name;
  this.progressClass = this.name + "-outer";
  this.barClass = this.name + "-inner";
  this.height = height;
  this.background = background;
  this.color = color;
  this.stored = 0;
}

Progress.prototype.getHTML = function() {
  var s = "";
  s += "<div class=" + this.progressClass + " style=\"position:absolute; z-index:40; width:100%; height:" + this.height + "; top:0; left:0; background-color:" + this.background + "\">";
  s += "<div class=" + this.barClass + " style=\"position:absolute; width:0; height:100%; background-color:" + this.color + "\"></div>";
  s += "</div>";
  return s;
};

Progress.prototype.move = function(curr) {
  this.current = curr;
  that = this;
  Array.prototype.forEach.call(document.getElementsByClassName(this.barClass), function(item, index) {
    that.advance = function() {
      if (that.stored >= that.current) {
        clearInterval(that.interval);
      } else {
        that.stored++;
        item.style.width = that.stored + "%";
      }
    }
    that.interval = setInterval(that.advance.bind(that), 10);
  });
};
