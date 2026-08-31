/* ==========================================================================
   Trellis — landing page content
   --------------------------------------------------------------------------
   Single source of truth for every word on the public marketing page.

   Positioning: Trellis is an Academic Project & Capstone Supervision
   Platform. It is NOT a generic mentorship product. The story the page tells
   is the one the backend actually implements:

     Projects -> Milestones -> Tasks -> Student Submissions
              -> Supervisor Review -> Approval / Revision

   Ground rule: nothing here may describe a capability the product does not
   have. Every feature listed maps to a real route and a real screen —
   projects, milestones, tasks, submissions, review decisions, templates,
   calculated progress, comments, chat, meetings, calendar, notifications,
   activity history, email invitations and role-scoped access.

   Deliberately absent, because they are not built: exports and reports,
   grading or marks, plagiarism checks, SSO, supervisor matching, pricing.

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
  eyebrow: "Academic project & capstone supervision",
  titleLead: "Structure for",
  titleAccent: "supervised work.",
  subtitle:
    "Trellis gives a department one place to run final-year projects, capstones, " +
    "dissertations and supervised internships — from the milestone plan, to the " +
    "student's submission, to the supervisor's approval, with a record of every " +
    "decision along the way.",
  primaryCta: "Open the platform",
  secondaryCta: "Create an account",
  trustLabel: "Built for the people who run supervised projects",
  trustRoles: ["Project coordinators", "Faculty supervisors", "Students"],
  assurances: [
    { icon: "CheckCircle", label: "Submission, review and approval" },
    { icon: "Target", label: "Milestone-gated progress" },
    { icon: "Activity", label: "Complete activity history" },
  ],
};

/* ── Product visual (the dashboard mock) ────────────────────────────────── */

export const productPreview = {
  eyebrow: "Product",
  title: "The workspace your department logs into",
  subtitle:
    "One system, three views. Coordinators oversee every project in the department, " +
    "supervisors work through their review queue, students see exactly what is due next.",
  caption: "Illustrative preview of the coordinator workspace.",
  cta: "Sign in to your dashboard",
  workspaceLabel: "Trellis",
  workspaceMeta: "Coordinator",
  screenTitle: "Dashboard",
  screenSubtitle: "Department overview",
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
    { label: "Faculty supervisors", value: "12", icon: "Users" },
    { label: "Students", value: "148", icon: "GraduationCap" },
    { label: "Active projects", value: "26", icon: "Folder" },
    { label: "Milestone completion", value: "72%", icon: "Target" },
  ],
  projectsTitle: "Projects",
  projects: [
    {
      name: "Capstone — Smart Campus Grid",
      supervisor: "Dr. R. Iyer",
      initials: "RI",
      status: "On Track",
      progress: 78,
    },
    {
      name: "Major Project — Vision Lab",
      supervisor: "Dr. S. Banerjee",
      initials: "SB",
      status: "Awaiting Review",
      progress: 54,
    },
    {
      name: "Dissertation — Polymer Composites",
      supervisor: "Dr. A. Menon",
      initials: "AM",
      status: "On Hold",
      progress: 31,
    },
    {
      name: "Internship — Civic Mapping",
      supervisor: "Dr. K. Rao",
      initials: "KR",
      status: "On Track",
      progress: 66,
    },
  ],
  queueTitle: "Awaiting review",
  queue: [
    { task: "Milestone 3 — Prototype demo", who: "Aditi S.", when: "2h ago", state: "Under Review" },
    { task: "Literature review v2", who: "Rohan M.", when: "5h ago", state: "Revision Needed" },
    { task: "Dataset and annotation notes", who: "Neha K.", when: "Yesterday", state: "Approved" },
  ],
};

/* ── Problem / value proposition ────────────────────────────────────────── */

