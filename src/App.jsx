import { useEffect, useRef, useState } from "react";

// ==================== CONSTANTS ====================
const GRID = 18;
const CELL = 20;
const SPEED = 100;
const DEV_WALLET = "0xC6DA0c478C7CCeac8354B2BFF141680823c730fF";

const SKINS = {
  baseNetwork: {
    name: "Base Network",
    snake: '#0052FF',
    head: '#0049E0',
    food: '#00D4FF',
    bg: '#0A0B0D',
    grid: '#1e293b',
    locked: false,
    price: 0,
    description: "Official Base colors 🔵"
  },
  nokia3310: {
    name: "Nokia 3310",
    snake: '#000000',
    head: '#000000',
    food: '#000000',
    bg: '#9bc700',
    grid: '#8ba600',
    locked: false,
    price: 0,
    description: "Classic monochrome LCD 📱"
  },
  gameboy: {
    name: "Game Boy",
    snake: '#0f380f',
    head: '#0f380f',
    food: '#0f380f',
    bg: '#9bbc0f',
    grid: '#8bac0f',
    locked: false,
    price: 0,
    description: "1989 nostalgia 🎮"
  },
  atari: {
    name: "Atari 2600",
    snake: '#d85000',
    head: '#c84000',
    food: '#fcfc00',
    bg: '#000000',
    grid: '#1a0000',
    locked: true,
    price: 0.0005,
    description: "Retro console legend 🕹️"
  },
  commodore64: {
    name: "Commodore 64",
    snake: '#4040e0',
    head: '#3030d0',
    food: '#a0a0a0',
    bg: '#4040e0',
    grid: '#3030d0',
    locked: true,
    price: 0.0005,
    description: "80s computer aesthetic 💾"
  },
  arcade: {
    name: "Arcade CRT",
    snake: '#00ff00',
    head: '#00dd00',
    food: '#ffff00',
    bg: '#000000',
    grid: '#001a00',
    locked: true,
    price: 0.0005,
    description: "Green phosphor glow 👾"
  }
};

// ==================== UTILS ====================
const playSound = (freq, duration = 50, type = 'sine') => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.frequency.value = freq;
    oscillator.type = type;
    gainNode.gain.value = 0.1;
    
    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + duration / 1000);
  } catch (err) {
    console.log('Audio not supported');
  }
};

const randomFood = () => ({
  x: Math.floor(Math.random() * GRID),
  y: Math.floor(Math.random() * GRID),
});

const getWeekStart = () => {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday.getTime();
};

