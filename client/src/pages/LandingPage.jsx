function LandingPage({ onLogin }) {
  return (
    <div>
        <h1>Welcome to Lectron</h1>
        <p>Your one-stop solution for complex coding tutorials.</p>
        <button onClick={onLogin}>Login with Google</button>
    </div>
  );
}

export default LandingPage;