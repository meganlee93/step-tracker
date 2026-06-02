/* ==========================================
   STRIDE & BITE - CORE LOGIC & STATE MANAGEMENT
   ========================================== */

// --- Firebase Configuration ---
// Paste your Firebase web app configuration object here to enable real-time sync.
// If left empty or using the placeholders, the app runs in Local Offline Mode.
const firebaseConfig = {
  apiKey: "AIzaSyAU4ou-H5m0Kl0gk3vZYzRBNmZ0LOBCR2o",
  authDomain: "mysteptracker-ee1c3.firebaseapp.com",
  projectId: "mysteptracker-ee1c3",
  storageBucket: "mysteptracker-ee1c3.firebasestorage.app",
  messagingSenderId: "1072803335465",
  appId: "1:1072803335465:web:058fd20d8ca5c6d4dfbb38"
};

// --- Google Sheets Synchronization Webhook ---
// Paste your deployed Google Apps Script Web App URL here to enable automatic Sheets logging.
const GOOGLE_SHEETS_WEBAPP_URL = "";

// --- Firebase Connection State ---
let isFirebaseConnected = false;
let db = null;

// --- Food Catalog Database ---
const FOOD_CATALOG = [
  // Meals
  { id: 'f-cheeseburger', name: 'Cheeseburger', deduction: 5000, category: 'meals' },
  { id: 'f-pizza', name: 'Pizza (Slice)', deduction: 4000, category: 'meals' },
  { id: 'f-ramen', name: 'Ramen Bowl', deduction: 4500, category: 'meals' },
  { id: 'f-burrito', name: 'Burrito', deduction: 5500, category: 'meals' },
  { id: 'f-sandwich', name: 'Turkey Club Sandwich', deduction: 2500, category: 'meals' },
  
  // Snacks
  { id: 'f-fries', name: 'French Fries', deduction: 3000, category: 'snacks' },
  { id: 'f-donut', name: 'Glazed Donut', deduction: 3000, category: 'snacks' },
  { id: 'f-cookie', name: 'Chocolate Chip Cookie', deduction: 2000, category: 'snacks' },
  { id: 'f-chips', name: 'Potato Chips (Bag)', deduction: 2500, category: 'snacks' },
  
  // Drinks
  { id: 'f-soda', name: 'Soda Can', deduction: 2000, category: 'drinks' },
  { id: 'f-latte', name: 'Double Latte', deduction: 1500, category: 'drinks' },
  { id: 'f-beer', name: 'Craft Beer', deduction: 2200, category: 'drinks' },
  
  // Healthy
  { id: 'f-apple', name: 'Apple', deduction: 0, category: 'healthy' },
  { id: 'f-salad', name: 'Green Salad', deduction: 0, category: 'healthy' },
  { id: 'f-chicken', name: 'Grilled Chicken Breast', deduction: 0, category: 'healthy' },
  { id: 'f-banana', name: 'Banana', deduction: 0, category: 'healthy' }
];

// --- App State ---
let state = {
  users: [],
  activeUserId: null,
  selectedDate: '',
  userLogs: {}, // Keyed by userId -> dateStr (YYYY-MM-DD) -> { steps: 0, foods: [] }
  activeTab: 'dashboard',
  communityWeekStart: null
};

// --- DOM Cache ---
const DOM = {
  prevDayBtn: document.getElementById('prev-day-btn'),
  nextDayBtn: document.getElementById('next-day-btn'),
  datePicker: document.getElementById('date-picker'),
  dateLabel: document.getElementById('date-label'),
  userMenuBtn: document.getElementById('user-menu-btn'),
  userDropdown: document.getElementById('user-dropdown'),
  usersListDropdown: document.getElementById('users-list-dropdown'),
  addUserMenuBtn: document.getElementById('add-user-menu-btn'),
  manageUsersMenuBtn: document.getElementById('manage-users-menu-btn'),
  manageUsersModal: document.getElementById('manage-users-modal'),
  closeManageModalBtn: document.getElementById('close-manage-modal-btn'),
  manageUsersList: document.getElementById('manage-users-list'),
  currentUserAvatar: document.getElementById('current-user-avatar'),
  currentUserInitials: document.getElementById('current-user-initials'),
  currentUserName: document.getElementById('current-user-name'),
  leaderboardItems: document.getElementById('leaderboard-items'),
  historyItems: document.getElementById('history-items'),
  weeklyTotalVal: document.getElementById('weekly-total-val'),
  monthlyTotalVal: document.getElementById('monthly-total-val'),
  monthlyTargetVal: document.getElementById('monthly-target-val'),
  monthlyDiffVal: document.getElementById('monthly-diff-val'),
  decWorkoutBtn: document.getElementById('dec-workout-btn'),
  incWorkoutBtn: document.getElementById('inc-workout-btn'),
  workoutCountDisplay: document.getElementById('workout-count-display'),
  workoutWeeklyCount: document.getElementById('workout-weekly-count'),
  workoutBonusDisplayVal: document.getElementById('workout-bonus-display-val'),
  workoutBonusVal: document.getElementById('workout-bonus-val'),
  dateHeroCard: document.getElementById('date-hero-card'),
  dateHeroTitle: document.getElementById('date-hero-title'),
  netStepsVal: document.getElementById('net-steps-val'),
  goalStepsVal: document.getElementById('goal-steps-val'),
  foodDeductionVal: document.getElementById('food-deduction-val'),
  extraStepsVal: document.getElementById('extra-steps-val'),
  extraStepsDesc: document.getElementById('extra-steps-desc'),
  cumulativeExtraVal: document.getElementById('cumulative-extra-val'),
  cumulativeExtraDesc: document.getElementById('cumulative-extra-desc'),
  logStepsForm: document.getElementById('log-steps-form'),
  stepCountInput: document.getElementById('step-count-input'),
  foodSearch: document.getElementById('food-search'),
  categoryTabs: document.querySelectorAll('.tab-btn'),
  foodCatalogGrid: document.getElementById('food-catalog-grid'),
  toggleCustomFoodBtn: document.getElementById('toggle-custom-food-btn'),
  customFoodForm: document.getElementById('custom-food-form'),
  customFoodName: document.getElementById('custom-food-name'),
  customFoodDeduction: document.getElementById('custom-food-deduction'),
  cancelCustomFood: document.getElementById('cancel-custom-food'),
  loggedFoodsList: document.getElementById('logged-foods-list'),
  addUserModal: document.getElementById('add-user-modal'),
  closeModalBtn: document.getElementById('close-modal-btn'),
  createUserForm: document.getElementById('create-user-form'),
  newUsername: document.getElementById('new-username'),
  newUserGoal: document.getElementById('new-user-goal'),
  cancelUserCreate: document.getElementById('cancel-user-create'),
  tabDashboard: document.getElementById('tab-dashboard'),
  tabCommunity: document.getElementById('tab-community'),
  viewDashboard: document.getElementById('view-dashboard'),
  viewCommunity: document.getElementById('view-community'),
  communityTableHead: document.getElementById('community-table-head'),
  communityTableBody: document.getElementById('community-table-body'),
  weekLabel: document.getElementById('week-label'),
  prevWeekBtn: document.getElementById('prev-week-btn'),
  nextWeekBtn: document.getElementById('next-week-btn')
};

// SVG Progress Ring Configuration
const CIRCUMFERENCE = 2 * Math.PI * 120; // Radius = 120

