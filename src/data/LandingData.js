/* ==========================================================================
   Mentora — landing page content
   --------------------------------------------------------------------------
   Single source of truth for every word on the public marketing page.

   Ground rule: nothing here may describe a capability the product does not
   have. Every feature listed maps to a real screen in the app (role-based
   dashboards, projects, milestones, tasks, submissions, mentor review,
   comments, chat, meetings, calendar, activity logs, templates, member
   management, email invitations, notifications).

   `icon` values are names exported from `src/components/ui/Icons.jsx`; the
   consuming component resolves them through the `Icon` namespace.
   ========================================================================== */

/* ── Navigation ─────────────────────────────────────────────────────────── */

export const navLinks = [
  { label: "Product", href: "#product" },
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Roles", href: "#roles" },
  { label: "FAQ", href: "#faq" },
];

/* ── Hero ───────────────────────────────────────────────────────────────── */

export const hero = {
  eyebrow: "Project management for educational institutions",
  titleLead: "Every academic project,",
  titleAccent: "one shared workspace.",
  subtitle:
    "Mentora gives schools, colleges and universities a single place to plan projects, " +
    "assign mentors, review student submissions and keep a complete record of the work — " +
    "instead of spreading it across chat groups, inboxes and spreadsheets.",
  primaryCta: "Open the platform",
  secondaryCta: "Create an account",
  trustLabel: "Built for the people who run academic projects",
  trustRoles: ["Students", "Mentors", "Faculty & administrators"],
  assurances: [
    { icon: "Shield", label: "Role-scoped visibility" },
    { icon: "CheckCircle", label: "Review and revision workflow" },
    { icon: "Activity", label: "Complete activity trail" },
  ],
};

/* ── Product visual (the dashboard mock) ────────────────────────────────── */

export const productPreview = {
  eyebrow: "Product",
  title: "The workspace your institution logs into",
  subtitle:
    "One system, three views. Administrators oversee the whole organisation, mentors work " +
    "through their review queue, students see exactly what is due next.",
  caption: "Illustrative preview of the administrator workspace.",
  cta: "Sign in to your dashboard",
  workspaceLabel: "Mentora",
  workspaceMeta: "Administrator",
  screenTitle: "Dashboard",
  screenSubtitle: "Organisation overview",
  nav: [
    { label: "Dashboard", icon: "Dashboard", active: true },
    { label: "Projects", icon: "Folder" },
    { label: "Members", icon: "Users" },
    { label: "Invitations", icon: "Mail" },
    { label: "Activity", icon: "Activity" },
    { label: "Meetings", icon: "Video" },
    { label: "Calendar", icon: "Calendar" },
    { label: "Templates", icon: "FileText" },
  ],
  stats: [
    { label: "Total mentors", value: "12", icon: "Users" },
    { label: "Total mentees", value: "148", icon: "GraduationCap" },
    { label: "Active projects", value: "26", icon: "Folder" },
    { label: "Milestone completion", value: "72%", icon: "Target" },
  ],
  projectsTitle: "Projects",
  projects: [
    {
      name: "Capstone — Smart Campus Grid",
      mentor: "R. Iyer",
      initials: "RI",
      status: "On Track",
      progress: 78,
    },
    {
      name: "Minor Project — Vision Lab",
      mentor: "S. Banerjee",
      initials: "SB",
      status: "Awaiting Review",
      progress: 54,
    },
    {
      name: "Thesis — Polymer Composites",
      mentor: "A. Menon",
      initials: "AM",
      status: "Needs Help",
      progress: 31,
    },
    {
      name: "Design Studio — Civic Mapping",
      mentor: "K. Rao",
      initials: "KR",
      status: "On Track",
      progress: 66,
    },
  ],
  queueTitle: "Awaiting review",
  queue: [
    { task: "Milestone 3 — Prototype demo", who: "Aditi S.", when: "2h ago", state: "Under Review" },
    { task: "Literature review v2", who: "Rohan M.", when: "5h ago", state: "Revision Needed" },
    { task: "Dataset and annotation notes", who: "Neha K.", when: "Yesterday", state: "Completed" },
  ],
};

/* ── Problem / value proposition ────────────────────────────────────────── */

