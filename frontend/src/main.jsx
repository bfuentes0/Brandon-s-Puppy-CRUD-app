import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AsgardeoProvider } from "@asgardeo/react";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AsgardeoProvider
      clientId="ZtwJ3yfdjIts2JtBx4NzAhCX_Pwa"
      baseUrl="https://api.asgardeo.io/t/brandonmis372t"
      signInRedirectURL="http://localhost:5173"
      signOutRedirectURL="http://localhost:5173"
      scope={["openid", "profile"]}
    >
      <App />
    </AsgardeoProvider>
  </StrictMode>
);