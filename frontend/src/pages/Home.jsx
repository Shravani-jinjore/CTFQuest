import { Link } from 'react-router-dom';

function Home({ user }) {
  return (
    <div className="hero">
      <h2>Learn. Practice. Get Stuck. Conquer the Challenge.</h2>
      <p>
        Master Linux, Git and Docker by solving hands-on CTF challenges in a
        private terminal that runs right in your browser.
      </p>
      <div className="row">
        {user ? (
          <Link to="/challenges"><button>Start a challenge</button></Link>
        ) : (
          <>
            <Link to="/register"><button>Get started</button></Link>
            <Link to="/login"><button className="secondary">Log in</button></Link>
          </>
        )}
      </div>
      <div className="steps">
        <div className="step"><b>1. Learn</b><br />Short lessons with examples</div>
        <div className="step"><b>2. Practice</b><br />A real Linux terminal</div>
        <div className="step"><b>3. Capture</b><br />Find the hidden flag</div>
        <div className="step"><b>4. Level up</b><br />XP, badges and streaks</div>
      </div>
    </div>
  );
}

export default Home;