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
		console.log("***************")
		var resultData = {};
  		resultData.nodes = [];
  		resultData.links = {};
  		data.nodes.forEach(function(d_node, i_node){
    		var obj = [];
    		var x = Math.floor(d_node.x);
    		var y = Math.floor(d_node.y);
    		//console.log(d_node.id+ " x "+ d_node.x + " y " + d_node.y );
    		var r = Math.pow(d_node.paperNum, 0.3)
    		var id = d_node.id;
    		var name = d_node.name;
    		obj.push(x);
    		obj.push(y);
    		obj.push(r);
    		obj.push(id);
    		obj.push(name);
    		resultData.nodes.push(obj);
  		});

  		data.links.forEach(function(d_link, i_link){
   			var sourceId = d_link.source.id;
    		var targetId = d_link.target.id;
    		if(resultData.links[sourceId] === undefined)
    		{
      			resultData.links[sourceId] = [];
   			}
    		resultData.links[sourceId].push(targetId);
  		});
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
		var borderArray = {};
		borderArray.cx=[]
		borderArray.cy=[]
		for(var i in data){
			console.log('circle id', data[i] )
			var selectionNode = d3.select("#node" + data[i])
			borderArray.cx.push(selectionNode.attr("cx"))
			borderArray.cy.push(selectionNode.attr("cy"))
			selectionNode.style("fill", "red")
		}
		var selectionBorder={}
		selectionBorder.left = d3.min(borderArray.cx)
		selectionBorder.right = d3.max(borderArray.cx)
		selectionBorder.top = d3.min(borderArray.cy)
		selectionBorder.bottom = d3.max(borderArray.cy)
		d3.select("svg").append("rect")
			.attr("x",selectionBorder.left-100)
			.attr("y",selectionBorder.top-100)
			.attr("width",selectionBorder.right - selectionBorder.left+200)
			.attr("height",selectionBorder.bottom - selectionBorder.top+200)
			.attr("fill","red")
			.attr("opacity",0.1)
		// my function -- change color red
	},
	setInitReadyData:function () {
		var self = this;
	    self.coauthorGraph = readyData.coauthorGraph;
	},
	forceLayout: function () {
		var width = $('#graph').width()
		var height = $('#graph').height()
		var svg = d3.select('#graph').append('svg')
						     .attr('width', width)
						     .attr('height', height)

        var linkWidth = 1
        var nodeSize = 5
		var simulation = d3.forceSimulation()
		    .force("link", d3.forceLink().id(function(d) { return d.id; }).distance(20))
		    .force("charge", d3.forceManyBody())
		    .force("center", d3.forceCenter(width / 2, height / 2))
		    .force('X', d3.forceX().x(0).strength(0.02))
		    .force('Y', d3.forceY().y(0).strength(0.2))


		d3.json("data/nodes3908links12161.json", function(error, graph) {

		  if (error) throw error;
          
          var nodesData = graph.coauthorGraph.nodes
          for(var i in nodesData){
          		var tmpId = nodesData[i].id
          		nodesData[i].id = nodesData[i].index
          		nodesData[i].pid = tmpId
          }
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
		      		    .attr("r", function (d) {
		      		    	// body...
		      		    	return Math.pow(d.paperNum, 0.3)
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



		  function ticked() {
		    link
		        .attr("x1", function(d) { return d.source.x; })
		        .attr("y1", function(d) { return d.source.y; })
		        .attr("x2", function(d) { return d.target.x; })
		        .attr("y2", function(d) { return d.target.y; });

		    node
		        .attr("cx", function(d) { return d.x; })
		        .attr("cy", function(d) { return d.y; });
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

