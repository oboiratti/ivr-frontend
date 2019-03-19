import { Lookup, ModelQuery } from 'src/app/shared/common-entities.model';

export interface Media {
    id: number;
    code: string;
    title: string;
    fileUrl: string;
    fileName: string;
    description: string;
    tags: string;
    status: string;
    type: string;
    languageId: number;
    language: Lookup;
    length: string;
    filePath: string;
    showPlay: boolean;
    showStop: boolean;
}

export interface MediaQuery extends ModelQuery {
    id: number;
    code: string;
    title: string;
    description: string;
    tags: string;
    status: string;
    type: string;
    languageId: number;
}
