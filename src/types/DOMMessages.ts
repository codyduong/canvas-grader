export type DOMMessage = {
  type: 'GET_DOM';
};

export type DOMMessageResponse = {
  assignments: {
    name: string;
    link: string;
    category: string;
    score: number | null;
    score_out_of: number | null;
  }[];
  categories: {
    name: string;
    weight: number | null;
  }[];
  isWeighted: boolean;
};

export type DOMMessageResponseUnion = DOMMessageResponse | false;
