
var layoutrender = function(){
  var self = this;
  self.linkDistance = 25;
  self.linkStrength = 0.45;
  self.charge = -500;
  self.gravity = 0.1;
  self.alpha = 0.1;
  self.fixed = false;
  self.showLabel = false;
  self.nodeHover = true;
  self.nodeDblclick = true;
  self.showColor = false;
  self.panZoom = true;
  self.defaultX = -1;
  self.defaultY = -1;

  self.data = {};
  self.data.nodes = [];
  self.data.links = [];

  self.calLinearPath = d3.svg.line()
                       .x(function(d){return d.x;})
                       .y(function(d){return d.y;})
                       .interpolate('linear');

  self.chargeScale = d3.scale.linear()
                           .domain([800, 900])
                           .range([-500, -600]);
  // self.layoutInit();
  self.forceInit();
}

layoutrender.prototype.layoutInit = function(divId){
  var self = this;
  if(divId === undefined)
  {
    divId = Config.graphViewId;
  }
  d3.select('#' + divId  + ' svg').remove();
  var svg = d3.select('#' + divId).append('svg').attr('id', 'graphSvg');

  self.panG = svg.append('g').attr('id', 'panG');
  self.svgG = svg.append('g').attr('id', 'svgG');
  self.linkG = self.svgG.append('g').attr('id', 'link-layer').attr('class', 'linkG');
  self.nodeG = self.svgG.append('g').attr('id', 'node-layer').attr('class', 'nodeG');
  self.textG = self.svgG.append('g').attr('id', 'text-layer').attr('class', 'textG');
}

layoutrender.prototype.forceInit = function(){
  var self = this;
  self.force = d3.layout.force();

  //stop calculating the graph layout
  self.force.stop();
  if(Config.graphViewWidth === -1 || Config.graphViewHeight === -1)
  {
    return false;
  }

  if(self.data === undefined || self.data.nodes === undefined || self.data.nodes.length === 0)
  {
    console.log(self.data);
    return ;
  }
  var oldWidth = Config.oldGraphViewWidth;
  var oldHeight = Config.oldGraphViewHeight;
  var newWidth = Config.graphViewWidth;
  var newHeight = Config.graphViewHeight;

  var xScale = d3.scale.linear()
                 .domain([0, oldWidth])
                 .range([0, newWidth]);
  var yScale = d3.scale.linear()
                 .domain([0, oldHeight])
                 .range([0, newHeight]);

  //change node position
  self.data.nodes.forEach(function(d_node, i_node){
    var oldX = d_node.x;
    var oldY = d_node.y;
    var newX = xScale(oldX);
    var newY = yScale(oldY);
    d_node.x = newX;
    d_node.y = newY;
  });
  //change link position
  self.data.links.forEach(function(d_link, i_link){
    var souceX = d_link.source.x;
    var sourceY = d_link.source.y;
    var atrgetX = d_link.target.x;
    var targetY = d_link.target.y;
    d_link.source.x = xScale(sourceX);
    d_link.source.y = yScale(sourceY);
    d_link.target.x = xScale(targetX);
    d_link.target.y = yScale(targetY);
  });

  self.updateOldValue();
  self.getNewlySize();
  self.updateLayoutPosition();
}

layoutrender.prototype.updateOldValue = function()
{
  var self = this;
  var newWidth = Config.graphViewWidth;
  var newHeight = Config.graphViewHeight;

  Config.oldGraphViewWidth = newWidth;
  Config.oldGraphViewHeight = newHeight;
}

layoutrender.prototype.getNewlySize = function(){
  var self = this;
  self.width = Config.graphViewWidth;
  self.height = Config.graphViewHeight;
  self.defaultPositionX = self.width/2;
  self.defaultPositionY = self.height/2;
}



layoutrender.prototype.setData = function(coauthorGraph){
  var self = this;
  self.data = {};
  self.data.nodes = [];
  self.data.links = [];
  self.data.nodes = coauthorGraph.nodes;
  self.data.links = coauthorGraph.links;

  // self.setNodeSize();
}

