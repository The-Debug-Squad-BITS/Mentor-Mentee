# EduFlow — Backend Integration Guide for Frontend AI

---

## 🤖 Instructions for AI Reading This File

You are an AI assistant helping a frontend team integrate a fully built backend into their existing React frontend.

**Your job:**
- Read and understand the existing frontend architecture before making any changes.
- Analyze existing pages, components, hooks, services, state management, routing, and API layers first.
- Reuse existing components wherever possible.
- Do NOT rewrite working UI components unnecessarily.
- If the required UI already exists, update and integrate it with the backend.
- If the required UI does not exist, create the missing screens/components following the existing project structure, design system, coding standards, and UI patterns.
- Maintain consistency with the current codebase.
- Avoid duplicate implementations.
- Refactor only when absolutely necessary for integration.

**Backend Base URL:** `http://localhost:5000/api`

**Tech stack the frontend should use for integration:**
- HTTP calls: `axios`
- Global state: `zustand`
- The UI framework (Tailwind, Chakra, etc.) stays as-is — you only add logic

---

## ⚙️ One-Time Setup (Do This Before Step 1)

### Branch
```bash
git checkout -b feat/initial-setup
```

### Install required packages
```bash
npm install axios zustand
```

### Create `src/lib/api.js` — Axios Instance
```js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request automatically
api.interceptors.request.use((config) => {
  const token = useAuthStore?.getState?.()?.token || localStorage.getItem('eduflow_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// If 401 received — auto logout and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore?.getState?.()?.logout?.();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

> Note: `useAuthStore` will be imported after Step 1. If circular import issue occurs, use `localStorage.getItem('eduflow_token')` directly in the interceptor.

### Create `src/store/authStore.js` — Zustand Auth Store
```js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,

      // Call this after successful login or register
      login: (user, token) => set({ user, token }),

      // Update specific user fields (e.g. mustChangePassword: false)
      updateUser: (updates) =>
        set((state) => ({ user: { ...state.user, ...updates } })),

      // Clear all auth state
      logout: () => set({ user: null, token: null }),
    }),
    {
      name: 'eduflow_auth', // key in localStorage
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);
```

> This store persists `user` and `token` automatically in localStorage. No manual `localStorage.setItem` needed after this.

### Create `.env` in project root (if not exists)
```
VITE_API_URL=http://localhost:5000/api
```

### Commit setup
```bash
git add .
git commit -m "chore: setup axios instance and zustand auth store"
git push origin feat/initial-setup
```

> 🛑 **STOP.** Setup complete. Verify that `src/lib/api.js`, `src/store/authStore.js`, and `.env` exist. Tell me to proceed when ready.

---

---

# STEP 1 — Login Page Integration

## Branch
```bash
git checkout -b feat/login-integration
```

## Context
The frontend already has a Login page with email and password inputs and a submit button.

## What this page needs to do
1. Take email and password from the form
2. Call the login API
3. Save token and user to Zustand store
4. Check if user must change password on first login
5. Redirect to the correct dashboard based on role

## API Details
```
Method: POST
URL:    /auth/login
Body:   { email: string, password: string }

Success Response (200):
{
  "success": true,
  "data": {
    "token": "eyJhbG...",
    "user": {
      "_id": "...",
      "name": "Dharmik",
      "email": "admin@bits.edu",
      "role": "ADMIN",             // "ADMIN" | "MENTOR" | "MENTEE"
      "mustChangePassword": false,  // true on first login after invite
      "organizationId": "..."
    }
  }
}

Error Responses:
- 401: { success: false, message: "Invalid email or password" }
- 400: { success: false, errors: [{ field: "email", message: "A valid email is required" }] }
```

## Integration Logic

Find the login form's submit handler and replace/add:

```js
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

const { login } = useAuthStore();

const handleLoginSubmit = async (formValues) => {
  try {
    const response = await api.post('/auth/login', {
      email: formValues.email,
      password: formValues.password,
    });

    const { token, user } = response.data.data;
    login(user, token); // Saves to Zustand + localStorage

    // First-time login: user must change temporary password
    if (user.mustChangePassword) {
      navigate('/change-password');
      return;
    }

    // Role-based redirect
    if (user.role === 'ADMIN')  navigate('/admin/dashboard');
    if (user.role === 'MENTOR') navigate('/mentor/dashboard');
    if (user.role === 'MENTEE') navigate('/mentee/dashboard');

  } catch (error) {
    const status = error.response?.status;
    const data   = error.response?.data;

    if (status === 401) {
      // Show error message: "Invalid email or password"
    }
    if (status === 400 && data?.errors) {
      // Show field-level errors
      // data.errors = [{ field: 'email', message: '...' }]
    }
  }
};
```

## State After This Step
```
useAuthStore:
  user  → { _id, name, email, role, mustChangePassword }
  token → "eyJhbG..."
```

## Test
- [ ] Valid Admin login → `/admin/dashboard`
- [ ] Valid Mentor login → `/mentor/dashboard`
- [ ] Valid Mentee login → `/mentee/dashboard`
- [ ] Wrong password → error message visible on UI
- [ ] First login (mustChangePassword: true) → `/change-password`

## Git Commit
```bash
git add .
git commit -m "feat: integrate login api with role-based redirect and zustand state"
git push origin feat/login-integration
```

> 🛑 **STOP.** Step 1 complete. Test the login flow. Tell me to proceed when ready.

---

# STEP 2 — Register Organization Page Integration

## Branch
```bash
git checkout main && git pull
git checkout -b feat/register-integration
```

## Context
Frontend has a Register page for first-time org setup. Only one admin registers — mentors and mentees are invited (Step 5).

## What this page needs to do
1. Collect: Organization Name, Admin Full Name, Email, Password
2. Call register API
3. Save token + user to store
4. Redirect to Admin Dashboard

## API Details
```
Method: POST
URL:    /auth/register-admin
Body:   {
          organizationName: string,
          adminName: string,
          email: string,
          password: string   // min 8 characters
        }

