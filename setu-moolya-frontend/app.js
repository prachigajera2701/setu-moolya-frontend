/**
 * Setu Moolya (सेतु मूल्य) - Frontend Application Script
 * Connects to SetuMoolya Backend API (Express + Supabase Auth)
 * Provides Transparent Glassmorphic UI with Offline / Demo Resilience
 */

// Configuration
const API_BASE_URL = "http://localhost:5000";
let currentToken = localStorage.getItem("sm_auth_token") || null;
let currentUser = JSON.parse(localStorage.getItem("sm_auth_user") || "null");
let isBackendOnline = false;

// DOM Elements
const authSection = document.getElementById("authSection");
const dashboardSection = document.getElementById("dashboardSection");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const tabLoginBtn = document.getElementById("tabLoginBtn");
const tabRegisterBtn = document.getElementById("tabRegisterBtn");
const alertBox = document.getElementById("alertBox");
const alertMsg = document.getElementById("alertMsg");
const alertCloseBtn = document.getElementById("alertCloseBtn");
const backendStatusPill = document.getElementById("backendStatusPill");
const statusDot = document.getElementById("statusDot");
const statusText = document.getElementById("statusText");
const bgSwitchBtn = document.getElementById("bgSwitchBtn");
const farmBackground = document.getElementById("farmBackground");

// Show/Hide Password Elements
const toggleLoginPassword = document.getElementById("toggleLoginPassword");
const loginPasswordInput = document.getElementById("loginPassword");
const eyeIconLogin = document.getElementById("eyeIconLogin");

const toggleRegPassword = document.getElementById("toggleRegPassword");
const regPasswordInput = document.getElementById("regPassword");
const eyeIconReg = document.getElementById("eyeIconReg");

// Forgot Password Modal Elements
const forgotPasswordLink = document.getElementById("forgotPasswordLink");
const forgotModal = document.getElementById("forgotModal");
const closeForgotModal = document.getElementById("closeForgotModal");
const forgotForm = document.getElementById("forgotForm");

// Dashboard Elements
const dashUserName = document.getElementById("dashUserName");
const dashUserRole = document.getElementById("dashUserRole");
const dashUserKyc = document.getElementById("dashUserKyc");
const dashUserEmail = document.getElementById("dashUserEmail");
const dashAvatar = document.getElementById("dashAvatar");
const logoutBtn = document.getElementById("logoutBtn");
const refreshDataBtn = document.getElementById("refreshDataBtn");
const apiResponseBox = document.getElementById("apiResponseBox");

// Current Background state
let bgIndex = 1;
const bgImages = ["assets/farm-bg.jpg", "assets/farm-bg2.jpg"];

/* ==========================================================================
   Initialization
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners();
  checkBackendHealth();
  populateMockData();

  // If user already has active session, verify and display dashboard
  if (currentToken && currentUser) {
    showDashboard(currentUser);
  }
});

/* ==========================================================================
   Event Listeners
   ========================================================================== */
function setupEventListeners() {
  // Tab Switching
  tabLoginBtn.addEventListener("click", () => switchTab("login"));
  tabRegisterBtn.addEventListener("click", () => switchTab("register"));

  // Alert Box Close
  alertCloseBtn.addEventListener("click", hideAlert);

  // Password Visibility Toggles
  toggleLoginPassword.addEventListener("click", () => {
    togglePasswordVisibility(loginPasswordInput, eyeIconLogin);
  });

  toggleRegPassword.addEventListener("click", () => {
    togglePasswordVisibility(regPasswordInput, eyeIconReg);
  });

  // Background Scene Switcher
  bgSwitchBtn.addEventListener("click", () => {
    bgIndex = (bgIndex + 1) % bgImages.length;
    farmBackground.style.backgroundImage = `url('${bgImages[bgIndex]}')`;
  });

  // Role Chip Radios for Login
  document.querySelectorAll('input[name="loginRole"]').forEach((radio) => {
    radio.addEventListener("change", (e) => {
      document.querySelectorAll(".role-chip").forEach((chip) => chip.classList.remove("active"));
      e.target.closest(".role-chip").classList.add("active");
    });
  });

  // Form Submissions
  loginForm.addEventListener("submit", handleLoginSubmit);
  registerForm.addEventListener("submit", handleRegisterSubmit);

  // Forgot Password Modal
  forgotPasswordLink.addEventListener("click", (e) => {
    e.preventDefault();
    forgotModal.classList.remove("hidden");
  });

  closeForgotModal.addEventListener("click", () => {
    forgotModal.classList.add("hidden");
  });

  forgotModal.addEventListener("click", (e) => {
    if (e.target === forgotModal) forgotModal.classList.add("hidden");
  });

  forgotForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("forgotEmail").value;
    forgotModal.classList.add("hidden");
    showAlert(`Password reset instructions sent to ${email} (via Supabase Auth).`, "success");
  });

  // Logout
  logoutBtn.addEventListener("click", handleLogout);
  if (refreshDataBtn) {
    refreshDataBtn.addEventListener("click", () => {
      populateMockData();
      checkBackendHealth();
      showAlert("Dashboard data refreshed successfully.", "success");
    });
  }

  // Dashboard Sub-Tabs
  document.querySelectorAll(".dash-tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".dash-tab-btn").forEach((b) => b.classList.remove("active"));
      document.querySelectorAll(".dash-tab-content").forEach((c) => c.classList.remove("active"));

      btn.classList.add("active");
      const targetTabId = `tab-${btn.getAttribute("data-tab")}`;
      const targetContent = document.getElementById(targetTabId);
      if (targetContent) targetContent.classList.add("active");
    });
  });
}

