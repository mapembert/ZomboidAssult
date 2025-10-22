# Zomboid Assault - PWA Installation Guide

Your game is now a **Progressive Web App (PWA)** that can be installed on iPhone and Android devices like a native app!

## 📱 Installation on iPhone

### Step 1: Build and Serve
```bash
npm run build
npx serve dist
```

You'll see:
```
Local:    http://localhost:3000
Network:  http://192.168.0.83:3000  ← Use this URL
```

### Step 2: Open in Safari (MUST be Safari!)
⚠️ **Important:** Chrome on iOS cannot install PWAs. Must use Safari!

1. On your iPhone, open **Safari**
2. Navigate to: `http://192.168.0.83:3000` (your network URL)
3. Wait for the game to load

### Step 3: Add to Home Screen
1. Tap the **Share** button (square with arrow pointing up)
2. Scroll down and tap **"Add to Home Screen"**
3. Edit the name if you want (default: "Zomboid Assault")
4. Tap **"Add"** in the top right

### Step 4: Launch as App
1. Go to your iPhone home screen
2. Find the "Zomboid Assault" icon
3. Tap it to launch

**Result:** The game now runs:
- ✅ Full screen (no Safari UI)
- ✅ No address bar
- ✅ No browser toolbar
- ✅ Looks like a native app
- ✅ Can be used offline (after first load)

---

## 🤖 Installation on Android

### Step 1: Build and Serve (same as above)
```bash
npm run build
npx serve dist
```

### Step 2: Open in Chrome
1. On Android, open **Chrome**
2. Navigate to your network URL
3. Wait for the game to load

### Step 3: Install PWA
**Option A: Automatic Prompt**
- Chrome will show "Add Zomboid Assault to Home screen"
- Tap **"Install"**

**Option B: Manual Install**
1. Tap the **⋮** menu (three dots)
2. Tap **"Add to Home screen"** or **"Install app"**
3. Tap **"Install"**

### Step 4: Launch
- Find the app icon on your home screen
- Launch like any native app

---

## 🖥️ Desktop Installation

### Chrome/Edge (Windows/Mac/Linux)
1. Visit the game URL
2. Look for the **install icon** (⊕) in the address bar
3. Click **"Install"**
4. Game becomes a desktop app in its own window

---

## ✨ PWA Features

### Offline Support
- After the first load, the game caches essential files
- Can launch and play even without internet
- Service worker handles offline functionality

### App-like Behavior
- Runs in standalone window (no browser UI)
- Shows in app switcher as separate app
- Can be launched from home screen/app drawer
- Receives app-like treatment from OS

### Fullscreen Mode
- **In-browser:** Click the "Fullscreen" button (top-right)
- **Standalone mode:** Already fullscreen by default

---

## 🎨 Customizing Icons

Default icons are minimal placeholders. To improve:

### Quick Method (Online Tool)
1. Visit https://favicon.io/favicon-generator/
2. Create icon with:
   - Text: "Z" or "ZA"
   - Background: `#121212`
   - Font color: `#03DAC6`
3. Download and rename to:
   - `public/icons/icon-192.png` (192x192)
   - `public/icons/icon-512.png` (512x512)
4. Rebuild: `npm run build`

### Custom Design
Create PNGs with:
- **192x192** pixels (minimum for Android)
- **512x512** pixels (high-res for Android, splash screens)
- Dark background `#121212`
- Teal accent `#03DAC6`
- Red zombie elements `#FF5252`

---

## 🧪 Testing Checklist

- [ ] Build completes without errors
- [ ] Game loads in browser
- [ ] Can install on iPhone via Safari
- [ ] Launches fullscreen on iPhone
- [ ] Can install on Android via Chrome
- [ ] Launches as standalone app on Android
- [ ] Offline mode works (airplane mode test)
- [ ] Fullscreen button works in browser mode
- [ ] Service worker registers successfully (check console)

---

## 🔧 Troubleshooting

### "Add to Home Screen" not showing
- **iPhone:** Must use Safari, not Chrome
- **Android:** Visit via HTTPS or localhost (HTTP won't install)

### Icons not appearing
- Check files exist: `public/icons/icon-192.png` and `icon-512.png`
- Clear browser cache and reinstall
- Ensure images are valid PNGs

### Game not fullscreen on iPhone
- Make sure you launched from the home screen icon
- If opened in Safari, it won't be fullscreen
- Delete and reinstall if issues persist

### Service Worker not registering
- Check browser console for errors
- Ensure `sw.js` exists in `dist/` after build
- Try hard refresh (Cmd+Shift+R or Ctrl+Shift+R)

---

## 📄 Files Created

```
public/
├── manifest.json          # PWA manifest (app metadata)
├── sw.js                  # Service worker (offline support)
├── icons/
│   ├── icon-192.png      # 192x192 app icon
│   ├── icon-512.png      # 512x512 app icon
│   └── README.md         # Icon creation guide
└── index.html            # Updated with PWA meta tags
```

---

## 🎮 Next Steps

1. **Create Better Icons** - Replace placeholder icons with game-themed designs
2. **Test on Real Devices** - Install on iPhone and Android
3. **Add Splash Screen** - Customize loading experience
4. **Deploy to Web** - Host on Netlify/Vercel for HTTPS access
5. **Submit to App Stores** - Consider using PWABuilder for app store submission

---

## 🚀 Deployment

For production (HTTPS required for full PWA features):

```bash
# Deploy to Netlify
npm install -g netlify-cli
npm run build
netlify deploy --prod --dir=dist

# Or Vercel
npm install -g vercel
npm run build
vercel --prod
```

After deployment, you can install from the public URL!

---

**Congratulations! Your game is now a Progressive Web App! 🎉**