Success Response (201):
{
  "success": true,
  "data": {
    "token": "eyJhbG...",
    "user": {
      "_id": "...",
      "name": "Dharmik",
      "email": "admin@bits.edu",
      "role": "ADMIN",
      "mustChangePassword": false
    }
  }
}

Error Responses:
- 409: { success: false, message: "Email already registered" }
- 400: { success: false, errors: [{ field: "organizationName", message: "Required" }] }
```

## Integration Logic
```js
const handleRegisterSubmit = async (formValues) => {
  try {
    const response = await api.post('/auth/register-admin', {
      organizationName: formValues.organizationName,
      adminName: formValues.adminName,
      email: formValues.email,
      password: formValues.password,
    });

    const { token, user } = response.data.data;
    login(user, token);
    navigate('/admin/dashboard');

  } catch (error) {
    const status = error.response?.status;
    const data   = error.response?.data;

    if (status === 409) {
      // Show: "This email is already registered. Please login instead."
    }
    if (status === 400 && data?.errors) {
      // Show each error under its respective field
      // data.errors = [{ field: "password", message: "Password must be at least 8 characters" }]
    }
  }
};
```

## Test
- [ ] Valid data → Admin Dashboard
- [ ] Duplicate email → error message
- [ ] Short password → validation error under password field
- [ ] Empty fields → required errors visible

## Git Commit
```bash
git add .
git commit -m "feat: integrate register organization api"
git push origin feat/register-integration
```

> 🛑 **STOP.** Step 2 complete. Test registration. Tell me to proceed when ready.

---

# STEP 3 — Change Password Page Integration

## Branch
```bash
git checkout main && git pull
git checkout -b feat/change-password-integration
```

## Context
After first login, users with `mustChangePassword: true` are redirected here. Page has: current password, new password, confirm password fields.

## What this page needs to do
1. Validate new password = confirm password (client-side)
2. Validate new password >= 8 characters (client-side)
3. Call change password API
4. Update user in Zustand store (`mustChangePassword: false`)
5. Redirect to correct dashboard

## API Details
```
Method: PATCH
URL:    /auth/change-password
Headers: Authorization: Bearer <token>   ← auto-handled by axios
Body:   { currentPassword: string, newPassword: string }

Success Response (200):
{ "success": true, "message": "Password changed successfully" }

Error Responses:
- 400: { success: false, message: "Current password is incorrect" }
- 400: { success: false, errors: [{ field: "newPassword", message: "..." }] }
```

## Integration Logic
```js
const { user, updateUser } = useAuthStore();

const handleChangePasswordSubmit = async (formValues) => {
  // Client-side validation first
  if (formValues.newPassword !== formValues.confirmPassword) {
    // Show: "New passwords do not match"
    return;
  }
  if (formValues.newPassword.length < 8) {
    // Show: "Password must be at least 8 characters"
    return;
  }

  try {
    await api.patch('/auth/change-password', {
      currentPassword: formValues.currentPassword,
      newPassword: formValues.newPassword,
    });

    // Update store — user no longer needs to change password
    updateUser({ mustChangePassword: false });

    // Redirect based on role
    if (user.role === 'ADMIN')  navigate('/admin/dashboard');
    if (user.role === 'MENTOR') navigate('/mentor/dashboard');
    if (user.role === 'MENTEE') navigate('/mentee/dashboard');

  } catch (error) {
    // Show: error.response?.data?.message || "Password change failed"
  }
};
```

## Test
- [ ] Correct current password + valid new password → redirect to dashboard
- [ ] Wrong current password → error message visible
- [ ] New passwords don't match → client-side error before API call
- [ ] Less than 8 chars → client-side error

## Git Commit
```bash
git add .
git commit -m "feat: integrate change password for first login flow"
git push origin feat/change-password-integration
```

> 🛑 **STOP.** Step 3 complete. Test password change flow. Tell me to proceed when ready.

---

# STEP 4 — Admin Dashboard — Stats Integration

## Branch
```bash
git checkout main && git pull
git checkout -b feat/admin-dashboard-integration
```

## Context
Admin dashboard page exists. It likely has stat cards or a summary section. We need to populate 4 numbers from the API.

## What this page needs to do
1. On page load, fetch admin dashboard stats
2. Display the 4 numbers in corresponding UI cards
3. Show logged-in admin's name in the navbar/header
4. Logout button clears store and redirects to login

## API Details
```
Method: GET
URL:    /dashboard/admin
Headers: Authorization: Bearer <token>   ← auto-handled

Success Response (200):
{
  "success": true,
  "data": {
    "totalMentors": 5,
    "totalMentees": 20,
    "totalProjects": 8,
    "pendingInvitations": 2
  }
}

Error: 403 if non-admin tries to access
```

## Integration Logic
```js
const { user, logout } = useAuthStore();

// On component mount
useEffect(() => {
  const fetchDashboard = async () => {
    try {
      const response = await api.get('/dashboard/admin');
      const data = response.data.data;
      // Map to UI:
      // data.totalMentors      → "Total Mentors" card
      // data.totalMentees      → "Total Mentees" card
      // data.totalProjects     → "Total Projects" card
      // data.pendingInvitations → "Pending Invitations" card
      setStats(data);
    } catch {
      // Show error toast/message
    }
  };
  fetchDashboard();
}, []);

// For navbar: user.name — display logged-in admin name
// Logout button:
const handleLogout = () => {
  logout(); // Clears zustand store + localStorage
  navigate('/login');
};
```

## Zustand Store (Create Separate Dashboard Store if Needed)
```js
// src/store/dashboardStore.js
import { create } from 'zustand';

