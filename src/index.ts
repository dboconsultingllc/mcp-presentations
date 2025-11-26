import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

// Define our MCP agent with tools
export class MyMCP extends McpAgent {
	server = new McpServer({
		name: "Authless Calculator",
		version: "1.0.0",
	});

	async init() {
		// Simple addition tool
		this.server.tool("add", { a: z.number(), b: z.number() }, async ({ a, b }) => ({
			content: [{ type: "text", text: String(a + b) }],
		}));

		// Calculator tool with multiple operations
		this.server.tool(
			"calculate",
			{
				operation: z.enum(["add", "subtract", "multiply", "divide"]),
				a: z.number(),
				b: z.number(),
			},
			async ({ operation, a, b }) => {
				let result: number;
				switch (operation) {
					case "add":
						result = a + b;
						break;
					case "subtract":
						result = a - b;
						break;
					case "multiply":
						result = a * b;
						break;
					case "divide":
						if (b === 0)
							return {
								content: [
									{
										type: "text",
										text: "Error: Cannot divide by zero",
									},
								],
							};
						result = a / b;
						break;
				}
				return { content: [{ type: "text", text: String(result) }] };
			},
		);

		// PowerPoint creation tool
		this.server.tool(
			"create_presentation",
			{
				title: z.string().describe("The title/filename of the presentation"),
				slides: z
					.array(
						z.object({
							layout: z
								.enum(["title", "title_and_content", "blank"])
								.optional()
								.describe("The slide layout type"),
							title: z.string().optional().describe("The slide title"),
							bullets: z
								.array(z.string())
								.optional()
								.describe("Array of bullet points for the slide"),
						}),
					)
					.describe("Array of slide definitions"),
			},
			async ({ title, slides }) => {
				try {
					// Call the Python Worker to create the PowerPoint
					const env = this.env as Env;
					const pythonWorker = env.PYTHON_WORKER;

					if (!pythonWorker) {
						return {
							content: [
								{
									type: "text",
									text: "Error: Python Worker service binding not configured. Please check wrangler.jsonc configuration.",
								},
							],
						};
					}

					const response = await pythonWorker.fetch("https://internal/create", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({ title, slides }),
					});

					if (!response.ok) {
						const errorText = await response.text();
						return {
							content: [
								{
									type: "text",
									text: `Error creating presentation: ${errorText}`,
								},
							],
						};
					}

					// Get the PowerPoint file as a blob
					const blob = await response.blob();
					const arrayBuffer = await blob.arrayBuffer();
					const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

					return {
						content: [
							{
								type: "text",
								text: `✅ PowerPoint presentation "${title}.pptx" created successfully with ${slides.length} slide(s)!\n\nFile size: ${(arrayBuffer.byteLength / 1024).toFixed(2)} KB\n\nThe presentation has been generated. You can download it by requesting the file.`,
							},
						],
					};
				} catch (error) {
					return {
						content: [
							{
								type: "text",
								text: `Error: Failed to create presentation - ${error instanceof Error ? error.message : String(error)}`,
							},
						],
					};
				}
			},
		);
	}
}

export default {
	fetch(request: Request, env: Env, ctx: ExecutionContext) {
		const url = new URL(request.url);

		if (url.pathname === "/sse" || url.pathname === "/sse/message") {
			return MyMCP.serveSSE("/sse").fetch(request, env, ctx);
		}

		if (url.pathname === "/mcp") {
			return MyMCP.serve("/mcp").fetch(request, env, ctx);
		}

		return new Response("Not found", { status: 404 });
	},
};
