const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const shortenForm = document.getElementById("shortenForm");
const urlTableBody = document.getElementById("urlTableBody");
const statusMessage = document.getElementById("statusMessage");
const authState = document.getElementById("authState");
const totalLinks = document.getElementById("totalLinks");
const adminDashboard = document.getElementById("adminDashboard");
const adminTotalUsers = document.getElementById("adminTotalUsers");
const adminTotalLinks = document.getElementById("adminTotalLinks");
const adminUsersBody = document.getElementById("adminUsersBody");
const adminRecentUrlsBody = document.getElementById("adminRecentUrlsBody");
const googleSignInBtn = document.getElementById("googleSignInBtn");
const bgShapeOne = document.querySelector(".bg-shape-one");
const bgShapeTwo = document.querySelector(".bg-shape-two");
const currentUserCard = document.getElementById("currentUserCard");
const currentUserAvatar = document.getElementById("currentUserAvatar");
const currentUserName = document.getElementById("currentUserName");
const currentUserEmail = document.getElementById("currentUserEmail");
const manageProfileBtn = document.getElementById("manageProfileBtn");
const profileLogoutBtn = document.getElementById("profileLogoutBtn");
const profileModalElement = document.getElementById("profileModal");
const profileNameField = document.getElementById("profileName");
const profileEmailField = document.getElementById("profileEmail");

const storageKey = "url_shortener_token";
const cursorGlow = document.createElement("div");
cursorGlow.className = "cursor-glow";
document.body.appendChild(cursorGlow);
const cursorTrail = document.createElement("div");
cursorTrail.className = "cursor-trail";
document.body.appendChild(cursorTrail);

let pointerX = window.innerWidth / 2;
let pointerY = window.innerHeight / 2;
let glowX = pointerX;
let glowY = pointerY;
let trailX = pointerX;
let trailY = pointerY;
let currentUserProfile = null;
let profileModal = null;

function updateCursorMotion() {
  glowX += (pointerX - glowX) * 0.12;
  glowY += (pointerY - glowY) * 0.12;
  trailX += (pointerX - trailX) * 0.07;
  trailY += (pointerY - trailY) * 0.07;

  cursorGlow.style.transform = `translate(${glowX - 160}px, ${glowY - 160}px)`;
  cursorTrail.style.transform = `translate(${trailX - 44}px, ${trailY - 44}px)`;

  window.requestAnimationFrame(updateCursorMotion);
}

function initTiltEffect() {
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const canHover = window.matchMedia("(hover: hover)").matches;

  if (reducedMotion || !canHover) {
    return;
  }

  const tiltTargets = document.querySelectorAll(
    ".hero-card, .app-card, .btn, .nav-link",
  );

  tiltTargets.forEach((element) => {
    element.classList.add("tilt-target");

    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;
    let rafId = null;

    const animateTilt = () => {
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;

      if (
        Math.abs(targetX - currentX) < 0.01 &&
        Math.abs(targetY - currentY) < 0.01
      ) {
        currentX = targetX;
        currentY = targetY;
      }

      element.style.transform = `perspective(900px) rotateX(${currentX.toFixed(2)}deg) rotateY(${currentY.toFixed(2)}deg)`;

      if (
        Math.abs(targetX - currentX) > 0.01 ||
        Math.abs(targetY - currentY) > 0.01
      ) {
        rafId = window.requestAnimationFrame(animateTilt);
      } else {
        rafId = null;
      }
    };

    const startAnimation = () => {
      if (rafId !== null) {
        return;
      }
      rafId = window.requestAnimationFrame(animateTilt);
    };

    element.addEventListener("pointermove", (event) => {
      const rect = element.getBoundingClientRect();
      const posX = (event.clientX - rect.left) / rect.width;
      const posY = (event.clientY - rect.top) / rect.height;

      const maxTilt =
        element.classList.contains("btn") ||
        element.classList.contains("nav-link")
          ? 5
          : 8;

      targetY = (posX - 0.5) * maxTilt;
      targetX = (0.5 - posY) * maxTilt;

      element.classList.add("tilt-active");
      startAnimation();
    });

    element.addEventListener("pointerleave", () => {
      element.classList.remove("tilt-active");
      targetX = 0;
      targetY = 0;
      startAnimation();
    });
  });
}

