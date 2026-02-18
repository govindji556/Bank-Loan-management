import React, { useState } from "react";

function Signup() {
  const [form, setForm] = useState({
    username: "",
    password: "",
    role: "user"
  });

  const handleSignup = async () => {
    const res = await fetch("http://localhost:8000/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(form)
    });

    if (res.ok) {
      alert("Account created successfully!");
    } else {
      alert("Signup failed");
    }
  };

  return (
    <div className="card">
      <h2>Sign Up</h2>

      <input
        type="text"
        placeholder="Username"
        onChange={(e) =>
          setForm({ ...form, username: e.target.value })
        }
      />

      <input
        type="password"
        placeholder="Password"
        onChange={(e) =>
          setForm({ ...form, password: e.target.value })
        }
      />

      <select
        onChange={(e) =>
          setForm({ ...form, role: e.target.value })
        }
      >
        <option value="user">User</option>
        <option value="manager">Manager</option>
      </select>

      <button onClick={handleSignup}>Create Account</button>
    </div>
  );
}

export default Signup;
