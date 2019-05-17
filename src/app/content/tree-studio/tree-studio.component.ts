import * as go from 'gojs';
import { ActivatedRoute, Router } from '@angular/router';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  Renderer2
  } from '@angular/core';
import { GuidedDraggingTool } from 'gojs/extensionsTS/GuidedDraggingTool';
import { Lookup } from 'src/app/shared/common-entities.model';
import { Media, MediaQuery } from '../shared/media.model';
import { MediaService } from '../shared/media.service';
import { Observable, Subscription } from 'rxjs';
import { RouteNames } from 'src/app/shared/constants';
import { TreeConfig } from '../tree-config';
import { TreeService } from '../shared/tree.service';
import { BlockNode , Connection, Tree, Choice } from '../shared/tree.model';

// This requires us to include
// 'node_modules/gojs/extensionsTS/*'
// in the 'includes' list of this project's tsconfig.json

@Component({
  selector: 'app-tree-studio',
  templateUrl: './tree-studio.component.html',
  styleUrls: ['./tree-studio.component.scss']
})

export class TreeStudioComponent implements OnInit {

  private diagram: go.Diagram = new go.Diagram();
  private $: any;

  private phoneKeys: Array<string>;
  private repeatDelay: Array<string>;
  private repeatNumber: Array<string>;
  audioControl: any;
  languages: Observable<Lookup[]>;
  tags: Observable<Lookup[]>;
  audios: Array<Media>;
  tree: Tree;
  isEdit: boolean;
  hasSelected: boolean;
  isCurrentAudio = true;

  private currentNode: BlockNode;

  messageForm: boolean;
  multiForm: boolean;
  numericForm: boolean;
  openForm: boolean;
  treeForm: boolean;
  treeId: number;

  @BlockUI() blockUi: NgBlockUI;
  findSubscription: Subscription;
  deleteSubscription: Subscription;

  @ViewChild('diagramDiv')
  private diagramRef: ElementRef;

  @Input()
  get model(): go.Model { return this.diagram.model; }
  set model(val: go.Model) { this.diagram.model = val; }

  @Output()
  nodeSelected = new EventEmitter<go.Node|null>();

  @Output()
  modelChanged = new EventEmitter<go.ChangedEvent>();

  // Local Variables
  private file: string;

