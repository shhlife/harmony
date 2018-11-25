/* --------------------------------------------------------------------------------- 
 * NC_Rename.js
 *
 * Jason Schleifer / 26 October 2018
 * Latest Revision: v2.0 - 25 November 2018, 10:04 AM
 * License: GPL v3
 * 
 * Description:
 * -----------
 * Launches a window to help you quickly rename the selected nodes.
 * 
 * Usage:
 * ------
 * Select the node(s) you want to rename. Choose NC_Rename
 * 
 * Requirements:
 * -------------
 * NC_Utils.js
 * 
 * Updates:
 * --------
 * v2.0 - added use of NC_Utils.js
 * 
 * Installation:
 * -------------
 * https://docs.toonboom.com/help/harmony-16/premium/scripting/import-script.html
 * 
 * Acknowledgement:
 * ----------------
 * This script wouldn't have been possible without the help from eAthis
 * https://forums.toonboom.com/harmony/support-and-troubleshooting/how-set-focus-lineedit-qtscript
 */

include("NC_Utils.js");

/**
 * 
 * @return {void}
 */
function NC_Rename() {
    var myUi = NC_CreateWidget()
    var replaceLE = new QLineEdit();
    var replaceLELabel = new QLabel();
    replaceLELabel.text = "Replace:";
    var submit = new QPushButton();
    submit.text = "OK";
    var cancel = new QPushButton();
    cancel.text = "CANCEL";

    myUi.gridLayout.addWidget(replaceLELabel, 1, 0);
    myUi.gridLayout.addWidget(replaceLE, 1, 1);
    myUi.gridLayout.addWidget(submit, 2, 0);
    myUi.gridLayout.addWidget(cancel, 2, 1);
    //myUi.setWindowFlags(Qt.FramelessWindowHint);

    myUi.show();
    replaceLE.setFocus(true); // here is the line you need !

    var renameAll = function() {
        var _newName = replaceLE.text;
        var n = selection.numberOfNodesSelected();

        for (i = 0; i < n; ++i) {

            var selNode = selection.selectedNode(i);
            var nodeNamePath = selNode.split("/");
            var nodeName = nodeNamePath[nodeNamePath.length - 1];

            var newNodeName = _newName;
            if (n > 1) {
                newNodeName = newNodeName + "_" + (i + 1);
            }

            var columnId = node.linkedColumn(selNode, "DRAWING.ELEMENT");
            var elementKey = column.getElementIdOfDrawing(columnId);
            var newColumnName = newNodeName;

            node.rename(selNode, newNodeName);
            column.rename(columnId, newNodeName);
            element.renameById(elementKey, newNodeName);
        }

        myUi.close();
    }

    submit.clicked.connect(myUi, renameAll);
    cancel.clicked.connect(myUi, myUi.close);


}