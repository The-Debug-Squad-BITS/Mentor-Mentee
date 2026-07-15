# EduFlow — Phase 2 Backend Integration Guide for Frontend AI

---

## 🤖 Instructions for AI Reading This File

You are an AI assistant helping a frontend team integrate **Phase 2** backend features into an existing React frontend that has already completed Phase 1 integration (auth, dashboards, projects, tasks, submissions, notifications).

**Your job:**
- Read and understand the existing frontend architecture (from Phase 1) before making any changes.
- Reuse existing components, stores, and the `api.js` axios instance wherever possible — do NOT recreate them.
- If the required UI already exists, update and integrate it with the new backend endpoints.
- If the required UI does not exist, create the missing screens/components following the existing project structure, design system, coding standards, and UI patterns.
- Maintain consistency with the current codebase. Avoid duplicate implementations. Refactor only when absolutely necessary for integration.

**Backend Base URL:** `http://localhost:5000/api`

**Tech stack (same as Phase 1):**
- HTTP calls: `axios` (`src/lib/api.js` — already exists, reuse it)
- Global state: `zustand`
- The UI framework (Tailwind, Chakra, etc.) stays as-is — you only add logic

---

## 🌿 Branching Strategy (IMPORTANT — Read Before Step 1)

Phase 2 uses a **staging branch** model. Do NOT merge any feature branch into `main` directly.

```
main
 └── phase2                  ← staging branch for all Phase 2 work
      ├── feat/milestones-integration
      ├── feat/tasks-milestone-update
      ├── feat/comments-integration
      ├── feat/templates-integration
      ├── feat/activity-timeline-integration
      └── feat/dashboard-phase2-integration
```

**Rules:**
1. Every feature branch is created **from `phase2`**, not from `main`.
2. Every feature branch is merged back **into `phase2`** only, once its own step is complete and tested.
3. **Never** merge a feature branch into `main`.
4. **Never** merge `phase2` into `main` yourself — the human will do that manually once all Phase 2 features are integrated and tested end-to-end.

### One-Time Setup — Create the `phase2` Branch

```bash
git checkout main
git pull origin main
git checkout -b phase2
git push origin phase2
```

> 🛑 **STOP.** Confirm `phase2` branch exists locally and on remote before proceeding to Step 1.

### Pattern for every step below

```bash
# Start each feature from the latest phase2
git checkout phase2
git pull origin phase2
git checkout -b feat/<feature-name>

# ...do the work...

git add .
git commit -m "feat: <description>"
git push origin feat/<feature-name>

# Merge back into phase2 (NOT main)
git checkout phase2
git pull origin phase2
git merge feat/<feature-name>
git push origin phase2
```

---
---

# STEP 1 — Milestones Integration

## Branch
```bash
git checkout phase2 && git pull origin phase2
git checkout -b feat/milestones-integration
```

## Context
Milestones are checkpoints inside a project. Tasks can optionally be linked to a milestone, and milestone status/progress auto-updates based on linked task completion. This step covers: list milestones for a project, create milestone (ADMIN/MENTOR), view milestone detail with progress stats, update, update status, and delete.

## What this page/section needs to do
1. On a Project Detail page, show a "Milestones" tab/section listing all milestones for that project, sorted by `order`.
2. Each milestone card shows: title, status badge, due date, and a progress bar (from the detail endpoint).
3. Create Milestone form (ADMIN, MENTOR only): Title, Description, Due Date, Order.
4. Milestone detail view: shows `progress`, `totalTasks`, `completedTasks`, `pendingTasks`.
5. Update / change status (ADMIN, MENTOR only).
6. Delete (soft delete) — ADMIN only.

## API Details

### Create Milestone
```
Method: POST
URL:    /milestones
Access: ADMIN, MENTOR
Body:   {
          title: string,
          description?: string,
          projectId: string,
          dueDate?: string,   // ISO date
          order?: number
        }

Response (201):
{ "success": true, "data": { "milestone": { "_id": "...", "title": "...", "status": "UPCOMING", ... } } }

Errors: 400 validation errors, 403 if role is not ADMIN/MENTOR
```

### List Milestones
```
Method: GET
URL:    /milestones
Access: Authenticated
Params: { projectId?, status?, page?, limit? }

Response (200):
{ "success": true, "data": { "milestones": [ {...} ], "pagination": { "total", "page", "limit", "pages" } } }
```