export const useDashboardStore = create((set) => ({
  adminStats: null,
  setAdminStats: (stats) => set({ adminStats: stats }),
}));
```

## Test
- [ ] Admin dashboard loads → 4 numbers visible
- [ ] Admin name shows in navbar
- [ ] Logout button → login page
- [ ] Access with mentor/mentee token → should get 403 (redirect handled by interceptor)

## Git Commit
```bash
git add .
git commit -m "feat: integrate admin dashboard stats and logout"
git push origin feat/admin-dashboard-integration
```

> 🛑 **STOP.** Step 4 complete. Test the dashboard. Tell me to proceed when ready.

---

# STEP 5 — User Management Integration (Admin)

## Branch
```bash
git checkout main && git pull
git checkout -b feat/user-management-integration
```

## Context
Admin has a Users page to see all mentors/mentees, invite new ones, and deactivate existing ones.

## What this page/section needs to do
1. Load users list with optional filters (role, search, pagination)
2. Show each user: Name, Email, Role badge, Active/Inactive status
3. Invite button opens a form: Name, Email, Role (MENTOR or MENTEE)
4. Deactivate button (with confirmation) sets user inactive

## API Details

### Get All Users
```
Method: GET
URL:    /users
Params: { page: number, limit: number, role?: 'MENTOR'|'MENTEE', search?: string }

Response (200):
{
  "data": {
    "users": [
      { "_id": "...", "name": "...", "email": "...", "role": "MENTOR", "isActive": true }
    ],
    "pagination": { "total": 20, "page": 1, "pages": 2 }
  }
}
```

### Invite User
```
Method: POST
URL:    /users/invite
Body:   { name: string, email: string, role: "MENTOR" | "MENTEE" }

Response (201): { "success": true, "message": "Invitation sent successfully" }
Errors:
- 409: Email already registered
- 400: Validation errors (field-level)
```

### Deactivate User (Soft Delete)
```
Method: DELETE
URL:    /users/:userId
Response (200): { "success": true, "message": "User deactivated" }
Note: User is NOT deleted. isActive becomes false.
```

## Integration Logic

```js
// Fetch users (call on load + on filter change)
const fetchUsers = async (role = '', search = '', page = 1) => {
  const params = { page, limit: 10 };
  if (role)   params.role = role;
  if (search) params.search = search;
  const response = await api.get('/users', { params });
  // response.data.data.users   → array of users
  // response.data.data.pagination → { total, page, pages }
};

// Invite user
const handleInvite = async ({ name, email, role }) => {
  try {
    await api.post('/users/invite', { name, email, role });
    // Show success: "Invitation sent! They will receive login credentials via email."
    // Note: In development, email may not send — credentials are shown in server console
    fetchUsers(); // Refresh list
  } catch (error) {
    if (error.response?.status === 409) {
      // Show: "This email is already registered"
    }
    if (error.response?.status === 400) {
      // Show: error.response.data.errors (field-level)
    }
  }
};

// Deactivate
const handleDeactivate = async (userId) => {
  // Show confirmation dialog first
  const confirmed = window.confirm('Deactivate this user?');
  if (!confirmed) return;

  try {
    await api.delete(`/users/${userId}`);
    // Show: "User deactivated"
    fetchUsers(); // Refresh
  } catch {
    // Show error
  }
};
```

## Zustand Store for Users
```js
// src/store/userStore.js
import { create } from 'zustand';

export const useUserStore = create((set) => ({
  users: [],
  pagination: null,
  setUsers: (users, pagination) => set({ users, pagination }),
}));
```

## Test
- [ ] Users list loads on page open
- [ ] Role filter (MENTOR/MENTEE/All) changes list
- [ ] Search by name works
- [ ] Invite Mentor → success message
- [ ] Invite same email again → "already registered" error
- [ ] Deactivate → user shows as Inactive in list

## Git Commit
```bash
git add .
git commit -m "feat: integrate user management - list, invite, deactivate"
git push origin feat/user-management-integration
```

> 🛑 **STOP.** Step 5 complete. Test all user management features. Tell me to proceed when ready.

---

# STEP 6 — Project Management Integration (Admin)

## Branch
```bash
git checkout main && git pull
git checkout -b feat/projects-integration
```

## Context
Admin can create projects, view them, open details, assign a mentor, assign mentees, and delete projects.

## What this page needs to do
1. Show list of all projects (title, status, assigned mentor name)
2. Create Project form: Title, Description, Start Date, End Date
3. Project detail view: Assign Mentor dropdown, Assign Mentees multi-select, Delete button

## API Details

### Get All Projects
```
Method: GET
URL:    /projects
Params: { page: 1, limit: 20, status?: string }

Response (200):
{
  "data": {
    "projects": [
      {
        "_id": "...",
        "title": "AI Chatbot Project",
        "description": "...",
        "status": "ACTIVE",     // PLANNED | ACTIVE | COMPLETED | ON_HOLD
        "startDate": "2025-07-01T...",
        "endDate": "2025-12-31T...",
        "mentorId": { "_id": "...", "name": "Mentor Name" },
        "mentees": [{ "_id": "...", "name": "Mentee Name" }]
      }
    ]
  }
}
```

### Create Project
```
Method: POST
URL:    /projects
Body:   { title: string, description: string, startDate: string, endDate: string }
        startDate/endDate format: "YYYY-MM-DD"

Response (201): { "data": { "project": { "_id": "...", ... } } }
Errors: 400 validation errors
```

### Assign Mentor to Project
```
Method: PATCH
URL:    /projects/:projectId/assign-mentor
Body:   { mentorId: string }   ← user _id of the mentor

Response (200): { "success": true, "data": { "project": {...} } }
```

### Assign Mentees to Project
```
Method: PATCH
URL:    /projects/:projectId/assign-mentees
Body:   { mentees: ["menteeId1", "menteeId2"] }   ← array of user _ids