layoutrender.prototype.setNodeSize = function(){
  var self = this;
  if(self.data === undefined || self.data.nodes === undefined)
  {
    return false;
  }
  self.data.nodes.forEach(function(d_node, i_node){
    var paperNum = d_node.paperNum;
    var size = Variables.getNodeSize(paperNum);
    d_node.r1 = size;
    var unshowedPaperNum = d_node.unshowedPaperNum;
    if(unshowedPaperNum === 0)
    {
      d_node.nodeType2 = 0;
      d_node.r2 = 0;
    }
    else
    {
      d_node.nodeType2 = 1;
      d_node.r2 = Variables.getNodeSize(unshowedPaperNum) * 0.7;
    }
  });
}

layoutrender.prototype.changeViewSize = function(){
  var self = this;
  self.forceInit();
}

layoutrender.prototype.setFixed = function(type){
  var self = this;
  self.data.nodes.forEach(function(d_node, i_node){
    d_node.fixed = type;
  });
}

layoutrender.prototype.transformNodes = function(){
  var self = this;
  var minX = Number.MAX_VALUE;
  var maxX = Number.MIN_VALUE;
  var minY = Number.MAX_VALUE;
  var maxY = Number.MIN_VALUE;
  var nodeSizeMax = Variables.nodeSize.max;

  self.data.nodes.forEach(function(d_node, i_node){
    if(d_node.fixed === false)
    {
      var x = d_node.x;
      var y = d_node.y;
      if(x < minX) minX = x;
      if(x > maxX) maxX = x;
      if(y < minY) minY = y;
      if(y > maxY) maxY = y;
    }
  });

  var width = Config.graphViewWidth;
  var height = Config.graphViewHeight;
  if((maxX - minX) >= (width - nodeSizeMax * 2))
  {
    self.transformXFlag = false;
    self.transformXScale = d3.scale.linear().domain([minX, maxX]).range([nodeSizeMax, width - nodeSizeMax]);
  }
  else
  {
    self.transformXFlag = true;
    self.transformXScale = (width/2 - (maxX + minX)/2);
  }
  if((maxY - minY) >= (height - nodeSizeMax * 2))
  {
    self.transformYFlag = false;
    self.transfromYScale = d3.scale.linear().domain([minY, maxY]).range([nodeSizeMax, height - nodeSizeMax]);
  }
  else
  {
    self.transformYFlag = true;
    self.transfromYScale = (height/2 - (maxY + minY)/2);
  }

  self.layoutMinX = minX;
  self.layoutMaxX = maxX;
  self.layoutMinY = minY;
  self.layoutMaxY = maxY;

  self.updateNodesPosition();
  self.updateLinksPosition();
}

layoutrender.prototype.updateNodesPosition = function(){
  var self = this;
  var defaultX, defaultY;
  self.data.nodes.forEach(function(d_node, i_node){
    if(isNaN(d_node.x) || isNaN(d_node.y))
    {
      defaultX = (+self.defaultX);
      defaultY = (+self.defaultY);

      d_node.x = defaultX;
      d_node.y = defaultY;
      d_node.px = defaultX;
      d_node.py = defaultY;
    }
    else
    {
      d_node.x = (+d_node.x);
      d_node.y = (+d_node.y);
      d_node.px = (+d_node.px);
      d_node.py = (+d_node.py);
      if(d_node.fixed === false)
      {
        if(self.transformXFlag)
        {
          d_node.x = d_node.x + self.transformXScale;
          d_node.px = d_node.px + self.transformXScale;
        }
        else
        {
          d_node.x = self.transformXScale(d_node.x);
          d_node.px = self.transformXScale(d_node.px);
        }

        if(self.transformYFlag)
        {
          d_node.y = d_node.y + self.transfromYScale;
          d_node.py = d_node.py + self.transfromYScale;
        }
        else
        {
          d_node.y = self.transfromYScale(d_node.y);
          d_node.py = self.transfromYScale(d_node.py);
        }
      }
    }
  });
}

