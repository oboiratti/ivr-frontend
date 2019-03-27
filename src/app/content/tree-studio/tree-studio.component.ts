import * as go from 'gojs';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild
  } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { GuidedDraggingTool } from 'gojs/extensionsTS/GuidedDraggingTool';
import { Lookup } from 'src/app/shared/common-entities.model';
import { Media, MediaQuery } from '../shared/media.model';
import { MediaService } from '../shared/media.service';
import { MessageDialog } from 'src/app/shared/message_helper';
import { Observable, Subscriber, Subscription } from 'rxjs';
import { RouteNames } from 'src/app/shared/constants';
import { TreeConfig } from '../tree-config';
import { TreeService } from '../shared/tree.service';
import { Numeric, Openended, Multichoice, Message, BlockNode , Connection, Tree, Choice } from '../shared/tree.model';

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
  private palette: go.Palette = new go.Palette();
  private $: any;
  private tree: Tree;

  private phoneKeys: Array<string>;
  private repeatDelay: Array<string>;
  private repeatNumber: Array<string>;
  languages: Observable<Lookup[]>;
  tags: Observable<Lookup[]>;

  private audios: Array<Media>;

  private currentNode: BlockNode;
  private multiNode: Multichoice;
  private numericNode: Numeric;
  private openNode: Openended;

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

  @ViewChild('SaveButton')
  private SaveButton: ElementRef;

  // @ViewChild('paletteDiv')
  // private paletteRef: ElementRef;

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
    private treeService: TreeService, private mediaService: MediaService ) {

    window.tree = this.tree;
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
      }else{
        this.showTreeForm();
      }
    });

    this.diagram.addDiagramListener('ChangingSelection', (e: go.DiagramEvent)  => {
      //this.showTreeForm();
    });

    this.diagram.addDiagramListener('LinkDrawn', (e: go.DiagramEvent) => {
      //this.showTreeForm();
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
          console.log(evt.propertyName + ' added node with key: ' + e.newValue.key);
        } else if (e.change === go.ChangedEvent.Remove) {
          console.log(evt.propertyName + ' removed node with key: ' + e.oldValue.key);
        }
        console.log(this.tree);
      });
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
      linkFromPortIdProperty: "fromPort",  // required information:
      linkToPortIdProperty: "toPort",
    });

    // MESSAGE
    this.diagram.nodeTemplateMap.add(TreeConfig.nodeTypes.message,
      $(go.Node, 'Auto', { isShadowed: true, shadowBlur: 10, shadowOffset: new go.Point(3, 3), shadowColor: '#e8e8e8'},
        // First Rectangle
        $(go.Shape, 'Rectangle', { // fill: '#f5f5f5'
          fill: '#f5f5f5', desiredSize: new go.Size(150, 100),
          stroke: '#aaa', strokeWidth: 1, cursor: 'pointer',
          // allow many kinds of links
          toLinkable: true, toLinkableDuplicates:false, toSpot: go.Spot.TopCenter
        }, new go.Binding('portId','toPortId')),
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
            })
          )
        ),
        $(go.Panel, 'Horizontal', { alignment: go.Spot.BottomLeft, stretch: go.GraphObject.Fill },
          $(go.Panel, 'Auto', { fromLinkable: true, fromLinkableDuplicates:false, fromSpot: go.Spot.BottomCenter }, 
            new go.Binding('portId', 'fromPortId'),
            $(go.Shape, 'Rectangle',
              { fill: '#9895953b',
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
          fill: '#f5f5f5', desiredSize: new go.Size(150, 100),
          stroke: '#aaa', strokeWidth: 1, cursor: 'pointer',
          // allow many kinds of links
          toLinkable: true, toLinkableDuplicates:false, toSpot: go.Spot.TopCenter
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
          $(go.Panel, 'Auto', { fromLinkable: true, fromLinkableDuplicates:false, fromSpot: go.Spot.BottomCenter }, 
            new go.Binding('portId', 'fromPortId'),
            $(go.Shape, 'Rectangle',
              { fill: '#9895953b',
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
          fill: '#f5f5f5', desiredSize: new go.Size(150, 100),
          stroke: '#aaa', strokeWidth: 1, cursor: 'pointer',
          // allow many kinds of links
          toLinkable: true, toLinkableDuplicates:false, toSpot: go.Spot.TopCenter
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
          $(go.Panel, 'Auto', { fromLinkable: true, fromLinkableDuplicates:false, fromSpot: go.Spot.BottomCenter }, 
            new go.Binding('portId', 'fromPortId'),
            $(go.Shape, 'Rectangle',
              { fill: '#9895953b',
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
          fill: '#f5f5f5', desiredSize: new go.Size(150, 100),
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
        $(go.Panel, 'Horizontal',
          new go.Binding("itemArray", "multiArray"),
          { alignment: go.Spot.BottomLeft, stretch: go.GraphObject.Fill,
          itemTemplate: $(go.Panel,{
            fromLinkable: true, fromLinkableDuplicates:false, fromSpot: go.Spot.BottomCenter,_side: "bottom"
          }, new go.Binding("portId", "multifromPortId"),
            $(go.Shape, 'Rectangle',{ 
                fill: '#9895953b', stretch: go.GraphObject.Fill, 
                stroke: '#aaa', strokeWidth: 1,
                cursor: "pointer", desiredSize: new go.Size(50,20)
              }
            ),
            $(go.TextBlock, { height: 13, textAlign: 'center', margin: 5,
            font: '12px bold Open Sans,Helvetica Neue,Helvetica,Arial,sans-serif'}, new go.Binding('text','choice'))
          )
        }
      )
    ))
  }

  generateNodeId() {
    // Generate globally unique identifyer for node
    return this.tree.id + '_' + Math.random().toString(36).substr(2, 9);
  }

  isFirstNode() {
    return (this.tree.nodes.length > 0) ? false : true;
  }

  makeStartNode() {
    this.tree.nodes.filter(x => x.isStartingNode === true)[0].isStartingNode = false;
    this.tree.startingNodeKey = this.currentNode.key;
    this.currentNode.isStartingNode = true;
  }

  private addMessage() {
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
      toPortId:'top_' + newMessage.key, fromPortId:'bottom_' + newMessage.key
    };
    if (this.isFirstNode) { this.tree.startingNodeKey = newMessage.key; }
    this.tree.nodes.push(newMessage);
    this.diagram.model.addNodeData(nodeBlock);
  }

  private addMultiChoice() {
    const newMulti: BlockNode = {
      type: TreeConfig.nodeTypes.multichoice,
      key: this.generateNodeId(),
      custom : {
        title: 'New Multichoice Question',
        repeatKey: '2', // Key to press to repeat
        repeatDelay: '7',  // Seconds before repeat
        repeatMax: '3',
        choices: [{key: 1, value: '1'}],
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
      toPortId:'top_' + newMulti.key, 
      multiArray:[
        
      ]
    };

    if (this.isFirstNode) { this.tree.startingNodeKey = newMulti.key; }
    this.tree.nodes.push(newMulti);
    this.diagram.model.addNodeData(nodeBlock);
  }

  addChoice(i: number) {
    const num: number = this.currentNode.custom.choices.length;
    console.log(" I => ", i)
    console.log(" NUM => ", num)
    if (num === i ) {
      this.currentNode.custom.choices.push({ key: num + 1, value : '' }); 
      const name: number = num + 1;
      this.addPort(this.currentNode.key, this.currentNode.custom.choices[num-1]);
    }else{
      // Check if this port exists
      let curChoice = this.currentNode.custom.choices[i];
      let node = this.diagram.findNodeForKey(this.currentNode.key);
      console.log("Choice Node =>", node)
      const portId = 'bottom_' + this.currentNode.key + '_' + curChoice.key;
      console.log("ReconstructedPortId =>", portId)
      const arr = node.data.multiArray.filter(x => x.multifromPortId === portId)[0];
      
    }
  }
   // ADD PORT
  private addPort(key: string,choice:Choice) {
    this.diagram.startTransaction('addPort');
    let node = this.diagram.findNodeForKey(key);
    if (!(node instanceof go.Node)) { return; }
    console.log('Port node', node)
    const portId = 'bottom_' + key + '_' + choice.key;
    // get the Array of port data to be modified
    const arr = node.data.multiArray;

    console.log('TEST', arr.filter(x => x.multifromPortId === portId) != [])
    console.log("Arr =>", arr);
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
      toPortId:'top_' + newNumeric.key, fromPortId:'bottom_' + newNumeric.key 
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
        isInputRequired:true
      },
      audio: null,
      sms: '',
      tags: [],
      isStartingNode: this.isFirstNode(),
      includeInSummary: false,
    };

    const nodeBlock = { 
      key: newNumeric.key, mTitle: newNumeric.custom.title, category: TreeConfig.nodeTypes.open,
      toPortId:'top_' + newNumeric.key, fromPortId:'bottom_' + newNumeric.key
    };
    if (this.isFirstNode) { this.tree.startingNodeKey = newNumeric.key; }
    this.tree.nodes.push(newNumeric);
    this.diagram.model.addNodeData(nodeBlock);
  }

  loadNode(node: go.Part) {
    if(!node) return;
    const selectedNodeData = node.data;
    if(!selectedNodeData.key) return ;
    this.currentNode = this.tree.nodes.filter(x => x.key === selectedNodeData.key)[0];
    this.showForm(this.currentNode.key);
    console.log('Current Node', this.currentNode);
  }

  updateMessageTitle() {
    const nodedata = this.diagram.model.findNodeDataForKey(this.currentNode.key);
    if (nodedata) {
      this.diagram.model.setDataProperty(nodedata, 'mTitle', this.currentNode.custom.title);
    }
  }

  deleteNode() {

  }

  copyNode() {

  }

  private loadLanguages() {
    this.languages = this.mediaService.fetchLanguages();
  }

  private loadTags() {
    this.tags = this.mediaService.fetchTags();
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

  saveTree() {
    this.blockUi.start('Loading...');
    this.findSubscription = this.treeService.saveTree(this.tree).subscribe(res => {
      this.blockUi.stop();
      if (res.success) {
        this.tree = res.data;
      }
    }, () => this.blockUi.stop());
  }

  private loadTree(id: number) {
    this.blockUi.start('Loading...');
    this.findSubscription = this.treeService.findTree(id).subscribe(res => {
      this.blockUi.stop();
      if (res.success) {
        let tree = res.data;
        tree.nodes =  this.processNewTree(res.data.nodes);
        this.tree = tree;
        console.log('Tree => ', this.tree)
        this.loadAudios();
      }
    }, () => this.blockUi.stop());
    // this.diagram.model = go.Model.fromJson(this.file)
  }

  private processNewTree(node:string): Array<BlockNode> {
    let nodes: Array<BlockNode>;
    nodes = (node == null) ? [] : JSON.parse(node) ;
    return nodes;
  }

  private loadAudios() {
    this.findSubscription = this.mediaService.queryMedia(<MediaQuery>{languageId: this.tree.language.id}).subscribe(res => {
        this.audios = res;
    });
  }

  ngOnInit() {
    this.diagram.div = this.diagramRef.nativeElement;
    
    this.loadLanguages();
    this.loadTags();

    const id = +this.activatedRoute.snapshot.paramMap.get('id');
    this.tree = <Tree>{};
    if (id) {
      this.treeId = id;
      this.loadTree(id);
    } else {
      this.router.navigateByUrl(`content/${RouteNames.treeList}`);
    }
  }

  ngOnDestroy() {
    if (this.findSubscription) { this.findSubscription.unsubscribe(); }
  }

}
