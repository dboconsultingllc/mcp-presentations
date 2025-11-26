# PowerPoint Presentation Service - Deployment Guide

## 🎯 What You Built

You now have **TWO workers** that work together:
1. **Main MCP Worker** (TypeScript) - Handles MCP protocol and tools
2. **Python Worker** - Creates PowerPoint files using python-pptx

## 📁 Project Structure

```
mcp-presentations/
├── src/
│   └── index.ts                    # Main MCP Worker (calculator + presentation tool)
├── python-worker/
│   ├── src/
│   │   └── index.py               # Python Worker (PowerPoint creation)
│   ├── requirements.txt           # Python dependencies
│   └── wrangler.toml              # Python Worker config
├── wrangler.jsonc                 # Main Worker config
└── package.json
```

## 🚀 Deployment Steps (Like You're 12!)

### Step 1: Deploy the Python Worker FIRST
The Python Worker needs to be deployed first because the main worker depends on it.

```powershell
# Go to the python-worker folder
cd python-worker

# Deploy to Cloudflare
wrangler deploy

# You should see: "Published mcp-presentations-python"
```

**What happens?** Cloudflare uploads your Python code and installs python-pptx library.

### Step 2: Deploy the Main MCP Worker
Now deploy the main TypeScript worker.

```powershell
# Go back to the root folder
cd ..

# Deploy the main worker
wrangler deploy

# You should see: "Published mcp-presentations"
```

**What happens?** Cloudflare uploads your MCP server and connects it to the Python Worker.

### Step 3: Get Your Worker URL
After deploying, you'll see a URL like:
```
https://mcp-presentations.<your-account>.workers.dev
```

Write this down! You'll need it to connect clients.

## 🧪 Testing Your PowerPoint Tool

### Option 1: Test with Cloudflare AI Playground

1. Go to: https://playground.ai.cloudflare.com/
2. Enter your MCP server URL with `/sse`:
   ```
   https://mcp-presentations.<your-account>.workers.dev/sse
   ```
3. You should see 3 tools available:
   - ✅ add
   - ✅ calculate
   - ✅ create_presentation

4. Try creating a presentation:
   ```
   Create a presentation about cats with 3 slides
   ```

### Option 2: Test with Claude Desktop

Edit Claude Desktop config:
```json
{
  "mcpServers": {
    "presentations": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://mcp-presentations.<your-account>.workers.dev/sse"
      ]
    }
  }
}
```

### Option 3: Test Locally During Development

```powershell
# Terminal 1: Run Python Worker locally
cd python-worker
wrangler dev --port 8788

# Terminal 2: Run Main Worker locally
cd ..
wrangler dev --port 8787
```

Then test with: `http://localhost:8787/sse`

## 🔧 How to Use the create_presentation Tool

The tool accepts:
- **title**: Name of your presentation file
- **slides**: Array of slide objects

Each slide can have:
- **layout**: "title", "title_and_content", or "blank"
- **title**: The slide title text
- **bullets**: Array of bullet point strings

### Example Request Structure:
```json
{
  "title": "My Amazing Presentation",
  "slides": [
    {
      "layout": "title",
      "title": "Welcome to My Presentation"
    },
    {
      "layout": "title_and_content",
      "title": "Main Points",
      "bullets": [
        "First important point",
        "Second important point",
        "Third important point"
      ]
    },
    {
      "layout": "title_and_content",
      "title": "Conclusion",
      "bullets": [
        "Summary of key ideas",
        "Thank you!"
      ]
    }
  ]
}
```

## 🐛 Troubleshooting

### "Python Worker service binding not configured"
- Make sure you deployed the Python Worker FIRST
- Check that `wrangler.jsonc` has the service binding (it should!)
- Redeploy the main worker: `wrangler deploy`

### "Failed to create presentation"
- Check Python Worker logs: `wrangler tail mcp-presentations-python`
- Make sure your slides array isn't empty
- Verify the JSON structure is correct

### Local development not working?
- Make sure both workers are running in separate terminals
- Python Worker on port 8788
- Main Worker on port 8787

## 📊 View Logs

```powershell
# Main Worker logs
wrangler tail mcp-presentations

# Python Worker logs
wrangler tail mcp-presentations-python
```

## 🔄 Making Changes

### Update Python Worker:
```powershell
cd python-worker
# Edit src/index.py
wrangler deploy
```

### Update Main Worker:
```powershell
# Edit src/index.ts
wrangler deploy
```

## ✨ What You Can Do Now

1. **Ask AI to create presentations**: "Create a 5-slide presentation about space exploration"
2. **Customize slide layouts**: Title slides, content slides, blank slides
3. **Add as many slides as you want**: No limits!
4. **Generate presentations programmatically**: Perfect for reports, summaries, etc.

## 🎉 Success Checklist

- [ ] Python Worker deployed successfully
- [ ] Main Worker deployed successfully
- [ ] Can see 3 tools in MCP client (add, calculate, create_presentation)
- [ ] Can create a test presentation
- [ ] Presentation downloads as .pptx file

## 🔐 Security Note

This is a public MCP server (no authentication). Anyone with your URL can:
- Use the calculator
- Create presentations

For production use, consider adding authentication to protect your workers.

## 📚 Learn More

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Python Workers](https://developers.cloudflare.com/workers/languages/python/)
- [MCP Protocol](https://modelcontextprotocol.io/)
- [python-pptx Docs](https://python-pptx.readthedocs.io/)

---

**Need Help?** Check the logs with `wrangler tail` and look for error messages!
