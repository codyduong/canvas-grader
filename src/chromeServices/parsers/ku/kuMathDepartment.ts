/**
 * University/School: University of Kansas (KU)
 * Description: All KU Math courses
 * Courses:
 *  Math 126,
 *  Math 127,
 *  Math ***,
 */

import type { ParserReturn } from '../parser.types';

//This means it works on math classes, fix on case by case basis
const isKuMath = () =>
  document
    .getElementById('breadcrumbs')
    ?.getElementsByTagName('li')?.[1]
    .getElementsByTagName('span')?.[0]
    .innerText.split(':')[0]
    .split(' ')[0] == 'MATH';

const cats = () => {
  const returnValue: ReturnType<ParserReturn['catergoriesAndWeights']> = [];
  for (const element of Array.from(
    document
      .getElementById('assignments-not-weighted')
      ?.getElementsByClassName('summary')?.[0]
      ?.getElementsByTagName('tbody')?.[0]
      .getElementsByTagName('tr') ?? []
  )) {
    const weight = element.getElementsByTagName('td')[0];
    const text = weight?.innerText ?? '';
    const strippedText = text.replace(/[^0-9.]+/g, '');
    const name = element.getElementsByTagName('th')[0]?.innerText;
    if (['total', 'group'].includes(name.toLowerCase())) {
      continue;
    }

    if (text.includes('%')) {
      returnValue.push({
        name,
        weight: Number(strippedText) * 0.01,
      });
    } else {
      returnValue.push({
        name,
        weight: Number(strippedText),
      });
    }
  }
  return returnValue;
};

const kuMath: ParserReturn = {
  identifier: isKuMath,
  weighted: 'arithmetic',
  catergoriesAndWeights: cats,
};

export default kuMath;
