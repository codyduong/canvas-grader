/**
 * University/School: University of Kansas (KU)
 * Description: General Physics I for Engineers (PHSX 210), General Physics I NP N LFE (PHSX 211), and/or Calculus Supplement to College Physics (PHSX 201)
 * Courses:
 *   PHSX 210
 *   PHSX 211
 *   PHSX 201
 */

/**
import { ParserReturn } from '../parser.types';

//This means it works on phsx classes, fix on case by case basis
const isPHSX = () =>
  document
    .getElementById('breadcrumbs')
    ?.getElementsByTagName('li')?.[1]
    .getElementsByTagName('span')?.[0]
    .innerText.split(':')[0]
    .split(' ')[0] == 'PHSX';

const cats = () => {
  
};

const kuPHSX: ParserReturn = {
  identifier: isPHSX,
  weighted: 'geometric',
  catergoriesAndWeights: cats,
};

export default kuPHSX;
 */
export {};
