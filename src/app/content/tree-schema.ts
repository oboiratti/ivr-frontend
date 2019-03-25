interface tree1 {
	id: string;
	versionId: string;
	title: string;
	description: string;
	language:  lookup;
	hasVoice: boolean;
	hasSms: boolean;
	startingNodeKey: string;
	nodes: Array<blockNode>;
	connections: Array<connection>;
}

interface connection {
	to: string;
	from: string;
}

interface blockNode {
  type: string;
  custom:  any;
  key: string; // must be a globally unique and autogenerated field
  audio: audio;
	sms: string;
	tags:  Array<string>;
	isStartingNode: boolean;
	includeInSummary: boolean;
}

interface message {
	title:  string;
	repeat:  boolean; // Number of times to repeat 
	repeatKey:  string; // Key to press to repeat
	repeatDelay:  string; // Seconds before repeat
	repeatMax:  string; // Maximum number of times to repeat message
}

interface multichoice {
	choices: Array<choice>; // Starts from 1
	choiceKeypresses: object; // {'1': '2'} // This represents the keys that should be pressed for which choice
	title:  string;
  branching:  boolean; // Not sure if this is neccessary 
  addExitForNoResponse:  boolean; // Decide whether to continue or end session if no valid response is given
  numChoices:  number;
	repeatKey:  number; // Key to press to repeat question
	repeatDelay:  number; // Seconds before repeat question
	repeatMax:  number; // Maximum number of times to repeat question
}

interface choice {
	key: number;
	value: string;
}

interface openended {
	title: string;
	isInputRequired:  boolean;
  maxOpenLength:  number; // Duration in minutes to record answer
  endRecordingDigits: string; // Key to press to end recording
  repeatKey:  number; // Key to press to repeat question
	repeatDelay:  number; // Seconds before repeat question
	repeatMax:  number; // Maximum number of times to repeat question
}

interface numeric {
	title:  string;
	maxDigitNumber:  number;
	repeatKey:  number; // Key to press to repeat question
	repeatDelay:  number; // Seconds before repeat question
	repeatMax:  number; // Maximum number of times to repeat question
}

interface multi_options {
  name: string;
  value: string;
}

interface lookup {
	id: string;
	name: string;
	description: string;
}

interface audio {
	id: string;
	name: string;
	url: string;
}

export{ numeric, openended, multichoice, message, blockNode, connection, tree1 , multi_options, lookup, audio , choice }



