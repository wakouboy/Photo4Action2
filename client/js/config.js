window.Config = {
      'graphViewId':'app',

      'authorNameMsg': 'authorName',
      'authorNameArrMsg':'authorNameArr',

      'authorIdMsg':'authorId',
      'deleteCoauthorIdMsg': 'deleteCoauthorId',

      'postDataMsg':'postDataMsg',
      'imgUploadMsg':'imgUploadMsg',

      'paperMsgByAuthorIdWithAuthor':'paperMsgByAuthorIdWithAuthor',
      'paperMsgByAuthorNameWithAuthor':'paperMsgByAuthorNameWithAuthor',

      'paperDetailMsg':'paperDetailMsg',

      'paperDetailMsgByAuthorNames':'paperDetailMsgByAuthorNames',
      //save event data
      'saveTaskEventMsg':'saveTaskEventMsg',

      //init search
      initSearchName: 'Xiaoru Yuan',

      'topNum':9,

      //force-directed
      'alphaTick': 0.02,

      //lasso event
      'lassoStrokeColor': 'red',

      //graph view
      'graphViewWidth':800,
      'graphViewHeight': 800,

      'oldGraphViewWidth': 800,
      'oldGraphViewHeight':800,

      'preGraphViewWidth':800,
      'preGraphViewHeight':800,

      'forceLayoutWidth':800,
      'forceLayoutHeight':800,

      'nodeDefaultX':-1,
      'nodeDefaultY':-1,

      //transition time
      'transitionTime':100,
      'nodePositionTransitionTime':100,
      'matrixPositionTransitionTime':100,
      matrixOrderTransitionTime:100,

      nodeType1Color :'#2060d5', // #045a8d
      nodeType2Color : '#2060d5',
      rootStrokeColor :'rgb(151,68,16)',
      tempStrokeColor : 'rgb(255, 136, 0)',
      leafStrokeColor : '#ccc',
      innerCircleStrokeColor: '#ccc',

      linkColor:'#AEAEAE',

      //loading page
      loadingId: 'loading',

      //time line view
      timelineHeight: 100,
      timelineWidth:0.96,
      gridStroke: '#ccc',
      legendWidh:30,
      legendHeight:20,
      legendRect:7,

      //matrix
      rectSize:12,
      rectStroke: '#ccc',
      rectFill:'rgb(55, 184, 222)',
      emptyRectFill: 'rgb(234, 234, 234)',
      selectedStroke:'red',  //rgb(255, 48, 0)

      //curve
      lineLength:3,

      //matrix label
      labelColor: '#ccc',
      labelStroke: 'rgb(239, 239, 239)',
      labelRatio:0.8,

      //sage2
      graphViewOffset:{'x':0, 'y': 27},

      //save data for ready
      zoomValForReady:1,
      axesPositionForReady:[0, 0],

      //node panel
      panelLeft:0,
      panelTop:0,
      panelWidth:300,
      panelMaxHeight:480,
      panelHeadFontSize:24,
      panelFontSize:18,
      panelMargin:20,
      numInPanel:8,
      panelDefaultX:70,
      panelDefaultY:30,
      //flag used to communicate with phone
      sendGraphFlag:false,
      sendPaperMsgFlag:false,
      sendPathFlag:false,
      sendPathPaperMsgFlag:false,

      //home-page
      pageType:'homePage',  //freeExploration, taskOne, taskTwo, taskThree, -1
      selectPageType:-1,
      homePageTransitionTime:2000,

      taskingFlag:true,
      inTaskColor:'green',
      notInTaskColor:'black',
      taskNum:1, //2, 3
      oldTaskNum:0,
      taskTotalNum:3,
      testTime:1,
      oldTestTime:0,
      totalTestTime:5,
      testingNodeIdArr:[],
      testNodeIndex:0,
      testNodeIdArr:[[[1057338,998762,140936,170192,698872], [518964,990252,468403,8255,485835], [86897,168116,627292,349079,1105792], [807425,448095,663295,441602,390602], [1045572,677268,451462,450815,1047477]], [[965312,448095,870588,446984,97583],[244229,451466,326060,246300,958654],[1103619,515763,709770,104376,331605],[446984,27032,515763,403456,983831],[26738,468403,349079,27032,627301]],[[677268,496392,698872,548675,888893],[277474,698872,548675,170192,984477],[403456,958654,168116,807425,965312],[448095,468403,326060,1103619,441602],[140936,468403,888893,496392,622321]]],

      usingReadyDataFlag:false,
      dealNodeSize:4,

      homePageFontSize:40,
      homePageWidth:200,

      //highlight node for task1
      taskOneNode1:548675,

      //path node id for task 2
      // initPathNode1:813463,
      // initPathNode2:239697,
      // pathNode1:1032017,
      // pathNode2:1036855,

      // initPathNode1:450815,
      // initPathNode2:548675,
      // pathNode1:1045572,
      // pathNode2:446883,

      initPathNode1:965312,
      initPathNode2:139734,
      pathNode1:1045572,
      pathNode2:99080,
      // path:[965312, ]

      //node id for task 3s
      // taskThreeNode1:1036855,
      // taskThreeNode2:1032017,
      taskThreeNode1:538265,
      taskThreeNode2:548675,

      //save event data
      eventMsg:{'eventMsg':[{'event':'click'}]},

      //prompt box
      isPromptBoxShowing:false,
      promptBoxLeftRadio:0.425,
      promptBoxTopRadio:0.01,
};
