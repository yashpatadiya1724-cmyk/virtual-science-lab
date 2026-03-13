# Virtual Science Lab – Skill India VR 🔬

> **A VR-ready, 3D interactive virtual laboratory for underfunded schools across India**
> Built under the NEP 2020 vision & Skill India initiative

---

## 🌟 Overview

Virtual Science Lab is an open-source, browser-based 3D science simulation platform that enables students from resource-constrained schools to perform chemistry and physics experiments in an immersive virtual environment — with full WebXR/VR support.

**No lab equipment needed. Works on basic smartphones. Runs on slow internet.**

---

## 🗂 Project Structure

```
virtual-science-lab/
│
├── frontend/                        # Client-side code
│   ├── index.html                   # Homepage (NEP 2020 vision, hero, experiments)
│   ├── css/
│   │   ├── main.css                 # Global styles, design tokens
│   │   ├── home.css                 # Homepage styles
│   │   ├── lab.css                  # Virtual lab page styles
│   │   └── dashboard.css            # Dashboard & admin styles
│   ├── js/
│   │   ├── home.js                  # Three.js hero + homepage animations
│   │   ├── lab.js                   # Lab orchestrator (renderer, switching, VR)
│   │   ├── dashboard.js             # Student dashboard logic
│   │   ├── admin.js                 # Teacher/admin panel logic
│   │   ├── utils/
│   │   │   └── helpers.js           # DOM helpers, API calls, utilities
│   │   └── experiments/
│   │       ├── pendulum.js          # Simple Pendulum – physics simulation
│   │       ├── prism.js             # Prism Refraction – optics simulation
│   │       └── acidbase.js          # Acid-Base Titration – chemistry simulation
│   └── pages/
│       ├── lab.html                 # Virtual lab page (Three.js + A-Frame VR)
│       ├── dashboard.html           # Student progress dashboard
│       └── admin.html               # Teacher/admin panel
│
├── backend/                         # Node.js + Express API
│   ├── server.js                    # Main Express server entry point
│   ├── package.json                 # Backend dependencies
│   ├── .env.example                 # Environment variable template
│   ├── models/
│   │   └── index.js                 # MongoDB schemas (User, Experiment, Session, Progress)
│   ├── routes/
│   │   ├── auth.js                  # Register, login, JWT auth
│   │   ├── experiments.js           # CRUD + session logging + completion
│   │   ├── students.js              # Student profile, progress, leaderboard
│   │   ├── admin.js                 # Admin overview, student management
│   │   └── analytics.js            # Event logging + usage stats
│   ├── middleware/
│   │   └── auth.js                  # JWT middleware + role guards
│   └── scripts/
│       └── seed.js                  # Seed MongoDB with demo data
│
├── docs/                            # Documentation
└── README.md                        # This file
```

---

## 🧪 Available Experiments

| # | Experiment | Subject | Class | Duration |
|---|-----------|---------|-------|----------|
| 1 | Simple Pendulum | Physics | 9-10 | 15 min |
| 2 | Prism Light Refraction | Physics | 10-12 | 20 min |
| 3 | Acid-Base Titration (HCl + NaOH) | Chemistry | 9-11 | 25 min |

> All experiments are NCERT-aligned with step-by-step guidance.

---

## 🛠 Technology Stack

| Layer | Technology |
|-------|-----------|
| 3D Graphics | Three.js r128 |
| VR / WebXR | A-Frame 1.4.0 |
| Animations | GSAP 3.12 |
| Frontend | HTML5, CSS3, Vanilla JS |
| Backend | Node.js 18+, Express.js 4 |
| Database | MongoDB 7+ with Mongoose |
| Auth | JWT (jsonwebtoken) + bcryptjs |

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18.x
- MongoDB (local) or MongoDB Atlas account
- A modern browser (Chrome 90+, Firefox 85+, Edge 90+)
- For VR: Google Cardboard + any Android phone (Android 9+)

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/virtual-science-lab.git
cd virtual-science-lab
```

---

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env — set your MONGODB_URI and JWT_SECRET
nano .env

# (Optional) Seed the database with demo data
node scripts/seed.js

# Start development server
npm run dev

# Or production start
npm start
```

The API will be available at: `http://localhost:3000`

---

### 3. Frontend Setup

The frontend is **static HTML/CSS/JS** — no build step required!

**Option A – Open directly in browser:**
```bash
# Open frontend/index.html in your browser
open frontend/index.html
```

**Option B – Serve with a local server (recommended for API calls):**
```bash
# Using VS Code Live Server extension, or:
npx serve frontend/ -p 5500

# Or Python (if installed):
cd frontend && python3 -m http.server 5500
```

Then visit: `http://localhost:5500`

**Option C – Let the Express backend serve it:**
```bash
# The backend already serves frontend/ as static files
# Just start the backend and visit http://localhost:3000
npm run dev   # in backend/
```

