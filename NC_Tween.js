/* --------------------------------------------------------------------------------- 
 * NC_Tween.js
 *
 * Jason Schleifer / 25 November 2018
 * Latest Revision: 25 November 2018, 10:04 AM
 * License: GPL v3
 * 
 * Description:
 * -----------
 * Create a simple UI to make it easy to blend the currently selected peg(s) between the previous and next key frame by a certain percentage.
 * 
 * Ex:
 *  uparm-P_Rot-x is a value of -15 at frame 1, and 30 at frame 15.
 *  the user is at frame 7, and wants Rot-x to be 5% of the difference between the two (basically a big ease out).
 *  They click the 5% button, and a key is generated at at the current frame with Rot-x set to :
 *         abs((ValueA - ValueB) * Percent) + ValueA
 *         abs((-15 - 30) * .05) + -15
 *         abs((-45)) * .05) + -15
 *         abs(-2.25) + -15
 *         -12.75
 * 
 * Version:
 * --------
 * 0.1 -    Very much still in progress. Currently it will allow you to blend 10, 50, or 90% between
 *          two keys.
 * 
 * Usage:
 * ------
 * DON'T USE YET - STILL IN PROGRESS
 * 
 * Installation:
 * -------------
 * https://docs.toonboom.com/help/harmony-16/premium/scripting/import-script.html
 * 
 * 
 */

var TweenEnv = "NC_TweenPercent";


/**
 * tween
 * 
 * @param  {double} a | start value
 * @param  {double} b | end value
 * @param  {double} p | percent between
 * @return {double} newValue | the value between start and end based on the percentage
 */





// Create something like tween machine.


function tween(a, b, p) {
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
    return (newValue);
}

function getLinkedCols() {

    // get selected nodes
    var sel = selection.selectedNodes();

    // create an array for selected nodes
    var selPegs = new Array(0);
    var selCols = new Array(0);

    // for each selected item
    for (i = 0; i < sel.length; i++) {

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

            selPegs.push(n);
            var attrs = new Array(0);

            // get a list of all attributes on the peg	

            attrs = node.getAttrList(n, frame.current(), "");


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
                subAttrs = node.getAttrList(n, frame.current(), attrs[z].keyword());
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
    return selCols;

}

function NC_SetTween(p) {

    MessageLog.trace("Set percentage: " + p);
    var selCols = new Array(0);
    selCols = getLinkedCols();

    var columnInfo = new Array(0);

    var curFrame = frame.current();

    scene.beginUndoRedoAccum("NC_Tween");

    for (i = 0; i < selCols.length; i++) {
        c = selCols[i];
        var numKeys = func.numberOfPoints(c);

        // now we want to find the previous and next frames for each column
        prevFrame = curFrame;
        nextFrame = curFrame;
        prevIndex = 0;
        nextIndex = 0;
        foundNext = 0;
        for (x = 0; x < numKeys; x++) {
            frame = func.pointX(c, x);
            if (foundNext == 0) {
                if (frame < curFrame) {
                    prevFrame = frame;
                    prevIndex = x;
                }
                if (frame > curFrame) {
                    nextFrame = frame;
                    nextIndex = x;
                    foundNext = 1;

                }
            }
        }

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

    for (i = 0; i < columnInfo.length; i++) {
        c = columnInfo[i];
        if (c.prevValue != c.nextValue) {
            nv = tween(c.prevValue, c.nextValue, p);

            // try setting the key
            column.clearKeyFrame(c.col, curFrame);
            result = column.setKeyFrame(c.col, curFrame);
            func.setBezierPoint(c.col, curFrame, nv, c.pointHandleLeftX, c.pointHandleLeftY, c.pointHandleRightX, c.pointHandleRightY, c.constSeg, c.continuity);

            MessageLog.trace(c.colName + ": " + c.prevFrame + ":" + c.prevValue + "  " + c.nextFrame + ":" + c.nextValue + " --- NEW: " + nv);
        }
    }
    scene.endUndoRedoAccum();
}

function NC_TweenFifty() {
    // Reset the tweening to halfway
    p = preferences.setDouble(TweenEnv, 50);
    NC_SetTween(p);
}

function NC_TweenMore() {
    // Reset the tweening to halfway
    p = preferences.getDouble(TweenEnv, 50);

    // now find halfway between current and 100
    var np = Math.round(tween(p, 100, 50));
    MessageLog.trace("Current: " + p + "   New: " + np);

    preferences.setDouble(TweenEnv, np);

    NC_SetTween(np);
}

function NC_TweenLess() {
    // Reset the tweening to halfway
    p = preferences.getDouble(TweenEnv, 50);

    // now find halfway between current and 0
    var np = Math.round(tween(p, 0, 50));
    MessageLog.trace("Current: " + p + "   New: " + np);

    preferences.setDouble(TweenEnv, np);

    NC_SetTween(np);
}