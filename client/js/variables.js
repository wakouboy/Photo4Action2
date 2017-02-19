
var variables = function()
{
      var self = this;
      self.rootAuthorList = [];
      self.topAuthorList = [];
      self.allAuthorList = [];

      self.authorName = 'none';
      self.nodeSizeScale = d3.scale.log().domain([1, 10]).range([2, 6]);
      self.linkSizeScale = d3.scale.linear().domain([1, 5]).range([1, 2]);

      self.defaultWidth = 800; //used for calculate new nodeSize and linkSize when resizing

      self.nodeMIn = 1;
      self.nodeMax = 10;
      self.nodeSize = {'min': 2, 'max': 6};
      self.defaultNodeSize = {'min':2, 'max':6};

      self.linkMin = 1;
      self.linkMax = 14;
      self.linkSize = {'min':0.5, 'max': 1};
      self.defaultLinkSize = {'min':0.5, 'max':1};

      self.nodeColorStyle = d3.scale.category10();



      //forceLayout End
      self.forceLayoutReady = false;
      self.lassoAdded = false;

      //matrix
      self.matrixId = 0;
      //matrix label
      self.labelShow = 'labelHidden'; //label-show
      self.labelSize = 0;
      self.leftLabelShow = true;
      self.rightLabelShow = false;
      self.topLabelShow = true;
      self.bottomLabelShow = false;

      //link
      self.linkPositionFlag = -1; //a kind of nodeId

      //span button
      // textShow:'text-default', //text-all, text-paper, text-default
      self.textShow = 'text-default';
      self.textPaper = false;
      self.textDefault = true;

      self.textPaperThreshold = 100;
      self.layoutStyle = 'nodeTrix'; //nodeLink, nodeTrix;

      //lasso event
      // lassoEvent: 'none', //lasso-drag, lasso-matrix
      self.lassoEvent ='lasso-drag'; //lasso-matrix, lasso-circle
      self.lassoPosition = [0, 0]; //update in lasso.js

      //pan
      self.panPosition = [0, 0];
      self.lassoOrPan = 'lasso';  //pan
      //zoom
      self.zoomVal = 1;
      self.zoomStep = 0.1;

      //curve
      self.bezierController = 150;

      //save data in Local File
      self.saveFlag = false;

      //circle layout
      self.updateCircleLayoutFlag = false;
      self.circleId = 0;

      //node menu
      self.nodeMenuEvent = 'none'; //node-picture, node-expand,node-shrink,node-close
      self.nodeEventId = -1;

      //portrait
      self.nodeWithNewImg = -1;
      self.newImg = -1;
}

variables.prototype.initialize = function ()
{
    var self = this;
    self.setZoomEvent();
}

variables.prototype.updateTextThreholdBar = function(value)
{
  var self = this;
  self.textPaperThreshold = value;
  var $textSizeThreBar = $('#text-thre-bar');
  var $textThreValue = $('#text-value');
  $textSizeThreBar.slider('value', value);
  $textThreValue.html('>' + value);
}

variables.prototype.getNodeSize = function(value)
{
  var self = this;
  var result = self.nodeSizeScale(value);
  if(result === undefined || isNaN(result))
  {
    return 5;
  }
  return result;
}

variables.prototype.getNodeColor = function(value)
{
  var self = this;
  var result = self.nodeColorStyle(value);
  return result;
}

variables.prototype.getLinkSize = function(value)
{
  var self = this;
  var result = self.linkSizeScale(value);
  if(result === undefined || isNaN(result))
  {
    return 2;
  }
  return result;
}

variables.prototype.updateNodeSizeScale = function()
{
  var self = this;
  if(self.nodeMin !== -1 && self.nodeMax !== -1)
  {
    self.nodeSizeScale = d3.scale.log().domain([self.nodeMin, self.nodeMax])
                                       .range([self.nodeSize.min, self.nodeSize.max]);
  }
}

variables.prototype.updateLinkSizeScale = function()
{
  var self = this;
  var linkMax = self.linkMax;
  if(self.linkMin !== -1 && self.linkMax !== -1)
  {
    if(linkMax < 5)
    {
      linkMax = 5;
    }
    self.linkSizeScale = d3.scale.linear().domain([self.linkMin, linkMax])
                                          .range([self.linkSize.min, self.linkMax.max]);
  }
}

variables.prototype.isInArray = function(element, arr)
{
  var self = this;
  var len = arr.length;
  for(var i = 0; i<len; i++)
  {
    if(element === arr[i])
    {
      return true;
    }
  }
  return false;
}

variables.prototype.updateNodeAndLinkSize = function(){
  var self = this;
  var oldWidth = self.defaultWidth;
  var newWidth = Config.graphViewHeight;
  var nodeSize = {};
  var oldNodeSize = self.defaultNodeSize;
  nodeSize.min = oldNodeSize.min * newWidth/oldWidth;
  nodeSize.max = oldNodeSize.max * newWidth/oldWidth;
  var linkSize = {};
  var oldLinkSize = self.defaultLinkSize;
  linkSize.min = oldLinkSize.min * newWidth/oldWidth;
  linkSize.max = oldLinkSize.max * newWidth/oldWidth;

  self.nodeSize = nodeSize;
  self.linkSize = linkSize;
  //update the oldWidth
  self.oldWidth = 800;
}

variables.prototype.setZoomEvent = function(){
  var self = this;
  self.zoom = d3.behavior.zoom()
                .translate([0, 0])
                .scale(1)
                .scaleExtent([0.5, 8])
                .on("zoom", zoom);

  function zoom() {
    var panPosition = [];
    panPosition[0] = d3.event.translate[0];
    panPosition[1] = d3.event.translate[1];
    self.panPosition = panPosition;
    self.zoomVal = d3.event.scale;
    d3.select('#graphSvg #svgG').attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
  }
}

variables.prototype.resetZoomEvent = function(){
  var self = this;
  self.zoom = d3.behavior.zoom()
                .translate([0, 0])
                .scale(1)
                .scaleExtent([0.5, 8])
                .on("zoom", zoom);

  function zoom() {
    var panPosition = [];
    panPosition[0] = d3.event.translate[0];
    panPosition[1] = d3.event.translate[1];
    self.panPosition = panPosition;
    self.zoomVal = d3.event.scale;
    d3.select('#graphSvg #svgG').attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
  }
  d3.select('#graphView #panG')
    .call(Variables.zoom);
}

window.Variables = new variables();



