# MCP Presentations - Remote MCP Server with PowerPoint Creation

This MCP server runs on Cloudflare Workers and provides three tools:
- ✅ **add** - Simple addition calculator
- ✅ **calculate** - Multi-operation calculator (add, subtract, multiply, divide)
- ✅ **create_presentation** - Creates PowerPoint presentations using Python

## Architecture

This project uses **two Cloudflare Workers**:
1. **Main Worker** (TypeScript) - MCP server that handles tool requests
2. **Python Worker** - PowerPoint generation service using python-pptx library

## Get started: 

[![Deploy to Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/cloudflare/ai/tree/main/demos/remote-mcp-authless)

This will deploy your MCP server to a URL like: `remote-mcp-server-authless.<your-account>.workers.dev/sse`

Alternatively, you can use the command line below to get the remote MCP Server created on your local machine:
```bash
npm create cloudflare@latest -- my-mcp-server --template=cloudflare/ai/demos/remote-mcp-authless
```

## 🚀 Quick Deployment

**Important:** Deploy the Python Worker FIRST, then the main worker.

```powershell
# Step 1: Deploy Python Worker
cd python-worker
wrangler deploy

# Step 2: Deploy Main Worker
cd ..
wrangler deploy
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed step-by-step instructions.

## 🎨 Using the PowerPoint Tool

The `create_presentation` tool accepts:
- **title**: Presentation filename
- **slides**: Array of slide objects with layout, title, and bullets

Example:
```json
{
  "title": "My Presentation",
  "slides": [
    {
      "layout": "title",
      "title": "Welcome"
    },
    {
      "layout": "title_and_content",
      "title": "Key Points",
      "bullets": ["Point 1", "Point 2", "Point 3"]
    }
  ]
}
```

## Customizing your MCP Server

To add your own [tools](https://developers.cloudflare.com/agents/model-context-protocol/tools/) to the MCP server, define each tool inside the `init()` method of `src/index.ts` using `this.server.tool(...)`. 

## Connect to Cloudflare AI Playground

You can connect to your MCP server from the Cloudflare AI Playground, which is a remote MCP client:

1. Go to https://playground.ai.cloudflare.com/
2. Enter your deployed MCP server URL (`remote-mcp-server-authless.<your-account>.workers.dev/sse`)
3. You can now use your MCP tools directly from the playground!

## Connect Claude Desktop to your MCP server

You can also connect to your remote MCP server from local MCP clients, by using the [mcp-remote proxy](https://www.npmjs.com/package/mcp-remote). 

To connect to your MCP server from Claude Desktop, follow [Anthropic's Quickstart](https://modelcontextprotocol.io/quickstart/user) and within Claude Desktop go to Settings > Developer > Edit Config.

Update with this configuration:

```json
{
  "mcpServers": {
    "calculator": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "http://localhost:8787/sse"  // or remote-mcp-server-authless.your-account.workers.dev/sse
      ]
    }
  }
}
```

Restart Claude and you should see the tools become available.

## 📚 Documentation

**[📖 Complete Documentation Index](./INDEX.md)** - Find any documentation quickly!

### Quick Access
- **[QUICKREF.md](./QUICKREF.md)** - Quick reference card with common commands
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Detailed deployment guide (step-by-step)
- **[EXAMPLES.md](./EXAMPLES.md)** - PowerPoint usage examples and AI prompts
- **[IMPLEMENTATION.md](./IMPLEMENTATION.md)** - Technical architecture details
- **[SUMMARY.md](./SUMMARY.md)** - Complete project overview
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture and diagrams
- **[TESTING.md](./TESTING.md)** - Comprehensive testing guide
- **[CHANGELOG.md](./CHANGELOG.md)** - Version history and roadmap

## 🛠️ Helper Scripts

- **`deploy.ps1`** - One-command deployment for both workers
- **`dev.ps1`** - Instructions for local development setup 
