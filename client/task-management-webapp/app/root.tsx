"use client";

import { Outlet, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./components/ThemeProvider";
import { HelmetProvider } from "react-helmet-async";
import "./app.css";

export default function Root() {
	const [darkMode, setDarkMode] = useState(false);
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
	const [mobileSidebarVisible, setMobileSidebarVisible] = useState(false);
	const location = useLocation();

	// Check if current route is auth page
	const isAuthPage = location.pathname === "/auth";

	// Initialize dark mode from localStorage or system preference
	useEffect(() => {
		const savedTheme = localStorage.getItem("theme");
		const prefersDark = window.matchMedia(
			"(prefers-color-scheme: dark)"
		).matches;
		setDarkMode(savedTheme === "dark" || (!savedTheme && prefersDark));
	}, []);

	// Update theme when darkMode changes
	useEffect(() => {
		localStorage.setItem("theme", darkMode ? "dark" : "light");
		document.documentElement.classList.toggle("dark", darkMode);
	}, [darkMode]);

	const toggleDarkMode = () => {
		setDarkMode((prev) => !prev);
	};

	const toggleMobileSidebar = () => {
		setMobileSidebarVisible((prev) => !prev);
	};

	return (
		<HelmetProvider>
			<AuthProvider>
				<ThemeProvider>
					<div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
						<main
							className={`${!isAuthPage ? "pt-16" : ""} transition-all duration-300 ${!isAuthPage && (sidebarCollapsed ? "md:ml-16" : "md:ml-64")}`}
						>
							<div
								className={`${isAuthPage ? "h-screen" : "container mx-auto px-4 py-8"}`}
							>
								<Outlet />
							</div>
						</main>
					</div>
				</ThemeProvider>
			</AuthProvider>
		</HelmetProvider>
	);
}
