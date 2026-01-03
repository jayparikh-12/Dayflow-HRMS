"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { useAuth } from "@/lib/auth-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import type { AttendanceRecord } from "@/lib/mock-data"

export default function MyAttendancePage() {
  const { user } = useAuth()
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!user) return

    const storedAttendance = localStorage.getItem("dayflow_attendance")
    const allRecords = storedAttendance ? JSON.parse(storedAttendance) : []
    const userRecords = allRecords.filter((rec: AttendanceRecord) => rec.employeeId === user.employeeId)
    setAttendanceRecords(userRecords)

    const today = new Date().toISOString().split("T")[0]
    const todayRec = userRecords.find((rec: AttendanceRecord) => rec.date === today)
    setTodayRecord(todayRec || null)
  }, [user])

  const handleCheckIn = () => {
    if (!user) return

    const today = new Date().toISOString().split("T")[0]
    const time = new Date().toTimeString().split(" ")[0].substring(0, 5)

    const newRecord: AttendanceRecord = {
      id: Date.now().toString(),
      employeeId: user.employeeId,
      date: today,
      checkIn: time,
      status: "present",
    }

    const storedAttendance = localStorage.getItem("dayflow_attendance")
    const allRecords = storedAttendance ? JSON.parse(storedAttendance) : []
    const updatedRecords = [...allRecords, newRecord]

    localStorage.setItem("dayflow_attendance", JSON.stringify(updatedRecords))
    setTodayRecord(newRecord)
    setAttendanceRecords(updatedRecords.filter((rec: AttendanceRecord) => rec.employeeId === user.employeeId))
  }

  const handleCheckOut = () => {
    if (!user || !todayRecord) return

    const time = new Date().toTimeString().split(" ")[0].substring(0, 5)
    const checkInTime = new Date(`2000-01-01 ${todayRecord.checkIn}`)
    const checkOutTime = new Date(`2000-01-01 ${time}`)
    const hoursWorked = Math.round(((checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60)) * 10) / 10

    const updatedRecord = {
      ...todayRecord,
      checkOut: time,
      hoursWorked,
    }

    const storedAttendance = localStorage.getItem("dayflow_attendance")
    const allRecords = storedAttendance ? JSON.parse(storedAttendance) : []
    const updatedRecords = allRecords.map((rec: AttendanceRecord) => (rec.id === todayRecord.id ? updatedRecord : rec))

    localStorage.setItem("dayflow_attendance", JSON.stringify(updatedRecords))
    setTodayRecord(updatedRecord)
    setAttendanceRecords(updatedRecords.filter((rec: AttendanceRecord) => rec.employeeId === user.employeeId))
  }

  if (!user) return null

  const totalDays = attendanceRecords.length
  const avgHours = attendanceRecords.reduce((sum, rec) => sum + (rec.hoursWorked || 0), 0) / (totalDays || 1)

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Attendance</h1>
          <p className="text-muted-foreground mt-1">Track your check-in and check-out times</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-6 lg:col-span-2">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Current Time</p>
              <p className="text-5xl font-bold text-foreground font-mono">
                {currentTime.toTimeString().split(" ")[0].substring(0, 5)}
              </p>
              <p className="text-sm text-muted-foreground mt-2">{currentTime.toDateString()}</p>

              <div className="mt-8 space-y-4">
                {!todayRecord ? (
                  <div>
                    <Button size="lg" className="w-full max-w-xs" onClick={handleCheckIn}>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                        />
                      </svg>
                      Check In
                    </Button>
                    <p className="text-sm text-muted-foreground mt-2">Click to mark your attendance</p>
                  </div>
                ) : todayRecord.checkOut ? (
                  <div>
                    <div className="bg-success/10 border border-success/20 rounded-lg p-4 mb-4">
                      <p className="text-success font-medium">You have checked out for today</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                      <div className="bg-muted/50 rounded-lg p-4">
                        <p className="text-xs text-muted-foreground mb-1">Check In</p>
                        <p className="text-2xl font-bold text-foreground font-mono">{todayRecord.checkIn}</p>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-4">
                        <p className="text-xs text-muted-foreground mb-1">Check Out</p>
                        <p className="text-2xl font-bold text-foreground font-mono">{todayRecord.checkOut}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-4">
                      Hours worked: <span className="font-bold text-foreground">{todayRecord.hoursWorked}h</span>
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-4">
                      <p className="text-primary font-medium">You are checked in</p>
                      <p className="text-sm text-muted-foreground mt-1">Checked in at {todayRecord.checkIn}</p>
                    </div>
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full max-w-xs bg-transparent"
                      onClick={handleCheckOut}
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      Check Out
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Card>

          <div className="space-y-4">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground">Total Days</p>
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-foreground">{totalDays}</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground">Avg Hours/Day</p>
                <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-foreground">{avgHours.toFixed(1)}h</p>
            </Card>
          </div>
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-bold text-foreground mb-4">Attendance History</h2>
          <div className="space-y-2">
            {attendanceRecords
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0, 10)
              .map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${record.status === "present" ? "bg-success" : "bg-danger"}`}
                    />
                    <div>
                      <p className="font-medium text-foreground">{record.date}</p>
                      <p className="text-sm text-muted-foreground capitalize">{record.status}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div>
                      <p className="text-muted-foreground">Check In</p>
                      <p className="font-mono font-medium text-foreground">{record.checkIn}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Check Out</p>
                      <p className="font-mono font-medium text-foreground">{record.checkOut || "-"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Hours</p>
                      <p className="font-medium text-foreground">{record.hoursWorked?.toFixed(1) || "-"}h</p>
                    </div>
                  </div>
                </div>
              ))}
            {attendanceRecords.length === 0 && (
              <div className="text-center py-12">
                <svg
                  className="w-16 h-16 text-muted-foreground mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-muted-foreground">No attendance records yet</p>
                <p className="text-sm text-muted-foreground mt-1">Check in to start tracking your attendance</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
