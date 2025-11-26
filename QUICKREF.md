# 🚀 Quick Reference Card

## Deployment Commands

```powershell
# Full Deployment (automated)
.\deploy.ps1

# Manual Deployment
cd python-worker ; wrangler deploy ; cd .. ; wrangler deploy

# Local Development
# Terminal 1: cd python-worker ; wrangler dev --port 8788
# Terminal 2: wrangler dev --port 8787
```

## Your URLs After Deployment

```
Main MCP Server: https://mcp-presentations.<YOUR-ACCOUNT>.workers.dev/sse
Python Worker:   https://mcp-presentations-python.<YOUR-ACCOUNT>.workers.dev (internal only)
```

## Three Available Tools

| Tool | Description | Example |
|------|-------------|---------|
| `add` | Add two numbers | `{"a": 5, "b": 3}` → 8 |
| `calculate` | Math operations | `{"operation": "multiply", "a": 6, "b": 7}` → 42 |
| `create_presentation` | Create PowerPoint | See examples below |

## PowerPoint Tool Quick Examples

### Minimal Example
```json
{
  "title": "Test",
  "slides": [{"layout": "title", "title": "Hello"}]
}
```

### Full Example
```json
{
  "title": "My Presentation",
  "slides": [
    {"layout": "title", "title": "Welcome"},
    {
      "layout": "title_and_content",
      "title": "Topics",
      "bullets": ["Item 1", "Item 2", "Item 3"]
    }
  ]
}
```

## Slide Layouts
- `"title"` - Title slide only
- `"title_and_content"` - Title + bullet points
- `"blank"` - Empty slide

## Connect to Claude Desktop

Edit config file: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "presentations": {
      "command": "npx",
      "args": ["mcp-remote", "https://YOUR-WORKER.workers.dev/sse"]
    }
  }
}
```

## Common Commands

```powershell
# View logs
wrangler tail mcp-presentations
wrangler tail mcp-presentations-python

# Check status
wrangler whoami
wrangler deployments list

# Type generation
npm run cf-typegen

# Type checking
npm run type-check
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Python Worker not found" | Deploy python-worker first: `cd python-worker ; wrangler deploy` |
| Type errors | Run `npm run cf-typegen` and `npm install` |
| Login issues | Run `wrangler login` |
| Local dev not working | Run both workers in separate terminals |

## File Structure

```
mcp-presentations/
├── src/index.ts              # Main MCP Worker
├── python-worker/
│   ├── src/index.py          # PowerPoint creation
│   ├── requirements.txt      # Python deps
│   └── wrangler.toml         # Config
├── wrangler.jsonc            # Main config
├── deploy.ps1                # Deploy script
├── DEPLOYMENT.md             # Full guide
├── EXAMPLES.md               # Usage examples
└── SUMMARY.md                # Overview
```

## AI Prompts to Try

1. "Create a 3-slide presentation about AI safety"
2. "Make a sales deck for a new app"
3. "Generate training slides about TypeScript"
4. "Create a status report presentation"

## Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | Project overview |
| `DEPLOYMENT.md` | Step-by-step deployment |
| `EXAMPLES.md` | Usage examples & templates |
| `IMPLEMENTATION.md` | Technical architecture |
| `SUMMARY.md` | Complete overview |
| `QUICKREF.md` | This file |

## Support

- 📚 Docs: Check the documentation files
- 🐛 Debug: Use `wrangler tail` for logs
- 🔧 Config: Check `wrangler.jsonc` and `python-worker/wrangler.toml`

---

**Print this and keep it handy!** 📋
