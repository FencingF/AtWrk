// main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import App from "./App";
import StrengthPage from "./pages/StrengthPage.jsx";
import Layout from "./Layout.jsx";
import WorkoutPage from "./pages/WorkoutPage.jsx"; // create this file

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <BrowserRouter>
            <Routes>
                {/* Layout wraps the routes so header/footer are shared */}
                <Route element={<Layout />}>
                    <Route index element={<App />} />               {/* / */}
                    <Route path="strength" element={<StrengthPage />} /> {/* /strength */}
                    <Route path="workouts" element={<WorkoutPage />} /> {/* /workouts */}
                </Route>
            </Routes>
        </BrowserRouter>
    </React.StrictMode>
);