export const problemSection = {
  eyebrow: "The problem",
  title: "Academic projects run on five tools that never agree",
  subtitle:
    "Most institutions do not lack effort — they lack a shared system. The work happens, " +
    "but the record of it is scattered, and nobody has the full picture at the same time.",
  problems: [
    {
      icon: "MessageSquare",
      title: "Communication is fragmented",
      desc: "Briefs land in email, updates happen in a chat group, files sit on someone else's drive. The current version is whichever message you scrolled to last.",
    },
    {
      icon: "Eye",
      title: "Faculty have no visibility",
      desc: "A department head cannot answer which projects are behind without messaging every mentor individually and waiting for replies.",
    },
    {
      icon: "Users",
      title: "Mentoring stays ad hoc",
      desc: "Feedback is given verbally in a corridor or on a call. Next steps are agreed, then forgotten before the following review.",
    },
    {
      icon: "Clock",
      title: "Deadlines slip quietly",
      desc: "Milestones have no owner, no status and no reminder, so a project only looks late once it already is.",
    },
    {
      icon: "FileText",
      title: "There is no single record",
      desc: "At evaluation time there is no reliable trail of who submitted what, when they submitted it, or what the mentor asked them to change.",
    },
    {
      icon: "Refresh",
      title: "Every batch starts from zero",
      desc: "The structure that worked last semester lives in one person's spreadsheet and gets rebuilt by hand for the next cohort.",
    },
  ],
};

/* ── Core features ──────────────────────────────────────────────────────── */

export const featuresSection = {
  eyebrow: "Capabilities",
  title: "Everything a project needs, from kickoff to final review",
  subtitle:
    "Mentora covers the full supervision cycle — planning the work, doing the work, " +
    "reviewing the work and keeping the record.",
};

export const features = [
  {
    icon: "Shield",
    title: "Role-based workspaces",
    desc: "Administrators, mentors and mentees each sign in to a workspace scoped to what they are responsible for. Nobody browses work that is not theirs.",
  },
  {
    icon: "Target",
    title: "Projects and milestones",
    desc: "Structure a project into milestones with owners and due dates, and watch completion move as the work lands.",
  },
  {
    icon: "Layers",
    title: "Tasks and assignment",
    desc: "Break milestones into tasks, assign them to specific mentees, and track each one from To Do through In Progress to Completed.",
  },
  {
    icon: "CheckCircle",
    title: "Submissions and mentor review",
    desc: "Students submit deliverables against a task. Mentors approve them or request a revision, and the task status reflects that decision.",
  },
  {
    icon: "MessageSquare",
    title: "Threaded comments",
    desc: "Feedback stays attached to the work it refers to, so context never has to be reconstructed from an inbox.",
  },
  {
    icon: "Send",
    title: "Real-time chat",
    desc: "Conversations happen inside the platform, next to the projects and tasks being discussed.",
  },
  {
    icon: "Calendar",
    title: "Meetings and shared calendar",
    desc: "Schedule reviews and check-ins, and see milestones, meetings and deadlines together on one calendar.",
  },
  {
    icon: "Activity",
    title: "Activity log and notifications",
    desc: "Project, task and review actions are recorded as they happen, and the people affected are notified in the app.",
  },
  {
    icon: "Users",
    title: "Members, invitations and templates",
    desc: "Invite mentors and students by email, manage roles centrally, and reuse a proven project structure with templates.",
  },
];

/* ── How it works ───────────────────────────────────────────────────────── */

export const howItWorksSection = {
  eyebrow: "How it works",
  title: "One flow, from setup to completion",
  subtitle:
    "The same six steps for every project — visible to everyone who needs to see them.",
};

export const howItWorks = [
  {
    icon: "Settings",
    title: "Set up the workspace",
    desc: "An administrator creates the organisation and invites mentors and students by email.",
  },
  {
    icon: "Folder",
    title: "Create projects, assign mentors",
    desc: "Projects are created from scratch or from a template, and a mentor is assigned to each one.",
  },
  {
    icon: "Target",
    title: "Plan milestones and tasks",
    desc: "Mentors break the work into milestones, then into tasks with owners and due dates.",
  },
  {
    icon: "Upload",
    title: "Students submit deliverables",
    desc: "Mentees work through their tasks and submit against them, with notes for the reviewer.",
  },
  {
    icon: "CheckCircle",
    title: "Mentors review and decide",
    desc: "Each submission is approved or sent back with a revision request and written feedback.",
  },
  {
    icon: "BarChart",
    title: "Track progress to completion",
    desc: "Milestone completion, task status and the activity log show exactly where the project stands.",
  },
];

/* ── Built for every role ───────────────────────────────────────────────── */

export const rolesSection = {
  eyebrow: "Roles",
  title: "Built for everyone in the project",
  subtitle:
    "The same record of work, presented differently depending on who is looking at it.",
};

