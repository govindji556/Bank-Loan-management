import React, { useState } from "react";

function Login({ setRole, setUsername }) {
  const [form, setForm] = useState({
    username: "",
    password: "",
    role: "user"
  });

  const handleLogin = async () => {
    const res = await fetch("http://localhost:8000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(form)
    });

    const data = await res.json();

    if (res.ok) {
      setRole(data.role);
      setUsername(form.username);
    } else {
      alert("Login failed");
    }
  };

  return (
    <div className="card">
      <h2>Login</h2>

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

      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

export default Login;