Response (200): { "success": true, "data": { "project": {...} } }
```

### Delete Project
```
Method: DELETE
URL:    /projects/:projectId
Response (200): { "success": true }
```

## Integration Logic

```js
// Load all projects
const loadProjects = async () => {
  const response = await api.get('/projects', { params: { limit: 50 } });
  // response.data.data.projects → array
};

// Create project
const handleCreateProject = async ({ title, description, startDate, endDate }) => {
  try {
    const response = await api.post('/projects', { title, description, startDate, endDate });
    const newProject = response.data.data.project;
    // Show success, refresh list
  } catch (error) {
    // error.response.data.errors for field-level errors
  }
};

// To populate Assign Mentor dropdown — fetch all mentors from users API
const loadMentors = async () => {
  const response = await api.get('/users', { params: { role: 'MENTOR', limit: 100 } });
  return response.data.data.users; // [{ _id, name, email }]
};

// To populate Assign Mentees multi-select — fetch all mentees
const loadMentees = async () => {
  const response = await api.get('/users', { params: { role: 'MENTEE', limit: 100 } });
  return response.data.data.users;
};

// Assign mentor (when admin selects from dropdown)
const handleAssignMentor = async (projectId, mentorId) => {
  await api.patch(`/projects/${projectId}/assign-mentor`, { mentorId });
  // Refresh project details
};

// Assign mentees (when admin selects multiple from list)
const handleAssignMentees = async (projectId, selectedMenteeIds) => {
  // selectedMenteeIds = array of _id strings
  await api.patch(`/projects/${projectId}/assign-mentees`, { mentees: selectedMenteeIds });
};

// Delete project
const handleDeleteProject = async (projectId) => {
  const confirmed = window.confirm('Delete this project? This cannot be undone.');
  if (!confirmed) return;
  await api.delete(`/projects/${projectId}`);
  // Navigate back to projects list
};
```

## Zustand Store for Projects
```js
// src/store/projectStore.js
import { create } from 'zustand';

export const useProjectStore = create((set) => ({
  projects: [],
  currentProject: null,
  setProjects: (projects) => set({ projects }),
  setCurrentProject: (project) => set({ currentProject: project }),
}));
```

## Test
- [ ] Projects list loads
- [ ] Create project form → project appears in list
- [ ] Mentor dropdown populates with all mentors
- [ ] Assign mentor → saved and visible on project
- [ ] Mentees multi-select → assign multiple
- [ ] Delete project → removed from list

## Git Commit
```bash
git add .
git commit -m "feat: integrate project management - create, assign mentor/mentees, delete"
git push origin feat/projects-integration
```

> 🛑 **STOP.** Step 6 complete. Test all project features. Tell me to proceed when ready.

---

# STEP 7 — Mentor Dashboard Integration

## Branch
```bash
git checkout main && git pull
git checkout -b feat/mentor-dashboard-integration
```

## Context
Mentor dashboard shows their personal stats — assigned projects, pending reviews, and mentee count.

## What this page needs to do
1. Load mentor-specific stats on page mount
2. Display 3 stat numbers
3. Show mentor's name in header/navbar

## API Details
```
Method: GET
URL:    /dashboard/mentor
Headers: Authorization: Bearer <mentor_token>

Response (200):
{
  "data": {
    "assignedProjects": 3,
    "pendingReviews": 5,
    "assignedMentees": 8
  }
}

Error: 403 if non-mentor tries to access
```

## Integration Logic
```js
const { user } = useAuthStore();

useEffect(() => {
  const fetchDashboard = async () => {
    try {
      const response = await api.get('/dashboard/mentor');
      const data = response.data.data;
      // data.assignedProjects → "My Projects" stat card
      // data.pendingReviews   → "Pending Reviews" stat card
      // data.assignedMentees  → "My Mentees" stat card
      setStats(data);
    } catch {
      // Show error
    }
  };
  fetchDashboard();
}, []);
```

## Test
- [ ] Mentor dashboard loads with correct stats
- [ ] Mentor name visible in header
- [ ] Admin token accessing this page → should not work (403)

## Git Commit
```bash
git add .
git commit -m "feat: integrate mentor dashboard stats"
git push origin feat/mentor-dashboard-integration
```

> 🛑 **STOP.** Step 7 complete. Tell me to proceed when ready.

---

# STEP 8 — Task Management Integration (Mentor)

## Branch
```bash
git checkout main && git pull
git checkout -b feat/task-management-integration
```

## Context
Mentor can create tasks, assign them to mentees, view all tasks they created, and delete tasks.

## What this page/section needs to do
1. Show all tasks created by this mentor (with status badges)
2. Create Task form: Title, Description, Project (dropdown), Assign To (mentee dropdown), Priority, Due Date
3. Delete task button

## Task Status Values
```
TODO            → Not started yet
IN_PROGRESS     → Mentee is working on it
SUBMITTED       → Mentee submitted work
UNDER_REVIEW    → Mentor is reviewing
APPROVED        → Work approved
REVISION_NEEDED → Mentor asked for changes
```

## Priority Values
```
LOW | MEDIUM | HIGH
```

## API Details

### Get All Tasks (Mentor sees tasks they created)
```
Method: GET
URL:    /tasks
Params: { limit: 50, projectId?: string, status?: string }

Response (200):
{
  "data": {
    "tasks": [
      {
        "_id": "...",
        "title": "Implement Login Page",
        "description": "...",
        "projectId": { "_id": "...", "title": "AI Chatbot" },
        "assignedTo": { "_id": "...", "name": "Student Name" },
        "assignedBy": { "_id": "...", "name": "Mentor Name" },
        "priority": "HIGH",
        "dueDate": "2025-09-30T...",
        "status": "TODO"
      }
    ]
  }
}
```

### Create Task
```
Method: POST
URL:    /tasks
Headers: Authorization: Bearer <mentor_token>
Body:   {
          title: string,
          description: string,
          projectId: string,     ← project _id
          assignedTo: string,    ← mentee user _id
          priority: "LOW"|"MEDIUM"|"HIGH",
          dueDate: string        ← "YYYY-MM-DD"
        }

