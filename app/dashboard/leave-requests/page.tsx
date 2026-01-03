"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { useAuth } from "@/lib/auth-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import type { LeaveRequest } from "@/lib/mock-data"
import { Badge } from "@/components/ui/badge"

export default function LeaveRequestsPage() {
  const { isAdmin } = useAuth()
  const router = useRouter()
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all")

  useEffect(() => {
    if (!isAdmin) {
      router.push("/dashboard")
      return
    }

    const storedLeaves = localStorage.getItem("dayflow_leave_requests")
    if (storedLeaves) {
      setLeaveRequests(JSON.parse(storedLeaves))
    }
  }, [isAdmin, router])

  const handleAction = (leaveId: string, action: "approved" | "rejected") => {
    const updatedRequests = leaveRequests.map((leave) => (leave.id === leaveId ? { ...leave, status: action } : leave))

    setLeaveRequests(updatedRequests)
    localStorage.setItem("dayflow_leave_requests", JSON.stringify(updatedRequests))
  }

  if (!isAdmin) return null

  const filteredRequests = filter === "all" ? leaveRequests : leaveRequests.filter((req) => req.status === filter)

  const pendingCount = leaveRequests.filter((req) => req.status === "pending").length
  const approvedCount = leaveRequests.filter((req) => req.status === "approved").length
  const rejectedCount = leaveRequests.filter((req) => req.status === "rejected").length

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Leave Requests</h1>
          <p className="text-muted-foreground mt-1">Review and approve employee leave requests</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-3xl font-bold text-foreground mt-2">{leaveRequests.length}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-3xl font-bold text-warning mt-2">{pendingCount}</p>
              </div>
              <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Approved</p>
                <p className="text-3xl font-bold text-success mt-2">{approvedCount}</p>
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
                <p className="text-sm font-medium text-muted-foreground">Rejected</p>
                <p className="text-3xl font-bold text-danger mt-2">{rejectedCount}</p>
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
          <div className="flex items-center gap-2 mb-6">
            <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>
              All
            </Button>
            <Button
              variant={filter === "pending" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("pending")}
            >
              Pending
            </Button>
            <Button
              variant={filter === "approved" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("approved")}
            >
              Approved
            </Button>
            <Button
              variant={filter === "rejected" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("rejected")}
            >
              Rejected
            </Button>
          </div>

          <div className="space-y-3">
            {filteredRequests
              .sort((a, b) => new Date(b.appliedOn).getTime() - new Date(a.appliedOn).getTime())
              .map((leave) => (
                <div key={leave.id} className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-primary-foreground">
                            {leave.employeeName.split(" ")[0][0]}
                            {leave.employeeName.split(" ")[1]?.[0]}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{leave.employeeName}</h3>
                          <p className="text-sm text-muted-foreground capitalize">{leave.leaveType} Leave</p>
                        </div>
                        <Badge
                          variant={
                            leave.status === "approved"
                              ? "default"
                              : leave.status === "rejected"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {leave.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground ml-13">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span>
                            {leave.startDate} to {leave.endDate}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span>Applied on {leave.appliedOn}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2 ml-13">{leave.reason}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={leave.status === "approved" ? "default" : "outline"}
                        onClick={() => handleAction(leave.id, "approved")}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant={leave.status === "rejected" ? "destructive" : "outline"}
                        onClick={() => handleAction(leave.id, "rejected")}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            {filteredRequests.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No leave requests found</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