  constructor(private router: Router, private activatedRoute: ActivatedRoute,
    private treeService: TreeService, private mediaService: MediaService, renderer: Renderer2 ) {

    // Form init
    this.phoneKeys = TreeConfig.phoneKeys;
    this.repeatDelay = TreeConfig.repeatDelaySeconds;
    this.repeatNumber = TreeConfig.maxRepeatNumber;

    this.showForm('Treeform');
    this.$ = go.GraphObject.make;
    const $ = this.$;
    // Place GoJS license key here:
    // (go as any).licenseKey = '...'
    this.diagram = new go.Diagram();

    // DIAGRAM PROPERTIES
    this.diagram.allowDrop = true;
    this.diagram.undoManager.isEnabled = true;
    this.diagram.toolManager.draggingTool = new GuidedDraggingTool();
    this.diagram.toolManager.draggingTool.dragsTree = true;
    this.diagram.commandHandler.deletesTree = true;
    this.diagram.layout = $(go.TreeLayout, { angle: 90 });
    this.diagram.initialContentAlignment = go.Spot.TopCenter;

    // DIAGRAM EVENTS
    this.diagram.addDiagramListener('BackgroundSingleClicked', (e: go.DiagramEvent) => {
      this.showTreeForm();
    });

    this.diagram.addDiagramListener('ChangedSelection', (e: go.DiagramEvent)  => {
      const node = e.diagram.selection.first();
      console.log('Selected Node : ', node);
      if (node) {
        this.loadNode(node);
        this.showForm(node.category);
        this.nodeSelected.emit(node instanceof go.Node ? node : null);
        this.hasSelected = true;
      } else {
        this.hasSelected = false;
        this.showTreeForm();
      }
    });

    this.diagram.commandHandler.copySelection()

    this.diagram.addDiagramListener('ClipboardChanged', (e: go.DiagramEvent)  => {
      // const copiedNode = this.diagram.copyParts(go.Node, null, true).[0];
      console.log('Copied Nodes => ' )
    });

    this.diagram.addDiagramListener('ClipboardPasted', (e: go.DiagramEvent)  => {
      // const copiedNode = this.diagram.copyParts(go.Node, null, true).[0];
      // console.log('Pasted', e)
    });

    this.diagram.addDiagramListener('LinkDrawn', (e: go.DiagramEvent) => {
      // this.showTreeForm();
    })
    // this.diagram.addModelChangedListener(e => e.isTransactionFinished && this.modelChanged.emit(e));

    this.diagram.addModelChangedListener((evt) => {
      // ignore unimportant Transaction events
      if (!evt.isTransactionFinished) { return; }
      const txn = evt.object;  // a Transaction
      if (txn === null) { return; }
      // iterate over all of the actual ChangedEvents of the Transaction
      txn.changes.each((e: go.ChangedEvent) => {
        // ignore any kind of change other than adding/removing a node
        if (e.modelChange !== 'nodeDataArray') { return; }
        // record node insertions and removals
        if (e.change === go.ChangedEvent.Insert) {
          // TODO :Change event to before copy
          console.log(evt.propertyName + ' added node with key: ' + e.newValue);
          // let copied = e.newValue;
          // copied.key = this.generateNodeId();
        }

        if (e.change === go.ChangedEvent.Remove) {
          console.log(evt.propertyName + ' removed node with key: ' + e.oldValue.key);
          this.removeNode(e.oldValue.key);
        }
        console.log(this.tree);
      });
    });

    go.Shape.defineFigureGenerator('BottomLeftCorner', (shape, w, h) => {
      return new go.Geometry()
        .add(new go.PathFigure(0, 0, false)
        .add(new go.PathSegment(go.PathSegment.Line, w, 0))
        .add(new go.PathSegment(go.PathSegment.Line, 0, 0))
        .add(new go.PathSegment(go.PathSegment.Line, 0, h))
        .add(new go.PathSegment(go.PathSegment.Line, 0, h)));
    });

    // LINK TEMPLATE
    this.diagram.linkTemplate = $(go.Link, {
        relinkableFrom: true,
        relinkableTo: true,
        curve: go.Link.JumpGap,
        routing: go.Link.Orthogonal,
        reshapable: true,
        corner: 10
      },
      // new go.Binding('points').makeTwoWay(),
      $(go.Shape, { strokeWidth: 6, stroke: 'rgb(66, 139, 202)', strokeJoin: 'round'})
    );

    this.diagram.model = $(go.GraphLinksModel, {
      linkFromPortIdProperty: 'fromPort',  // required information:
      linkToPortIdProperty: 'toPort',
    });

    const deselectedColor = $( go.Brush, 'Linear', { 0.0: '#fff', 0.80: '#e7e7e7', 0.90: '#f5f5f5' })
    const selectedColor = $( go.Brush, 'Linear', { 0.0: '#531944', 0.90: '#240b1d'})

    // MESSAGE
    this.diagram.nodeTemplateMap.add(TreeConfig.nodeTypes.message,
      $(go.Node, 'Auto', { isShadowed: true, shadowBlur: 10, shadowOffset: new go.Point(3, 3), shadowColor: '#e8e8e8'},
        // First Rectangle
        $(go.Shape, 'Rectangle', { // fill: '#f5f5f5'
        fill: $(go.Brush, 'Linear', {
          0.0: '#fff', 0.80: '#e7e7e7', 0.90: '#f5f5f5'
        }), desiredSize: new go.Size(150, 100),
          stroke: '#aaa', strokeWidth: 1, cursor: 'pointer',
          // allow many kinds of links
          toLinkable: true, toLinkableDuplicates: false, toSpot: go.Spot.TopCenter
        }, new go.Binding('portId', 'toPortId')), /* {
          selectionChanged: function(part) {
              const shape = part.elt(0);
              shape.fill = part.isSelected ? selectedColor : deselectedColor;
            }
          },*/
        $(go.TextBlock,
          { margin: 4, text: 'Message', height: 15, textAlign: 'left', alignment: go.Spot.TopLeft,
            font: '9px Open Sans,Helvetica Neue,Helvetica,Arial,sans-serif'
          }),
        $(go.Panel, 'Vertical', { alignmentFocus: go.Spot.TopLeft, padding: 5 },
          $(go.TextBlock,
            { margin: 2, font: 'bold 11px Open Sans,Helvetica Neue,Helvetica,Arial,sans-serif', textAlign: 'left', height: 40,
              maxSize: new go.Size(150, 60), wrap: go.TextBlock.WrapFit
            }, new go.Binding('text', 'mTitle', (e: string ) => {
                let text = e;
                if ( text.length > 75) {
                  text = text.substring(0, 75).concat('...');
                }
                return text;
            }), /* {
              selectionChanged: function(part) {
                const shape = part.elt(0);
                shape.color = part.isSelected ? '#fff' : '#4f4f4f';
              }
            } */
          )
        ),
        $(go.Panel, 'Horizontal', { alignment: go.Spot.BottomLeft, stretch: go.GraphObject.Fill },
          $(go.Panel, 'Auto', { fromLinkable: true, fromLinkableDuplicates: false, fromSpot: go.Spot.BottomCenter },
            new go.Binding('portId', 'fromPortId'),
            $(go.Shape, 'Rectangle',
              { fill: '#e7e7e7',
                stretch: go.GraphObject.Fill, stroke: '#aaa', strokeWidth: 1, width: 150
            }),
            $(go.TextBlock,
              { text: '1', height: 13, textAlign: 'center', width: 150, margin: 5,
                font: '12px bold Open Sans,Helvetica Neue,Helvetica,Arial,sans-serif'
              }
            ),
          )
        )
      )
    );

    // OPEN-ENDED
    this.diagram.nodeTemplateMap.add(TreeConfig.nodeTypes.open,
      $(go.Node, 'Auto', { isShadowed: true, shadowBlur: 10, shadowOffset: new go.Point(3, 3), shadowColor: '#e8e8e8'},
        // First Rectangle
        $(go.Shape, 'Rectangle', {
          fill: $(go.Brush, 'Linear', {
            0.0: '#fff', 0.80: '#e7e7e7', 0.90: '#f5f5f5'
          }), desiredSize: new go.Size(150, 100),
          stroke: '#aaa', strokeWidth: 1, cursor: 'pointer',
          // allow many kinds of links
          toLinkable: true, toLinkableDuplicates: false, toSpot: go.Spot.TopCenter
        }, new go.Binding('portId', 'toPortId')),
        $(go.TextBlock,
          { margin: 4, text: 'Open-Ended', height: 15, textAlign: 'left', alignment: go.Spot.TopLeft,
            font: '9px Open Sans,Helvetica Neue,Helvetica,Arial,sans-serif'
          }),
        $(go.Panel, 'Vertical', { alignmentFocus: go.Spot.TopLeft, padding: 5 },
          $(go.TextBlock,
            { margin: 2, font: 'bold 11px Open Sans,Helvetica Neue,Helvetica,Arial,sans-serif', textAlign: 'left', height: 40,
              maxSize: new go.Size(150, 60), wrap: go.TextBlock.WrapFit
            }, new go.Binding('text', 'mTitle', (e: string ) => {
                let text = e;
                if ( text.length > 75) {
                  text = text.substring(0, 75).concat('...');
                }
                return text;
            })
          )
        ),
        $(go.Panel, 'Horizontal', { alignment: go.Spot.BottomLeft, stretch: go.GraphObject.Fill },
          $(go.Panel, 'Auto', { fromLinkable: true, fromLinkableDuplicates: false, fromSpot: go.Spot.BottomCenter },
            new go.Binding('portId', 'fromPortId'),
            $(go.Shape, 'Rectangle',
              { fill: '#e7e7e7',
                stretch: go.GraphObject.Fill, stroke: '#aaa', strokeWidth: 1, width: 150
            }),
            $(go.TextBlock,
              { text: '1', height: 13, textAlign: 'center', width: 150, margin: 5,
                font: '12px bold Open Sans,Helvetica Neue,Helvetica,Arial,sans-serif'
              }
            ),
          )
        )
      )
    );

    // NUMERIC
    this.diagram.nodeTemplateMap.add( TreeConfig.nodeTypes.numeric,
      $(go.Node, 'Auto', { isShadowed: true, shadowBlur: 10, shadowOffset: new go.Point(3, 3), shadowColor: '#e8e8e8'},
        // First Rectangle
        $(go.Shape, 'Rectangle', {
          fill: $(go.Brush, 'Linear', {
            0.0: '#fff', 0.80: '#e7e7e7', 0.90: '#f5f5f5'
          }), desiredSize: new go.Size(150, 100),
          stroke: '#aaa', strokeWidth: 1, cursor: 'pointer',
          // allow many kinds of links
          toLinkable: true, toLinkableDuplicates: false, toSpot: go.Spot.TopCenter
        }, new go.Binding('portId', 'toPortId')),
        $(go.TextBlock,
          { margin: 4, text: 'Numeric', height: 15, textAlign: 'left', alignment: go.Spot.TopLeft,
            font: '9px Open Sans,Helvetica Neue,Helvetica,Arial,sans-serif'
          }),
        $(go.Panel, 'Vertical', { alignmentFocus: go.Spot.TopLeft, padding: 5 },
          $(go.TextBlock,
            { margin: 2, font: 'bold 11px Open Sans,Helvetica Neue,Helvetica,Arial,sans-serif', textAlign: 'left', height: 40,
              maxSize: new go.Size(150, 60), wrap: go.TextBlock.WrapFit
            }, new go.Binding('text', 'mTitle', (e: string ) => {
                let text = e;
                if ( text.length > 75) {
                  text = text.substring(0, 75).concat('...');
                }
                return text;
            })
          )
        ),
        $(go.Panel, 'Horizontal', { alignment: go.Spot.BottomLeft, stretch: go.GraphObject.Fill },
          $(go.Panel, 'Auto', { fromLinkable: true, fromLinkableDuplicates: false, fromSpot: go.Spot.BottomCenter },
            new go.Binding('portId', 'fromPortId'),
            $(go.Shape, 'Rectangle',
              { fill: '#e7e7e7',
                stretch: go.GraphObject.Fill, stroke: '#aaa', strokeWidth: 1, width: 150
            }),
            $(go.TextBlock,
              { text: '1', height: 13, textAlign: 'center', width: 150, margin: 5,
                font: '12px bold Open Sans,Helvetica Neue,Helvetica,Arial,sans-serif'
              }
            ),
          )
        )
      )
    );

    // MULTICHOICE
    this.diagram.nodeTemplateMap.add(TreeConfig.nodeTypes.multichoice,
      $(go.Node, 'Auto', { isShadowed: true, shadowBlur: 10, shadowOffset: new go.Point(3, 3), shadowColor: '#e8e8e8'},
        // First Rectangle
        $(go.Shape, 'Rectangle', {
          fill: $(go.Brush, 'Linear', {
            0.0: '#fff', 0.80: '#e7e7e7', 0.90: '#f5f5f5'
          }), minSize: new go.Size(150, 100),
          stroke: '#aaa', strokeWidth: 1, cursor: 'pointer',
          // allow many kinds of links
          toLinkable: true, toLinkableDuplicates: false, toSpot: go.Spot.TopCenter
        }, new go.Binding('portId', 'toPortId')),
        $(go.TextBlock,
          { margin: 4, text: 'Multiple Choice', height: 15, textAlign: 'left', alignment: go.Spot.TopLeft,
            font: '9px Open Sans,Helvetica Neue,Helvetica,Arial,sans-serif'
          }),
        $(go.Panel, 'Vertical', { alignmentFocus: go.Spot.TopLeft, padding: 5 },
          $(go.TextBlock,
            { margin: 2, font: 'bold 11px Open Sans,Helvetica Neue,Helvetica,Arial,sans-serif', textAlign: 'left', height: 40,
              maxSize: new go.Size(150, 60), wrap: go.TextBlock.WrapFit
            }, new go.Binding('text', 'mTitle', (e: string ) => {
                let text = e;
                if ( text.length > 75) {
                  text = text.substring(0, 75).concat('...');
                }
                return text;
            }))
        ),
        $(go.Panel, 'Table',
          new go.Binding('itemArray', 'multiArray'),
          { alignment: go.Spot.BottomLeft,
            stretch: go.GraphObject.Fill,
            // defaultColumnSeparatorStroke: '#aaa',
            itemTemplate: $(go.Panel, 'TableColumn', {
                fromLinkable: true, fromLinkableDuplicates: false, fromSpot: go.Spot.BottomCenter, _side: 'bottom'
              }, new go.Binding('portId', 'multifromPortId'),
                $(go.Shape, 'Rectangle', { // BottomLeftCorner
                    fill: '#e7e7e7', stretch: go.GraphObject.Fill,
                    stroke: '#aaa', strokeWidth: 1,
                    cursor: 'pointer', height: 20, width: 50
                  }
                ),
                $(go.TextBlock, {
                  height: 13, textAlign: 'center', margin: 5,
                  font: 'bold 11px Open Sans,Helvetica Neue,Helvetica,Arial,sans-serif'},
                  new go.Binding('text', 'choice', (e: string ) => {
                      let text = e;
                      if ( text.length > 7) {
                        text = text.substring(0, 5).concat('..');
                      }
                      return text;
                  })
                )
              )
          }
        )
    ))
  }

