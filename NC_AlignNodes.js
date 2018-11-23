/* --------------------------------------------------------------------------------- 
 * NC_AlignNodes.js
 *
 * Jason Schleifer / 01 November 2018
 * Latest Revision: 01 November 2018, 10:04 AM
 * License: GPL v3
 * 
 * Description:
 * -----------
 * Aligns selected nodes horizontally and vertically in the Node View in Harmony.
 * 
 * Usage:
 * ------
 * Select a series of nodes you wish to be aligned.
 * Use NC_AlignNodesHorizontally for horizontally aligning nodes, NC_AlignNodesVertically
 * to vertically align them.
 * 
 * Installation:
 * -------------
 * https://docs.toonboom.com/help/harmony-16/premium/scripting/import-script.html
 * 
 * 
 */


/**
 * 
 * @return {void}
 */
function NC_AlignNodesHorizontally() {
    NC_AlignNodes(true);
}

/**
 * 
 * @return {void}
 */
function NC_AlignNodesVertically() {
    NC_AlignNodes(false);
}

/**
 * 
 * @param  {bool} horizontal - whether or not to use horizontal mode.
 * @return {void}
 */
function NC_AlignNodes(horizontal) {

    // Set the space between each node.
    var space = 10;

    // get the number of items selected
    var n = selection.numberOfNodesSelected();
    var selectedNodes = new Array;
    selectedNodes = selection.selectedNodes();

    // create an array of nodes we'll align. We will sort this array based off the x-value of each selected node
    // from left to right.
    var alignedNodes = new Array;
    alignedNodes = orderArray(selectedNodes, horizontal);


    // get the x position and the y position of the first alignedNode
    var startX = node.coordX(alignedNodes[0]);
    var startY = node.coordY(alignedNodes[0]);

    i = 0;

    // start the undo stack
    scene.beginUndoRedoAccum("Align Nodes");

    // Now go through and place every node, starting with the second one.
    for (i = 1; i < alignedNodes.length; ++i) {
        // for each node - get the current node and the previous node.
        var cNode = alignedNodes[i];
        var pNode = alignedNodes[i - 1];

        // get the width and x position of the previous node.
        var prevWidth = node.width(pNode);
        var prevHeight = node.height(pNode);
        var prevPos;
        var newPosX;
        var newPosY;
        if (horizontal == true) {
            prevPos = node.coordX(pNode);
            // figure out where the current node should be placed.
            newPosX = prevPos + prevWidth + space;
            newPosY = startY;

        } else {
            prevPos = node.coordY(cNode);
            // figure out where the current node should be placed.
            newPosY = prevPos;
            newPosX = startX;
        }


        node.setCoord(cNode, newPosX, newPosY);

    }


    // End the undo stack.
    scene.endUndoRedoAccum();
}




/**
 * function orderArray
 * 
 * orders the array based on the position of the nodes either horizontally or vertically
 * 
 * @param  {array} unorderedNodes - array of unordered nodes
 * @param  {bool} horizontal - whether they should be ordered horizontally or vertically
 * @return {array} orderedNodes
 */
function orderArray(unorderedNodes, horizontal) {

    // create an array of nodes we'll align. We will sort this array based off the x-value of each selected node
    // from left to right.
    var orderedNodes = new Array;

    // get the number of items in the array
    var n = unorderedNodes.length;

    // go through all the nodes and order them based on left to right or top to bottom
    for (i = 0; i < n; ++i) {
        // get the position in X
        aNode = unorderedNodes[i];
        var pos;
        if (horizontal == true) {
            pos = node.coordX(aNode);
        } else {
            pos = node.coordY(aNode);

        }

        // now check the position of each item in the orderedNodes array. 

        // if this is the first node, just place it at the first spot in the array.
        if (i == 0) {
            orderedNodes[0] = aNode;
        } else {

            // find out how many orderedNodes we have at the moment
            ordered = orderedNodes.length;

            // store this so we can see if the selected item has been placed in the orderedNodes array
            var isPlaced = 0;

            for (x = 0; x < ordered; ++x) {
                // make sure that we're not placing a node that already exists
                if (aNode == orderedNodes[x]) {
                    isPlaced = 1; // make sure it doesn't place it anyway
                } else {
                    // check the current node's position with the ordered node's position
                    // if it's less AND we haven't placed it yet, then place it before this node in the array
                    var position;
                    if (horizontal == true) {
                        position = node.coordX(orderedNodes[x]);
                    } else {
                        position = node.coordY(orderedNodes[x]);
                    }
                    if (pos < position) {
                        if (isPlaced == 0) {

                            // insert the node in the list before the current place
                            orderedNodes.splice(x, 0, aNode);

                            // we placed the array
                            isPlaced = 1;
                        }
                    }
                }
            }
            // if the node wasn't placed, it means it's greater than all other nodes.
            if (isPlaced == 0) {
                orderedNodes.push(aNode);
            }
        }
    }

    return orderedNodes;

}