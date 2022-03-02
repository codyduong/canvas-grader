import React, { useEffect, useState } from 'react';
import './App.css';
import {
  DOMMessage,
  DOMMessageResponse,
  DOMMessageResponseUnion,
} from './types';
import { ReactComponent as CloseIcon } from './svg/close_black_24dp.svg';
import styled from 'styled-components';

const round = (number: number, precision1 = 2, precision2 = precision1) => {
  //@ts-expect-error: this is a valid number
  return +(Math.round(number + `e+${precision1}`) + `e-${precision2}`);
};

const navigateQuery = async (link: string) => {
  await chrome.tabs.update({ url: link });
};

const mapResponse = (
  response: DOMMessageResponse,
  url: string,
  cpt: string[],
  gradedCpt: string[]
): JSX.Element[] => {
  const urlSplit = url.split('/');
  const urlBase = `${urlSplit[0]}//${urlSplit[2]}`;

  return response.assignments.map((assign, index) => {
    const score = typeof assign.score !== 'object' ? round(assign.score) : '-';
    const scoreOutOf =
      typeof assign.score_out_of !== 'object'
        ? round(assign.score_out_of)
        : '-';
    // const percent =
    //   assign.score !== null && assign.score_out_of !== null
    //     ? //@ts-expect-error: this is a valid number
    //       `${Math.round(assign.score / assign.score_out_of + 'e+2')}%`
    //     : '-';
    return (
      <tr key={`assignment-${assign.name}`} className={'assignment'}>
        <th className="assignment-title">
          <a
            href={`${urlBase}${assign.link}`}
            onClick={() => navigateQuery(`${urlBase}${assign.link}`)}
            className="assignment-link"
          >
            {assign.name}
          </a>
          <span>{assign.category}</span>
        </th>
        <td>{score}</td>
        <td>{scoreOutOf}</td>
        {/* <td>{percent}</td> */}
        <td>{cpt[index]}</td>
        <td>{gradedCpt[index]}</td>
      </tr>
    );
  });
};

const CatName = styled.td`
  padding: 0.25rem 0px;
`;

const CatWeight = styled.td`
  padding: 0.25rem 0px 0.25rem 0.5rem;
`;

const Tooltip = styled.span`
  visibility: hidden;
  text-align: center;
  padding: 0.25rem;
  position: absolute;
  z-index: 100;
  background-color: #2d3b45;
  border-radius: 5px;
  color: #ffffff;
  right: 0%;
  bottom: 9.375rem;
  &:hover {
    visibility: visible;
  }
`;

const mapCategories = (response: DOMMessageResponse): JSX.Element[] => {
  return response.categories.map((cat) => {
    const catPercentage = cat.weight ? round(cat.weight * 100) : '0';
    return (
      <tr key={`category-${cat.name}`}>
        <CatName>{cat.name}</CatName>
        <CatWeight title={'Set a different weight'}>
          {`${catPercentage}%`}
          <Tooltip>Set a different weight</Tooltip>
        </CatWeight>
      </tr>
    );
  });
};

const Button = styled.button`
  aspect-ratio: 1;
  min-width: 2em;
  border-radius: 50%;
  background-color: hsla(0, 0%, 0%, 0.125);
  padding: auto auto;
  border-width: 0;
  &:hover {
    background-color: hsla(0, 0%, 0%, 0.25);
    cursor: pointer;
  }
  margin-left: 0.25rem;
`;

const SideBar = styled.div`
  padding: 0rem 1rem;
  text-align: left;
`;

const OverallGrade = styled.div`
  margin-top: 0.5rem;
  display: flex;
  flex-flow: column nowrap;
  background-color: #08345c;
  color: #ffffff;
  border-radius: 1rem;
  padding-bottom: 0.5rem;
`;

const GradeDiv = styled.div`
  display: flex;
  flex-flow: column nowrap;
  padding-top: 0.5rem;
  text-align: center;
  > span {
    font-weight: bold;
  }
`;