  calculateHighestPossibleScore() {
    let score = 0;
    this.tree.nodes.forEach(node => {
      if (node.type === TreeConfig.nodeTypes.multichoice) {
        const weights = [];
        node.custom.choices.forEach(choice => {
          weights.push(choice.weight)
        });
        score = score + Math.max(...weights);
      }
    });
    this.tree.highestScore = score;
  }

  setHighestChoiceScore() {
    if (this.currentNode.type === TreeConfig.nodeTypes.multichoice) {
      const weights = [];
      this.currentNode.custom.choices.forEach(choice => {
        weights.push(choice.weight)
      });
      this.currentNode.custom.highestChoiceValue = Math.max(...weights)
    }
  }

  generateNodeId() {
    // Generate globally unique identifyer for node
    return this.tree.id + '_' + Math.random().toString(36).substr(2, 9);
  }

  isFirstNode() {
    return (this.tree.nodes.length > 0 || this.tree.nodes != null) ? false : true;
  }

  setDiagramToReadOnly(isReadOnly: boolean) {
    if (isReadOnly) {
      this.diagram.isEnabled = false;
      this.diagram.clearSelection();
      this.showTreeForm();
      this.isEdit = false;
    } else {
      this.diagram.isEnabled = true;
      this.isEdit = true;
    }
  }