export const roles = [
  {
    icon: "GraduationCap",
    name: "Students",
    tagline: "Know what is due, and what changed",
    points: [
      "See only the tasks assigned to you, with their due dates and status",
      "Submit deliverables with notes and get a timestamped confirmation",
      "Read mentor feedback in the same thread as the work it refers to",
      "Resubmit against the same task when a revision is requested",
    ],
  },
  {
    icon: "User",
    name: "Mentors",
    tagline: "One queue instead of ten inboxes",
    points: [
      "Work through the submissions awaiting your review in one place",
      "Approve or request a revision with written feedback attached",
      "Plan milestones and tasks for the mentees assigned to you",
      "Schedule meetings and keep the conversation beside the work",
    ],
  },
  {
    icon: "Shield",
    name: "Faculty and admins",
    tagline: "Visibility without chasing anyone",
    points: [
      "See every project, mentor and mentee across the organisation",
      "Invite members by email and manage their roles centrally",
      "Follow the activity log to see what moved and who moved it",
      "Track milestone completion across the whole workspace",
    ],
  },
  {
    icon: "Layers",
    name: "Institutions",
    tagline: "A process that survives the batch",
    points: [
      "One consistent supervision process across departments",
      "Templates carry a proven project structure into the next cohort",
      "An audit trail that outlives staff and student turnover",
      "A single system of record to evaluate project work against",
    ],
  },
];

/* ── Why Mentora ────────────────────────────────────────────────────────── */

export const whyMentora = {
  eyebrow: "Why Mentora",
  title: "General project tools were not built for supervision",
  subtitle:
    "Jira and ClickUp are very good at what they were designed for: teams of peers shipping " +
    "software in sprints. Academic projects are supervised rather than sprinted, and that " +
    "changes the shape of the tool.",
  points: [
    {
      icon: "Users",
      title: "Mentor and mentee is a first-class relationship",
      desc: "Generic trackers assume a flat team. Mentora models supervision directly, so assignment, review and reporting all follow the same structure.",
    },
    {
      icon: "Refresh",
      title: "Review and revision is a workflow, not a convention",
      desc: "Approve and request-revision are real states on the task with the feedback attached, rather than a comment thread everyone has to interpret.",
    },
    {
      icon: "Lock",
      title: "Visibility is scoped by role",
      desc: "Students see their own work, mentors see the mentees assigned to them, administrators see the organisation. Access follows the role, not a folder permission.",
    },
    {
      icon: "FileText",
      title: "The record is built for evaluation",
      desc: "Submission times, review decisions and revision history stay on record, so assessment rests on what actually happened.",
    },
  ],
  note:
    "Mentora is not trying to replace an engineering tracker. It is built for the way coursework, capstones and research projects are actually supervised.",
};

/* ── FAQ ────────────────────────────────────────────────────────────────── */

export const faqSection = {
  eyebrow: "FAQ",
  title: "Questions worth answering first",
  subtitle: "Short answers about how Mentora actually works.",
};

export const faqs = [
  {
    q: "Who is Mentora for?",
    a: "Educational institutions running supervised projects. There are three roles: administrators, who set up and oversee the workspace; mentors, who guide and review the work; and mentees, the students doing it.",
  },
  {
    q: "How do people get access?",
    a: "An administrator invites members by email from inside the workspace. Invitations stay visible until they are accepted, so it is always clear who has joined and who has not.",
  },
  {
    q: "How do students submit their work?",
    a: "A mentee opens the task assigned to them and submits their deliverable along with notes for the reviewer. The submission is recorded against that task and becomes visible to their mentor.",
  },
  {
    q: "What happens when a mentor requests a revision?",
    a: "The task moves into a revision state with the mentor's feedback attached, and the mentee resubmits against the same task. The earlier attempt and the feedback stay in the history.",
  },
  {
    q: "Can students see each other's projects?",
    a: "No. Visibility follows the role. Mentees see their own work, mentors see the mentees assigned to them, and administrators see the whole workspace.",
  },
  {
    q: "Is there a record we can rely on at evaluation time?",
    a: "Yes. Projects, tasks, submissions and review decisions are all recorded, and the activity log shows what changed and who changed it, so a supervisor can reconstruct how a project progressed.",
  },
];

/* ── Final CTA ──────────────────────────────────────────────────────────── */

export const finalCta = {
  eyebrow: "Get started",
  title: "Bring every academic project into one workspace",
  subtitle:
    "Sign in to an existing workspace, or create one and invite your mentors and students.",
  primaryCta: "Create an account",
  secondaryCta: "Sign in",
};

/* ── Footer ─────────────────────────────────────────────────────────────── */

export const footerTagline =
  "The project management platform for educational institutions.";

export const footerNav = [
  {
    title: "Product",
    links: [
      { label: "Overview", href: "#product" },
      { label: "Features", href: "#features" },
      { label: "How it works", href: "#how-it-works" },
    ],
  },
  {
    title: "Learn more",
    links: [
      { label: "The problem", href: "#problem" },
      { label: "Roles", href: "#roles" },
      { label: "Why Mentora", href: "#why-mentora" },
      { label: "FAQ", href: "#faq" },
    ],
  },
];
