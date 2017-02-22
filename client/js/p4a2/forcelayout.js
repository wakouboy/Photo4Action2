var force_layout = {
	init: function () {
		var self = this;
		console.log(testData)
		//draw
		// communicator
		self.addCommunicator();
		//self.render()
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
			console.log('msg~~~~~', msg.data);
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
		console.log(data.nodes)
		console.log("***************")
		var resultData = {};
  		resultData.nodes = [];
  		resultData.links = {};
  		data.nodes.forEach(function(d_node, i_node){
    		var obj = [];
    		var x = Math.floor(d_node.x);
    		var y = Math.floor(d_node.y);
    		//console.log(d_node.id+ " x "+ d_node.x + " y " + d_node.y );
    		var r = 5;
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
	render: function() {
		var self = this;
		var width = 800;
		var height = 600;
		var svg = d3.select("#graph")
					.append("svg")
					.attr("width", width)
					.attr("height", height);
		
		var force = d3.layout.force()
				.nodes(testData.testGraph.nodes)		
				.links(testData.testGraph.links)		
				.size([width, height])	
				.linkDistance(100)	
				.charge(-400);	

		force.start();	

		var svg_edges = svg.selectAll("line")
							.data(testData.testGraph.links)
							.enter()
							.append("line")
							.style("stroke", "#ccc")
							.style("stroke-width", 1);			
		var svg_nodes = svg.selectAll("circle")
							.data(testData.testGraph.nodes)
							.enter()
							.append("circle")
							.attr("r", 10)
							.attr("id", function (d) {
								return 'node'+d.id;
							})
							.style("fill", "steelblue")	
							.call(force.drag)
		force.on("tick", function(){
			svg_edges.attr("x1", function (d) { return d.source.x; })
			 		.attr("y1", function (d) { return d.source.y; })
			 		.attr("x2", function (d) { return d.target.x; })
			 		.attr("y2", function (d) { return d.target.y; });
			 
			svg_nodes.attr("cx", function (d) { return d.x; })
			 		.attr("cy", function (d) { return d.y; });
			// if(force.alpha() < 0.03)
			// {
			//  	console.log("***********")
			//  	self.calGraphLayoutResult(testData.testGraph)
			// 	var msgData = {};
			// 	msgData.target = 11;
			// 	msgData.ts = Date.parse(new Date());
			// 	msgData.payload = result;
			// 	msgData = JSON.stringify(msgData);
			// 	console.log("***********", msgData);
			// 	force.stop();
			// }
		});

	},
	setInitReadyData:function () {
		var self = this;
	    self.coauthorGraph = readyData.coauthorGraph;
	},
	forceLayout: function () {
		var self = this;
		self.svgWidth = 1000;
		self.svgHeight = 600;
		var svg = d3.select("#graph")
					.append("svg")
					.attr("width", self.svgWidth)
					.attr("height", self.svgHeight);
		
		var force = d3.layout.force()
				.nodes(self.coauthorGraph.nodes)		
				.links(self.coauthorGraph.links)		
				.size([self.svgWidth, self.svgHeight])	
				.linkDistance(50)	
				.charge(-100);	

		force.start();	


		var svg_edges = svg.selectAll("line")
							.data(self.coauthorGraph.links)
							.enter()
							.append("line")
							.style("stroke", "#ccc")
							.style("stroke-width", 1);			
		var svg_nodes = svg.selectAll("circle")
							.data(self.coauthorGraph.nodes)
							.enter()
							.append("circle")
							.attr("r", 5)
							.attr("id", function (d) {
								return "node" + d.id;
							})
							.style("fill", "steelblue")
		force.on("tick", function(){
			svg_edges.attr("x1", function (d) { return d.source.x; })
			 		.attr("y1", function (d) { return d.source.y; })
			 		.attr("x2", function (d) { return d.target.x; })
			 		.attr("y2", function (d) { return d.target.y; });
			 
			svg_nodes.attr("cx", function (d) { return d.x; })
			 		.attr("cy", function (d) { return d.y; });
		    if(force.alpha() < 0.03)
			{
			 	console.log("*************nodes", self.coauthorGraph.nodes)
			 	console.log("*************links", self.coauthorGraph.links)
			 	console.log("***********")
			 	var result = self.calGraphLayoutResult(self.coauthorGraph)
				var msgData = {};
				msgData.target = 11;
				msgData.ts = Date.parse(new Date());
				msgData.payload = result;
				msgData = JSON.stringify(msgData);
				console.log("***********", msgData);
				force.stop();
			}
		});

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

