
var datacenter = function()
{
  var self = this;
  self.authorNameDict = {};
  self.authorIdNodeIndexDict = {};
  self.linkIdLinkIndexDict = {};
  self.coauthorGraph = {};
  self.coauthorGraph.nodes = [];
  self.coauthorGraph.links = [];
  self.init();
}

datacenter.prototype.init = function(){
  var self = this;
  setTimeout(function() {
  self.start();
  d3.select('#home-page').style('display', 'block');
  self.removeLoading();
  }, 2000);

}

datacenter.prototype.start = function(){
  var self = this;

  var url;
  if(url === undefined)
  {
    self.wsUrlDB = 'ws://array:8765/ws';
     // self.wsUrlDB = 'ws://192.168.40.23:8765/ws';
  }
  else
  {
    self.wsUrlDB = url;
  }
  self.wsDB = new WebSocket(self.wsUrlDB);
  console.log('jquery~~', $);
  self.wsDB_ok = $.Deferred();

  self.wsDB.onopen = function() {
    console.log('COMMUNICATOR: opened!');
    self.wsDB_ok.resolve();
  };

  self.wsDB.onmessage = function(evt) {
    var msg_received = JSON.parse(evt.data);
    console.log('COMMUNICATOR: message received: ' + msg_received.message + '!');
    self.handleMessage(msg_received);
  };

  self.wsDB.onclose = function() {
    console.log('COMMUNICATOR: closed!');
  };
}

datacenter.prototype._send = function(message, data){
  var self = this;

  var msg_to_sent = JSON.stringify({
    message: message,
    data: data
  });

  self.wsDB_ok.done(function() {
    console.log('COMMUNICATOR: message sent!******');
    self.wsDB.send(msg_to_sent);
  });
}

datacenter.prototype.handleMessage = function(){
  var self = this;
  self.message = evt_data.message;
  var data = evt_data.data;
  console.log(data);
  switch(self.message){

  }
}

//broadcast
datacenter.prototype.dealData_Sage2 = function(data){
  var self = this;
  Config.alphaTick = 0.02;
  self.data = data;

  self.handleRelatedData_Sage2(data);
  self.calAuthorNameDictForSage2(data.coauthorGraph);
  // self.updateNodesBasedOldNodes(data);
  self.calAuthorIdNodeIndexDict(data.coauthorGraph);
  self.updateLinksBasedOldLinks(data);
  self.calLinkIdLinkIndexDict(data.coauthorGraph);


  //upadte rootAuthorList
  self.updateRootAuthorList(data.rootAuthorList);
  LayoutRender.setData(self.coauthorGraph);
  LayoutRender.drawLayout();
  self.dataReady = true;
}

datacenter.prototype.calAuthorNameDictForSage2 = function(graphData){
  var self = this;
  self.authorNameDict = {};
  graphData.nodes.forEach(function(d_node, i_node){
    var authorName = d_node.name;
    var authorId = d_node.id;
    if(self.authorNameDict[authorName] === undefined)
    {
      self.authorNameDict[authorName] = authorId;
    }
  });
}

datacenter.prototype.calAuthorIdNodeIndexDict = function(graphData){
  var self = this;
  self.authorIdNodeIndexDict = {};
  graphData.nodes.forEach(function(d_node, i_node){
    self.authorIdNodeIndexDict[d_node.id] = i_node;
  });
}

datacenter.prototype.calLinkIdLinkIndexDict = function(graphData){
  var self = this;
  self.linkIdLinkIndexDict = {};
  graphData.links.forEach(function(d_link, i_link){
    self.linkIdLinkIndexDict[d_link.id] = i_link;
  });
}

datacenter.prototype.handleRelatedData_Sage2 = function(data)
{
  var self = this;
  self.coauthorGraph = data.coauthorGraph;
}

