# Setu Moolya (सेतु मूल्य) - Frontend Web Application

> **"Every Root Deserves Its Worth"**  
> Transparent Glassmorphic AgriTech Auth & Management Portal connecting rural wild-herb foragers & FPOs directly with verified global B2B buyers.

---

## 🌾 Features

- **Lush Green Farm Background**: Ultra high-definition agricultural scenery with animated floating organic particles and a scene switcher.
- **Transparent Frosted Glass Design**: Modern glassmorphism (`backdrop-filter: blur(20px)`) with emerald green and gold accents.
- **Brand Identity**: Features the official Setu Moolya logo (`yDsi3.jpg`) with "FARMER • VALUE • GROWTH" motto.
- **Dual Mode (Sign In / Register)**:
  - **Login**: Email/username, password with **show/hide toggle**, role selector, remember me, forgot password modal, and fast demo fill shortcuts.
  - **Registration**: Multi-role support (`farmer`, `fpo`, `buyer`, `lab`, `logistics`, `admin`), contact info, cooperative name, herb/bio specialization, and location tracking.
- **Post-Login Dashboard**:
  - Overview statistics (Registered Farmers, Herbal Batches, B2B Escrow amount, AYUSH lab purity).
  - Farmer Management directory.
  - Crop & Herbal Lot tracking with potency and COA certificates.
  - KYC and Verification approval workflow.
  - Live backend diagnostics panel.
- **Backend API Integration**: Connects seamlessly to `http://localhost:5000` with graceful offline & demo fallback.

---

## 🚀 How to Run

### Method 1: Double-click Launcher (Easiest)
1. Double-click `run_backend.bat` in the root folder to start the Express backend.
2. Double-click `run_frontend.bat` in the root folder to launch the frontend.

### Method 2: Command Line
```bash
# In the setu-moolya-frontend directory:
python -m http.server 3000
# Then open http://localhost:3000 in your browser
```
Or simply double-click `index.html` to open directly in any modern browser!
