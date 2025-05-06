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
	input: "http://localhost:5200/swagger/v1/swagger.json",
	output: {
		format: false, // "prettier",
		lint: false, // "eslint",
		path: "./api-client",
		clean: true,
	},
	plugins: [
		"@hey-api/client-axios",
		"@hey-api/schemas",
		{
			dates: true,
			name: "@hey-api/transformers",
		},
		{
			enums: "typescript",
			name: "@hey-api/typescript",
		},
		{
			name: "@hey-api/sdk",
			transformer: true,
		},
	],
});
