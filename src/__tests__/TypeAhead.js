import React from "react";
import { render, fireEvent, wait, screen } from "../test-utils";
import { axe, toHaveNoViolations } from "jest-axe";
import userEvent from "@testing-library/user-event";

import TypeAhead from "../TypeAhead";

expect.extend(toHaveNoViolations);

const MockList = [
  "AliceBlue",
  "AntiqueWhite",
  "Aqua",
  "Aquamarine",
  "Azure",
  "Beige",
  "Bisque",
  "Black",
  "BlanchedAlmond",
  "Blue",
  "BlueViolet",
  "Brown",
  "BurlyWood",
  "CadetBlue",
  "Chartreuse",
  "Chocolate",
  "Coral",
  "CornflowerBlue",
  "Cornsilk",
  "Crimson",
  "Cyan",
  "DarkBlue",
  "DarkCyan",
  "DarkGoldenRod",
  "DarkGray",
  "DarkGrey",
];

const cases = [
  {
    input: "Aq",
    expectedList: ["Aqua", "Aquamarine"],
    unexpectedList: [
      "AliceBlue",
      "AntiqueWhite",
      "Azure",
      "Beige",
      "Bisque",
      "Black",
      "BlanchedAlmond",
      "Blue",
      "BlueViolet",
      "Brown",
      "BurlyWood",
      "CadetBlue",
      "Chartreuse",
      "Chocolate",
      "Coral",
      "CornflowerBlue",
      "Cornsilk",
      "Crimson",
      "Cyan",
      "DarkBlue",
      "DarkCyan",
      "DarkGoldenRod",
      "DarkGray",
      "DarkGrey",
    ],
  },
  {
    input: "Dark",
    expectedList: ["DarkBlue", "DarkCyan", "DarkGoldenRod", "DarkGray", "DarkGrey"],
    unexpectedList: [
      "AliceBlue",
      "AntiqueWhite",
      "Aqua",
      "Aquamarine",
      "Azure",
      "Beige",
      "Bisque",
      "Black",
      "BlanchedAlmond",
      "Blue",
      "BlueViolet",
      "Brown",
      "BurlyWood",
      "CadetBlue",
      "Chartreuse",
      "Chocolate",
      "Coral",
      "CornflowerBlue",
      "Cornsilk",
      "Crimson",
      "Cyan",
    ],
  },
  {
    input: "C",
    expectedList: ["CadetBlue", "Chartreuse", "Chocolate", "Coral", "CornflowerBlue", "Cornsilk", "Crimson", "Cyan"],
    unexpectedList: [
      "AliceBlue",
      "AntiqueWhite",
      "Azure",
      "Beige",
      "Bisque",
      "Black",
      "BlanchedAlmond",
      "Blue",
      "BlueViolet",
      "Brown",
      "BurlyWood",
      "DarkBlue",
      "DarkCyan",
      "DarkGoldenRod",
      "DarkGray",
      "DarkGrey",
    ],
  },
];

cases.forEach((testCase) => {
  test(`Filters list of props by matching a users case-insenstive input, matches only words that start with substring ${testCase.input} `, async () => {
    render(<TypeAhead list={MockList} />);

    expect(screen.queryByTestId("WordList")).toBeNull();

    await userEvent.type(screen.getByLabelText(/search/i), testCase.input);
    await wait(() => {
      return expect(screen.queryByTestId(testCase.unexpectedList[0])).toBeNull();
    });

    testCase.expectedList.forEach((word) => {
      let renderedWord = screen.getByTestId(word);
      expect(renderedWord).toHaveAttribute("tabIndex");
    });
    testCase.unexpectedList.forEach((word) => {
      expect(screen.queryByTestId(word)).toBeNull();
    });
  });
});

test("Shouldn't render a list if a user's input is only whitespace", async () => {
  render(<TypeAhead list={MockList} />);

  expect(screen.queryByTestId("WordList")).toBeNull();

  await userEvent.type(screen.getByLabelText(/search/i), "   ");
  expect(screen.queryByTestId("WordList")).toBeNull();
});

test("Displays a empty message if there not matches", async () => {
  render(<TypeAhead list={MockList} />);

  await userEvent.type(screen.getByLabelText(/search/i), "MOCKING");
  await wait(() => {
    return screen.getByText(/No Matches/i);
  });
});

