/*import { Component, OnInit, ViewChild, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import * as go from 'gojs';

// This requires us to include
// "node_modules/gojs/extensionsTS/*"
// in the "includes" list of this project's tsconfig.json
import { GuidedDraggingTool } from 'gojs/extensionsTS/GuidedDraggingTool';

@Component({
  selector: 'app-tree-studio',
  templateUrl: './tree-studio.component.html',
  styleUrls: ['./tree-studio.component.scss']
})

export class TreeStudioComponent implements OnInit {
  private diagram: go.Diagram = new go.Diagram();
  private palette: go.Palette = new go.Palette();

  @ViewChild('diagramDiv')
  private diagramRef: ElementRef;

  @ViewChild('paletteDiv')
  private paletteRef: ElementRef;

  @Input()
  get model(): go.Model { return this.diagram.model; }
  set model(val: go.Model) { this.diagram.model = val; }

  @Output()
  nodeSelected = new EventEmitter<go.Node|null>();

  @Output()
  modelChanged = new EventEmitter<go.ChangedEvent>();

  
  constructor() {
    const $ = go.GraphObject.make;
    // Place GoJS license key here:
    // (go as any).licenseKey = "..."
    this.diagram = new go.Diagram();
    this.diagram.initialContentAlignment = go.Spot.Center;
    this.diagram.allowDrop = true;
    this.diagram.undoManager.isEnabled = true;
    this.diagram.toolManager.draggingTool = new GuidedDraggingTool();
    this.diagram.addDiagramListener("ChangedSelection",
        e => {
          const node = e.diagram.selection.first();
          this.nodeSelected.emit(node instanceof go.Node ? node : null);
        });
    this.diagram.addModelChangedListener(e => e.isTransactionFinished && this.modelChanged.emit(e));

    this.diagram.nodeTemplate =
      $(go.Node, "Auto",
        new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
        $(go.Shape,
          {
            fill: "white", strokeWidth: 0,
            portId: "", cursor: "pointer",
            // allow many kinds of links
            fromLinkable: true, toLinkable: true,
            fromLinkableSelfNode: true, toLinkableSelfNode: true,
            fromLinkableDuplicates: true, toLinkableDuplicates: true
          },
          new go.Binding("fill", "color")),
        $(go.TextBlock,
          { margin: 8, editable: true },
          new go.Binding("text").makeTwoWay())
      );

    this.diagram.linkTemplate =
      $(go.Link,
        // allow relinking
        { relinkableFrom: true, relinkableTo: true },
        $(go.Shape),
        $(go.Shape, { toArrow: "OpenTriangle" })
      );

    this.palette = new go.Palette();
    this.palette.nodeTemplateMap = this.diagram.nodeTemplateMap;

    // initialize contents of Palette
    this.palette.model.nodeDataArray =
      [
        { text: "Alpha", color: "lightblue" },
        { text: "Beta", color: "orange" },
        { text: "Gamma", color: "lightgreen" },
        { text: "Delta", color: "pink" },
        { text: "Epsilon", color: "yellow" }
      ];
  }

  ngOnInit() {
    this.diagram.div = this.diagramRef.nativeElement;
    this.palette.div = this.paletteRef.nativeElement;
  }
} */

