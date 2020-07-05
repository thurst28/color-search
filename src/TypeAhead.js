import React, { useEffect, useRef, useReducer } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import Lottie from "react-lottie";

import Lion from "./static/lion.json";
import background from "./static/background_img.png";
import breakpoint from "./utils/breakpoints";
import List from "./WordList";

const lottieAnimationOptions = {
  loop: true,
  autoplay: false,
  animationData: Lion,
  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice",
  },
};

const Action = {
  INPUT: "INPUT",
  WORD_SUBMIT: "WORD_SUBMIT",
  CLOSE_LIST: "CLOSE_LIST",
  OPEN_LIST: "OPEN_LIST",
};

const Status = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
};

const initialState = {
  status: Status.INACTIVE,
  searchTerm: "",
};

const reducer = (state, action) => {
  switch (action.type) {
    case Action.INPUT: {
      const { searchTerm } = action.payload;
      const activeSearchTerm = searchTerm.trim();
      debugger;
      return {
        ...state,
        status: activeSearchTerm ? Status.ACTIVE : Status.INACTIVE,
        searchTerm,
      };
    }
    case Action.WORD_SUBMIT: {
      const { word } = action.payload;
      return {
        ...state,
        status: Status.INACTIVE,
        searchTerm: word,
      };
    }
    case Action.CLOSE_LIST: {
      return {
        ...state,
        status: Status.INACTIVE,
      };
    }
    case Action.OPEN_LIST: {
      const activeSearchTerm = state.searchTerm.trim();
      return {
        ...state,
        status: activeSearchTerm ? Status.ACTIVE : Status.INACTIVE,
      };
    }
    default:
      return state;
  }
};

function TypeAhead(props) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const containerRef = useRef(null);

  // Set up keyboard and click listeners
  useEffect(() => {
    const handleClick = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        dispatch({ type: Action.CLOSE_LIST });
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        dispatch({ type: Action.CLOSE_LIST });
        document.activeElement.blur();
      }
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef]);

  /*
    EVENT HANDLERS
  */

  const handleSearchTermChange = (event) => {
    const { value } = event.target;
    dispatch({ type: Action.INPUT, payload: { searchTerm: value } });
  };

  const handleBlur = () => {
    // Path to nested element, which should be a word card
    // If no element, or its not tabable, close list on input blur
    let childIndex = containerRef.current.children.listView?.children?.list?.firstChild?.tabIndex;
    let childToTabTo = childIndex !== undefined && childIndex !== -1;

    if (!childToTabTo) {
      dispatch({ type: Action.CLOSE_LIST });
    }
  };

  const handleWordClick = (word) => {
    dispatch({ type: Action.WORD_SUBMIT, payload: { word } });
  };

  const handleWordKeyDown = (event, word) => {
    if (event.key === "Enter") {
      dispatch({ type: Action.WORD_SUBMIT, payload: { word } });
    }
  };

  /*
    FILTER
  */

  const getDisplayList = () => {
    const matchedWords = [];
    //remove whitespace
    let matchingStr = state.searchTerm.replace(/\s/g, "");
    //escape any regex charcters a user might input
    matchingStr = matchingStr.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    // regex to find search term and begining and keep delimiter
    const matcher = new RegExp(`(^${matchingStr})`, "gi");

    props.list.forEach((word) => {
      let matches = word.split(matcher);
      // a split with a match will return an array of 3 items
      // 1. Empty space
      // 2. Matched search term
      // 3. The rest of the word
      if (matches.length === 3) {
        const details = {
          full: word,
          searchTerm: matches[1],
          restOfWord: matches[2],
        };
        matchedWords.push(details);
      }
    });

    return matchedWords;
  };

  /*
    VIEW
  */

  return (
    <View data-testid="full-page">
      <Lottie
        tabIndex={-1}
        height={"100px"}
        width={"150px"}
        options={lottieAnimationOptions}
        isPaused={state.status === Status.INACTIVE}
      />
      <Container data-testid="main-container" ref={containerRef}>
        <InputContainer id="inputContainer">
          <label htmlFor="searchTerm">Search</label>
          <input
            type="text"
            id="searchTerm"
            value={state.searchTerm}
            onChange={handleSearchTermChange}
            onFocus={() => dispatch({ type: Action.OPEN_LIST })}
            onBlur={handleBlur}
          />
        </InputContainer>
        {state.status === Status.ACTIVE && (
          <List words={getDisplayList()} handleClick={handleWordClick} handleKeyDown={handleWordKeyDown} />
        )}
      </Container>
    </View>
  );
}

TypeAhead.propTypes = {
  list: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default TypeAhead;

/*
  Styles
*/

const View = styled.div`
  height: auto;
  min-height: 100vh;
  width: 100vw;
  background-image: url(${background});

  padding-top: 10%;

  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Container = styled.div`
  width: 100%;
  max-width: 300px;

  display: flex;
  flex-direction: column;
  align-items: center;

  @media (min-width: ${breakpoint.medium}) {
    max-width: 400px;
  }
`;

const InputContainer = styled.div`
  width: 100%;
  max-width: 100%;
  display: flex;
  flex-direction: column;

  label {
    font-size: 12px;
    font-weight: bold;
    margin: 4px 0;
    align-self: flex-start;
    color: ${({ theme }) => theme.secondary};
  }

  input {
    height: 65px;
    border: none;
    background: ${({ theme }) => theme.secondary};
    border-radius: 6px;
    padding: 12px;
    width: 100%;
    font-size: 24px;
    font-weight: bold;
    box-shadow: 0px 0px 3px 1px #00000080;
  }
`;
