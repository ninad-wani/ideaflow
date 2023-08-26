import React, { useState, useEffect, useRef } from "react";
import { useIdealContext } from "../../services/IdealState";
import "./Idealizer.css";

const Idealizer = () => {
  const { state, dispatch } = useIdealContext();

  // Initialize the input values with the corresponding message from the state
  const [inputValues, setInputValues] = useState(
    state?.ideas?.map((idea) => idea?.message) || [] // Initialize with empty array
  );
  // State to store the current suggestion
  const [currentSuggestion, setCurrentSuggestion] = useState("");
  // State to keep track of the current idea's index
  const [currentIdeaIndex, setCurrentIdeaIndex] = useState(-1);
  // State to track whether the input field is focused or not
  const [inputFocused, setInputFocused] = useState(null);

  const [referenceToggle, setReferenceToggle] = useState(false);

  const IdeaInput = (e, index) => {
    const newInputValues = [...inputValues];
    newInputValues[index] = e.target.value;
    setInputValues(newInputValues);
    // Extract the text after the last '<>' tag
    const inputText = e.target.value.substring(
      e.target.value.lastIndexOf("<>") + 2
    );

    // Add a CSS class to text with '#' tags
    const styledText = inputText.replace(
      /#(\w+)/g,
      '<span class="blue-text">#$1</span>'
    );
    // Keep track of the current idea's index
    setCurrentIdeaIndex(index);

    // Dispatch action to update current idea index
    dispatch({
      type: "SET_CURRENT_IDEA_INDEX",
      payload: index,
    });

    // Update the suggestion based on the extracted input text
    setCurrentSuggestion(styledText);

    // Update the idea in the state as the user types
    dispatch({
      type: "UPDATE_IDEA",
      payload: {
        id: state.ideas[index].id,
        obj: {
          id: state.ideas[index].id,
          message: e.target.value,
          reference: state.ideas[index].reference,
        },
      },
    });

    // Update suggestions based on the extracted input text
    dispatch({
      type: "UPDATE_SUGGESTIONS",
      payload: styledText, // Use the styledText with CSS class
    });

    if (e.target.value.includes("<>") || e.target.value.includes("#")) {
      dispatch({
        type: "UPDATE_IDEA",
        payload: {
          id: state.ideas[index].id,
          obj: {
            id: state.ideas[index].id,
            message: e.target.value,
            reference: state.ideas[index].reference,
          },
        },
      });
      e.target.className = e.target.className + " blue-text";
    } else {
      dispatch({
        type: "UPDATE_IDEA",
        payload: {
          id: state.ideas[index].id,
          obj: {
            id: state.ideas[index].id,
            message: e.target.value,
            reference: [],
          },
        },
      });
      e.target.className = e.target.className.replaceAll(" blue-text", "");
    }
  };

  const HandleKeyDown = (e, index) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent Enter from creating a new line

      // Check if the currently edited note is empty and not the first one
      if (index > 0 && inputValues[index] === "") {
        // Move the focus to the previous note
        setCurrentIdeaIndex(index - 1);
      } else {
        // Add a new idea at the top
        dispatch({
          type: "ADD_IDEA",
          payload: {
            id: state.ideas.length,
            message: "",
            reference: [],
          },
        });

        // Update input values to include the new idea at the top
        setInputValues(["", ...inputValues]);
      }
    } else if (e.key === "Tab" && currentSuggestion !== "") {
      // When the user presses Tab and a suggestion is selected, set the reference
      const suggestion = state.suggestions.find((s) => s === currentSuggestion);
      if (suggestion) {
        const updatedValue = inputValues[index].replace(
          /<[^>]+>.*$/,
          `<>${suggestion}`
        );

        // Update the input value with the selected suggestion
        const newInputValues = [...inputValues];
        newInputValues[index] = updatedValue;
        setInputValues(newInputValues);
        setCurrentSuggestion(suggestion);

        dispatch({
          type: "UPDATE_IDEA",
          payload: {
            id: state.ideas[index].id,
            obj: {
              ...state.ideas[index],
              message: updatedValue,
              reference: state.ideas[index].push(suggestion.id), // Assuming each note has an 'id'
            },
          },
        });
      }
    }
  };

  const HandleBlur = () => {
    // Clear the current suggestion when the input field loses focus
    setCurrentSuggestion("");
    // Reset input focus state
    setInputFocused(null);
  };

  // Reference to the Idealizer container
  const idealizerRef = useRef(null);

  // Click event handler to close suggestions when clicking outside
  const handleClickOutside = (e) => {
    if (idealizerRef.current && !idealizerRef.current.contains(e.target)) {
      // Click occurred outside of the Idealizer component
      // Clear the current suggestion and reset input focus state
      setCurrentSuggestion("");
      setInputFocused(null);
    }
  };

  useEffect(() => {
    if (state?.ideas?.length === 0) {
      dispatch({
        type: "ADD_IDEA",
        payload: {
          id: 0,
          message: "", // Blank message
          reference: [],
        },
      });
    } else {
      // Initialize input values based on state.ideas
      setInputValues(state.ideas.map((idea) => idea.message));
    }

    // Add the click event listener to the document body
    document.body.addEventListener("click", handleClickOutside);

    // Cleanup the event listener on component unmount
    return () => {
      document.body.removeEventListener("click", handleClickOutside);
    };
  }, [dispatch, state.ideas]);

  useEffect(() => {
    state?.filteredIdeas &&
      setInputValues(state.filteredIdeas.map((idea) => idea.message));
  }, [dispatch, state.filteredIdeas]);

  const handleSuggestionClick = (suggestion, index) => {
    // Set the selected suggestion as the current input
    const newInputValues = [...inputValues];
    let str = newInputValues[index];
    str = str.split("<>");
    str[str.length - 1] = suggestion;
    newInputValues[index] = str.join("<>");
    setInputValues(newInputValues);
    setCurrentSuggestion(suggestion);

    let msg = newInputValues[index];
    let temp = newInputValues[index]
      ?.split("<>")
      ?.filter((item, index) => index !== 0);
    dispatch({
      type: "UPDATE_IDEA",
      payload: {
        id: state.ideas[index].id,
        obj: {
          id: state.ideas[index].id,
          message: msg,
          reference: temp,
        },
      },
    });

    HandleBlur();
  };

  const HandleReferenceToggle = () => {
    setReferenceToggle((prevState) => !prevState);
  };

  const DeleteIdea = (id) => {
    dispatch({
      type: "DELETE_IDEA",
      payload: id,
    });

    // Update input values to match the updated state.ideas
    const newInputValues = [...inputValues];
    newInputValues.splice(id, 1);
    setInputValues(newInputValues);

    // Also update the inputFocused state if it's the last idea that was focused
    if (inputFocused === id) {
      setInputFocused(null);
    }
  };

  return (
    <div
      className="idealizer-container d-flex justify-content-center"
      ref={idealizerRef}
    >
      <div className="ideas-holder">
        {state?.filteredIdeas === null &&
          state?.ideas?.map((idea, index) => (
            <div key={index}>
              <div className="input-holder">
                <div className="input-internal">
                  {inputValues[index] !== undefined && (
                    <input
                      name="idea"
                      type="text"
                      className={
                        idea?.message?.includes("<>") ||
                        idea?.message?.includes("#")
                          ? "idea blue-text"
                          : "idea"
                      }
                      value={inputValues[index]}
                      onChange={(e) => {
                        IdeaInput(e, index);
                      }}
                      onKeyDown={(e) => {
                        HandleKeyDown(e, index);
                      }}
                      // onBlur={HandleBlur}
                      onFocus={() => {
                        dispatch({
                          type: "UPDATE_SUGGESTIONS",
                          payload: "",
                        });
                        setInputFocused(index);
                        setCurrentSuggestion("");
                      }}
                    />
                  )}
                  {inputValues[index] !== undefined &&
                    inputValues[index] !== "" && (
                      <i
                        className="fa fa-trash-o text-white"
                        id="delete-idea"
                        onClick={() => {
                          DeleteIdea(idea.id);
                        }}
                      ></i>
                    )}
                </div>
                {idea?.reference !== undefined &&
                  idea?.reference !== null &&
                  idea?.reference?.length > 0 && (
                    <label htmlFor="idea" onClick={HandleReferenceToggle}>
                      <i
                        className={
                          referenceToggle
                            ? "fa fa-caret-down"
                            : "fa fa-caret-right"
                        }
                      ></i>
                      {idea?.reference?.length}{" "}
                      {idea?.reference?.length === 1
                        ? "reference"
                        : "references"}{" "}
                    </label>
                  )}
                {referenceToggle && (
                  <ul className="references-list">
                    {idea?.reference?.map((item, index) => {
                      return (
                        <li className="blue-text" key={index}>
                          {item}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* Show suggestions based on the current input and input focus state */}
              {inputFocused === index && (
                <ul className="suggestion-list">
                  {inputValues[index]?.includes("<>") &&
                    state?.suggestions
                      ?.filter(
                        (suggestion) =>
                          suggestion !== inputValues[index] && suggestion !== "" // Filter out empty messages
                      )
                      ?.map(
                        (suggestion, sIndex) =>
                          !inputValues[index]
                            .split("<>")
                            .includes(suggestion) && (
                            <li
                              key={sIndex}
                              onClick={() => {
                                handleSuggestionClick(suggestion, index);
                              }}
                            >
                              {suggestion}
                            </li>
                          )
                      )}
                </ul>
              )}
            </div>
          ))}

        {/* Show notes by searching */}
        {state?.filteredIdeas !== null &&
          state?.filteredIdeas?.map((idea, index) => (
            <div key={index}>
              <div className="input-holder">
                <div className="input-internal">
                  {idea?.message !== undefined && (
                    <input
                      name="idea"
                      type="text"
                      className={
                        idea?.message.includes("<>") ||
                        idea?.message.includes("#")
                          ? "idea blue-text"
                          : "idea"
                      }
                      value={inputValues[index]} // Use inputValues from filtered ideas
                      onChange={(e) => {
                        IdeaInput(e, index);
                      }}
                      onKeyDown={(e) => {
                        HandleKeyDown(e, index);
                      }}
                      onFocus={() => {
                        dispatch({
                          type: "UPDATE_SUGGESTIONS",
                          payload: "",
                        });
                        setInputFocused(index);
                        setCurrentSuggestion("");
                      }}
                      readOnly={true}
                    />
                  )}
                  {idea?.message !== undefined && idea?.message !== "" && (
                    <i
                      className="fa fa-trash-o text-white"
                      id="delete-idea"
                      // onClick={() => {
                      //   DeleteIdea(idea.id);
                      // }}
                    ></i>
                  )}
                </div>
                {idea?.reference !== undefined &&
                  idea?.reference !== null &&
                  idea?.reference?.length > 0 && (
                    <label htmlFor="idea" onClick={HandleReferenceToggle}>
                      <i
                        className={
                          referenceToggle
                            ? "fa fa-caret-down"
                            : "fa fa-caret-right"
                        }
                      ></i>
                      {idea?.reference?.length}{" "}
                      {idea?.reference?.length === 1
                        ? "reference"
                        : "references"}{" "}
                    </label>
                  )}
                {referenceToggle && (
                  <ul className="references-list">
                    {idea?.reference?.map((item, index) => {
                      return (
                        <li className="blue-text" key={index}>
                          {item}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* Show suggestions based on the current input and input focus state */}
              {inputFocused === index && (
                <ul className="suggestion-list">
                  {inputValues[index]?.includes("<>") &&
                    state?.suggestions
                      ?.filter(
                        (suggestion) =>
                          suggestion !== inputValues[index] && suggestion !== ""
                      )
                      ?.map(
                        (suggestion, sIndex) =>
                          !inputValues[index]
                            .split("<>")
                            .includes(suggestion) && (
                            <li
                              key={sIndex}
                              onClick={() => {
                                handleSuggestionClick(suggestion, index);
                              }}
                            >
                              {suggestion}
                            </li>
                          )
                      )}
                </ul>
              )}
            </div>
          ))}
      </div>
    </div>
  );
};

export default Idealizer;
