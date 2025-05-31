"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import {
	CheckSquare,
	Bell,
	Search,
	Settings,
	ChevronLeft,
	ChevronRight,
	MessageSquare,
	Moon,
	Sun,
	Users,
	ChartNoAxesColumn,
	LucideTable,
} from "lucide-react";

type SidebarProps = {
	darkMode: boolean;
	toggleDarkMode: () => void;
	onCollapsedChange: (collapsed: boolean) => void;
	initialCollapsed?: boolean;
	mobileVisible?: boolean;
	onMobileClose?: () => void;
};

const Sidebar = ({
	darkMode,
	toggleDarkMode,
	onCollapsedChange,
	initialCollapsed = false,
	mobileVisible,
	onMobileClose,
}: SidebarProps) => {
	const [collapsed, setCollapsed] = useState(initialCollapsed || false);
	const [isMobile, setIsMobile] = useState(false);
	const navigate = useNavigate();
	const location = useLocation();

	useEffect(() => {
		const checkScreenSize = () => {
			setIsMobile(window.innerWidth < 768);
			if (window.innerWidth < 768) {
				setCollapsed(true);
			}
		};

		checkScreenSize();
		window.addEventListener("resize", checkScreenSize);

		return () => {
			window.removeEventListener("resize", checkScreenSize);
		};
	}, []);

	const toggleSidebar = () => {
		const newCollapsedState = !collapsed;
		setCollapsed(newCollapsedState);
		onCollapsedChange(newCollapsedState);
	};

	const navigateTo = (path: string) => {
		navigate(path);
		if (isMobile && onMobileClose) {
			onMobileClose();
		}
	};

	return (
		<div
			className={`${
				collapsed ? "w-16" : "w-64"
			} fixed left-0 top-16 h-[calc(100vh-64px)] bg-white dark:bg-gray-800 transition-all duration-300 shadow-md z-20 ${
				isMobile
					? mobileVisible
						? "translate-x-0"
						: "-translate-x-full"
					: "translate-x-0"
			}`}
		>
			{isMobile && mobileVisible && (
				<div
					className="fixed inset-0 bg-black/50 z-10"
					onClick={onMobileClose}
					aria-hidden="true"
				/>
			)}
			<button
				onClick={toggleSidebar}
				className={`absolute -right-3 top-6 bg-teal-600 text-white rounded-full p-1 shadow-md ${
					isMobile && collapsed ? "translate-x-full" : ""
				}`}
				aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
			>
				{collapsed ? (
					<ChevronRight size={16} />
				) : (
					<ChevronLeft size={16} />
				)}
			</button>

			<nav className="py-4" aria-label="Main navigation">
				<ul className="space-y-2 px-2">
					<NavItem
						path="/dashboard"
						currentPath={location.pathname}
						onClick={() => navigateTo("/dashboard")}
						icon={<ChartNoAxesColumn size={20} />}
						label="Dashboard"
						collapsed={collapsed}
					/>
					<NavItem
						path="/boards"
						currentPath={location.pathname}
						onClick={() => navigateTo("/boards")}
						icon={<LucideTable size={20} />}
						label="Boards"
						collapsed={collapsed}
					/>
					<NavItem
						path="/tasks"
						currentPath={location.pathname}
						onClick={() => navigateTo("/tasks")}
						icon={<CheckSquare size={20} />}
						label="My Tasks"
						collapsed={collapsed}
					/>
					<NavItem
						path="/notifications"
						currentPath={location.pathname}
						onClick={() => navigateTo("/notifications")}
						icon={<Bell size={20} />}
						label="Notifications"
						collapsed={collapsed}
					/>
					<NavItem
						path="/search"
						currentPath={location.pathname}
						onClick={() => navigateTo("/search")}
						icon={<Search size={20} />}
						label="Search"
						collapsed={collapsed}
					/>
					<NavItem
						path="/chat"
						currentPath={location.pathname}
						onClick={() => navigateTo("/chat")}
						icon={<MessageSquare size={20} />}
						label="Chat"
						collapsed={collapsed}
					/>
					<NavItem
						path="/team"
						currentPath={location.pathname}
						onClick={() => navigateTo("/team")}
						icon={<Users size={20} />}
						label="Team"
						collapsed={collapsed}
					/>
					<NavItem
						path="/settings"
						currentPath={location.pathname}
						onClick={() => navigateTo("/settings")}
						icon={<Settings size={20} />}
						label="Settings"
						collapsed={collapsed}
					/>
				</ul>
			</nav>

			<div className="absolute bottom-4 left-0 right-0 px-4">
				<button
					onClick={toggleDarkMode}
					className={`flex items-center ${
						collapsed
							? "justify-center w-full"
							: "justify-between w-full"
					} p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
					aria-label={
						darkMode
							? "Switch to light mode"
							: "Switch to dark mode"
					}
				>
					{darkMode ? <Sun size={20} /> : <Moon size={20} />}
					{!collapsed && (
						<span className="ml-3">
							{darkMode ? "Light Mode" : "Dark Mode"}
						</span>
					)}
				</button>
			</div>
		</div>
	);
};

type NavItemProps = {
	path: string;
	currentPath: string;
	onClick: () => void;
	icon: React.ReactNode;
	label: string;
	collapsed: boolean;
};

const NavItem = ({
	path,
	currentPath,
	onClick,
	icon,
	label,
	collapsed,
}: NavItemProps) => {
	const isActive = currentPath === path;

	return (
		<li>
			<button
				onClick={onClick}
				className={`flex items-center w-full ${
					collapsed ? "justify-center" : "justify-start"
				} p-2 rounded-md transition-colors ${
					isActive
						? "bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-200"
						: "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
				}`}
				aria-current={isActive ? "page" : undefined}
			>
				<span className="flex-shrink-0" aria-hidden="true">
					{icon}
				</span>
				{!collapsed && <span className="ml-3">{label}</span>}
			</button>
		</li>
	);
};

export default Sidebar;