  makeStartNode() {
    this.tree.nodes.filter(x => x.isStartingNode === true)[0].isStartingNode = false;
    this.tree.startingNodeKey = this.currentNode.key;
    this.currentNode.isStartingNode = true;
  }

  addMessage() {
    const newMessage: BlockNode = {
      type: TreeConfig.nodeTypes.message,
      key: this.generateNodeId(),
      custom: {
        title: 'New Message',
        repeat: false, // Number of times to repeat
        repeatKey: '2', // Key to press to repeat
        repeatDelay: '7',  // Seconds before repeat
        repeatMax: '3'
      },
      audio: null,
      sms: '',
      tags: [],
      isStartingNode: this.isFirstNode(),
      includeInSummary: false,
    };

    const nodeBlock = {
      key: newMessage.key, mTitle: newMessage.custom.title,
      category: TreeConfig.nodeTypes.message,
      toPortId: 'top_' + newMessage.key, fromPortId: 'bottom_' + newMessage.key
    };
    if (this.isFirstNode) { this.tree.startingNodeKey = newMessage.key; }
    this.tree.nodes.push(newMessage);
    this.diagram.model.addNodeData(nodeBlock);
  }

  addMultiChoice() {
    const newMulti: BlockNode = {
      type: TreeConfig.nodeTypes.multichoice,
      key: this.generateNodeId(),
      custom : {
        title: 'New Multichoice Question',
        repeatKey: '2', // Key to press to repeat
        repeatDelay: '7',  // Seconds before repeat
        repeatMax: '3',
        choices: [{key: 1, value: '', weight: 0 }],
        choiceKeypresses: {},
        branching: true,
        addExitForNoResponse : false
      },
      audio: null,
      sms: '',
      tags: [],
      isStartingNode: this.isFirstNode(),
      includeInSummary: false,
    };

    const nodeBlock = {
      key: newMulti.key, mTitle: newMulti.custom.title, category: TreeConfig.nodeTypes.multichoice,
      toPortId: 'top_' + newMulti.key,
      multiArray: []
    };

    if (this.isFirstNode) { this.tree.startingNodeKey = newMulti.key; }
    this.tree.nodes.push(newMulti);
    this.diagram.model.addNodeData(nodeBlock);
  }

