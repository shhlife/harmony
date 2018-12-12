/* --------------------------------------------------------------------------------- 
 * NC_Utils.js
 *
 *
 * Chris Carter / 11 Dec 2018
 * Latest Revision: 11 Dec 2018, 8:20 AM
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

/**================================================================================================================
 *
 *                                                 UI UTILITIES
 * 
 * ================================================================================================================
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

/**================================================================================================================
 *
 *                                                 LOGGING UTILITIES
 * 
 * ================================================================================================================
 */

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
 * NC_numberedList
 * 
 * Similar to NC_Log. useful for debugging and clarifying what is contained in a speciffic array
 * 
 * @param  {array} arrayOfItems 
 * @return {void}
 */
function NC_numberedList( arrayOfItems ){
	for( i in arrayOfItems )
	{
		selItem = arrayOfItems[i]
		MessageLog.trace( "\t" + i + " \t" + selItem)
	}
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


/*
NC_get_scriptFile 
For accessing script resources ( libraries and UI files)
it will check if the named file exists in the global scripts location and, if not, then the local scripts location.
This means that these tools can be put in the Harmony Database global scripts location like: < \\*YOUR_SERVER_NAME*\USA_DB\scripts> to be accessed by all members of the same harmony network as well as standalone harmony users where the script location would be like: < C:\Program Files (x86)\Toon Boom Animation\Toon Boom Harmony 16.0 Premium\resources\scripts >
*/
function NC_get_scriptFile( fileName ){

	// for Harmony Database 
	var configFilePath 	= specialFolders.etc + "/shortcuts.conf"
	var configFile 		= new File (configFilePath)
	
	configFile.open( 1 /* FileAccess.ReadOnly */ );
	var configFileContents = configFile.read( );
	configFile.close();

	//for line in configfile which  starts with /USA_DB ,  grab the second part of that path and use it as our global path
	var configFileLines 	= configFileContents.split("\n")
	for( i  in configFileLines){
		var selLine 	= configFileLines[i]
		selLine_clean 	= selLine.substring(0,(selLine.length -1)) // " string.remove()" does not seem to be working so this is to remove the line break from the end of the line
		if (selLine_clean.indexOf("USA_DB") > -1 ){
			
			globalScriptsFolder 		= "/" + selLine_clean.split(" /")[1] + "/scripts" //the server file path will not be split even if the server is named with any ' ' characters
			var globalScriptsPath 	= globalScriptsFolder + "/" + fileName 
			var globalFile 			= new File( globalScriptsPath)
			
			if ( globalFile.exists ){
				return globalScriptsPath;
			}
		}
	}

	// for Harmony Standalone
	var localScriptsFolder 	= specialFolders.userScripts 
	var localScriptsPath		= localScriptsFolder + "/"  + fileName  
	var localFile 			= new File( localScriptsPath)

	 if ( localFile.exists ){
		return localScriptsPath;
	}
	
	NC_Log("ERROR : no script file named "+ fileName +" could be found in <" + localScriptsFolder +"> or <" +globalScriptsFolder +">")
	return "ERROR"
}

// NC_get_nodesInGroup_ofType : will return all nodes of the specified type contained in the selection
// used to access the content of groups
function NC_get_nodesInGroup_ofType( sel_groupName , nodeTypes_toSelect  ){

	var nodesInGroup_ofType = new Array
	var allNodes_ofType 	= node.getNodes(nodeTypes_toSelect)
	for (var i = 0; i < allNodes_ofType.length; ++i)
	{
		var selNode 		= allNodes_ofType[i]
		if (  selNode.indexOf( sel_groupName ) >= 0 )
		{
			nodesInGroup_ofType.push(selNode)
		}
	}
	return nodesInGroup_ofType
}
