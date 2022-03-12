import { ParserReturn } from '../chromeServices/parsers/parser.types';

export type DOMMessage = {
  type: 'GET_DOM';
  url: string;
};

export type DOMMessageResponse = {
  assignments: {
    name: string;
    link: string;
    category: string;
    score: number | null;
    score_out_of: number | null;
  }[];
  categories: ReturnType<ParserReturn['catergoriesAndWeights']>;
  weighted: ParserReturn['weighted'];
};

export type DOMMessageResponseUnion = DOMMessageResponse | false;
