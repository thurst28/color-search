import React, { useState, useEffect, useRef } from "react";
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

const Status = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
};

function TypeAhead(props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState(Status.INACTIVE);
  const containerRef = useRef(null);

  // SearchTerm
  useEffect(() => {
    // if a searchTerm is not an "" after a change, we should make the page active
    const activeSearchTerm = searchTerm.trim();
    if (activeSearchTerm) {
      setStatus(Status.ACTIVE);
    } else {
      setStatus(Status.INACTIVE);
    }
  }, [searchTerm]);

  // Set up keyboard and click listeners
  useEffect(() => {
    const handleClick = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setStatus(Status.INACTIVE);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setStatus(Status.INACTIVE);
        document.activeElement.blur();
      }
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [containerRef]);

  /*
    EVENT HANDLERS
  */

  const handleSearchTermChange = (event) => {
    const { value } = event.target;
    setSearchTerm(value);
  };

  const handleBlur = () => {
    // Path to nested element, which should be a word card
    // If no element, or its not tabable, close list on input blur
    let childIndex = containerRef.current.children.listView?.children?.list?.firstChild?.tabIndex;
    let childToTabTo = childIndex !== undefined && childIndex !== -1;

    if (!childToTabTo) {
      setStatus(Status.INACTIVE);
    }
  };

  const handleWordClick = (word) => {
    setActiveWord(word);
  };

  const handleWordKeyDown = (event, word) => {
    if (event.key === "Enter") {
      setActiveWord(word);
    }
  };

  const setActiveWord = (word) => {
    setSearchTerm(word);
    let inputElement = containerRef.current.children.inputContainer.children.searchTerm;
    inputElement.focus();
  };

  /*
    FILTER
  */

  const getDisplayList = () => {
    const matchedWords = [];
    //remove whitespace
    let matchingStr = searchTerm.replace(/\s/g, "");
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
        isPaused={status === Status.INACTIVE}
      />
      <Container data-testid="main-container" ref={containerRef}>
        <InputContainer id="inputContainer">
          <label htmlFor="searchTerm">Search</label>
          <input
            type="text"
            id="searchTerm"
            value={searchTerm}
            onChange={handleSearchTermChange}
            onFocus={() => searchTerm.trim() && setStatus(Status.ACTIVE)}
            onBlur={handleBlur}
          />
        </InputContainer>
        {status === Status.ACTIVE && (
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
