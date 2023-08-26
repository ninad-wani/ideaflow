import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <div className="footer-container">
      <i
        className="fa fa-magic"
        style={{ width: "fit-content", backgroundColor: "rgba(255,255,255,0)" }}
      ></i>
      &nbsp;&nbsp;Start typing to see Magic...
      <br />
      Crafted by Ninad Wani
    </div>
  );
};

export default Footer;
