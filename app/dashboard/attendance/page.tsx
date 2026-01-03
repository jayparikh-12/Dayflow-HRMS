"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { useAuth } from "@/lib/auth-context"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import type { AttendanceRecord, Employee } from "@/lib/mock-data"
import { ChevronDown } from "lucide-react"

export default function AttendancePage() {
  const { isAdmin } = useAuth()
  const router = useRouter()
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])

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
      setEmployees(JSON.parse(storedEmployees))
    }
  }, [isAdmin, router])

  if (!isAdmin) return null

  const dateRecords = attendanceRecords.filter((rec) => rec.date === selectedDate)
  const presentCount = dateRecords.length
  const absentCount = employees.length - presentCount

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getEmployeeAttendance = (employeeId: string) => {
    return dateRecords.find((rec) => rec.employeeId === employeeId)
  }

  const toggleAttendance = (employeeId: string, employeeName: string, markAsPresent: boolean) => {
    if (markAsPresent) {
      const existingAttendance = getEmployeeAttendance(employeeId)
      if (!existingAttendance) {
        const newRecord: AttendanceRecord = {
          id: Date.now().toString(),
          employeeId,
          employeeName,
          date: selectedDate,
          checkIn: "09:00",
          checkOut: "17:00",
          hoursWorked: 8,
          status: "present",
        }
        const updatedRecords = [...attendanceRecords, newRecord]
        setAttendanceRecords(updatedRecords)
        localStorage.setItem("dayflow_attendance", JSON.stringify(updatedRecords))
      }
    } else {
      const updatedRecords = attendanceRecords.filter(
        (rec) => !(rec.employeeId === employeeId && rec.date === selectedDate),
      )
      setAttendanceRecords(updatedRecords)
      localStorage.setItem("dayflow_attendance", JSON.stringify(updatedRecords))
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Attendance Management</h1>
            <p className="text-muted-foreground mt-1">Monitor employee attendance and working hours</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Employees</p>
                <p className="text-3xl font-bold text-foreground mt-2">{employees.length}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Present Today</p>
                <p className="text-3xl font-bold text-success mt-2">{presentCount}</p>
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
                <p className="text-sm font-medium text-muted-foreground">Absent Today</p>
                <p className="text-3xl font-bold text-danger mt-2">{absentCount}</p>
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
        </div>

        <Card className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
            <div className="flex-1 w-full sm:w-auto">
              <Input
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-muted-foreground">Date:</label>
              <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            {filteredEmployees.map((employee) => {
              const attendance = getEmployeeAttendance(employee.employeeId)
              return (
                <div
                  key={employee.id}
                  className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-primary-foreground">
                        {employee.firstName[0]}
                        {employee.lastName[0]}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">
                        {employee.firstName} {employee.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">{employee.employeeId}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {attendance ? (
                      <>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Check In</p>
                          <p className="font-mono font-medium text-foreground">{attendance.checkIn}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Check Out</p>
                          <p className="font-mono font-medium text-foreground">{attendance.checkOut || "-"}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Hours</p>
                          <p className="font-medium text-foreground">{attendance.hoursWorked?.toFixed(1) || "-"}h</p>
                        </div>
                      </>
                    ) : null}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className={`flex items-center gap-2 ${
                            attendance
                              ? "bg-success/10 hover:bg-success/20 border-success/30"
                              : "bg-danger/10 hover:bg-danger/20 border-danger/30"
                          }`}
                        >
                          <div className={`w-2 h-2 rounded-full ${attendance ? "bg-success" : "bg-danger"}`} />
                          <span className={`text-sm font-medium ${attendance ? "text-success" : "text-danger"}`}>
                            {attendance ? "Present" : "Absent"}
                          </span>
                          <ChevronDown className={`w-4 h-4 ${attendance ? "text-success" : "text-danger"}`} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            toggleAttendance(employee.employeeId, `${employee.firstName} ${employee.lastName}`, true)
                          }
                          className="cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-success" />
                            <span>Mark as Present</span>
                          </div>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            toggleAttendance(employee.employeeId, `${employee.firstName} ${employee.lastName}`, false)
                          }
                          className="cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-danger" />
                            <span>Mark as Absent</span>
                          </div>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