  addChoice(i: number) {
    const num: number = this.currentNode.custom.choices.length;
    if (num === i ) {
      this.currentNode.custom.choices.push({ key: num + 1, value : '', weight: 0 });
      const name: number = num + 1;
      this.addPort(this.currentNode.key, this.currentNode.custom.choices[num - 1]);
    } else {
      // Check if this port exists
      const curChoice = this.currentNode.custom.choices[(i - 1)];
      const node = this.diagram.findNodeForKey(this.currentNode.key);
      const portId = 'bottom_' + this.currentNode.key + '_' + curChoice.key;
      const index = node.data.multiArray.findIndex(x => x.multifromPortId === portId);
      const nodedata = this.diagram.findNodeForKey(this.currentNode.key).data.multiArray[index];
      this.diagram.model.setDataProperty(nodedata, 'choice',  curChoice.value);
    }
  }

  removeChoice(i: number) {
    this.currentNode.custom.choices.splice(i, 1);
    const length = this.currentNode.custom.choices.length;
    this.currentNode.custom.choices[length - 1].key = length;
    const node: go.Node = this.diagram.findNodeForKey(this.currentNode.key);
    const portId = 'bottom_' + this.currentNode.key + '_' + this.currentNode.custom.choices[i].key;
    this.diagram.model.removeArrayItem(node.data.multiArray, node.data.multiArray.findIndex(x => x.multifromPortId === portId));
  }

