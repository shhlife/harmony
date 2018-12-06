/* --------------------------------------------------------------------------------- 
 * ButtonUI.js
 *
 * For some reason this button stops working after the first time running it.
 * 
 */


function ButtonUI() {

    this.PrintFrame = function() {
        scene.beginUndoRedoAccum("PrintFrame");

        var myFrame = frame.current();
        MessageLog.trace("Current Frame: " + myFrame);
        scene.endUndoRedoAccum();

        return myFrame;

    }

    // Load the ui file (created in Qt designer)
    localPath = specialFolders.userScripts;
    localPath += "/ButtonUI.ui";
    this.ui = UiLoader.load(localPath);

    // Show the dialog in non-modal fashion.
    ui.show();

    // Connect the buttons
    ui.CurrentFrameButton.clicked.connect(this, this.PrintFrame);

}