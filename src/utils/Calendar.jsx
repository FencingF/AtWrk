import React, { useState } from "react";

export default function Calendar({ savedWorkouts = {}, onWorkoutClick }) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const monthNames = [
        "January","February","March","April","May","June",
        "July","August","September","October","November","December"
    ];

    const prevMonth = () =>
        setCurrentDate(new Date(year, month - 1, 1));

    const nextMonth = () =>
        setCurrentDate(new Date(year, month + 1, 1));

    const blanks = Array(firstDay).fill(null);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return (
        <div className="myCalendar">
            <div className="cal-header">
                <button onClick={prevMonth}>←</button>
                <div>{monthNames[month]} {year}</div>
                <button onClick={nextMonth}>→</button>
            </div>

            <div className="cal-grid">
                {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
                    <div className="cal-day-name" key={d}>{d}</div>
                ))}

                {blanks.map((_, i) => <div key={"b"+i}></div>)}

                {days.map(day => {
                    const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

                    const workouts = savedWorkouts[iso] || [];

                    return (
                        <div key={day} className="cal-day">

                            <div className="cal-day-number">{day}</div>

                            {/* LIST EACH WORKOUT NAME FOR THIS DATE */}
                            {workouts.map((wk, i) => (
                                <div
                                    key={i}
                                    className="cal-note"
                                    onClick={() => onWorkoutClick(wk)}
                                    style={{ cursor: "pointer" }}
                                >
                                    {wk.WorkoutName}
                                </div>
                            ))}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
