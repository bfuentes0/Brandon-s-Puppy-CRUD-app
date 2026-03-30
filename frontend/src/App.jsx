import "./App.css";
import Header from "./components/Header";
import Body from "./components/Body";
import Footer from "./components/Footer";

import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
  UserDropdown
} from "@asgardeo/react";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <>
      <SignedIn>
        <Router>
          <Header />

          <Routes>
            <Route path="/" element={<Body />} />
          </Routes>

          <Footer />
          <br />
          <UserDropdown />
          <SignOutButton />
        </Router>
      </SignedIn>

      <SignedOut>
        <h2>Please sign in to access this app</h2>
        <SignInButton />
      </SignedOut>
    </>
  );
}

export default App;