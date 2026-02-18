function UserDashboard({ username }) {
  return (
    <div className="dashboard">
      <h2>Welcome {username}</h2>
      <p>You are logged in as User.</p>
    </div>
  );
}

export default UserDashboard;