layoutrender.prototype.updateLinksPosition = function()
{
  var self = this;
  self.data.links.forEach(function(d_link, i_link){
    var sourceId = d_link.source.id;
    var targetId = d_link.target.id;
    var sourceIndex = Datacenter.authorIdNodeIndexDict[sourceId];
    var targetIndex = Datacenter.authorIdNodeIndexDict[targetId];
    if(sourceIndex !== undefined)
    {
      var sourceNode = self.data.nodes[sourceIndex];
      d_link.source.x = sourceNode.x;
      d_link.source.y = sourceNode.y;
    }
    else
    {
      d_link.source.x = self.defaultX;
      d_link.source.y = self.defaultY;
    }

    if(targetIndex !== undefined)
    {
      var targetNode = self.data.nodes[targetIndex];

      d_link.target.x = targetNode.x;
      d_link.target.y = targetNode.y;
    }
    else
    {
      d_link.target.x = self.defaultX;
      d_link.target.y = self.defaultY;
    }

  });
}

layoutrender.prototype.updateLayout_Sage2 = function(data){
  var self = this;
  // self.copyNodePosition(data.nodes);
  // self.copyLinkPosition(data.links);

  self.updateLayoutPosition();
}

layoutrender.prototype.copyNodePosition = function(nodeArr){
  var self = this;
  self.data.nodes.forEach(function(d_node, i_node){
    var nodeFromSage = nodeArr[i_node];
    if(d_node.id === nodeFromSage.id)
    {
      if(nodeFromSage.x !== undefined && !isNaN(nodeFromSage.x) && nodeFromSage.y !== undefined && !isNaN(nodeFromSage.y))
      {
        d_node.x = nodeFromSage.x;
        d_node.y = nodeFromSage.y;
        d_node.px = nodeFromSage.px;
        d_node.py = nodeFromSage.py;
      }
      else
      {
        d_node.x = self.defaultX;
        d_node.y = self.defaultY;
        d_node.px = self.defaultX;
        d_node.py = self.defaultY;
      }

    }
  });
}

layoutrender.prototype.copyLinkPosition = function(linkArr){
  var self = this;
  self.data.links.forEach(function(d_link, i_link){
    var linkFromSage = linkArr[i_link];
    if(d_link.id = linkFromSage.id){
      if(linkFromSage.source.x !== undefined && !isNaN(linkFromSage.source.x) && linkFromSage.source.y !== undefined && !isNaN(linkFromSage.source.y))
      {
        d_link.source.x = linkFromSage.source.x;
        d_link.source.y = linkFromSage.source.y;
      }
      else
      {
        d_link.source.x = self.defaultX;
        d_link.source.y = self.defaultY;
      }

      if(linkFromSage.target.x !== undefined && !isNaN(linkFromSage.target.x) && linkFromSage.target.y !== undefined && !isNaN(linkFromSage.target.y))
      {
        d_link.target.x = linkFromSage.target.x;
        d_link.target.y = linkFromSage.target.y;
      }
      else
      {
        d_link.target.x = self.defaultX;
        d_link.target.y = self.defaultY;
      }
    }
  });
}

