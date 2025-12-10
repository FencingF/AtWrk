import {useEffect, useState} from "react";
import MyDatePicker from "../utils/datepicker/MyDatePicker.jsx";
import {addDoc, collection, getDocs, query, where} from "firebase/firestore";
import {auth, db} from "../firebaseConfig.js";
import StrengthGraph from "../utils/StrengthGraph.jsx";
import {exerciseList} from "../utils/ExerciseList.js";

export default function StrengthPage() {

    const [selectedExercise, setSelectedExercise] = useState("");

    const [lbs, setLbs] = useState("");
    const [reps, setReps] = useState("");
    const [date, setDate] = useState("");

    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const [stats, setStats] = useState({
        highestProjectedMax: 0,
        highestSingleRep: 0
    });

    const [graphData, setGraphData] = useState([]);

    useEffect(() => {
        async function loadStats() {
            if (!selectedExercise) return;

            const result = await returnStatsData(selectedExercise);
            setStats(result);

            const graph = await getProjectedGraphData(selectedExercise);
            console.log("Graph Data Retrieved => ", graph);
            setGraphData(graph);
        }

        loadStats();
    }, [selectedExercise, refreshTrigger]);



    function handleSaveAndRefresh() {
        handleSave();  // keep existing save functionality
        alert("Lift saved and logged!");
        setRefreshTrigger(prev => prev + 1); // trigger stats update
    }

    async function returnStatsData(selectedExercise) {
        const selectWorkouts = await getWorkoutsForExercise(selectedExercise);
        console.log(selectWorkouts);

        if (!selectWorkouts || selectWorkouts.length === 0) {
            return { highestProjectedMax: 0, highestSingleRep: 0 };
        }

        let highestProjectedMax = 0;
        let highestSingleRep = 0;

        for (const workout of selectWorkouts) {
            const {Weight, Reps} = workout;

            const projMax = projectedMax(Weight, Reps);

            if (projMax > highestProjectedMax) highestProjectedMax = projMax;
            if (Weight > highestSingleRep) highestSingleRep = Weight;
        }
        return {highestProjectedMax, highestSingleRep};
    }

    async function getProjectedGraphData(exerciseName) {
        if (!auth.currentUser) return [];

        const q1 = query(
            collection(db, "strengthdata"),
            where("uid", "==", auth.currentUser.uid),
            where("Exercise", "==", exerciseName)
        );

        const snap1 = await getDocs(q1);

        const rawLogs = snap1.docs.map(d => {
            const data = d.data();

            let dateStr = "";
            if (data.Date?.toDate) {
                // Firestore Timestamp
                dateStr = data.Date.toDate().toISOString().split("T")[0];
            } else {
                // Already string
                dateStr = new Date(data.Date).toISOString().split("T")[0];
            }

            return {
                date: dateStr,
                weight: data.Weight,
                reps: data.Reps
            };
        });

        // 2) apply projected max
        const withProjected = rawLogs.map(entry => ({
            date: entry.date,
            value: projectedMax(entry.weight, entry.reps)  // ensure uniform name
        }));

        // 3) select best entry per date
        const bestPerDay = {};

        withProjected.forEach(entry => {
            if (!bestPerDay[entry.date] || entry.value > bestPerDay[entry.date]) {
                bestPerDay[entry.date] = entry.value;
            }
        });

        // 4) convert result to graph-ready list
        return Object.entries(bestPerDay)
            .map(([date, value]) => ({ date, value }))
            .sort((a, b) => new Date(a.date) - new Date(b.date));
    }



    function projectedMax(weightLifted, repsPerformed) {
        return repsPerformed > 1 ? Math.round((weightLifted * repsPerformed / 30.48) + weightLifted) : weightLifted;
    }

    async function getWorkoutsForExercise(exerciseName) {
        if (!auth.currentUser) return [];

        const q = query(
            collection(db, "strengthdata"),
            where("uid", "==", auth.currentUser.uid),
            where("Exercise", "==", exerciseName)
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }

    async function getGraphStats(selectedExercise) {
        if (!auth.currentUser) return [];

        const selectWorkouts = await getWorkoutsForExercise(selectedExercise);



        //return the projected max from the user for that day
    }

    async function handleSave() {
        console.log("Saving...");
        console.log("Exercise:", selectedExercise);
        console.log("Lbs:", lbs);
        console.log("Reps:", reps);
        console.log("Date:", date);
        await addWorkout(parseInt(lbs), parseInt(reps), date)
    }

    async function addWorkout(weight, reps, date) {
        if (!auth.currentUser) return;
        try {
            const docRef = await addDoc(collection(db, "strengthdata"), {
                uid: auth.currentUser.uid,   // associate workout with user
                Date: date,   // current timestamp
                Exercise: selectedExercise,
                Reps: reps,
                Weight: weight
            });
            console.log("Workout added with ID: ", docRef.id);
        } catch (e) {
            console.error("Error adding workout: ", e);
        }
    }

    return (
        <div className="page-container">
            <div className="prpl-box">
                {exerciseList.map((exercise) => (
                    <button
                        key={exercise}
                        className="stdBtn stdBtn-exercise"
                        onClick={() => setSelectedExercise(exercise)}
                    >
                        {exercise}
                    </button>
                ))}
            </div>

            <div className="prpl-box-graph">

                <StrengthGraph data={graphData} />

            </div>

            <div className="prpl-box-stats">
                <div className="generalText">
                    {selectedExercise ? selectedExercise  + " Stats ": "Select an Exercise"}
                </div>

                <div className="generalText generalText-small">
                    <p>{"Current Personal Record:"}</p>
                </div>
                <div className="generalText generalText-small">
                    {stats.highestSingleRep + " lbs"}
                </div>

                <div className="generalText generalText-small">
                    <p>{"Projected Current Maximum:"}</p>
                </div>
                <div className="generalText generalText-small">
                    {stats.highestProjectedMax + " lbs"}
                </div>

            </div>

            <div className="prpl-box-entermax">
                <div className="generalText">
                    {selectedExercise ? selectedExercise : "Select an Exercise"}
                </div>

                <div className="statInput">
                    <div className="lbsrow">
                        <input
                            className="liftInput"
                            type="number"
                            value={lbs}
                            onChange={(e) => setLbs(e.target.value)}
                        />
                        <span className="unit">lbs</span>
                    </div>

                    <div className="repsrow">
                        <input
                            className="liftInput"
                            type="number"
                            value={reps}
                            onChange={(e) => setReps(e.target.value)}
                        />
                        <span className="unit">reps</span>
                    </div>

                    <div className="daterow">
                        <MyDatePicker value={date} onChange={setDate} />
                    </div>

                    {selectedExercise && (
                        <button
                            className="stdBtn stdBtn-signOut"
                            onClick={handleSaveAndRefresh}
                        >
                            Save
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
