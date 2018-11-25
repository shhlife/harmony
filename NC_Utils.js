/* --------------------------------------------------------------------------------- 
 * NC_Utils.js
 *
 * Jason Schleifer / 25 Nov 2018
 * Latest Revision: 25 Nov 2018, 8:20 AM
 * License: GPL v3
 * 
 * Description:
 * -----------
 * Some common utilities used in other scripts
 * 
 * Usage:
 * -------
 * put the following code at the head of your javascript file:
 * include("NC_Utils.js");
 * 
 * Installation:
 * -------------
 * https://docs.toonboom.com/help/harmony-16/premium/scripting/import-script.html
 * 
 */


/**
 * NC_CreateWidget
 * 
 * Creates a dialog with a grid layout. Useful for all UI!
 * 
 * Example usage:
 * 
 *  ________________
 * |                |
 * | Entry: _______ |
 * |                |
 * |  ------------  |
 * | |    Okay    | |
 * |  ------------  |
 * |________________| 
 * 
 * var myUi = NC_CreateWidget()
 * var textEntry = new QLineEdit();
 * var textLabel = new QLabel();
 * textLabel.text = "Entry:";
 * var submit = new QPushButton();
 * submit.text = "Okay";
 * 
 * myUi.gridLayout.addWidget(textLabel, 1, 0);
 * myUi.gridLayout.addWidget(textEntry, 1, 1);
 * myUi.gridLayout.addWidget(submit,2,0);
 * 
 * myUi.show();
 * textEntry.setFocus(true); 
 * 
 * @return {string} | Widget created
 */
function NC_CreateWidget() {

    var dialog = new QDialog();
    var gridLayout = new QGridLayout(dialog);
    gridLayout.objectName = "gridLayout";
    return dialog;

}


/**
 * NC_Log
 * 
 * Simply logs a message to the Message Log window in Harmony. 
 * Just a faster way to send a message instead of having to remember the MessageLog command.
 * 
 * 
 * @param  {string} message 
 * @return {void}
 */
function NC_Log(message) {
    MessageLog.trace(message);
}

/**
 * NC_Error
 * 
 * Similar to NC_Log, but instead uses MessageLog.error command. 
 * 
 * 
 * @param  {string} message 
 * @return {void}
 */
function NC_Error(message) {
    MessageLog.error(message);
}