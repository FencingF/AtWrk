# AtWrk — www.atwrk.app

AtWrk is a full-stack fitness tracking web app built with **React**, **Firebase Authentication**, and **Firestore**.  
It allows users to log workouts, record strength progress, and visualize performance trends in real time.  
The app uses a shared layout with React Router for clean navigation between pages.

---

## 🚀 Features Overview

### **1. Strength Tracking (/strength)**
This page lets users track individual lifts and monitor progress over time.

#### ✅ Select Exercises
A scrollable list of exercises is displayed in the left column.  
Selecting one loads historical stats and updates the graph.

#### ✅ Log Lifts
Users can input:
- Weight (lbs)
- Reps
- Date

Each entry is saved into the `strengthdata` collection in Firestore.

#### ✅ Automatic Stat Calculations
For every exercise, AtWrk computes:
- **Highest Single Rep** — the heaviest weight recorded
- **Highest Projected Max** using the formula:


#### 📈 Progress Graph
The graph displays your *best projected max for each day*, sorted chronologically.

Data pipeline:
1. Fetch all logs for the selected exercise
2. Normalize timestamps
3. Compute projected max
4. Keep the best value per day
5. Send results to the graph component

---

### **2. Workout Builder (/workouts)**
This page lets users create full workout sessions.

#### 📝 Build Workouts
Each workout may contain multiple exercises, each with:
- Exercise name
- Weight
- Reps
- Sets

Rows can be added or removed easily.

#### 💾 Save Workouts
Saving a workout performs **two actions**:
1. Stores the entire workout session in the `workouts` collection
2. Expands each set into individual strength entries added to `strengthdata`
    - This ensures that the Strength page receives data even when users log full workouts instead of isolated lifts

#### 📅 Calendar Integration
All saved workouts appear inside a monthly calendar.  
Clicking a workout reveals its full details in the right-side preview panel.

---

## 🧱 Layout & Navigation
The app uses a central layout with:
- A top navigation bar
- Shared header and authentication controls
- A main content area that swaps based on route (`/`, `/strength`, `/workouts`)

Routing is handled via **React Router**.

---

## 🎨 UI & Styling
The UI is built with:
- Dark-mode-friendly purple/gray color palette
- Responsive CSS Grid layouts
- Custom button themes
- Scrollable containers for long lists
- Styled input fields and dropdowns

The design is clean, minimal, and optimized for productivity during workouts.

---

## 🔒 Authentication
Users must be signed in to:
- Save workouts
- Log strength entries
- Access personalized charts and stats

Authentication is handled via Firebase.

---

## 📂 Data Storage
All user data is stored in Firestore via these collections:

- **`strengthdata`** — Individual lift entries
- **`workouts`** — Full workout sessions
- Additional derived data computed in the UI

Each entry is associated with a user ID, ensuring private and personalized logs.

---

## 🏁 Summary
AtWrk combines simplicity with power, allowing users to:

- Log daily lifts
- Track projected maxes
- Visualize progress
- Build full workouts
- Review history through a calendar
- Maintain all progress across devices via Firebase

This is a modern, efficient fitness tracker built for real athletes who want real data.

---
