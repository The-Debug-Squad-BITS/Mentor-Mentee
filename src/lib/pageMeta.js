/* ==========================================================================
   Page titles and subtitles, keyed by sidebar section.
   --------------------------------------------------------------------------
   The three dashboard headers used to hard-code a single title each, so the
   heading said "System Overview" whether you were looking at Projects,
   Invitations or Settings. Keeping the copy here means the header component
   stays presentational and the three roles read from one table.

   Keys must match the sidebar `name` values exactly. Anything missing falls
   back to the section name itself, so a new nav item still gets a sane
   heading before anyone writes copy for it.
   ========================================================================== */

const ADMIN = {
  Dashboard:   ["System Overview",  "Manage platform operations, users, and analytics."],
  Activity:    ["Activity Log",     "Every action taken across the organisation."],
  Projects:    ["Projects",         "Create project tracks and assign supervisors and members."],
  Members:     ["Members",          "Everyone with access to this workspace."],
  Invitations: ["Invitations",      "Pending and accepted invitations to the workspace."],
  Templates:   ["Templates",        "Reusable project structures with milestones and tasks."],
  Messages:    ["Messages",         "Direct and project conversations."],
  Meetings:    ["Meetings",         "Schedule and join video meetings."],
  Calendar:    ["Calendar",         "Deadlines, milestones and scheduled meetings."],
  Settings:    ["Settings",         "Workspace configuration and preferences."],
};

const MENTOR = {
  Dashboard:    ["Mentor Dashboard", "Your supervision workload at a glance."],
  Activity:     ["Activity",         "Recent activity across the projects you supervise."],
  "My Projects":["My Projects",      "Project tracks you supervise."],
  Tasks:        ["Tasks",            "Work you have assigned across your projects."],
  Reviews:      ["Reviews",          "Submissions waiting on your feedback."],
  Templates:    ["Templates",        "Reusable project structures with milestones and tasks."],
  Team:         ["Team",             "Members and progress for everyone under your supervision."],
  Messages:     ["Messages",         "Direct and project conversations."],
  Meetings:     ["Meetings",         "Schedule and join video meetings."],
  Calendar:     ["Calendar",         "Deadlines, milestones and scheduled meetings."],
  Profile:      ["Profile",          "Your account details and preferences."],
};

const MENTEE = {
  Dashboard:     ["My Dashboard",  "Track your progress, manage tasks, and connect with your mentors."],
  Activity:      ["Activity",      "Your submissions, reviews and milestone progress."],
  "My Tasks":    ["My Tasks",      "Everything assigned to you, with due dates and status."],
  "My Projects": ["My Projects",   "The project tracks you are part of."],
  Feedback:      ["Feedback",      "Mentor reviews on the work you have submitted."],
  Messages:      ["Messages",      "Direct and project conversations."],
  Meetings:      ["Meetings",      "Upcoming meetings with your mentors."],
  Calendar:      ["Calendar",      "Deadlines, milestones and scheduled meetings."],
  Profile:       ["Profile",       "Your account details and preferences."],
};

const BY_ROLE = { ADMIN, MENTOR, MENTEE };

/**
 * @param {"ADMIN"|"MENTOR"|"MENTEE"} role
 * @param {string} section    the active sidebar item name
 * @param {string} [userName] when on Dashboard, personalises the subtitle
 * @returns {{ title: string, subtitle: string }}
 */
export function pageMeta(role, section, userName) {
  const table = BY_ROLE[role] || {};
  const [title, subtitle] = table[section] || [section || "", ""];

  // Keep the personal greeting, but only on the landing section — repeating it
  // on every page reads as noise.
  if (userName && section === "Dashboard" && subtitle) {
    const rest = subtitle.charAt(0).toLowerCase() + subtitle.slice(1);
    return { title, subtitle: `Welcome, ${userName} — ${rest}` };
  }

  return { title, subtitle };
}
