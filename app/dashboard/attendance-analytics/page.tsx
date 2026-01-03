"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { useAuth } from "@/lib/auth-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import type { AttendanceRecord, Employee } from "@/lib/mock-data"
import { ChevronLeft, ChevronRight } from "lucide-react"

export default function AttendanceAnalyticsPage() {
  const { isAdmin } = useAuth()
  const router = useRouter()
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("")
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getWeekStart(new Date()))

  useEffect(() => {
    if (!isAdmin) {
      router.push("/dashboard")
      return
    }

    const storedAttendance = localStorage.getItem("dayflow_attendance")
    if (storedAttendance) {
      setAttendanceRecords(JSON.parse(storedAttendance))
    }

    const storedEmployees = localStorage.getItem("dayflow_employees")
    if (storedEmployees) {
      const employeeList = JSON.parse(storedEmployees)
      setEmployees(employeeList)
      if (employeeList.length > 0 && !selectedEmployeeId) {
        setSelectedEmployeeId(employeeList[0].employeeId)
      }
    }
  }, [isAdmin, router])

  if (!isAdmin) return null

  function getWeekStart(date: Date): Date {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Monday as start of week
    return new Date(d.setDate(diff))
  }

  function getWeekDates(startDate: Date): Date[] {
    const dates = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      dates.push(date)
    }
    return dates
  }

  function formatDate(date: Date): string {
    return date.toISOString().split("T")[0]
  }

  function formatDisplayDate(date: Date): string {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  function getDayName(date: Date): string {
    return date.toLocaleDateString("en-US", { weekday: "short" })
  }

  const weekDates = getWeekDates(currentWeekStart)
  const selectedEmployee = employees.find((emp) => emp.employeeId === selectedEmployeeId)

  const weekAttendance = weekDates.map((date) => {
    const dateStr = formatDate(date)
    const record = attendanceRecords.find((rec) => rec.employeeId === selectedEmployeeId && rec.date === dateStr)
    return {
      date: dateStr,
      displayDate: formatDisplayDate(date),
      dayName: getDayName(date),
      status: record ? "present" : "absent",
      checkIn: record?.checkIn,
      checkOut: record?.checkOut,
      hoursWorked: record?.hoursWorked,
    }
  })

  const presentDays = weekAttendance.filter((day) => day.status === "present").length
  const absentDays = 7 - presentDays
  const attendancePercentage = ((presentDays / 7) * 100).toFixed(1)
  const totalHours = weekAttendance.reduce((sum, day) => sum + (day.hoursWorked || 0), 0)

  const goToPreviousWeek = () => {
    const newStart = new Date(currentWeekStart)
    newStart.setDate(newStart.getDate() - 7)
    setCurrentWeekStart(newStart)
  }

  const goToNextWeek = () => {
    const newStart = new Date(currentWeekStart)
    newStart.setDate(newStart.getDate() + 7)
    setCurrentWeekStart(newStart)
  }

  const goToCurrentWeek = () => {
    setCurrentWeekStart(getWeekStart(new Date()))
  }

  const weekEndDate = new Date(currentWeekStart)
  weekEndDate.setDate(weekEndDate.getDate() + 6)

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Weekly Attendance Analytics</h1>
            <p className="text-muted-foreground mt-1">Analyze employee attendance patterns by week</p>
          </div>
        </div>

        {/* Employee Selection */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1 w-full sm:w-auto">
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Select Employee</label>
              <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                <SelectTrigger className="w-full sm:w-[300px]">
                  <SelectValue placeholder="Choose an employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.employeeId} value={emp.employeeId}>
                      {emp.firstName} {emp.lastName} ({emp.employeeId})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Week Navigation */}
            <div className="flex items-center gap-2">
              <Button onClick={goToPreviousWeek} variant="outline" size="icon">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="text-center min-w-[200px]">
                <p className="text-sm font-medium text-foreground">
                  {currentWeekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} -{" "}
                  {weekEndDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              </div>
              <Button onClick={goToNextWeek} variant="outline" size="icon">
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button onClick={goToCurrentWeek} variant="outline" size="sm" className="ml-2 bg-transparent">
                Today
              </Button>
            </div>
          </div>
        </Card>

        {/* Statistics Cards */}
        {selectedEmployee && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Present Days</p>
                    <p className="text-3xl font-bold text-success mt-2">{presentDays}</p>
                  </div>
                  <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Absent Days</p>
                    <p className="text-3xl font-bold text-danger mt-2">{absentDays}</p>
                  </div>
                  <div className="w-12 h-12 bg-danger/10 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Attendance Rate</p>
                    <p className="text-3xl font-bold text-primary mt-2">{attendancePercentage}%</p>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Hours</p>
                    <p className="text-3xl font-bold text-foreground mt-2">{totalHours.toFixed(1)}h</p>
                  </div>
                  <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
              </Card>
            </div>

            {/* Daily Breakdown */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Daily Breakdown</h2>
              <div className="space-y-3">
                {weekAttendance.map((day, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      day.status === "present" ? "bg-success/5 border-success/20" : "bg-danger/5 border-danger/20"
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="text-center min-w-[60px]">
                        <p className="text-xs font-medium text-muted-foreground">{day.dayName}</p>
                        <p className="text-sm font-semibold text-foreground">{day.displayDate}</p>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          day.status === "present" ? "bg-success text-white" : "bg-danger text-white"
                        }`}
                      >
                        {day.status === "present" ? "Present" : "Absent"}
                      </div>
                    </div>

                    {day.status === "present" && (
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Check In</p>
                          <p className="font-mono font-medium text-foreground">{day.checkIn}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Check Out</p>
                          <p className="font-mono font-medium text-foreground">{day.checkOut || "-"}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Hours</p>
                          <p className="font-medium text-foreground">{day.hoursWorked?.toFixed(1) || "0"}h</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