// --- Initialize App ---
function init() {
  setDefaultDate();
  state.communityWeekStart = getMondayOfDate(new Date());
  
  // Try initializing Firebase
  const firebaseSuccess = initFirebase();
  
  if (firebaseSuccess) {
    // Sync active profile selection state cached locally
    loadStateFromLocalStorage();
    
    // Start listening to Firebase collections
    startFirebaseListeners();
    
    // Seeding Firestore with default profiles if empty
    seedInitialFirebaseData();
  } else {
    // Normal LocalStorage implementation
    loadStateFromLocalStorage();
    
    if (state.users.length === 0) {
      // Create pre-populated initial user profiles
      state.users = [
        { id: 'u-1', name: 'Trainer Red', goal: 8000, avatarColor: '#10b981' },
        { id: 'u-2', name: 'Fitness Blue', goal: 8000, avatarColor: '#06b6d4' }
      ];
      state.activeUserId = 'u-1';
      seedMockData();
      saveState();
    }
  }

  // Migrate existing profiles from 10000 goal to 8000 goal
  let migrated = false;
  state.users.forEach(u => {
    if (u.goal === 10000) {
      u.goal = 8000;
      migrated = true;
      if (isFirebaseConnected && db) {
        db.collection('users').doc(u.id).update({ goal: 8000 }).catch(() => {});
      }
    }
  });
  if (migrated) {
    saveState();
  }

  setupEventListeners();
  adjustDateSelectorPosition();
  renderAll();
}

// --- Firebase Sync Helpers ---
function initFirebase() {
  const isConfigured = firebaseConfig && 
                       firebaseConfig.apiKey && 
                       firebaseConfig.apiKey !== "YOUR_API_KEY" && 
                       firebaseConfig.apiKey.trim() !== "";
  
  if (!isConfigured) {
    console.log("Firebase not configured. Running in Local Offline Mode.");
    updateSyncStatus(false);
    return false;
  }

  try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    
    // Enable offline persistence
    db.enablePersistence().catch((err) => {
      console.warn("Firestore offline persistence status: ", err.code);
    });

    isFirebaseConnected = true;
    updateSyncStatus(true);
    console.log("Firebase connected successfully. Cloud Sync Mode Active.");
    return true;
  } catch (error) {
    console.error("Firebase connection initialization failed: ", error);
    isFirebaseConnected = false;
    updateSyncStatus(false);
    return false;
  }
}

function updateSyncStatus(connected) {
  const badge = document.getElementById('sync-status');
  const text = document.getElementById('sync-status-text');
  if (badge && text) {
    if (connected) {
      badge.className = "sync-status-badge online";
      text.textContent = "Cloud Sync";
    } else {
      badge.className = "sync-status-badge offline";
      text.textContent = "Local Mode";
    }
  }
}

function startFirebaseListeners() {
  if (!isFirebaseConnected || !db) return;

  // Real-time listener for profiles/users
  db.collection('users').onSnapshot((snapshot) => {
    const updatedUsers = [];
    snapshot.forEach(doc => {
      updatedUsers.push({ id: doc.id, ...doc.data() });
    });
    
    if (updatedUsers.length > 0) {
      state.users = updatedUsers;
      
      // Keep active profile synced/fallback
      if (!state.activeUserId || !state.users.some(u => u.id === state.activeUserId)) {
        state.activeUserId = state.users[0].id;
      }
      
      renderAll();
    }
  }, (error) => {
    console.error("Firebase Users subscription error: ", error);
  });

  // Real-time listener for user activity logs
  db.collection('logs').onSnapshot((snapshot) => {
    snapshot.forEach(doc => {
      const data = doc.data();
      const userId = data.userId;
      const date = data.date;
      
      if (!state.userLogs[userId]) state.userLogs[userId] = {};
      state.userLogs[userId][date] = {
        steps: data.steps || 0,
        foods: data.foods || [],
        workouts: data.workouts || 0
      };
    });
    
    renderAll();
  }, (error) => {
    console.error("Firebase Logs subscription error: ", error);
  });
}

function seedInitialFirebaseData() {
  if (!isFirebaseConnected || !db) return;

  db.collection('users').get().then(snapshot => {
    if (snapshot.empty) {
      console.log("Empty Firestore database detected. Seeding cloud data templates...");
      
      const defaultUsers = [
        { id: 'u-1', name: 'Trainer Red', goal: 8000, avatarColor: '#10b981' },
        { id: 'u-2', name: 'Fitness Blue', goal: 8000, avatarColor: '#06b6d4' }
      ];

      defaultUsers.forEach(u => {
        db.collection('users').doc(u.id).set({
          name: u.name,
          goal: u.goal,
          avatarColor: u.avatarColor
        });
      });

      const todayStr = formatDateString(new Date());
      
      db.collection('logs').doc(`u-1_${todayStr}`).set({
        userId: 'u-1',
        date: todayStr,
        steps: 12500,
        foods: [
          { id: 'seed-f1', name: 'Double Latte', deduction: 1500 },
          { id: 'seed-f2', name: 'Chocolate Chip Cookie', deduction: 2000 }
        ]
      });

      db.collection('logs').doc(`u-2_${todayStr}`).set({
        userId: 'u-2',
        date: todayStr,
        steps: 6200,
        foods: [
          { id: 'seed-f3', name: 'Banana', deduction: 0 }
        ]
      });
    }
  });
}

// --- LocalStorage & State Helpers ---
function loadStateFromLocalStorage() {
  try {
    const saved = localStorage.getItem('stride_and_bite_state');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Load user profiles from localStorage if offline
      if (!isFirebaseConnected) {
        state.users = parsed.users || [];
      }
      state.activeUserId = parsed.activeUserId || null;
      
      // Load logs from localStorage if offline
      if (!isFirebaseConnected) {
        state.userLogs = parsed.userLogs || {};
      }
    }
  } catch (e) {
    console.error("Error reading LocalStorage: ", e);
  }
}

function saveState() {
  try {
    // Only persist cached keys and local configs
    localStorage.setItem('stride_and_bite_state', JSON.stringify({
      users: isFirebaseConnected ? state.users : state.users,
      activeUserId: state.activeUserId,
      userLogs: isFirebaseConnected ? state.userLogs : state.userLogs
    }));
  } catch (e) {
    console.error("Error saving state to LocalStorage: ", e);
  }
}

function getDailyLog(userId, dateStr) {
  if (!state.userLogs[userId]) state.userLogs[userId] = {};
  if (!state.userLogs[userId][dateStr]) {
    state.userLogs[userId][dateStr] = { steps: 0, foods: [] };
  }
  return state.userLogs[userId][dateStr];
}

function getActiveUser() {
  return state.users.find(u => u.id === state.activeUserId) || null;
}

// --- Date Handling ---
function setDefaultDate() {
  const today = new Date();
  state.selectedDate = formatDateString(today);
  DOM.datePicker.value = state.selectedDate;
}

