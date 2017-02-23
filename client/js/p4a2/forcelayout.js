var force_layout = {
	init: function () {
		var self = this;
		//console.log(testData)
		//draw
		// communicator
		self.addCommunicator();

		self.setInitReadyData();
		self.forceLayout();
	},
	// communicator
	addCommunicator: function () {
		var self = this;
		self.identity = 'tdw';
		self.wsHost = '192.168.10.20'; //if you want to change it, then you should change them in the hub-ws.js
		self.wsPort = 15001;
		self.wsPath = '/ws';
        console.log("******start websocket******");
		self.ws = start_websocket(self.identity, self.wsHost, self.wsPort, self.wsPath, onmessage_callback = function(msg) {
			console.log('msg~~~~', msg);
			//console.log('msg~~~~~', msg.data);
			window.state = recv_state_update(msg.data);
			if (typeof state.data !== "string") {
				state.data = String.fromCharCode.apply(null, new Uint8Array(state.data));
			}

			state.data = JSON.parse(state.data);
			state.data.sender = state.sender;
			state.data.name = state.name;

			if (state.data.target === "tdw" || state.data.target === "" || state.data.target === undefined) {
				if (state.sender === self.identity) return;
				self.dataFromPhone = {};
				self.dataFromPhone.sender = state.data.sender;
				self.dataFromPhone.name = state.data.name;
				self.dataFromPhone.data = state.data.payload;
                
				switch (state.name) {
					case 'Hello':
						self.greetingHandler(state.data);
						break;
					case 'SelectTask':
						self.selectTaskHandler(state.data);
						break;
					case 'GetGraphLayout':
						self.getGraphLayoutHandler(state.data);
						break;
					case 'NodeArrAnimation':
						self.nodeArrAnimationHandler(state.data);
						break;
				}
			}
		});
	},
	sendMessage: function(msg, data) {
		var self = this;
		send_state_update(self.ws, self.identity, msg, data);
	},
	// state handlers
	greetingHandler: function(data) {
		var self = this;
		//alert('hello, ' + data.payload + ' from dblp search');
		var msgData = {};
		msgData.target = data.sender;
		msgData.ts = Date.parse(new Date());
		msgData.payload = "Jone";
		msgData = JSON.stringify(msgData);
		self.sendMessage('Bye', msgData);
	},
	getGraphLayoutHandler: function(data) {
		var self = this;
		dataPayload = data.payload;
		var result = self.calGraphLayoutResult(self.coauthorGraph)
		var msgData = {};
		msgData.target = data.sender;
		msgData.ts = Date.parse(new Date());
		msgData.payload = result;
		msgData = JSON.stringify(msgData);
		self.sendMessage('GraphLayout', msgData);
	},
	calGraphLayoutResult:function(data) {
		console.log("***************")
		//console.log(data.nodes)
		console.log("***************", data)
		var resultData = {};
  		resultData.nodes = [];
  		resultData.links = {};
  		data.nodes.forEach(function(d_node, i_node){
    		var obj = [];
    		var x = Math.floor(d_node.x);
    		var y = Math.floor(d_node.y);
    		//console.log(d_node.id+ " x "+ d_node.x + " y " + d_node.y );
    		var r = 5;
    		var id = d_node.nameid;
    		var name = d_node.name;
    		obj.push(x);
    		obj.push(y);
    		obj.push(r);
    		obj.push(id);
    		obj.push(name);
    		resultData.nodes.push(obj);
  		});

  		data.links.forEach(function(d_link, i_link){
   			var sourceNameId= d_link.source.nameid;
    		var targetNameId = d_link.target.nameid;
    		if(resultData.links[sourceNameId] === undefined)
    		{
      			resultData.links[sourceNameId] = [];
   			}
    		resultData.links[sourceNameId].push(targetNameId);
  		});
  		console.log(resultData)
  		return resultData;
	},
	selectTaskHandler:function(data){
		var self = this;
		var wholeData = data;
		var dataPayload = data.payload;
		var task = dataPayload.task;
		var transitionTime = 2000;
		switch(task){
			case 'taskOne':
				console.log('Start taskOne');

				setTimeout(function() {
					self.setInitReadyData();
				}, transitionTime);
				break;
		}
	},
	nodeArrAnimationHandler: function(data) {
		var self = this;
		d3.selectAll('circle').style("fill","steelblue");
		var wholeData = data;
		data = data.payload;
		console.log("receive photo");
		console.log(data);
		for(var i in data){
			console.log('circle id', data[i] )
			d3.select("#node" + data[i]).style("fill", "red")
		}
		// my function -- change color red
	},
	// data = data.data;
	// 	var wholeData = data;
	// 	data = data.payload;
	// 	console.log("***************start ChangeColor****************")
	// 	for(var i in data){
	// 		d3.select("#" + data[i]).attr("fill","red")
	// 	}
	// draw graph

	setInitReadyData:function () {
		var self = this;
	    self.coauthorGraph = readyData.coauthorGraph;
	},
	forceLayout: function () {
		var self = this
		var width = $('#graph').width()
		var height = $('#graph').height()
		var svg = d3.select('#graph').append('svg')
						     .attr('width', width)
						     .attr('height', height)
		self.width = width
		self.height = height
        var linkWidth = 1
        var nodeSize = 5
		var simulation = d3.forceSimulation()
		    .force("link", d3.forceLink().id(function(d) { return d.id; }).distance(2))
		    .force("charge", d3.forceManyBody(-40))
		    .force("center", d3.forceCenter(width / 2, height / 2))
		    .force('X', d3.forceX().x(0).strength(0.02))
		    .force('Y', d3.forceY().y(0).strength(0.2))

        // nodes79links292
        // nodes
		d3.json("data/nodes5238links17953.json", function(error, graph) {

		  if (error) throw error;
          self.coauthorGraph = graph.coauthorGraph
          var nodesData = graph.coauthorGraph.nodes

          for(var i in nodesData){
          		var tmpId = nodesData[i].id
          		nodesData[i].id = nodesData[i].index
          		nodesData[i]['nameid'] = tmpId
          }

          graph.coauthorGraph.nodes = nodesData
          self.coauthorGraph = graph.coauthorGraph
          var linksData = graph.coauthorGraph.links
		  var link = svg.append("g")
		      			.attr("class", "links")
		    			.selectAll("line")
		   				.data(linksData)
		  				.enter().append("line")
		      			.attr("stroke-width", function(d) { return linkWidth; })
		      			.attr("stroke", "#999")
		      			.attr("stroke-opacity", 0.6)

		  var node = svg.append("g")
		      			.attr("class", "nodes")
		    			.selectAll("circle")
		    			.data(nodesData)
		   				.enter().append("circle")
		  				// .forEach(function(d){
		  				// 	var tmpId = nodesData[i]
		  				// })
		      		    .attr("r", function (d) {
		      		    	// body...
		      		    	return Math.pow(d.paperNum, 0.3)
		      		    })
		      		    .attr("id", function(d){
		      		    	return 'node'+d.nameid
		      		    })
		      			.attr("fill", function(d) { return 'rgb(55,184,222)'; })
		      			.call(d3.drag()
		         		.on("start", dragstarted)
		          		.on("drag", dragged)
		          		.on("end", dragended));

		  node.append("title")
		      .text(function(d) { return d.name + ' ' + 'PaperNum ' +d.paperNum; });

		  simulation
		      .nodes(graph.coauthorGraph.nodes)
		      .on("tick", ticked)
		      


		  simulation.force("link")
		      .links(graph.coauthorGraph.links)

          var padding = 50
		  function ticked() {

		  	var minH = 10000000
		  	var maxH = -1
		  	var minW = 10000000
		  	var maxW = -1
		    link
		        .attr("x1", function(d) { return d.source.x; })
		        .attr("y1", function(d) { return d.source.y; })
		        .attr("x2", function(d) { return d.target.x; })
		        .attr("y2", function(d) { return d.target.y; });

		    node
		        .attr("cx", function(d) { minW = Math.min(minW, d.x); maxW = Math.max(maxW, d.x); return d.x; })
		        .attr("cy", function(d) { minH = Math.min(minH, d.y); maxH = Math.max(maxH, d.y); return d.y; })

	       if(simulation.alpha()<0.4) {
	       	    //console.log(minW, maxW, minH, maxH)
	       	    if(minW<padding || maxW > self.width-padding){
	       	    	//console.log(minW, minH, maxH, maxW)
	       	    	node.attr('cx', function(d){
	       	    			d.x = (d.x - minW)/(maxW - minW)*(self.width - padding*2) + padding
	       	    			//console.log(d.x)
	       	    			return d.x
	       	    		})
	       	    		
	       	    	link
		        	.attr("x1", function(d) { return d.source.x; })
		       		.attr("y1", function(d) { return d.source.y; })
		        	.attr("x2", function(d) { return d.target.x; })
		        	.attr("y2", function(d) { return d.target.y; });
		        	$("#load").css('display','none'); 
		        	$("#graph").css('display','block'); 
	       	    	simulation.restart()
	       	    }
	       	    if(minH<padding || maxH > self.height-padding){
	       	    	//console.log(minW, minH, maxH, maxW)
	       	    	node
	       	    		.attr('cy', function(d){
	       	    	    	d.y = (d.y - minH)/(maxH - minH)*(self.height - padding*2) + padding
	       	    	    	return d.y
	       	    	    })
	       	    	link
		        	.attr("x1", function(d) { return d.source.x; })
		       		.attr("y1", function(d) { return d.source.y; })
		        	.attr("x2", function(d) { return d.target.x; })
		        	.attr("y2", function(d) { return d.target.y; });
		        	$("#load").css('display','none'); 
		        	$("#graph").css('display','block'); 
	       	    	simulation.restart()

	       	    }
	       }
	       if(simulation.alpha() < 0.1){
	       		$("#load").css('display','none'); 
		        $("#graph").css('display','block'); 
		        simulation.stop()
	       }
	  	 }

		});
      
		function dragstarted(d) {
		  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
		  		d.fx = d.x;
		  		d.fy = d.y;
		}

		function dragged(d) {
		  		d.fx = d3.event.x;
		  		d.fy = d3.event.y;
		}

		function dragended(d) {
		  if (!d3.event.active) simulation.alphaTarget(0);
		  		d.fx = null;
		  		d.fy = null;
		}

	}
}


//function for websocket to communicate with phone
function send_state_update(ws, identity, name, data) {
	buf = msgpack.encode([identity, name, data]);
	ws.send(buf);
}

function recv_state_update(buf) {
	state = msgpack.decode(new Uint8Array(buf));
	info = {
		"sender": state[0],
		"name": state[1],
		"data": state[2]
	};
	return info;
}

function start_websocket(identity, ws_host, ws_port, ws_path, onmessage_callback, onopen_callback, onclose_callback) {
	ws = new WebSocket("ws://" + ws_host + ":" + ws_port + ws_path);
	ws.identity = identity;
	ws.binaryType = "arraybuffer";
	if (onmessage_callback !== null) ws.onmessage = onmessage_callback;
	if (onopen_callback !== null) ws.onopen = onopen_callback;
	if (onclose_callback !== null) ws.onclose = onclose_callback;
	return ws;
}