test("Can tab from search to list items", async () => {
  render(<TypeAhead list={MockList} />);

  userEvent.tab();
  userEvent.tab();
  expect(screen.getByLabelText(/search/i)).toHaveFocus();

  await userEvent.type(screen.getByLabelText(/search/i), "Alice");
  await wait(() => {
    return screen.getByTestId("AliceBlue");
  });

  userEvent.tab();
  expect(screen.getByTestId("AliceBlue")).toHaveFocus();
});

test("Hides list if there is no item to tab to", async () => {
  render(<TypeAhead list={MockList} />);

  userEvent.tab();
  userEvent.tab();

  await userEvent.type(screen.getByLabelText(/search/i), "MOCKING");
  await wait(() => {
    return screen.getByText(/No Matches/i);
  });

  userEvent.tab();
  await wait(() => {
    return expect(screen.queryByText(/No Matches/i)).toBeNull();
  });
});

test("Clicking on a list item should populate the input with the selected item's value and hide the list", async () => {
  render(<TypeAhead list={MockList} />);

  const testCase = {
    input: "BLUE",
    expectedList: ["Blue", "BlueViolet"],
    unexpectedList: [
      "AliceBlue",
      "AntiqueWhite",
      "Aqua",
      "Aquamarine",
      "Azure",
      "Beige",
      "Bisque",
      "Black",
      "BlanchedAlmond",
      "Brown",
      "BurlyWood",
      "Coral",
      "CornflowerBlue",
      "Cornsilk",
      "CadetBlue",
      "Chartreuse",
      "Chocolate",
      "Coral",
      "CornflowerBlue",
      "Cornsilk",
      "Crimson",
      "Cyan",
      "DarkBlue",
      "DarkCyan",
      "DarkGoldenRod",
      "DarkGray",
      "DarkGrey",
    ],
  };

  await userEvent.type(screen.getByLabelText(/search/i), testCase.input);
  await wait(() => {
    return expect(screen.queryByTestId("Black")).toBeNull();
  });

  testCase.unexpectedList.forEach((word) => {
    return expect(screen.queryByTestId(word)).toBeNull();
  });

  fireEvent.click(screen.getByTestId(testCase.expectedList[1]));
  await wait(() => {
    return expect(screen.queryByTestId(testCase.expectedList[0])).toBeNull();
  });
  screen.getByTestId(testCase.expectedList[1]);
  testCase.unexpectedList.forEach((word) => {
    return expect(screen.queryByTestId(word)).toBeNull();
  });
}, 7500);

test("the matching substring within the displayed options should be bold", async () => {
  render(<TypeAhead list={MockList} />);

  await userEvent.type(screen.getByLabelText(/search/i), "CO");
  await wait(() => {
    return expect(screen.queryByTestId("Chocolate")).toBeNull();
  });

  const spans = screen.getAllByText("Co");
  expect(spans.length).toBe(3);
  spans.forEach((span) => {
    expect(span).toHaveStyle("font-weight: bold");
  });

  screen.getByText("ral");
  screen.getByText("rnflowerBlue");
  screen.getByText("rnsilk");
});

test("Pressing the enter or return key when an item is focused should populate the input, but stay open on other key presses", async () => {
  render(<TypeAhead list={MockList} />);

  const testCase = cases[2];

  await userEvent.type(screen.getByLabelText(/search/i), testCase.input);
  await wait(() => {
    return screen.getByTestId(testCase.expectedList[0]);
  });

  await fireEvent.keyDown(screen.getByTestId(testCase.expectedList[0]), { key: "Enter", code: "Enter" });
  await wait(() => {
    return expect(screen.queryByTestId(testCase.expectedList[1])).toBeNull();
  });

  await userEvent.type(screen.getByLabelText(/search/i), testCase.input);
  await wait(() => {
    return screen.getByTestId(testCase.expectedList[0]);
  });

  await fireEvent.keyDown(screen.getByTestId(testCase.expectedList[0]), { key: "Tab", code: "Tab" });
  screen.getByTestId(testCase.expectedList[0]);
});

test("Pressing the escape key should close the list", async () => {
  render(<TypeAhead list={MockList} />);

  const testCase = cases[2];

  await userEvent.type(screen.getByLabelText(/search/i), testCase.input);
  await wait(() => {
    return screen.getByTestId(testCase.expectedList[0]);
  });

  screen.getByTestId("WordList");
  await fireEvent.keyDown(screen.getByTestId("main-container"), { key: "Escape", code: "Escape" });

  expect(screen.queryByTestId("WordList")).toBeNull();
});

test("No Axe violations", async () => {
  const { container } = render(<TypeAhead list={MockList} />);
  const results = await axe(container);

  expect(results).toHaveNoViolations();
});
