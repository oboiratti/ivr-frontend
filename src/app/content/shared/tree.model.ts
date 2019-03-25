import { Lookup, ModelQuery } from 'src/app/shared/common-entities.model';

export interface Tree {
    id: number;
    code: string;
    title: string;
    blocks: string;
    nodes: string;
    description: string;
    tags: string;
    status: string;
    languageId: number;
    language: Lookup;
    length: string;
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
