import Calendar from "../utils/Calendar.jsx";
import { useState, useEffect } from "react";
import { exerciseList } from "../utils/ExerciseList.js";
import { auth, db } from "../firebaseConfig.js";
import { addDoc, collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import MyDatePicker from "../utils/datepicker/MyDatePicker.jsx";

export default function WorkoutPage() {

    const [workoutName, setWorkoutName] = useState("");
    const [exercises, setExercises] = useState([
        { name: "", weight: "", reps: "", sets: "" }
    ]);

    const [selectedDate, setSelectedDate] = useState("");
    const [calendarData, setCalendarData] = useState({});

    const [selectedWorkout, setSelectedWorkout] = useState(null);

    // ----------------------------------------
    // LOAD ALL WORKOUTS (with ID + arrays)
    // ----------------------------------------
    async function loadWorkouts() {
        if (!auth.currentUser) return;

        const q = query(
            collection(db, "workouts"),
            where("uid", "==", auth.currentUser.uid)
        );

        const snap = await getDocs(q);

        let map = {};

        snap.forEach(doc => {
            const d = doc.data();
            const iso = d.Date.toDate().toISOString().split("T")[0];

            if (!map[iso]) map[iso] = [];

            map[iso].push({
                id: doc.id,
                WorkoutName: d.WorkoutName,
                Exercise: d.Exercise,
                Weight: d.Weight,
                Reps: d.Reps,
                Sets: d.Sets,
                Date: d.Date
            });
        });

        setCalendarData(map);
    }

    useEffect(() => {
        loadWorkouts();
    }, []);

    // ----------------------------------------
    // EXERCISE EDITING FUNCTIONS
    // ----------------------------------------
    const updateExercise = (index, field, value) => {
        const updated = [...exercises];
        updated[index][field] = value;
        setExercises(updated);
    };

    const addExerciseRow = () => {
        setExercises([...exercises, { name: "", weight: "", reps: "", sets: "" }]);
    };

    const removeExerciseRow = () => {
        if (exercises.length > 1) {
            setExercises(exercises.slice(0, -1));
        }
    };

    // ----------------------------------------
    // SAVE WORKOUT SESSION
    // ----------------------------------------
    const saveWorkout = async () => {
        if (!auth.currentUser) return alert("Login required.");
        if (!workoutName) return alert("Enter a workout name.");
        if (!selectedDate) return alert("Select a workout date.");

        const dateObj = new Date(selectedDate);

        const exerciseNames = exercises.map(ex => ex.name);
        const weights = exercises.map(ex => ex.weight);
        const reps = exercises.map(ex => ex.reps);
        const sets = exercises.map(ex => ex.sets);

        // ---- 1) Save workout session ---- //
        await addDoc(collection(db, "workouts"), {
            uid: auth.currentUser.uid,
            WorkoutName: workoutName,
            Date: dateObj,
            Exercise: exerciseNames,
            Weight: weights,
            Reps: reps,
            Sets: sets
        });

        // ---- 2) Expand workout into strength entries ---- //
        for (let i = 0; i < exerciseNames.length; i++) {

            const exerciseName = exerciseNames[i];
            const weight = parseInt(weights[i]);
            const repCount = parseInt(reps[i]);
            const setCount = parseInt(sets[i]);

            if (!exerciseName || !weight || !repCount || !setCount) continue;

            // Insert one strength entry per set
            for (let s = 0; s < setCount; s++) {

                await addDoc(collection(db, "strengthdata"), {
                    uid: auth.currentUser.uid,
                    Date: dateObj,
                    Exercise: exerciseName,
                    Weight: weight,
                    Reps: repCount
                });
            }
        }

        await loadWorkouts();
        alert("Workout saved and logged!");
    };

    const deleteWorkout = async () => {
        if (!selectedWorkout) return;

        const confirmDelete = window.confirm(
            "Are you sure you want to delete this workout?"
        );

        if (!confirmDelete) return;

        try {
            await deleteDoc(doc(db, "workouts", selectedWorkout.id));

            setSelectedWorkout(null);
            await loadWorkouts();
        } catch (err) {
            console.error(err);
            alert("Failed to delete workout.");
        }
    };


    return (
        <div className="page-container page-container-workout">

            {/* LEFT SECTION — INPUT FORM */}
            <div className="prpl-box prpl-box-workoutInsert">

                {/* WORKOUT NAME */}
                <div className="exercise-block">
                    <div className="exercise-label">Workout Name</div>
                    <input
                        className="exercise-input"
                        type="text"
                        placeholder="Leg Day, Push Day, etc."
                        value={workoutName}
                        onChange={(e) => setWorkoutName(e.target.value)}
                    />
                </div>

                {/* EXERCISE LIST */}
                {exercises.map((ex, index) => (
                    <div key={index} className="exercise-block">

                        <div className="exercise-label">Exercise {index + 1}</div>

                        <select
                            className="exercise-dropdown"
                            value={ex.name}
                            onChange={(e) => updateExercise(index, "name", e.target.value)}
                        >
                            <option value="">Select Exercise</option>
                            {exerciseList.map((op, i) => (
                                <option key={i} value={op}>{op}</option>
                            ))}
                        </select>

                        <input
                            className="exercise-input"
                            type="number"
                            placeholder="Weight"
                            value={ex.weight}
                            onChange={(e) => updateExercise(index, "weight", e.target.value)}
                        />

                        <input
                            className="exercise-input"
                            type="number"
                            placeholder="Reps"
                            value={ex.reps}
                            onChange={(e) => updateExercise(index, "reps", e.target.value)}
                        />

                        <input
                            className="exercise-input"
                            type="number"
                            placeholder="Sets"
                            value={ex.sets}
                            onChange={(e) => updateExercise(index, "sets", e.target.value)}
                        />
                    </div>
                ))}

                <div className="exercise-buttons">
                    <button className="add-exercise-btn" onClick={addExerciseRow}>+</button>
                    <button className="remove-exercise-btn" onClick={removeExerciseRow}>−</button>
                </div>

                {/* DATE + SAVE */}
                <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <MyDatePicker value={selectedDate} onChange={setSelectedDate} />

                    <button className="stdBtn stdBtn-signOut" onClick={saveWorkout}>
                        Save Workout Session
                    </button>
                </div>
            </div>

            {/* RIGHT OF LEFT — SELECTED WORKOUT PREVIEW */}
            <div className="prpl-box prpl-box-selectedWorkout">
                {selectedWorkout ? (
                    <div style={{ padding: "1rem", color: "white" }}>
                        <h2>{selectedWorkout.WorkoutName}</h2>

                        <h4>{selectedWorkout.Date.toDate().toDateString()}</h4>

                        {selectedWorkout.Exercise.map((ex, i) => (
                            <div key={i} style={{ marginTop: "0.5rem" }}>
                                <strong>{ex}</strong> —
                                {selectedWorkout.Weight[i]} lbs ×
                                {selectedWorkout.Reps[i]} reps ×
                                {selectedWorkout.Sets[i]} sets
                            </div>
                        ))}
                        <button
                            className="stdBtn stdBtn-signOut"
                            style={{ marginTop: "1.5rem" }}
                            onClick={deleteWorkout}
                        >
                            Delete Workout
                        </button>
                    </div>
                ) : (
                    <div style={{ padding: "1rem", color: "white", opacity: 0.5 }}>
                        Select a workout from the calendar.
                    </div>
                )}
            </div>

            {/* LARGE RIGHT — CALENDAR */}
            <div className="prpl-box prpl-box-calendar">
                <Calendar
                    savedWorkouts={calendarData}
                    onWorkoutClick={(wk) => setSelectedWorkout(wk)}
                />
            </div>
        </div>
    );
}
