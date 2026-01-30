import { useEffect, useRef, useState } from "react";

const GRID = 18;
const CELL = 20;
const SPEED = 130;
const DEV_WALLET = "0xC6DA0c478C7CCeac8354B2BFF141680823c730fF";

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
    description: "Official Base colors"
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
    description: "Classic monochrome LCD"
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
    description: "1989 nostalgia"
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
    description: "Retro console legend"
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
    description: "80s computer aesthetic"
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
    description: "Green phosphor glow"
  }
};

function randomFood() {
  return {
    x: Math.floor(Math.random() * GRID),
    y: Math.floor(Math.random() * GRID),
  };
}

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
  const [showWalletPrompt, setShowWalletPrompt] = useState(false);
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
      setShowWalletPrompt(true);
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
      alert('Please install MetaMask or another Web3 wallet');
      return;
    }

    try {
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (!accounts || accounts.length === 0) {
        alert('No accounts found');
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
            alert('Failed to add Base network');
            return;
          }
        }
      }

      setWalletAddress(accounts[0]);
      setWalletConnected(true);
      if (soundEnabled) playSound(600, 100, 'sine');
      
      if (showWalletPrompt) {
        setShowWalletPrompt(false);
        setShowMainMenu(true);
      }
      
    } catch (err) {
      alert('Failed to connect wallet');
    }
  }

  async function buySkin(skinId) {
    if (!walletConnected) {
      alert('Please connect your wallet first');
      return;
    }

    const skin = SKINS[skinId];
    if (!skin.locked) return;

    try {
      const priceInWei = '0x' + Math.floor(skin.price * 1e18).toString(16);
      
      await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: walletAddress,
          to: DEV_WALLET,
          value: priceInWei,
        }],
      });

      alert('Purchase successful!');
      
      const newOwned = [...ownedSkins, skinId];
      setOwnedSkins(newOwned);
      setCurrentSkin(skinId);
      
      await window.storage.set('owned_skins', JSON.stringify(newOwned));
      await window.storage.set('current_skin', skinId);
      
      if (soundEnabled) playSound(1000, 150, 'square');
      setShowSkinSelector(false);
    } catch (err) {
      alert('Purchase cancelled');
    }
  }

  async function sendTip(amount) {
    if (!walletConnected) {
      alert('Please connect your wallet first');
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

      alert('Thank you for the tip!');
      setShowTipsModal(false);
    } catch (err) {
      console.error('Tip failed');
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

  function getWeekStart() {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday.getTime();
  }

  async function endGame() {
    setGameOver(true);
    
    if (soundEnabled) {
      playSound(200, 100);
      setTimeout(() => playSound(150, 200), 120);
    }
    
    if (score > highScore) {
      setHighScore(score);
      await window.storage.set('high_score', score.toString());
    }

    try {
      const entry = {
        score,
        address: walletConnected ? walletAddress.slice(0, 6) + '...' + walletAddress.slice(-4) : 'Guest',
        timestamp: Date.now()
      };

      const newLB = [...leaderboard, entry]
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);

      setLeaderboard(newLB);
      await window.storage.set('leaderboard', JSON.stringify(newLB), true);

      const weekStart = getWeekStart();
      const tournamentEntry = { ...entry, week: weekStart };

      const currentWeekScores = tournamentScores.filter(s => s.week === weekStart);
      const otherWeekScores = tournamentScores.filter(s => s.week !== weekStart);
      
      const newTournament = [...currentWeekScores, tournamentEntry]
        .sort((a, b) => b.score - a.score)
        .slice(0, 20);

      const allTournamentScores = [...newTournament, ...otherWeekScores];
      setTournamentScores(allTournamentScores);
      await window.storage.set('tournament_weekly', JSON.stringify(allTournamentScores), true);
    } catch (err) {
      console.error('Failed to update leaderboard');
    }
  }

  function shareToTwitter() {
    const text = `I just scored ${score} points in Base Snake Game! Can you beat my score?`;
    const url = 'https://snake-base-app-xi.vercel.app/';
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank');
  }

  function shareToFarcaster() {
    const text = `I just scored ${score} points in Base Snake Game! Can you beat my score?`;
    const url = 'https://snake-base-app-xi.vercel.app/';
    const farcasterUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}&embeds[]=${encodeURIComponent(url)}`;
    window.open(farcasterUrl, '_blank');
  }

  function shareGeneric() {
    const shareData = {
      title: 'Base Snake Game',
      text: `I just scored ${score} points! Can you beat my score?`,
      url: 'https://snake-base-app-xi.vercel.app/'
    };
    
    if (navigator.share) {
      navigator.share(shareData).catch(err => console.log('Share cancelled'));
    } else {
      shareToTwitter();
    }
  }

  function restart() {
    setSnake([{ x: 9, y: 9 }]);
    setDir({ x: 1, y: 0 });
    setFood(randomFood());
    setScore(0);
    setGameOver(false);
    setPaused(false);
  }

  function startGame() {
    setShowMainMenu(false);
    setGameStarted(true);
    restart();
  }

  function exitToMenu() {
    setGameStarted(false);
    setShowMainMenu(true);
    setGameOver(false);
    setPaused(false);
    setScore(0);
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

  const SnakeLogo = () => (
    <svg width="120" height="120" viewBox="0 0 120 120">
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
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at top, #0A0B0D, #000)',
      color: '#e5e7eb',
      fontFamily: 'system-ui',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      gap: '14px'
    }}>
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
      `}</style>

      {loading && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'linear-gradient(135deg, #0A0B0D 0%, #000814 50%, #001d3d 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{ marginBottom: '40px', animation: 'pulse 2s ease-in-out infinite' }}>
            <SnakeLogo />
          </div>

          <h1 style={{
            fontSize: '48px',
            fontWeight: '900',
            background: 'linear-gradient(135deg, #0052FF, #00D4FF)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '12px'
          }}>SNAKE</h1>

          <p style={{ fontSize: '14px', opacity: 0.7, marginBottom: '40px' }}>
            ON BASE NETWORK
          </p>

          <div style={{
            width: '280px',
            height: '8px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '999px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${loadingProgress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #0052FF, #00D4FF)',
              transition: 'width 0.3s'
            }} />
          </div>

          <p style={{ marginTop: '16px', fontSize: '12px', opacity: 0.6 }}>
            {loadingProgress < 100 ? `LOADING... ${loadingProgress}%` : 'READY!'}
          </p>
        </div>
      )}

      {showWalletPrompt && !loading && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'linear-gradient(135deg, #0A0B0D 0%, #000814 50%, #001d3d 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9998
        }}>
          <div style={{ marginBottom: '30px', animation: 'float 3s ease-in-out infinite' }}>
            <svg width="140" height="140" viewBox="0 0 120 120">
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
            fontSize: '64px',
            fontWeight: '900',
            background: 'linear-gradient(135deg, #0052FF, #00D4FF)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '8px'
          }}>SNAKE</h1>

          <p style={{ fontSize: '14px', opacity: 0.7, marginBottom: '50px' }}>
            ON BASE NETWORK
          </p>

          <div style={{
            background: 'rgba(0, 82, 255, 0.1)',
            border: '2px solid rgba(0, 82, 255, 0.3)',
            borderRadius: '20px',
            padding: '32px',
            maxWidth: '450px',
            textAlign: 'center',
            marginBottom: '30px'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>💼</div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '12px' }}>
              Connect Your Wallet
            </h2>
            <p style={{ fontSize: '14px', opacity: 0.8, marginBottom: '24px' }}>
              Connect to unlock NFT skins, tournaments, and save scores on-chain
            </p>
            
            <button onClick={async () => {
              if (soundEnabled) playSound(600, 100);
              await connectWallet();
            }} style={{
              background: 'linear-gradient(135deg, #0052FF, #0049E0)',
              border: 'none',
              padding: '16px 40px',
              borderRadius: '16px',
              color: 'white',
              fontWeight: '800',
              fontSize: '18px',
              cursor: 'pointer',
              width: '100%',
              marginBottom: '12px'
            }}>
              Connect Wallet
            </button>

            <button onClick={() => {
              if (soundEnabled) playSound(500, 80);
              setShowWalletPrompt(false);
              setShowMainMenu(true);
            }} style={{
              background: 'transparent',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              padding: '14px 40px',
              borderRadius: '16px',
              color: '#e5e7eb',
              fontWeight: '600',
              fontSize: '16px',
              cursor: 'pointer',
              width: '100%'
            }}>
              Skip for Now
            </button>
          </div>

          <p style={{ fontSize: '12px', opacity: 0.5, maxWidth: '400px', textAlign: 'center' }}>
            You can play as guest and connect wallet later from menu
          </p>
        </div>
      )}

      {showMainMenu && !loading && !showWalletPrompt && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'linear-gradient(135deg, #0A0B0D 0%, #000814 50%, #001d3d 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9998
        }}>
          <div style={{ marginBottom: '30px', animation: 'float 3s ease-in-out infinite' }}>
            <svg width="140" height="140" viewBox="0 0 120 120">
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
            fontSize: '64px',
            fontWeight: '900',
            background: 'linear-gradient(135deg, #0052FF, #00D4FF)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '8px'
          }}>SNAKE</h1>

          <p style={{ fontSize: '14px', opacity: 0.7, marginBottom: '50px' }}>
            ON BASE NETWORK
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '320px' }}>
            <button onClick={() => {
              if (soundEnabled) playSound(600, 100);
              startGame();
            }} style={{
              background: 'linear-gradient(135deg, #0052FF, #0049E0)',
              border: 'none',
              padding: '18px 40px',
              borderRadius: '16px',
              color: 'white',
              fontWeight: '800',
              fontSize: '20px',
              cursor: 'pointer'
            }}>
              PLAY GAME
            </button>

            <button onClick={() => {
              if (soundEnabled) playSound(500, 80);
              setShowMainMenu(false);
              setShowSkinSelector(true);
            }} style={{
              background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
              border: 'none',
              padding: '16px 40px',
              borderRadius: '16px',
              color: 'white',
              fontWeight: '700',
              fontSize: '16px',
              cursor: 'pointer'
            }}>
              SKINS
            </button>

            <button onClick={() => {
              if (soundEnabled) playSound(500, 80);
              setShowMainMenu(false);
              setShowTournament(true);
            }} style={{
              background: 'linear-gradient(135deg, #ec4899, #db2777)',
              border: 'none',
              padding: '16px 40px',
              borderRadius: '16px',
              color: 'white',
              fontWeight: '700',
              fontSize: '16px',
              cursor: 'pointer'
            }}>
              LEADERBOARD
            </button>

            {!walletConnected && (
              <button onClick={async () => {
                if (soundEnabled) playSound(500, 80);
                await connectWallet();
              }} style={{
                background: 'transparent',
                border: '2px solid rgba(0, 82, 255, 0.5)',
                padding: '16px 40px',
                borderRadius: '16px',
                color: '#0052FF',
                fontWeight: '700',
                fontSize: '16px',
                cursor: 'pointer'
              }}>
                CONNECT WALLET
              </button>
            )}
          </div>

          <div style={{
            position: 'absolute',
            bottom: '30px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px'
          }}>
            {highScore > 0 && (
              <div style={{
                padding: '8px 20px',
                background: 'rgba(0, 82, 255, 0.1)',
                border: '1px solid rgba(0, 82, 255, 0.3)',
                borderRadius: '999px',
                fontSize: '14px'
              }}>
                Best Score: {highScore}
              </div>
            )}

            <button onClick={() => {
              const newSound = !soundEnabled;
              setSoundEnabled(newSound);
              if (newSound) playSound(600, 80);
              window.storage.set('sound_enabled', newSound.toString());
            }} style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '8px 16px',
              borderRadius: '999px',
              color: '#e5e7eb',
              fontSize: '12px',
              cursor: 'pointer'
            }}>
              {soundEnabled ? 'Sound ON' : 'Sound OFF'}
            </button>
          </div>
        </div>
      )}

      {gameStarted && (
        <>
          <div style={{
            width: '100%',
            maxWidth: '360px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '10px'
          }}>
            <h1 style={{ 
              fontSize: '24px', 
              background: 'linear-gradient(135deg, #0052FF, #00D4FF)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: '800'
            }}>SNAKE</h1>
            
            {!walletConnected ? (
              <button onClick={connectWallet} style={{
                background: 'linear-gradient(135deg, #0052FF, #0049E0)',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '999px',
                color: 'white',
                fontWeight: '700',
                fontSize: '12px',
                cursor: 'pointer'
              }}>Connect</button>
            ) : (
              <span style={{ fontSize: '11px', opacity: 0.8 }}>
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </span>
            )}
          </div>

          <div style={{
            width: '100%',
            maxWidth: '360px',
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <span style={{ fontWeight: '600', fontSize: '14px' }}>
              Score: {score} | Best: {highScore}
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setPaused(p => !p)} style={{
                background: '#22c55e',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '999px',
                fontSize: '11px',
                color: '#fff',
                cursor: 'pointer'
              }}>{paused ? 'Resume' : 'Pause'}</button>
              <button onClick={restart} style={{
                background: '#ef4444',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '999px',
                fontSize: '11px',
                color: 'white',
                cursor: 'pointer'
              }}>Restart</button>
            </div>
          </div>

          <canvas ref={canvasRef} width={GRID * CELL} height={GRID * CELL} onClick={handleCanvasClick} style={{
            width: '360px',
            height: '360px',
            borderRadius: '18px',
            background: SKINS[currentSkin].bg,
            cursor: 'pointer'
          }} />

          <div style={{
            width: '100%',
            maxWidth: '360px',
            display: 'flex',
            gap: '8px'
          }}>
            <button onClick={() => setShowTournament(true)} style={{
              flex: 1,
              background: '#ec4899',
              border: 'none',
              padding: '10px',
              borderRadius: '12px',
              color: 'white',
              cursor: 'pointer'
            }}>🏆</button>
            <button onClick={() => setShowTipsModal(true)} style={{
              flex: 1,
              background: '#f59e0b',
              border: 'none',
              padding: '10px',
              borderRadius: '12px',
              color: 'white',
              cursor: 'pointer'
            }}>💎</button>
            <button onClick={() => {
              setSoundEnabled(!soundEnabled);
              window.storage.set('sound_enabled', (!soundEnabled).toString());
            }} style={{
              background: '#64748b',
              border: 'none',
              padding: '10px',
              borderRadius: '12px',
              color: 'white',
              cursor: 'pointer'
            }}>{soundEnabled ? '🔊' : '🔇'}</button>
            <button onClick={() => setShowDpad(!showDpad)} style={{
              background: '#64748b',
              border: 'none',
              padding: '10px',
              borderRadius: '12px',
              color: 'white',
              cursor: 'pointer'
            }}>{showDpad ? '🎮' : '⌨️'}</button>
          </div>

          {showDpad && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 60px)',
              gridTemplateRows: 'repeat(3, 45px)',
              gap: '8px'
            }}>
              <div />
              <button onClick={() => setDir({ x: 0, y: -1 })} style={{
                background: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '12px',
                color: '#e5e7eb',
                fontSize: '18px',
                cursor: 'pointer'
              }}>▲</button>
              <div />
              <button onClick={() => setDir({ x: -1, y: 0 })} style={{
                background: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '12px',
                color: '#e5e7eb',
                fontSize: '18px',
                cursor: 'pointer'
              }}>◀</button>
              <div style={{ background: '#020617', borderRadius: '50%' }} />
              <button onClick={() => setDir({ x: 1, y: 0 })} style={{
                background: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '12px',
                color: '#e5e7eb',
                fontSize: '18px',
                cursor: 'pointer'
              }}>▶</button>
              <div />
              <button onClick={() => setDir({ x: 0, y: 1 })} style={{
                background: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '12px',
                color: '#e5e7eb',
                fontSize: '18px',
                cursor: 'pointer'
              }}>▼</button>
              <div />
            </div>
          )}
        </>
      )}

      {(paused || gameOver) && gameStarted && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(2, 6, 23, 0.95)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999
        }}>
          <h1 style={{ fontSize: '36px', marginBottom: '8px' }}>
            {gameOver ? 'GAME OVER' : 'PAUSED'}
          </h1>
          <p style={{ opacity: 0.8, marginBottom: '20px' }}>Score: {score}</p>
          
          {gameOver && score > 0 ? (
            <>
              <p style={{ fontSize: '14px', opacity: 0.7, marginBottom: '20px' }}>Share your score!</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px', width: '280px' }}>
                <button onClick={shareToTwitter} style={{
                  padding: '12px 28px',
                  fontSize: '16px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #1DA1F2, #0c85d0)',
                  color: 'white',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}>
                  <span>🐦</span> Share on Twitter
                </button>
                
                <button onClick={shareToFarcaster} style={{
                  padding: '12px 28px',
                  fontSize: '16px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #8a63d2, #6f4bc5)',
                  color: 'white',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}>
                  <span>📡</span> Share on Farcaster
                </button>

                <button onClick={shareGeneric} style={{
                  padding: '12px 28px',
                  fontSize: '16px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #0052FF, #0049E0)',
                  color: 'white',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}>
                  <span>📤</span> Share Other
                </button>
              </div>
            </>
          ) : null}
          
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button onClick={restart} style={{
              padding: '12px 28px',
              fontSize: '16px',
              borderRadius: '999px',
              border: 'none',
              background: '#0052FF',
              color: 'white',
              fontWeight: '800',
              cursor: 'pointer'
            }}>RESTART</button>
            {gameOver && (
              <button onClick={exitToMenu} style={{
                padding: '12px 28px',
                fontSize: '16px',
                borderRadius: '999px',
                border: 'none',
                background: '#64748b',
                color: 'white',
                fontWeight: '800',
                cursor: 'pointer'
              }}>MENU</button>
            )}
          </div>
        </div>
      )}

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
              marginBottom: '20px'
            }}>
              <h2 style={{ fontSize: '20px' }}>Choose Your Skin</h2>
              <button onClick={() => {
                setShowSkinSelector(false);
                if (!gameStarted) setShowMainMenu(true);
              }} style={{
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
                    cursor: 'pointer'
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
                      <div style={{ width: '20px', height: '20px', background: skin.snake, marginRight: '4px' }} />
                      <div style={{ width: '20px', height: '20px', background: skin.head }} />
                      <div style={{
                        width: '16px',
                        height: '16px',
                        background: skin.food,
                        position: 'absolute',
                        top: '10px',
                        right: '10px'
                      }} />
                    </div>
                    <h4 style={{ fontSize: '12px', marginBottom: '4px' }}>
                      {skin.name}
                    </h4>
                    <p style={{ fontSize: '10px', opacity: 0.7, marginBottom: '8px' }}>
                      {skin.description}
                    </p>
                    {owned ? (
                      <div style={{
                        background: active ? '#22c55e' : '#334155',
                        color: active ? '#000' : '#e5e7eb',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        textAlign: 'center'
                      }}>
                        {active ? 'Active' : 'Owned'}
                      </div>
                    ) : (
                      <div style={{
                        background: '#0052FF',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        textAlign: 'center'
                      }}>
                        {skin.price} ETH
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

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
            <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Send a Tip</h2>
            <p style={{ opacity: 0.7, marginBottom: '20px', fontSize: '14px' }}>Support the developer</p>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px',
              marginBottom: '16px'
            }}>
              {[0.0001, 0.0005, 0.001, 0.005].map(amount => (
                <button key={amount} onClick={() => sendTip(amount)} style={{
                  background: '#f59e0b',
                  border: 'none',
                  padding: '16px',
                  borderRadius: '12px',
                  color: 'white',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}>{amount} ETH</button>
              ))}
            </div>

            <button onClick={() => setShowTipsModal(false)} style={{
              background: '#334155',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '12px',
              color: '#e5e7eb',
              cursor: 'pointer',
              width: '100%'
            }}>Close</button>
          </div>
        </div>
      )}

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
              marginBottom: '20px'
            }}>
              <h2 style={{ fontSize: '20px' }}>Weekly Tournament</h2>
              <button onClick={() => {
                setShowTournament(false);
                if (!gameStarted) setShowMainMenu(true);
              }} style={{
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
              <p style={{ fontSize: '14px', marginBottom: '8px' }}>
                Tournament resets every Monday
              </p>
              <p style={{ fontSize: '12px', opacity: 0.7 }}>
                Compete for the top spot
              </p>
            </div>

            <h3 style={{ fontSize: '14px', marginBottom: '12px' }}>THIS WEEK</h3>
            
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {tournamentScores.filter(s => s.week === getWeekStart()).length === 0 ? (
                <p style={{ opacity: 0.5, fontSize: '14px', textAlign: 'center', padding: '40px 0' }}>
                  No scores yet this week
                </p>
              ) : (
                tournamentScores
                  .filter(s => s.week === getWeekStart())
                  .map((entry, i) => (
                    <div key={i} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '12px',
                      borderRadius: '12px',
                      marginBottom: '8px',
                      background: i === 0 ? '#fbbf24' :
                                 i === 1 ? '#d1d5db' :
                                 i === 2 ? '#cd7f32' : '#0A0B0D',
                      border: '1px solid #1e293b',
                      color: i < 3 ? '#000' : '#e5e7eb'
                    }}>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <span>
                          {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                        </span>
                        <span>{entry.address}</span>
                      </div>
                      <span>{entry.score}</span>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}