Response (201): { "data": { "task": { "_id": "...", ... } } }
Note: A notification is automatically sent to the assigned mentee
Errors: 400 validation errors
```

### Delete Task
```
Method: DELETE
URL:    /tasks/:taskId
Response (200): { "success": true }
```

## Integration Logic

```js
// Fetch all tasks
const loadTasks = async () => {
  const response = await api.get('/tasks', { params: { limit: 50 } });
  // response.data.data.tasks → array
};

// For Create Task form — populate project dropdown
const loadProjects = async () => {
  const response = await api.get('/projects', { params: { limit: 50 } });
  return response.data.data.projects; // [{ _id, title }]
};

// For Create Task form — populate mentee dropdown
const loadMentees = async () => {
  const response = await api.get('/users', { params: { role: 'MENTEE', limit: 100 } });
  return response.data.data.users; // [{ _id, name }]
};

// Create task
const handleCreateTask = async (formValues) => {
  try {
    await api.post('/tasks', {
      title: formValues.title,
      description: formValues.description,
      projectId: formValues.selectedProjectId,
      assignedTo: formValues.selectedMenteeId,
      priority: formValues.priority,      // "LOW" | "MEDIUM" | "HIGH"
      dueDate: formValues.dueDate,
    });
    // Show: "Task created! Mentee will be notified."
    loadTasks(); // Refresh
  } catch (error) {
    // error.response.data.errors for field-level errors
  }
};

// Delete task
const handleDeleteTask = async (taskId) => {
  const confirmed = window.confirm('Delete this task?');
  if (!confirmed) return;
  await api.delete(`/tasks/${taskId}`);
  loadTasks();
};
```

## Zustand Store for Tasks
```js
// src/store/taskStore.js
import { create } from 'zustand';

export const useTaskStore = create((set) => ({
  tasks: [],
  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((state) => ({ tasks: [task, ...state.tasks] })),
  removeTask: (taskId) => set((state) => ({ tasks: state.tasks.filter(t => t._id !== taskId) })),
}));
```

## Test
- [ ] Tasks list loads for mentor
- [ ] Project dropdown in create form shows mentor's projects
- [ ] Mentee dropdown shows all mentees
- [ ] Task created → appears in list
- [ ] Delete task → removed from list
- [ ] Mentee token trying to create task → should fail (403)

## Git Commit
```bash
git add .
git commit -m "feat: integrate task management for mentor - create, list, delete"
git push origin feat/task-management-integration
```

> 🛑 **STOP.** Step 8 complete. Test task management. Tell me to proceed when ready.

---

# STEP 9 — Submission Review Integration (Mentor)

## Branch
```bash
git checkout main && git pull
git checkout -b feat/submission-review-integration
```

## Context
Mentor sees all submitted work from mentees and can approve or request revision with feedback.

## What this page/section needs to do
1. Show all submissions (task name, mentee name, submission status, file link)
2. "Review" action for PENDING_REVIEW submissions only
3. Review modal/section: show file, show mentee notes, feedback textarea, Approve button, Request Revision button

## Submission Status Values
```
PENDING_REVIEW  → Waiting for mentor review (show "Review" button)
APPROVED        → Mentor approved
REVISION_NEEDED → Mentor asked for revision
```

## API Details

### Get All Submissions (Mentor sees submissions for tasks they created)
```
Method: GET
URL:    /submissions
Params: { limit: 50 }

Response (200):
{
  "data": {
    "submissions": [
      {
        "_id": "...",
        "taskId": { "_id": "...", "title": "Implement Login Page" },
        "submittedBy": { "_id": "...", "name": "Student Name" },
        "fileUrl": "https://res.cloudinary.com/...",
        "notes": "Completed with all validations",
        "status": "PENDING_REVIEW",
        "feedback": null,
        "submittedAt": "2025-08-01T..."
      }
    ]
  }
}
```

### Approve Submission
```
Method: PATCH
URL:    /submissions/:submissionId/approve
Body:   { feedback: string }   ← feedback is REQUIRED

Response (200): { "success": true }
Note: Mentee gets an automatic notification
```

### Request Revision
```
Method: PATCH
URL:    /submissions/:submissionId/revision
Body:   { feedback: string }   ← feedback is REQUIRED

Response (200): { "success": true }
Note: Mentee gets an automatic notification
```

## Integration Logic

```js
// Load submissions
const loadSubmissions = async () => {
  const response = await api.get('/submissions', { params: { limit: 50 } });
  // response.data.data.submissions → array
};

// Approve
const handleApprove = async (submissionId, feedback) => {
  if (!feedback.trim()) {
    // Show: "Feedback is required before approving"
    return;
  }
  try {
    await api.patch(`/submissions/${submissionId}/approve`, { feedback });
    // Show: "Submission approved! Mentee notified."
    loadSubmissions();
  } catch {
    // Show error
  }
};

