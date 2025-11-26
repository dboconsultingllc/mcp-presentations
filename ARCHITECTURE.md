# Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         MCP Clients                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │   Claude    │  │     AI      │  │  Custom MCP Clients     │ │
│  │   Desktop   │  │  Playground │  │   (Your own apps)       │ │
│  └──────┬──────┘  └──────┬──────┘  └───────────┬─────────────┘ │
└─────────┼─────────────────┼─────────────────────┼───────────────┘
          │                 │                     │
          └─────────────────┴─────────────────────┘
                            │
                            │ HTTPS /sse endpoint
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│              Cloudflare Workers - Main MCP Server                │
│                  (mcp-presentations worker)                      │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  TypeScript Worker                                        │  │
│  │  ┌─────────────────┐  ┌──────────────────┐  ┌──────────┐│  │
│  │  │   add tool      │  │  calculate tool  │  │  create_ ││  │
│  │  │   (a + b)       │  │  (+ - * /)       │  │  present ││  │
│  │  └─────────────────┘  └──────────────────┘  │  ation   ││  │
│  │                                              └─────┬────┘│  │
│  │  env.PYTHON_WORKER ────────────────────────────────┘     │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────┬───────────────────────┘
                                          │
                                          │ Service Binding
                                          │ (Internal, Zero-latency)
                                          ↓
┌─────────────────────────────────────────────────────────────────┐
│         Cloudflare Workers - Python Worker                       │
│           (mcp-presentations-python worker)                      │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Python Worker                                            │  │
│  │  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │  on_fetch(request, env)                             │ │  │
│  │  │  ├─ Parse JSON request                              │ │  │
│  │  │  ├─ Create Presentation()                           │ │  │
│  │  │  ├─ Add slides with layouts                         │ │  │
│  │  │  ├─ Add titles and bullets                          │ │  │
│  │  │  ├─ Save to BytesIO                                 │ │  │
│  │  │  └─ Return .pptx binary                             │ │  │
│  │  └─────────────────────────────────────────────────────┘ │  │
│  │                                                             │  │
│  │  Dependencies:                                              │  │
│  │  └─ python-pptx 1.0.2                                      │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

```
User asks AI: "Create a presentation about cats"
        ↓
AI formats request as MCP tool call
        ↓
{
  "tool": "create_presentation",
  "params": {
    "title": "Cats",
    "slides": [...]
  }
}
        ↓
Main MCP Worker receives tool call
        ↓
Validates parameters with Zod schema
        ↓
Calls Python Worker via service binding:
POST https://internal/create
{
  "title": "Cats",
  "slides": [...]
}
        ↓
Python Worker processes request
        ↓
Creates PowerPoint with python-pptx
        ↓
Returns .pptx binary data
        ↓
Main Worker receives response
        ↓
Calculates file size
        ↓
Returns success message to MCP client
{
  "content": [{
    "type": "text",
    "text": "✅ PowerPoint created!"
  }]
}
        ↓
AI shows success message to user
```

## Deployment Architecture

```
Local Development                      Production Deployment
─────────────────                      ─────────────────────

Terminal 1:                            Cloudflare Edge Network
┌─────────────────────┐               ┌──────────────────────────┐
│ wrangler dev        │               │   Global Distribution    │
│ Python Worker       │               │   ┌─────┐  ┌─────┐      │
│ Port: 8788          │   ──────>     │   │ NA  │  │ EU  │      │
└─────────────────────┘               │   └─────┘  └─────┘      │
                                      │   ┌─────┐  ┌─────┐      │
Terminal 2:                            │   │ ASIA│  │ OCE │      │
┌─────────────────────┐               │   └─────┘  └─────┘      │
│ wrangler dev        │               └──────────────────────────┘
│ Main MCP Worker     │                          │
│ Port: 8787          │                          │
└─────────────────────┘                          │
         │                                       │
         │                                       │
         ↓                                       ↓
Connect: localhost:8787/sse         Connect: your-worker.workers.dev/sse
```

## File Structure

```
mcp-presentations/
│
├── 📄 wrangler.jsonc ──────────────┐
│   (Main Worker config)            │
│   - Durable Objects               │ Connects
│   - Service Binding ──────────────┤ via
│     └─> PYTHON_WORKER             │ binding
│                                    │
├── 📁 src/                          │
│   └── 📄 index.ts                 │
│       (Main MCP Worker)            │
│       - McpAgent class             │
│       - add tool                   │
│       - calculate tool             │
│       - create_presentation ───────┘
│         └─> calls env.PYTHON_WORKER
│
├── 📁 python-worker/ ───────────────────┐
│   │                                    │ Receives
│   ├── 📄 wrangler.toml                │ requests
│   │   (Python Worker config)          │ from
│   │   - Python runtime                │ Main
│   │   - requirements.txt              │ Worker
│   │                                    │
│   ├── 📄 requirements.txt             │
│   │   └─> python-pptx==1.0.2         │
│   │                                    │
│   └── 📁 src/                         │
│       └── 📄 index.py ────────────────┘
│           (PowerPoint creation)
│           - on_fetch() handler
│           - Presentation() creation
│           - Slide layouts
│           - BytesIO output
│
├── 📚 Documentation/
│   ├── 📄 README.md (Overview)
│   ├── 📄 DEPLOYMENT.md (How to deploy)
│   ├── 📄 EXAMPLES.md (Usage examples)
│   ├── 📄 IMPLEMENTATION.md (Technical details)
│   ├── 📄 SUMMARY.md (Complete overview)
│   ├── 📄 QUICKREF.md (Quick reference)
│   └── 📄 ARCHITECTURE.md (This file)
│
└── 🛠️ Helper Scripts/
    ├── 📄 deploy.ps1 (Automated deployment)
    └── 📄 dev.ps1 (Development setup guide)
```