  // ADD PORT
  private addPort(key: string, choice: Choice) {
    this.diagram.startTransaction('addPort');
    const node = this.diagram.findNodeForKey(key);
    if (!(node instanceof go.Node)) { return; }
    const portId = 'bottom_' + key + '_' + choice.key;
    // get the Array of port data to be modified
    const arr = node.data.multiArray;
    if (arr) {
      // create a new port data object
      const newportdata = {
        multifromPortId: portId,
        choice: choice.value
      };
      // and add it to the Array of port data
      this.diagram.model.insertArrayItem(arr, -1, newportdata);
    }
    this.diagram.commitTransaction('addPort');
    console.log('Port Added ');
  }

  addNumeric() {
    const newNumeric: BlockNode = {
      type: TreeConfig.nodeTypes.numeric,
      key: this.generateNodeId(),
      custom : {
        title: 'New Numeric Question',
        maxDigitNumber: '2', // Key to press to repeat
        repeatDelay: '7',  // Seconds before repeat
        repeatMax: '3',
      },
      audio: null,
      sms: '',
      tags: [],
      isStartingNode: this.isFirstNode(),
      includeInSummary: false,
    };

    const nodeBlock = {
      key: newNumeric.key, mTitle: newNumeric.custom.title, category: TreeConfig.nodeTypes.numeric,
      toPortId: 'top_' + newNumeric.key, fromPortId: 'bottom_' + newNumeric.key
    };
    if (this.isFirstNode) { this.tree.startingNodeKey = newNumeric.key; }
    this.tree.nodes.push(newNumeric);
    this.diagram.model.addNodeData(nodeBlock);
  }

