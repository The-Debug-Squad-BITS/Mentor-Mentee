# Backend Integration Guide: Steps 5 to 8

> [!NOTE]
> Setup steps (installing Axios/Zustand, creating the Axios instance and Auth Store, environment variables) and **Steps 1 through 4** are already fully integrated, verified, and compiled. 
>
> To continue the integration project, start directly with **Step 5** on a new branch.

---

## STEP 5 — User Management Integration (Admin)

### Branch
```bash
git checkout main && git pull
git checkout -b feat/user-management-integration
```

### Context
Admin has a Users page to see all mentors/mentees, invite new ones, and deactivate existing ones.

### What this page/section needs to do
1. Load users list with optional filters (role, search, pagination)
2. Show each user: Name, Email, Role badge, Active/Inactive status
3. Invite button opens a form: Name, Email, Role (`MENTOR` or `MENTEE`)
4. Deactivate button (with confirmation) sets user inactive

### API Details

#### Get All Users
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

#### Invite User
```
Method: POST
URL:    /users/invite
Body:   { name: string, email: string, role: "MENTOR" | "MENTEE" }

Response (201): { "success": true, "message": "Invitation sent successfully" }
Errors:
- 409: Email already registered
- 400: Validation errors (field-level)
```

#### Deactivate User (Soft Delete)
```
Method: DELETE
URL:    /users/:userId
Response (200): { "success": true, "message": "User deactivated" }
Note: User is NOT deleted. isActive becomes false.
```

### Integration Logic

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

### Zustand Store for Users
```js
// src/store/userStore.js
import { create } from 'zustand';

export const useUserStore = create((set) => ({
  users: [],
  pagination: null,
  setUsers: (users, pagination) => set({ users, pagination }),
}));
```

### Test
- [ ] Users list loads on page open
- [ ] Role filter (MENTOR/MENTEE/All) changes list
- [ ] Search by name works
- [ ] Invite Mentor → success message
- [ ] Invite same email again → "already registered" error
- [ ] Deactivate → user shows as Inactive in list

### Git Commit
```bash
git add .
git commit -m "feat: integrate user management - list, invite, deactivate"
git push origin feat/user-management-integration
```

> 🛑 **STOP.** Step 5 complete. Test all user management features. Tell me to proceed when ready.

---

## STEP 6 — Project Management Integration (Admin)

### Branch
```bash
git checkout main && git pull
git checkout -b feat/projects-integration
```

### Context
Admin can create projects, view them, open details, assign a mentor, assign mentees, and delete projects.

### What this page needs to do
1. Show list of all projects (title, status, assigned mentor name)
2. Create Project form: Title, Description, Start Date, End Date
3. Project detail view: Assign Mentor dropdown, Assign Mentees multi-select, Delete button

### API Details

#### Get All Projects
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

#### Create Project
```
Method: POST
URL:    /projects
Body:   { title: string, description: string, startDate: string, endDate: string }
        startDate/endDate format: "YYYY-MM-DD"

Response (201): { "data": { "project": { "_id": "...", ... } } }
Errors: 400 validation errors
```

#### Assign Mentor to Project
```
Method: PATCH
URL:    /projects/:projectId/assign-mentor
Body:   { mentorId: string }   ← user _id of the mentor

Response (200): { "success": true, "data": { "project": {...} } }
```

#### Assign Mentees to Project
```
Method: PATCH
URL:    /projects/:projectId/assign-mentees
Body:   { mentees: ["menteeId1", "menteeId2"] }   ← array of user _ids

Response (200): { "success": true, "data": { "project": {...} } }
```

#### Delete Project
```
Method: DELETE
URL:    /projects/:projectId
Response (200): { "success": true }
```

### Integration Logic

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

### Zustand Store for Projects
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

### Test
- [ ] Projects list loads
- [ ] Create project form → project appears in list
- [ ] Mentor dropdown populates with all mentors
- [ ] Assign mentor → saved and visible on project
- [ ] Mentees multi-select → assign multiple
- [ ] Delete project → removed from list

### Git Commit
```bash
git add .
git commit -m "feat: integrate project management - create, assign mentor/mentees, delete"
git push origin feat/projects-integration
```

> 🛑 **STOP.** Step 6 complete. Test all project features. Tell me to proceed when ready.

---

## STEP 7 — Mentor Dashboard Integration

### Branch
```bash
git checkout main && git pull
git checkout -b feat/mentor-dashboard-integration
```

### Context
Mentor dashboard shows their personal stats — assigned projects, pending reviews, and mentee count.

### What this page needs to do
1. Load mentor-specific stats on page mount
2. Display 3 stat numbers
3. Show mentor's name in header/navbar

### API Details
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

### Integration Logic
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

### Test
- [ ] Mentor dashboard loads with correct stats
- [ ] Mentor name visible in header
- [ ] Admin token accessing this page → should not work (403)

### Git Commit
```bash
git add .
git commit -m "feat: integrate mentor dashboard stats"
git push origin feat/mentor-dashboard-integration
```

> 🛑 **STOP.** Step 7 complete. Tell me to proceed when ready.

---

## STEP 8 — Task Management Integration (Mentor)

### Branch
```bash
git checkout main && git pull
git checkout -b feat/task-management-integration
```

### Context
Mentor can create tasks, assign them to mentees, view all tasks they created, and delete tasks.

### What this page/section needs to do
1. Show all tasks created by this mentor (with status badges)
2. Create Task form: Title, Description, Project (dropdown), Assign To (mentee dropdown), Priority, Due Date
3. Delete task button

### Task Status Values
```
TODO            → Not started yet
IN_PROGRESS     → Mentee is working on it
SUBMITTED       → Mentee submitted work
UNDER_REVIEW    → Mentor is reviewing
APPROVED        → Work approved
REVISION_NEEDED → Mentor asked for changes
```

### Priority Values
```
LOW | MEDIUM | HIGH
```

### API Details

#### Get All Tasks (Mentor sees tasks they created)
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

#### Create Task
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

#### Delete Task
```
Method: DELETE
URL:    /tasks/:taskId
Response (200): { "success": true }
```

### Integration Logic

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

### Zustand Store for Tasks
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

### Test
- [ ] Tasks list loads for mentor
- [ ] Project dropdown in create form shows mentor's projects
- [ ] Mentee dropdown shows all mentees
- [ ] Task created → appears in list
- [ ] Delete task → removed from list
- [ ] Mentee token trying to create task → should fail (403)

### Git Commit
```bash
git add .
git commit -m "feat: integrate task management for mentor - create, list, delete"
git push origin feat/task-management-integration
```

> 🛑 **STOP.** Step 8 complete. Test task management. Tell me to proceed when ready.
