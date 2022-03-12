import type {
  DOMMessage,
  DOMMessageResponse,
  DOMMessageResponseUnion,
} from '../types';
import UNIVERSITIES from './parsers/index';

//Because it's formatted either as a string, or -
const handleNumberAndDash = (string: string | undefined) => {
  const rm = string?.trim(); //remove whitespace
  if (!rm || rm == '-') {
    return null;
  } else {
    return Number(rm);
  }
};

const messagesFromReactAppListener = (
  msg: DOMMessage,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: DOMMessageResponseUnion) => void
) => {
  const domain = msg.url.split('/')[2];
  let categories: DOMMessageResponse['categories'] = [];

  const table = document.getElementById('grades_summary');
  if (!table) {
    sendResponse(false);
    return;
  }
  try {
    for (const university of UNIVERSITIES) {
      if (domain === university.domain) {
        for (const parser of university.parsers) {
          if (parser.identifier()) {
            categories = parser.catergoriesAndWeights();
          }
        }
      }
    }

    const tbody = table?.getElementsByTagName('tbody')[0];
    const rows = Array.from(tbody?.getElementsByTagName<'tr'>('tr') ?? []);
    const assignments: DOMMessageResponse['assignments'] = rows
      .filter((row) => {
        const isSubmission =
          row.id.split('_')[0] == 'submission' ? true : false;
        const hasNameAndLink = row
          .getElementsByClassName('title')[0]
          ?.getElementsByTagName<'a'>('a')[0];
        return isSubmission && hasNameAndLink;
      })
      .map((row) => {
        const title = row.getElementsByClassName('title')[0];
        const a = title.getElementsByTagName<'a'>('a')[0] as HTMLAnchorElement;
        const category = title.getElementsByTagName<'div'>('div')[0].innerText;
        //autofill missing assignments to 0 rather than null
        const missing = row.getElementsByClassName(
          'submission-missing-pill'
        )[0];

        if (categories.filter(({ name }) => name === category).length == 0) {
          categories.push({
            name: category,
            weight: -1,
          });
        }
        return {
          name: a.innerText,
          link: a.getAttribute('href') ?? '',
          category: category,
          score: missing
            ? handleNumberAndDash(
                row.getElementsByClassName('what_if_score')[0].innerHTML
              ) ?? 0
            : handleNumberAndDash(
                row.getElementsByClassName('what_if_score')[0].innerHTML
              ),
          score_out_of: handleNumberAndDash(
            row.getElementsByClassName('possible points_possible')[0].innerHTML
          ),
        };
      });

    //This is to distribute any weight equally to intentionally unassigned categories (-1) versus (0)
    const categoryCount = categories.length;
    categories.forEach((category, index) => {
      if (category.weight === -1) {
        categories[index] = { ...category, weight: 1 / categoryCount };
      }
    });

    const response: DOMMessageResponseUnion = {
      assignments: assignments,
      categories: categories,
      weighted: 'arithmetic',
    };

    sendResponse(response);
  } catch (e) {
    alert(e);
  }
};

/**
 * Fired when a message is sent from either an extension process or a content script.
 */
chrome.runtime.onMessage.addListener(messagesFromReactAppListener);
