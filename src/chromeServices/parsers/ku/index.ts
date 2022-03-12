import type { IndexReturn } from '../parser.types';
import kuMath from './kuMathDepartment';

const index: IndexReturn = {
  domain: 'canvas.ku.edu',
  parsers: [kuMath],
};

export default index;