  addOpenEnded() {
    const newNumeric: BlockNode = {
      type: TreeConfig.nodeTypes.open,
      key: this.generateNodeId(),
      custom : {
        title: 'New Open-ended Question',
        maxOpenLength: 3, // Key to press to repeat
        endRecordingDigits: '1',  // Seconds before repeat
        repeatDelay: 7,
        isInputRequired: true
      },
      audio: null,
      sms: '',
      tags: [],
      isStartingNode: this.isFirstNode(),
      includeInSummary: false,
    };

    const nodeBlock = {
      key: newNumeric.key, mTitle: newNumeric.custom.title, category: TreeConfig.nodeTypes.open,
      toPortId: 'top_' + newNumeric.key, fromPortId: 'bottom_' + newNumeric.key
    };

    if (this.isFirstNode) { this.tree.startingNodeKey = newNumeric.key; }
    this.tree.nodes.push(newNumeric);
    this.diagram.model.addNodeData(nodeBlock);
  }

  loadNode(node: go.Part) {
    if (!node) { return; }
    const selectedNodeData = node.data;
    if (!selectedNodeData.key) { return ; }
    this.currentNode = this.tree.nodes.filter(x => x.key === selectedNodeData.key)[0];
    this.isCurrentAudio = !this.isCurrentAudio;
  }

  resetAudioControl() {
    console.log('reseting audio in ' + this.currentNode.key)
    console.log(document)
    const audioControl: any = document.getElementById(this.currentNode.key);
    console.log(audioControl)
    if (audioControl) {
      audioControl.src = (this.currentNode.audio) ?  this.currentNode.audio.fileName : '';
    }
  }

  updateMessageTitle() {
    const nodedata = this.diagram.model.findNodeDataForKey(this.currentNode.key);
    if (nodedata) {
      this.diagram.model.setDataProperty(nodedata, 'mTitle', this.currentNode.custom.title);
    }
  }

  private removeNode(key: string) {
    const index = this.tree.nodes.findIndex(x => x.key === key)
    this.tree.nodes.splice(index, 1)
  }

  deleteNode() {
    if (this.currentNode == null) { return ; }
    const node = this.diagram.findNodeForKey(this.currentNode.key);
    if (node !== null) {
      this.diagram.startTransaction('deleting node => ' + this.currentNode.key);
      this.diagram.remove(node);
      this.diagram.commitTransaction('deleted node => ' + this.currentNode.key);
    }
  }

  copyNode() {
    // TODO :add copy code
    this.diagram.startTransaction('copynode(s)');
    this.diagram.commandHandler.copySelection()
    this.diagram.commitTransaction('copynode(s)');
    console.log('copy node')
  }

  private loadLanguages() {
    this.languages = this.mediaService.fetchLanguages();
  }

  private loadTags() {
    this.tags = this.mediaService.fetchTags();
  }

  saveTree() {
    this.blockUi.start('Loading...');
    const tosave = JSON.parse(JSON.stringify(this.tree)); // Do deep copy of tree object
    tosave.nodes = this.removeExtraChoices(tosave.nodes)
    tosave.nodes = (tosave.nodes === null) ? tosave.nodes = [] : JSON.stringify(tosave.nodes);
    tosave.treeModel = this.diagram.model.toJson();
    tosave.connections = this.getConnections(tosave.treeModel);
    this.findSubscription = this.treeService.saveNodes(tosave).subscribe(res => {
      this.blockUi.stop();
      if (res.success) { }
    }, () => this.blockUi.stop());
  }

  private addExtraChoices(nodes: Array<BlockNode>) {
    const newNodes: Array<BlockNode> = [];
    nodes.forEach((node, index, array) => {
      if ( node.type === TreeConfig.nodeTypes.multichoice) {
        node.custom.choices.push({key: node.custom.choices.length + 1, value: '', weight: 0 })
      }
      newNodes.push(node);
    });
    return newNodes;
  }

