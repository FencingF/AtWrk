import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import React from "react";

export default function StrengthGraph({ data }) {
    if (!data || data.length === 0) {
        return (
            <div className="throbbingLoadingMessage">
                Input data to start graphing.
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fill: "#D0D0D9" }} />
                <YAxis tick={{ fill: "#D0D0D9" }} />
                <Tooltip />
                <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#645cc8"
                    strokeWidth={3}
                    dot={false}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}
