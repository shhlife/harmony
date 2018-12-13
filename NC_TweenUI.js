/* --------------------------------------------------------------------------------- 
 * NC_Tween.js
 *
 * Jason Schleifer / 25 November 2018
 * Latest Revision: 6 December 2018, 1:30 PM
 * License: GPL v3
 *
 * Description:
 * -----------
 * Create a simple UI to make it easy to blend the currently selected peg(s) between the previous and next key frame 
 * 
 * Chris Carter / 12 December 2018
 * Latest Revision: 13 December 2018, 15:40 PM
 * 
 * Description:
 * -----------
 * Enable manipulation of deformation nodes ( and any other non peg nodes inside a group )
 * Guess if the user is using the camera view to select ( if the initial selection only contains drawings ), if so then select the peg/ deformers applying to its transformation
 * Include checkbox option to collect all nodes beneath the selected node.
 * 
 * Version:
 * --------
 * 
 * 0.7 -    Include option to collect all nodes beneath the selected node in the hierarchy
 * 
 * 0.6 -    Will work on deformers ( and any peg / deformer inside a contained group).
 * 
 * 0.5 -    Updated the window to stay on top when working with it.
 * 
 * 0.4 -    Fixed bug when using more than one peg/drawing at a time.
 * 
 * 0.3 -    Added Antic and Overshoot - first pass to see how those work.
 *          Moved all UI into the main js file, no need for NC_TweenUI.ui anymore.
 * 
 * 0.2 -    UI works for making it < Favor Previous |  Halfway  |  Favor Next >
 * 
 * 0.1 -    Very much still in progress. Currently it will allow you to blend 10, 50, or 90% between
 *          two keys.
 * 
 * Usage:
 * ------
 * NC_TweenUI
 * 
 * Installation:
 * -------------
 * https://docs.toonboom.com/help/harmony-16/premium/scripting/import-script.html
 * 
 * 
 */

//var TweenEnv = "NC_TweenPercent";


/**
 * NC_Tween ()
 * 
 * @return {void}
 */

//keep the deformation types as a variable so that they dont need to be written out multiple times
var deformationTypes = ["CurveModule", "OffsetModule", "DeformationCompositeModule", "KinematicOutputModule", "TransformationSwitch", "PointConstraint2","REMOVE_TRANSPARENCY","BendyBoneModule","ArticulationModule","BezierMesh","GameBoneModule","GLUE","REFRACT","BoneModule","Turbulence","DeformationRootModule","DeformationScaleModule","DeformationSwitchModule","DeformationUniformScaleModule","DeformationWaveModule","FoldModule","AutoFoldModule","AutoMuscleModule"]
// manipulateTypes are same as deformation types but also includes PEG type
var manipulateTypes = ["CurveModule", "OffsetModule", "DeformationCompositeModule", "KinematicOutputModule", "TransformationSwitch", "PointConstraint2","REMOVE_TRANSPARENCY","BendyBoneModule","ArticulationModule","BezierMesh","GameBoneModule","GLUE","REFRACT","BoneModule","Turbulence","DeformationRootModule","DeformationScaleModule","DeformationSwitchModule","DeformationUniformScaleModule","DeformationWaveModule","FoldModule","AutoFoldModule","AutoMuscleModule", "PEG" ]
// selectionTypes are same as deformation types but also includes PEG type and GROUP type
var selectionTypes = ["CurveModule", "OffsetModule", "DeformationCompositeModule", "KinematicOutputModule", "TransformationSwitch", "PointConstraint2","REMOVE_TRANSPARENCY","BendyBoneModule","ArticulationModule","BezierMesh","GameBoneModule","GLUE","REFRACT","BoneModule","Turbulence","DeformationRootModule","DeformationScaleModule","DeformationSwitchModule","DeformationUniformScaleModule","DeformationWaveModule","FoldModule","AutoFoldModule","AutoMuscleModule", "PEG" , "GROUP"]

var debug = false

include("NC_Utils.js")