export const problemSection = {
  eyebrow: "The problem",
  title: "Supervised projects run on five tools that never agree",
  subtitle:
    "Departments do not lack effort — they lack a shared system. The work happens and the " +
    "reviews happen, but the record of both is scattered, and nobody has the full picture " +
    "at the same time.",
  problems: [
    {
      icon: "MessageSquare",
      title: "Briefs and feedback scatter",
      desc: "The project brief lands in email, feedback happens in a chat group, and deliverables sit on someone else's drive. The current version is whichever message you scrolled to last.",
    },
    {
      icon: "Eye",
      title: "Coordinators have no live view",
      desc: "A capstone coordinator cannot say which projects are behind without messaging every supervisor individually and waiting for replies.",
    },
    {
      icon: "CheckCircle",
      title: "Approval is verbal and unrecorded",
      desc: "A supervisor says the work looks fine and to carry on. Nothing captures that the deliverable was accepted, when it was accepted, or what was asked for the time before.",
    },
    {
      icon: "Clock",
      title: "Review checkpoints slip quietly",
      desc: "Milestones have no owner, no status and no reminder, so a project only looks late once it already is.",
    },
    {
      icon: "FileText",
      title: "No trail at evaluation time",
      desc: "When the panel asks what was submitted, when it arrived and which changes were requested, there is no reliable place to answer from.",
    },
    {
      icon: "Refresh",
      title: "Every batch starts from zero",
      desc: "The project structure that worked last semester lives in one coordinator's spreadsheet and gets rebuilt by hand for the next cohort.",
    },
  ],
};

/* ── Core features ──────────────────────────────────────────────────────── */

export const featuresSection = {
  eyebrow: "Capabilities",
  title: "Everything a supervised project needs, from kickoff to final approval",
  subtitle:
    "Trellis covers the whole supervision cycle — planning the work, doing the work, " +
    "reviewing the work and keeping the record.",
};

export const features = [
  {
    icon: "Folder",
    title: "Projects with a supervisor and a team",
    desc: "Create a project, assign the faculty supervisor responsible for it and the students working on it. Scope, status and dates live in one place.",
  },
  {
    icon: "Target",
    title: "Milestones with calculated progress",
    desc: "Break a project into ordered milestones with due dates. Completion is derived from the tasks underneath rather than typed in by hand.",
  },
  {
    icon: "Layers",
    title: "Tasks assigned to named students",
    desc: "Every task has an owner, a priority and a due date, and moves from To Do through In Progress to Submitted as the work gets done.",
  },
  {
    icon: "Upload",
    title: "Student submissions",
    desc: "Students submit a file or a link against the task they were given, with notes for the reviewer. Each attempt is recorded and timestamped.",
  },
  {
    icon: "CheckCircle",
    title: "Supervisor review and approval",
    desc: "Supervisors approve a submission or return it for revision with written feedback. The task status follows that decision, so the state is never ambiguous.",
  },
  {
    icon: "MessageSquare",
    title: "Discussion where the work lives",
    desc: "Threaded comments attach to the project, milestone, task or submission they refer to, and real-time chat covers everything in between.",
  },
  {
    icon: "FileText",
    title: "Reusable project templates",
    desc: "Save the department's standard milestone and task structure once, then create the next batch of projects from it instead of rebuilding it by hand.",
  },
  {
    icon: "Calendar",
    title: "Meetings and a shared calendar",
    desc: "Schedule review meetings and check-ins, and see task deadlines, milestone dates and meetings together on one calendar.",
  },
  {
    icon: "Activity",
    title: "Activity history and notifications",
    desc: "Project, task, submission and review actions are recorded as they happen, and the people affected are notified inside the app.",
  },
];

/* ── How it works ───────────────────────────────────────────────────────── */

export const howItWorksSection = {
  eyebrow: "How it works",
  title: "One flow, from setup to final approval",
  subtitle:
    "The same six steps for every project — visible to everyone who needs to see them.",
};

export const howItWorks = [
  {
    icon: "Settings",
    title: "Set up the department workspace",
    desc: "A coordinator creates the workspace and invites faculty supervisors and students by email.",
  },
  {
    icon: "Folder",
    title: "Create projects, assign supervisors",
    desc: "Projects are created from scratch or from a saved template, then given a supervisor and a student team.",
  },
  {
    icon: "Target",
    title: "Plan milestones and tasks",
    desc: "The project is split into milestones with due dates, and each milestone into tasks owned by a named student.",
  },
  {
    icon: "Upload",
    title: "Students submit deliverables",
    desc: "Students work through their tasks and submit a file or a link against them, with notes for the reviewer.",
  },
  {
    icon: "CheckCircle",
    title: "Supervisors review and decide",
    desc: "Each submission is approved, or returned with a revision request and written feedback for the student to act on.",
  },
  {
    icon: "BarChart",
    title: "Track progress to completion",
    desc: "Milestone completion, task status and the activity history show exactly where every project stands.",
  },
];

