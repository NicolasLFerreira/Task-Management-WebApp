"use client"

import { useState } from "react"
import PageContainer from "../components/PageContainer"
import { Search, Plus, X, Mail, Phone, Calendar, MapPin, Briefcase, User, CheckCheck, Clock } from "lucide-react"

// Mock data for team members
const initialTeamMembers = [
  {
    id: 1,
    name: "Alex Johnson",
    role: "Project Manager",
    email: "alex@example.com",
    avatar: "/placeholder.svg?height=40&width=40&query=AJ",
    status: "online",
    tasks: 12,
    completed: 8,
    department: "Management",
    location: "New York",
    phone: "+1 (555) 123-4567",
    joinDate: "Jan 15, 2025",
  },
  {
    id: 2,
    name: "Sarah Williams",
    role: "UI/UX Designer",
    email: "sarah@example.com",
    avatar: "/placeholder.svg?height=40&width=40&query=SW",
    status: "offline",
    tasks: 18,
    completed: 15,
    department: "Design",
    location: "San Francisco",
    phone: "+1 (555) 987-6543",
    joinDate: "Mar 3, 2025",
  },
  {
    id: 3,
    name: "Michael Chen",
    role: "Full Stack Developer",
    email: "michael@example.com",
    avatar: "/placeholder.svg?height=40&width=40&query=MC",
    status: "busy",
    tasks: 24,
    completed: 20,
    department: "Engineering",
    location: "Toronto",
    phone: "+1 (555) 456-7890",
    joinDate: "Feb 12, 2025",
  },
  {
    id: 4,
    name: "Emily Rodriguez",
    role: "QA Engineer",
    email: "emily@example.com",
    avatar: "/placeholder.svg?height=40&width=40&query=ER",
    status: "online",
    tasks: 15,
    completed: 12,
    department: "Quality Assurance",
    location: "Chicago",
    phone: "+1 (555) 234-5678",
    joinDate: "Apr 5, 2025",
  },
  {
    id: 5,
    name: "David Kim",
    role: "Backend Developer",
    email: "david@example.com",
    avatar: "/placeholder.svg?height=40&width=40&query=DK",
    status: "away",
    tasks: 20,
    completed: 16,
    department: "Engineering",
    location: "Seattle",
    phone: "+1 (555) 876-5432",
    joinDate: "Jan 28, 2025",
  },
]

// Add animation keyframes
const fadeInAnimation = `
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fadeIn {
  animation: fadeIn 0.3s ease-out forwards;
}
`

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const statusStyles = {
    online: "bg-gradient-to-r from-green-500 to-green-400 text-white",
    offline: "bg-gradient-to-r from-gray-500 to-gray-400 text-white",
    busy: "bg-gradient-to-r from-red-500 to-red-400 text-white",
    away: "bg-gradient-to-r from-yellow-500 to-yellow-400 text-white",
  }

  const statusDotStyles = {
    online: "bg-white",
    offline: "bg-white",
    busy: "bg-white",
    away: "bg-white",
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium shadow-sm ${statusStyles[status as keyof typeof statusStyles]}`}
    >
      <span className={`w-2 h-2 mr-1.5 rounded-full ${statusDotStyles[status as keyof typeof statusDotStyles]}`}></span>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

// Progress bar component
const ProgressBar = ({ completed, total }: { completed: number; total: number }) => {
  const percentage = Math.round((completed / total) * 100)
  const getColor = () => {
    if (percentage < 30) return "from-red-500 to-red-400"
    if (percentage < 70) return "from-yellow-500 to-yellow-400"
    return "from-green-500 to-green-400"
  }

  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
      <div
        className={`bg-gradient-to-r ${getColor()} h-2.5 rounded-full transition-all duration-500 ease-in-out`}
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  )
}

// Department badge component
const DepartmentBadge = ({ department }: { department: string }) => {
  const deptColors = {
    Management: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    Design: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
    Engineering: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    "Quality Assurance": "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
    Marketing: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    Sales: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  }

  const defaultColor = "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${
        deptColors[department as keyof typeof deptColors] || defaultColor
      }`}
    >
      {department}
    </span>
  )
}

