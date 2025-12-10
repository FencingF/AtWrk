import './App.css';
import {useRef, useEffect, useState} from "react";
import {auth, db} from "./firebaseConfig.js";
import {addDoc, collection, doc, setDoc, serverTimestamp, where, orderBy, limit, getDocs, query, Timestamp} from "firebase/firestore";

export default function App() {

    const [clicked, setClicked] = useState(false);
    const [clickedEdit, setClickedEdit] = useState(false);
    const [gender, setGender] = useState("male"); // <- make it state

    const [age, setAge] = useState("");
    const [height, setHeight] = useState("");
    const [weight, setWeight] = useState("");
    const [neckIn, setNeckIn] = useState("");
    const [waistIn, setWaistIn] = useState("");
    const [hipIn, setHipIn] = useState("");

    const [favStats, setFavStats] = useState({
        favExercise: "None logged",
        actualPR: 0,
        totalSets: 0,
    });

    const [lastWorkout, setLastWorkout] = useState(null);
    const [weather, setWeather] = useState(null);

    useEffect(() => {
        async function loadLatest() {
            const latest = await getLatestBiometrics();
            if (latest) {
                setAge(latest.Age);
                setGender(latest.Gender);
                setHeight(latest.Height);
                setWeight(latest.Weight);
                setNeckIn(latest.Neck);
                setWaistIn(latest.Waist);
                setHipIn(latest.Hip);
            }

            const fav = await getFavoriteExerciseStats();
            if (fav) setFavStats(fav);

            const last = await getLastWorkoutLogged();
            setLastWorkout(last);

            navigator.geolocation.getCurrentPosition(async (pos) => {
                const wx = await fetchNWSWeather(
                    pos.coords.latitude,
                    pos.coords.longitude
                );
                setWeather(wx);
            });
        }

        loadLatest();
    }, []);

    async function fetchNWSWeather(lat, lon) {
        try {
            const pointRes = await fetch(`https://api.weather.gov/points/${lat},${lon}`, {
                headers: { "User-Agent": "AtWrkApp/1.0 (email@example.com)" }
            });

            const pointData = await pointRes.json();

            const forecastUrl = pointData.properties.forecast;
            const hourlyUrl = pointData.properties.forecastHourly;

            const forecastRes = await fetch(forecastUrl, {
                headers: { "User-Agent": "AtWrkApp/1.0 (email@example.com)" }
            });

            const hourlyRes = await fetch(hourlyUrl, {
                headers: { "User-Agent": "AtWrkApp/1.0 (email@example.com)" }
            });

            const forecastData = await forecastRes.json();
            const hourlyData = await hourlyRes.json();

            const now = forecastData.properties.periods[0];
            const hour = hourlyData.properties.periods[0];

            return {
                temp: now.temperature,
                condition: now.shortForecast,
                detailed: now.detailedForecast,
                wind: now.windSpeed,
                windDir: now.windDirection,
                period: now.name,
                humidity: hour.relativeHumidity?.value,
                heatIndex: hour.heatIndex?.value,
                windChill: hour.windChill?.value
            };
        } catch (err) {
            console.error(err);
            return null;
        }
    }


    async function getLastWorkoutLogged() {
        if (!auth.currentUser) return null;

        try {
            const q = query(
                collection(db, "workouts"),
                where("uid", "==", auth.currentUser.uid),
                orderBy("Date", "desc"),
                limit(1)
            );

            const snapshot = await getDocs(q);

            if (snapshot.empty) return null;

            const docData = snapshot.docs[0].data();

            // Convert Firestore Timestamp to readable date
            const workoutDate = docData.Date.toDate().toLocaleDateString();

            return {
                name: docData.WorkoutName,
                exercises: docData.Exercise,
                reps: docData.Reps,
                weight: docData.Weight,
                sets: docData.Sets,
                date: workoutDate
            };

        } catch (error) {
            console.error("Error fetching last workout:", error);
            return null;
        }
    }

    function calcBMI() {
        const index = (weight / (height * height)) * 703;
        return index.toFixed(1);
    }

    //TODO: This might not be working right
    function navyBodyFat(gender) {
        if (gender === "male") {
            return (86.010 * Math.log10(waistIn - neckIn) - 70.041 * Math.log10(height) + 36.76).toFixed(1);
        }
        if (gender === "female") {
            return (163.205 * Math.log10(waistIn + hipIn - neckIn) - 97.684 * Math.log10(height) - 78.387).toFixed(1);
        }
    }

    async function getFavoriteExerciseStats() {
        if (!auth.currentUser) return null;

        // last 30 days timestamp
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const thirtyDaysAgoTS = Timestamp.fromDate(thirtyDaysAgo);

        // Firestore query
        const q = query(
            collection(db, "strengthdata"),
            where("uid", "==", auth.currentUser.uid),
            where("Date", ">=", thirtyDaysAgoTS)
        );

        const snapshot = await getDocs(q);
        if (snapshot.empty) return { favExercise: "No data", actualPR: 0, totalSets: 0 };

        // Count sets and compute stats
        const exerciseCount = {};
        const exercisePR = {};

        snapshot.docs.forEach(doc => {
            const data = doc.data();
            const ex = data.Exercise;
            const weight = data.Weight;

            exerciseCount[ex] = (exerciseCount[ex] || 0) + 1;

            if (!exercisePR[ex] || weight > exercisePR[ex]) {
                exercisePR[ex] = weight;
            }
        });

        // Determine favorite exercise — highest set count
        let fav = null;
        let maxSets = 0;

        for (const ex of Object.keys(exerciseCount)) {
            if (exerciseCount[ex] > maxSets) {
                fav = ex;
                maxSets = exerciseCount[ex];
            }
        }

        return {
            favExercise: fav || "No data",
            actualPR: exercisePR[fav] || 0,
            totalSets: maxSets
        };
    }

    async function handleSave() {
        console.log("Saving...");
        console.log("Age:", age);
        console.log("Gender", gender);
        console.log("Height:", height);
        console.log("Weight:", weight);
        console.log("Neck:", neckIn);
        console.log("Waist:", waistIn);
        console.log("Hips:", hipIn);

        // Later you can POST this to your backend
        await addBiometrics({
            age: age,
            gender: gender,         // keep as string, do NOT parseInt
            height: height,
            hipIn: hipIn,
            neckIn: neckIn,
            waistIn: waistIn,
            weight: weight
        });
        const latest = await getLatestBiometrics();

        if (latest) {
            console.log("Most recent biometrics:", latest);
            setAge(latest.Age);
            setGender(latest.Gender);
            setHeight(latest.Height);
            setWeight(latest.Weight);
            setNeckIn(latest.Neck);
            setWaistIn(latest.Waist);
            setHipIn(latest.Hip);
        }
    }

    // replace your current addBiometrics with this
    async function addBiometrics(data) {
        if (!auth.currentUser) return;
        try {
            // Ensure required fields and types
            const payload = {
                Age: Number.isNaN(Number(data.age)) ? null : Number(data.age),
                Gender: data.gender ? String(data.gender) : null,   // <-- force string
                Height: Number.isNaN(Number(data.height)) ? null : Number(data.height),
                Hip: Number.isNaN(Number(data.hipIn)) ? null : Number(data.hipIn),
                Neck: Number.isNaN(Number(data.neckIn)) ? null : Number(data.neckIn),
                Waist: Number.isNaN(Number(data.waistIn)) ? null : Number(data.waistIn),
                Weight: Number.isNaN(Number(data.weight)) ? null : Number(data.weight),
                Date: serverTimestamp(),
                uid: auth.currentUser.uid
            };

            console.log("Writing biometrics payload:", payload); // debug log before write

            const docRef = await addDoc(collection(db, "biometrics"), payload);
            console.log("Biometrics added with ref: ", docRef.id);
        } catch (e) {
            console.error("Error adding biometrics: ", e);
        }
    }


    async function getLatestBiometrics() {
        if (!auth.currentUser) return null;

        try {
            const biometricsRef = collection(db, "biometrics");

            // Query documents where uid matches, ordered by Date descending, limit 1
            const q = query(
                biometricsRef,
                where("uid", "==", auth.currentUser.uid),
                orderBy("Date", "desc"),
                limit(1)
            );

            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                console.log("No biometrics found for this user.");
                return null;
            }

            // Return the first (most recent) document's data
            const latestDoc = querySnapshot.docs[0];
            return { id: latestDoc.id, ...latestDoc.data() };

        } catch (e) {
            console.error("Error fetching latest biometrics: ", e);
            return null;
        }
    }

    return (
        <div className="page-container page-container-home">
            <div className="prpl-box prpl-box-biometrics">
                <div className="generalText-small generalText-small-biom">Age: {age}</div>
                <div className="generalText-small generalText-small-biom">Height: {height} in</div>
                <div className="generalText-small generalText-small-biom">Weight: {weight} lbs</div>
                <div className="generalText-small generalText-small-biom">BMI: {calcBMI()}</div>
                <div className="generalText-small generalText-small-biom">Navy %BF: {navyBodyFat(gender)}</div>
                <div className="editbiom">

                    {!clickedEdit ? (
                            <button
                                className="stdBtn stdBtn-page stdBtn-page-edit"
                                onClick={() => {
                                    setClickedEdit(true)
                                }}
                            >Edit
                            </button>
                        ) :

                        <div className="prpl-box prpl-box-editBiom">

                            <div className="statInput">
                                <div className="lbsrow">
                                    <span className="unit">Age: </span>
                                    <input
                                        className="liftInput"
                                        type="number"
                                        value={age}
                                        onChange={(e) => setAge(e.target.value)}
                                    />
                                </div>

                                <div className="lbsrow">
                                    <span className="unit">Height:</span>
                                    <input
                                        className="liftInput"
                                        type="number"
                                        placeholder="Inches"
                                        value={height}
                                        onChange={(e) => setHeight(e.target.value)}
                                    />
                                </div>

                                <div className="lbsrow">
                                    <span className="unit">Weight:</span>
                                    <input
                                        className="liftInput"
                                        type="number"
                                        placeholder="lbs"
                                        value={weight}
                                        onChange={(e) => setWeight(e.target.value)}
                                    />
                                </div>

                                <div className="lbsrow">
                                    <span className="unit">Neck:</span>
                                    <input
                                        className="liftInput"
                                        type="number"
                                        placeholder="Inches"
                                        value={neckIn}
                                        onChange={(e) => setNeckIn(e.target.value)}
                                    />
                                </div>

                                <div className="lbsrow">
                                    <span className="unit">Waist:</span>
                                    <input
                                        className="liftInput"
                                        type="number"
                                        placeholder="Inches"
                                        value={waistIn}
                                        onChange={(e) => setWaistIn(e.target.value)}
                                    />
                                </div>

                                <div className="lbsrow">
                                    <span className="unit">Hips:</span>
                                    <input
                                        className="liftInput"
                                        type="number"
                                        placeholder="Inches"
                                        value={hipIn}
                                        onChange={(e) => setHipIn(e.target.value)}
                                    />
                                </div>

                                <button
                                    className="stdBtn stdBtn-page stdBtn-page-edit"
                                    onClick={() => {
                                        handleSave()
                                        setClickedEdit(false)
                                    }}
                                >Save
                                </button>
                            </div>

                        </div>
                    }

                </div>
                <div className="maleFemale">
                    {!clicked ? (
                        <button
                            className="stdBtn stdBtn-page stdBtn-page-male"
                            onClick={() => {
                                setGender("female"); // update state
                                console.log(gender);
                                setClicked(true)
                            }}
                        >I am {gender}
                        </button>
                    ) :
                        <button
                            className="stdBtn stdBtn-page stdBtn-page-female"
                            onClick={() => {
                                setGender("male"); // update state
                                console.log(gender);
                                setClicked(false)
                            }}
                        >I am {gender}
                        </button>
                    }
                </div>
            </div>

            <div className="prpl-box prpl-box-favstats">
                <div className="generalText-small">
                    <b>Favorite Exercise (Last 30 Days):</b>
                </div>
                <div className="generalText-small">
                    {favStats.favExercise}
                </div>

                <div className="generalText-small">
                    <b>Personal Record:</b>
                </div>
                <div className="generalText-small">
                    {favStats.actualPR} lbs
                </div>

                <div className="generalText-small">
                    <b>Total Sets Logged:</b>
                </div>
                <div className="generalText-small">
                    {favStats.totalSets}
                </div>
            </div>

            <div className="prpl-box prpl-box-lastworkout">
                {lastWorkout ? (
                    <div style={{ padding: "1rem", color: "#D0D0D9" }}>
                        <div className="generalText-small">Last Workout</div>
                        <div className="generalText-small">{lastWorkout.date}</div>

                        <div style={{ marginTop: "1rem" }}>
                            <strong>{lastWorkout.name}</strong>
                        </div>

                        {lastWorkout.exercises.map((ex, i) => (
                            <div key={i} className="generalText-small">
                                {ex} — {lastWorkout.weight[i]} lbs × {lastWorkout.reps[i]} reps × {lastWorkout.sets[i]} sets
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="throbbingLoadingMessage" style={{ opacity: 0.6 }}>
                        No workouts logged.
                    </div>
                )}
            </div>
            <div className="prpl-box prpl-box-weather">
                {weather ? (
                    <>
                        <div className="generalText-small">Current Weather</div>

                        <div className="generalText-small" style={{ fontSize: "14px", opacity: 0.8 }}>
                            {weather.period ? `${weather.period}: ` : ""}
                            {weather.temp}°F — {weather.condition}
                        </div>

                        <div className="generalText-small" style={{ fontSize: "14px", opacity: 0.8 }}>
                            Wind: {weather.wind ?? "N/A"} {weather.windDir ? `(${weather.windDir})` : ""}
                        </div>

                        <div className="generalText-small" style={{ fontSize: "14px", opacity: 0.8 }}>
                            {weather.detailed}
                        </div>

                        {weather.humidity != null && (
                            <div className="generalText-small" style={{ fontSize: "14px", opacity: 0.8 }}>
                                Humidity: {weather.humidity}%
                            </div>
                        )}

                        {/*TODO: FIX THIS*/}
                        {/*{weather.heatIndex != null && (*/}
                        {/*    <div className="generalText-small" style={{ fontSize: "14px", opacity: 0.8 }}>*/}
                        {/*        Heat Index: {weather.heatIndex}°F*/}
                        {/*    </div>*/}
                        {/*)}*/}

                        {/*{weather.windChill != null && (*/}
                        {/*    <div className="generalText-small" style={{ fontSize: "14px", opacity: 0.8 }}>*/}
                        {/*        Wind Chill: {weather.windChill}°F*/}
                        {/*    </div>*/}
                        {/*)}*/}

                    </>
                ) : (
                    <div className="throbbingLoadingMessage" style={{ opacity: 0.6 }}>
                        Loading weather...
                    </div>
                )}
            </div>
        </div>
    );
}
