📋 v1 Product Brief — Cohort Triage Tool

## The Problem

Instructors running intensive cohort programs can't reliably track which students are struggling in real time. Check-ins happen verbally during exercises, notes are scribbled by hand, and the mental model of "who needs help" degrades by the next morning. When a stuck student goes unnoticed, they don't ask for help — they fall behind, lose confidence, and spend mental energy worrying about catching up instead of learning and building. In a 2-week program, one missed day compounds fast.

## Who Has It

v1 user: one instructor running a 2-week intensive AI builder program with ~15 students. Hands-on, constantly context-switching, no TA, no system. Their tool right now is their own memory and a notebook. Eventually, any Maker's Square instructor — but only after it works for the person who built it.

## Current Workflow

- During exercises — circulates, notices who's stuck, forms mental notes
- End-of-day debrief — quick group check-in; most students don't speak up
- After session — jots names and issues in a notebook from memory
- Next morning — reviews notes to prioritize; gaps are common

Core failure point: memory is the bridge between observation and action. By morning, context has degraded.

## The AI's Role

Instructor pastes end-of-day bullet notes. AI returns a structured triage brief in three buckets:

- 🔴 Needs attention tomorrow — stuck, behind, or hasn't asked
- 🟡 Watch — unclear signal, worth a quick check
- 🟢 Ready to move forward — solid, could be pushed further

Each entry: student name + one-line reason from the notes. No inference beyond what was written.

## What I'm NOT Building

- ❌ Automated Slack messages
- ❌ Attendance tracking
- ❌ Dashboards or charts
- ❌ Student-facing interfaces
- ❌ External integrations
- ❌ Predictive analytics

v1 is one input, one output. Paste notes → get triage summary.

## Success Metrics

After 5 days of use, the instructor can name every student who was stuck that week without looking at notes. If the brief is clear and consistent enough to build a real mental model of the cohort, the tool WORKS.