function applyShapeParallax(x, y) {
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  const offsetX = (x - centerX) / centerX;
  const offsetY = (y - centerY) / centerY;

  if (bgShapeOne) {
    bgShapeOne.style.transform = `translate(${offsetX * -18}px, ${offsetY * -14}px)`;
  }

  if (bgShapeTwo) {
    bgShapeTwo.style.transform = `translate(${offsetX * 16}px, ${offsetY * 12}px)`;
  }
}

window.addEventListener("pointermove", (event) => {
  pointerX = event.clientX;
  pointerY = event.clientY;
  cursorGlow.classList.add("active");
  cursorTrail.classList.add("active");
  applyShapeParallax(pointerX, pointerY);
});

window.addEventListener("pointerleave", () => {
  cursorGlow.classList.remove("active");
  cursorTrail.classList.remove("active");
});

updateCursorMotion();

function getToken() {
  return localStorage.getItem(storageKey);
}

function setToken(token) {
  if (!token) {
    localStorage.removeItem(storageKey);
    updateAuthState();
    return;
  }
  localStorage.setItem(storageKey, token);
  updateAuthState();
}

function updateAuthState() {
  if (!authState) {
    return;
  }

  if (getToken()) {
    authState.className = "badge text-bg-success px-3 py-2";
    authState.textContent = "Logged In";
    return;
  }

  authState.className = "badge text-bg-secondary px-3 py-2";
  authState.textContent = "Guest";
}

function getUserDisplayName(user) {
  const first = String(user?.firstname || "").trim();
  const last = String(user?.lastname || "").trim();
  const full = `${first} ${last}`.trim();
  return full || "User";
}

function getAvatarUrl(user) {
  const name = encodeURIComponent(getUserDisplayName(user));
  return `https://ui-avatars.com/api/?name=${name}&background=eff6ff&color=1d4ed8&bold=true&size=128`;
}

function updateCurrentUserCard(user) {
  if (
    !currentUserCard ||
    !currentUserAvatar ||
    !currentUserName ||
    !currentUserEmail
  ) {
    return;
  }

  if (!user) {
    currentUserProfile = null;
    currentUserCard.classList.add("d-none");
    currentUserName.textContent = "";
    currentUserEmail.textContent = "";
    currentUserAvatar.removeAttribute("src");
    if (profileNameField) {
      profileNameField.value = "";
    }
    if (profileEmailField) {
      profileEmailField.value = "";
    }
    return;
  }

  currentUserProfile = user;
  const email = String(user?.email || "").trim();
  currentUserName.textContent = getUserDisplayName(user);
  currentUserEmail.textContent = email || "No email";
  currentUserAvatar.src = getAvatarUrl(user);
  currentUserCard.classList.remove("d-none");
}

function openManageProfileModal() {
  if (!currentUserProfile) {
    showMessage("Please login first.", "warning");
    return;
  }

  if (profileNameField) {
    profileNameField.value = getUserDisplayName(currentUserProfile);
  }

  if (profileEmailField) {
    profileEmailField.value = String(currentUserProfile?.email || "").trim();
  }

  if (!profileModal && profileModalElement && window.bootstrap?.Modal) {
    profileModal = new window.bootstrap.Modal(profileModalElement);
  }

  profileModal?.show();
}

async function performLogout() {
  setToken(null);
  showMessage("Logged out.", "info");
  await loadCodes();
}

function showMessage(message, type = "info") {
  statusMessage.className = `alert alert-${type} mt-4 mb-0`;
  statusMessage.textContent = message;
}

function clearAdminDashboard() {
  if (adminDashboard) {
    adminDashboard.classList.add("d-none");
  }

  if (adminTotalUsers) {
    adminTotalUsers.textContent = "0";
  }

  if (adminTotalLinks) {
    adminTotalLinks.textContent = "0";
  }

  if (adminUsersBody) {
    adminUsersBody.innerHTML = `
      <tr>
        <td colspan="3" class="text-center text-secondary py-3">No owner data.</td>
      </tr>
    `;
  }

  if (adminRecentUrlsBody) {
    adminRecentUrlsBody.innerHTML = `
      <tr>
        <td colspan="2" class="text-center text-secondary py-3">No recent links.</td>
      </tr>
    `;
  }
}

