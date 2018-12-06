/* --------------------------------------------------------------------------------- 
 * NC_Tween.js
 *
 * Jason Schleifer / 25 November 2018
 * Latest Revision: 25 November 2018, 10:04 AM
 * License: GPL v3
 * 
 * Description:
 * -----------
 * Create a simple UI to make it easy to blend the currently selected peg(s) between the previous and next key frame 
 * 
 * 
 * Version:
 * --------
 * 0.2 -    UI works for making it < Favor Previous |  Halfway  |  Favor Next >
 * 
 * 0.1 -    Very much still in progress. Currently it will allow you to blend 10, 50, or 90% between
 *          two keys.
 * 
 * Usage:
 * ------
 * NC_TweenUI
 * 
 * Installation:
 * -------------
 * https://docs.toonboom.com/help/harmony-16/premium/scripting/import-script.html
 * 
 * 
 */

//var TweenEnv = "NC_TweenPercent";


/**
 * NC_Tween ()
 * 
 * @return {void}
 */
function NC_Tween() {


    /**
     * function tween  
     *       
     * @param  {float} a | Start value
     * @param  {float} b | End Value
     * @param  {float} p | Percentage between (in integer - eg: 25, 50, 100)
     * @return  {float} newValue | The resulting value between start and end
     */
    this.tween = function(a, b, p) {

        var newValue = 0.0;
        a = parseFloat(a);
        b = parseFloat(b);
        p = parseFloat(p);
        if (b > a) {
            var dist = b - a;
            var percent = dist * p / 100;
            newValue = (1 * a) + (1 * percent); // this forces javascript to add these as numbers
        } else {
            var dist = a - b;
            var percent = dist * (100 - p) / 100; // for some reason I need to do 100-p if b < a)
            newValue = (1 * b) + (1 * percent); // this forces javascript to add these as numbers

        }
        return newValue;
    }


    /**
     * function getLinkedCols
     * 
     * Returns the linked columns from the selected pegs or drawings.
     * 
     * @return {array} selCols | Selected columns.
     */

    this.getLinkedCols = function() {

        // get selected nodes
        var sel = selection.selectedNodes();

        // get the current frame. This is needed in order to pull the existing columsn
        var curFrame = frame.current();

        // create an array for selected columns
        var selCols = new Array(0);

        // for each selected item
        for (i = 0; i < sel.length; i++) {

            // get a handy variable for the selected item
            var n = sel[i];

            // figure out what type it is
            var type = node.type(n);

            // if it's not a peg, then get the parent node
            if (type != "PEG") {
                var parent = node.srcNode(n, 0);
                n = parent;
            }

            // add the peg to the selected node
            if (node.type(n) == "PEG") {

                // get an array for attributes
                var attrs = new Array(0);

                // get a list of all attributes on the peg	
                attrs = node.getAttrList(n, curFrame, "");

                // for each attribute, let's see if there are any sub attributes.
                // then for each attr and sub att, we'll check and see if they're linked to a 
                // column.  If they are, then we'll store those columns.
                for (z = 0; z < attrs.length; z++) {

                    // see if there's a linked column
                    var c = node.linkedColumn(n, attrs[z].keyword());

                    // if there's no display name, I can assume there's no column
                    if (column.getDisplayName(c) != "") {
                        selCols.push(c);
                    }

                    // now do the same for all subAttrs
                    // get a list of all sub attrs for this attr
                    subAttrs = node.getAttrList(n, curFrame, attrs[z].keyword());
                    for (s = 0; s < subAttrs.length; s++) {

                        sa = (attrs[z].keyword() + "." + subAttrs[s].keyword());

                        // see if there's a linked column
                        var c = node.linkedColumn(n, sa);

                        // if there's no display name, I can assume there's no column.
                        if (column.getDisplayName(c) != "") {

                            selCols.push(c);
                        }
                    }
                }
            }
        }

        // now we have all the selected columns
        return selCols;

    }

    this.getAllKeyInfo = function() {

        }
        /**
         * function NC_SetTween
         * 
         * Figures out how to tween for the selected columns based on the percentage given.
         * At the moment, we're using:
         *    25: Tween to the previous keyframe's value
         *    50: Tween halfway
         *    75: Tween to the next keyframe's value
         * 
         * @param  {any} p | percentage to tween
         * @return {void}
         */
    this.NC_SetTween = function(p) {

        // get the selected columns
        var selCols = new Array(0);
        selCols = this.getLinkedCols();

        // create an array to store the column info
        var columnInfo = new Array(0);

        // get the current frame
        var curFrame = frame.current();

        // for each column, go and get info on previous, current and next keys.
        for (i = 0; i < selCols.length; i++) {
            c = selCols[i];

            // how many keys exist in the column?
            var numKeys = func.numberOfPoints(c);

            // now we want to find the previous and next frames for each column
            prevFrame = curFrame;
            nextFrame = curFrame;
            prevIndex = 0;
            nextIndex = 0;
            foundNext = 0; // checking to see if we found the next key

            // for each key - iterate through until we have the previous and next frames
            for (x = 0; x < numKeys; x++) {
                framePoint = func.pointX(c, x);
                if (foundNext == 0) {
                    if (framePoint < curFrame) {
                        prevFrame = framePoint;
                        prevIndex = x;
                    }
                    if (framePoint > curFrame) {
                        nextFrame = framePoint;
                        nextIndex = x;
                        foundNext = 1;

                    }
                }
            }

            // get the current, previus and next values
            currentValue = column.getEntry(c, 1, curFrame);
            prevValue = column.getEntry(c, 1, prevFrame);
            nextValue = column.getEntry(c, 1, nextFrame);

            // now get the function info so we know what type of curve to create
            pointHandleLeftX = func.pointHandleRightX(c, prevIndex);
            pointHandleLeftY = func.pointHandleRightY(c, prevIndex);
            pointHandleRightX = func.pointHandleLeftX(c, nextIndex);
            pointHandleRightY = func.pointHandleLeftY(c, nextIndex);
            constSeg = func.pointConstSeg(c, prevIndex);
            continuity = func.pointContinuity(c, prevIndex);

            // slurp all this stuff into an array
            columnInfo[i] = {
                col: c,
                colName: column.getDisplayName(c),
                val: currentValue,
                prevValue: prevValue,
                prevIndex: prevIndex,
                nextValue: nextValue,
                prevFrame: prevFrame,
                nextFrame: nextFrame,
                nextIndex: nextIndex,
                pointHandleLeftX: pointHandleLeftX,
                pointHandleLeftY: pointHandleLeftY,
                pointHandleRightX: pointHandleRightX,
                pointHandleRightY: pointHandleRightY,
                constSeg: constSeg,
                continuity: continuity
            };

        }


        // Now the magic happens! Start the tweening!
        scene.beginUndoRedoAccum("NC_Tween");

        for (i = 0; i < columnInfo.length; i++) {
            c = columnInfo[i];

            // only continue if the previous value and the next value aren't the same. Otherwise we're wasting time!
            if (c.prevValue != c.nextValue) {
                // if we're favoring the next key..
                if (p == 75) {
                    columnInfo[i].prevValue = columnInfo[i].val;
                    // now set p to 50 so we'll be between the current value and the next
                    p = 50;
                }
                // if we're favoring the previous key
                if (p == 25) {
                    columnInfo[i].nextValue = columnInfo[i].val;
                    // now set p to 50
                    p = 50;
                }


                // get the next value that we tween to
                nv = this.tween(c.prevValue, c.nextValue, p);

                // Create a key
                result = column.setKeyFrame(c.col, curFrame);

                // Now adjust the key based on the previous key's settings.
                func.setBezierPoint(c.col, curFrame, nv, c.pointHandleLeftX, c.pointHandleLeftY, c.pointHandleRightX, c.pointHandleRightY, c.constSeg, c.continuity);

            }
        }
        scene.endUndoRedoAccum();
    }
    this.antic = function() {
        this.NC_SetTween(-15);
    }
    this.tweenPrevious = function() {
        this.NC_SetTween(25);
    }
    this.tweenMid = function() {
        this.NC_SetTween(50);
    }
    this.tweenNext = function() {
        this.NC_SetTween(75);
    }
    this.overshoot = function() {
        this.NC_SetTween(115);
    }


    // UI
    // =========================================

    this.createWidget = function() {
        var own = new QDialog();
        var gridLayout = new QGridLayout(own);
        gridLayout.objectName = "gridLayout";
        return own;
    }


    // build the widget
    var myUi = this.createWidget();

    var AnticButton = new QPushButton();
    AnticButton.text = "Antic";

    var FavorAButton = new QPushButton();
    FavorAButton.text = "Favor Prev Frame";

    var MidButton = new QPushButton();
    MidButton.text = "Halfway";

    var FavorBButton = new QPushButton();
    FavorBButton.text = "Favor Next Frame";

    var OvershootButton = new QPushButton();
    OvershootButton.text = "Overshoot";

    // Layout
    myUi.gridLayout.addWidget(AnticButton, 0, 0);
    myUi.gridLayout.addWidget(FavorAButton, 0, 1);
    myUi.gridLayout.addWidget(MidButton, 0, 2);
    myUi.gridLayout.addWidget(FavorBButton, 0, 3);
    myUi.gridLayout.addWidget(OvershootButton, 0, 4);


    // Show the dialog in non-modal fashion.
    myUi.show();

    // Connect the buttons
    AnticButton.clicked.connect(this, this.antic);
    FavorAButton.clicked.connect(this, this.tweenPrevious);
    MidButton.clicked.connect(this, this.tweenMid);
    FavorBButton.clicked.connect(this, this.tweenNext);
    OvershootButton.clicked.connect(this, this.overshoot);

}