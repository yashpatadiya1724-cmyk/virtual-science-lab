# Virtual Science Lab – Skill India VR 🔬
> NEP 2020 × Skill India | VR-ready virtual labs for underfunded schools

---

## Folder Structure

```
virtual-science-lab/
├── frontend/
│   ├── index.html              ← Homepage
│   ├── css/
│   │   ├── main.css            ← Global styles & design tokens
│   │   ├── home.css            ← Homepage styles
│   │   ├── lab.css             ← Lab page styles
│   │   └── dashboard.css       ← Dashboard & admin styles
│   ├── js/
│   │   ├── helpers.js          ← Shared utilities (counter, toast, API)
│   │   ├── home.js             ← Three.js hero + previews
│   │   ├── lab.js              ← Lab orchestrator + VR toggle
│   │   ├── pendulum.js         ← Pendulum physics simulation
│   │   ├── prism.js            ← Prism refraction simulation
│   │   ├── acidbase.js         ← Acid-base titration simulation
│   │   ├── dashboard.js        ← Student dashboard logic
│   │   └── admin.js            ← Admin panel logic
│   └── pages/
│       ├── lab.html            ← Virtual lab page (Three.js + A-Frame)
│       ├── dashboard.html      ← Student progress dashboard
│       └── admin.html          ← Teacher/admin panel
│
└── backend/
    ├── server.js               ← Express entry point
    ├── package.json
    ├── .env.example
    ├── models/
    │   └── index.js            ← MongoDB schemas (6 models)
    ├── middleware/
    │   └── auth.js             ← JWT middleware + role guard
    ├── routes/
    │   ├── auth.js             ← Register, login, /me
    │   ├── experiments.js      ← CRUD + session + completion
    │   ├── students.js         ← Dashboard, leaderboard
    │   ├── admin.js            ← Admin overview, analytics
    │   └── analytics.js        ← Event logging
    └── scripts/
        └── seed.js             ← Demo data seeder
```

---

## Quick Start

### 1. Frontend (no build step needed)
```bash
# Open directly in browser:
open frontend/index.html

# Or serve locally:
npx serve frontend/ -p 5500
# → http://localhost:5500
```

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env          # edit MONGODB_URI, JWT_SECRET
node scripts/seed.js          # seed demo data (optional)
npm run dev                   # → http://localhost:3000
```

### 3. Open the app
| URL | Page |
|-----|------|
| `/` | Homepage |
| `/pages/lab.html` | Virtual Lab |
| `/pages/lab.html?exp=pendulum` | Pendulum |
| `/pages/lab.html?exp=prism` | Prism |
| `/pages/lab.html?exp=acidbase` | Acid-Base |
| `/pages/lab.html?mode=vr` | VR Mode |
| `/pages/dashboard.html` | Student Dashboard |
| `/pages/admin.html` | Teacher Panel |

### Demo credentials (after seed)
| Role | Email | Password |
|------|-------|----------|
| Student | student@demo.com | demo1234 |
| Teacher | teacher@demo.com | demo1234 |
| Admin   | admin@demo.com   | demo1234 |

---

## Tech Stack
| Layer | Tech |
|-------|------|
| 3D Graphics | Three.js r128 |
| VR/WebXR | A-Frame 1.4.0 |
| Animations | GSAP 3.12 |
| Frontend | HTML5, CSS3, Vanilla JS |
| Backend | Node.js 18+, Express.js 4 |
| Database | MongoDB 7+ / Mongoose 8 |
| Auth | JWT + bcryptjs |

---

## Experiments
| # | Name | Subject | Class |
|---|------|---------|-------|
| 1 | Simple Pendulum | Physics | 9-10 |
| 2 | Prism Refraction | Physics | 10-12 |
| 3 | Acid-Base Titration | Chemistry | 9-11 |

---

## VR Mode
- Works with **Google Cardboard** + any Android phone
- Uses **WebXR / A-Frame** — no app install needed
- Click **🥽 Enter VR** button inside the lab

## Low Bandwidth Mode
- Auto-detects slow connections via `navigator.connection`
- Reduces 3D quality for rural schools on 2G networks

---

Built with ❤️ for India's students. **Jai Hind! 🇮🇳**  
MIT License — free for educational use.