const Team = () => {
  const [teamMembers, setTeamMembers] = useState(initialTeamMembers)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMember, setSelectedMember] = useState<number | null>(null)
  const [showAddMemberForm, setShowAddMemberForm] = useState(false)
  const [newMember, setNewMember] = useState({
    name: "",
    role: "",
    email: "",
    department: "",
    location: "",
  })
  const [activeTab, setActiveTab] = useState("all")

  // Filter team members based on search query and active tab
  const filteredMembers = teamMembers.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase())

    if (activeTab === "all") return matchesSearch
    return matchesSearch && member.status === activeTab
  })

  // Handle adding a new team member
  const handleAddMember = () => {
    if (newMember.name && newMember.role && newMember.email) {
      const newId = Math.max(...teamMembers.map((m) => m.id)) + 1
      const initials = newMember.name
        .split(" ")
        .map((n) => n[0])
        .join("")

      setTeamMembers([
        ...teamMembers,
        {
          id: newId,
          name: newMember.name,
          role: newMember.role,
          email: newMember.email,
          avatar: `/placeholder.svg?height=40&width=40&query=${initials}`,
          status: "offline",
          tasks: 0,
          completed: 0,
          department: newMember.department,
          location: newMember.location,
          phone: "+1 (555) 000-0000",
          joinDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        },
      ])

      setNewMember({
        name: "",
        role: "",
        email: "",
        department: "",
        location: "",
      })

      setShowAddMemberForm(false)
    }
  }

  // Handle removing a team member
  const handleRemoveMember = (id: number) => {
    setTeamMembers(teamMembers.filter((member) => member.id !== id))
    if (selectedMember === id) setSelectedMember(null)
  }

  return (
    <PageContainer>
      <style dangerouslySetInnerHTML={{ __html: fadeInAnimation }} />
      <div className="p-4 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Team Members</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">Manage your team and track their progress</p>
          </div>

          <button
            onClick={() => setShowAddMemberForm(true)}
            className="mt-3 md:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-800"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Team Member
          </button>
        </div>

        {/* Search and filter */}
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Search team members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === "all"
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveTab("online")}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === "online"
                    ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                Online
              </button>
              <button
                onClick={() => setActiveTab("offline")}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === "offline"
                    ? "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                Offline
              </button>
            </div>
          </div>
        </div>

        {/* Team Stats */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-blue-100">Total Members</p>
                <h3 className="text-2xl font-bold mt-1">{teamMembers.length}</h3>
              </div>
              <div className="p-2 bg-blue-400 bg-opacity-30 rounded-lg">
                <User className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-2 text-xs text-blue-100">
              {teamMembers.filter((m) => m.status === "online").length} members online
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-green-100">Completed Tasks</p>
                <h3 className="text-2xl font-bold mt-1">
                  {teamMembers.reduce((sum, member) => sum + member.completed, 0)}
                </h3>
              </div>
              <div className="p-2 bg-green-400 bg-opacity-30 rounded-lg">
                <CheckCheck className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-2 text-xs text-green-100">
              {Math.round(
                (teamMembers.reduce((sum, member) => sum + member.completed, 0) /
                  teamMembers.reduce((sum, member) => sum + member.tasks, 0)) *
                  100,
              )}
              % completion rate
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-purple-100">Departments</p>
                <h3 className="text-2xl font-bold mt-1">{new Set(teamMembers.map((m) => m.department)).size}</h3>
              </div>
              <div className="p-2 bg-purple-400 bg-opacity-30 rounded-lg">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-2 text-xs text-purple-100">
              Across {new Set(teamMembers.map((m) => m.location)).size} locations
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg shadow p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-orange-100">Pending Tasks</p>
                <h3 className="text-2xl font-bold mt-1">
                  {teamMembers.reduce((sum, member) => sum + (member.tasks - member.completed), 0)}
                </h3>
              </div>
              <div className="p-2 bg-orange-400 bg-opacity-30 rounded-lg">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-2 text-xs text-orange-100">
              Assigned across {teamMembers.filter((m) => m.tasks > m.completed).length} members
            </div>
          </div>
        </div>

        {/* Team members grid/list */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <img
                      src={member.avatar || "/placeholder.svg"}
                      alt={member.name}
                      className="h-10 w-10 rounded-full mr-3 border-2 border-white shadow-sm"
                    />
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">{member.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{member.role}</p>
                    </div>
                  </div>
                  <StatusBadge status={member.status} />
                </div>

                <div className="mt-3">
                  <DepartmentBadge department={member.department} />
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500 dark:text-gray-400">Task Completion</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {member.completed}/{member.tasks}
                    </span>
                  </div>
                  <ProgressBar completed={member.completed} total={member.tasks} />
                </div>

                <div className="mt-4 flex justify-between">
                  <button
                    onClick={() => setSelectedMember(member.id === selectedMember ? null : member.id)}
                    className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
                  >
                    View Details
                  </button>

                  <div className="relative">
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded details */}
              {selectedMember === member.id && (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 border-t border-gray-200 dark:border-gray-600 animate-fadeIn">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">{member.email}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">{member.phone}</span>
                    </div>
                    <div className="flex items-center">
                      <Briefcase className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">{member.department}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">{member.location}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">Joined: {member.joinDate}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* No results message */}
        {filteredMembers.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
            <p className="text-gray-500 dark:text-gray-400">No team members found matching your criteria.</p>
          </div>
        )}

        {/* Add member modal */}
        {showAddMemberForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Add Team Member</h3>
                  <button
                    onClick={() => setShowAddMemberForm(false)}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      value={newMember.name}
                      onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    />
                  </div>

                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Role
                    </label>
                    <input
                      type="text"
                      id="role"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      value={newMember.role}
                      onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      value={newMember.email}
                      onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                    />
                  </div>

                  <div>
                    <label htmlFor="department" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Department
                    </label>
                    <input
                      type="text"
                      id="department"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      value={newMember.department}
                      onChange={(e) => setNewMember({ ...newMember, department: e.target.value })}
                    />
                  </div>

                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Location
                    </label>
                    <input
                      type="text"
                      id="location"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      value={newMember.location}
                      onChange={(e) => setNewMember({ ...newMember, location: e.target.value })}
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddMemberForm(false)}
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddMember}
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-800"
                  >
                    Add Member
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  )
}

export default Team
