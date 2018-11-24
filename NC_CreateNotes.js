/* --------------------------------------------------------------------------------- 
 * NC_CreateNotes.js
 *
 * Jason Schleifer / 21 November 2018
 * Latest Revision: 1.1 -  23 November 2018, 1:30 PM
 * License: GPL v3
 * 
 * Description:
 * -----------
 * Creates a Notes drawing layer.
 * Sets the mode to a nice note pencil.
 * 
 * Note:
 * -----
 * This only works if you have a Composite node at the top layer named "Composite"
 * Only tested with Harmony Premium.
 * 
 * Installation:
 * -------------
 * https://docs.toonboom.com/help/harmony-16/premium/scripting/import-script.html
 * 
 * 
 * Updates:
 * -----
 * 1.1 - Added visibility node
 * 
 */


/**
 * 
 * @return {void}
 */
function NC_CreateNotes() {

    const NODE_WIDTH = 130;
    const NODE_HEIGHT = 50;

    // The composite node.  Change this variable if you need to connect to a different composite
    var compNode = "Top/Composite";

    // get the position of the composite node so we can place our new node near it

    var xPos = node.coordX(compNode) - NODE_WIDTH;
    var yPos = node.coordY(compNode) - NODE_HEIGHT;


    scene.beginUndoRedoAccum("New Note")

    var noteName = "Note";
    var elemName = "Note";
    var columnType = "DRAWING";


    // increment if node name exists
    extra = 1;
    underscore = "_";
    while (node.subNodeByName(node.root(), elemName) != "") {
        elemName = noteName + underscore + extra;
        ++extra;
    }

    // Create the element and column.
    var elemId = element.add(elemName, "BW", scene.numberOfUnitsZ(), "SCAN", "TVG");
    if (elemId != -1) {
        column.add(elemName, "DRAWING");
        column.setElementIdOfDrawing(elemName, elemId);
    }

    // Create node in the network.
    var vnode = node.add(node.root(), elemName, "READ", xPos, yPos, 0);

    node.linkAttr(vnode, "DRAWING.ELEMENT", elemName);

    // Create a visibility node
    var vis = node.add(node.root(), (elemName + "_VIS"), "VISIBILITY", xPos, (yPos + NODE_HEIGHT + 5), 0);
    // Turn off softrender
    node.setTextAttr(vis, "SOFTRENDER", frame.current(), "N");

    // connect node to vis, and vis to the comp
    var numPorts = node.numberOfInputPorts(compNode);
    var compPort = 0;
    node.link(vnode, 0, vis, 0, false, true);
    node.link(vis, 0, compNode, numPorts, false, true);


    // Now make sure the Note node is selected
    selection.clearSelection();
    selection.addDrawingColumnToSelection(elemName);

    // switch the current tool to the pencil tool.
    Action.perform("onActionChoosePencilTool()", "Timeline");

    // Color the node
    var noteColor = new ColorRGBA(114, 157, 173, 20);
    node.setColor(vnode, noteColor);

    scene.endUndoRedoAccum();

}