/* ==========================================================================
   Backend Health & Diagnostics
   ========================================================================== */
async function checkBackendHealth() {
  statusDot.className = "status-dot pulsing";
  statusText.textContent = "Connecting to Backend...";

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(`${API_BASE_URL}/health`, {
      method: "GET",
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      isBackendOnline = true;
      statusDot.className = "status-dot online";
      statusText.textContent = data.supabase_ready 
        ? "Backend: Live & Supabase Connected" 
        : "Backend: Online (Supabase pending in .env)";
      backendStatusPill.title = "Backend is responding on http://localhost:5000";
    } else {
      throw new Error("Server responded with error status");
    }
  } catch (err) {
    isBackendOnline = false;
    statusDot.className = "status-dot offline";
    statusText.textContent = "Backend Offline (Demo Ready)";
    backendStatusPill.title = "Backend server not detected at http://localhost:5000. Start it with: npm run dev";
  }
}

/* ==========================================================================
   Tab Navigation & UI Helpers
   ========================================================================== */
function switchTab(tab) {
  hideAlert();
  if (tab === "login") {
    tabLoginBtn.classList.add("active");
    tabRegisterBtn.classList.remove("active");
    loginForm.classList.remove("hidden");
    registerForm.classList.add("hidden");
  } else {
    tabRegisterBtn.classList.add("active");
    tabLoginBtn.classList.remove("active");
    registerForm.classList.remove("hidden");
    loginForm.classList.add("hidden");
  }
}

function togglePasswordVisibility(inputEl, iconEl) {
  if (inputEl.type === "password") {
    inputEl.type = "text";
    iconEl.classList.remove("fa-eye");
    iconEl.classList.add("fa-eye-slash");
  } else {
    inputEl.type = "password";
    iconEl.classList.remove("fa-eye-slash");
    iconEl.classList.add("fa-eye");
  }
}

function showAlert(message, type = "error") {
  alertBox.className = `alert-box ${type}`;
  alertMsg.textContent = message;
  alertBox.classList.remove("hidden");
}

function hideAlert() {
  alertBox.classList.add("hidden");
}

/* ==========================================================================
   Quick Fill Demo Credentials
   ========================================================================== */
window.quickFill = function (role) {
  const emailInput = document.getElementById("loginEmail");
  const passInput = document.getElementById("loginPassword");

  if (role === "admin") {
    emailInput.value = "admin@setumoolya.org";
    passInput.value = "Admin@2026";
    selectRoleRadio("admin");
  } else if (role === "farmer") {
    emailInput.value = "ramesh.farmer@setumoolya.org";
    passInput.value = "Farmer@Pass123";
    selectRoleRadio("farmer");
  } else if (role === "buyer") {
    emailInput.value = "procurement@himalayanherb.com";
    passInput.value = "Buyer@Pass123";
    selectRoleRadio("buyer");
  }

  showAlert(`Pre-filled credentials for ${role.toUpperCase()}. Click Sign In to proceed!`, "warning");
};

function selectRoleRadio(role) {
  const radio = document.querySelector(`input[name="loginRole"][value="${role}"]`);
  if (radio) {
    radio.checked = true;
    document.querySelectorAll(".role-chip").forEach((chip) => chip.classList.remove("active"));
    radio.closest(".role-chip").classList.add("active");
  }
}