---

### 4. Using the App

| Page | URL | Description |
|------|-----|-------------|
| Homepage | `/` or `index.html` | Hero, NEP vision, experiment previews |
| Virtual Lab | `/pages/lab.html` | Main 3D experiment environment |
| Pendulum | `/pages/lab.html?exp=pendulum` | Simple pendulum experiment |
| Prism | `/pages/lab.html?exp=prism` | Light refraction experiment |
| Acid-Base | `/pages/lab.html?exp=acidbase` | Titration experiment |
| Dashboard | `/pages/dashboard.html` | Student progress tracking |
| Admin | `/pages/admin.html` | Teacher panel, analytics |
| VR Mode | Click "Enter VR" in lab | WebXR immersive experience |

---

### 5. Demo Credentials (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Student | student@demo.com | demo1234 |
| Teacher | teacher@demo.com | demo1234 |
| Admin | admin@demo.com | demo1234 |

---

## 📡 API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create new account |
| POST | `/api/auth/login` | Login, get JWT token |
| GET | `/api/auth/me` | Get current user (auth required) |

### Experiments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/experiments` | List all active experiments |
| GET | `/api/experiments/:slug` | Get single experiment with steps |
| POST | `/api/experiments` | Create experiment (teacher+) |
| PUT | `/api/experiments/:id` | Update experiment (teacher+) |
| DELETE | `/api/experiments/:id` | Archive experiment (admin) |
| POST | `/api/experiments/session/start` | Log session start |
| POST | `/api/experiments/complete` | Mark experiment complete |

### Students
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/students/me` | Dashboard data (progress, sessions) |
| PATCH | `/api/students/me` | Update profile |
| GET | `/api/students/leaderboard` | Top 10 students |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/overview` | Platform stats |
| GET | `/api/admin/students` | All students list |
| GET | `/api/admin/analytics` | Daily session data |

---

## 🥽 VR Mode

VR mode uses A-Frame (WebXR) and is compatible with:

- **Google Cardboard** (any Android smartphone)
- **Samsung Gear VR**
- **Oculus Go / Quest** (via browser)
- **Desktop VR** (HTC Vive, Valve Index via WebXR)

To enter VR:
1. Open `/pages/lab.html` on your phone
2. Click **🥽 Enter VR** button
3. Insert phone into cardboard headset
4. Use gaze-based cursor to interact

---

## 📶 Low Bandwidth Mode

Designed for rural schools with slow connections:
- Automatically detected via `navigator.connection.effectiveType`
- Reduces 3D particle count by 67%
- Disables shadow maps
- Reduces render pixel ratio to 1×
- Can be forced: add `?bandwidth=low` to URL

---

## 🏗 Adding New Experiments

1. Create `frontend/js/experiments/myexp.js` following this template:
```js
window.MyExperiment = {
  name: 'My Experiment',
  subject: 'Physics',
  classLevel: 'Class 10',
  duration: '20 min',
  state: { running: false, currentStep: 0, /* ... */ },
  steps: [ { text: 'Step 1 instructions...' }, /* ... */ ],
  build(scene, THREE) { /* Add Three.js objects to scene */ },
  update(dt)          { /* Physics simulation loop */ },
  start()             { this.state.running = true; },
  reset()             { /* Reset state */ },
  getResults()        { return { 'Key': 'Value' }; },
  cleanup(scene)      { /* Remove objects from scene */ }
};
```

2. Register in `frontend/js/lab.js`:
```js
const EXPERIMENTS = {
  // ...existing
  myexp: window.MyExperiment
};
```

3. Add a tab button in `pages/lab.html`
4. Seed it via the admin panel or `scripts/seed.js`

---

## 🌐 Deployment

### Railway / Render / Heroku
```bash
cd backend
npm start
# Set MONGODB_URI and JWT_SECRET in dashboard
```

### Netlify / Vercel (frontend only)
```
Publish directory: frontend/
# Point API_BASE in helpers.js to your deployed backend URL
```

### Docker (full stack)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY backend/ ./backend/
COPY frontend/ ./frontend/
WORKDIR /app/backend
RUN npm ci --production
EXPOSE 3000
CMD ["node", "server.js"]
```

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-experiment`
3. Commit: `git commit -m "Add: Ohm's Law experiment"`
4. Push: `git push origin feature/new-experiment`
5. Open a Pull Request

---

## 📜 License

MIT License — free for educational use.

Built with ❤️ for India's students. **Jai Hind! 🇮🇳**

---

## 🙏 Acknowledgements

- **NEP 2020** – National Education Policy
- **Skill India** – Ministry of Skill Development
- **NCERT** – National Council of Educational Research and Training
- **Three.js** – 3D graphics library
- **A-Frame** – WebXR framework by Mozilla