### List Milestones for a Project (shortcut)
```
Method: GET
URL:    /milestones/project/:projectId
Access: Authenticated

Response (200):
{ "success": true, "data": { "milestones": [ {...} ] } }
```

### Get Milestone Detail (with progress)
```
Method: GET
URL:    /milestones/:id
Access: Authenticated

Response (200):
{
  "success": true,
  "data": {
    "milestone": { "_id": "...", "title": "...", "status": "IN_PROGRESS", "dueDate": "...", "order": 1 },
    "progress": 75,
    "totalTasks": 8,
    "completedTasks": 6,
    "pendingTasks": 2
  }
}
```

### Update Milestone
```
Method: PATCH
URL:    /milestones/:id
Access: ADMIN, MENTOR
Body:   { title?, description?, dueDate?, order? }

Response (200): { "success": true, "data": { "milestone": {...} } }
```

### Update Milestone Status
```
Method: PATCH
URL:    /milestones/:id/status
Access: ADMIN, MENTOR
Body:   { status: "UPCOMING" | "IN_PROGRESS" | "COMPLETED" | "OVERDUE" }

Response (200): { "success": true, "data": { "milestone": {...} } }
```

> Note: Status usually auto-updates based on linked tasks (see backend notes), but this endpoint allows manual override when needed.

### Delete Milestone
```
Method: DELETE
URL:    /milestones/:id
Access: ADMIN

Response (200): { "success": true }
```

## Integration Logic

```js
import api from '@/lib/api';
import { useMilestoneStore } from '@/store/milestoneStore';

// Load milestones for a project
const loadMilestones = async (projectId) => {
  const response = await api.get(`/milestones/project/${projectId}`);
  const milestones = response.data.data.milestones;
  setMilestones(milestones); // sort by `order` client-side if not pre-sorted
};

// Load milestone detail (with progress) — use when opening a milestone card
const loadMilestoneDetail = async (milestoneId) => {
  const response = await api.get(`/milestones/${milestoneId}`);
  const { milestone, progress, totalTasks, completedTasks, pendingTasks } = response.data.data;
  setCurrentMilestone({ ...milestone, progress, totalTasks, completedTasks, pendingTasks });
};

// Create milestone
const handleCreateMilestone = async ({ title, description, projectId, dueDate, order }) => {
  try {
    const response = await api.post('/milestones', { title, description, projectId, dueDate, order });
    // Refresh milestone list for the project
  } catch (error) {
    // error.response.data.errors for field-level errors
  }
};

// Update status (e.g. dropdown or drag-to-column UI)
const handleStatusChange = async (milestoneId, status) => {
  await api.patch(`/milestones/${milestoneId}/status`, { status });
  // Refresh
};

// Delete
const handleDeleteMilestone = async (milestoneId) => {
  const confirmed = window.confirm('Delete this milestone? This cannot be undone.');
  if (!confirmed) return;
  await api.delete(`/milestones/${milestoneId}`);
  // Refresh
};
```

## Zustand Store
```js
// src/store/milestoneStore.js
import { create } from 'zustand';

export const useMilestoneStore = create((set) => ({
  milestones: [],
  currentMilestone: null, // includes progress, totalTasks, completedTasks, pendingTasks
  setMilestones: (milestones) => set({ milestones }),
  setCurrentMilestone: (milestone) => set({ currentMilestone: milestone }),
}));
```

## Milestone Status Badge Colors (suggested)
```
UPCOMING     → gray
IN_PROGRESS  → blue
COMPLETED    → green
OVERDUE      → red
```

## Test
- [ ] Milestones list loads under a project, sorted by order
- [ ] Create milestone (ADMIN/MENTOR) → appears in list
- [ ] Create milestone as MENTEE → 403, form hidden/disabled for MENTEE role
- [ ] Milestone detail shows correct progress %, task counts
- [ ] Update milestone fields → reflected in UI
- [ ] Manual status change → badge updates
- [ ] Delete milestone (ADMIN only) → removed from list; MENTOR does not see delete button

## Git Commit & Merge
```bash
git add .
git commit -m "feat: integrate milestones - create, list, detail with progress, update, delete"
git push origin feat/milestones-integration

git checkout phase2 && git pull origin phase2
git merge feat/milestones-integration
git push origin phase2
```

> 🛑 **STOP.** Step 1 complete and merged into `phase2`. Test the milestones flow. Tell me to proceed when ready.

---
---

# STEP 2 — Tasks Update: Milestone Linking

