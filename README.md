# 🐍 Base Snake Game

A classic Snake game built on Base Network with Web3 integration, featuring NFT skins, tournaments, and crypto rewards!

## 🎮 Features

- **Classic Snake Gameplay** - Arrow keys or WASD controls
- **Web3 Integration** - Connect wallet (MetaMask, Coinbase Wallet, etc.)
- **NFT Skins** - Unlock retro gaming skins (Nokia, Game Boy, Atari, etc.)
- **Weekly Tournaments** - Compete for top scores
- **Perfect Game Achievement** - Fill the entire 18x18 grid!
- **Global Leaderboard** - Shared across all players
- **Social Sharing** - Share scores to Twitter, Farcaster, and Base

## 🚀 Live Demo

[Play Now!](#) <!-- Add your deployed URL here -->

## 🛠️ Tech Stack

- **React** - UI Framework
- **Vite** - Build tool
- **Web3** - Ethereum wallet integration
- **Base Network** - L2 blockchain
- **HTML5 Canvas** - Game rendering

## 📦 Installation
```bash
# Clone repository
git clone https://github.com/yourusername/base-snake-game.git

# Install dependencies
cd base-snake-game
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## 🎯 How to Play

1. **Start Game** - Click "START GAME" on main menu
2. **Move** - Use Arrow Keys or WASD
3. **Pause** - Press SPACE
4. **Eat Food** - Grow your snake and increase score
5. **Avoid Walls** - Don't hit boundaries or yourself!
6. **Perfect Game** - Fill all 324 cells to win! 🏆

## 🎨 Skins

### Free Skins:
- 🔵 Base Network (Official colors)
- 📱 Nokia 3310 (Classic monochrome)
- 🎮 Game Boy (1989 nostalgia)

### Premium Skins (0.0005 ETH):
- 🕹️ Atari 2600
- 💾 Commodore 64
- 👾 Arcade CRT

## 🏆 Achievements

- **High Score** - Beat your personal best
- **Perfect Game** - Fill entire grid (324 points)
- **Tournament Winner** - Top weekly leaderboard
- **Skin Collector** - Unlock all skins

## 🌐 Deploy

### Vercel (Recommended)
```bash
npm install -g vercel
vercel --prod
```

### Other Platforms
- Netlify
- GitHub Pages
- Railway
- Render

## 💡 Features Roadmap

- [ ] NFT achievements minting
- [ ] Token rewards for high scores
- [ ] Multiplayer mode
- [ ] Mobile app (PWA)
- [ ] More skin collections
- [ ] Sound effects customization
- [ ] Difficulty levels

## 🤝 Contributing

Contributions are welcome! Feel free to submit issues and pull requests.

## 📄 License

MIT License - feel free to use this project!

## 💰 Support

If you enjoy the game, consider sending a tip! 💎

Wallet: `0xC6DA0c478C7CCeac8354B2BFF141680823c730fF` (Base Network)

## 📱 Social

- Twitter: [@cherryHijau_](#)
- Farcaster: [@jhonstaslim](#)


---

Built with ❤️ on Base Network 🔵
```

---

### **STEP 5: Buat .gitignore**

**File: `.gitignore`**
```
# Dependencies
node_modules/
/.pnp
.pnp.js

# Testing
/coverage

# Production
/build
/dist

# Misc
.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*
.pnpm-debug.log*

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Environment variables
.env