layoutrender.prototype.updateLayoutPosition = function(){
  var self = this;
  var startTime = new Date().getTime();
  // self.drawLayout();
  //update node position
  d3.selectAll('g.gNode')
    .attr('transform', function(d_node, i_node){
        var nodeId = d_node.id;
        var nodeIndex = Datacenter.authorIdNodeIndexDict[nodeId];
        var node = self.data.nodes[nodeIndex];
        d_node.x = node.x;
        d_node.y = node.y;
        return 'translate(' + node.x + ',' + node.y + ')';
    });
  //update link position
  // d3.selectAll('g.gLink path')
  //   .attr('d', function(d_link, i_link){
  //     var sourceId = d_link.source.id;
  //     var targetId = d_link.target.id;
  //     var sourceIndex = Datacenter.authorIdNodeIndexDict[sourceId];
  //     var targetIndex = Datacenter.authorIdNodeIndexDict[targetId];
  //     if(sourceIndex === undefined)
  //     {
  //       d_link.source.x = self.defaultX;
  //       d_link.source.y = self.defaultY;
  //     }
  //     else
  //     {
  //       var sourceNode = self.data.nodes[sourceIndex];
  //       d_link.source.x = sourceNode.x;
  //       d_link.source.y = sourceNode.y;
  //     }
  //     if(targetIndex === undefined)
  //     {
  //       d_link.source.x = self.defaultX;
  //       d_link.source.y = self.defaultY;
  //     }
  //     else
  //     {
  //       var targetNode = self.data.nodes[targetIndex];
  //       d_link.target.x = targetNode.x;
  //       d_link.target.y = targetNode.y;
  //     }
  //     var path = '';
  //     path += 'M ' + d_link.source.x + ' ' + d_link.source.y;
  //     path += ' L ' + d_link.target.x + ' ' + d_link.target.y;
  //     return path;
  //   });
  self.data.links.forEach(function(link, linkIndex){
    self.linkG.select('#gLink' + link.id + ' path')
        .attr('d', function(d_link, i_link){
          d_link.source.x = link.source.x;
          d_link.source.y = link.source.y;
          d_link.target.x = link.target.x;
          d_link.target.y = link.target.y;
          var path = '';
          path += 'M ' + d_link.source.x + ',' + d_link.source.y;
          path += ' L ' + d_link.target.x + ',' + d_link.target.y;
          return path;
        });


  });

  //update text
  d3.selectAll('g.gText')
    .attr('transform', function(d_node, i_node){
      var nodeId = d_node.id;
        var nodeIndex = Datacenter.authorIdNodeIndexDict[nodeId];
        var node = self.data.nodes[nodeIndex];
        d_node.x = node.x;
        d_node.y = node.y;
        return 'translate(' + node.x + ',' + node.y + ')';
    });

  var endTime = new Date().getTime();
  var time = endTime - startTime;
  console.log('update layout~~~~', time);
}

layoutrender.prototype.drawLayout = function(){
  var self = this;
  self.drawLinks();
  self.drawNodes();
  if(Config.pageType !== 'taskOne')
  {
    self.drawTexts();
  }
}

layoutrender.prototype.drawLinks = function(){
  var self = this;
  var linkGArr = self.linkG.selectAll('g.gLink')
                     .data(self.data.links, function(d){
                        return d.id;
                     });
  //update
  var newLinkGArr = linkGArr.enter()
                            .append('g')
                            .attr('id', function(d_link, i_link){
                              return 'gLink' + d_link.id;
                            })
                            .attr('index', function(d_link, i_link){
                              return d_link.index;
                            })
                            .attr('sourceId', function(d_link, i_link){
                              return d_link.sourceId;
                            })
                            .attr('targetId', function(d_link, i_link){
                              return d_link.targetId;
                            })
                            .attr('class', function(d_link, i_link){
                              return 'gLink source' + d_link.sourceId + ' target' + d_link.targetId;
                            });
  newLinkGArr.append('path')
             .attr('id', function(d_link, i_link){
               return 'link' + d_link.id;
             })
             .attr('d', function(d_link, i_link){
                var path = '';
                path += 'M ' + d_link.source.x + ',' + d_link.source.y;
                path += ' L ' + d_link.target.x + ',' + d_link.target.y;
                return path;
             })
             .attr('fill', 'none')
             .attr('stroke', Config.linkColor)
             .attr('stroke-width', function(d_link, i_link){
              var paperNum = d_link.paperNum;
              return Variables.getLinkSize(paperNum);
             });

  //update all path
  self.linkG.selectAll('path')
            .attr('d', function(d_link, i_link){
              var path = '';
              path += 'M ' + d_link.source.x + ',' + d_link.source.y;
              path += ' L ' + d_link.target.x + ',' + d_link.target.y;
              return path;
            })
            .attr('fill', 'none')
           .attr('stroke', Config.linkColor)
           .attr('stroke-width', function(d_link, i_link){
            var paperNum = d_link.paperNum;
            return Variables.getLinkSize(paperNum);
           });

  //remove
  linkGArr.exit().remove();
}