## Branch
```bash
git checkout phase2 && git pull origin phase2
git checkout -b feat/tasks-milestone-update
```

## Context
The existing Task model now supports an optional `milestoneId`. This step updates the existing Task create/edit form and adds a way to view tasks scoped to a milestone. This builds on the Phase 1 Task Management integration — do not rebuild it, just extend it.

## What this section needs to do
1. Add an optional "Milestone" dropdown to the existing Create/Edit Task form, populated from the project's milestones.
2. Allow `milestoneId` to be cleared (send `null`) to unlink a task from its milestone.
3. On the Milestone detail view (Step 1), show a "Tasks" list scoped to that milestone using the new endpoint.

## API Details

### Get Tasks for a Milestone
```
Method: GET
URL:    /tasks/milestone/:milestoneId
Access: Authenticated

Response (200):
{ "success": true, "data": { "tasks": [ { "_id": "...", "title": "...", "status": "...", "milestoneId": "..." } ] } }
```

### Task Create/Update — now accepts `milestoneId`
```
Method: POST or PATCH
URL:    /tasks  or  /tasks/:id
Body:   {
          title, description, projectId,
          milestoneId?: string | null,   // NEW — optional
          assignedTo, priority, dueDate
        }
```

## Integration Logic

```js
// Extend the existing task create/update handler from Phase 1 Step 8
const handleCreateOrUpdateTask = async (taskData) => {
  const payload = {
    ...taskData,
    milestoneId: taskData.milestoneId || null, // omit/clear if "No Milestone" selected
  };
  await api.post('/tasks', payload); // or api.patch(`/tasks/${id}`, payload) for edit
};

// Milestone dropdown options — reuse loadMilestones(projectId) from Step 1
// Add a "No Milestone" option that maps to null

// Load tasks scoped to a milestone (used in Milestone detail view)
const loadTasksForMilestone = async (milestoneId) => {
  const response = await api.get(`/tasks/milestone/${milestoneId}`);
  return response.data.data.tasks;
};
```

## Store Changes
```js
// Extend existing src/store/taskStore.js — no new store needed
// Optional: add a milestoneId filter to existing task list state if the UI needs
// to filter the main task list by milestone client-side.
```

## Test
- [ ] Task form shows Milestone dropdown populated with project's milestones
- [ ] Creating a task with a milestone selected → task appears under that milestone's task list
- [ ] Creating a task with "No Milestone" → `milestoneId` is `null`, task has no milestone badge
- [ ] Editing a task to change/clear its milestone → updates correctly
- [ ] Milestone detail page task list matches `/tasks/milestone/:id` response

## Git Commit & Merge
```bash
git add .
git commit -m "feat: add milestone linking to task create/edit form and milestone-scoped task list"
git push origin feat/tasks-milestone-update

git checkout phase2 && git pull origin phase2
git merge feat/tasks-milestone-update
git push origin phase2
```

> 🛑 **STOP.** Step 2 complete and merged into `phase2`. Test task↔milestone linking. Tell me to proceed when ready.

---
---

# STEP 3 — Comments Integration

## Branch
```bash
git checkout phase2 && git pull origin phase2
git checkout -b feat/comments-integration
```

## Context
Comments are threaded (one level of replies) and can be attached to a Task, Submission, Milestone, or Project. This step adds a reusable `<CommentSection />` component that can be dropped into any of those four detail views.

## What this section needs to do
1. Build (or extend) a reusable comment section component accepting `entityType` and `entityId` as props.
2. Display top-level comments with nested replies.
3. Allow authenticated users to post a top-level comment or reply to an existing comment.
4. Allow the comment author to edit their own comment (shows "edited" tag).
5. Allow the author or an ADMIN to delete (soft delete) a comment.

## API Details

### Create Comment
```
Method: POST
URL:    /comments
Access: Authenticated
Body:   {
          content: string,
          entityType: "TASK" | "SUBMISSION" | "MILESTONE" | "PROJECT",
          entityId: string,
          parentCommentId?: string | null   // null/omit for top-level, set for a reply
        }

Response (201): { "success": true, "data": { "comment": { "_id": "...", "content": "...", "authorId": {...}, ... } } }
```