// Request revision
const handleRequestRevision = async (submissionId, feedback) => {
  if (!feedback.trim()) {
    // Show: "Please provide feedback explaining what needs revision"
    return;
  }
  try {
    await api.patch(`/submissions/${submissionId}/revision`, { feedback });
    // Show: "Revision requested. Mentee notified."
    loadSubmissions();
  } catch {
    // Show error
  }
};
```

## Test
- [ ] Submissions list loads
- [ ] PENDING_REVIEW submissions have "Review" button
- [ ] APPROVED / REVISION_NEEDED submissions show status only (no review button)
- [ ] File URL → clickable link opens in new tab
- [ ] Feedback empty → error before API call
- [ ] Approve → status changes + notification sent
- [ ] Revision → status changes + notification sent

## Git Commit
```bash
git add .
git commit -m "feat: integrate submission review - approve and request revision"
git push origin feat/submission-review-integration
```

> 🛑 **STOP.** Step 9 complete. Test submission review. Tell me to proceed when ready.

---

# STEP 10 — Mentee Dashboard + My Tasks Integration

## Branch
```bash
git checkout main && git pull
git checkout -b feat/mentee-integration
```

## Context
Mentee dashboard shows their personal progress. Tasks page shows assigned tasks with ability to update status and navigate to submit work.

## What these pages need to do
1. Dashboard: Show 4 stat cards
2. Tasks page: Show all assigned tasks with status, "Start Task" and "Submit Work" buttons
3. If task has REVISION_NEEDED status → show mentor's feedback text on the task card

## API Details

### Mentee Dashboard
```
Method: GET
URL:    /dashboard/mentee
Headers: Authorization: Bearer <mentee_token>

Response (200):
{
  "data": {
    "assignedTasks": 10,
    "completedTasks": 6,
    "pendingTasks": 3,
    "revisionRequests": 1
  }
}
```

### Get My Tasks (Mentee sees only tasks assigned to them)
```
Method: GET
URL:    /tasks
Params: { limit: 50 }   ← backend auto-filters by logged-in user

Response: Same tasks structure as Step 8
Each task also has: feedback field (mentor's feedback if revision needed)
```

### Update Task Status (Mentee only — limited transitions)
```
Method: PATCH
URL:    /tasks/:taskId/status
Body:   { status: "IN_PROGRESS" }
← Mentee can only set: IN_PROGRESS
← Backend auto-sets SUBMITTED when they submit work

Response (200): { "success": true, "data": { "task": {...} } }
```

## Integration Logic

```js
// Mentee dashboard
useEffect(() => {
  const fetchDashboard = async () => {
    const response = await api.get('/dashboard/mentee');
    const data = response.data.data;
    // data.assignedTasks    → "Total Tasks" card
    // data.completedTasks   → "Completed" card
    // data.pendingTasks     → "Pending" card
    // data.revisionRequests → "Needs Revision" card
  };
  fetchDashboard();
}, []);

// Load mentee's tasks
const loadMyTasks = async () => {
  const response = await api.get('/tasks', { params: { limit: 50 } });
  // response.data.data.tasks → array of tasks assigned to this mentee
};

// "Start Task" button — changes status from TODO to IN_PROGRESS
const handleStartTask = async (taskId) => {
  try {
    await api.patch(`/tasks/${taskId}/status`, { status: 'IN_PROGRESS' });
    // Show: "Task started!"
    loadMyTasks(); // Refresh
  } catch {
    // Show error
  }
};

// "Submit Work" button — navigate to submit page
// (Actual submission handled in Step 11)
const handleGoToSubmit = (taskId) => {
  navigate(`/submit-work/${taskId}`);
  // Or open a modal — depends on existing UI
};
```

## Which Button Shows When
```
Task status TODO           → Show "Start Task" button
Task status IN_PROGRESS    → Show "Submit Work" button
Task status SUBMITTED      → Show "Pending Review" label (no action)
Task status UNDER_REVIEW   → Show "Under Review" label (no action)
Task status APPROVED       → Show "Approved ✅" label (no action)
Task status REVISION_NEEDED → Show mentor's feedback text + "Resubmit" button
                              task.feedback contains the mentor's message
```

## Test
- [ ] Mentee dashboard 4 stats correct
- [ ] Task list shows only mentee's assigned tasks
- [ ] "Start Task" changes status to IN_PROGRESS
- [ ] REVISION_NEEDED task shows mentor feedback text
- [ ] "Submit Work" navigates correctly

## Git Commit
```bash
git add .
git commit -m "feat: integrate mentee dashboard and task status management"
git push origin feat/mentee-integration
```

> 🛑 **STOP.** Step 10 complete. Test mentee flows. Tell me to proceed when ready.

---

# STEP 11 — File Upload + Submit Work Integration

## Branch
```bash
git checkout main && git pull
git checkout -b feat/submit-work-integration
```

## Context
This is the most important mentee action. They first upload a file (PDF/ZIP/image/doc), get back a URL, then submit the task with that URL and optional notes.

## ⚠️ Critical — Two-Step Process
```
Step A: Upload file to server → get back Cloudinary URL
Step B: Submit work using that URL
These are TWO separate API calls. Step B cannot happen without Step A.
```

## What this page/modal needs to do
1. File picker (PDF, ZIP, PNG, JPG, JPEG, DOCX — max ~5-10MB)
2. "Upload File" button → uploads and shows success
3. Optional notes textarea
4. "Submit for Review" button → only enabled after file upload succeeds
5. Success → redirect back to tasks or show success state

## API Details

### Upload File
```
Method: POST
URL:    /upload
Headers:
  Authorization: Bearer <token>
  Content-Type: multipart/form-data   ← NOT application/json

Body: FormData with key "file" → the actual file object

Response (200):
{
  "success": true,
  "data": {
    "url": "https://res.cloudinary.com/ddf9v8pkj/...",
    "publicId": "...",
    "format": "pdf",
    "size": 102400
  }
}
```

### Submit Work
```
Method: POST
URL:    /submissions
Headers: Authorization: Bearer <token>
Body:   {
          taskId: string,   ← the task _id from URL params
          fileUrl: string,  ← URL received from /upload step
          notes: string     ← optional, can be empty string
        }

Response (201): { "success": true }
Note: Task status automatically becomes SUBMITTED after this call
```

## Integration Logic

```js
// ⚠️ File upload uses different axios config (multipart/form-data)
const handleFileUpload = async (selectedFile) => {
  const formData = new FormData();
  formData.append('file', selectedFile);

  // Get token from Zustand store
  const token = useAuthStore.getState().token;

  const response = await axios.post('http://localhost:5000/api/upload', formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      // Optional: show upload progress bar
      const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      setUploadProgress(percent);
    },
  });

  const uploadedUrl = response.data.data.url;
  setFileUrl(uploadedUrl); // Save for step B
  // Show: "File uploaded successfully!"
};

