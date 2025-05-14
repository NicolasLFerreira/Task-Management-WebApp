import { defineConfig } from "@hey-api/openapi-ts";

/**
 *
 * Configuration for hey-api/openapi-ts
 *
 * This stuff can mess quite a bit with how the api client code is generated,
 * so make sure to inform AND discuss with the team before applying ANY changes.
 *
 */

export default defineConfig({
	input: "http://localhost:7200/swagger/v1/swagger.json",
	output: {
		format: "prettier",
		lint: "eslint",
		path: "./api-client",
		clean: true,
	},
	plugins: [
		"@hey-api/schemas",
		{
			name: "@hey-api/client-axios",
			baseUrl: "https://localhost:7200/",
		},
		{
			name: "@hey-api/sdk",
			transformer: true,
			asClass: true,
			// client: true,
		},
		{
			name: "@hey-api/typescript",
			enums: "typescript",
		},
		{
			name: "@hey-api/transformers",
			dates: true,
			bigInt: false,
		},
	],
});
