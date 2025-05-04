// src/app/pages/Dashboard.tsx
import React from "react";
import Header from "../components/Header";
import TaskCard from "../components/TaskCard";
import type { Task } from "../types";

const Dashboard = () => {
  const tasks: Task[] = [
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
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="p-6">
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800">My Tasks</h2>
          <p className="text-gray-600">Organize and track your tasks easily with Tickway.</p>
        </section>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