/* ── Built for every role ───────────────────────────────────────────────── */

export const rolesSection = {
  eyebrow: "Roles",
  title: "Built for everyone in a supervised project",
  subtitle:
    "The same record of work, presented differently depending on who is looking at it.",
};

export const roles = [
  {
    icon: "GraduationCap",
    name: "Students",
    tagline: "Know what is due, and what changed",
    points: [
      "See only the tasks assigned to you, with their due dates and current status",
      "Submit a file or a link against a task, with notes for your supervisor",
      "Read review feedback in the same place as the work it refers to",
      "Resubmit against the same task when a revision is requested",
    ],
  },
  {
    icon: "User",
    name: "Faculty supervisors",
    tagline: "One review queue instead of ten inboxes",
    points: [
      "Work through every submission awaiting your decision in one queue",
      "Approve or return a submission with written feedback attached",
      "Plan milestones and tasks for the projects you supervise",
      "Schedule review meetings and keep the discussion beside the work",
    ],
  },
  {
    icon: "Shield",
    name: "Project coordinators",
    tagline: "Department-wide visibility without chasing anyone",
    points: [
      "See every project, supervisor and student across the department",
      "Invite supervisors and students by email and manage roles centrally",
      "Follow the activity history to see what moved and who moved it",
      "Track milestone completion across every project at once",
    ],
  },
  {
    icon: "Layers",
    name: "Departments",
    tagline: "A process that survives the batch",
    points: [
      "One consistent supervision process across every kind of project",
      "Templates carry a proven structure into the next cohort",
      "A record that outlives staff and student turnover",
      "A single system of record to evaluate project work against",
    ],
  },
];

/* ── Why Trellis ────────────────────────────────────────────────────────── */

export const whyTrellis = {
  eyebrow: "Why Trellis",
  title: "Generic project tools stop at “Done”",
  subtitle:
    "Jira, Trello and ClickUp are built for teams of peers who mark their own work " +
    "complete. Supervised academic work has a gate in the middle: someone accountable " +
    "has to accept the deliverable before it counts. That one difference changes the " +
    "shape of the tool.",
  points: [
    {
      icon: "CheckCircle",
      title: "Done is not a decision. Approval is.",
      desc: "In a generic tracker a student moves their own task to Done. In Trellis the task goes Submitted, then Under Review, then Approved or Revision Needed — and only the supervisor can make that call.",
    },
    {
      icon: "Refresh",
      title: "Revision is a state, not a comment",
      desc: "A returned submission carries the supervisor's written feedback and moves the task into a revision state. The earlier attempt and the reason it came back both stay on record.",
    },
    {
      icon: "Lock",
      title: "Visibility follows the role",
      desc: "Students see their own tasks, supervisors see the projects they supervise, coordinators see the department. Access is enforced by role on the server, not by folder permissions.",
    },
    {
      icon: "FileText",
      title: "The record is built for evaluation",
      desc: "Submission times, review decisions and revision history stay on record, so an evaluation panel can see how a project actually progressed instead of reconstructing it afterwards.",
    },
  ],
  note:
    "Trellis is not trying to replace an engineering tracker. It is built for the way " +
    "final-year projects, capstones, dissertations and supervised internships are " +
    "actually run.",
};

/* ── FAQ ────────────────────────────────────────────────────────────────── */

/* ──────────────────────────────────────────────────────────────────────────
   Product roadmap.

   Phase 1 is the product as it exists today. Phases 2 and 3 are direction, not
   functionality — every item in them is written as an intention and the UI
   labels them so. Nothing here should imply a capability that is not built.
   ────────────────────────────────────────────────────────────────────────── */
export const roadmapSection = {
  eyebrow: "Roadmap",
  title: "Built on the record Trellis already keeps",
  subtitle:
    "Every milestone, submission, review decision and comment in Trellis is " +
    "structured data. That record is what makes the next two phases possible — " +
    "each one builds on the phase before it.",
};

