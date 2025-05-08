// src/app/pages/Dashboard.tsx

import React, { useState } from "react";
import Header from "../components/Header";
import TaskCard from "../components/TaskCard";
import Searchbar from "../components/Searchbar";
import type { Task } from "../types";

const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Finish monthly reporting",
      dueDate: "Today",
      stage: "In progress",
      priority: "High",
    },
    {
      id: "2",
      title: "Contract signing",
      dueDate: "Today",
      stage: "In progress",
      priority: "Medium",
    },
    {
      id: "3",
      title: "Market overview keynote",
      dueDate: "Today",
      stage: "In progress",
      priority: "High",
    },
    {
      id: "4",
      title: "Brand proposal",
      dueDate: "Tomorrow",
      stage: "Not started",
      priority: "High",
    },
    {
      id: "5",
      title: "Social media review",
      dueDate: "Tomorrow",
      stage: "In progress",
      priority: "Medium",
    },
    {
      id: "6",
      title: "Report – Week 30",
      dueDate: "Tomorrow",
      stage: "Not started",
      priority: "Low",
    },
    {
      id: "7",
      title: "Order check-ins",
      dueDate: "Wednesday",
      stage: "In progress",
      priority: "Medium",
    },
    {
      id: "8",
      title: "HR reviews",
      dueDate: "Wednesday",
      stage: "Not started",
      priority: "Medium",
    },
    {
      id: "9",
      title: "Report – Week 30",
      dueDate: "Friday",
      stage: "Not started",
      priority: "Low",
    },
  ]);

  //  Filter tasks based on search
  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Delete a task by id
  const handleDeleteTask = (id: string) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="p-6">
        {/* Search input */}
        <Searchbar onSearch={setSearchTerm} />

        {/* Page header */}
        <section className="mb-6 flex items-center justify-between">
  <div>
    <h2 className="text-xl font-semibold text-gray-800">My Tasks</h2>
    <p className="text-gray-600">Organize and track your tasks easily with Tickway.</p>
  </div>
  
</section>
        {/* Task grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <TaskCard key={task.id} task={task} onDelete={handleDeleteTask} />
            ))
          ) : (
            <p className="text-gray-500 col-span-full">No tasks found.</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