## Network Communication

```
┌─────────────────────────────────────────────────────────┐
│  Internet                                                │
│    ↕ HTTPS                                               │
├─────────────────────────────────────────────────────────┤
│  Cloudflare Edge Network                                 │
│                                                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Main MCP Worker                                  │   │
│  │  (Public endpoint: /sse)                         │   │
│  └────────┬─────────────────────────────────────────┘   │
│           │                                              │
│           │ Service Binding (Internal)                   │
│           │ - No public endpoint                         │
│           │ - Zero latency                               │
│           │ - Automatic auth                             │
│           ↓                                              │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Python Worker                                    │   │
│  │  (No public endpoint)                            │   │
│  └──────────────────────────────────────────────────┘   │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

## Request/Response Format

### MCP Tool Call
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "create_presentation",
    "arguments": {
      "title": "My Presentation",
      "slides": [
        {
          "layout": "title",
          "title": "Welcome"
        }
      ]
    }
  }
}
```

### Internal Service Call (Main → Python)
```http
POST https://internal/create
Content-Type: application/json

{
  "title": "My Presentation",
  "slides": [
    {
      "layout": "title",
      "title": "Welcome"
    }
  ]
}
```

### Python Worker Response
```http
HTTP/1.1 200 OK
Content-Type: application/vnd.openxmlformats-officedocument.presentationml.presentation
Content-Disposition: attachment; filename="My Presentation.pptx"

[Binary .pptx data]
```

### MCP Tool Response
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "✅ PowerPoint presentation \"My Presentation.pptx\" created successfully with 1 slide(s)!\n\nFile size: 28.54 KB"
      }
    ]
  }
}
```

## Technology Stack

```
┌─────────────────────────────────────────────────────┐
│  Frontend Layer                                      │
│  ├─ Claude Desktop (Electron app)                   │
│  ├─ AI Playground (Web app)                         │
│  └─ Custom MCP clients (Node.js, Python, etc.)      │
└───────────────────┬─────────────────────────────────┘
                    │
                    │ MCP Protocol
                    │
┌───────────────────▼─────────────────────────────────┐
│  MCP Layer                                           │
│  ├─ @modelcontextprotocol/sdk                       │
│  ├─ Server-Sent Events (SSE)                        │
│  └─ JSON-RPC 2.0                                     │
└───────────────────┬─────────────────────────────────┘
                    │
                    │ Cloudflare Workers Runtime
                    │
┌───────────────────▼─────────────────────────────────┐
│  Main Worker Layer                                   │
│  ├─ TypeScript 5.9                                  │
│  ├─ Agents (McpAgent) 0.2.19                        │
│  ├─ Zod (validation) 3.25.76                        │
│  └─ Service Bindings                                │
└───────────────────┬─────────────────────────────────┘
                    │
                    │ Internal Network
                    │
┌───────────────────▼─────────────────────────────────┐
│  Python Worker Layer                                 │
│  ├─ Python 3.11+                                    │
│  ├─ python-pptx 1.0.2                               │
│  ├─ BytesIO (in-memory files)                       │
│  └─ Cloudflare Python Workers Runtime               │
└─────────────────────────────────────────────────────┘
```

## Security Model

```
┌─────────────────────────────────────────────────────┐
│  Public Internet                                     │
│  ⚠️  Anyone can access                              │
└───────────────────┬─────────────────────────────────┘
                    │
                    │ HTTPS
                    │
┌───────────────────▼─────────────────────────────────┐
│  Main MCP Worker                                     │
│  🌐 Public endpoint: /sse                           │
│  ⚠️  No authentication (authless mode)              │
│  ✅ Rate limits (Cloudflare automatic)              │
└───────────────────┬─────────────────────────────────┘
                    │
                    │ Service Binding
                    │ ✅ Internal only
                    │ ✅ Not exposed to internet
                    │ ✅ Automatic authentication
                    │
┌───────────────────▼─────────────────────────────────┐
│  Python Worker                                       │
│  🔒 No public endpoint                              │
│  🔒 Only accessible via service binding             │
│  🔒 Cannot be called from internet                  │
└─────────────────────────────────────────────────────┘
```

## Performance Characteristics

```
Request Flow:                           Latency:
────────────────                        ────────

User → Cloudflare Edge                  <50ms (geographic proximity)
       │
       ↓
Main Worker execution                   <5ms (V8 isolate startup)
       │
       ↓
Service binding call                    <1ms (same data center)
       │
       ↓
Python Worker execution                 10-50ms (PowerPoint generation)
       │
       ↓
Return to Main Worker                   <1ms
       │
       ↓
Return to User                          <50ms

Total: ~116ms typical
```

## Cost Estimate (Cloudflare Free Tier)

```
Free Tier Limits:
├─ 100,000 requests/day
├─ 10ms CPU time per request
└─ 1GB outbound bandwidth/day

Estimated Capacity:
├─ Main Worker: ~100,000 tool calls/day
├─ Python Worker: ~100,000 presentations/day
├─ PowerPoint files: ~10,000 files/day (avg 100KB each)
└─ Cost: $0 (within free tier)

Paid Tier ($5/month):
├─ 10,000,000 requests/month
├─ 50ms CPU time per request
└─ Unlimited bandwidth
```

---

**This architecture scales from 0 to millions of requests with zero configuration!** 🚀
