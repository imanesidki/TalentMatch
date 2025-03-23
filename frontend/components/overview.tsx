"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

const data = [
  {
    name: "Jan 1",
    total: 12,
  },
  {
    name: "Jan 2",
    total: 18,
  },
  {
    name: "Jan 3",
    total: 24,
  },
  {
    name: "Jan 4",
    total: 30,
  },
  {
    name: "Jan 5",
    total: 22,
  },
  {
    name: "Jan 6",
    total: 28,
  },
  {
    name: "Jan 7",
    total: 36,
  },
  {
    name: "Jan 8",
    total: 42,
  },
  {
    name: "Jan 9",
    total: 48,
  },
  {
    name: "Jan 10",
    total: 52,
  },
  {
    name: "Jan 11",
    total: 58,
  },
  {
    name: "Jan 12",
    total: 64,
  },
]

export function Overview() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
        <Tooltip />
        <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