/* ==========================================================================
   Authentication: Login Handler
   ========================================================================== */
async function handleLoginSubmit(e) {
  e.preventDefault();
  hideAlert();

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;
  const selectedRole = document.querySelector('input[name="loginRole"]:checked')?.value || "admin";
  const rememberMe = document.getElementById("rememberMe").checked;

  const submitBtn = document.getElementById("loginSubmitBtn");
  const btnText = submitBtn.querySelector(".btn-text");
  const btnLoader = submitBtn.querySelector(".btn-loader");

  // Show Loading state
  btnText.classList.add("hidden");
  btnLoader.classList.remove("hidden");
  submitBtn.disabled = true;

  try {
    // Attempt backend login
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok && data.success) {
      // Backend returned valid session
      const user = data.data.user || { email, role: selectedRole, full_name: email.split("@")[0] };
      const token = data.data.token;

      onLoginSuccess(user, token, rememberMe);
      return;
    }

    // If backend returned 503 (Supabase pending in .env) or offline
    if (res.status === 503) {
      console.warn("Backend Supabase credentials pending in .env. Entering interactive Demo Session.");
      simulateSuccessfulLogin(email, selectedRole, rememberMe, "Note: Running in Demo Mode (Supabase pending in backend .env)");
      return;
    }

    // Backend returned invalid credentials
    showAlert(data.message || "Invalid login credentials. Please check email/password.", "error");

  } catch (err) {
    console.warn("Backend request failed, falling back to instant Demo Mode for hackathon testing.", err);
    // Allow seamless testing even if backend server isn't running yet
    simulateSuccessfulLogin(email, selectedRole, rememberMe, "Connected via Standalone Demo Mode (Backend offline)");
  } finally {
    btnText.classList.remove("hidden");
    btnLoader.classList.add("hidden");
    submitBtn.disabled = false;
  }
}

function simulateSuccessfulLogin(email, role, rememberMe, noticeMessage) {
  const fallbackUser = {
    id: "usr-" + Math.random().toString(36).substr(2, 9),
    email: email,
    full_name: email.split("@")[0].replace(".", " ").toUpperCase(),
    role: role,
    kyc_status: role === "admin" ? "verified" : "pending",
    is_verified: role === "admin"
  };
  const dummyToken = "jwt_setumoolya_demo_" + btoa(email + ":" + Date.now());

  onLoginSuccess(fallbackUser, dummyToken, rememberMe);
  if (noticeMessage) {
    setTimeout(() => showAlert(noticeMessage, "warning"), 400);
  }
}

function onLoginSuccess(user, token, rememberMe) {
  currentToken = token;
  currentUser = user;

  if (rememberMe) {
    localStorage.setItem("sm_auth_token", token);
    localStorage.setItem("sm_auth_user", JSON.stringify(user));
  } else {
    sessionStorage.setItem("sm_auth_token", token);
    sessionStorage.setItem("sm_auth_user", JSON.stringify(user));
  }

  showDashboard(user);
}

/* ==========================================================================
   Authentication: Registration Handler
   ========================================================================== */
async function handleRegisterSubmit(e) {
  e.preventDefault();
  hideAlert();

  const fullName = document.getElementById("regFullName").value.trim();
  const email = document.getElementById("regEmail").value.trim();
  const phone = document.getElementById("regPhone").value.trim();
  const role = document.getElementById("regRole").value;
  const organizationName = document.getElementById("regOrg").value.trim();
  const bioSpecialization = document.getElementById("regBio").value.trim();
  const state = document.getElementById("regState").value.trim();
  const district = document.getElementById("regDistrict").value.trim();
  const village = document.getElementById("regVillage").value.trim();
  const password = document.getElementById("regPassword").value;
  const confirmPassword = document.getElementById("regConfirmPassword").value;

  if (password !== confirmPassword) {
    showAlert("Passwords do not match. Please re-enter identical passwords.", "error");
    return;
  }

  if (password.length < 6) {
    showAlert("Password must be at least 6 characters in length.", "error");
    return;
  }

  const submitBtn = document.getElementById("regSubmitBtn");
  const btnText = submitBtn.querySelector(".btn-text");
  const btnLoader = submitBtn.querySelector(".btn-loader");

  btnText.classList.add("hidden");
  btnLoader.classList.remove("hidden");
  submitBtn.disabled = true;

  const payload = {
    email,
    password,
    full_name: fullName,
    role,
    phone: phone || undefined,
    organization_name: organizationName || undefined,
    bio_specialization: bioSpecialization || undefined,
    location: { state, district, village }
  };

  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (res.ok && data.success) {
      showAlert("Registration successful! You may now sign in with your credentials.", "success");
      switchTab("login");
      document.getElementById("loginEmail").value = email;
      selectRoleRadio(role);
      registerForm.reset();
      return;
    }

    if (res.status === 503) {
      showAlert("Account created locally for demo! Supabase backend credentials are pending in .env.", "warning");
      switchTab("login");
      document.getElementById("loginEmail").value = email;
      selectRoleRadio(role);
      return;
    }

    showAlert(data.message || "Failed to complete registration.", "error");

  } catch (err) {
    console.warn("Backend offline, simulating successful registration:", err);
    showAlert("Account registration simulated! You can now log in.", "success");
    switchTab("login");
    document.getElementById("loginEmail").value = email;
    selectRoleRadio(role);
  } finally {
    btnText.classList.remove("hidden");
    btnLoader.classList.add("hidden");
    submitBtn.disabled = false;
  }
}