### List Comments for an Entity (threaded)
```
Method: GET
URL:    /comments?entityType=TASK&entityId=<id>
Access: Authenticated

Response (200):
{
  "success": true,
  "data": {
    "comments": [
      {
        "_id": "...",
        "content": "Great work!",
        "authorId": { "name": "Dharmik", "email": "..." },
        "parentCommentId": null,
        "isEdited": false,
        "createdAt": "...",
        "replies": [
          { "_id": "...", "content": "Thanks!", "parentCommentId": "<parent_id>", "authorId": {...}, "replies": [] }
        ]
      }
    ]
  }
}
```

### Get Single Comment
```
Method: GET
URL:    /comments/:id
Response (200): { "success": true, "data": { "comment": {...} } }
```

### Edit Comment
```
Method: PATCH
URL:    /comments/:id
Access: Author only
Body:   { content: string }

Response (200): { "success": true, "data": { "comment": { ..., "isEdited": true } } }
Errors: 403 if not the author
```

### Delete Comment
```
Method: DELETE
URL:    /comments/:id
Access: Author or ADMIN
Response (200): { "success": true }
```

## Integration Logic

```js
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useCommentStore } from '@/store/commentStore';

// Load comments for any entity — call whenever entityType/entityId changes
const loadComments = async (entityType, entityId) => {
  const response = await api.get('/comments', { params: { entityType, entityId } });
  setComments(response.data.data.comments); // threaded array with `replies`
};

// Post a top-level comment
const handlePostComment = async (entityType, entityId, content) => {
  await api.post('/comments', { content, entityType, entityId, parentCommentId: null });
  loadComments(entityType, entityId); // refresh
};

// Post a reply
const handlePostReply = async (entityType, entityId, content, parentCommentId) => {
  await api.post('/comments', { content, entityType, entityId, parentCommentId });
  loadComments(entityType, entityId);
};

// Edit — only show the edit option if comment.authorId._id === user._id
const { user } = useAuthStore();
const canEdit = (comment) => comment.authorId._id === user._id;

const handleEditComment = async (commentId, content) => {
  await api.patch(`/comments/${commentId}`, { content });
  loadComments(entityType, entityId);
};

// Delete — show if canEdit(comment) OR user.role === 'ADMIN'
const canDelete = (comment) => comment.authorId._id === user._id || user.role === 'ADMIN';

const handleDeleteComment = async (commentId) => {
  const confirmed = window.confirm('Delete this comment?');
  if (!confirmed) return;
  await api.delete(`/comments/${commentId}`);
  loadComments(entityType, entityId);
};
```

## Zustand Store
```js
// src/store/commentStore.js
import { create } from 'zustand';

export const useCommentStore = create((set) => ({
  comments: [], // threaded: [{ ...comment, replies: [...] }]
  setComments: (comments) => set({ comments }),
}));
```

## Suggested Component Usage
```jsx
// Drop into TaskDetail.jsx, SubmissionDetail.jsx, MilestoneDetail.jsx, ProjectDetail.jsx
<CommentSection entityType="TASK" entityId={task._id} />
```

## Test
- [ ] Comments load for a Task, a Submission, a Milestone, and a Project
- [ ] Post top-level comment → appears immediately (after refresh)
- [ ] Reply to a comment → appears nested under parent
- [ ] Edit own comment → content updates, "edited" tag shows
- [ ] Try editing someone else's comment → edit option not shown / 403 if forced
- [ ] Delete own comment → removed; ADMIN can delete anyone's comment

## Git Commit & Merge
```bash
git add .
git commit -m "feat: integrate threaded comments on tasks, submissions, milestones, projects"
git push origin feat/comments-integration

git checkout phase2 && git pull origin phase2
git merge feat/comments-integration
git push origin phase2
```

> 🛑 **STOP.** Step 3 complete and merged into `phase2`. Test comments on all 4 entity types. Tell me to proceed when ready.

---
---

# STEP 4 — Project Templates Integration

## Branch
```bash
git checkout phase2 && git pull origin phase2
git checkout -b feat/templates-integration
```

## Context
ADMIN can save a project's structure (milestones + nested tasks, plus standalone tasks) as a reusable template, and later spin up a brand-new project from that template in one call.

## What this section needs to do
1. A "Templates" page (ADMIN, MENTOR can view; ADMIN can create/edit/delete) listing all templates.
2. Create Template form: Name, Description, and a builder UI for milestones (each with nested tasks) and standalone tasks.
3. Template detail view.
4. "Create Project from Template" flow: pick a template, then fill in Title, Description, Start/End Date, Mentor, Mentees — submits and shows a summary of what was created.

## API Details

