import React, { useState } from "react";
import "./Header.css";
import { useIdealContext } from "../../services/IdealState";
import { Back, Help, Home, Mic, Note, Search, Sicon } from "../../assets";
import swal from "sweetalert";

const Header = () => {
  const { state, dispatch } = useIdealContext();

  const NewIdea = () => {
    if (
      state.ideas.length === 0 ||
      (state.ideas[0] !== undefined && state.ideas[0].message !== "")
    )
      dispatch({
        type: "ADD_IDEA",
        payload: {
          id: state.ideas.length,
          message: "",
          reference: [],
        },
      });
  };

  const HandleSearch = (e) => {
    let searchQuery = e.target.value;

    dispatch({
      type: "FILTER_IDEAS",
      payload: searchQuery
    });
  }

  return (
    <div className="header-container">
      <div className="left-container">
        <img
          role={"button"}
          href="#"
          src={Sicon}
          alt="Sidebar"
          className="svg-icon sidebar-icon"
          style={{ width: "26px" }}
        ></img>
        <img
          role={"button"}
          src={Home}
          alt="Home"
          className="svg-icon home-icon"
        ></img>
        <img
          role={"button"}
          src={Back}
          alt="Back"
          className="svg-icon back-icon"
        ></img>
      </div>
      <div className="center-container">
        <div className="search-input-holder">
          <img src={Search} alt="search" className="svg-icon search-icon"></img>
          <input
            type="text"
            placeholder="Search Notes"
            onChange={HandleSearch}
          />
        </div>
        <img
          role={"button"}
          src={Note}
          alt="Note"
          className="note-icon"
          onClick={NewIdea}
        ></img>
        <img
          role={"button"}
          src={Mic}
          alt="Mic"
          className="svg-icon mic-icon"
          style={{ marginLeft: "10px" }}
          onClick={() => swal("It's not implement yet :)")}
        ></img>
      </div>
      <div className="right-container">
        <img
          role={"button"}
          src={Help}
          alt="Help"
          className="svg-icon help-icon"
          onClick={() =>
            swal(
              "This is ideaFlow application.\n\nFeatures include:\n1.Add new notes\n2.Delete notes\n3.Reference to other notes with '<>' tag\n4.Easily search notes\n5.Hashtags('#') support\n\nNOTE: Searching disables note editing and deleting features.\n\n\n Thank you for using it, looking forward to suggestions for improvement."
            )
          }
        ></img>
      </div>
    </div>
  );
};

export default Header;
