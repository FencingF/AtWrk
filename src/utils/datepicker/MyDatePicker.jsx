import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./MyDatePicker.css";   // custom theme styles

export default function MyDatePicker({ value, onChange }) {
    return (
        <DatePicker
            selected={value}
            onChange={onChange}
            className="dateInputCustom"
            calendarClassName="darkCalendar"
            popperClassName="darkPopper"
            placeholderText="Select Date"
            renderCustomHeader={({
                                     date,
                                     changeYear,
                                     changeMonth,
                                     decreaseMonth,
                                     increaseMonth,
                                     prevMonthButtonDisabled,
                                     nextMonthButtonDisabled,
                                 }) => (
                <div className="customHeader">
                    <button onClick={decreaseMonth} disabled={prevMonthButtonDisabled}>
                        {"<"}
                    </button>
                    <select
                        value={date.getFullYear()}
                        onChange={({ target: { value } }) => changeYear(Number(value))}
                        className="darkDropdown"
                    >
                        {Array.from({ length: 20 }, (_, i) => {
                            const year = new Date().getFullYear() - 10 + i;
                            return (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            );
                        })}
                    </select>
                    <select
                        value={date.getMonth()}
                        onChange={({ target: { value } }) => changeMonth(Number(value))}
                        className="darkDropdown"
                    >
                        {Array.from({ length: 12 }, (_, i) => (
                            <option key={i} value={i}>
                                {new Date(0, i).toLocaleString("default", { month: "long" })}
                            </option>
                        ))}
                    </select>
                    <button onClick={increaseMonth} disabled={nextMonthButtonDisabled}>
                        {">"}
                    </button>
                </div>
            )}
        />

    );
}