layoutrender.prototype.drawNodes = function(){
  var self = this;
  var nodeGArr = self.nodeG.selectAll('g.gNode')
                     .data(self.data.nodes, function(d_node, i_node){
                      return d_node.id;
                     });

  //update
  var newNodeGArr = nodeGArr.enter()
                            .append('g')
                            .attr('class', 'gNode')
                            .attr('id', function(d_node, i_node){
                              return 'gNode' + d_node.id;
                            })
                            .attr('transform', function(d_node, i_node){
                              return 'translate(' + d_node.x + ',' + d_node.y + ')';
                            });
  //draw circle1
  newNodeGArr.append('circle')
             .attr('class', 'nodeType1 node-type1')
             .attr('cx', 0)
             .attr('cy', 0)
             .attr('r', function(d_node, i_node){
              return d_node.r1;
             })
             .attr('fill', function(){
              return Config.nodeType1Color;
             })
             .attr('stroke', function(d_node, i_node){
                  if(d_node.type === 'leaf')
                  {
                    return Config.leafStrokeColor;
                  }
                  return Variables.getNodeColor(d_node.id);
             })
             .attr('stroke-width', '0px') //set stroke-width to 0, as the size of the stroke would hamper detection
             .attr('cursor', 'pointer');
  //draw circle2
  newNodeGArr.append('circle')
              .attr('class', 'nodeType2 node-type2')
              .attr('cx', 0)
              .attr('cy', 0)
              .attr('r', function(d_node, i_node){
                return d_node.r2;
              })
              .attr('fill', function(){
                return Config.nodeType2Color;
              })
              .attr('stroke', function(){
                  return Config.innerCircleStrokeColor;
              })
              .attr('stroke-width', '0px')
              .attr('cursor', 'pointer');
  //update all node
  var allNodeGArr = self.nodeG.selectAll('g.gNode')
                        .attr('transform', function(d_node, i_node){
                          return 'translate(' + d_node.x + ',' + d_node.y + ')';
                        });
  self.data.nodes.forEach(function(node, nodeIndex){
    var nodeElement = self.nodeG.select('#gNode' + node.id);
    nodeElement.select('circle.nodeType1')
              .attr('r', function(d_node, i_node){
                d_node.r1 = node.r1;
              return d_node.r1;
             })
             .attr('stroke', function(d_node, i_node){
                  if(d_node.type === 'leaf')
                  {
                    return Config.leafStrokeColor;
                  }
                  return Variables.getNodeColor(d_node.id);
             });

    nodeElement.select('circle.nodeType2')
              .attr('r', function(d_node, i_node){
                d_node.r2 = node.r2;
              return d_node.r2;
            })
            .attr('stroke', function(){
                return Config.innerCircleStrokeColor;
            });
  });

  //remove
  nodeGArr.exit().remove();
}