datacenter.prototype.updateNodesBasedOldNodes = function(data)
{
  var self = this;
  var nodeArr = data.coauthorGraph.nodes;

  if(self.authorIdNodeIndexDict === undefined)
  {
    self.calAuthorIdNodeIndexDict(data.coauthorGraph);
  }

  nodeArr.forEach(function(d_node, i_node){
    var nodeId = d_node.id;
    var nodeIndex = self.authorIdNodeIndexDict[nodeId];
    d_node.flag = 1;
    d_node.linkIdArr = [];
    if(nodeIndex !== undefined)
    {
      var oldNode = self.coauthorGraph.nodes[nodeIndex];
      d_node.fixed = true;
      d_node.nodeType1 = oldNode.nodeType1;
      d_node.nodeType2 = oldNode.nodeType2;
      d_node.px = oldNode.px;
      d_node.py = oldNode.py;
      d_node.x = oldNode.x;
      d_node.y = oldNode.y;
    }
    else
    {
      d_node.px = Config.nodeDefaultX;
      d_node.py = Config.nodeDefaultY;
      d_node.x = Config.nodeDefaultX;
      d_node.y = Config.nodeDefaultY;
    }
  });
}

datacenter.prototype.updateLinksBasedOldLinks = function(data)
{
  var self = this;
  var linkArr = data.coauthorGraph.links;
  if(self.linkIdLinkIndexDict === undefined)
  {
    self.calLinkIdLinkIndexDict(data.coauthorGraph);
  }

  linkArr.forEach(function(d_link, i_link){
    var linkId = d_link.id;
    var linkIndex = self.linkIdLinkIndexDict[linkId];
    var sourceNodeId, targetNodeId, sourceNodeIndex, targetNodeIndex, sourceNode, targetNode, sourcePositionX, sourcePositionY, targetPositionX, targetPositionY;

    sourceNodeId = d_link.sourceId;
    targetNodeId = d_link.targetId;
    sourceNodeIndex = self.authorIdNodeIndexDict[sourceNodeId];
    targetNodeIndex = self.authorIdNodeIndexDict[targetNodeId];
    sourceNode = self.coauthorGraph.nodes[sourceNodeIndex];
    targetNode = self.coauthorGraph.nodes[targetNodeIndex];
    if(sourceNode.linkIdArr === undefined)
    {
      sourceNode.linkIdArr = [];
    }
    if(!Variables.isInArray(linkId, sourceNode.linkIdArr))
    {
      sourceNode.linkIdArr.push(linkId);
    }
    if(targetNode.linkIdArr === undefined)
    {
      targetNode.linkIdArr = [];
    }
    if(!Variables.isInArray(linkId, targetNode.linkIdArr))
    {
      targetNode.linkIdArr.push(linkId);
    }

    d_link.flag = 1;
    d_link.index = i_link;
    d_link.source = sourceNode;
    d_link.target = targetNode;
  });
}

datacenter.prototype.updateRootAuthorList = function(rootAuthorList)
{
  var self = this;
  Variables.rootAuthorList = rootAuthorList;
}

  //animation circle arr
datacenter.prototype.circleArrAnimation_Sage2 = function(nodeIdArr){
  var self = this;
  var nodeIdObjArr = [];
  var durationTime = 700;
  var times = 0;
  nodeIdArr.forEach(function(d_nodeId, i_nodeId){
    var type = d_nodeId;
    if(type !== 'number')
    {
      d_nodeId = (+d_nodeId);
    }
    var obj = {};
    obj.ele = d3.select('#gNode' + d_nodeId).selectAll('circle');
    obj.durationTime = 700;
    obj.times = 0;
    obj.r = d3.select('#gNode' + d_nodeId + ' .nodeType1').attr('r');
    obj.r = (+obj.r);
    nodeIdObjArr.push(obj);
  });

  nodeIdObjArr.forEach(function(d_node, i_node){
    self.circleAnimation(d_node);
    d_node.stopAnimation = setInterval(function(){self.circleAnimation(d_node);}, durationTime * 2);
  });
}