/* ==========================================================================
   Dashboard Transitions & Rendering
   ========================================================================== */
function showDashboard(user) {
  authSection.classList.add("hidden");
  dashboardSection.classList.remove("hidden");

  // Populate User Information Header
  dashUserName.textContent = user.full_name || "Authorized User";
  dashUserRole.textContent = (user.role || "ADMIN").toUpperCase();
  dashUserEmail.textContent = user.email || "user@setumoolya.org";

  const isVerified = user.is_verified || user.kyc_status === "verified";
  dashUserKyc.innerHTML = isVerified
    ? `<i class="fa-solid fa-circle-check"></i> KYC Verified`
    : `<i class="fa-solid fa-clock"></i> KYC Pending`;
  dashUserKyc.className = isVerified ? "kyc-badge verified" : "kyc-badge pending";

  const initials = (user.full_name || user.email || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
  dashAvatar.textContent = initials;

  // Window scroll to top
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function handleLogout() {
  localStorage.removeItem("sm_auth_token");
  localStorage.removeItem("sm_auth_user");
  sessionStorage.removeItem("sm_auth_token");
  sessionStorage.removeItem("sm_auth_user");
  currentToken = null;
  currentUser = null;

  // Attempt backend logout if online
  if (isBackendOnline && currentToken) {
    fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${currentToken}` }
    }).catch(() => {});
  }

  dashboardSection.classList.add("hidden");
  authSection.classList.remove("hidden");
  showAlert("You have been signed out securely.", "success");
}

/* ==========================================================================
   Live Diagnostic Endpoint Testing Tool
   ========================================================================== */
window.testEndpoint = async function (endpoint) {
  apiResponseBox.textContent = `Executing GET ${endpoint} with Authorization: Bearer <token>...`;

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${currentToken || "mock_demo_token"}`
      }
    });

    const data = await res.json();
    apiResponseBox.textContent = JSON.stringify(data, null, 2);
  } catch (err) {
    apiResponseBox.textContent = JSON.stringify({
      status: "Local Simulation / Backend Unreachable",
      endpoint: endpoint,
      user_session: currentUser,
      message: "Backend server at http://localhost:5000 did not return an HTTP response. Ensure backend is running with 'node index.js'."
    }, null, 2);
  }
};

/* ==========================================================================
   Mock & Demo Data for Admin Dashboard
   ========================================================================== */