function renderAdminDashboard(data) {
  if (!adminDashboard) {
    return;
  }

  adminDashboard.classList.remove("d-none");

  if (adminTotalUsers) {
    adminTotalUsers.textContent = String(data?.summary?.totalUsers || 0);
  }

  if (adminTotalLinks) {
    adminTotalLinks.textContent = String(data?.summary?.totalLinks || 0);
  }

  const users = data?.users || [];
  if (adminUsersBody) {
    if (!users.length) {
      adminUsersBody.innerHTML = `
        <tr>
          <td colspan="3" class="text-center text-secondary py-3">No owner data.</td>
        </tr>
      `;
    } else {
      adminUsersBody.innerHTML = users
        .map(
          (user) => `
            <tr>
              <td>${user.firstname} ${user.lastname}</td>
              <td class="small">${user.email}</td>
              <td class="text-end fw-semibold">${user.totalLinks}</td>
            </tr>
          `,
        )
        .join("");
    }
  }

  const recentUrls = data?.recentUrls || [];
  if (adminRecentUrlsBody) {
    if (!recentUrls.length) {
      adminRecentUrlsBody.innerHTML = `
        <tr>
          <td colspan="2" class="text-center text-secondary py-3">No recent links.</td>
        </tr>
      `;
    } else {
      adminRecentUrlsBody.innerHTML = recentUrls
        .map(
          (item) => `
            <tr>
              <td><span class="fw-medium">${item.shortcode}</span></td>
              <td class="small">${item.userEmail}</td>
            </tr>
          `,
        )
        .join("");
    }
  }
}

async function loadOwnerDashboard() {
  if (!getToken()) {
    updateCurrentUserCard(null);
    clearAdminDashboard();
    return;
  }

  let me = null;
  try {
    me = await api("/user/me");
  } catch (error) {
    updateCurrentUserCard(null);
    clearAdminDashboard();
    console.error("Failed to load current user:", error);
    return;
  }

  updateCurrentUserCard(me?.user || null);

  if (!me?.isOwner) {
    clearAdminDashboard();
    return;
  }

  try {
    const ownerData = await api("/admin/overview");
    renderAdminDashboard(ownerData);
  } catch (error) {
    clearAdminDashboard();
    showMessage(`Owner dashboard error: ${error.message}`, "warning");
    console.error("Failed to load owner dashboard:", error);
  }
}

async function initGoogleSignIn() {
  if (!googleSignInBtn) {
    return;
  }

  try {
    const googleConfig = await api("/user/google/config", {
      headers: {},
    });

    if (!googleConfig?.enabled || !googleConfig?.clientId) {
      googleSignInBtn.innerHTML =
        '<span class="small text-secondary">Google sign-in is not configured.</span>';
      return;
    }

    if (!window.google?.accounts?.id) {
      googleSignInBtn.innerHTML =
        '<span class="small text-secondary">Google script not loaded. Refresh page.</span>';
      return;
    }

    window.google.accounts.id.initialize({
      client_id: googleConfig.clientId,
      callback: async (response) => {
        hideMessage();
        try {
          const data = await api("/user/google", {
            method: "POST",
            body: JSON.stringify({ credential: response.credential }),
          });

          setToken(data.token);
          if (data?.user) {
            updateCurrentUserCard(data.user);
          }
          showMessage("Logged in with Google.", "success");
          await loadCodes();
        } catch (error) {
          showMessage(error.message, "danger");
        }
      },
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    googleSignInBtn.innerHTML = "";
    window.google.accounts.id.renderButton(googleSignInBtn, {
      type: "standard",
      shape: "pill",
      theme: "outline",
      text: "continue_with",
      size: "large",
      width: 260,
    });
  } catch (error) {
    googleSignInBtn.innerHTML =
      '<span class="small text-secondary">Unable to load Google sign-in.</span>';
  }
}

function hideMessage() {
  statusMessage.className = "alert d-none mt-4 mb-0";
  statusMessage.textContent = "";
}

function getReadableApiError(payload, status) {
  if (typeof payload?.error === "string" && payload.error.trim()) {
    return payload.error;
  }

  if (payload?.error && typeof payload.error === "object") {
    const firstField = Object.values(payload.error)[0];
    const firstIssue =
      firstField &&
      typeof firstField === "object" &&
      Array.isArray(firstField._errors)
        ? firstField._errors[0]
        : null;

    if (typeof firstIssue === "string" && firstIssue.trim()) {
      return firstIssue;
    }
  }

  return `Request failed (${status})`;
}

async function api(path, options = {}) {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(path, {
    ...options,
    headers,
  });

  let payload = {};
  const text = await response.text();
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { raw: text };
    }
  }

  if (!response.ok) {
    const errorMessage = getReadableApiError(payload, response.status);
    throw new Error(errorMessage);
  }

  return payload;
}