datacenter.prototype.circleAnimation = function (d_node){
  var ele = d_node.ele;
   ele.transition()
      .delay(0)
      .duration(d_node.durationTime)
      .attr('r', function(){
          return 2 * d_node.r;
      });
  ele.transition()
      .delay(d_node.durationTime)
      .duration(d_node.durationTime)
      .attr('r', function(){
          return d_node.r;
      });
  d_node.times = d_node.times + 1;

  if(d_node.times === 10)
  {
      clearInterval(d_node.stopAnimation);
  }
}

datacenter.prototype.nodeAnimation_Sage2 = function(nodeId)
{
  var self = this;
  var durationTime = 300;
  var times = -10;
  var typeOfNodeId = typeof nodeId;
  if(typeOfNodeId !== 'number')
  {
    nodeId = (+nodeId);
  }
  console.log('animation~~~~~', nodeId);

  var nodeIndex = self.authorIdNodeIndexDict[nodeId];
  if(nodeIndex === undefined)
  {
    return false;
  }
  var authorNode = self.coauthorGraph.nodes[nodeIndex];
  var obj = {};
  d3.select('#gNode' + nodeId)
    .append('circle')
    .attr('id', 'animationCircle' + nodeId)
    .attr('x', 0)
    .attr('y', 0)
    .attr('r', authorNode.r1 * 1.5);

  obj.ele = d3.select('#animationCircle' + nodeId);
  obj.durationTime = durationTime;
  obj.times = times;
  obj.r = authorNode.r1 * 1.5;
  obj.nodeId = nodeId;

  self.circleAnimation(obj);
  var stopAnimation = setInterval(function(){self.circleAnimation(obj);}, durationTime * 2);
  d3.select('#animationCircle' + nodeId).attr('stopAnimation', stopAnimation);
  authorNode.stopAnimation = stopAnimation;
}

datacenter.prototype.stopNodeAnimation_Sage2 = function(nodeId){
  var self = this;
  var typeOfNodeId = typeof nodeId;
  if(typeOfNodeId !== 'number')
  {
    nodeId = (+nodeId);
  }
  console.log('animation stop~~~~~', nodeId);

  var nodeIndex = self.authorIdNodeIndexDict[nodeId];
  if(nodeIndex === undefined)
  {
    return false;
  }
  var authorNode = self.coauthorGraph.nodes[nodeIndex];
  var stopAnimation = authorNode.stopAnimation;
  if(stopAnimation !== "" && stopAnimation !== undefined)
  {
    clearInterval(stopAnimation);
    authorNode.stopAnimation = '';
  }
  $('#animationCircle' + nodeId).remove();
}

//dataPayload = {'idArr':[], 'positionDVal':{'x':,'y'}}
datacenter.prototype.lassoToMove_Sage2 = function(dataPayload){
  var self = this;
  var idArr = dataPayload.idArr;
  var positionDVal = dataPayload.positionDVal;

  idArr.forEach(function(d_nodeId, i_nodeId){
    var type = typeof d_nodeId;
    if(type !== 'number')
    {
      d_nodeId = (+d_nodeId);
    }
    var nodeIndex = self.authorIdNodeIndexDict[d_nodeId];
    if(nodeIndex === undefined)
    {
      return false;
    }
    var authorNode = self.coauthorGraph.nodes[nodeIndex];
    var oldPositionX = authorNode.x;
    var oldPositionY = authorNode.y;
    oldPositionX = (+oldPositionX);
    oldPositionY = (+oldPositionY);
    var newPosition = {};
    newPosition.x = oldPositionX + positionDVal.x;
    newPosition.y = oldPositionY + positionDVal.y;

    authorNode.x = newPosition.x;
    authorNode.y = newPosition.y;
  });
}

