import { Component, OnInit, ViewChild, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import * as go from 'gojs';
import { numeric, openended, multichoice, message, blockNode , connection, tree1, choice , multi_options, lookup, audio } from '../tree-schema';
import { Observable, Subscriber, Subscription } from 'rxjs';
import { TreeConfig} from '../tree-config';
import { TreeService } from '../shared/tree.service';
import { Tree, TreeQuery } from '../shared/tree.model';
import { finalize } from 'rxjs/operators';
import { MessageDialog } from 'src/app/shared/message_helper';
import { Lookup } from 'src/app/shared/common-entities.model';
import { ActivatedRoute, Router, Route } from '@angular/router';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { RouteNames } from 'src/app/shared/constants';


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
  private $: any;
  private tree: tree1;

  private phoneKeys: Array<string>;
  private repeatDelay: Array<string>;
  private repeatNumber: Array<string>;
  private languages: Array<lookup>;
  private tags: Array<lookup>;
  private audios: Array<audio>;

  private currentNode: blockNode;
  private multiNode: multichoice;
  private numericNode: numeric;
  private openNode: openended;


  private messageForm: boolean;
  private multiForm: boolean;
  private numericForm: boolean;
  private openForm: boolean;
  private treeForm: boolean;
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
  private optlist: multi_options[];

  constructor(private router: Router,
    private activatedRoute: ActivatedRoute,
    private treeService: TreeService ) {
    this.loadLanguages();
    this.loadTags();
    this.loadAudios();

    // Form init
    this.phoneKeys = TreeConfig.phoneKeys;
    this.repeatDelay = TreeConfig.repeatDelaySeconds;
    this.repeatNumber = TreeConfig.maxRepeatNumber;

    console.log(this.tree);
    this.showForm('Treeform');
    this.$ = go.GraphObject.make;
    const $ = this.$;
    // Place GoJS license key here:
    // (go as any).licenseKey = '...'
    this.diagram = new go.Diagram();
    this.optlist = [
        {name: 'yes', value: 'yes'},
        {name: 'no', value: 'no'},
        {name: 'may be', value: 'may be'}
    ];
    // DIAGRAM PROPERTIES
    this.diagram.initialContentAlignment = go.Spot.Center;
    this.diagram.allowDrop = true;
    this.diagram.undoManager.isEnabled = true;
    this.diagram.toolManager.draggingTool = new GuidedDraggingTool();
    this.diagram.toolManager.draggingTool.dragsTree = true;
    this.diagram.commandHandler.deletesTree = true;
    this.diagram.layout = $(go.TreeLayout, { angle: 90 });
    this.diagram.initialContentAlignment = go.Spot.TopLeft;

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
      }
    });
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
        //curve: go.Link.JumpGap,
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
          stroke: '#aaa', strokeWidth: 1, portId: 'largeRectPort', cursor: 'pointer',
          // allow many kinds of links
          toLinkable: true, toSpot: go.Spot.TopCenter
        }),
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
            }))
        ),
        $(go.Panel, 'Horizontal', { alignment: go.Spot.BottomLeft, stretch: go.GraphObject.Fill },
          $(go.Panel, 'Auto', {},
            $(go.Shape, 'Rectangle',// fill: '#9895953b'
              { fromLinkable: true, fromSpot: go.Spot.BottomCenter, fill: '#9895953b',
                stretch: go.GraphObject.Fill, stroke: '#aaa', strokeWidth: 1, width: 150,
                portId: 'bottomRectPort'
            }),
            $(go.TextBlock,
              { text: '1', height: 13, textAlign: 'center', width: 150, margin: 5,
                font: '12px bold Open Sans,Helvetica Neue,Helvetica,Arial,sans-serif'
              }),
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
          stroke: '#aaa', strokeWidth: 1, portId: '1', cursor: 'pointer',
          // allow many kinds of links
          toLinkable: true, toSpot: go.Spot.TopCenter
        }),
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
            }))
        ),
        $(go.Panel, 'Horizontal', { alignment: go.Spot.BottomLeft, stretch: go.GraphObject.Fill },
          $(go.Panel, 'Auto', {},
            $(go.Shape, 'Rectangle',
              { fromLinkable: true, fromSpot: go.Spot.BottomCenter, fill: '#9895953b',
                stretch: go.GraphObject.Fill, stroke: '#aaa', strokeWidth: 1, width: 150
            }, new go.Binding('portId', 'mPortId')),
            $(go.TextBlock,
              { text: '1', height: 13, textAlign: 'center', width: 150, margin: 5,
                font: '12px bold Open Sans,Helvetica Neue,Helvetica,Arial,sans-serif'
              }),
          )
        )
      )
    );

    // NUMERIC
    this.diagram.nodeTemplateMap.add(TreeConfig.nodeTypes.numeric,
      $(go.Node, 'Auto', { isShadowed: true, shadowBlur: 10, shadowOffset: new go.Point(3, 3), shadowColor: '#e8e8e8'},
        // First Rectangle
        $(go.Shape, 'Rectangle', {
          fill: '#f5f5f5', desiredSize: new go.Size(150, 100),
          stroke: '#aaa', strokeWidth: 1, portId: '1', cursor: 'pointer',
          // allow many kinds of links
          toLinkable: true, toSpot: go.Spot.TopCenter
        }),
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
            }))
        ),
        $(go.Panel, 'Horizontal', { alignment: go.Spot.BottomLeft, stretch: go.GraphObject.Fill },
          $(go.Panel, 'Auto', {},
            $(go.Shape, 'Rectangle',
              { fromLinkable: true, fromSpot: go.Spot.BottomCenter, fill: '#9895953b',
                stretch: go.GraphObject.Fill, stroke: '#aaa', strokeWidth: 1, width: 150
            }, new go.Binding('portId', 'mPortId')),
            $(go.TextBlock,
              { text: '1', height: 13, textAlign: 'center', width: 150, margin: 5,
                font: '12px bold Open Sans,Helvetica Neue,Helvetica,Arial,sans-serif'
              }),
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
          stroke: '#aaa', strokeWidth: 1, portId: '', cursor: 'pointer',
          // allow many kinds of links
          toLinkable: true, toSpot: go.Spot.TopCenter
        }),
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
        $(go.Panel, 'Horizontal', new go.Binding("itemArray", "bottomArray"), { alignment: go.Spot.BottomLeft, stretch: go.GraphObject.Fill,
          itemTemplate: $(go.Panel,'Auto',{},
            $(go.Shape, 'Rectangle',
              { 
                fill: '#9895953b', stretch: go.GraphObject.Fill, 
                stroke: '#aaa', strokeWidth: 1,
                cursor: "pointer",
                toLinkable: true, toSpot: go.Spot.BottomCenter,
                _side: "bottom",
              }, new go.Binding("portId", "portId"),
            ),
            $(go.TextBlock, { height:20, font: '10px bold sans-serif',textAlign: 'center' }, new go.Binding('text','choice'))
          )
        }
      )
    ))
  }

  // ADD PORT
  addPort(key: string,choice:string) {
    this.diagram.startTransaction('addPort');
    let node = this.diagram.findNodeForKey(key);
    if (!(node instanceof go.Node)) { return; }
    // compute the next available index number for the side
    let i = 0;
    console.log('Port node', node)
    //while (node.findPort('choice' + i.toString()) !== node) { i++; }
    // now this new port name is unique within the whole Node because of the side prefix
    const name = key+i.toString();
    // get the Array of port data to be modified
    const arr = node.data['childArray'];
    if (arr) {
      // create a new port data object
      const newportdata = {
        portId: name,
        choice: choice
      };
      // and add it to the Array of port data
      this.diagram.model.insertArrayItem(arr, -1, newportdata);
    }
    this.diagram.commitTransaction('addPort');
    console.log('Port Added ');
  }

  makePort(nodeKey:string, choicekey:string) {
    let choices = this.currentNode.custom.choices;
    let node = this.diagram.findNodeForKey(nodeKey);
    node
    let size = 150/ choices.length;
    let panel: Array<go.Panel> = [];
    choices.forEach((item,num)=>{
      var newpanel = this.$(go.Panel,'Auto',{},
        this.$(go.Shape, 'Rectangle',
          { 
            fill: '#9895953b', stretch: go.GraphObject.Fill, 
            stroke: '#aaa', strokeWidth: 1, width:size,
            portId: this.currentNode.key + num,
            toLinkable: true, toSpot: go.Spot.BottomCenter
          }),
        this.$(go.TextBlock, { text: item.value, height:20, font: '10px bold sans-serif',textAlign: 'center', width:size }),
      )
      panel.push()
    })
    console.log(panel)
    return panel;
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

  addMessage() {
    const newMessage: blockNode = {
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

    const nodeBlock = { key: newMessage.key, mTitle: newMessage.custom.title, category: TreeConfig.nodeTypes.message };
    if (this.isFirstNode) { this.tree.startingNodeKey = newMessage.key; }
    this.tree.nodes.push(newMessage);
    this.diagram.model.addNodeData(nodeBlock);
  }

  addMultiChoice() {
    const newMulti: blockNode = {
      type: TreeConfig.nodeTypes.multichoice,
      key: this.generateNodeId(),
      custom : {
        title: 'New Multichoice Question',
        repeatKey: '2', // Key to press to repeat
        repeatDelay: '7',  // Seconds before repeat
        repeatMax: '3',
        choices: [{key: 1, value: '' }],
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

    const nodeBlock = { key: newMulti.key, mTitle: newMulti.custom.title, category: TreeConfig.nodeTypes.multichoice };
    if (this.isFirstNode) { this.tree.startingNodeKey = newMulti.key; }
    this.tree.nodes.push(newMulti);
    this.diagram.model.addNodeData(nodeBlock);
    //let newNode = this.diagram.findNodeForKey(newMulti.key)
    this.addPort(newMulti.key, "1");
  }

  addNumeric() {
    const newNumeric: blockNode = {
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

    const nodeBlock = { key: newNumeric.key, mTitle: newNumeric.custom.title, category: TreeConfig.nodeTypes.numeric };
    if (this.isFirstNode) { this.tree.startingNodeKey = newNumeric.key; }
    this.tree.nodes.push(newNumeric);
    this.diagram.model.addNodeData(nodeBlock);
  }

  addOpenEnded() {
    const newNumeric: blockNode = {
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

    const nodeBlock = { key: newNumeric.key, mTitle: newNumeric.custom.title, category: TreeConfig.nodeTypes.open };
    if (this.isFirstNode) { this.tree.startingNodeKey = newNumeric.key; }
    this.tree.nodes.push(newNumeric);
    this.diagram.model.addNodeData(nodeBlock);
  }

  loadNode(node: go.Part) {
    const selectedNodeData = node.data;
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

  addChoice(i: number) {
    let num: number = this.currentNode.custom.choices.length;
    if (num == i ) { 
      this.currentNode.custom.choices.push({ key: num + 1, value : '' }); 
      let name = num + 1;
      this.addPort(this.currentNode.key, name.toString());
    }
    //;
  }


  deleteNode() {

  }


  copyNode() {

  }

  loadLanguages() {
    this.languages = [
      {id: '1342', name: 'Twi', description: ''},
      {id: '2342', name: 'English', description: ''},
      {id: '3342', name: 'French', description: ''},
      {id: '4342', name: 'Ga', description: ''}
    ];
  }

  loadTags() {
    this.tags = [
      {id: '1', name: 'Good Farmers', description: ''},
      {id: '2', name: 'English Speakers', description: ''},
      {id: '3', name: 'Good', description: ''},
      {id: '4', name: 'Follow up', description: ''}
    ];
  }

  loadAudios() {
    this.audios = [
      {id: '1', name: 'Welcome Farmers', url: 'https://go.votomobile.org/audiofiles/play/593e90d3bdecc2.62935054/ogg'},
      {id: '2', name: 'How many workers do you have', url: 'https://go.votomobile.org/audiofiles/play/593e90d3bdecc2.62935054/ogg'},
      {id: '3', name: 'Do you use fertilizer', url: 'https://go.votomobile.org/audiofiles/play/593e90d3bdecc2.62935054/ogg'},
      {id: '4', name: 'What is the size of your farm', url: 'https://go.votomobile.org/audiofiles/play/593e90d3bdecc2.62935054/ogg'}
    ];
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
    this.findSubscription = this.treeService.saveTree1(this.tree).subscribe(res => {
      this.blockUi.stop();
      if (res.success) {
        this.tree = res.data;
      }
    }, () => this.blockUi.stop());
  }

  loadTree(id:number) {
    this.blockUi.start('Loading...');
    this.findSubscription = this.treeService.findTree1(id).subscribe(res => {
      this.blockUi.stop();
      if (res.success) {
        this.tree = res.data;
      }
    }, () => this.blockUi.stop());
    // this.diagram.model = go.Model.fromJson(this.file)
  }

  ngOnInit() {
    this.diagram.div = this.diagramRef.nativeElement;

    const id = +this.activatedRoute.snapshot.paramMap.get('id');

    this.tree = <tree1>{};
    if (id) {
      this.treeId = id;
      this.loadTree(id);
    } else {
      this.router.navigateByUrl(`content/${RouteNames.treeList}`);
    }
  }
}