  private removeExtraChoices(nodes: Array<BlockNode>) {
    const newNodes: Array<BlockNode> = [];
    nodes.forEach((node, index, array) => {
      if ( node.type === TreeConfig.nodeTypes.multichoice) {
        node.custom.choices.splice(node.custom.choices.length - 1, 1)
      }
      newNodes.push(node);
    });
    return newNodes;
  }

  private getConnections(tree: any) {
    const obj = JSON.parse(tree);
    const arr = obj.linkDataArray;
    // this.processConnectionsForSave(arr);
    return JSON.stringify(arr);
  }

  private processConnectionsForSave(arr: Array<any>) {
    const nodes = this.tree.nodes;
    nodes.forEach((node: BlockNode) => {
      if (arr.findIndex(x => x.to === node.key) === -1) {
        console.log('First => ', node.custom.title);
      }
    });
  }

  private loadTree(id: number) {
    this.blockUi.start('Loading...');
    this.findSubscription = this.treeService.findTree(id).subscribe(res => {
      this.blockUi.stop();
      if (res.success) {
        const tree = res.data;
        tree.nodes = (tree.nodes === null) ? tree.nodes = [] : this.processNewTree(res.data.nodes);
        // tree.connections = (tree.connections === null) ? tree.connections = [] : this.processNewConnections(res.data.connections);
        if ( res.data.treeModel != null) {
          this.diagram.model = go.Model.fromJson(res.data.treeModel)
        }
        this.tree = tree;
        console.log('TREE => ', this.tree)
        this.loadAudios();
      }
    }, () => this.blockUi.stop());
  }

  private processNewTree(node: string): Array<BlockNode> {
    node = unescape(node);
    let nodes: Array<BlockNode>;
    nodes = (node == null) ? [] : JSON.parse(node);
    return this.addExtraChoices(nodes);
  }

  private processNewConnections(connection: string): Array<Connection> {
    connection = unescape(connection);
    let connections: Array<Connection>;
    connections = (connection == null) ? [] : JSON.parse(connection);
    return connections;
  }

  private loadAudios() {
    this.findSubscription = this.mediaService.queryMedia(<MediaQuery>{languageId: this.tree.language.id}).subscribe(res => {
      this.audios = res;
    });
  }

  // UTILITY FUNCTIONS
  // Show Forms

  showForm(type: string) {
    switch (type) {
      case 'Message':
        this.showMessageForm();
        break;
      case 'Openended':
        this.showOpenForm();
        break;
      case 'Multichoice':
        this.showMultiForm()
        break;
      case 'Treeform':
        this.showTreeForm();
        break;
      case 'Numeric':
        this.showNumericForm();
        break;
      default:
        this.showTreeForm();
        break;
    }
  }

  showMessageForm() {
    this.messageForm = true;
    this.openForm = false;
    this.multiForm = false;
    this.treeForm = false;
    this.numericForm = false;
  }

  showOpenForm() {
    this.messageForm = false;
    this.openForm = true;
    this.multiForm = false;
    this.treeForm = false;
    this.numericForm = false;
  }

  showMultiForm() {
    this.messageForm = false;
    this.openForm = false;
    this.multiForm = true;
    this.treeForm = false;
    this.numericForm = false;
  }

  showTreeForm() {
    this.messageForm = false;
    this.openForm = false;
    this.multiForm = false;
    this.treeForm = true;
    this.numericForm = false;
  }

  showNumericForm() {
    this.messageForm = false;
    this.openForm = false;
    this.multiForm = false;
    this.treeForm = false;
    this.numericForm = true;
  }

  ngOnInit() {
    this.diagram.div = this.diagramRef.nativeElement;
    this.loadLanguages();
    this.loadTags();
    this.setDiagramToReadOnly(true);

    const id = +this.activatedRoute.snapshot.paramMap.get('id');
    this.tree = <Tree>{};
    if (id) {
      this.treeId = id;
      this.loadTree(id);
    } else {
      this.router.navigateByUrl(`content/${RouteNames.treeList}`);
    }
  }

// tslint:disable-next-line: use-life-cycle-interface
  ngOnDestroy() {
    if (this.findSubscription) { this.findSubscription.unsubscribe(); }
  }
}