datacenter.prototype.nodeToMove_Sage2 = function(dataPayload){
  var self = this;
  var nodeId = dataPayload.id;
  var typeOfNodeId = typeof nodeId;
  if(typeOfNodeId !== 'number')
  {
    nodeId = (+nodeId);
  }
  var positionDVal = dataPayload.positionDVal;

  var nodeIndex = self.authorIdNodeIndexDict[nodeId];
  if(nodeIndex === undefined)
  {
    return false;
  }
  var authorNode = self.coauthorGraph.nodes[nodeIndex];
  var oldPositionX = authorNode.x;
  var oldPositionY = authorNode.y;
  oldPositionX = (+oldPositionX);
  oldPositionY = (+oldPositionY);
  var newPosition = {};
  newPosition.x = oldPositionX + positionDVal.x;
  newPosition.y = oldPositionY + positionDVal.y;

  authorNode.x = newPosition.x;
  authorNode.y = newPosition.y;
}

datacenter.prototype.getCoauthorGraphData_Sage2 = function(){
  var self = this;
  return LayoutRender.data;
}

datacenter.prototype.saveDataInJson = function(){
  var self = this;
  var result = Savedatainjson.saveDataInLocal();
  self.postDataMessage(result);
}

datacenter.prototype.postDataMessage = function(){
  var self = this;
  resultData = JSON.stringify(resultData);
  var message = Config.postDataMsg;
  self._send(message, resultData);
}

datacenter.prototype.clickNodeEventFromSage = function(clickPosition){
  var self = this;
  var nodeArr = self.coauthorGraph.nodes;
  var len = nodeArr.length;
  var selectedNodeId = -1;
  var positionX, positionY;
  var nodeR;
  var distance;
  var d_node;
  clickPosition[0] = (+clickPosition[0]);
  clickPosition[1] = (+clickPosition[1]);
  console.log('click position~~~~', clickPosition[0], ' , ', clickPosition[1]);
  for(var i = 0; i<len; i++)
  {
    d_node = nodeArr[i];
    nodeR = d_node.r1;
    positionX = (+d_node.x);
    positionY = (+d_node.y);
    distance = Math.pow((positionX - clickPosition[0]), 2) + Math.pow((positionY- clickPosition[1]), 2);
    nodeR = (+nodeR);
    nodeR = Math.pow(nodeR, 2);
    if(distance < nodeR)
    {
      selectedNodeId = d_node.id;
      console.log('circle position~~~~~: ', positionX, ' , ', positionY);
      console.log('selected node id~~~~~: ', selectedNodeId);
      break;
    }
  }
  if(selectedNodeId !== -1)
  {
    return selectedNodeId;
  }
  return false;
}

datacenter.prototype.addLoading = function(){
  var self = this;
  var loadingId = Config.loadingId;
  $('#' + loadingId).show();
}

datacenter.prototype.removeLoading = function(){
  var self = this;
  var loadingId = Config.loadingId;
  $('#' + loadingId).hide();

  d3.selectAll('#animationCircle').attr('stopAnimation', function(){
      var stopAnimation = d3.select(this).attr('stopAnimation');
      clearInterval(stopAnimation);
      return '';
    })
    .remove();
}

datacenter.prototype.clearAll = function(){
  var self = this;
  self.coauthorGraph = {};
  self.coauthorGraph.nodes = [];
  self.coauthorGraph.links = [];
  self.authorIdNodeIndexDict = {};
  self.linkIdLinkIndexDict = {};

      //data in variables
    Variables.rootAuthorList = [];
}

datacenter.prototype.resetLayoutValue = function(){
  var self = this;
  var relatedEleId = 'svgG';
  var zoomVal = 1;
  var panPosition = [0, 0];
  // d3.select('#' + relatedEleId)
  //   .attr('transform', function(){
  //     return 'translate(' + panPosition[0] + ',' + panPosition[1] + ') scale(' + zoomVal + ')';
  //   });
  Variables.zoomVal = zoomVal;
  Variables.panPosition = panPosition;
  Variables.resetZoomEvent();

  Variables.authorName = 'none';
  Variables.rootAuthorList = [];
}


window.Datacenter = new datacenter();