// Submit work (only after file is uploaded)
const handleSubmitWork = async (taskId, fileUrl, notes) => {
  if (!fileUrl) {
    // Show: "Please upload a file first"
    return;
  }
  try {
    await api.post('/submissions', { taskId, fileUrl, notes });
    // Show: "Work submitted! Your mentor will review it."
    navigate('/mentee/tasks'); // or close modal
  } catch (error) {
    // Show: error.response?.data?.message || "Submission failed"
  }
};
```

## Test
- [ ] File picker accepts correct file types
- [ ] Upload shows progress (optional) and success state
- [ ] "Submit" button disabled before upload
- [ ] Submit success → back to tasks, task status is SUBMITTED
- [ ] Wrong file type → backend returns error message

## Git Commit
```bash
git add .
git commit -m "feat: integrate file upload and work submission two-step flow"
git push origin feat/submit-work-integration
```

> 🛑 **STOP.** Step 11 complete. Test file upload + submission. Tell me to proceed when ready.

---

# STEP 12 — Notifications Integration

## Branch
```bash
git checkout main && git pull
git checkout -b feat/notifications-integration
```

## Context
Every user (Admin/Mentor/Mentee) has notifications. These appear in a bell icon in the navbar. Unread notifications show a count badge. Clicking a notification marks it as read.

## What the navbar bell needs to do
1. On app load, fetch user's notifications
2. Show unread count as a badge on bell icon
3. Dropdown shows list of notifications (icon, title, message, time)
4. Click on any notification → mark it as read → remove bold/highlight
5. Poll every 30 seconds for new notifications

## Notification Types and Their Meaning
```
TASK_ASSIGNED       → Mentee receives: "New task assigned to you"
SUBMISSION_RECEIVED → Mentor receives: "New submission received for review"
SUBMISSION_APPROVED → Mentee receives: "Your submission was approved"
REVISION_REQUESTED  → Mentee receives: "Revision requested on your submission"
INVITATION_SENT     → Mentor/Mentee receives: "You've been invited to EduFlow"
```

## API Details

### Get Notifications
```
Method: GET
URL:    /notifications
Headers: Authorization: Bearer <token>   ← each user gets their own

Response (200):
{
  "data": {
    "notifications": [
      {
        "_id": "...",
        "title": "New Task Assigned",
        "message": "You have been assigned: Implement Login Page",
        "type": "TASK_ASSIGNED",
        "isRead": false,
        "createdAt": "2025-08-01T10:30:00Z"
      }
    ]
  }
}
```

### Mark as Read
```
Method: PATCH
URL:    /notifications/:notificationId/read
Response (200): { "success": true }
```

## Integration Logic

```js
// Zustand store for notifications
// src/store/notificationStore.js
import { create } from 'zustand';

export const useNotificationStore = create((set) => ({
  notifications: [],
  setNotifications: (notifications) => set({ notifications }),
  markRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n._id === id ? { ...n, isRead: true } : n
      ),
    })),
}));

// Computed
// unreadCount = notifications.filter(n => !n.isRead).length
```

```js
// Fetch and poll
const { setNotifications, markRead } = useNotificationStore();

useEffect(() => {
  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data.data.notifications);
    } catch { /* silent fail */ }
  };

  fetchNotifications();
  const interval = setInterval(fetchNotifications, 30000); // 30 sec
  return () => clearInterval(interval);
}, []);

// Mark as read on click
const handleNotificationClick = async (notification) => {
  if (notification.isRead) return; // Already read
  try {
    await api.patch(`/notifications/${notification._id}/read`);
    markRead(notification._id); // Update Zustand immediately (no re-fetch needed)
  } catch { /* silent fail */ }
};
```

## Test
- [ ] After approving a submission → mentee's bell shows new notification
- [ ] After assigning a task → mentee's bell shows new notification
- [ ] Unread count badge shows correct number
- [ ] Click notification → becomes read (un-bolded)
- [ ] Empty state if no notifications

## Git Commit
```bash
git add .
git commit -m "feat: integrate notification bell with polling and mark as read"
git push origin feat/notifications-integration
```

> 🛑 **STOP.** Step 12 complete. Test notifications end to end. Tell me to proceed when ready.

---

# STEP 13 — Protected Routes + Auth Guard Integration

## Branch
```bash
git checkout main && git pull
git checkout -b feat/auth-guard-integration
```

## Context
Ensure that pages are protected — users without login or with wrong roles cannot access certain pages.

## What needs to happen
1. If user is not logged in → redirect to `/login` on any protected page
2. If user's role doesn't match the page → redirect to `/unauthorized` or similar
3. If logged in user visits `/login` → redirect to their dashboard (don't show login again)

## Integration Logic

```js
// Read from Zustand store
const { user, token } = useAuthStore();

// Guard logic — use in a wrapper component or in each page's useEffect
const guardRoute = (allowedRoles) => {
  if (!token || !user) {
    navigate('/login');
    return false;
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    navigate('/unauthorized'); // or '/' or show a message
    return false;
  }
  return true;
};

