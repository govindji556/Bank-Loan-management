import React, { useState } from "react";
import Login from "./Login";
import Signup from "./Signup.js";
import UserDashboard from "./UserDashboard";
import ManagerDashboard from "./ManagerDashboard";
import "./styles.css";

function App() {
  const [page, setPage] = useState("login");
  const [role, setRole] = useState(null);
  const [username, setUsername] = useState("");

  if (role === "user") {
    return <UserDashboard username={username} />;
  }

  if (role === "manager") {
    return <ManagerDashboard />;
  }

  return (
    <div className="container">
      {page === "login" ? (
        <>
          <Login setRole={setRole} setUsername={setUsername} />
          <p className="switch" onClick={() => setPage("signup")}>
            Don't have an account? Sign Up
          </p>
        </>
      ) : (
        <>
          <Signup />
          <p className="switch" onClick={() => setPage("login")}>
            Already have an account? Login
          </p>
        </>
      )}
    </div>
  );
}

export default App;