function NC_Tween() {

    /**
     * function tween  
     *       
     * @param  {float} a | Start value
     * @param  {float} b | End Value
     * @param  {float} p | Percentage between (in integer - eg: 25, 50, 100)
     * @return  {float} newValue | The resulting value between start and end
     */

    this.tween = function(a, b, p) {

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
        return newValue;
    }

    /**
     * function getManipulationSelection
     * 
     * Returns the relevant nodes in the selection, going inside groups also
     * 
     * @return {array} selNodes | Selected Nodes.
     */
    

	this.getManipulationSelection = function( nodeTypes_toManipulate , nodeSelection ){

        if( this.debug ){  
            this.NC_Log("getManipulationSelection called") 
        }

		//create and empty array to put the nodes we want to manipulate into
		manipulationSelection = new Array(0)

		if( nodeSelection.length == 0 ){
			this.NC_Log("NC_Tween.getManipulationSelection : no nodes selected ")
			return
		}
		else{
			
			// check if the selection is all drawings, if so then they user (probably) selected in the camera view so we should make sure the deformer/peg imediately above the drawing are being manipulated
			var selectionIsAllDrawings = true
			for( i in nodeSelection){
				selNode = nodeSelection[i]
				if(node.type(selNode) != "READ"){
					selectionIsAllDrawings = false
				}
			}

			if ( selectionIsAllDrawings ){
                
                if( this.debug ){  
                    this.NC_Log("selectionIsAllDrawings") 
                }
                
				for(d in nodeSelection){
					selDrawing 	= nodeSelection[d]
					//get the drawings parent
					selParent 		= node.srcNode(selDrawing,0)
					selParent_type = node.type(selParent)

					// if the parent is a peg then add it to the selection
					if ( selParent_type == "PEG"){
						manipulationSelection.push(selParent)
					}

					// if the parent is a group check if the node immediately connected to it is a peg, if not then check if it is a deformation group, if not then ignore it as that is a rigging style that will take too much time to accomidate at the moment.
					else if ( selParent_type == "GROUP"){ 

						selParent_inGroup = node.flatSrcNode(selDrawing, 0);
						if( node.type(selParent_inGroup) == "PEG"){
							manipulationSelection.push(selParent_inGroup)
						}
						
						
						else {
							// if there are no "READ" or "PEG" nodes in the group then we can add the entire group to the selection as we can assume it will be a deformation goup
							// so we collect the deformation group and the peg above it
							readPegNodesInGroup = this.NC_GetNodesInGroup_ofType( selParent , ["READ","PEG"])

							if (readPegNodesInGroup.length <= 0){
								deformationGroupContents = this.NC_GetNodesInGroup_ofType( selParent, nodeTypes_toManipulate)
								Array.prototype.push.apply(manipulationSelection , deformationGroupContents)
								selDeformerParent = node.flatSrcNode(selParent)
								this.NC_Log(selDeformerParent)
								manipulationSelection.push(selDeformerParent)
							}
							// otherwise, we need to find the speciffic parent peg of this drawing
							else{
								this.NC_Log("NC_Tween.getManipulationSelection : unable to validate hierarchy imediately above node :  < " +  selDrawing + " > /n Try selecting the nodes you want to manipulate in the 'Node View' window  ")
							}	
						}				
					}
				}
			}
			else{

				for( i in nodeSelection){

                    if( this.debug ){  
                        this.NC_Log("selNode = " + nodeSelection[i]) 
                    }

					selNode 			= nodeSelection[i]
					selNode_type 		= node.type(selNode)

					// if this node is the type that we want to manipulate then we will add it to our list
					if(nodeTypes_toManipulate.indexOf(selNode_type) > -1){
						manipulationSelection.push(selNode)
					}

					// if this peg is a group then go inside it and return all of the contained nodes of the type we want to collect
					else if(selNode_type == "GROUP"){
						containedElements = this.NC_GetNodesInGroup_ofType( selNode , nodeTypes_toManipulate)
						Array.prototype.push.apply(manipulationSelection , containedElements)
					}
				}
			}
		}
		return manipulationSelection
	}

	/**
     * function getLinkedCols
     * 
     * Returns the linked columns from the selected pegs or drawings.
     * 
     * @return {array} selCols | Selected columns.
     */


    this.getLinkedCols = function(selNodes) {

        // get the current frame. This is needed in order to pull the existing columsn
        var curFrame = frame.current();

        // create an array for selected columns
        var selCols = new Array(0);

        // for each selected item
        for (i = 0; i < selNodes.length; i++) {

            // get a handy variable for the selected item
            var n = selNodes[i];

            // figure out what type it is
            var type = node.type(n);

            // get an array for attributes
            var attrs = new Array(0);

            // get a list of all attributes on the peg	
            attrs = node.getAttrList(n, curFrame, "");

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
                subAttrs = node.getAttrList(n, curFrame, attrs[z].keyword());
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

        // now we have all the selected columns
        return selCols;

    }

    this.getAllKeyInfo = function() {

        }
        /**
         * function NC_SetTween
         * 
         * Figures out how to tween for the selected columns based on the percentage given.
         * At the moment, we're using:
         *    25: Tween to the previous keyframe's value
         *    50: Tween halfway
         *    75: Tween to the next keyframe's value
         * 
         * @param  {any} p | percentage to tween
         * @return {void}
         */
    this.NC_SetTween = function(p , kc) {

        if( this.debug ){  
            this.NC_Log("NC_SetTween called") 
        }

        var initialSelection = selection.selectedNodes()

        //collect all nodes that are below the selected nodes in the node hierarchy
        if ( kc){
            for( i in initialSelection ){
                selNode = initialSelection[i]

                // get all of the nodes below this node in the hierarchy
                
                var initialSelection = this.NC_GetAllDstNodes( this.selectionTypes,  initialSelection, selNode )
            }
        }

        // this is a useful way to debug the initial selection
        if( this.debug ){    
            this.NC_Log("\tinitialSelection = ")
            this.NC_NumberedList( initialSelection)
        }

        // get all the tweenable nodes contained in your selection
        var selCols 	= new Array(0);

	    selNodes 		= this.getManipulationSelection( this.manipulateTypes,  initialSelection );

	    // this is a useful way to debug the returning manipulation selection
	    if( this.debug ){    
            this.NC_Log("\tmanipulationSelection = ")
            this.NC_NumberedList( manipulationSelection)
        }
	
	    // get the columns of those nodes
        selCols 		= this.getLinkedCols(selNodes);

        // create an array to store the column info
        var columnInfo = new Array(0);

        // get the current frame
        var curFrame = frame.current();

        // for each column, go and get info on previous, current and next keys.
        for (i = 0; i < selCols.length; i++) {
            c = selCols[i];

            // how many keys exist in the column?
            var numKeys = func.numberOfPoints(c);

            // now we want to find the previous and next frames for each column
            prevFrame = curFrame;
            nextFrame = curFrame;
            prevIndex = 0;
            nextIndex = 0;
            foundNext = 0; // checking to see if we found the next key

            // for each key - iterate through until we have the previous and next frames
            for (x = 0; x < numKeys; x++) {
                framePoint = func.pointX(c, x);
                if (foundNext == 0) {
                    if (framePoint < curFrame) {
                        prevFrame = framePoint;
                        prevIndex = x;
                    }
                    if (framePoint > curFrame) {
                        nextFrame = framePoint;
                        nextIndex = x;
                        foundNext = 1;

                    }
                }
            }

            // get the current, previus and next values
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

            // slurp all this stuff into an array
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


        // Now the magic happens! Start the tweening!
        scene.beginUndoRedoAccum("NC_Tween");

        for (i = 0; i < columnInfo.length; i++) {
            c = columnInfo[i];

            var np = p; // use np so we don't overwrite p

            // only continue if the previous value and the next value aren't the same. Otherwise we're wasting time!
            if (c.prevValue != c.nextValue) {
                // if we're favoring the next key..
                if (np == 75) {
                    columnInfo[i].prevValue = columnInfo[i].val;
                    // now set p to 50 so we'll be between the current value and the next
                    np = 50;
                }
                // if we're favoring the previous key
                if (np == 25) {
                    columnInfo[i].nextValue = columnInfo[i].val;
                    // now set p to 50
                    np = 50;
                }


                // get the next value that we tween to
                var nv = this.tween(columnInfo[i].prevValue, columnInfo[i].nextValue, np);

                // Create a key
                result = column.setKeyFrame(c.col, curFrame);
                // Now adjust the key based on the previous key's settings.
                func.setBezierPoint(c.col, curFrame, nv, c.pointHandleLeftX, c.pointHandleLeftY, c.pointHandleRightX, c.pointHandleRightY, c.constSeg, c.continuity);

            } else {
                // skipping
            }
        }
	this.NC_Log("NC_Tween : keyframe on frame: " + curFrame)
    scene.endUndoRedoAccum();
    }
    this.antic = function() {
        this.NC_SetTween(-15 , keyChildNodes.checked);
    }
    this.tweenPrevious = function() {
        this.NC_SetTween(25 , keyChildNodes.checked);
    }
    this.tweenMid = function() {
        this.NC_SetTween(50 , keyChildNodes.checked);
    }
    this.tweenNext = function() {
        this.NC_SetTween(75 , keyChildNodes.checked);
    }
    this.overshoot = function() {
        this.NC_SetTween(115 , keyChildNodes.checked);
    }

    // UI
    // =========================================

    this.createWidget = function() {

	
        var own = new QDialog();
        var gridLayout = new QGridLayout(own);
        gridLayout.objectName = "gridLayout";
        return own;
    }


    // build the widget
    var myUi = this.createWidget();

    var AnticButton = new QPushButton();
    AnticButton.text = "Antic";

    var FavorAButton = new QPushButton();
    FavorAButton.text = "Favor Prev Frame";

    var MidButton = new QPushButton();
    MidButton.text = "Halfway";

    var FavorBButton = new QPushButton();
    FavorBButton.text = "Favor Next Frame";

    var OvershootButton = new QPushButton();
    OvershootButton.text = "Overshoot";

    var keyChildNodes = new QCheckBox();
    keyChildNodes.text = "keframe child nodes"
    keyChildNodes.checked = true;

    // Layout
    myUi.gridLayout.addWidget(AnticButton, 0, 0);
    myUi.gridLayout.addWidget(FavorAButton, 0, 1);
    myUi.gridLayout.addWidget(MidButton, 0, 2);
    myUi.gridLayout.addWidget(FavorBButton, 0, 3);
    myUi.gridLayout.addWidget(OvershootButton, 0, 4);

    myUi.gridLayout.addWidget(keyChildNodes, 1, 0);

    // Show the dialog in non-modal fashion.
    myUi.setWindowFlags(Qt.WindowStaysOnTopHint);

    myUi.show();
    //myUi.isModal = true;

    // Connect the buttons
    AnticButton.clicked.connect(this, this.antic);
    FavorAButton.clicked.connect(this, this.tweenPrevious);
    MidButton.clicked.connect(this, this.tweenMid);
    FavorBButton.clicked.connect(this, this.tweenNext);
    OvershootButton.clicked.connect(this, this.overshoot);

}