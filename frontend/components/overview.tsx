"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { useAppData } from "@/providers/app-data-provider"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function Overview() {
  const { isLoading, activityData } = useAppData()

  // Generate data for the chart from the activity data
  const generateChartData = () => {
    if (!activityData) return []
    
    // Create an array of 30 days with the correct data
    return Array.from({ length: 30 }, (_, i) => {
      // Calculate the date (30 days ago to today)
      const date = new Date()
      date.setDate(date.getDate() - (29 - i)) // Start from 29 days ago
      
      return {
        name: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        matches: activityData.matches[i] || 0,
        applications: activityData.applications[i] || 0
      }
    })
  }

  const data = generateChartData()

  if (isLoading) {
    return (
      <div className="h-[300px] w-full">
        <Skeleton className="h-full w-full" />
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 3)} // Show only first 3 chars like "Jan"
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip />
        <Legend />
        <Bar
          dataKey="applications"
          name="Applications"
          fill="#adfa1d"
          radius={[4, 4, 0, 0]}
          barSize={6}
        />
        <Bar
          dataKey="matches"
          name="Matches"
          fill="#0ea5e9"
          radius={[4, 4, 0, 0]}
          barSize={6}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

