/* --------------------------------------------------------------------------------- 
 * ButtonUI.js
 *
 * For some reason this button stops working after the first time running it.
 * 
 */


function ButtonUI() {

    this.PrintFrame = function() {
        scene.beginUndoRedoAccum("PrintFrame");

        frame = frame.current();
        MessageLog.trace("Current Frame: " + frame);
        scene.endUndoRedoAccum();

        return (frame);

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