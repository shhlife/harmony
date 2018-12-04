/*
 Copyright 2016 ToonBoom Animation Inc.
 
 A little script that shows a UI with all the modules of type OGLBYPASS and allow user to
 disabled or enabled them. (wow).
 
 */

function OpenGLBypassSelectorDialog(ui) {
    this.ui = ui;
    this.show = ui.show;
    this.nodesWidget = ui.nodes;

    function showValue(percentage) {
        MessageLog.trace(percentage);
    }

    this.doZeroAction = function() { showValue(0); }
    this.doTenAction = function() { showValue(10); }
    this.doTwentyAction = function() { showValue(20); }
    this.doThirtyAction = function() { showValue(30); }
    this.doFortyAction = function() { showValue(40); }
    this.doFiftyAction = function() { showValue(50); }
    this.doSixtyAction = function() { showValue(60); }
    this.doSeventyAction = function() { showValue(70); }
    this.doEightyAction = function() { showValue(80); }
    this.doNinetyAction = function() { showValue(90); }
    this.doOneHundredAction = function() { showValue(100); }


    this.ui.zeroButton.clicked.connect(this, this.doZeroAction);
    this.ui.tenButton.clicked.connect(this, this.doTenAction);
    this.ui.twentyButton.clicked.connect(this, this.doTwentyAction);
    this.ui.thirtyButton.clicked.connect(this, this.doThirtyAction);
    this.ui.fortyButton.clicked.connect(this, this.doFortyAction);
    this.ui.fiftyButton.clicked.connect(this, this.doFiftyAction);
    this.ui.sixtyButton.clicked.connect(this, this.doSixtyAction);
    this.ui.seventyButton.clicked.connect(this, this.doSeventyAction);
    this.ui.eightyButton.clicked.connect(this, this.doEightyAction);
    this.ui.ninetyButton.clicked.connect(this, this.doNinetyAction);
    this.ui.oneHundredButton.clicked.connect(this, this.doOneHundredAction);





}



function TB_OpenGLBypassSelector() {
    var scriptFolder = specialFolders.userScripts + "/";
    var uiPath = scriptFolder + "/NC_TestUI.ui"
    var kui = UiLoader.load(uiPath, scriptFolder);
    var ui = new OpenGLBypassSelectorDialog(kui);

    ui.show();
}