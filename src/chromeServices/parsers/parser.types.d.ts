type categories = Array<{
  name: string;
  weight: number | null;
}>;

export type ParserReturn = {
  identifier: () => boolean;
  weighted: 'arithmetic' | 'geometric' | 'none' | false;
  catergoriesAndWeights: () => categories;
};

export type IndexReturn = {
  domain: string;
  parsers: ParserReturn[];
};
