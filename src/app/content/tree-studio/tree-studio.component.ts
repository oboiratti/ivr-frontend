import { Component, OnInit, ViewChild, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import * as go from 'gojs';
import { numeric, openended, multichoice, message, blockNode , connection, tree, multi_options, lookup, audio } from '../tree-schema';
import { Observable, Subscriber } from 'rxjs';
import { TreeConfig} from '../tree-config';


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
  private tree: tree;

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

  constructor() {
    this.loadTree();
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

    /*const nodeData = [
      { key: '1', mTitle: 'Welcome',color: 'white', category: 'Message'}, 
      { key: '2', mTitle: 'Multichoice',color: '#f8f9fa', category: 'Message'},
      { key: '3', mTitle: 'Go Home',color: 'orange', category: 'Message'},
      { key: '4', mTitle: 'Enter', color: 'orange', category: 'Message'},
      { key: '5', mTitle: 'Show us your ID', color: 'orange', category: 'Multi'}
    ]

    const linkData = [
      { from: '1', to: '2'},
      { from: '2', to: '3'},
      { from: '2', to: '4' },
      { from: '4', to: '5'},
    ]*/

    this.diagram.nodeTemplateMap.add(TreeConfig.nodeTypes.message,
      $(go.Node, 'Auto', { isShadowed: true, shadowBlur: 10, shadowOffset: new go.Point(3, 3), shadowColor: '#e8e8e8'},
        // First Rectangle
        $(go.Shape, 'Rectangle', {
          fill: '#f5f5f5', desiredSize: new go.Size(150, 100),
          stroke: '#aaa', strokeWidth: 1, portId: '1', cursor: 'pointer',
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
        $(go.Panel, 'Horizontal', { alignment: go.Spot.BottomLeft, stretch: go.GraphObject.Fill },
          new go.Binding('itemArray', 'childArray'), {
              itemTemplate: $(go.Panel,
              { _side: 'top', fromSpot: go.Spot.Top, toSpot: go.Spot.Top,
                fromLinkable: true, toLinkable: true, cursor: 'pointer'
              },
              new go.Binding('portId', 'portId'),
              $(go.Shape, 'Rectangle', {
                stroke: null, strokeWidth: 0,
                desiredSize: new go.Size(150, 20 ),
                margin: new go.Margin(0, 1)
              })
            )
          })
      ));

    this.diagram.linkTemplate = $(go.Link, {
          relinkableFrom: true,
          relinkableTo: true,
          curve: go.Link.JumpGap,
          reshapable: true,
          resegmentable: true,
          routing: go.Link.AvoidsNodes,
          corner: 10
        },
        new go.Binding('points').makeTwoWay(),
        $(go.Shape, { strokeWidth: 6, stroke: 'rgb(66, 139, 202)', strokeJoin: 'round'})
    );

    this.diagram.model = $(go.GraphLinksModel, {});
    // this.diagram.model.addNodeData(data);
  }

  addPort(key: string) {
    this.diagram.startTransaction('addPort');
    this.diagram.selection.each((node) => {
      // skip any selected Links
      if (!(node instanceof go.Node)) { return; }
      // compute the next available index number for the side
      let i = 0;
      while (node.findPort(key + i.toString()) !== node) { i++; }
      // now this new port name is unique within the whole Node because of the side prefix
      const name = i.toString();
      // get the Array of port data to be modified
      const arr = node.data['childArray'];
      if (arr) {
        // create a new port data object
        const newportdata = {
          portId: name
          // if you add port data properties here, you should copy them in copyPortData above
        };
        // and add it to the Array of port data
        this.diagram.model.insertArrayItem(arr, -1, newportdata);
      }
    });
    this.diagram.commitTransaction('addPort');
    console.log('Port Added ');
  }

  makePort(newlist:multi_options[]) {
    var size = 150/newlist.length;
    var panel: Array<go.Panel> = [];
    newlist.forEach((item,num)=>{
      var newpanel = this.$(go.Panel,'Auto',{},
        this.$(go.Shape, 'Rectangle',{ fill: '#9895953b', stretch: go.GraphObject.Fill, stroke: '#aaa', strokeWidth: 1, width:size}),
        this.$(go.TextBlock, { text: item.name, height:20, font: '10px bold sans-serif',textAlign: 'center', width:size }),
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

  isFirstNode() { // todo
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
        choices: [],
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
    this.addPort(newMulti.key);
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

  addMultichoice() {

  }

  addNumeric() {

  }

  addOpenEnded() {
  }

  saveTree() {
    this.file = this.diagram.model.toJson();
  }

  loadTree() {
    // This page only edits a tree. The tree should have been created before coming here. 
    const test_tree: tree = {
      id: '1',
      versionId: '',
      title: 'This is a test tree',
      description: 'This is a sample test description',
      language: {id: '1342', name: 'Twi', description: ''},
      hasVoice: true,
      hasSms: false,
      startingNodeKey: '',
      nodes: [],
      connections: []
    }
    this.tree = test_tree;
    // this.diagram.model = go.Model.fromJson(this.file)
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
  }
}
