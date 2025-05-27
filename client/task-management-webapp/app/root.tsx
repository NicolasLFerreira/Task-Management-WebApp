"use client";

import { Outlet } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./components/ThemeProvider";
import { HelmetProvider } from "react-helmet-async";
import "./app.css";

export default function Root() {
	return (
		<HelmetProvider>
			<AuthProvider>
				<ThemeProvider>
					<Outlet />
				</ThemeProvider>
			</AuthProvider>
		</HelmetProvider>
	);
}
