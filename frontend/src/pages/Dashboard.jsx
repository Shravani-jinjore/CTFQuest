function Dashboard({ user }) {
  return (
    <div>
      <h2>Welcome, {user.username}!</h2>
      <p>Role: {user.role} | XP: {user.xp}</p>
    </div>
  );
}

export default Dashboard;