### Create Template
```
Method: POST
URL:    /templates
Access: ADMIN
Body:   {
          name: string,
          description?: string,
          milestones?: [
            {
              title: string, description?: string, order?: number,
              tasks?: [ { title: string, description?: string, priority?: string } ]
            }
          ],
          tasks?: [ { title: string, description?: string, priority?: string } ]  // standalone, no milestone
        }

Response (201): { "success": true, "data": { "template": {...} } }
```

### List Templates
```
Method: GET
URL:    /templates
Access: ADMIN, MENTOR
Params: { page?, limit? }

Response (200): { "success": true, "data": { "templates": [ { "_id", "name", "description", "milestones": [...], "tasks": [...] } ] } }
```

### Get Template Detail
```
Method: GET
URL:    /templates/:id
Access: ADMIN, MENTOR
Response (200): { "success": true, "data": { "template": {...} } }
```

### Update Template
```
Method: PATCH
URL:    /templates/:id
Access: ADMIN
Body:   { name?, description?, milestones?, tasks?, isPublic? }
Response (200): { "success": true, "data": { "template": {...} } }
```

### Delete Template
```
Method: DELETE
URL:    /templates/:id
Access: ADMIN
Response (200): { "success": true }
```

### Create Project From Template
```
Method: POST
URL:    /templates/:id/create-project
Access: ADMIN
Body:   {
          title: string,
          description?: string,
          startDate: string,   // ISO date
          endDate: string,     // ISO date
          mentorId?: string,
          mentees?: string[]
        }

Response (201):
{
  "success": true,
  "message": "Project created from template successfully",
  "data": {
    "project": {...},
    "milestonesCreated": 3,
    "tasksCreated": 8,
    "milestones": [...],
    "tasks": [...]
  }
}
```

## Integration Logic

```js
import api from '@/lib/api';
import { useTemplateStore } from '@/store/templateStore';

// Load templates list
const loadTemplates = async () => {
  const response = await api.get('/templates');
  setTemplates(response.data.data.templates);
};

// Create template — milestones/tasks come from a builder UI as arrays matching the shape above
const handleCreateTemplate = async ({ name, description, milestones, tasks }) => {
  try {
    await api.post('/templates', { name, description, milestones, tasks });
    loadTemplates();
  } catch (error) {
    // error.response.data.errors for field-level errors
  }
};

// Delete template
const handleDeleteTemplate = async (templateId) => {
  const confirmed = window.confirm('Delete this template? This cannot be undone.');
  if (!confirmed) return;
  await api.delete(`/templates/${templateId}`);
  loadTemplates();
};

// Create project from template
const handleCreateProjectFromTemplate = async (templateId, { title, description, startDate, endDate, mentorId, mentees }) => {
  try {
    const response = await api.post(`/templates/${templateId}/create-project`, {
      title, description, startDate, endDate, mentorId, mentees,
    });
    const { project, milestonesCreated, tasksCreated } = response.data.data;
    // Show success summary: `${milestonesCreated} milestones and ${tasksCreated} tasks created`
    // Navigate to the new project's detail page: navigate(`/admin/projects/${project._id}`)
  } catch (error) {
    // error.response.data.errors for field-level errors
  }
};
```

## Zustand Store
```js
// src/store/templateStore.js
import { create } from 'zustand';

export const useTemplateStore = create((set) => ({
  templates: [],
  currentTemplate: null,
  setTemplates: (templates) => set({ templates }),
  setCurrentTemplate: (template) => set({ currentTemplate: template }),
}));
```

## Test
- [ ] Templates list loads (ADMIN and MENTOR can view; MENTEE cannot)
- [ ] Create template with milestones + nested tasks + standalone tasks → saved correctly
- [ ] Template detail shows full nested structure
- [ ] Update template (ADMIN) → changes persist
- [ ] Delete template (ADMIN) → removed from list
- [ ] Create Project from Template → new project appears with correct milestone/task counts
- [ ] Mentor/mentees assigned during the "create from template" step are correctly set on the new project

## Git Commit & Merge
```bash
git add .
git commit -m "feat: integrate project templates - CRUD and create-project-from-template flow"
git push origin feat/templates-integration

git checkout phase2 && git pull origin phase2
git merge feat/templates-integration
git push origin phase2
```

> 🛑 **STOP.** Step 4 complete and merged into `phase2`. Test the full template → project flow. Tell me to proceed when ready.

---
---

# STEP 5 — Activity Timeline Integration

