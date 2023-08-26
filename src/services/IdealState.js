import React, { createContext, useContext, useReducer } from "react";

const IdealContext = createContext();

const initialState = {
  ideas: [],
  suggestions: [],
  filteredIdeas: null,
  currentIdeaIndex: -1,
};

const IdealReducer = (state, action) => {
  switch (action.type) {
    case "ADD_IDEA":
      return {
        ...state,
        ideas: [
          {
            id: action.payload.id,
            message: action.payload.message,
            reference: action.payload.reference,
          },
          ...state.ideas,
        ],
      };
    case "UPDATE_IDEA":
      const key = action.payload.id;
      const value = action.payload.obj;
      const updatedIdeas = [...state.ideas];
      const ideaIndex = updatedIdeas.findIndex((idea) => idea.id === key);

      if (ideaIndex !== -1) {
        updatedIdeas[ideaIndex] = value;

        return {
          ...state,
          ideas: updatedIdeas,
        };
      } else {
        return state;
      }
    case "UPDATE_SUGGESTIONS":
      if (action?.payload === null || action?.payload === "")
        return { ...state, suggestions: [] };
      else {
        const inputText = action?.payload?.toLowerCase().trim();

        // Filter suggestions based on the input text
        const suggestions = state?.ideas
          ?.filter((idea) => idea?.message?.toLowerCase()?.includes(inputText))
          ?.filter((suggestion) => suggestion !== "")
          ?.map((idea) => idea?.message); // Extract message for suggestions
        return { ...state, suggestions };
      }

    case "SET_CURRENT_IDEA_INDEX":
      return { ...state, currentIdeaIndex: action.payload };
    case "FILTER_IDEAS":
      const searchQuery = action.payload.toLowerCase().trim();

      // Filter notes based on the search query
      const filteredIdeas = state?.ideas?.filter((idea) => {
        const messageMatches = idea.message.toLowerCase().includes(searchQuery);
        const reference = idea.reference; // Get the reference value

        // Check if reference is a string and then perform the search
        const referenceMatches =
          typeof reference === "string" &&
          reference.toLowerCase().includes(searchQuery);

        return messageMatches || referenceMatches;
      });

      // Sort the filtered notes so that notes containing message come first, followed by referenced notes
      filteredIdeas.sort((a, b) => {
        const aMessageMatches = a.message.toLowerCase().includes(searchQuery);
        const bMessageMatches = b.message.toLowerCase().includes(searchQuery);

        // Sort by message first
        if (aMessageMatches && !bMessageMatches) {
          return -1;
        } else if (!aMessageMatches && bMessageMatches) {
          return 1;
        } else {
          return 0;
        }
      });
      return {
        ...state,
        filteredIdeas: filteredIdeas,
      };
    case "DELETE_IDEA":
      const idToDelete = action.payload;
      const updatedIdea = state.ideas.filter((idea) => idea.id !== idToDelete);
      return {
        ...state,
        ideas: updatedIdea,
      };

    default:
      return state;
  }
};

export function IdealProvider({ children }) {
  const [state, dispatch] = useReducer(IdealReducer, initialState);

  return (
    <IdealContext.Provider value={{ state, dispatch }}>
      {children}
    </IdealContext.Provider>
  );
}

export function useIdealContext() {
  return useContext(IdealContext);
}