function App() {
  const [response, setResponse] = useState<DOMMessageResponse>();

  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  //This is overall grade, including nongraded assignments
  const [grade, setGrade] = useState('');
  //only graded assingments
  const [gradeGradedOnly, sGGO] = useState('');

  //this string array should always be in the same order as the response.assignments
  //cpt is currentPercentageProportion or overall ratio of assignment grade including ungraded.
  const [cpt, setCPT] = useState<string[]>([]);
  //this only calculates cpt using graded assignments
  const [gradedCpt, setGradedCpt] = useState<string[]>([]);

  useEffect(() => {
    /**
     * We can't use "chrome.runtime.sendMessage" for sending messages from React.
     * For sending messages from React we need to specify which tab to send it to.
     */
    chrome.tabs &&
      chrome.tabs.query(
        {
          active: true,
          currentWindow: true,
        },
        (tabs) => {
          /**
           * Sends a single message to the content script(s) in the specified tab,
           * with an optional callback to run when a response is sent back.
           *
           * The runtime.onMessage event is fired in each content script running
           * in the specified tab for the current extension.
           */
          if (tabs[0].url?.includes('canvas')) {
            setUrl(tabs[0].url);
            chrome.tabs.sendMessage(
              tabs[0].id || 0,
              { type: 'GET_DOM' } as DOMMessage,
              (response: DOMMessageResponseUnion) => {
                if (response) {
                  console.log(response);
                  setResponse(response);
                }
              }
            );
          }
        }
      );
  }, []);
  useEffect(() => {
    const catsAndScores: Record<
      string,
      {
        score: number;
        score_out_of: number;
        score_out_of_graded: number; //doesn't unclude ungraded assignments
        weight: number;
      }
    > = {};
    let grade = 0; //includes ungraded
    let maxGrade = 0;
    let gradeGradedOnly = 0;
    if (response) {
      for (const assignment of response.assignments) {
        if (catsAndScores[assignment.category]) {
          if (assignment.score !== null && assignment.score_out_of !== null) {
            catsAndScores[assignment.category].score_out_of_graded +=
              assignment.score_out_of;
          }
          if (typeof assignment.score != 'object') {
            catsAndScores[assignment.category].score += assignment.score;
          }
          if (typeof assignment.score_out_of != 'object') {
            catsAndScores[assignment.category].score_out_of +=
              assignment.score_out_of;
          }
        } else {
          catsAndScores[assignment.category] = {
            weight: 0,
            score: assignment.score ?? 0,
            score_out_of: assignment.score_out_of ?? 0,
            score_out_of_graded: assignment.score_out_of ?? 0,
          };
        }
      }

      //this is overall grade, including ungraded assignments
      for (const cat of response.categories) {
        if (cat.weight) {
          const currentCat = catsAndScores[cat.name];
          if (currentCat) {
            currentCat.weight = cat.weight;
            grade += (currentCat.score / currentCat.score_out_of) * cat.weight;
            maxGrade += cat.weight;
            gradeGradedOnly +=
              (currentCat.score / currentCat.score_out_of_graded) * cat.weight;
          }
        }
      }

      //go thru assignments again to calculate CPT and other
      for (const assignment of response.assignments) {
        const currentCat = catsAndScores[assignment.category];
        if (currentCat) {
          setCPT((cpt) => [
            ...cpt,
            `${
              typeof assignment.score == 'number'
                ? round(
                    (assignment.score / currentCat.score_out_of) *
                      currentCat.weight,
                    4,
                    2
                  )
                : '-'
            } / ${
              typeof assignment.score_out_of == 'number'
                ? round(
                    (assignment.score_out_of / currentCat.score_out_of) *
                      currentCat.weight,
                    4,
                    2
                  )
                : '-'
            }`,
          ]);
        }
      }

      //determine grades for only graded assignments
      for (const assignment of response.assignments) {
        const currentCat = catsAndScores[assignment.category];
        if (currentCat) {
          setGradedCpt((cpt) => [
            ...cpt,
            `${
              typeof assignment.score == 'number'
                ? round(
                    (assignment.score / currentCat.score_out_of_graded) *
                      currentCat.weight,
                    4,
                    2
                  )
                : '-'
            } / ${
              typeof assignment.score == 'number' &&
              typeof assignment.score_out_of == 'number'
                ? round(
                    (assignment.score_out_of / currentCat.score_out_of_graded) *
                      currentCat.weight,
                    4,
                    2
                  )
                : '-'
            }`,
          ]);
        }
      }

      grade /= response.categories.reduce<number>(
        (prev, current) => prev + (current.weight ?? 0),
        0
      );
      gradeGradedOnly /= response.categories
        .filter((cat) => (catsAndScores[cat.name]?.score ?? 0) != 0)
        .reduce<number>((prev, current) => prev + (current.weight ?? 0), 0);

      sGGO(`${round(gradeGradedOnly * 100)}%`);
      setGrade(`${round(grade * 100)}% / ${round(maxGrade * 100)}%`);
    }
  }, [response]);

  return (
    <div className="app">
      <header className="app-header">
        <span>Canvas Grader</span>
        <div className="app-header-icons">
          <Button
            onClick={() => {
              navigateQuery('https://github.com/codyduong/canvas-grader');
            }}
          >
            <CloseIcon fill={'#ffffff'} />
          </Button>
          <Button
            onClick={() => {
              window.close();
            }}
          >
            <CloseIcon fill={'#ffffff'} />
          </Button>
        </div>
      </header>
      <div className="app-body">
        {response ? (
          <>
            <div>
              <thead>
                <tr className="assignment-thead-tr">
                  <th>Name</th>
                  <th>Score</th>
                  <th>Out of</th>
                  {/* <th>%</th> */}
                  <th>% of Overall</th>
                  <th>% of Graded</th>
                </tr>
              </thead>
              <tbody>{mapResponse(response, url, cpt, gradedCpt)}</tbody>
            </div>
            <SideBar>
              <thead>
                <tr className="category-thead-tr">
                  <th>Group</th>
                  <th className="sidebar-thead-tr-weight">Weight</th>
                </tr>
              </thead>
              <tbody>{mapCategories(response)}</tbody>
              <OverallGrade>
                <GradeDiv>
                  <span>% Overall</span>
                  <div>{grade}</div>
                </GradeDiv>
                <GradeDiv>
                  <span>% Graded</span>
                  <div>{gradeGradedOnly}</div>
                </GradeDiv>
              </OverallGrade>
            </SideBar>
          </>
        ) : (
          <p>
            Failed to find any grades, are you sure you are on the grades page
            on Canvas?
          </p>
        )}
      </div>
    </div>
  );
}

export default App;