## Branch
```bash
git checkout phase2 && git pull origin phase2
git checkout -b feat/activity-timeline-integration
```

## Context
Every important backend action is automatically logged. This step adds an Activity Timeline view (ADMIN — full org-wide view; ADMIN/MENTOR — per-project view; ADMIN — per-user view).

## What this section needs to do
1. Admin-only "Activity Log" page: paginated, filterable list of all activities.
2. A per-project "Activity" tab on the Project Detail page (visible to ADMIN and MENTOR).
3. Optional: per-user activity view on a user's profile/detail page (ADMIN only).
4. Render each activity as a readable line, e.g. "**Dharmik** created task **Literature Review**" using `action` + `metadata`.

## API Details

### List All Activities
```
Method: GET
URL:    /activities
Access: ADMIN
Params: { page?, limit?, action?, entityType?, startDate?, endDate? }

Response (200):
{
  "success": true,
  "data": {
    "activities": [
      {
        "userId": { "name": "Dharmik", "email": "..." },
        "action": "TASK_CREATED",
        "entityType": "TASK",
        "entityId": "...",
        "metadata": { "title": "Literature Review" },
        "createdAt": "2026-07-14T10:30:00Z"
      }
    ],
    "pagination": { "total": 45, "page": 1, "limit": 20, "pages": 3 }
  }
}
```

### Activities for a Project
```
Method: GET
URL:    /activities/project/:projectId
Access: ADMIN, MENTOR
Response (200): same shape as above, scoped to the project
```

### Activities for a User
```
Method: GET
URL:    /activities/user/:userId
Access: ADMIN
Response (200): same shape as above, scoped to the user
```

## Action → Display Text Map
```js
export const ACTION_LABELS = {
  USER_INVITED: 'invited a user',
  USER_LOGGED_IN: 'logged in',
  PROJECT_CREATED: 'created project',
  PROJECT_UPDATED: 'updated project',
  PROJECT_DELETED: 'deleted project',
  TASK_CREATED: 'created task',
  TASK_UPDATED: 'updated task',
  TASK_STATUS_CHANGED: 'changed task status',
  SUBMISSION_CREATED: 'submitted work',
  SUBMISSION_APPROVED: 'approved submission',
  SUBMISSION_REVISION_REQUESTED: 'requested revision',
  MILESTONE_CREATED: 'created milestone',
  MILESTONE_COMPLETED: 'completed milestone',
  COMMENT_ADDED: 'added a comment',
  TEMPLATE_CREATED: 'created a template',
};
```

## Integration Logic

```js
import api from '@/lib/api';
import { useActivityStore } from '@/store/activityStore';

// Org-wide activity log (Admin only)
const loadActivities = async (filters = {}) => {
  const response = await api.get('/activities', { params: { page: 1, limit: 20, ...filters } });
  const { activities, pagination } = response.data.data;
  setActivities(activities, pagination);
};

// Per-project activity tab
const loadProjectActivities = async (projectId) => {
  const response = await api.get(`/activities/project/${projectId}`);
  return response.data.data.activities;
};

// Per-user activity (Admin only, e.g. on user detail modal)
const loadUserActivities = async (userId) => {
  const response = await api.get(`/activities/user/${userId}`);
  return response.data.data.activities;
};

// Rendering helper
const formatActivityLine = (activity) => {
  const actorName = activity.userId?.name || 'Someone';
  const label = ACTION_LABELS[activity.action] || activity.action;
  const title = activity.metadata?.title;
  return title ? `${actorName} ${label}: ${title}` : `${actorName} ${label}`;
};
```

## Zustand Store
```js
// src/store/activityStore.js
import { create } from 'zustand';

export const useActivityStore = create((set) => ({
  activities: [],
  pagination: null,
  setActivities: (activities, pagination) => set({ activities, pagination }),
}));
```

## Test
- [ ] Admin Activity Log page loads, paginates correctly
- [ ] Filters (`action`, `entityType`, `startDate`, `endDate`) narrow results
- [ ] Non-admin cannot access `/activities` (403 / route hidden)
- [ ] Project Activity tab shows only that project's actions (visible to ADMIN + MENTOR)
- [ ] Creating a task/milestone/comment/submission elsewhere in the app produces a new entry here
- [ ] Activity lines render human-readable text via `formatActivityLine`

## Git Commit & Merge
```bash
git add .
git commit -m "feat: integrate activity timeline - org-wide, per-project, per-user views"
git push origin feat/activity-timeline-integration

git checkout phase2 && git pull origin phase2
git merge feat/activity-timeline-integration
git push origin phase2
```

