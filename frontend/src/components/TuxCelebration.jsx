import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function TuxCelebration({
  challengeTitle,
  xpAwarded,
  firstBlood = false,
  badgesEarned = [],
  nextId,
  nextTitle,
  onClose,
}) {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(4);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!nextId || isPaused) return;

    if (countdown <= 0) {
      navigate(`/challenges/${nextId}`);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown, nextId, isPaused, navigate]);

  function handleGoNext() {
    if (nextId) {
      navigate(`/challenges/${nextId}`);
    } else {
      navigate('/challenges');
    }
  }

  function handlePause() {
    setIsPaused(true);
  }

  return (
    <div className="tux-modal-overlay">
      {/* Floating Confetti Elements */}
      <div className="confetti-container" aria-hidden="true">
        <span className="confetti c1">🎉</span>
        <span className="confetti c2">✨</span>
        <span className="confetti c3">⭐</span>
        <span className="confetti c4">🎈</span>
        <span className="confetti c5">💎</span>
        <span className="confetti c6">🌟</span>
        <span className="confetti c7">✨</span>
        <span className="confetti c8">🎊</span>
      </div>

      <div className="tux-modal-card">
        {/* Cute Speech Bubble */}
        <div className="tux-speech-bubble">
          <div className="bubble-header">
            <span className="bubble-icon">{firstBlood ? '🩸' : '✨'}</span>
            <strong>{firstBlood ? '🩸 FIRST BLOOD CLAIMED!!' : 'YAY! CORRECT ANSWER!!'}</strong>
            <span className="bubble-icon">{firstBlood ? '🩸' : '✨'}</span>
          </div>
          <p className="bubble-text">
            {firstBlood ? (
              <>Tux is stunned! You are the <strong>FIRST HACKER EVER</strong> to conquer <strong>{challengeTitle}</strong>! A true trailblazer! 🐧🩸</>
            ) : (
              <>Tux is so proud of you! You conquered <strong>{challengeTitle}</strong> like an absolute cybersecurity legend! 🐧💖</>
            )}
          </p>
          <div className="bubble-tail" />
        </div>

        {/* Cute Kawaii Tux SVG Mascot */}
        <div className="tux-mascot-wrapper">
          <svg
            className="tux-mascot-svg"
            viewBox="0 0 200 200"
            width="170"
            height="170"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Tux Body Gradient */}
              <radialGradient id="tuxBodyGrad" cx="40%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#334155" />
                <stop offset="60%" stopColor="#0f172a" />
                <stop offset="100%" stopColor="#020617" />
              </radialGradient>
              {/* Tux Belly Gradient */}
              <linearGradient id="tuxBellyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="85%" stopColor="#f1f5f9" />
                <stop offset="100%" stopColor="#e2e8f0" />
              </linearGradient>
              {/* Beak / Feet Gradient */}
              <linearGradient id="tuxBeakGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
              {/* Party Hat Gradient */}
              <linearGradient id="partyHatGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ec4899" />
                <stop offset="50%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
              {/* Shadow filter */}
              <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Ground Shadow */}
            <ellipse cx="100" cy="188" rx="55" ry="8" fill="rgba(0, 0, 0, 0.35)" />

            {/* Left Foot */}
            <path
              d="M 62 178 C 50 178, 48 188, 62 192 C 75 194, 82 186, 78 178 Z"
              fill="url(#tuxBeakGrad)"
            />
            {/* Right Foot */}
            <path
              d="M 138 178 C 150 178, 152 188, 138 192 C 125 194, 118 186, 122 178 Z"
              fill="url(#tuxBeakGrad)"
            />

            {/* Main Plump Body */}
            <ellipse cx="100" cy="115" rx="60" ry="70" fill="url(#tuxBodyGrad)" />

            {/* White Chubby Belly */}
            <path
              d="M 64 125 C 64 85, 136 85, 136 125 C 136 165, 64 165, 64 125 Z"
              fill="url(#tuxBellyGrad)"
            />

            {/* Left Waving Flipper (raising up excitedly) */}
            <g className="tux-waving-flipper">
              <path
                d="M 45 105 C 20 85, 15 65, 30 55 C 42 48, 50 75, 48 105 Z"
                fill="#1e293b"
              />
              {/* Motion sparkles above left hand */}
              <circle cx="20" cy="48" r="2.5" fill="#facc15" />
              <circle cx="32" cy="38" r="1.8" fill="#38bdf8" />
            </g>

            {/* Right Flipper (Holding CTF Flag) */}
            <g>
              <path
                d="M 155 105 C 178 95, 182 82, 172 75 C 160 68, 150 90, 152 108 Z"
                fill="#1e293b"
              />
              {/* Flag Pole */}
              <line x1="168" y1="95" x2="182" y2="30" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
              {/* Flag Fabric */}
              <path
                d="M 182 30 L 150 42 L 182 54 Z"
                fill="#10b981"
              />
              <text x="168" y="45" fontSize="7" fontWeight="bold" fill="#ffffff" textAnchor="middle">CTF</text>
            </g>

            {/* Kawaii Cute Eyes */}
            {/* Left Eye */}
            <ellipse cx="82" cy="78" rx="10" ry="13" fill="#0f172a" />
            <ellipse cx="80" cy="74" rx="4.5" ry="6" fill="#ffffff" />
            <circle cx="85" cy="83" r="2" fill="#ffffff" />
            <circle cx="86" cy="74" r="1" fill="#38bdf8" />

            {/* Right Eye */}
            <ellipse cx="118" cy="78" rx="10" ry="13" fill="#0f172a" />
            <ellipse cx="116" cy="74" rx="4.5" ry="6" fill="#ffffff" />
            <circle cx="121" cy="83" r="2" fill="#ffffff" />
            <circle cx="122" cy="74" r="1" fill="#38bdf8" />

            {/* Cute Rosy Blushing Cheeks */}
            <ellipse cx="68" cy="94" rx="9" ry="6" fill="#fb7185" opacity="0.65" />
            <ellipse cx="132" cy="94" rx="9" ry="6" fill="#fb7185" opacity="0.65" />

            {/* Smiling Beak */}
            <path
              d="M 85 86 C 85 83, 115 83, 115 86 C 115 97, 85 97, 85 86 Z"
              fill="url(#tuxBeakGrad)"
            />
            {/* Happy Open Mouth */}
            <path
              d="M 91 91 C 94 99, 106 99, 109 91 Z"
              fill="#be123c"
            />
            {/* Cute Tongue */}
            <ellipse cx="100" cy="96" rx="4" ry="2" fill="#f43f5e" />

            {/* Party Celebration Hat */}
            <polygon points="100,20 84,52 116,52" fill="url(#partyHatGrad)" />
            {/* Hat Pom Pom */}
            <circle cx="100" cy="18" r="5" fill="#fef08a" />
            {/* Hat Stripes */}
            <path d="M 89 42 Q 100 46 111 42" stroke="#ffffff" strokeWidth="2" fill="none" opacity="0.8" />
            <path d="M 93 32 Q 100 35 107 32" stroke="#facc15" strokeWidth="2" fill="none" opacity="0.8" />
          </svg>
        </div>

        {/* Level & Rewards Overview */}
        <div className="tux-rewards-box">
          {firstBlood && (
            <div className="reward-badge" style={{ background: 'rgba(244, 63, 94, 0.2)', border: '1px solid #f43f5e', color: '#fda4af' }}>
              <span className="reward-icon">🩸</span>
              <span>First Blood!</span>
            </div>
          )}
          <div className="reward-badge xp-pill">
            <span className="reward-icon">⚡</span>
            <span>+{xpAwarded} XP Conquered</span>
          </div>
          {badgesEarned && badgesEarned.length > 0 && (
            <div className="reward-badge badge-pill">
              <span className="reward-icon">🏆</span>
              <span>Badge: {badgesEarned.join(', ')}</span>
            </div>
          )}
        </div>

        {/* Next Level Announcement */}
        {nextId ? (
          <div className="next-level-announcement">
            <span className="next-tag">NEXT CHALLENGE UNLOCKED 🔓</span>
            <div className="next-title">
              Level #{nextId}: {nextTitle || 'Next Quest'}
            </div>
            <p className="countdown-text">
              {isPaused ? (
                <span style={{ color: 'var(--accent)' }}>Auto-redirect paused. Take your time!</span>
              ) : (
                <>Advancing in <strong className="countdown-num">{countdown}s</strong>...</>
              )}
            </p>

            {/* Animated countdown bar */}
            {!isPaused && (
              <div className="countdown-bar-container">
                <div
                  className="countdown-bar-fill"
                  style={{ animationDuration: '4s' }}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="next-level-announcement">
            <span className="next-tag" style={{ color: 'var(--gold)' }}>ARENA CHAMPION 👑</span>
            <div className="next-title">You Have Conquered All 52 Challenges!</div>
            <p className="countdown-text">You are at the top of the hacker leaderboard!</p>
          </div>
        )}

        {/* Interactive Action Buttons */}
        <div className="tux-actions">
          <button
            onClick={handleGoNext}
            className="primary-btn pulse-glow"
            style={{ flex: 1, padding: '13px 20px', fontSize: '0.98rem' }}
          >
            {nextId ? 'Go to Next Level Now 🚀' : 'View Arena Leaderboard 🏆'}
          </button>

          {nextId && !isPaused && (
            <button
              onClick={handlePause}
              className="secondary-btn"
              style={{ padding: '13px 18px', fontSize: '0.9rem' }}
              title="Pause countdown to stay on this screen or check terminal"
            >
              Stay Here ⏸
            </button>
          )}

          {isPaused && (
            <button
              onClick={onClose}
              className="secondary-btn"
              style={{ padding: '13px 18px', fontSize: '0.9rem' }}
            >
              Close Popup ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default TuxCelebration;