function renderRows(rows) {
  if (totalLinks) {
    totalLinks.textContent = String(rows?.length || 0);
  }

  if (!rows?.length) {
    urlTableBody.innerHTML = `
      <tr>
        <td colspan="3" class="text-center text-secondary py-4">No links yet. Create your first one.</td>
      </tr>
    `;
    return;
  }

  const host = window.location.origin;
  urlTableBody.innerHTML = rows
    .map(
      (entry) => `
      <tr>
        <td>
          <a class="fw-medium" href="/${entry.shortcode}" target="_blank" rel="noreferrer">${host}/${entry.shortcode}</a>
        </td>
        <td>
          <a class="text-decoration-none text-secondary link-ellipsis d-inline-block" href="${entry.targetURL}" target="_blank" rel="noreferrer">${entry.targetURL}</a>
        </td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-danger" data-delete-id="${entry.id}" type="button">Delete</button>
        </td>
      </tr>
    `,
    )
    .join("");
}

async function loadCodes() {
  if (!getToken()) {
    if (totalLinks) {
      totalLinks.textContent = "0";
    }
    renderRows([]);
    urlTableBody.innerHTML = `
      <tr>
        <td colspan="3" class="text-center text-secondary py-4">Login to view your links.</td>
      </tr>
    `;
    updateCurrentUserCard(null);
    clearAdminDashboard();
    return;
  }

  try {
    const response = await api("/codes");
    renderRows(response.code || []);
  } catch (error) {
    showMessage(error.message, "danger");
  }

  await loadOwnerDashboard();
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  hideMessage();

  const formData = new FormData(loginForm);
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "").trim();

  try {
    const data = await api("/user/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    setToken(data.token);
    if (data?.user) {
      updateCurrentUserCard(data.user);
    }
    showMessage("Logged in successfully.", "success");
    loginForm.reset();
    await loadCodes();
  } catch (error) {
    showMessage(error.message, "danger");
  }
});

signupForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  hideMessage();

  const formData = new FormData(signupForm);
  const payload = {
    firstname: String(formData.get("firstname") || "").trim(),
    lastname: String(formData.get("lastname") || "").trim(),
    email: String(formData.get("email") || "").trim(),
    password: String(formData.get("password") || "").trim(),
  };

  try {
    await api("/user/signup", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    showMessage("Signup complete. Please login.", "success");
    signupForm.reset();
  } catch (error) {
    showMessage(error.message, "danger");
  }
});

shortenForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  hideMessage();

  if (!getToken()) {
    showMessage("Please login first.", "warning");
    return;
  }

  const formData = new FormData(shortenForm);
  const url = String(formData.get("url") || "").trim();
  const code = String(formData.get("code") || "").trim();

  const payload = code ? { url, code } : { url };

  try {
    await api("/shorten", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    showMessage("Short URL created.", "success");
    shortenForm.reset();
    await loadCodes();
  } catch (error) {
    showMessage(error.message, "danger");
  }
});

urlTableBody.addEventListener("click", async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement)) {
    return;
  }

  const id = target.getAttribute("data-delete-id");
  if (!id) {
    return;
  }

  hideMessage();

  try {
    await api(`/${id}`, {
      method: "DELETE",
    });

    showMessage("Link deleted.", "success");
    await loadCodes();
  } catch (error) {
    showMessage(error.message, "danger");
  }
});

if (manageProfileBtn) {
  manageProfileBtn.addEventListener("click", () => {
    openManageProfileModal();
  });
}

if (profileLogoutBtn) {
  profileLogoutBtn.addEventListener("click", async () => {
    await performLogout();
  });
}

updateAuthState();
clearAdminDashboard();
loadCodes();
initGoogleSignIn();
initTiltEffect();
