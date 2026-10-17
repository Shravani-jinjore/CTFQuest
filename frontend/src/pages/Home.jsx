import { Link } from 'react-router-dom';

function Home({ user }) {
  return (
    <div>
      <section className="hero">
        <div className="hero-pill-badge">
          <span>⚡</span>
          <span>52 Progressive CTF Levels • Real In-Browser Terminals</span>
        </div>

        <h1>
          Master Linux, Git & Docker <br />
          <span className="gradient-accent">by Solving Real CTF Quests.</span>
        </h1>

        <p>
          No complex local setup required. Dive straight into private Linux containers
          inside your browser, hunt down hidden flags, and unlock progressive levels as you master skills.
        </p>

        <div className="row" style={{ justifyContent: 'center', gap: '14px', marginBottom: '44px' }}>
          {user ? (
            <Link to="/challenges">
              <button style={{ padding: '13px 28px', fontSize: '1.05rem' }}>
                Continue Your Quest →
              </button>
            </Link>
          ) : (
            <>
              <Link to="/register">
                <button style={{ padding: '13px 28px', fontSize: '1.05rem' }}>
                  Get Started for Free →
                </button>
              </Link>
              <Link to="/challenges">
                <button className="secondary" style={{ padding: '13px 24px', fontSize: '1.05rem' }}>
                  Explore 52 Challenges
                </button>
              </Link>
            </>
          )}
        </div>

        {/* Live Terminal Mockup */}
        <div className="hero-terminal-mockup">
          <div className="terminal-mockup-header">
            <div className="window-dots">
              <div className="window-dot red" />
              <div className="window-dot yellow" />
              <div className="window-dot green" />
            </div>
            <div className="terminal-mockup-title">player@ctfquest: ~ (linux-01-hidden-file)</div>
            <div style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
              Active Container
            </div>
          </div>
          <div className="terminal-mockup-body">
            <div><span className="prompt">player@ctfquest:~$</span> <span className="cmd">ls -la</span></div>
            <div style={{ color: '#94a3b8' }}>total 16</div>
            <div style={{ color: '#94a3b8' }}>drwxr-xr-x 2 player player 4096 Oct 17 10:00 .</div>
            <div style={{ color: '#94a3b8' }}>drwxr-xr-x 3 root   root   4096 Oct 17 09:59 ..</div>
            <div>-r--r--r-- 1 player player   37 Oct 17 10:00 <span style={{ color: '#38bdf8' }}>.secret_flag.txt</span></div>
            <div style={{ marginTop: '8px' }}><span className="prompt">player@ctfquest:~$</span> <span className="cmd">cat .secret_flag.txt</span></div>
            <div className="flag-output">CTFQUEST&#123;h1dd3n_d0t_f1l3_unc0v3r3d&#125;</div>
            <div style={{ marginTop: '8px' }}><span className="prompt">player@ctfquest:~$</span> <span className="cmd">submit CTFQUEST&#123;h1dd3n_d0t_f1l3_unc0v3r3d&#125;</span></div>
            <div className="success-output">
              🎉 [CTFQuest] Flag verified! +50 XP Awarded! Level 2 Unlocked!
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="hero-stats-bar">
          <div className="hero-stat-card">
            <div className="hero-stat-num">52</div>
            <div className="hero-stat-label">Progressive Levels</div>
          </div>
          <div className="hero-stat-card">
            <div className="hero-stat-num">3</div>
            <div className="hero-stat-label">Tracks (Linux, Git, Docker)</div>
          </div>
          <div className="hero-stat-card">
            <div className="hero-stat-num">1-Click</div>
            <div className="hero-stat-label">Instant Cloud Terminal</div>
          </div>
          <div className="hero-stat-card">
            <div className="hero-stat-num">100%</div>
            <div className="hero-stat-label">Gamified & Hands-on</div>
          </div>
        </div>

        {/* How It Works Pillars */}
        <div style={{ textAlign: 'left', marginBottom: '20px' }}>
          <h2>How CTFQuest Works</h2>
          <p className="muted">Learn by doing. Move from fundamentals to advanced privilege escalation.</p>
        </div>

        <div className="steps">
          <div className="step">
            <span className="step-num-badge">01. Learn & Read</span>
            <h4>Interactive Lessons</h4>
            <p>Bite-sized visual guides covering terminal navigation, bash scripts, permissions, Git branching, and Docker files.</p>
          </div>
          <div className="step">
            <span className="step-num-badge">02. Spin Up Terminal</span>
            <h4>Sandboxed Containers</h4>
            <p>Every challenge starts an isolated Linux environment in seconds. Practice real commands with zero risk to your machine.</p>
          </div>
          <div className="step">
            <span className="step-num-badge">03. Find the Flag</span>
            <h4>Capture The Flag</h4>
            <p>Hunt for encrypted passwords, inspect sockets, decode base64 strings, reconstruct Git reflogs, and find the flag.</p>
          </div>
          <div className="step">
            <span className="step-num-badge">04. Unlock Next Level</span>
            <h4>Gated Progression</h4>
            <p>Levels unlock sequentially as you conquer challenges. Climb leaderboards, maintain streaks, and earn hacker badges.</p>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="card" style={{
          marginTop: '48px',
          textAlign: 'center',
          padding: '40px 24px',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.08) 100%)',
          borderColor: 'rgba(99, 102, 241, 0.35)'
        }}>
          <h2 style={{ marginBottom: '8px' }}>Ready to Test Your Skills?</h2>
          <p className="muted" style={{ maxWidth: '520px', margin: '0 auto 20px' }}>
            Join CTFQuest today, solve your first challenge in under 2 minutes, and climb the global leaderboard.
          </p>
          <Link to="/challenges">
            <button style={{ padding: '12px 28px', fontSize: '1rem' }}>
              Jump to Challenges →
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Home;