import type { CreateClientConfig } from "../api-client/client.gen";

export const createClientConfig: CreateClientConfig = (config) => ({
	...config,
	baseUrl: "https://localhost:7200/",
	auth: () => localStorage.getItem("auth_token")?.toString(),
});