// ==================== LOADING SCREEN ====================
function LoadingScreen({ progress }) {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'linear-gradient(135deg, #0A0B0D 0%, #000814 50%, #001d3d 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      animation: progress === 100 ? 'fadeOut 0.3s ease-out forwards' : 'none'
    }}>
      <div style={{
        marginBottom: '40px',
        animation: 'pulse 2s ease-in-out infinite'
      }}>
        <svg width="120" height="120" viewBox="0 0 120 120" style={{
          filter: 'drop-shadow(0 0 20px rgba(0, 82, 255, 0.5))'
        }}>
          <rect x="20" y="60" width="20" height="20" fill="#0052FF" />
          <rect x="40" y="60" width="20" height="20" fill="#0052FF" />
          <rect x="60" y="60" width="20" height="20" fill="#0052FF" />
          <rect x="80" y="60" width="20" height="20" fill="#0052FF" />
          <rect x="80" y="40" width="20" height="20" fill="#0049E0" />
          <rect x="80" y="20" width="20" height="20" fill="#0049E0" />
          <rect x="60" y="20" width="20" height="20" fill="#0049E0" />
          <rect x="40" y="20" width="20" height="20" fill="#00D4FF" />
          <rect x="44" y="24" width="4" height="4" fill="#000" />
          <rect x="52" y="24" width="4" height="4" fill="#000" />
          <circle cx="25" cy="25" r="8" fill="#ef4444" />
          <rect x="24" y="18" width="2" height="5" fill="#22c55e" />
        </svg>
      </div>

      <h1 style={{
        fontSize: '48px',
        fontWeight: '900',
        background: 'linear-gradient(135deg, #0052FF, #00D4FF)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: '12px',
        letterSpacing: '4px',
        textShadow: '0 0 30px rgba(0, 82, 255, 0.3)'
      }}>
        SNAKE
      </h1>

      <p style={{
        fontSize: '14px',
        opacity: 0.7,
        marginBottom: '40px',
        letterSpacing: '2px'
      }}>
        ON BASE NETWORK
      </p>

      <div style={{
        width: '280px',
        height: '8px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '999px',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <div style={{
          width: `${progress}%`,
          height: '100%',
          background: 'linear-gradient(90deg, #0052FF, #00D4FF)',
          borderRadius: '999px',
          transition: 'width 0.3s ease-out',
          boxShadow: '0 0 10px rgba(0, 82, 255, 0.5)'
        }} />
      </div>

      <p style={{
        marginTop: '16px',
        fontSize: '12px',
        opacity: 0.6,
        letterSpacing: '1px'
      }}>
        {progress < 100 ? `LOADING... ${progress}%` : 'READY!'}
      </p>

      <div style={{
        position: 'absolute',
        bottom: '40px',
        display: 'flex',
        gap: '8px'
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: '12px',
            height: '12px',
            background: '#0052FF',
            animation: `bounce 1s ease-in-out ${i * 0.2}s infinite`
          }} />
        ))}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; pointer-events: none; }
        }
      `}</style>
    </div>
  );
}

// ==================== MAIN MENU ====================
function MainMenu({ onStartGame, highScore }) {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'radial-gradient(circle at top, #0A0B0D, #000)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 998,
      padding: '20px'
    }}>
      <svg width="150" height="150" viewBox="0 0 120 120" style={{
        filter: 'drop-shadow(0 0 30px rgba(0, 82, 255, 0.6))',
        marginBottom: '20px'
      }}>
        <rect x="20" y="60" width="20" height="20" fill="#0052FF" />
        <rect x="40" y="60" width="20" height="20" fill="#0052FF" />
        <rect x="60" y="60" width="20" height="20" fill="#0052FF" />
        <rect x="80" y="60" width="20" height="20" fill="#0052FF" />
        <rect x="80" y="40" width="20" height="20" fill="#0049E0" />
        <rect x="80" y="20" width="20" height="20" fill="#0049E0" />
        <rect x="60" y="20" width="20" height="20" fill="#0049E0" />
        <rect x="40" y="20" width="20" height="20" fill="#00D4FF" />
        <rect x="44" y="24" width="4" height="4" fill="#000" />
        <rect x="52" y="24" width="4" height="4" fill="#000" />
        <circle cx="25" cy="25" r="8" fill="#ef4444" />
        <rect x="24" y="18" width="2" height="5" fill="#22c55e" />
      </svg>

      <h1 style={{
        fontSize: '72px',
        fontWeight: '900',
        background: 'linear-gradient(135deg, #0052FF, #00D4FF)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: '8px',
        letterSpacing: '6px'
      }}>
        SNAKE
      </h1>

      <p style={{
        fontSize: '16px',
        opacity: 0.7,
        marginBottom: '40px',
        letterSpacing: '3px'
      }}>
        ON BASE NETWORK
      </p>

      {highScore > 0 && (
        <p style={{
          fontSize: '18px',
          marginBottom: '30px',
          opacity: 0.9
        }}>
          🏆 High Score: <span style={{ fontWeight: '700', color: '#fbbf24' }}>{highScore}</span>
        </p>
      )}

      <button onClick={onStartGame} style={{
        padding: '18px 48px',
        fontSize: '24px',
        borderRadius: '999px',
        border: 'none',
        background: 'linear-gradient(135deg, #0052FF, #0049E0)',
        color: 'white',
        fontWeight: '900',
        cursor: 'pointer',
        boxShadow: '0 10px 30px rgba(0, 82, 255, 0.4)',
        transition: 'transform 0.2s',
        letterSpacing: '2px'
      }}
      onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
      onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
      >
        START GAME
      </button>

      <div style={{
        marginTop: '50px',
        textAlign: 'center',
        opacity: 0.6,
        fontSize: '14px'
      }}>
        <p>Use Arrow Keys or WASD to move</p>
        <p>Press SPACE to pause</p>
      </div>
    </div>
  );
}

// ==================== GAME OVER OVERLAY ====================
function GameOverOverlay({ score, onRestart, onShareTwitter, onShareFarcaster, onShareBase, isPaused, isVictory }) {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: isVictory ? 'rgba(34, 197, 94, 0.15)' : 'rgba(2, 6, 23, 0.95)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 999,
      padding: '20px',
      animation: isVictory ? 'victoryPulse 2s ease-in-out infinite' : 'none'
    }}>
      {isVictory && (
        <>
          {/* Confetti Effect */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            overflow: 'hidden',
            pointerEvents: 'none'
          }}>
            {[...Array(50)].map((_, i) => (
              <div key={i} style={{
                position: 'absolute',
                top: '-10px',
                left: `${Math.random() * 100}%`,
                width: '10px',
                height: '10px',
                background: ['#fbbf24', '#ef4444', '#8b5cf6', '#0052FF', '#22c55e'][i % 5],
                animation: `fall ${2 + Math.random() * 3}s linear infinite`,
                animationDelay: `${Math.random() * 2}s`,
                opacity: 0.8
              }} />
            ))}
          </div>

          {/* Trophy Animation */}
          <div style={{
            fontSize: '120px',
            marginBottom: '20px',
            animation: 'bounce 1s ease-in-out infinite',
            filter: 'drop-shadow(0 0 30px rgba(251, 191, 36, 0.8))'
          }}>
            🏆
          </div>
        </>
      )}

      <h1 style={{ 
        fontSize: isVictory ? '48px' : '36px', 
        marginBottom: '12px', 
        fontWeight: '900',
        background: isVictory ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' : 'none',
        WebkitBackgroundClip: isVictory ? 'text' : 'none',
        WebkitTextFillColor: isVictory ? 'transparent' : 'inherit',
        textShadow: isVictory ? '0 0 40px rgba(251, 191, 36, 0.5)' : 'none',
        animation: isVictory ? 'pulse 2s ease-in-out infinite' : 'none'
      }}>
        {isVictory ? 'PERFECT GAME!' : isPaused ? 'PAUSED' : 'GAME OVER'}
      </h1>

      {isVictory && (
        <p style={{
          fontSize: '18px',
          marginBottom: '8px',
          opacity: 0.9,
          letterSpacing: '2px',
          fontWeight: '700',
          color: '#fbbf24'
        }}>
          ⭐ YOU FILLED THE ENTIRE GRID! ⭐
        </p>
      )}

      <p style={{ 
        opacity: 0.8, 
        marginBottom: '24px', 
        fontSize: '20px',
        fontWeight: '700'
      }}>
        Score: <span style={{ 
          fontWeight: '900', 
          color: isVictory ? '#fbbf24' : '#fbbf24',
          fontSize: '24px'
        }}>{score}</span>
        {isVictory && <span style={{ marginLeft: '10px', fontSize: '24px' }}>🎉</span>}
      </p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '320px' }}>
        <button onClick={onRestart} style={{
          padding: '14px 28px',
          fontSize: '16px',
          borderRadius: '999px',
          border: 'none',
          background: isVictory 
            ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' 
            : 'linear-gradient(135deg, #0052FF, #0049E0)',
          color: isVictory ? '#422006' : 'white',
          fontWeight: '800',
          cursor: 'pointer',
          width: '100%',
          boxShadow: isVictory ? '0 10px 30px rgba(251, 191, 36, 0.4)' : 'none'
        }}>
          {isVictory ? '🎮 PLAY AGAIN' : '🔄 RESTART GAME'}
        </button>
        
        {!isPaused && score > 0 && (
          <>
            <div style={{ 
              fontSize: '12px', 
              opacity: 0.6, 
              textAlign: 'center', 
              margin: '8px 0 4px 0',
              letterSpacing: '1px'
            }}>
              SHARE YOUR {isVictory ? 'VICTORY' : 'SCORE'}
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button onClick={onShareTwitter} style={{
                padding: '12px 20px',
                fontSize: '14px',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #1DA1F2, #0c85d0)',
                color: 'white',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}>
                <span style={{ fontSize: '18px' }}>𝕏</span> Twitter
              </button>

              <button onClick={onShareFarcaster} style={{
                padding: '12px 20px',
                fontSize: '14px',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #8a63d2, #7c3aed)',
                color: 'white',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}>
                <span style={{ fontSize: '18px' }}>🟣</span> Farcaster
              </button>
            </div>

            <button onClick={onShareBase} style={{
              padding: '12px 20px',
              fontSize: '14px',
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(135deg, #0052FF, #0049E0)',
              color: 'white',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              width: '100%'
            }}>
              <span style={{ fontSize: '18px' }}>🔵</span> Share to Base
            </button>
          </>
        )}
      </div>

      {isPaused && (
        <p style={{ 
          marginTop: '20px', 
          opacity: 0.6, 
          fontSize: '14px' 
        }}>
          Press SPACE or Resume to continue
        </p>
      )}

      {isVictory && (
        <div style={{
          marginTop: '30px',
          padding: '16px 24px',
          background: 'rgba(251, 191, 36, 0.1)',
          border: '2px solid rgba(251, 191, 36, 0.3)',
          borderRadius: '16px',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>
            🎊 You're a Snake Master! 🎊
          </p>
          <p style={{ fontSize: '12px', opacity: 0.7 }}>
            You've achieved the impossible - filling all {GRID * GRID} cells!
          </p>
        </div>
      )}

      <style>{`
        @keyframes fall {
          to { transform: translateY(100vh) rotate(360deg); }
        }
        @keyframes victoryPulse {
          0%, 100% { background: rgba(34, 197, 94, 0.15); }
          50% { background: rgba(251, 191, 36, 0.2); }
        }
      `}</style>
    </div>
  );
}

// ==================== MAIN APP ====================
export default function App() {
  const canvasRef = useRef(null);
  const isMobile = window.innerWidth < 768;

  const [snake, setSnake] = useState([{ x: 9, y: 9 }]);
  const [dir, setDir] = useState({ x: 1, y: 0 });
  const [food, setFood] = useState(randomFood());
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showMainMenu, setShowMainMenu] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  
  const [showSkinSelector, setShowSkinSelector] = useState(false);
  const [showTipsModal, setShowTipsModal] = useState(false);
  const [showDpad, setShowDpad] = useState(isMobile);
  const [showTournament, setShowTournament] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const [currentSkin, setCurrentSkin] = useState("baseNetwork");
  const [ownedSkins, setOwnedSkins] = useState(["baseNetwork", "nokia3310", "gameboy"]);
  
  const [leaderboard, setLeaderboard] = useState([]);
  const [tournamentScores, setTournamentScores] = useState([]);
  const [showVictory, setShowVictory] = useState(false);
  const [isPerfectGame, setIsPerfectGame] = useState(false);

  useEffect(() => {
    loadGameData();
    simulateLoading();
  }, []);

  async function simulateLoading() {
    const steps = [
      { progress: 20, delay: 300 },
      { progress: 40, delay: 400 },
      { progress: 60, delay: 300 },
      { progress: 80, delay: 400 },
      { progress: 100, delay: 500 }
    ];

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, step.delay));
      setLoadingProgress(step.progress);
    }

    setTimeout(() => {
      setLoading(false);
      setShowMainMenu(true);
    }, 300);
  }

  async function loadGameData() {
    try {
      const skinData = await window.storage.get('owned_skins');
      if (skinData) {
        setOwnedSkins(JSON.parse(skinData.value));
      }
      
      const currentSkinData = await window.storage.get('current_skin');
      if (currentSkinData) {
        setCurrentSkin(currentSkinData.value);
      }
      
      const lbData = await window.storage.get('leaderboard', true);
      if (lbData) {
        setLeaderboard(JSON.parse(lbData.value));
      }

      const hsData = await window.storage.get('high_score');
      if (hsData) {
        setHighScore(parseInt(hsData.value));
      }

      const tournamentData = await window.storage.get('tournament_weekly', true);
      if (tournamentData) {
        setTournamentScores(JSON.parse(tournamentData.value));
      }

      const soundPref = await window.storage.get('sound_enabled');
      if (soundPref) {
        setSoundEnabled(soundPref.value === 'true');
      }
    } catch (err) {
      console.log('No saved data found');
    }
  }

  async function connectWallet() {
    if (typeof window.ethereum === 'undefined') {
      const confirmInstall = window.confirm(
        'No Web3 wallet detected!\n\n' +
        'Please install one of these wallets:\n' +
        '• MetaMask\n' +
        '• Coinbase Wallet\n' +
        '• Rainbow Wallet\n' +
        '• Trust Wallet\n\n' +
        'Click OK to install MetaMask'
      );
      
      if (confirmInstall) {
        window.open('https://metamask.io/download/', '_blank');
      }
      return;
    }

    try {
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (!accounts || accounts.length === 0) {
        alert('No accounts found. Please unlock your wallet.');
        return;
      }
      
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x2105' }],
        });
      } catch (switchError) {
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0x2105',
                chainName: 'Base',
                nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
                rpcUrls: ['https://mainnet.base.org'],
                blockExplorerUrls: ['https://basescan.org']
              }]
            });
          } catch (addError) {
            console.error('Failed to add Base network:', addError);
            alert('Failed to add Base network. Please add it manually in your wallet settings.');
            return;
          }
        } else if (switchError.code === 4001) {
          alert('Please switch to Base network to continue.');
          return;
        } else {
          throw switchError;
        }
      }

      setWalletAddress(accounts[0]);
      setWalletConnected(true);
      
      if (soundEnabled) playSound(600, 100, 'sine');
      
    } catch (err) {
      console.error('Wallet connection error:', err);
      
      let errorMessage = 'Failed to connect wallet.';
      
      if (err.code === 4001) {
        errorMessage = 'Connection rejected. Please approve the connection request.';
      } else if (err.code === -32002) {
        errorMessage = 'Connection request already pending. Please check your wallet.';
      } else if (err.message) {
        errorMessage = `Error: ${err.message}`;
      }
      
      alert(errorMessage);
    }
  }

  async function buySkin(skinId) {
    if (!walletConnected) {
      alert('Please connect your wallet first!');
      await connectWallet();
      return;
    }

    const skin = SKINS[skinId];
    if (!skin.locked) return;

    const confirmPurchase = window.confirm(
      `Purchase ${skin.name} for ${skin.price} ETH?\n\n` +
      `This will send ${skin.price} ETH to the developer on Base network.`
    );
    
    if (!confirmPurchase) return;

    try {
      const priceInWei = '0x' + Math.floor(skin.price * 1e18).toString(16);
      
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: walletAddress,
          to: DEV_WALLET,
          value: priceInWei,
          gas: '0x5208',
        }],
      });

      alert(`Purchase initiated! 🎉\n\nTransaction: ${txHash.slice(0, 10)}...`);
      
      const newOwned = [...ownedSkins, skinId];
      setOwnedSkins(newOwned);
      setCurrentSkin(skinId);
      
      await window.storage.set('owned_skins', JSON.stringify(newOwned));
      await window.storage.set('current_skin', skinId);
      
      if (soundEnabled) playSound(1000, 150, 'square');
      
      setShowSkinSelector(false);
    } catch (err) {
      console.error('Purchase failed:', err);
      
      let errorMsg = 'Purchase cancelled or failed.';
      if (err.code === 4001) {
        errorMsg = 'Transaction rejected by user.';
      } else if (err.code === -32603) {
        errorMsg = 'Insufficient funds or network error.';
      }
      
      alert(errorMsg);
    }
  }

  async function sendTip(amount) {
    if (!walletConnected) {
      alert('Please connect your wallet first!');
      return;
    }

    try {
      const priceInWei = '0x' + Math.floor(amount * 1e18).toString(16);
      
      await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: walletAddress,
          to: DEV_WALLET,
          value: priceInWei,
        }],
      });

      alert('Thank you for the tip! 🙏💙');
      setShowTipsModal(false);
    } catch (err) {
      console.error('Tip failed:', err);
    }
  }

  useEffect(() => {
    const handleKey = (e) => {
      if (gameOver || !gameStarted) return;
      const k = e.key.toLowerCase();

      if ((k === "arrowup" || k === "w") && dir.y !== 1)
        setDir({ x: 0, y: -1 });
      if ((k === "arrowdown" || k === "s") && dir.y !== -1)
        setDir({ x: 0, y: 1 });
      if ((k === "arrowleft" || k === "a") && dir.x !== 1)
        setDir({ x: -1, y: 0 });
      if ((k === "arrowright" || k === "d") && dir.x !== -1)
        setDir({ x: 1, y: 0 });
      if (k === " ") setPaused((p) => !p);
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [dir, gameOver, gameStarted]);

  useEffect(() => {
    if (gameOver || paused || !gameStarted) return;

    const loop = setInterval(() => {
      setSnake((prev) => {
        const head = {
          x: prev[0].x + dir.x,
          y: prev[0].y + dir.y,
        };

        if (
          head.x < 0 ||
          head.y < 0 ||
          head.x >= GRID ||
          head.y >= GRID ||
          prev.some((s) => s.x === head.x && s.y === head.y)
        ) {
          endGame();
          return prev;
        }

        const next = [head, ...prev];

        if (head.x === food.x && head.y === food.y) {
          setFood(randomFood());
          setScore((s) => s + 1);
          if (soundEnabled) playSound(800, 80, 'square');
          
          // Check if player won (filled entire grid)
          if (next.length >= GRID * GRID) {
            victoryGame();
            return next;
          }
        } else {
          next.pop();
        }

        return next;
      });
    }, SPEED);

    return () => clearInterval(loop);
  }, [dir, food, paused, gameOver, soundEnabled, gameStarted]);

  useEffect(() => {
    if (!gameStarted) return;
    
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    
    const skin = SKINS[currentSkin];

    ctx.fillStyle = skin.bg;
    ctx.fillRect(0, 0, GRID * CELL, GRID * CELL);

    ctx.strokeStyle = skin.grid;
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= GRID; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL, 0);
      ctx.lineTo(i * CELL, GRID * CELL);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * CELL);
      ctx.lineTo(GRID * CELL, i * CELL);
      ctx.stroke();
    }

    ctx.fillStyle = skin.food;
    ctx.fillRect(food.x * CELL, food.y * CELL, CELL, CELL);

    snake.forEach((s, i) => {
      ctx.fillStyle = i === 0 ? skin.head : skin.snake;
      ctx.fillRect(s.x * CELL, s.y * CELL, CELL, CELL);
    });
  }, [snake, food, currentSkin, gameStarted]);

  function handleCanvasClick(e) {
    if (gameOver || paused) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const mx = rect.width / 2;
    const my = rect.height / 2;

    if (Math.abs(x - mx) > Math.abs(y - my)) {
      if (x < mx && dir.x !== 1) setDir({ x: -1, y: 0 });
      if (x > mx && dir.x !== -1) setDir({ x: 1, y: 0 });
    } else {
      if (y < my && dir.y !== 1) setDir({ x: 0, y: -1 });
      if (y > my && dir.y !== -1) setDir({ x: 0, y: 1 });
    }
  }

  async function endGame() {
    setGameOver(true);
    setIsPerfectGame(false);
    
    if (soundEnabled) {
      playSound(200, 100);
      setTimeout(() => playSound(150, 200), 120);
    }
    
    if (score > highScore) {
      setHighScore(score);
      await window.storage.set('high_score', score.toString());
    }

    await saveScore(false);
  }

  async function victoryGame() {
    setGameOver(true);
    setShowVictory(true);
    setIsPerfectGame(true);
    
    // Victory sound sequence
    if (soundEnabled) {
      playSound(523, 150, 'square'); // C
      setTimeout(() => playSound(659, 150, 'square'), 150); // E
      setTimeout(() => playSound(784, 150, 'square'), 300); // G
      setTimeout(() => playSound(1047, 300, 'square'), 450); // C (high)
    }
    
    const perfectScore = GRID * GRID;
    if (perfectScore > highScore) {
      setHighScore(perfectScore);
      await window.storage.set('high_score', perfectScore.toString());
    }

    await saveScore(true);
  }

  async function saveScore(isPerfect) {
    try {
      const entry = {
        score: isPerfect ? GRID * GRID : score,
        address: walletConnected ? walletAddress.slice(0, 6) + '...' + walletAddress.slice(-4) : 'Guest',
        timestamp: Date.now(),
        perfect: isPerfect || false
      };

      const newLB = [...leaderboard, entry]
        .sort((a, b) => {
          if (a.perfect && !b.perfect) return -1;
          if (!a.perfect && b.perfect) return 1;
          return b.score - a.score;
        })
        .slice(0, 10);

      setLeaderboard(newLB);
      await window.storage.set('leaderboard', JSON.stringify(newLB), true);

      const weekStart = getWeekStart();
      const tournamentEntry = {
        ...entry,
        week: weekStart
      };

      const currentWeekScores = tournamentScores.filter(s => s.week === weekStart);
      const otherWeekScores = tournamentScores.filter(s => s.week !== weekStart);
      
      const newTournament = [...currentWeekScores, tournamentEntry]
        .sort((a, b) => {
          if (a.perfect && !b.perfect) return -1;
          if (!a.perfect && b.perfect) return 1;
          return b.score - a.score;
        })
        .slice(0, 20);

      const allTournamentScores = [...newTournament, ...otherWeekScores];
      setTournamentScores(allTournamentScores);
      await window.storage.set('tournament_weekly', JSON.stringify(allTournamentScores), true);
    } catch (err) {
      console.error('Failed to update leaderboard:', err);
    }
  }

  function shareToTwitter() {
    const text = `🐍 I just scored ${score} points in Base Snake Game!${score > 50 ? ' 🔥' : ''}\n\nCan you beat my score?\n\nPlay now 👇`;
    const url = window.location.href;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank');
  }

  function shareToFarcaster() {
    const text = `🐍 I just scored ${score} points in Base Snake Game!${score > 50 ? ' 🔥' : ''}\n\nCan you beat my score?`;
    const url = window.location.href;
    const farcasterUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}&embeds[]=${encodeURIComponent(url)}`;
    window.open(farcasterUrl, '_blank');
  }

  function shareToBase() {
    // Share via Base app (if available) or copy to clipboard
    const text = `🐍 I just scored ${score} points in Base Snake Game!${score > 50 ? ' 🔥' : ''}\n\nCan you beat my score?\n\n${window.location.href}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Base Snake Game Score',
        text: text,
        url: window.location.href
      }).catch(err => console.log('Share cancelled'));
    } else {
      navigator.clipboard.writeText(text).then(() => {
        alert('Score copied to clipboard! 📋\n\nShare it on Base or anywhere you like! 💙');
      }).catch(() => {
        alert('Unable to copy. Please share manually:\n\n' + text);
      });
    }
  }

  function restart() {
    setSnake([{ x: 9, y: 9 }]);
    setDir({ x: 1, y: 0 });
    setFood(randomFood());
    setScore(0);
    setGameOver(false);
    setPaused(false);
    setShowVictory(false);
    setIsPerfectGame(false);
  }

  async function selectSkin(skinId) {
    if (!ownedSkins.includes(skinId)) {
      await buySkin(skinId);
    } else {
      setCurrentSkin(skinId);
      await window.storage.set('current_skin', skinId);
      setShowSkinSelector(false);
    }
  }

  function handleStartGame() {
    setShowMainMenu(false);
    setGameStarted(true);
  }

  if (loading) {
    return <LoadingScreen progress={loadingProgress} />;
  }

  if (showMainMenu) {
    return <MainMenu onStartGame={handleStartGame} highScore={highScore} />;
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at top, #0A0B0D, #000)',
      color: '#e5e7eb',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      gap: '14px'
    }}>
      {/* Header */}
      <div style={{
        width: '100%',
        maxWidth: '360px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <svg width="32" height="32" viewBox="0 0 32 32" style={{
            filter: 'drop-shadow(0 2px 8px rgba(0, 82, 255, 0.4))'
          }}>
            <rect x="4" y="16" width="6" height="6" fill="#0052FF" />
            <rect x="10" y="16" width="6" height="6" fill="#0052FF" />
            <rect x="16" y="16" width="6" height="6" fill="#0049E0" />
            <rect x="16" y="10" width="6" height="6" fill="#0049E0" />
            <rect x="16" y="4" width="6" height="6" fill="#00D4FF" />
            <rect x="18" y="6" width="1.5" height="1.5" fill="#000" />
            <circle cx="6" cy="6" r="2.5" fill="#ef4444" />
          </svg>
          
          <h1 style={{ 
            fontSize: '24px', 
            background: 'linear-gradient(135deg, #0052FF, #00D4FF)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: '800'
          }}>
            SNAKE
          </h1>
        </div>
        
        {!walletConnected ? (
          <button onClick={connectWallet} style={{
            background: 'linear-gradient(135deg, #0052FF, #0049E0)',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '999px',
            color: 'white',
            fontWeight: '700',
            fontSize: '14px',
            cursor: 'pointer'
          }}>
            Connect Wallet
          </button>
        ) : (
          <span style={{ fontSize: '12px', opacity: 0.8 }}>
            {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </span>
        )}
      </div>

      {/* Top Bar */}
      <div style={{
        width: '100%',
        maxWidth: '360px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span style={{ fontWeight: '600' }}>
          Score: {score} | Best: {highScore}
        </span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setPaused(p => !p)} style={{
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            border: 'none',
            padding: '6px 12px',
            borderRadius: '999px',
            fontSize: '12px',
            fontWeight: '700',
            color: '#052e16',
            cursor: 'pointer'
          }}>
            {paused ? 'Resume' : 'Pause'}
          </button>
          <button onClick={restart} style={{
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            border: 'none',
            padding: '6px 12px',
            borderRadius: '999px',
            fontSize: '12px',
            fontWeight: '700',
            color: 'white',
            cursor: 'pointer'
          }}>
            Restart
          </button>
        </div>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={GRID * CELL}
        height={GRID * CELL}
        onClick={handleCanvasClick}
        style={{
          width: '360px',
          height: '360px',
          borderRadius: '18px',
          background: SKINS[currentSkin].bg,
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
          cursor: 'pointer'
        }}
      />

      {/* Action Buttons */}
      <div style={{
        width: '100%',
        maxWidth: '360px',
        display: 'flex',
        gap: '8px',
        justifyContent: 'center'
      }}>
        <button onClick={() => setShowSkinSelector(true)} style={{
          flex: 1,
          background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
          border: 'none',
          padding: '10px',
          borderRadius: '12px',
          color: 'white',
          fontWeight: '700',
          cursor: 'pointer'
        }}>
          🎨 Skins
        </button>
        <button onClick={() => setShowTournament(true)} style={{
          flex: 1,
          background: 'linear-gradient(135deg, #ec4899, #db2777)',
          border: 'none',
          padding: '10px',
          borderRadius: '12px',
          color: 'white',
          fontWeight: '700',
          cursor: 'pointer'
        }}>
          🏆 Tournament
        </button>
        <button onClick={() => setShowTipsModal(true)} style={{
          flex: 1,
          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
          border: 'none',
          padding: '10px',
          borderRadius: '12px',
          color: 'white',
          fontWeight: '700',
          cursor: 'pointer'
        }}>
          💎 Tip
        </button>
        <button onClick={() => {
          setSoundEnabled(!soundEnabled);
          window.storage.set('sound_enabled', (!soundEnabled).toString());
        }} style={{
          background: 'linear-gradient(135deg, #64748b, #475569)',
          border: 'none',
          padding: '10px 16px',
          borderRadius: '12px',
          color: 'white',
          fontWeight: '700',
          cursor: 'pointer'
        }}>
          {soundEnabled ? '🔊' : '🔇'}
        </button>
        <button onClick={() => setShowDpad(!showDpad)} style={{
          background: 'linear-gradient(135deg, #64748b, #475569)',
          border: 'none',
          padding: '10px 16px',
          borderRadius: '12px',
          color: 'white',
          fontWeight: '700',
          cursor: 'pointer'
        }}>
          {showDpad ? '🎮' : '⌨️'}
        </button>
      </div>

      {/* D-PAD */}
      {showDpad && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 64px)',
          gridTemplateRows: 'repeat(3, 48px)',
          gap: '8px',
          marginTop: '6px'
        }}>
          <div />
          <button onClick={() => setDir({ x: 0, y: -1 })} style={{
            background: 'linear-gradient(180deg, #1e293b, #020617)',
            border: '1px solid #334155',
            borderRadius: '14px',
            color: '#e5e7eb',
            fontSize: '20px',
            fontWeight: '700',
            cursor: 'pointer'
          }}>▲</button>
          <div />
          <button onClick={() => setDir({ x: -1, y: 0 })} style={{
            background: 'linear-gradient(180deg, #1e293b, #020617)',
            border: '1px solid #334155',
            borderRadius: '14px',
            color: '#e5e7eb',
            fontSize: '20px',
            fontWeight: '700',
            cursor: 'pointer'
          }}>◀</button>
          <div style={{
            background: '#020617',
            borderRadius: '50%',
            boxShadow: 'inset 0 0 0 2px #1e293b'
          }} />
          <button onClick={() => setDir({ x: 1, y: 0 })} style={{
            background: 'linear-gradient(180deg, #1e293b, #020617)',
            border: '1px solid #334155',
            borderRadius: '14px',
            color: '#e5e7eb',
            fontSize: '20px',
            fontWeight: '700',
            cursor: 'pointer'
          }}>▶</button>
          <div />
          <button onClick={() => setDir({ x: 0, y: 1 })} style={{
            background: 'linear-gradient(180deg, #1e293b, #020617)',
            border: '1px solid #334155',
            borderRadius: '14px',
            color: '#e5e7eb',
            fontSize: '20px',
            fontWeight: '700',
            cursor: 'pointer'
          }}>▼</button>
          <div />
        </div>
      )}

      {/* Leaderboard */}
      <div style={{
        width: '100%',
        maxWidth: '360px',
        background: '#020617',
        border: '1px solid #1e293b',
        borderRadius: '20px',
        padding: '14px 16px'
      }}>
        <h3 style={{
          fontSize: '14px',
          letterSpacing: '1px',
          opacity: 0.8,
          marginBottom: '10px'
        }}>GLOBAL LEADERBOARD</h3>
        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
          {leaderboard.length === 0 ? (
            <p style={{ opacity: 0.5, fontSize: '14px' }}>No scores yet. Be the first! 🚀</p>
          ) : (
            leaderboard.map((entry, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 10px',
                borderRadius: '12px',
                marginBottom: '6px',
                background: entry.perfect 
                  ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' 
                  : i === 0 
                    ? 'linear-gradient(135deg, #fde047, #facc15)' 
                    : '#0A0B0D',
                border: '1px solid #1e293b',
                color: (entry.perfect || i === 0) ? '#422006' : '#e5e7eb',
                fontWeight: (entry.perfect || i === 0) ? '800' : '400',
                position: 'relative'
              }}>
                <span>
                  {entry.perfect && '🏆 '}
                  #{i + 1} {entry.address}
                </span>
                <span>{entry.score}{entry.perfect && ' ⭐'}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Skin Selector Modal */}
      {showSkinSelector && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.95)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          zIndex: 1000
        }}>
          <div style={{
            background: '#0A0B0D',
            border: '2px solid #1e293b',
            borderRadius: '20px',
            padding: '24px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700' }}>🎨 Choose Your Skin</h2>
              <button onClick={() => setShowSkinSelector(false)} style={{
                background: 'none',
                border: 'none',
                color: '#e5e7eb',
                fontSize: '24px',
                cursor: 'pointer'
              }}>×</button>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '12px'
            }}>
              {Object.entries(SKINS).map(([id, skin]) => {
                const owned = ownedSkins.includes(id);
                const active = currentSkin === id;
                
                return (
                  <div key={id} style={{
                    background: active ? '#1e293b' : '#020617',
                    border: active ? '2px solid #0052FF' : '1px solid #1e293b',
                    borderRadius: '12px',
                    padding: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }} onClick={() => selectSkin(id)}>
                    <div style={{
                      width: '100%',
                      height: '80px',
                      background: skin.bg,
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '8px',
                      position: 'relative'
                    }}>
                      <div style={{
                        width: '20px',
                        height: '20px',
                        background: skin.snake,
                        marginRight: '4px'
                      }} />
                      <div style={{
                        width: '20px',
                        height: '20px',
                        background: skin.head
                      }} />
                      <div style={{
                        width: '16px',
                        height: '16px',
                        background: skin.food,
                        position: 'absolute',
                        top: '10px',
                        right: '10px'
                      }} />
                    </div>
                    <h4 style={{ fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                      {skin.name}
                    </h4>
                    <p style={{ fontSize: '10px', opacity: 0.7, marginBottom: '8px' }}>
                      {skin.description}
                    </p>
                    {owned ? (
                      <div style={{
                        background: active ? '#22c55e' : '#334155',
                        color: active ? '#052e16' : '#e5e7eb',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '700',
                        textAlign: 'center'
                      }}>
                        {active ? '✓ Active' : 'Owned'}
                      </div>
                    ) : (
                      <div style={{
                        background: 'linear-gradient(135deg, #0052FF, #0049E0)',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '700',
                        textAlign: 'center'
                      }}>
                        🔒 {skin.price} ETH
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tips Modal */}
      {showTipsModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.95)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          zIndex: 1000
        }}>
          <div style={{
            background: '#0A0B0D',
            border: '2px solid #1e293b',
            borderRadius: '20px',
            padding: '24px',
            maxWidth: '400px',
            width: '100%',
            textAlign: 'center'
          }}>
            <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>💎 Send a Tip</h2>
            <p style={{ opacity: 0.7, marginBottom: '20px', fontSize: '14px' }}>
              Support the developer and help keep this game running! 🙏
            </p>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px',
              marginBottom: '16px'
            }}>
              {[0.0001, 0.0005, 0.001, 0.005].map(amount => (
                <button key={amount} onClick={() => sendTip(amount)} style={{
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  border: 'none',
                  padding: '16px',
                  borderRadius: '12px',
                  color: 'white',
                  fontWeight: '700',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}>
                  {amount} ETH
                </button>
              ))}
            </div>

            <button onClick={() => setShowTipsModal(false)} style={{
              background: '#334155',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '12px',
              color: '#e5e7eb',
              fontWeight: '600',
              cursor: 'pointer',
              width: '100%'
            }}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Tournament Modal */}
      {showTournament && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.95)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          zIndex: 1000
        }}>
          <div style={{
            background: '#0A0B0D',
            border: '2px solid #1e293b',
            borderRadius: '20px',
            padding: '24px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700' }}>🏆 Weekly Tournament</h2>
              <button onClick={() => setShowTournament(false)} style={{
                background: 'none',
                border: 'none',
                color: '#e5e7eb',
                fontSize: '24px',
                cursor: 'pointer'
              }}>×</button>
            </div>

            <div style={{
              background: '#020617',
              border: '1px solid #1e293b',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '16px'
            }}>
              <p style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>
                🗓️ Tournament resets every Monday
              </p>
              <p style={{ fontSize: '12px', opacity: 0.7 }}>
                Compete for the top spot and earn bragging rights! Top 3 players get special recognition.
              </p>
            </div>

            <h3 style={{ fontSize: '14px', marginBottom: '12px', opacity: 0.8 }}>THIS WEEK'S RANKINGS</h3>
            
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {tournamentScores.filter(s => s.week === getWeekStart()).length === 0 ? (
                <p style={{ opacity: 0.5, fontSize: '14px', textAlign: 'center', padding: '40px 0' }}>
                  No scores yet this week. Be the first! 🚀
                </p>
              ) : (
                tournamentScores
                  .filter(s => s.week === getWeekStart())
                  .map((entry, i) => (
                    <div key={i} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      marginBottom: '8px',
                      background: entry.perfect
                        ? 'linear-gradient(135deg, #fbbf24, #f59e0b)'
                        : i === 0 ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' :
                                   i === 1 ? 'linear-gradient(135deg, #d1d5db, #9ca3af)' :
                                   i === 2 ? 'linear-gradient(135deg, #cd7f32, #b87333)' :
                                   '#0A0B0D',
                      border: '1px solid #1e293b',
                      color: (entry.perfect || i < 3) ? '#000' : '#e5e7eb',
                      fontWeight: (entry.perfect || i < 3) ? '800' : '400'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '18px' }}>
                          {entry.perfect ? '🏆' : i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                        </span>
                        <span>{entry.address}</span>
                      </div>
                      <span style={{ fontSize: '16px', fontWeight: '700' }}>
                        {entry.score}{entry.perfect && ' ⭐'}
                      </span>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Game Over / Paused Overlay */}
      {(paused || gameOver) && (
        <GameOverOverlay 
          score={score} 
          onRestart={restart} 
          onShareTwitter={shareToTwitter}
          onShareFarcaster={shareToFarcaster}
          onShareBase={shareToBase}
          isPaused={paused}
          isVictory={showVictory}
        />
      )}
    </div>
  );
}