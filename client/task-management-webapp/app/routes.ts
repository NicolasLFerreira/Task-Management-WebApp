import { lazy } from "react"

const Dashboard = lazy(() => import("./pages/Dashboard"))
const Boards = lazy(() => import("./pages/Boards"))
const BoardDetail = lazy(() => import("./pages/BoardDetail"))
const MyTasks = lazy(() => import("./pages/MyTasks"))
const Notifications = lazy(() => import("./pages/Notifications"))
const Search = lazy(() => import("./pages/Search"))
const Chat = lazy(() => import("./pages/Chat"))
const Team = lazy(() => import("./pages/Team"))
const Settings = lazy(() => import("./pages/Settings"))
const Auth = lazy(() => import("./pages/Auth"))

export const routes = [
  {
    path: "/",
    element: Dashboard,
    protected: true,
  },
  {
    path: "/dashboard",
    element: Dashboard,
    protected: true,
  },
  {
    path: "/boards",
    element: Boards,
    protected: true,
  },
  {
    path: "/boards/:boardId",
    element: BoardDetail,
    protected: true,
  },
  {
    path: "/tasks",
    element: MyTasks,
    protected: true,
  },
  {
    path: "/notifications",
    element: Notifications,
    protected: true,
  },
  {
    path: "/search",
    element: Search,
    protected: true,
  },
  {
    path: "/chat",
    element: Chat,
    protected: true,
  },
  {
    path: "/team",
    element: Team,
    protected: true,
  },
  {
    path: "/settings",
    element: Settings,
    protected: true,
  },
  {
    path: "/auth",
    element: Auth,
    protected: false,
  },
]