> 🛑 **STOP.** Step 5 complete and merged into `phase2`. Test all three activity views. Tell me to proceed when ready.

---
---

# STEP 6 — Dashboard Enhancements (Admin, Mentor, Mentee)

## Branch
```bash
git checkout phase2 && git pull origin phase2
git checkout -b feat/dashboard-phase2-integration
```

## Context
The three existing dashboards (from Phase 1) each get new fields in their existing response payloads. **No new endpoints** — just extend the existing dashboard fetch calls and UI to read the additional fields.

## What this section needs to do
1. Admin Dashboard: add Total Milestones stat card, Milestone Completion Rate, and a "Recent Activity" widget (last 5 logs).
2. Mentor Dashboard: add Pending Milestones stat card and a "Recent Comments" widget (last 5 comments on the mentor's project entities).
3. Mentee Dashboard: add an "Upcoming Milestones" widget (next 5) and a "Recent Feedback" widget (last 5 reviewed submissions).

## API Details

### Admin Dashboard — new fields
```
Method: GET
URL:    /dashboard/admin

New fields in data:
  totalMilestones          Number
  milestoneCompletionRate  Number   // percentage
  recentActivities         Array    // last 5 ActivityLog entries, same shape as Step 5
```

### Mentor Dashboard — new fields
```
Method: GET
URL:    /dashboard/mentor

New fields in data:
  pendingMilestones   Number
  recentComments       Array   // last 5 comments on this mentor's project entities
```

### Mentee Dashboard — new fields
```
Method: GET
URL:    /dashboard/mentee

New fields in data:
  upcomingMilestones   Array   // next 5 upcoming/in-progress milestones
  recentFeedback        Array   // last 5 reviewed submissions with feedback
```

## Integration Logic

```js
// Extend the existing dashboard fetch from Phase 1 Step 4 / Step 7 / Step 10 — do not duplicate the useEffect

// Admin
const fetchAdminDashboard = async () => {
  const response = await api.get('/dashboard/admin');
  const data = response.data.data;
  // Existing: data.totalUsers, data.totalProjects, etc.
  // NEW:
  // data.totalMilestones          → stat card
  // data.milestoneCompletionRate  → stat card (show as "%")
  // data.recentActivities         → render with formatActivityLine() from Step 5
  setAdminStats(data);
};

// Mentor
const fetchMentorDashboard = async () => {
  const response = await api.get('/dashboard/mentor');
  const data = response.data.data;
  // Existing: data.assignedProjects, data.pendingReviews, data.assignedMentees
  // NEW:
  // data.pendingMilestones → stat card
  // data.recentComments    → list widget (content, authorId.name, createdAt)
  setMentorStats(data);
};

// Mentee
const fetchMenteeDashboard = async () => {
  const response = await api.get('/dashboard/mentee');
  const data = response.data.data;
  // NEW:
  // data.upcomingMilestones → list widget (title, dueDate, status)
  // data.recentFeedback     → list widget (task title, feedback text, reviewedAt)
  setMenteeStats(data);
};
```

## Store Changes
```js
// Extend existing src/store/dashboardStore.js — no new store needed.
// The existing setAdminStats / setMentorStats / setMenteeStats setters already
// accept the full response object, so the new fields flow through automatically.
```

## Test
- [ ] Admin dashboard shows Total Milestones and Completion Rate stat cards
- [ ] Admin dashboard "Recent Activity" widget shows last 5 actions, human-readable
- [ ] Mentor dashboard shows Pending Milestones stat card
- [ ] Mentor dashboard "Recent Comments" widget shows last 5 comments with author names
- [ ] Mentee dashboard shows Upcoming Milestones (next 5, sorted by due date)
- [ ] Mentee dashboard shows Recent Feedback (last 5 reviewed submissions)
- [ ] No regressions on existing Phase 1 stat cards

## Git Commit & Merge
```bash
git add .
git commit -m "feat: extend admin/mentor/mentee dashboards with phase 2 stats and widgets"
git push origin feat/dashboard-phase2-integration

git checkout phase2 && git pull origin phase2
git merge feat/dashboard-phase2-integration
git push origin phase2
```

> 🛑 **STOP.** Step 6 complete and merged into `phase2`. All Phase 2 features are now integrated into the `phase2` branch. Do NOT merge `phase2` into `main` — the human will do this manually after full end-to-end testing.

---
---

# 📋 Complete Phase 2 Step Summary

| Step | Feature | Branch | Merges Into |
|---|---|---|---|
| Setup | Create `phase2` staging branch from `main` | `phase2` | `main` (branch only, no code merge) |
| **Step 1** | Milestones (CRUD, progress) | `feat/milestones-integration` | `phase2` |
| **Step 2** | Tasks — milestone linking | `feat/tasks-milestone-update` | `phase2` |
| **Step 3** | Comments (threaded, 4 entity types) | `feat/comments-integration` | `phase2` |
| **Step 4** | Project Templates + create-from-template | `feat/templates-integration` | `phase2` |
| **Step 5** | Activity Timeline (org/project/user) | `feat/activity-timeline-integration` | `phase2` |
| **Step 6** | Dashboard enhancements (all 3 roles) | `feat/dashboard-phase2-integration` | `phase2` |

**Reminder:** All feature branches merge into `phase2` only. `phase2 → main` is a manual, human-triggered merge after full testing.

---

# ⚙️ Zustand Stores Reference (Phase 2 additions)

| Store File | Purpose | Key State |
|---|---|---|
| `milestoneStore.js` | Milestones list + detail | `milestones`, `currentMilestone` (incl. progress) |
| `commentStore.js` | Threaded comments per entity | `comments` (nested `replies`) |
| `templateStore.js` | Templates list + detail | `templates`, `currentTemplate` |
| `activityStore.js` | Activity log entries | `activities`, `pagination` |
| `dashboardStore.js` *(existing, extended)* | Dashboard stats | `adminStats`, `mentorStats`, `menteeStats` — now include Phase 2 fields |
| `taskStore.js` *(existing, extended)* | Tasks list | now supports `milestoneId` on each task |

---

# ⚠️ Error Response Reference (unchanged from Phase 1)

```js
catch (error) {
  const status = error.response?.status;
  const data   = error.response?.data;

  if (status === 400 && data?.errors) {
    // Field-level validation errors
    // data.errors = [{ field: "title", message: "Title is required" }]
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
  else {
    // Show: data?.message || "Something went wrong. Please try again."
  }
}
```

---

# 🔗 Phase 2 API Quick Reference

| Method | URL | Who Can Call | What It Does |
|---|---|---|---|
| POST | `/milestones` | ADMIN, MENTOR | Create milestone |
| GET | `/milestones` | All | List milestones (filterable) |
| GET | `/milestones/:id` | All | Milestone detail + progress |
| GET | `/milestones/project/:projectId` | All | Milestones for a project |
| PATCH | `/milestones/:id` | ADMIN, MENTOR | Update milestone |
| PATCH | `/milestones/:id/status` | ADMIN, MENTOR | Update milestone status |
| DELETE | `/milestones/:id` | ADMIN | Soft delete milestone |
| GET | `/tasks/milestone/:milestoneId` | All | Tasks for a milestone |
| POST | `/comments` | All | Create comment/reply |
| GET | `/comments` | All | List comments for an entity (threaded) |
| GET | `/comments/:id` | All | Get single comment |
| PATCH | `/comments/:id` | Author | Edit comment |
| DELETE | `/comments/:id` | Author, ADMIN | Soft delete comment |
| POST | `/templates` | ADMIN | Create template |
| GET | `/templates` | ADMIN, MENTOR | List templates |
| GET | `/templates/:id` | ADMIN, MENTOR | Template detail |
| PATCH | `/templates/:id` | ADMIN | Update template |
| DELETE | `/templates/:id` | ADMIN | Soft delete template |
| POST | `/templates/:id/create-project` | ADMIN | Create project from template |
| GET | `/activities` | ADMIN | List all activities (filterable) |
| GET | `/activities/project/:projectId` | ADMIN, MENTOR | Activities for a project |
| GET | `/activities/user/:userId` | ADMIN | Activities for a user |
| GET | `/dashboard/admin` | ADMIN | Admin stats (now incl. milestones + activity) |
| GET | `/dashboard/mentor` | MENTOR | Mentor stats (now incl. milestones + comments) |
| GET | `/dashboard/mentee` | MENTEE | Mentee stats (now incl. milestones + feedback) |

---

*Backend: The Debug Squad — BITS Pilani*
*Backend URL (dev): `http://localhost:5000/api`*
*Phase 2 — Merges into `phase2` staging branch only. Human merges `phase2 → main`.*
