/* --------------------------------------------------------------------------------- 
 * NC_Rename.js
 *
 * Jason Schleifer / 26 October 2018
 * Latest Revision: 26 October 2018, 10:04 AM
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
function NC_Rename() {
    var myUi = createWidget()
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

/**
 * 
 * @return {string} | widget name
 */
function createWidget() {

    var own = new QDialog();
    var gridLayout = new QGridLayout(own);
    gridLayout.objectName = "gridLayout";
    return own;

}