function formatDateString(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function getMondayOfDate(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - (day === 0 ? 6 : day - 1);
  const monday = new Date(date.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function getWorkoutBonus(count) {
  if (count <= 1) return 0;
  if (count === 2) return 500;
  if (count === 3) return 1500;
  if (count === 4) return 3000;
  return 5000; // 5 or more
}

function updateWorkoutsCount(newCount) {
  const activeUser = getActiveUser();
  if (!activeUser) return;

  const log = getDailyLog(activeUser.id, state.selectedDate);
  const workouts = Math.max(0, newCount);

  if (isFirebaseConnected && db) {
    db.collection('logs').doc(`${activeUser.id}_${state.selectedDate}`).set({
      userId: activeUser.id,
      date: state.selectedDate,
      steps: log.steps,
      foods: log.foods,
      workouts: workouts
    }, { merge: true }).catch(err => {
      console.error("Firestore workouts log error: ", err);
    });
  } else {
    log.workouts = workouts;
    saveState();
    renderAll();
  }
}

function updateDateLabel() {
  const selected = new Date(state.selectedDate + 'T00:00:00');
  const options = { month: 'short', day: 'numeric', year: 'numeric' };
  DOM.dateLabel.textContent = selected.toLocaleDateString('en-US', options);
}

// --- Mock Data Seeding ---
function seedMockData() {
  const todayStr = state.selectedDate;
  
  // Create history logs for the last 5 days
  for (let i = 1; i <= 5; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = formatDateString(date);

    // Trainer Red mock activity
    state.userLogs['u-1'] = state.userLogs['u-1'] || {};
    state.userLogs['u-1'][dateStr] = {
      steps: 8000 + Math.floor(Math.random() * 6000),
      foods: i % 2 === 0 ? [
        { id: 'mock-1', name: 'Pizza (Slice)', deduction: 4000 },
        { id: 'mock-2', name: 'Soda Can', deduction: 2000 }
      ] : [
        { id: 'mock-3', name: 'Glazed Donut', deduction: 3000 }
      ],
      workouts: i % 2 === 0 ? 3 : 1
    };

    // Fitness Blue mock activity
    state.userLogs['u-2'] = state.userLogs['u-2'] || {};
    state.userLogs['u-2'][dateStr] = {
      steps: 5000 + Math.floor(Math.random() * 8000),
      foods: i % 3 === 0 ? [
        { id: 'mock-4', name: 'Cheeseburger', deduction: 5000 }
      ] : [
        { id: 'mock-5', name: 'Apple', deduction: 0 }
      ],
      workouts: i % 3 === 0 ? 2 : 0
    };
  }

  // Set today's initial stats to show immediate data
  state.userLogs['u-1'] = state.userLogs['u-1'] || {};
  state.userLogs['u-1'][todayStr] = {
    steps: 12500,
    foods: [
      { id: 'seed-f1', name: 'Double Latte', deduction: 1500 },
      { id: 'seed-f2', name: 'Chocolate Chip Cookie', deduction: 2000 }
    ],
    workouts: 2
  };

  state.userLogs['u-2'] = state.userLogs['u-2'] || {};
  state.userLogs['u-2'][todayStr] = {
    steps: 6200,
    foods: [
      { id: 'seed-f3', name: 'Banana', deduction: 0 }
    ],
    workouts: 0
  };
}

// --- Render Controller ---
function renderAll() {
  updateDateLabel();
  renderUserControls();
  renderMainOverview();
  renderCumulativeStats();
  renderLeaderboard();
  renderHistory();
  renderFoodCatalog();
  renderLoggedFoods();
  renderCommunityComparison();
  
  // Make sure new Lucide icons are hydrated
  lucide.createIcons();
}

// --- Header User UI ---
function renderUserControls() {
  const activeUser = getActiveUser();
  if (!activeUser) return;

  // Header active profile display
  DOM.currentUserName.textContent = activeUser.name;
  DOM.currentUserInitials.textContent = getInitials(activeUser.name);
  DOM.currentUserAvatar.style.background = `linear-gradient(135deg, ${activeUser.avatarColor}, #ffffff)`;

  // Dropdown list
  DOM.usersListDropdown.innerHTML = '';
  state.users.forEach(user => {
    const itemBtn = document.createElement('button');
    itemBtn.className = `dropdown-item ${user.id === state.activeUserId ? 'active' : ''}`;
    
    // Avatar styling inside list
    const avatarHtml = `
      <div class="dropdown-avatar" style="background: linear-gradient(135deg, ${user.avatarColor}, #ffffff)">
        ${getInitials(user.name)}
      </div>
    `;

    itemBtn.innerHTML = `
      <div class="dropdown-item-info">
        ${avatarHtml}
        <span>${user.name}</span>
      </div>
      ${user.id === state.activeUserId ? '<i data-lucide="check" class="check-icon"></i>' : ''}
    `;

    itemBtn.addEventListener('click', () => {
      state.activeUserId = user.id;
      saveState();
      DOM.userDropdown.classList.remove('show');
      DOM.userMenuBtn.parentElement.classList.remove('active');
      renderAll();
    });

    DOM.usersListDropdown.appendChild(itemBtn);
  });
}

function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

function confirmUserDeletion(user) {
  const confirmed = confirm(`Are you sure you want to delete profile "${user.name}"? This will permanently erase their steps and food logs.`);
  if (!confirmed) return;

  if (isFirebaseConnected && db) {
    // Delete profile document from Firestore
    db.collection('users').doc(user.id).delete().then(() => {
      // Delete today's logs for this user from Firestore
      db.collection('logs').doc(`${user.id}_${state.selectedDate}`).delete().catch(() => {});
      
      // If we deleted the currently active user, shift activeUserId
      if (state.activeUserId === user.id) {
        const remaining = state.users.filter(u => u.id !== user.id);
        if (remaining.length > 0) {
          state.activeUserId = remaining[0].id;
        }
      }
      saveState();
      DOM.userDropdown.classList.remove('show');
      DOM.userMenuBtn.parentElement.classList.remove('active');
      
      // Refresh manage users view
      setTimeout(renderManageUsersList, 100);
    }).catch(err => {
      console.error("Firestore user deletion failed: ", err);
    });
  } else {
    // Local deletion
    state.users = state.users.filter(u => u.id !== user.id);
    if (state.userLogs[user.id]) {
      delete state.userLogs[user.id];
    }
    
    if (state.activeUserId === user.id) {
      state.activeUserId = state.users[0].id;
    }
    
    saveState();
    DOM.userDropdown.classList.remove('show');
    DOM.userMenuBtn.parentElement.classList.remove('active');
    renderAll();
    
    // Refresh manage users view
    renderManageUsersList();
  }
}

function openManageUsersModal() {
  renderManageUsersList();
  DOM.manageUsersModal.classList.add('show');
}

function closeManageUsersModal() {
  DOM.manageUsersModal.classList.remove('show');
}



function renderManageUsersList() {
  DOM.manageUsersList.innerHTML = '';
  state.users.forEach(user => {
    const row = document.createElement('div');
    row.className = 'manage-user-row';
    row.id = `manage-row-${user.id}`;
    
    const initialStr = getInitials(user.name);
    const avatarBg = `linear-gradient(135deg, ${user.avatarColor}, #ffffff)`;
    
    row.innerHTML = `
      <div class="manage-user-row-header">
        <div class="manage-user-details">
          <div class="manage-user-avatar" style="background: ${avatarBg}">
            ${initialStr}
          </div>
          <div class="manage-user-meta">
            <span class="manage-user-name">${user.name}</span>
            <span class="manage-user-goal">Goal: ${user.goal.toLocaleString()} steps</span>
          </div>
        </div>
        <div class="manage-user-actions">
          <button class="btn btn-secondary btn-sm edit-profile-btn" data-id="${user.id}">
            <i data-lucide="edit-3" style="width: 12px; height: 12px; display:inline; vertical-align:middle; margin-right:4px;"></i> Edit
          </button>
          ${state.users.length > 1 ? `
            <button class="btn btn-secondary btn-sm delete-profile-btn border-coral" data-id="${user.id}" style="color: var(--accent-coral)">
              <i data-lucide="trash-2" style="width: 12px; height: 12px; display:inline; vertical-align:middle; margin-right:4px;"></i> Delete
            </button>
          ` : ''}
        </div>
      </div>
      
      <!-- Hidden Edit Form -->
      <div id="edit-form-${user.id}" class="inline-edit-form hidden-element">
        <h3>Edit "${user.name}"</h3>
        <div class="form-group" style="margin-bottom: 10px;">
          <label>Name</label>
          <input type="text" id="edit-name-${user.id}" value="${user.name}" required>
        </div>
        <div class="form-group" style="margin-bottom: 10px;">
          <label>Daily Step Goal</label>
          <input type="number" id="edit-goal-${user.id}" value="${user.goal}" min="1000" step="500" required>
        </div>
        <div class="form-group" style="margin-bottom: 14px;">
          <label>Accent Color</label>
          <div class="color-options-grid edit-color-grid-${user.id}">
            <!-- Dynamically populated colors -->
          </div>
        </div>
        <div class="edit-actions">
          <button type="button" class="btn btn-secondary btn-sm cancel-edit-btn" data-id="${user.id}">Cancel</button>
          <button type="button" class="btn btn-primary btn-sm save-edit-btn" data-id="${user.id}">Save Changes</button>
        </div>
      </div>
    `;
    
    // Populate accent color selection options for this user
    const colorGrid = row.querySelector(`.edit-color-grid-${user.id}`);
    const colors = ["#10b981", "#06b6d4", "#6366f1", "#a855f7", "#ec4899", "#f59e0b"];
    colors.forEach(col => {
      const label = document.createElement('label');
      label.className = 'color-option-label';
      label.innerHTML = `
        <input type="radio" name="edit-color-${user.id}" value="${col}" ${user.avatarColor === col ? 'checked' : ''}>
        <span class="color-preview" style="background-color: ${col};" title="${col}"></span>
      `;
      colorGrid.appendChild(label);
    });
    
    // Event listeners for this row
    const editBtn = row.querySelector('.edit-profile-btn');
    const cancelBtn = row.querySelector('.cancel-edit-btn');
    const saveBtn = row.querySelector('.save-edit-btn');
    const deleteBtn = row.querySelector('.delete-profile-btn');
    const editForm = row.querySelector(`#edit-form-${user.id}`);
    
    editBtn.addEventListener('click', () => {
      editForm.classList.remove('hidden-element');
      editBtn.classList.add('hidden-element');
      lucide.createIcons();
    });
    
    cancelBtn.addEventListener('click', () => {
      editForm.classList.add('hidden-element');
      editBtn.classList.remove('hidden-element');
    });
    
    saveBtn.addEventListener('click', () => {
      const newName = row.querySelector(`#edit-name-${user.id}`).value.trim();
      const newGoal = parseInt(row.querySelector(`#edit-goal-${user.id}`).value, 10);
      const newColor = row.querySelector(`input[name="edit-color-${user.id}"]:checked`).value;
      
      if (!newName || isNaN(newGoal)) return;
      
      saveProfileChanges(user.id, newName, newGoal, newColor);
    });
    
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => {
        confirmUserDeletion(user);
      });
    }
    
    DOM.manageUsersList.appendChild(row);
  });
  
  // Hydrate newly added icons
  lucide.createIcons();
}

function saveProfileChanges(userId, name, goal, avatarColor) {
  if (isFirebaseConnected && db) {
    db.collection('users').doc(userId).update({
      name,
      goal,
      avatarColor
    }).then(() => {
      console.log(`Profile ${userId} updated in Firestore.`);
      setTimeout(renderManageUsersList, 100);
    }).catch(err => {
      console.error("Firestore user edit failed: ", err);
    });
  } else {
    // Local Storage path
    const user = state.users.find(u => u.id === userId);
    if (user) {
      user.name = name;
      user.goal = goal;
      user.avatarColor = avatarColor;
      saveState();
      renderAll();
      renderManageUsersList();
    }
  }
}

// --- Center Panel: Main Progress Wheel & Stats ---
function renderMainOverview() {
  const user = getActiveUser();
  if (!user) return;

  const log = getDailyLog(user.id, state.selectedDate);
  const totalSteps = log.steps;
  const foodDeduction = log.foods.reduce((sum, item) => sum + item.deduction, 0);
  const workouts = log.workouts || 0;
  
  // Daily Net steps cannot drop below 0: steps - foodDeduction
  const netSteps = Math.max(0, totalSteps - foodDeduction);
  
  // Extra Steps = steps over the target goal, after accounting for food penalty
  const extraSteps = Math.max(0, netSteps - user.goal);

  // Calculate Weekly Workouts and weekly bonus
  const selectedDateObj = new Date(state.selectedDate + 'T00:00:00');
  const monday = getMondayOfDate(selectedDateObj);
  let weeklyWorkouts = 0;
  for (let i = 0; i < 7; i++) {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    const dateStr = formatDateString(day);
    const logEntry = state.userLogs[user.id]?.[dateStr] || { workouts: 0 };
    weeklyWorkouts += logEntry.workouts || 0;
  }
  const weeklyWorkoutBonus = getWorkoutBonus(weeklyWorkouts);

  // Update numbers
  DOM.netStepsVal.textContent = netSteps.toLocaleString();
  DOM.goalStepsVal.textContent = user.goal.toLocaleString();
  DOM.foodDeductionVal.textContent = foodDeduction.toLocaleString();
  DOM.workoutBonusVal.textContent = weeklyWorkoutBonus.toLocaleString();
  DOM.extraStepsVal.textContent = extraSteps.toLocaleString();
  if (DOM.extraStepsDesc) {
    DOM.extraStepsDesc.textContent = "Over daily goal today";
  }

  // Update workouts logger display
  DOM.workoutCountDisplay.textContent = workouts;
  DOM.workoutWeeklyCount.textContent = weeklyWorkouts;
  DOM.workoutBonusDisplayVal.textContent = weeklyWorkoutBonus.toLocaleString();

  // Update Date Title
  const options = { weekday: 'long', month: 'short', day: 'numeric' };
  DOM.dateHeroTitle.textContent = selectedDateObj.toLocaleDateString('en-US', options);

  // Update status card classes
  DOM.dateHeroCard.className = "date-hero-card"; // Reset classes
  if (netSteps >= user.goal) {
    DOM.dateHeroCard.classList.add('status-green');
  } else if (totalSteps > 0) {
    DOM.dateHeroCard.classList.add('status-red');
  } else {
    DOM.dateHeroCard.classList.add('status-grey');
  }

  // Update focus glow variables matching user color
  document.documentElement.style.setProperty('--border-focus', `${user.avatarColor}66`);
}

function renderCumulativeStats() {
  const user = getActiveUser();
  if (!user) return;

  const selectedDateObj = new Date(state.selectedDate + 'T00:00:00');
  const currentDayOfMonth = selectedDateObj.getDate();
  const selectedYear = selectedDateObj.getFullYear();
  const selectedMonth = selectedDateObj.getMonth();

  // 1. Calculate Weekly Net Steps (Monday to Sunday of the active week)
  const monday = getMondayOfDate(selectedDateObj);
  let weeklyNetTotal = 0;
  let weeklyWorkouts = 0;
  let weeklyExtraSteps = 0;
  for (let i = 0; i < 7; i++) {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    const dateStr = formatDateString(day);
    const log = state.userLogs[user.id]?.[dateStr] || { steps: 0, foods: [], workouts: 0 };
    const foodDeduction = log.foods.reduce((sum, item) => sum + item.deduction, 0);
    const netSteps = Math.max(0, log.steps - foodDeduction);
    weeklyNetTotal += netSteps;
    weeklyWorkouts += log.workouts || 0;
    
    const dayExtra = Math.max(0, netSteps - user.goal);
    weeklyExtraSteps += dayExtra;
  }
  weeklyNetTotal += getWorkoutBonus(weeklyWorkouts);

  // 2. Calculate Monthly Net Steps (1st of month to active day)
  let monthlyNetTotal = 0;
  let monthlyExtraSteps = 0;
  const uniqueWeekMondays = new Set();
  for (let d = 1; d <= currentDayOfMonth; d++) {
    const day = new Date(selectedYear, selectedMonth, d);
    const dateStr = formatDateString(day);
    const log = state.userLogs[user.id]?.[dateStr] || { steps: 0, foods: [], workouts: 0 };
    const foodDeduction = log.foods.reduce((sum, item) => sum + item.deduction, 0);
    const netSteps = Math.max(0, log.steps - foodDeduction);
    monthlyNetTotal += netSteps;
    
    const dayExtra = Math.max(0, netSteps - user.goal);
    monthlyExtraSteps += dayExtra;
    
    // Find the Monday of this day to track unique weeks overlapping the month range
    const dayMonday = getMondayOfDate(day);
    uniqueWeekMondays.add(formatDateString(dayMonday));
  }

  // Add the weekly workout bonus for each unique week overlapping this month range
  uniqueWeekMondays.forEach(mondayStr => {
    const monDate = new Date(mondayStr + 'T00:00:00');
    let weekWorkouts = 0;
    for (let i = 0; i < 7; i++) {
      const day = new Date(monDate);
      day.setDate(monDate.getDate() + i);
      const dateStr = formatDateString(day);
      const log = state.userLogs[user.id]?.[dateStr] || { workouts: 0 };
      weekWorkouts += log.workouts || 0;
    }
    monthlyNetTotal += getWorkoutBonus(weekWorkouts);
  });

  // 3. Expected Target Steps to Date
  const expectedStepsToDate = user.goal * currentDayOfMonth;

  // 4. Comparison Difference
  const diff = monthlyNetTotal - expectedStepsToDate;

  // 5. Update DOM
  const weeklyGoal = user.goal * 7;
  DOM.weeklyTotalVal.innerHTML = `${weeklyNetTotal.toLocaleString()} <span style="font-size: 12px; color: var(--text-muted); font-weight: 400;">/ ${weeklyGoal.toLocaleString()}</span>`;
  DOM.monthlyTotalVal.textContent = monthlyNetTotal.toLocaleString();
  DOM.monthlyTargetVal.textContent = expectedStepsToDate.toLocaleString();
  
  DOM.cumulativeExtraVal.innerHTML = `+${weeklyExtraSteps.toLocaleString()} <span style="font-size: 12px; color: var(--text-muted); font-weight: 400;">wk</span>`;
  if (DOM.cumulativeExtraDesc) {
    DOM.cumulativeExtraDesc.textContent = `Monthly total: +${monthlyExtraSteps.toLocaleString()}`;
  }

  // Diff Badge Styling
  DOM.monthlyDiffVal.className = "diff-badge"; // Reset classes
  if (diff >= 0) {
    DOM.monthlyDiffVal.classList.add('status-green');
    DOM.monthlyDiffVal.textContent = `+${diff.toLocaleString()} ahead`;
  } else {
    DOM.monthlyDiffVal.classList.add('status-red');
    DOM.monthlyDiffVal.textContent = `-${Math.abs(diff).toLocaleString()} behind`;
  }
}

// --- Left Panel: Shared Leaderboard ---
function renderLeaderboard() {
  if (!DOM.leaderboardItems) return;
  DOM.leaderboardItems.innerHTML = '';

  if (state.users.length === 0) {
    DOM.leaderboardItems.innerHTML = `
      <div class="empty-state">
        <i data-lucide="users"></i>
        <p>Create a user profile to start tracking!</p>
      </div>
    `;
    return;
  }

  // Calculate stats for all users for the current date
  const boardData = state.users.map(user => {
    const log = getDailyLog(user.id, state.selectedDate);
    const totalSteps = log.steps;
    const foodDeduction = log.foods.reduce((sum, item) => sum + item.deduction, 0);
    const netSteps = Math.max(0, totalSteps - foodDeduction);
    const percentage = Math.min(100, (netSteps / user.goal) * 100);
    const extraSteps = Math.max(0, netSteps - user.goal);
    
    return {
      user,
      netSteps,
      goal: user.goal,
      percentage,
      extraSteps,
      foodDeduction
    };
  });

  // Sort by net steps descending
  boardData.sort((a, b) => b.netSteps - a.netSteps);

  boardData.forEach((data, index) => {
    const itemCard = document.createElement('div');
    itemCard.className = `leaderboard-item ${data.user.id === state.activeUserId ? 'is-active' : ''}`;
    
    // Indicators
    let badgeHtml = '';
    if (index === 0 && data.netSteps > 0) {
      badgeHtml = `<span class="leaderboard-badge-sm badge-gold"><i data-lucide="trophy" style="width: 10px; height: 10px; display:inline; vertical-align:middle;"></i> 1st Place</span>`;
    } else if (data.extraSteps > 0) {
      badgeHtml = `<span class="leaderboard-badge-sm badge-bonus">Bonus (+${Math.floor(data.extraSteps/1000)}k)</span>`;
    }

    itemCard.innerHTML = `
      <div class="leaderboard-row-top">
        <div class="leaderboard-user-details">
          <div class="leaderboard-avatar" style="background: linear-gradient(135deg, ${data.user.avatarColor}, #ffffff)">
            ${getInitials(data.user.name)}
          </div>
          <div class="leaderboard-user-info">
            <span class="leaderboard-username">${data.user.name}</span>
            <span class="leaderboard-user-goal-text">Goal: ${data.goal.toLocaleString()}</span>
          </div>
        </div>
        <div class="leaderboard-user-steps">
          <span class="leaderboard-steps-num">${data.netSteps.toLocaleString()}</span>
          <span class="leaderboard-steps-label">net steps</span>
        </div>
      </div>
      <div class="leaderboard-progress-container">
        <div class="leaderboard-bar-track">
          <div class="leaderboard-bar-fill" style="width: ${data.percentage}%; background-color: ${data.user.avatarColor};"></div>
        </div>
      </div>
      <div class="leaderboard-extra-row">
        <span>Food: -${data.foodDeduction.toLocaleString()}</span>
        ${badgeHtml}
      </div>
    `;

    // Click to swap to this profile
    itemCard.addEventListener('click', () => {
      if (state.activeUserId !== data.user.id) {
        state.activeUserId = data.user.id;
        saveState();
        renderAll();
      }
    });

    DOM.leaderboardItems.appendChild(itemCard);
  });
}

// --- Community side-by-side view ---
function renderCommunityComparison() {
  // Clear layout
  DOM.communityTableHead.innerHTML = '';
  DOM.communityTableBody.innerHTML = '';

  const monday = new Date(state.communityWeekStart);
  
  // Calculate the dates Monday through Sunday
  const daysOfWeek = [];
  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(monday);
    dayDate.setDate(monday.getDate() + i);
    daysOfWeek.push(dayDate);
  }

  // Update the week label
  const sunday = daysOfWeek[6];
  const startMonth = monday.toLocaleDateString('en-US', { month: 'short' });
  const startDay = monday.getDate();
  const endMonth = sunday.toLocaleDateString('en-US', { month: 'short' });
  const endDay = sunday.getDate();
  const endYear = sunday.getFullYear();
  
  DOM.weekLabel.textContent = `From ${startMonth} ${startDay} to ${endMonth} ${endDay}, ${endYear}`;

  if (state.users.length === 0) {
    // Populate header date cell
    const dateTh = document.createElement('th');
    dateTh.textContent = 'Date';
    DOM.communityTableHead.appendChild(dateTh);
    
    // Populate empty body
    DOM.communityTableBody.innerHTML = `
      <tr>
        <td style="text-align: center; padding: 40px; color: var(--text-muted);">
          <div class="empty-state">
            <i data-lucide="users"></i>
            <p>No user profiles created yet.</p>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  // Populate header row
  const dateTh = document.createElement('th');
  dateTh.textContent = 'Date';
  DOM.communityTableHead.appendChild(dateTh);
  
  state.users.forEach(user => {
    const th = document.createElement('th');
    th.className = 'community-th-user';
    th.innerHTML = `
      <div class="table-user-header">
        <div class="table-avatar" style="background: linear-gradient(135deg, ${user.avatarColor}, #ffffff)">
          ${getInitials(user.name)}
        </div>
        <span class="table-username">${user.name}</span>
      </div>
    `;
    DOM.communityTableHead.appendChild(th);
  });

  // Populate table body rows (Monday to Sunday)
  daysOfWeek.forEach(dayDate => {
    const dateStr = formatDateString(dayDate);
    const rowLabel = dayDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    
    const tr = document.createElement('tr');
    tr.className = 'community-tr';
    
    // First column: Date
    const dateTd = document.createElement('td');
    dateTd.className = 'community-td-date';
    dateTd.textContent = rowLabel;
    tr.appendChild(dateTd);
    
    // User data columns
    state.users.forEach(user => {
      const td = document.createElement('td');
      td.className = 'community-td-stats';
      
      const log = state.userLogs[user.id]?.[dateStr] || { steps: 0, foods: [], workouts: 0 };
      const totalSteps = log.steps;
      const foodDeduction = log.foods.reduce((sum, item) => sum + item.deduction, 0);
      const netSteps = Math.max(0, totalSteps - foodDeduction);
      
      let cellStatusClass = 'cell-grey';
      if (netSteps >= user.goal) {
        cellStatusClass = 'cell-green';
      } else if (totalSteps > 0) {
        cellStatusClass = 'cell-red';
      }
      
      let foodPenaltyHtml = '';
      if (foodDeduction > 0) {
        foodPenaltyHtml = `
          <div class="cell-food-penalty" title="Food cost penalty: -${foodDeduction.toLocaleString()} steps">
            <i data-lucide="utensils-crossedges"></i>
            <span>-${foodDeduction.toLocaleString()}</span>
          </div>
        `;
      }
      
      const hasActivity = totalSteps > 0 || log.foods.length > 0;
      
      if (hasActivity) {
        td.innerHTML = `
          <div class="cell-steps-wrapper ${cellStatusClass}">
            <span class="cell-net-steps">${netSteps.toLocaleString()}</span>
            <span class="cell-steps-goal">/ ${user.goal.toLocaleString()}</span>
          </div>
          ${foodPenaltyHtml}
        `;
      } else {
        td.innerHTML = `
          <div class="cell-steps-wrapper cell-grey">
            <span class="cell-net-steps">-</span>
            <span class="cell-steps-goal">/ ${user.goal.toLocaleString()}</span>
          </div>
        `;
      }
      
      tr.appendChild(td);
    });
    
    DOM.communityTableBody.appendChild(tr);
  });

  // Calculate summaries for the week for all users
  const userSummaries = state.users.map(user => {
    let totalWorkouts = 0;
    let sumDailyNetSteps = 0;
    let activeDays = 0;
    let totalFoodDeduction = 0;
    
    daysOfWeek.forEach(dayDate => {
      const dateStr = formatDateString(dayDate);
      const log = state.userLogs[user.id]?.[dateStr] || { steps: 0, foods: [], workouts: 0 };
      const foodDeduction = log.foods.reduce((sum, item) => sum + item.deduction, 0);
      const dailyNetSteps = Math.max(0, log.steps - foodDeduction);
      
      sumDailyNetSteps += dailyNetSteps;
      totalWorkouts += log.workouts || 0;
      totalFoodDeduction += foodDeduction;
      if (log.steps > 0 || log.foods.length > 0 || log.workouts > 0) {
        activeDays++;
      }
    });
    
    const workoutBonus = getWorkoutBonus(totalWorkouts);
    const weeklyNetSteps = sumDailyNetSteps + workoutBonus;
    
    return {
      user,
      totalWorkouts,
      workoutBonus,
      weeklyNetSteps,
      totalFoodDeduction,
      hasActivity: activeDays > 0
    };
  });

  // Append Total Workouts Row
  const workoutsTr = document.createElement('tr');
  workoutsTr.className = 'community-tr table-summary-row';
  const workoutsLabelTd = document.createElement('td');
  workoutsLabelTd.className = 'community-td-date table-summary-label';
  workoutsLabelTd.innerHTML = `<i data-lucide="dumbbell" style="width: 14px; height: 14px; color: var(--accent-amber); vertical-align: middle; margin-right: 6px;"></i> Workouts`;
  workoutsTr.appendChild(workoutsLabelTd);
  
  userSummaries.forEach(summary => {
    const td = document.createElement('td');
    td.className = 'community-td-stats table-summary-val';
    if (summary.hasActivity || summary.totalWorkouts > 0) {
      td.innerHTML = `
        <span style="font-weight: 700; color: var(--accent-amber);">${summary.totalWorkouts}</span>
        <span style="font-size: 11px; color: var(--text-secondary);"> sessions</span>
      `;
    } else {
      td.innerHTML = `<span style="color: var(--text-muted);">-</span>`;
    }
    workoutsTr.appendChild(td);
  });
  DOM.communityTableBody.appendChild(workoutsTr);

  // Append Workout Bonus Row
  const bonusTr = document.createElement('tr');
  bonusTr.className = 'community-tr table-summary-row';
  const bonusLabelTd = document.createElement('td');
  bonusLabelTd.className = 'community-td-date table-summary-label';
  bonusLabelTd.innerHTML = `<i data-lucide="award" style="width: 14px; height: 14px; color: var(--accent-amber); vertical-align: middle; margin-right: 6px;"></i> Workout Bonus`;
  bonusTr.appendChild(bonusLabelTd);
  
  userSummaries.forEach(summary => {
    const td = document.createElement('td');
    td.className = 'community-td-stats table-summary-val';
    if (summary.workoutBonus > 0) {
      td.innerHTML = `
        <span class="cell-workout-bonus" style="margin-left: 0; padding: 4px 10px; font-size: 12px; font-weight: 700;">
          <i data-lucide="dumbbell"></i> +${summary.workoutBonus.toLocaleString()}
        </span>
      `;
    } else {
      td.innerHTML = `<span style="color: var(--text-muted);">-</span>`;
    }
    bonusTr.appendChild(td);
  });
  DOM.communityTableBody.appendChild(bonusTr);

  // Append Food Penalty Row
  const foodTr = document.createElement('tr');
  foodTr.className = 'community-tr table-summary-row';
  const foodLabelTd = document.createElement('td');
  foodLabelTd.className = 'community-td-date table-summary-label';
  foodLabelTd.innerHTML = `<i data-lucide="utensils-crossedges" style="width: 14px; height: 14px; color: var(--accent-coral); vertical-align: middle; margin-right: 6px;"></i> Food Penalty`;
  foodTr.appendChild(foodLabelTd);
  
  userSummaries.forEach(summary => {
    const td = document.createElement('td');
    td.className = 'community-td-stats table-summary-val';
    if (summary.totalFoodDeduction > 0) {
      td.innerHTML = `
        <span style="font-weight: 700; color: var(--accent-coral); font-size: 13px;">
          -${summary.totalFoodDeduction.toLocaleString()}
        </span>
        <span style="font-size: 10px; color: var(--text-secondary);"> steps</span>
      `;
    } else {
      td.innerHTML = `<span style="color: var(--text-muted);">-</span>`;
    }
    foodTr.appendChild(td);
  });
  DOM.communityTableBody.appendChild(foodTr);

  // Append Weekly Net Steps Row
  const weeklyTotalTr = document.createElement('tr');
  weeklyTotalTr.className = 'community-tr table-summary-row highlight-weekly-total';
  const totalLabelTd = document.createElement('td');
  totalLabelTd.className = 'community-td-date table-summary-label';
  totalLabelTd.innerHTML = `<i data-lucide="trending-up" style="width: 14px; height: 14px; color: var(--accent-cyan); vertical-align: middle; margin-right: 6px;"></i> Weekly Net Steps`;
  weeklyTotalTr.appendChild(totalLabelTd);
  
  userSummaries.forEach(summary => {
    const td = document.createElement('td');
    td.className = 'community-td-stats table-summary-val';
    
    const weeklyTarget = summary.user.goal * 7;
    let statusClass = 'cell-grey';
    if (summary.weeklyNetSteps >= weeklyTarget) {
      statusClass = 'cell-green';
    } else if (summary.hasActivity) {
      statusClass = 'cell-red';
    }
    
    if (summary.hasActivity) {
      td.innerHTML = `
        <div class="cell-steps-wrapper ${statusClass}" style="padding: 6px 12px; font-size: 15px;">
          <span class="cell-net-steps" style="font-size: 15px;">${summary.weeklyNetSteps.toLocaleString()}</span>
          <span class="cell-steps-goal" style="font-size: 11px;">/ ${weeklyTarget.toLocaleString()}</span>
        </div>
      `;
    } else {
      td.innerHTML = `
        <div class="cell-steps-wrapper cell-grey" style="padding: 6px 12px; font-size: 15px;">
          <span class="cell-net-steps">-</span>
          <span class="cell-steps-goal" style="font-size: 11px;">/ ${weeklyTarget.toLocaleString()}</span>
        </div>
      `;
    }
    weeklyTotalTr.appendChild(td);
  });
  DOM.communityTableBody.appendChild(weeklyTotalTr);
}

// --- Left Panel: Personal History ---
function renderHistory() {
  if (!DOM.historyItems) return;
  DOM.historyItems.innerHTML = '';
  const activeUser = getActiveUser();
  if (!activeUser) return;

  const historyLogs = [];
  const today = new Date();

  // Get records for the last 7 days (including today)
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    const dateStr = formatDateString(date);
    
    // Check if there is data in userLogs
    const log = state.userLogs[activeUser.id]?.[dateStr] || { steps: 0, foods: [], workouts: 0 };
    const foodDeduction = log.foods.reduce((sum, item) => sum + item.deduction, 0);
    const netSteps = Math.max(0, log.steps - foodDeduction);
    
    historyLogs.push({
      dateStr,
      label: i === 0 ? "Today" : date.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' }),
      netSteps,
      goal: activeUser.goal,
      foodsCount: log.foods.length,
      hasActivity: log.steps > 0 || log.foods.length > 0 || log.workouts > 0
    });
  }

  historyLogs.forEach(h => {
    const row = document.createElement('div');
    const isGoalMet = h.netSteps >= h.goal;
    
    row.className = `history-row ${h.hasActivity ? (isGoalMet ? 'goal-met' : 'goal-missed') : ''}`;
    
    const foodIndicator = h.foodsCount > 0 
      ? `<span class="history-row-foods"><i data-lucide="utensils-crossedges" style="width: 10px; height: 10px;"></i> ${h.foodsCount}</span>`
      : '';

    row.innerHTML = `
      <span class="history-row-date">${h.label}</span>
      <div class="history-row-stats">
        ${foodIndicator}
        <span class="history-row-steps">${h.netSteps.toLocaleString()} / ${h.goal.toLocaleString()}</span>
      </div>
    `;

    DOM.historyItems.appendChild(row);
  });
}

// --- Right Panel: Food Catalog Grid ---
let activeCategoryFilter = 'all';
function renderFoodCatalog() {
  DOM.foodCatalogGrid.innerHTML = '';
  const searchQuery = DOM.foodSearch.value.toLowerCase().trim();

  const filteredCatalog = FOOD_CATALOG.filter(food => {
    const matchesSearch = food.name.toLowerCase().includes(searchQuery);
    const matchesCategory = activeCategoryFilter === 'all' || food.category === activeCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (filteredCatalog.length === 0) {
    DOM.foodCatalogGrid.innerHTML = `
      <div style="grid-column: span 2; text-align: center; color: var(--text-muted); font-size: 12px; padding: 14px 0;">
        No food items found matching filters.
      </div>
    `;
    return;
  }

  filteredCatalog.forEach(food => {
    const btn = document.createElement('button');
    btn.className = 'food-btn';
    btn.innerHTML = `
      <span class="food-btn-name">${food.name}</span>
      <span class="food-btn-cost">-${food.deduction.toLocaleString()} steps</span>
    `;

    // Click to add to eaten logs
    btn.addEventListener('click', () => {
      addFoodToActiveLog(food.name, food.deduction);
    });

    DOM.foodCatalogGrid.appendChild(btn);
  });
}

function addFoodToActiveLog(name, deduction) {
  const activeUser = getActiveUser();
  if (!activeUser) return;

  const log = getDailyLog(activeUser.id, state.selectedDate);
  const logId = 'food-' + Date.now() + '-' + Math.floor(Math.random() * 100);

  if (isFirebaseConnected && db) {
    const updatedFoods = [...log.foods, { id: logId, name, deduction }];
    db.collection('logs').doc(`${activeUser.id}_${state.selectedDate}`).set({
      userId: activeUser.id,
      date: state.selectedDate,
      steps: log.steps,
      foods: updatedFoods
    }, { merge: true }).catch(err => {
      console.error("Firestore add food error: ", err);
    });
  } else {
    log.foods.push({ id: logId, name, deduction });
    saveState();
    renderAll();
  }
}

// --- Right Panel: Eaten Today List ---
function renderLoggedFoods() {
  const activeUser = getActiveUser();
  if (!activeUser) return;

  const log = getDailyLog(activeUser.id, state.selectedDate);
  DOM.loggedFoodsList.innerHTML = '';

  if (log.foods.length === 0) {
    DOM.loggedFoodsList.innerHTML = `<li class="empty-list-msg">No foods logged today yet.</li>`;
    return;
  }

  log.foods.forEach(food => {
    const li = document.createElement('li');
    li.className = 'logged-item';
    li.innerHTML = `
      <div class="logged-item-details">
        <span class="logged-item-name">${food.name}</span>
        <span class="logged-item-penalty">-${food.deduction.toLocaleString()} steps</span>
      </div>
      <button class="delete-logged-btn" title="Remove food log">
        <i data-lucide="trash-2"></i>
      </button>
    `;

    // Delete item click
    li.querySelector('.delete-logged-btn').addEventListener('click', () => {
      if (isFirebaseConnected && db) {
        const updatedFoods = log.foods.filter(f => f.id !== food.id);
        db.collection('logs').doc(`${activeUser.id}_${state.selectedDate}`).set({
          userId: activeUser.id,
          date: state.selectedDate,
          steps: log.steps,
          foods: updatedFoods
        }, { merge: true }).catch(err => {
          console.error("Firestore delete food error: ", err);
        });
      } else {
        log.foods = log.foods.filter(f => f.id !== food.id);
        saveState();
        renderAll();
      }
    });

    DOM.loggedFoodsList.appendChild(li);
  });
}

// --- DOM Layout Helper ---
function adjustDateSelectorPosition() {
  const dateSelector = document.querySelector('.date-selector-wrapper');
  const logStepsCard = document.querySelector('.log-steps-card');
  const headerContainer = document.querySelector('.header-container');
  const headerControls = document.querySelector('.header-controls');

  if (!dateSelector) return;

  if (window.innerWidth <= 820) {
    if (logStepsCard && dateSelector.parentElement !== logStepsCard.parentElement) {
      logStepsCard.parentNode.insertBefore(dateSelector, logStepsCard);
    }
  } else {
    if (headerContainer && headerControls && dateSelector.parentElement !== headerContainer) {
      headerContainer.insertBefore(dateSelector, headerControls);
    }
  }
}

// --- Event Listeners Setup ---
function setupEventListeners() {
  window.addEventListener('resize', adjustDateSelectorPosition);

  // Global Dropdown click tracker
  document.addEventListener('click', (e) => {
    if (!DOM.userMenuBtn.contains(e.target)) {
      DOM.userDropdown.classList.remove('show');
      DOM.userMenuBtn.parentElement.classList.remove('active');
    }
  });

  // Dropdown toggle
  DOM.userMenuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    DOM.userDropdown.classList.toggle('show');
    DOM.userMenuBtn.parentElement.classList.toggle('active');
  });

  // Open add user modal
  DOM.addUserMenuBtn.addEventListener('click', () => {
    DOM.userDropdown.classList.remove('show');
    DOM.userMenuBtn.parentElement.classList.remove('active');
    openAddUserModal();
  });

  document.querySelectorAll('.open-add-user-modal-btn').forEach(btn => {
    btn.addEventListener('click', openAddUserModal);
  });

  // Open manage users modal
  DOM.manageUsersMenuBtn.addEventListener('click', () => {
    DOM.userDropdown.classList.remove('show');
    DOM.userMenuBtn.parentElement.classList.remove('active');
    openManageUsersModal();
  });

  // Close modals
  DOM.closeModalBtn.addEventListener('click', closeAddUserModal);
  DOM.cancelUserCreate.addEventListener('click', closeAddUserModal);
  DOM.addUserModal.addEventListener('click', (e) => {
    if (e.target === DOM.addUserModal) closeAddUserModal();
  });

  DOM.closeManageModalBtn.addEventListener('click', closeManageUsersModal);
  DOM.manageUsersModal.addEventListener('click', (e) => {
    if (e.target === DOM.manageUsersModal) closeManageUsersModal();
  });



  // Add User Form Submission
  DOM.createUserForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = DOM.newUsername.value.trim();
    const goal = parseInt(DOM.newUserGoal.value, 10);
    const avatarColor = document.querySelector('input[name="profile-color"]:checked').value;

    if (!name || isNaN(goal)) return;

    const newId = 'u-' + Date.now();

    if (isFirebaseConnected && db) {
      db.collection('users').doc(newId).set({
        name,
        goal,
        avatarColor
      }).then(() => {
        state.activeUserId = newId;
        saveState();
        closeAddUserModal();
      }).catch(err => {
        console.error("Firestore user creation error: ", err);
      });
    } else {
      state.users.push({
        id: newId,
        name,
        goal,
        avatarColor
      });

      state.activeUserId = newId;
      saveState();
      closeAddUserModal();
      renderAll();
    }
    
    // Reset form
    DOM.createUserForm.reset();
  });

  // Log Steps Form Submission
  DOM.logStepsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const steps = parseInt(DOM.stepCountInput.value, 10);
    if (isNaN(steps) || steps <= 0) return;

    addSteps(steps);
    DOM.stepCountInput.value = '';
  });

  // Food Search
  DOM.foodSearch.addEventListener('input', () => {
    renderFoodCatalog();
    lucide.createIcons();
  });

  // Category Filter Tabs
  DOM.categoryTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      DOM.categoryTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeCategoryFilter = tab.getAttribute('data-category');
      renderFoodCatalog();
      lucide.createIcons();
    });
  });

  // Custom Food Form Toggle
  DOM.toggleCustomFoodBtn.addEventListener('click', () => {
    DOM.customFoodForm.classList.remove('hidden-element');
    DOM.toggleCustomFoodBtn.classList.add('hidden-element');
  });

  DOM.cancelCustomFood.addEventListener('click', () => {
    hideCustomFoodForm();
  });

  // Custom Food Log Submit
  DOM.customFoodForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = DOM.customFoodName.value.trim();
    const deduction = parseInt(DOM.customFoodDeduction.value, 10);

    if (!name || isNaN(deduction) || deduction < 0) return;

    addFoodToActiveLog(name, deduction);
    hideCustomFoodForm();
  });

  // Date Navigation
  DOM.prevDayBtn.addEventListener('click', () => {
    adjustDate(-1);
  });

  DOM.nextDayBtn.addEventListener('click', () => {
    adjustDate(1);
  });

  DOM.datePicker.addEventListener('change', () => {
    state.selectedDate = DOM.datePicker.value;
    renderAll();
  });

  // Tab Navigation Switching
  DOM.tabDashboard.addEventListener('click', () => {
    state.activeTab = 'dashboard';
    DOM.tabDashboard.classList.add('active');
    DOM.tabCommunity.classList.remove('active');
    DOM.viewDashboard.classList.remove('hidden-element');
    DOM.viewCommunity.classList.add('hidden-element');
    renderAll();
  });

  DOM.tabCommunity.addEventListener('click', () => {
    state.activeTab = 'community';
    DOM.tabCommunity.classList.add('active');
    DOM.tabDashboard.classList.remove('active');
    DOM.viewCommunity.classList.remove('hidden-element');
    DOM.viewDashboard.classList.add('hidden-element');
    renderAll();
  });

  // Week Navigation
  DOM.prevWeekBtn.addEventListener('click', () => {
    adjustWeek(-1);
  });

  DOM.nextWeekBtn.addEventListener('click', () => {
    adjustWeek(1);
  });

  // Workout Session Counter Navigation
  DOM.decWorkoutBtn.addEventListener('click', () => {
    const activeUser = getActiveUser();
    if (!activeUser) return;
    const log = getDailyLog(activeUser.id, state.selectedDate);
    const workouts = log.workouts || 0;
    updateWorkoutsCount(workouts - 1);
  });

  DOM.incWorkoutBtn.addEventListener('click', () => {
    const activeUser = getActiveUser();
    if (!activeUser) return;
    const log = getDailyLog(activeUser.id, state.selectedDate);
    const workouts = log.workouts || 0;
    updateWorkoutsCount(workouts + 1);
  });
}

function openAddUserModal() {
  DOM.addUserModal.classList.add('show');
}

function closeAddUserModal() {
  DOM.addUserModal.classList.remove('show');
}

function hideCustomFoodForm() {
  DOM.customFoodForm.classList.add('hidden-element');
  DOM.toggleCustomFoodBtn.classList.remove('hidden-element');
  DOM.customFoodName.value = '';
  DOM.customFoodDeduction.value = '';
}

function addSteps(count) {
  const activeUser = getActiveUser();
  if (!activeUser) return;

  const log = getDailyLog(activeUser.id, state.selectedDate);
  const newSteps = log.steps + count;
  const foodPenalty = log.foods.reduce((sum, item) => sum + item.deduction, 0);
  const workouts = log.workouts || 0;
  const netSteps = Math.max(0, newSteps - foodPenalty);

  if (isFirebaseConnected && db) {
    db.collection('logs').doc(`${activeUser.id}_${state.selectedDate}`).set({
      userId: activeUser.id,
      date: state.selectedDate,
      steps: newSteps,
      foods: log.foods
    }, { merge: true }).then(() => {
      syncToGoogleSheets(count, newSteps, foodPenalty, workouts, netSteps);
    }).catch(err => {
      console.error("Firestore steps log error: ", err);
    });
  } else {
    log.steps += count;
    saveState();
    renderAll();
    syncToGoogleSheets(count, log.steps, foodPenalty, workouts, netSteps);
  }
}

function syncToGoogleSheets(stepsAdded, totalSteps, foodPenalty, workouts, netSteps) {
  if (!GOOGLE_SHEETS_WEBAPP_URL || GOOGLE_SHEETS_WEBAPP_URL.trim() === "") return;

  const activeUser = getActiveUser();
  if (!activeUser) return;

  const payload = {
    date: state.selectedDate,
    userName: activeUser.name,
    stepsAdded: stepsAdded,
    totalSteps: totalSteps,
    foodPenalty: foodPenalty,
    workouts: workouts,
    netSteps: netSteps
  };

  fetch(GOOGLE_SHEETS_WEBAPP_URL, {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  })
  .then(() => {
    console.log("Logged steps synced to Google Sheets successfully.");
  })
  .catch(err => {
    console.error("Failed to sync to Google Sheets: ", err);
  });
}

function adjustDate(daysOffset) {
  const currentDate = new Date(state.selectedDate + 'T00:00:00');
  currentDate.setDate(currentDate.getDate() + daysOffset);
  state.selectedDate = formatDateString(currentDate);
  DOM.datePicker.value = state.selectedDate;
  renderAll();
}

function adjustWeek(weeksOffset) {
  const currentMonday = new Date(state.communityWeekStart);
  currentMonday.setDate(currentMonday.getDate() + weeksOffset * 7);
  state.communityWeekStart = currentMonday;
  renderAll();
}

// Start app
window.addEventListener('DOMContentLoaded', init);
