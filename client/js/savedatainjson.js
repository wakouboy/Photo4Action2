
var savedatainjson = function(){

}

savedatainjson.prototype.saveFullDataInLocal = function()
{
  var self = this;
  var resultData = self.getFullDataInLocal();

  var zoomVal = Config.zoomValForReady;
  var axesPosition = Config.axesPositionForReady;
  resultData.zoomVal = zoomVal;
  resultData.axesPosition = [];
  resultData.axesPosition[0] = axesPosition[0];
  resultData.axesPosition[1] = axesPosition[1];

  var json = JSON.stringify(resultData);
  var blob = new Blob([json], {type: "application/json"});
  var url  = URL.createObjectURL(blob);

  return resultData;
}

savedatainjson.prototype.getFullDataInLocal = function(){
  var self = this;
  var resultData = {};
  resultData.rootAuthorList = Variables.rootAuthorList;
  resultData.coauthorGraph = {};
  resultData.coauthorGraph.nodes = [];
  resultData.coauthorGraph.links = [];
  LayoutRender.data.nodes.forEach(function(d_node, i_node){
    var obj = {};
    var keys = Object.keys(d_node);
    var len = keys.length;
    for(var i = 0; i<len; i++)
    {
      obj[keys[i]] = d_node[keys[i]];
    }
    obj.img = -1;
    resultData.coauthorGraph.nodes.push(obj);
  });
  LayoutRender.data.links.forEach(function(d_link,i_link){
    var obj = {};
    obj.connectedTimes = d_link.connectedTimes;
    obj.id = d_link.id;
    obj.paperNum = d_link.paperNum;
    obj.sourceId = d_link.sourceId;
    obj.targetId = d_link.targetId;
    obj.yearDict = {};
    obj.source = d_link.source.index;
    obj.target = d_link.target.index;
    obj.yearDict = -1;

    resultData.coauthorGraph.links.push(obj);

  });

  return resultData;
}

savedatainjson.prototype.saveDataInLocal = function(){
  var self = this;
  var resultData = self.getDataToLocal();

  var json = JSON.stringify(resultData);
  var blob = new Blob([json], {type: "application/json"});
  var url  = URL.createObjectURL(blob);

  return resultData;
}

savedatainjson.prototype.getDataToLocal = function(){
  var self = this;
  var self = this;
  var forceLayoutData = LayoutRender.data;
  var resultData = {};
  resultData.nodes = [];
  resultData.links = {};
  forceLayoutData.nodes.forEach(function(d_node, i_node){
    var obj = [];
    var x = Math.floor(d_node.x);
    var y = Math.floor(d_node.y);
    var r = Math.floor(d_node.r1);
    var id = d_node.id;
    var name = d_node.name;
    obj.push(x);
    obj.push(y);
    obj.push(r);
    obj.push(id);
    obj.push(name);
    resultData.nodes.push(obj);
  });

  forceLayoutData.links.forEach(function(d_link, i_link){
    var sourceId = d_link.sourceId;
    var targetId = d_link.targetId;
    if(resultData.links[sourceId] === undefined)
    {
      resultData.links[sourceId] = [];
    }
    resultData.links[sourceId].push(targetId);
  });
  resultData.bestNodeSize = 60;
  resultData.width = forceLayoutData.width;
  resultData.height = forceLayoutData.height;
  return resultData;
}

window.SaveDataInJson = new savedatainjson();
