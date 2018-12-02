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



/**
 * tween
 * 
 * @param  {double} a | start value
 * @param  {double} b | end value
 * @param  {double} p | percent between
 * @return {double} newValue | the value between start and end based on the percentage
 */
function tween(a, b, p) {
    var newValue = 0.0;
    if (b > a) {
        var dist = b - a;
        var percent = dist * p / 100;
        newValue = (1 * a) + (1 * percent); // this forces javascript to add these as numbers
    } else {
        var dist = a - b;
        var percent = dist * p / 100;
        newValue = (1 * b) + (1 * percent); // this forces javascript to add these as numbers

    }
    return (newValue);
}


// Create something like tween machine.
var mySlider;
var attrs = ["POSITION.x", "POSITION.y", "POSITION.z", "ROTATION.ANGLEX", "ROTATION.ANGLEY", "ROTATION.ANGLEZ", "SCALE.x", "SCALE.y", "SCALE.z", "SKEW"];
var nodes = new Array();

include("NC_Utils.js");

function NC_TweenMachine() {



    NC_Log("========================");
    // Validation

    // Make sure we have at least one layer selected in the timeline.
    var nLayers = Timeline.numLayerSel;
    if (nLayers < 1) {
        MessageBox.information("At least one layer has to be selected in the Timeline!");
        return;
    }

    // Get the current frame
    currentFrame = Timeline.firstFrameSel;

    // get the previous frame
    Action.perform("onActionGoToPrevKeyFrame()", "timelineView");
    prevFrame = Timeline.firstFrameSel;

    // go to the current frame
    frame.setCurrent(currentFrame);

    // get the next frame
    Action.perform("onActionGoToNextKeyFrame()", "timelineView");
    nextFrame = Timeline.firstFrameSel;

    // go to the current frame
    frame.setCurrent(currentFrame);

    NC_Log("Current: " + currentFrame);
    NC_Log("Prev: " + prevFrame);
    NC_Log("Next: " + nextFrame);


    num = Timeline.numLayerSel;
    var i;
    var previousC = "";

    var bezierList = new Array(0);
    var pathList = new Array(0);
    var easeList = new Array(0);



    for (i = 0; i < num; i++) {
        var c = Timeline.selToColumn(i);
        var n = Timeline.selToNode(i);

        // if the column is the same as the last one, skip this step
        if (c == previousC)
            continue;

        if (column.type(c) == "BEZIER") {
            bezierList.push(c);
        }
        if (column.type(c) == "3DPATH") {
            pathList.push(c);
        }
        if (column.type(c) == "QUATERNIONPATH") {
            pathList.push(c);
        }
        if (column.type(c) == "EASE") {
            easeList.push(c);
        }
        previousC = c;
    }
    if (bezierList.length == 0 && pathList.length == 0 && easeList.length == 0) {
        MessageBox.information("The selected layers contain no functions!");
        return;
    }

    return bezierList;

}

function NC_SetHalf() {
    p = 50;
    nodes = NC_TweenMachine();
    scene.beginUndoRedoAccum("NC_Tween");

    if (nodes.length > 0) {

        for (i = 0; i < nodes.length; i++) {
            c = nodes[i];
            // get the value
            var v = column.getEntry(c, 1, frame.current());
            var pv = column.getEntry(c, 1, prevFrame);
            var nv = column.getEntry(c, 1, nextFrame);

            if (pv != nv) {
                var tv = tween(pv, nv, p);
                column.setKeyFrame(c, currentFrame);
                func.setBezierPoint(c, currentFrame, tv, func.pointHandleLeftX(c, 0), func.pointHandleLeftY(c, 0), func.pointHandleRightX(c, 0), func.pointHandleRightY(c, 0), true, "CORNER");
            }

        }

    }
    scene.endUndoRedoAccum();

}

function NC_SetNinety() {
    p = 10;
    nodes = NC_TweenMachine();
    scene.beginUndoRedoAccum("NC_Tween");

    if (nodes.length > 0) {

        for (i = 0; i < nodes.length; i++) {
            c = nodes[i];
            // get the value
            var v = column.getEntry(c, 1, frame.current());
            var pv = column.getEntry(c, 1, prevFrame);
            var nv = column.getEntry(c, 1, nextFrame);

            if (pv != nv) {
                var tv = tween(pv, nv, p);
                column.setKeyFrame(c, currentFrame);
                func.setBezierPoint(c, currentFrame, tv, func.pointHandleLeftX(c, 0), func.pointHandleLeftY(c, 0), func.pointHandleRightX(c, 0), func.pointHandleRightY(c, 0), true, "CORNER");
            }

        }

    }
    scene.endUndoRedoAccum();

}

function NC_SetTen() {
    p = 90;
    nodes = NC_TweenMachine();
    scene.beginUndoRedoAccum("NC_Tween");

    if (nodes.length > 0) {

        for (i = 0; i < nodes.length; i++) {
            c = nodes[i];
            // get the value
            var v = column.getEntry(c, 1, frame.current());
            var pv = column.getEntry(c, 1, prevFrame);
            var nv = column.getEntry(c, 1, nextFrame);

            if (pv != nv) {
                var tv = tween(pv, nv, p);
                column.setKeyFrame(c, currentFrame);
                func.setBezierPoint(c, currentFrame, tv, func.pointHandleLeftX(c, 0), func.pointHandleLeftY(c, 0), func.pointHandleRightX(c, 0), func.pointHandleRightY(c, 0), true, "CORNER");
            }

        }

    }
    scene.endUndoRedoAccum();

}

function Private_ProcessBezier(b, currentFrame, percent) {
    // I need to figure out what frames the keys are in the column.

    // first go to the next keyframe
    Action.perform("onActionGoToNextKeyFrame()", "timelineView");
    nextFrame = Timeline.firstFrameSel;

    // Go back to the frame we had

    // Now go to the previous keyframe
    Action.perform("onActionGoToPrevKeyFrame()", "timelineView");
    prevFrame = Timeline.firstFrameSel;

    var values = new Array(0);
    var v = column.getEntry(b, 1, f);

}

function printVal() {
    //This prints a continuous stream of updating values, as they are changed

    // Get the selected nodes
    // get the number of items selected
    var n = selection.numberOfNodesSelected();
    var percent = mySlider.value;
    //for (i = 0; i < bezierList.length; ++i) {
    //    Private_ProcessBezier(bezierList[i], currentFrame, percent);
    //}
    if (nodes.length > 0) {

        var percent = mySlider.value;
        for (i = 0; i < nodes.length; i++) {
            var newValue = tween(nodes[i].prev, nodes[i].next, percent);
            NC_Log("Name: " + nodes[i].name + ", Attr: " + nodes[i].attr + ", Current: " + nodes[i].current + ", New: " + newValue + ", Prev: " + nodes[i].prev + ", Next: " + nodes[i].next)
                //node.setTextAttr(nodes[i].theNode, nodes[i].attr, currentFrame, newValue);
                //Action.perform("onActionInsertKeyframe()");
                // function.setBezierPoint(nodes[i].name, currentFrame)
        }

        // check and see if there are any keys before or after the current frame for the selected node.
        /* var start = 15;
         var end = 200;
         var percent = mySlider.value;
         var value = tween(start, end, percent);
         MessageLog.trace(currentFrame + ": " + value);
         */

    }

}