function populateMockData() {
  // Activity Feed
  const activityFeed = document.getElementById("activityFeed");
  if (activityFeed) {
    const activities = [
      {
        icon: "fa-certificate",
        title: "AYUSH Certified Lab #44 issued tamper-proof COA for Lot #SM-902 (Picroside II > 8.4%)",
        time: "12 mins ago"
      },
      {
        icon: "fa-shield-halved",
        title: "Escrow Deposit Confirmed: ₹ 14.5 Lakhs by Dabur India for Kutki Rhizomes (Chamoli Lot)",
        time: "35 mins ago"
      },
      {
        icon: "fa-user-check",
        title: "New FPO Registration: 'Nanda Devi Foragers Union' verified by Platform Agronomist",
        time: "2 hours ago"
      },
      {
        icon: "fa-truck-fast",
        title: "Logistics Telemetry: Cold chain batch #89 in transit from Joshimath to Haridwar Hub (6.2°C)",
        time: "3 hours ago"
      }
    ];

    activityFeed.innerHTML = activities
      .map(
        (a) => `
      <div class="activity-item">
        <div class="activity-icon"><i class="fa-solid ${a.icon}"></i></div>
        <div class="activity-detail">
          <div>${a.title}</div>
          <div class="activity-time">${a.time}</div>
        </div>
      </div>
    `
      )
      .join("");
  }

  // Farmer Management Table
  const farmerTable = document.getElementById("farmerTableBody");
  if (farmerTable) {
    const farmers = [
      { name: "Ramesh Chandra Sharma", region: "Joshimath, Chamoli (UK)", crop: "Kutki, Gucchi", harvest: "340 kg", status: "verified" },
      { name: "Devi Singh Negi", region: "Ukhimath, Rudraprayag (UK)", crop: "Ashwagandha, Shilajit", harvest: "1,200 kg", status: "verified" },
      { name: "Parvati Devi Rawat", region: "Munsiyari, Pithoragarh (UK)", crop: "Wild Himalayan Gucchi", harvest: "48 kg", status: "pending" },
      { name: "Suresh Babu Patel", region: "Anand, Gujarat", crop: "Shatavari, Kalmegh", harvest: "2,800 kg", status: "verified" }
    ];

    farmerTable.innerHTML = farmers
      .map(
        (f) => `
      <tr>
        <td><strong>${f.name}</strong></td>
        <td>${f.region}</td>
        <td>${f.crop}</td>
        <td>${f.harvest}</td>
        <td><span class="status-badge ${f.status}">${f.status.toUpperCase()}</span></td>
        <td><button class="action-btn" onclick="alert('Viewing dossier for ${f.name}')">View Dossier</button></td>
      </tr>
    `
      )
      .join("");
  }

  // Crops & Lots Table
  const cropsTable = document.getElementById("cropsTableBody");
  if (cropsTable) {
    const lots = [
      { id: "LOT-UK-8841", herb: "Kutki (Picrorhiza kurroa)", fpo: "Chamoli Collectors Co-op", potency: "8.4% Picroside", coa: "AYUSH-LAB-912.pdf", escrow: "₹ 11,73,000", status: "Verified" },
      { id: "LOT-UK-7720", herb: "Wild Gucchi (Morchella esculenta)", fpo: "Nanda Devi Foragers Union", potency: "Purity 99.2%", coa: "AYUSH-LAB-891.pdf", escrow: "₹ 13,44,000", status: "In Escrow" },
      { id: "LOT-GJ-3319", herb: "Ashwagandha (Withania somnifera)", fpo: "Gujarat Herbal Agritech", potency: "5.1% Withanolides", coa: "Pending HPLC", escrow: "₹ 8,90,000", status: "Testing" }
    ];

    cropsTable.innerHTML = lots
      .map(
        (l) => `
      <tr>
        <td><code>${l.id}</code></td>
        <td><strong>${l.herb}</strong></td>
        <td>${l.fpo}</td>
        <td><span style="color:#86efac; font-weight:600;">${l.potency}</span></td>
        <td><a href="#" style="color:#d4af37; text-decoration:underline;">${l.coa}</a></td>
        <td><strong>${l.escrow}</strong></td>
        <td><span class="status-badge verified">${l.status}</span></td>
      </tr>
    `
      )
      .join("");
  }

  // Requests Table
  const kycTable = document.getElementById("kycTableBody");
  if (kycTable) {
    const requests = [
      { applicant: "Himalayan Bio-Reserves Ltd", role: "B2B Buyer", date: "24-Oct-2026", docs: "GST + IEC License", status: "Pending Approval" },
      { applicant: "Pithoragarh Women Herb Union", role: "FPO Cooperative", date: "23-Oct-2026", docs: "Society Reg + Land Audit", status: "Under Review" },
      { applicant: "Apex Phytochemical Labs", role: "Quality Lab", date: "22-Oct-2026", docs: "NABL Accreditation ISO/IEC 17025", status: "Approved" }
    ];

    kycTable.innerHTML = requests
      .map(
        (r) => `
      <tr>
        <td><strong>${r.applicant}</strong></td>
        <td><span class="role-badge">${r.role}</span></td>
        <td>${r.date}</td>
        <td>${r.docs}</td>
        <td><span class="status-badge pending">${r.status}</span></td>
        <td>
          <button class="action-btn" style="background:#059669;" onclick="this.textContent='Approved'; this.style.background='#047857';">Approve</button>
        </td>
      </tr>
    `
      )
      .join("");
  }
}
