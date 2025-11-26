import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import pptxgen from "pptxgenjs";

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
					// Create a new PowerPoint presentation using pptxgenjs
					const pres = new pptxgen();

					// Add slides based on the configuration
					for (const slideConfig of slides) {
						const slide = pres.addSlide();
						const layout = slideConfig.layout || "title_and_content";

						if (layout === "title" && slideConfig.title) {
							// Title slide - centered large text
							slide.addText(slideConfig.title, {
								x: 0.5,
								y: "40%",
								w: "90%",
								h: 1.5,
								fontSize: 44,
								bold: true,
								align: "center",
								valign: "middle",
							});
						} else if (layout === "title_and_content") {
							// Title and content slide
							if (slideConfig.title) {
								slide.addText(slideConfig.title, {
									x: 0.5,
									y: 0.5,
									w: "90%",
									h: 0.75,
									fontSize: 32,
									bold: true,
									color: "363636",
								});
							}

							// Add bullets if provided
							if (slideConfig.bullets && slideConfig.bullets.length > 0) {
								slide.addText(
									slideConfig.bullets.map((bullet) => ({ text: bullet, options: { bullet: true } })),
									{
										x: 0.5,
										y: 1.5,
										w: "90%",
										h: "70%",
										fontSize: 20,
										color: "363636",
									},
								);
							}
						}
						// blank layout - just leave the slide empty
					}

					// Generate the PowerPoint file
					const output = (await pres.write({ outputType: "base64" })) as string;
					const fileSize = Math.round((output.length * 3) / 4 / 1024); // Approximate size in KB

					return {
						content: [
							{
								type: "text",
								text: `✅ PowerPoint presentation "${title}.pptx" created successfully with ${slides.length} slide(s)!\n\nFile size: ~${fileSize} KB\n\nThe presentation has been generated.`,
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

		// Tool to get URL for a stored presentation
		this.server.tool(
			"get_presentation_url",
			{
				filename: z.string().describe("The filename of the stored presentation"),
			},
			async ({ filename }) => {
				try {
					const r2 = (this.env as Env).PRESENTATIONS;
					const object = await r2.head(filename);

					if (!object) {
						return {
							content: [
								{
									type: "text",
									text: `Error: Presentation "${filename}" not found in storage.`,
								},
							],
						};
					}

					const downloadUrl = `${(this.env as Env).WORKER_URL}/download/${filename}`;
					const fileSizeKB = Math.round((object.size || 0) / 1024);

					return {
						content: [
							{
								type: "text",
								text: `📎 Presentation File: ${filename}\n\nOriginal Title: ${object.customMetadata?.originalTitle || "Unknown"}\nCreated: ${object.customMetadata?.createdAt || "Unknown"}\nSlides: ${object.customMetadata?.slideCount || "Unknown"}\nFile Size: ${fileSizeKB} KB\n\nDownload URL: ${downloadUrl}`,
							},
						],
					};
				} catch (error) {
					return {
						content: [
							{
								type: "text",
								text: `Error: Failed to retrieve presentation URL - ${error instanceof Error ? error.message : String(error)}`,
							},
						],
					};
				}
			},
		);

		// Tool to list all stored presentations
		this.server.tool(
			"list_presentations",
			{
				limit: z.number().optional().describe("Maximum number of presentations to list (default: 10)"),
			},
			async ({ limit }) => {
				try {
					const r2 = (this.env as Env).PRESENTATIONS;
					const listed = await r2.list({ limit: limit || 10 });

					if (listed.objects.length === 0) {
						return {
							content: [
								{
									type: "text",
									text: "No presentations found in storage.",
								},
							],
						};
					}

					const presentationList = listed.objects
						.map((obj: R2Object) => {
							const fileSizeKB = Math.round(obj.size / 1024);
							const downloadUrl = `${(this.env as Env).WORKER_URL}/download/${obj.key}`;
							return `• ${obj.customMetadata?.originalTitle || obj.key}\n  Filename: ${obj.key}\n  Created: ${obj.customMetadata?.createdAt || obj.uploaded.toISOString()}\n  Size: ${fileSizeKB} KB\n  Slides: ${obj.customMetadata?.slideCount || "Unknown"}\n  URL: ${downloadUrl}`;
						})
						.join("\n\n");

					return {
						content: [
							{
								type: "text",
								text: `📋 Stored Presentations (${listed.objects.length}):\n\n${presentationList}`,
							},
						],
					};
				} catch (error) {
					return {
						content: [
							{
								type: "text",
								text: `Error: Failed to list presentations - ${error instanceof Error ? error.message : String(error)}`,
							},
						],
					};
				}
			},
		);
	}
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext) {
		const url = new URL(request.url);

		if (url.pathname === "/sse" || url.pathname === "/sse/message") {
			return MyMCP.serveSSE("/sse").fetch(request, env, ctx);
		}

		if (url.pathname === "/mcp") {
			return MyMCP.serve("/mcp").fetch(request, env, ctx);
		}

		// Handle file downloads from R2
		if (url.pathname.startsWith("/download/")) {
			const filename = url.pathname.substring("/download/".length);
			if (!filename) {
				return new Response("Filename required", { status: 400 });
			}

			const object = await env.PRESENTATIONS.get(filename);
			if (!object) {
				return new Response("File not found", { status: 404 });
			}

			const headers = new Headers();
			object.writeHttpMetadata(headers);
			headers.set("Content-Disposition", `attachment; filename="${object.customMetadata?.originalTitle || filename}"`
			);

			return new Response(object.body, { headers });
		}

		return new Response("Not found", { status: 404 });
	},
};