import { Component, OnInit, ViewChild, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import * as go from 'gojs';

// This requires us to include
// 'node_modules/gojs/extensionsTS/*'
// in the 'includes' list of this project's tsconfig.json
import { GuidedDraggingTool } from 'gojs/extensionsTS/GuidedDraggingTool';

@Component({
  selector: 'app-tree-studio',
  templateUrl: './tree-studio.component.html',
  styleUrls: ['./tree-studio.component.scss']
})

export class TreeStudioComponent implements OnInit {
  private diagram: go.Diagram = new go.Diagram();
  private palette: go.Palette = new go.Palette();

  @ViewChild('diagramDiv')
  private diagramRef: ElementRef;

  @ViewChild('SaveButton')
  private SaveButton: ElementRef;

  @ViewChild('paletteDiv')
  private paletteRef: ElementRef;

  @Input()
  get model(): go.Model { return this.diagram.model; }
  set model(val: go.Model) { this.diagram.model = val; }

  @Output()
  nodeSelected = new EventEmitter<go.Node|null>();

  @Output()
  modelChanged = new EventEmitter<go.ChangedEvent>();


  constructor() {
    const $ = go.GraphObject.make;
    // Place GoJS license key here:
    // (go as any).licenseKey = '...'
    this.diagram = new go.Diagram();

    // DIAGRAM PROPERTIES
    this.diagram.initialContentAlignment = go.Spot.Center;
    this.diagram.allowDrop = true;
    this.diagram.allowCopy = true;
    this.diagram.undoManager.isEnabled = true;
    this.diagram.toolManager.draggingTool = new GuidedDraggingTool();
    this.diagram.toolManager.draggingTool.dragsTree = true;
    this.diagram.commandHandler.deletesTree = true;

    

    // DIAGRAM EVENTS
    this.diagram.addDiagramListener('ChangedSelection',
      e => {
        const node = e.diagram.selection.first();
        this.nodeSelected.emit(node instanceof go.Node ? node : null);
      });
    this.diagram.addModelChangedListener(e => e.isTransactionFinished && this.modelChanged.emit(e));

    // when the document is modified, add a '*' to the title and enable the 'Save' button
    this.diagram.addDiagramListener('Modified', function(e) {
        if (this.SaveButton) { this.SaveButton.disabled = !this.diagram.isModified; }
        const idx = document.title.indexOf('*');
        if (this.diagram.isModified) {
          if (idx < 0) { document.title += '*'; }
        } else {
          if (idx >= 0) { document.title = document.title.substr(0, idx); }
        }
      });

      const bluegrad = $(go.Brush, 'Linear', { 0: '#C4ECFF', 1: '#70D4FF' });
      const greengrad = $(go.Brush, 'Linear', { 0: '#B1E2A5', 1: '#7AE060' });

      // each action is represented by a shape and some text
      const actionTemplate =
        $(go.Panel, 'Horizontal',
          $(go.Shape,
            { width: 12, height: 12 },
            new go.Binding('figure'),
            new go.Binding('fill')
          ),
          $(go.TextBlock,
            { font: '10pt Verdana, sans-serif' },
            new go.Binding('text')
          )
        );

      // each regular Node has body consisting of a title followed by a collapsible list of actions,
      // controlled by a PanelExpanderButton, with a TreeExpanderButton underneath the body
      this.diagram.nodeTemplate =  // the default node template
        $(go.Node, 'Vertical',
          { selectionObjectName: 'BODY' },
          // the main 'BODY' consists of a RoundedRectangle surrounding nested Panels
          $(go.Panel, 'Auto',
            { name: 'BODY' },
            $(go.Shape, 'Rectangle',
              { fill: bluegrad, stroke: null }
            ),
            $(go.Panel, 'Vertical',
              { margin: 3 },
              // the title
              $(go.TextBlock,
                {
                  stretch: go.GraphObject.Horizontal,
                  font: 'bold 12pt Verdana, sans-serif'
                },
                new go.Binding('text', 'question')
              ),
              // the optional list of actions
              $(go.Panel, 'Vertical',
                { stretch: go.GraphObject.Horizontal, visible: false },  // not visible unless there is more than one action
                new go.Binding('visible', 'actions', function(acts) {
                  return (Array.isArray(acts) && acts.length > 0);
                }),
                // headered by a label and a PanelExpanderButton inside a Table
                $(go.Panel, 'Table',
                  { stretch: go.GraphObject.Horizontal },
                  $(go.TextBlock, 'Choices',
                    {
                      alignment: go.Spot.Left,
                      font: '10pt Verdana, sans-serif'
                    }
                  ),
                  $('PanelExpanderButton', 'COLLAPSIBLE',  // name of the object to make visible or invisible
                    { column: 1, alignment: go.Spot.Right }
                  )
                ), // end Table panel
                // with the list data bound in the Vertical Panel
                $(go.Panel, 'Vertical',
                  {
                    name: 'COLLAPSIBLE',  // identify to the PanelExpanderButton
                    padding: 2,
                    stretch: go.GraphObject.Horizontal,  // take up whole available width
                    background: 'white',  // to distinguish from the node's body
                    defaultAlignment: go.Spot.Left,  // thus no need to specify alignment on each element
                    itemTemplate: actionTemplate  // the Panel created for each item in Panel.itemArray
                  },
                  new go.Binding('itemArray', 'actions')  // bind Panel.itemArray to nodedata.actions
                )  // end action list Vertical Panel
              )  // end optional Vertical Panel
            )  // end outer Vertical Panel
          ),  // end 'BODY'  Auto Panel
          $(go.Panel,  // this is underneath the 'BODY'
            { height: 17 },  // always this height, even if the TreeExpanderButton is not visible
            $('TreeExpanderButton')
          )
        );

      // define a second kind of Node:
      this.diagram.nodeTemplateMap.add('Terminal',
        $(go.Node, 'Spot',
          $(go.Shape, 'Circle',
            { width: 55, height: 55, fill: greengrad, stroke: null }
          ),
          $(go.TextBlock,
            { font: '10pt Verdana, sans-serif' },
            new go.Binding('text')
          )
        )
      );

      this.diagram.linkTemplate =
        $(go.Link, go.Link.Orthogonal,
          { deletable: false, corner: 10 },
          $(go.Shape,
            { strokeWidth: 2 }
          ),
          $(go.TextBlock, go.Link.OrientUpright,
            {
              background: 'white',
              visible: false,  // unless the binding sets it to true for a non-empty string
              segmentIndex: -2,
              segmentOrientation: go.Link.None
            },
            new go.Binding('text', 'answer'),
            // hide empty string;
            // if the 'answer' property is undefined, visible is false due to above default setting
            new go.Binding('visible', 'answer', function(a) { return (a ? true : false); })
          )
        );

      const nodeDataArray = [
        {
          key: 1, question: 'Greeting',
          actions: [
            { text: 'Sales', figure: 'ElectricalHazard', fill: 'blue' },
            { text: 'Parts and Services', figure: 'FireHazard', fill: 'red' },
            { text: 'Representative', figure: 'IrritationHazard', fill: 'yellow' }
          ]
        },
        {
          key: 2, question: 'Sales',
          actions: [
            { text: 'Compact', figure: 'ElectricalHazard', fill: 'blue' },
            { text: 'Mid-Size', figure: 'FireHazard', fill: 'red' },
            { text: 'Large', figure: 'IrritationHazard', fill: 'yellow' }
          ]
        },
        {
          key: 3, question: 'Parts and Services',
          actions: [
            { text: 'Maintenance', figure: 'ElectricalHazard', fill: 'blue' },
            { text: 'Repairs', figure: 'FireHazard', fill: 'red' },
            { text: 'State Inspection', figure: 'IrritationHazard', fill: 'yellow' }
          ]
        },
        {
          key: 7, question: 'Large',
          actions: [
            { text: 'SUV', figure: 'ElectricalHazard', fill: 'blue' },
            { text: 'Van', figure: 'FireHazard', fill: 'red' }
          ]
        },
        { key: 8, question: 'Maintenance' },
        { key: 9, question: 'Repairs' },
        { key: 10, question: 'State Inspection' },
        { key: 11, question: 'SUV' },
        { key: 12, question: 'Van' },
        { key: 15, category: 'Terminal', text: 'Steven' },
        { key: 16, category: 'Terminal', text: 'Tom' },
        { key: 17, category: 'Terminal', text: 'Emily' },
        { key: 18, category: 'Terminal', text: 'Tony' },
        { key: 19, category: 'Terminal', text: 'Ken' },
      ];
      const linkDataArray = [
        { from: 1, to: 2, answer: 1 },
        { from: 1, to: 3, answer: 2 },
        { from: 2, to: 7, answer: 3 },
        { from: 3, to: 8, answer: 1 },
        { from: 3, to: 9, answer: 2 },
        { from: 3, to: 10, answer: 3 },
        { from: 7, to: 11, answer: 1 },
        { from: 7, to: 12, answer: 2 },
        { from: 5, to: 13 },
        { from: 6, to: 14 },
        { from: 11, to: 15 },
        { from: 12, to: 16 },
        { from: 8, to: 17 },
        { from: 9, to: 18 },
        { from: 10, to: 19 },
      ];

      // create the Model with the above data, and assign to the Diagram
      this.diagram.model = $(go.GraphLinksModel,
        {
          copiesArrays: true,
          copiesArrayObjects: true,
          nodeDataArray: nodeDataArray,
          linkDataArray: linkDataArray
        });

    this.palette = new go.Palette();
    this.palette.nodeTemplateMap = this.diagram.nodeTemplateMap;

    // initialize contents of Palette
    this.palette.model.nodeDataArray =
      [
        { text: 'Alpha', color: 'lightblue' },
        { text: 'Beta', color: 'orange' },
        { text: 'Gamma', color: 'lightgreen' },
        { text: 'Delta', color: 'pink' },
        { text: 'Epsilon', color: 'yellow' }
      ];
  }

  ngOnInit() {
    this.diagram.div = this.diagramRef.nativeElement;
    this.palette.div = this.paletteRef.nativeElement;
  }
}
