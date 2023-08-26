import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import "/node_modules/bootstrap/dist/css/bootstrap.min.css";
import "font-awesome/css/font-awesome.min.css";
import { IdealProvider } from "./services/IdealState";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <IdealProvider>
    <App />
  </IdealProvider>
);
