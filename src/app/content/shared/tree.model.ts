import { Lookup, ModelQuery } from 'src/app/shared/common-entities.model';
import { Media } from './media.model';

export interface Tree {
    id: number;
    code: string;
    title: string;
    blocks: string;
    description: string;
    tags: string;
    status: string;
    languageId: number;
    language: Lookup;
    length: string;
    hasVoice: boolean;
    hasSms: boolean;
    startingNodeKey: string;
    nodes: any;
    connections: any;
    treeModel: any;
}

export interface ServerTree {
    id: number;
    code: string;
    title: string;
    blocks: string;
    description: string;
    tags: string;
    status: string;
    languageId: number;
    language: Lookup;
    length: string;
    hasVoice: boolean;
    hasSms: boolean;
    startingNodeKey: string;
    nodes: string;
    connections: string;
    treeModel: any;
}

export interface Connection {
    to: string;
    from: string;
    fromPort: string;
    toPort: string;
}

export interface BlockNode {
    type: string;
    custom:  any;
    key: string; // must be a globally unique and autogenerated field
    audio: Media;
    sms: string;
    tags:  Array<string>;
    isStartingNode: boolean;
    includeInSummary: boolean;
}

export interface Message {
    title:  string;
    repeat:  boolean; // Number of times to repeat 
    repeatKey:  string; // Key to press to repeat
    repeatDelay:  string; // Seconds before repeat
    repeatMax:  string; // Maximum number of times to repeat message
}

export interface Multichoice {
    choices: Array<Choice>; // Starts from 1
    choiceKeypresses: object; // {'1': '2'} // This represents the keys that should be pressed for which choice
    title:  string;
    branching:  boolean; // Not sure if this is neccessary 
    addExitForNoResponse:  boolean; // Decide whether to continue or end session if no valid response is given
    numChoices:  number;
    repeatKey:  number; // Key to press to repeat question
    repeatDelay:  number; // Seconds before repeat question
    repeatMax:  number; // Maximum number of times to repeat question
}

export interface Choice {
    key: number;
    value: string;
}

export interface Openended {
    title: string;
    isInputRequired:  boolean;
    maxOpenLength:  number; // Duration in minutes to record answer
    endRecordingDigits: string; // Key to press to end recording
    repeatKey:  number; // Key to press to repeat question
    repeatDelay:  number; // Seconds before repeat question
    repeatMax:  number; // Maximum number of times to repeat question
}

export interface Numeric {
    title:  string;
    maxDigitNumber:  number;
    repeatKey:  number; // Key to press to repeat question
    repeatDelay:  number; // Seconds before repeat question
    repeatMax:  number; // Maximum number of times to repeat question
}

export interface TreeQuery extends ModelQuery {
    id: number;
    code: string;
    title: string;
    description: string;
    tags: string;
    status: string;
    languageId: number;
}