// Use at top of each page:
// Admin page: guardRoute(['ADMIN'])
// Mentor page: guardRoute(['MENTOR'])
// Mentee page: guardRoute(['MENTEE'])
// Shared page: guardRoute(['ADMIN', 'MENTOR', 'MENTEE'])
```

## Role → Page Access Map
```
ADMIN  → /admin/dashboard, /admin/users, /admin/projects
MENTOR → /mentor/dashboard, /mentor/tasks, /mentor/submissions
MENTEE → /mentee/dashboard, /mentee/tasks, /mentee/submit-work/:taskId
ALL    → /change-password, /notifications
```

## Test
- [ ] Not logged in → any dashboard URL → `/login`
- [ ] MENTOR token → `/admin/dashboard` → access denied
- [ ] ADMIN token → `/mentee/tasks` → access denied
- [ ] Logged-in user visits `/login` → their dashboard

## Git Commit
```bash
git add .
git commit -m "feat: integrate route guards with role-based access control"
git push origin feat/auth-guard-integration
```

> 🛑 **STOP.** Step 13 complete. Test all role-based access. All 13 steps are now complete!

---

---

# 📋 Complete Step Summary

| Step | Feature | Branch |
|---|---|---|
| Setup | axios + zustand install, api.js, authStore.js | `feat/initial-setup` |
| **Step 1** | Login + role-based redirect | `feat/login-integration` |
| **Step 2** | Register Organization | `feat/register-integration` |
| **Step 3** | Change Password (first login) | `feat/change-password-integration` |
| **Step 4** | Admin Dashboard stats | `feat/admin-dashboard-integration` |
| **Step 5** | User Management (invite, list, deactivate) | `feat/user-management-integration` |
| **Step 6** | Project Management (create, assign, delete) | `feat/projects-integration` |
| **Step 7** | Mentor Dashboard stats | `feat/mentor-dashboard-integration` |
| **Step 8** | Task Management (create, list, delete) | `feat/task-management-integration` |
| **Step 9** | Submission Review (approve, revision) | `feat/submission-review-integration` |
| **Step 10** | Mentee Dashboard + Task Status | `feat/mentee-integration` |
| **Step 11** | File Upload + Submit Work | `feat/submit-work-integration` |
| **Step 12** | Notifications Bell | `feat/notifications-integration` |
| **Step 13** | Protected Routes + Auth Guard | `feat/auth-guard-integration` |

---

# ⚙️ Zustand Stores Reference

| Store File | Purpose | Key State |
|---|---|---|
| `authStore.js` | User + Token | `user`, `token`, `login()`, `logout()`, `updateUser()` |
| `dashboardStore.js` | Dashboard stats | `adminStats`, `mentorStats`, `menteeStats` |
| `userStore.js` | Users list | `users`, `pagination` |
| `projectStore.js` | Projects list + detail | `projects`, `currentProject` |
| `taskStore.js` | Tasks list | `tasks`, `addTask()`, `removeTask()` |
| `notificationStore.js` | Notifications | `notifications`, `markRead()` |

---

# ⚠️ Error Response Reference

```js
// Pattern to handle in every catch block:
catch (error) {
  const status = error.response?.status;
  const data   = error.response?.data;

  if (status === 400 && data?.errors) {
    // Field-level validation errors
    // data.errors = [{ field: "email", message: "Valid email required" }]
    // Show each error under/beside its corresponding input field
  }
  else if (status === 401) {
    // Auto-handled by axios interceptor → redirects to /login
  }
  else if (status === 403) {
    // Show: "You don't have permission for this action"
  }
  else if (status === 404) {
    // Show: "Not found"
  }
  else if (status === 409) {
    // Show: data.message (e.g. "Email already registered")
  }
  else {
    // Show: data?.message || "Something went wrong. Please try again."
  }
}
```

---

# 🔗 Backend API Quick Reference

| Method | URL | Who Can Call | What It Does |
|---|---|---|---|
| POST | `/auth/register-admin` | Public | Register org + admin |
| POST | `/auth/login` | Public | Login, get token |
| GET | `/auth/me` | All | Get current user info |
| PATCH | `/auth/change-password` | All | Change password |
| POST | `/users/invite` | ADMIN | Invite mentor/mentee |
| GET | `/users` | ADMIN | List all users |
| PATCH | `/users/:id` | ADMIN | Update user |
| DELETE | `/users/:id` | ADMIN | Deactivate user |
| POST | `/projects` | ADMIN | Create project |
| GET | `/projects` | All | List projects (role-filtered) |
| GET | `/projects/:id` | All | Get project details |
| PATCH | `/projects/:id` | ADMIN | Update project |
| DELETE | `/projects/:id` | ADMIN | Delete project |
| PATCH | `/projects/:id/assign-mentor` | ADMIN | Assign mentor |
| PATCH | `/projects/:id/assign-mentees` | ADMIN | Assign mentees |
| POST | `/tasks` | MENTOR | Create task |
| GET | `/tasks` | All | List tasks (role-filtered) |
| GET | `/tasks/:id` | All | Get task detail |
| PATCH | `/tasks/:id` | MENTOR | Update task |
| DELETE | `/tasks/:id` | MENTOR | Delete task |
| PATCH | `/tasks/:id/status` | MENTEE | Update task status |
| POST | `/submissions` | MENTEE | Submit work |
| GET | `/submissions` | MENTOR | List submissions |
| GET | `/submissions/:id` | MENTOR | Get submission detail |
| PATCH | `/submissions/:id/approve` | MENTOR | Approve submission |
| PATCH | `/submissions/:id/revision` | MENTOR | Request revision |
| GET | `/notifications` | All | Get user's notifications |
| PATCH | `/notifications/:id/read` | All | Mark notification read |
| GET | `/dashboard/admin` | ADMIN | Admin stats |
| GET | `/dashboard/mentor` | MENTOR | Mentor stats |
| GET | `/dashboard/mentee` | MENTEE | Mentee stats |
| POST | `/upload` | All | Upload file → get URL |
| GET | `/api/health` | Public | Server health check |

---

*Backend: The Debug Squad — BITS Pilani*
*Backend URL (dev): `http://localhost:5000/api`*
