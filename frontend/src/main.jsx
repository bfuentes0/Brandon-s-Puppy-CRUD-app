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
      signInRedirectURL="https://brandon-s-puppy-crud-app-1.onrender.com"
      signOutRedirectURL="https://brandon-s-puppy-crud-app-1.onrender.com"
      scope={["openid", "profile"]}
    >
      <App />
    </AsgardeoProvider>
  </StrictMode>
);