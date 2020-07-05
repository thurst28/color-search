import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

import breakpoint from "./utils/breakpoints";
import { motion } from "framer-motion";

function WordList(props) {
  return (
    <View id="listView" data-testid="WordList">
      {!props.words.length ? (
        <EmptyMessage>No Matches</EmptyMessage>
      ) : (
        <List id="list">
          {props.words.map((word) => {
            return (
              <Item
                className="item"
                key={word.full}
                role="button"
                data-testid={word.full}
                onClick={() => props.handleClick(word.full)}
                onKeyDown={(event) => props.handleKeyDown(event, word.full)}
                tabIndex={0}
                transition={{ duration: 0.25 }}
                initial={{ scale: 0.8 }}
                animate={{ scale: [0.8, 1] }}
                positionTransition
              >
                <BoldTerm>{word.searchTerm}</BoldTerm>
                {word.restOfWord}
              </Item>
            );
          })}
        </List>
      )}
    </View>
  );
}

WordList.propTypes = {
  handleClick: PropTypes.func.isRequired,
  handleKeyDown: PropTypes.func.isRequired,
  words: PropTypes.arrayOf(
    PropTypes.shape({
      full: PropTypes.string.isRequired,
      searchTerm: PropTypes.string.isRequired,
      restOfWord: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default WordList;

/*
  Styles
*/

const View = styled.div`
  width: 100%;
`;

const List = styled.ul`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0;
`;
const Item = styled(motion.li)`
  list-style: none;
  width: 95%;
  background: ${({ theme }) => `${theme.primary}BF`};
  padding: 12px 16px;
  margin: 1px 0;
  color: #fff;

  display: flex;
  align-items: center;

  :hover {
    background: ${({ theme }) => theme.primary};
  }

  @media (min-width: ${breakpoint.medium}) {
    width: 90%;
  }
`;

const BoldTerm = styled.span`
  font-weight: bold;
  color: ${({ theme }) => theme.accent};
`;

const EmptyMessage = styled.p`
  padding: 12px;
  background: gray;
  border-radius: 4px;
  width: fit-content;
`;
