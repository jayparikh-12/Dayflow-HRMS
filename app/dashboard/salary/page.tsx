"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { useAuth } from "@/lib/auth-context"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import type { Employee } from "@/lib/mock-data"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Edit, Check, X } from "lucide-react"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function SalaryManagementPage() {
  const { isAdmin, updateProfile } = useAuth()
  const router = useRouter()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [editDepartment, setEditDepartment] = useState("")
  const [editSalary, setEditSalary] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    if (!isAdmin) {
      router.push("/dashboard")
      return
    }

    const storedEmployees = localStorage.getItem("dayflow_employees")
    if (storedEmployees) {
      setEmployees(JSON.parse(storedEmployees))
    }
  }, [isAdmin, router])

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.department?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee)
    setEditDepartment(employee.department || "")
    setEditSalary(employee.salary?.toString() || "")
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    if (editingEmployee) {
      await updateProfile(editingEmployee.employeeId, {
        department: editDepartment,
        salary: editSalary ? Number.parseFloat(editSalary) : undefined,
      })

      const storedEmployees = localStorage.getItem("dayflow_employees")
      if (storedEmployees) {
        setEmployees(JSON.parse(storedEmployees))
      }

      setIsDialogOpen(false)
      setEditingEmployee(null)
    }
  }

  if (!isAdmin) return null

  const totalSalaryExpense = employees.reduce((sum, emp) => sum + (emp.salary || 0), 0)
  const avgSalary = employees.length > 0 ? totalSalaryExpense / employees.length : 0

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Salary Management</h1>
            <p className="text-muted-foreground mt-1">Manage employee salaries and departments</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex flex-col gap-2">
              <p className="text-sm text-muted-foreground">Total Salary Expense</p>
              <p className="text-3xl font-bold text-foreground">₹{totalSalaryExpense.toLocaleString()}</p>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex flex-col gap-2">
              <p className="text-sm text-muted-foreground">Average Salary</p>
              <p className="text-3xl font-bold text-foreground">₹{Math.round(avgSalary).toLocaleString()}</p>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex flex-col gap-2">
              <p className="text-sm text-muted-foreground">Total Employees</p>
              <p className="text-3xl font-bold text-foreground">{employees.length}</p>
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search by name or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>
          </div>

          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Salary</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-primary-foreground">
                            {employee.firstName[0]}
                            {employee.lastName[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {employee.firstName} {employee.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">{employee.employeeId}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{employee.department || "Not Assigned"}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={employee.role === "admin" ? "default" : "secondary"}>{employee.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">
                        {employee.salary ? `₹${employee.salary.toLocaleString()}` : "Not Set"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog open={isDialogOpen && editingEmployee?.id === employee.id} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(employee)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>
                              Edit Salary & Department for {employee.firstName} {employee.lastName}
                            </DialogTitle>
                            <DialogDescription>Update employee salary and department information</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label>Department</Label>
                              <Input
                                placeholder="Enter department"
                                value={editDepartment}
                                onChange={(e) => setEditDepartment(e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Salary</Label>
                              <Input
                                type="number"
                                placeholder="Enter salary"
                                value={editSalary}
                                onChange={(e) => setEditSalary(e.target.value)}
                              />
                            </div>
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                              <X className="w-4 h-4 mr-2" />
                              Cancel
                            </Button>
                            <Button onClick={handleSave}>
                              <Check className="w-4 h-4 mr-2" />
                              Save Changes
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredEmployees.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No employees found</p>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  )
}
