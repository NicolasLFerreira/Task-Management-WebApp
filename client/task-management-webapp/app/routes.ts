import type { RouteObject } from "react-router-dom"

// Define routes using React Router v6 format
const routes: RouteObject[] = [
  {
    path: "/",
    async lazy() {
      const { Component } = await import("./routes/root")
      return { Component }
    },
    children: [
      {
        index: true,
        async lazy() {
          const { default: Component } = await import("./routes/home")
          return { Component }
        },
      },
      {
        path: "login",
        async lazy() {
          const { default: Component } = await import("./routes/login")
          return { Component }
        },
      },
      {
        path: "register",
        async lazy() {
          const { default: Component } = await import("./routes/register")
          return { Component }
        },
      },
      {
        path: "dashboard",
        async lazy() {
          const { default: Component } = await import("./routes/dashboard")
          return { Component }
        },
      },
      {
        path: "tasks",
        async lazy() {
          const { default: Component } = await import("./routes/tasks")
          return { Component }
        },
      },
      {
        path: "tasks/new",
        async lazy() {
          const { default: Component } = await import("./routes/tasks.new")
          return { Component }
        },
      },
      {
        path: "tasks/:id/edit",
        async lazy() {
          const { default: Component } = await import("./routes/tasks.$id.edit")
          return { Component }
        },
      },
      {
        path: "profile",
        async lazy() {
          const { default: Component } = await import("./routes/profile")
          return { Component }
        },
      },
    ],
  },
]

export default routes