layoutrender.prototype.drawTexts = function(){
  var self = this;
  var textGArr = self.textG.selectAll('g.gText')
                     .data(self.data.nodes, function(d_node, i_node){
                       return d_node.id;
                     });

  //upadte
  var newTextGArr = textGArr.enter()
                            .append('g')
                            .attr('class', 'gText')
                            .attr('transform', function(d_node, i_node){
                              return 'translate(' + d_node.x + ',' + d_node.y + ')';
                            })
                            .attr('id', function(d_node, i_node){
                              return 'gText' + d_node.id;
                            });
  newTextGArr.append('text')
             .attr('x', function(d_node, i_node){
              var r1 = d_node.r1;
              return r1 * 1.2;
            })
            .attr('y', function(){
              return 0;
            })
            .text(function(d_node, i_node){
              var type = d_node.type;
              var name = d_node.name;
                if(type !== 'root')
                {
                  return ;
                }
                if(name === undefined)
                {
                  return ;
                }
                return name;
            })
            .attr('font-size', function(d_node, i_node){
                var  fontSize = d_node.r1 * 1.2;
                if(fontSize < 10)
                {
                  fontSize = 10;
                }
          return fontSize + 'px';
      });
//update all text
  var allTextGArr = self.textG.selectAll('.gText')
                        .attr('transform', function(d_node, i_node){
                              return 'translate(' + d_node.x + ',' + d_node.y + ')';
                         });

  self.data.nodes.forEach(function(node, nodeIndex){
    self.textG.select('#gText' + node.id + ' text')
               .attr('x', function(d_node, i_node){
                  d_node.r1 = node.r1;
                  var r1 = d_node.r1;
                  return r1 * 1.2;
                })
                .text(function(d_node, i_node){
                  d_node.type = node.type;
                  d_node.name = node.name;
                  var type = d_node.type;
                  var name = d_node.name;
                    if(type !== 'root')
                    {
                      return ;
                    }
                    if(name === undefined)
                    {
                      return ;
                    }
                    return name;
                })
                .attr('font-size', function(d_node, i_node){
                    var  fontSize = d_node.r1 * 1.2;
                    if(fontSize < 10)
                    {
                      fontSize = 10;
                    }
                    return fontSize + 'px';
                });
  });
  //remove
  textGArr.exit().remove();
}

layoutrender.prototype.updateNodeAndLinkPosition = function(nodeId, positionObj){
  var self = this;
  //node
  var nodeIndex = Datacenter.authorIdNodeIndexDict[nodeId];
  self.data.nodes[nodeIndex].x = positionObj.x;
  self.data.nodes[nodeIndex].y = positionObj.y;

  //link
  var linkIdArr = Datacenter.coauthorGraph.nodes[nodeIndex].linkIdArr;
  linkIdArr.forEach(function(d_linkId, i_linkId){
    var linkIndex = Datacenter.linkIdLinkIndexDict[d_linkId];
    var link = self.data.links[linkIndex];
    if(link.sourceId === nodeId)
    {
      link.source.x = positionObj.x;
      link.source.y = positionObj.y;
    }
    if(link.targetId === nodeId)
    {
      link.target.x = positionObj.x;
      link.target.y = positionObj.y;
    }
  });
}



layoutrender.prototype.updateNodePositionInLayout = function(nodeId){
  var self = this;
  //update node
  d3.select('#gNode' + nodeId)
    .attr('transform', function(d_node, i_node){
      return 'translate(' + d_node.x + ',' + d_node.y + ')';
    });

  //update text
  d3.select('#gText' + nodeId)
    .attr('transform', function(d_node, i_node){
      return 'translate(' + d_node.x + ',' + d_node.y + ')';
    });

  //update link
  d3.select('.source' + nodeId + ' path')
    .attr('d', function(d_link, i_link){
      var path = '';
      path += 'M ' + d_link.source.x + ' ' + d_link.source.y;
      path += ' L ' + d_link.target.x + ' ' + d_link.target.y;
      return path;
    });
  d3.select('.target' + nodeId + ' path')
    .attr('d', function(d_link, i_link){
      var path = '';
      path += 'M ' + d_link.source.x + ' ' + d_link.source.y;
      path += ' L ' + d_link.target.x + ' ' + d_link.target.y;
      return path;
    });
}

layoutrender.prototype.changeDefaultPosition = function(authorId){
  var self = this;
  if(authorId !== undefined)
  {
    var nodeIndex = Datacenter.authorIdNodeIndexDict[authorId];
    var authorNode = self.data.nodes[nodeIndex];
    var positionX = authorNode.x;
    var positionY = authorNode.y;
    self.defaultX = positionX;
    self.defaultY = positionY;
  }
  else
  {
    self.defaultX = Config.graphViewWidth/2;
    self.defaultY = Config.graphViewHeight/2;
  }
}
layoutrender.prototype.clearAll = function(){
  var self = this;
  self.data = {};
  self.data.nodes = [];
  self.data.links = [];
  self.changeDefaultPosition()
  self.layoutInit();
}

window.LayoutRender = new layoutrender();