export const roadmap = [
  {
    phase: "Phase 1",
    status: "delivered",
    statusLabel: "Available now",
    icon: "CheckCircle",
    title: "Trellis",
    summary:
      "The supervision cycle end to end, running in production today.",
    points: [
      "Role-based workspaces for coordinators, supervisors and students",
      "Milestone and task planning, with submissions behind a review gate",
      "Revision as a real state, carrying written feedback back to the student",
      "Templates, real-time chat, notifications, meetings and calendar",
      "An append-only activity log across the organisation",
    ],
  },
  {
    phase: "Phase 2",
    status: "planned",
    statusLabel: "Planned",
    icon: "Sparkle",
    title: "AI-assisted Trellis",
    summary:
      "Assistance layered onto the existing workflow. The way work moves does " +
      "not change; the effort of running it falls.",
    points: [
      "Project summaries drawn from milestones, submissions and review history",
      "Progress insights showing which projects have gone quiet or are slipping",
      "Review assistance drafting a first-pass note for a supervisor to edit or discard",
      "Task assistance suggesting a breakdown from comparable past projects",
      "Automated end-of-term and per-cohort reporting from the activity log",
      "Natural-language questions asked directly of project information",
    ],
  },
  {
    phase: "Phase 3",
    status: "future",
    statusLabel: "Future vision",
    icon: "Compass",
    title: "Intelligent AI SaaS platform",
    summary:
      "Built on Phases 1 and 2 together — moving from describing what happened " +
      "to anticipating what will.",
    points: [
      "Predictive insight flagging a project at risk early enough to act",
      "Workflow automation for routing reviews and escalating stalled work",
      "Personalised guidance for the student's next step and the supervisor's highest-value one",
      "Supervision support tracking feedback quality and consistency",
      "Organisation-level analytics on throughput, outcomes and workload",
      "Multi-institution scale, with the governance and audit controls that requires",
    ],
  },
];

export const faqSection = {
  eyebrow: "FAQ",
  title: "Questions worth answering first",
  subtitle: "Short answers about how Trellis actually works.",
};

export const faqs = [
  {
    q: "Who is Trellis for?",
    a: "Departments that run supervised student projects — final-year projects, capstones, major projects, dissertations and supervised internships. There are three roles: coordinators, who set up and oversee the workspace; faculty supervisors, who plan the work and review it; and students, who do it.",
  },
  {
    q: "How is this different from Trello or Jira?",
    a: "A general tracker ends a task at Done, marked by whoever was doing it. Trellis puts a review gate in the middle: the student submits, the task moves to Under Review, and the supervisor either approves it or sends it back for revision. Supervision is part of the workflow rather than a convention layered on top of it.",
  },
  {
    q: "How do people get access?",
    a: "A coordinator invites supervisors and students by email from inside the workspace, and they receive credentials for a first sign-in. Roles are assigned at invitation time and managed centrally afterwards.",
  },
  {
    q: "How do students submit their work?",
    a: "A student opens the task assigned to them and submits either a file or a link, along with notes for the reviewer. The submission is recorded against that task with a timestamp and becomes visible to their supervisor.",
  },
  {
    q: "What happens when a supervisor requests a revision?",
    a: "The task moves into a revision state with the supervisor's written feedback attached, and the student resubmits against the same task. The earlier attempt and the feedback stay in the history.",
  },
  {
    q: "Is there a record we can rely on at evaluation time?",
    a: "Projects, milestones, tasks, submissions and review decisions are all recorded, and the activity history shows what changed and who changed it — so a supervisor or an evaluation panel can reconstruct how a project progressed.",
  },
];

/* ── Final CTA ──────────────────────────────────────────────────────────── */

export const finalCta = {
  eyebrow: "Get started",
  title: "Bring every supervised project into one workspace",
  subtitle:
    "Sign in to an existing workspace, or create one and invite your supervisors and students.",
  primaryCta: "Create an account",
  secondaryCta: "Sign in",
};

/* ── Footer ─────────────────────────────────────────────────────────────── */

export const footerTagline =
  "The academic project and capstone supervision platform. Structure for supervised work.";

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
      { label: "Why Trellis", href: "#why-trellis" },
      { label: "FAQ", href: "#faq" },
    ],
  },
];
