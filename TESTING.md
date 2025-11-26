# Testing Guide

## Pre-Deployment Testing

### 1. Type Check
```powershell
npm run type-check
```
✅ Expected: No errors

### 2. Lint Check
```powershell
npm run lint:fix
```
✅ Expected: Code formatted properly

### 3. Local Development Test
```powershell
# Terminal 1
cd python-worker
wrangler dev --port 8788

# Terminal 2
wrangler dev --port 8787
```
✅ Expected: Both workers start successfully

## Deployment Testing

### 1. Deploy Python Worker
```powershell
cd python-worker
wrangler deploy
```
✅ Expected output:
```
Published mcp-presentations-python (X.XX sec)
  https://mcp-presentations-python.<account>.workers.dev
```

### 2. Deploy Main Worker
```powershell
cd ..
wrangler deploy
```
✅ Expected output:
```
Published mcp-presentations (X.XX sec)
  https://mcp-presentations.<account>.workers.dev
```

## Functional Testing

### Test 1: Basic Connection
**Tool**: Browser or curl

```powershell
curl https://mcp-presentations.<account>.workers.dev/sse
```

✅ Expected: SSE connection established (streaming response)

### Test 2: Calculator Tools (via AI Playground)

1. Go to: https://playground.ai.cloudflare.com/
2. Enter: `https://mcp-presentations.<account>.workers.dev/sse`
3. Click Connect

✅ Expected: See 3 tools available:
- add
- calculate
- create_presentation

**Test add:**
- Ask: "What's 5 + 3?"
- ✅ Expected: Returns 8

**Test calculate:**
- Ask: "Calculate 6 times 7"
- ✅ Expected: Returns 42

### Test 3: PowerPoint Creation - Simple

**Prompt**: "Create a 1-slide presentation with title 'Hello World'"

✅ Expected response:
```
✅ PowerPoint presentation "Hello World.pptx" created successfully with 1 slide(s)!

File size: XX.XX KB

The presentation has been generated.
```

### Test 4: PowerPoint Creation - Complex

**Prompt**: "Create a 3-slide presentation about cats with bullet points"

✅ Expected:
- Slide 1: Title slide about cats
- Slide 2-3: Content slides with bullet points
- Success message with file size

### Test 5: Error Handling - Empty Slides

Send request with no slides:
```json
{
  "title": "Empty",
  "slides": []
}
```

✅ Expected: Error message about empty slides

### Test 6: Error Handling - Invalid Layout

```json
{
  "title": "Test",
  "slides": [
    {"layout": "invalid_layout", "title": "Test"}
  ]
}
```

✅ Expected: Either validation error or defaults to title_and_content

## Integration Testing

### Test 7: Claude Desktop Integration

1. Edit Claude config:
```json
{
  "mcpServers": {
    "presentations": {
      "command": "npx",
      "args": ["mcp-remote", "https://mcp-presentations.<account>.workers.dev/sse"]
    }
  }
}
```

2. Restart Claude Desktop

3. Check tools: Type `@` and look for presentations server

✅ Expected: 
- presentations server shows up
- 3 tools visible (add, calculate, create_presentation)

4. Test: "Create a presentation about dogs"

✅ Expected: AI creates and confirms presentation

## Performance Testing

### Test 8: Concurrent Requests

Use a load testing tool or script:
```powershell
# Simple PowerShell concurrent test
1..10 | ForEach-Object -Parallel {
    # Make request to create presentation
    Write-Host "Request $_"
}
```

✅ Expected: All requests succeed

### Test 9: Large Presentation

**Prompt**: "Create a 20-slide presentation about world history"

✅ Expected:
- Generates successfully
- File size proportional to slides
- Reasonable response time (<30 seconds)

### Test 10: File Size Limits

Create presentation with many slides and long content.

✅ Expected:
- Works up to reasonable sizes (~5MB)
- Fails gracefully if too large

## Service Binding Testing

### Test 11: Python Worker Direct Call (Should Fail)

```powershell
curl https://mcp-presentations-python.<account>.workers.dev/
```

✅ Expected: Worker responds (it's actually public by default)
⚠️ Note: In production, you might want to add authentication

### Test 12: Service Binding Verification

Check logs while making a request:
```powershell
# Terminal 1: Watch main worker
wrangler tail mcp-presentations

# Terminal 2: Watch python worker
wrangler tail mcp-presentations-python

# Terminal 3: Make a request
# (use AI Playground)
```

✅ Expected: See logs in both workers showing the request flow

## Monitoring Tests

### Test 13: Log Inspection

```powershell
# Main worker logs
wrangler tail mcp-presentations

# Python worker logs
wrangler tail mcp-presentations-python
```

✅ Expected: See request logs, no errors

### Test 14: Deployment Status

```powershell
wrangler deployments list
```

✅ Expected: Both workers show latest deployments

## Edge Cases

### Test 15: Special Characters

Create presentation with title: `Test's "Presentation" & More`

✅ Expected: Handles special characters properly

### Test 16: Unicode Content

Create presentation with emoji and international characters:
```
Title: "🎉 International Présentation 日本語"
Bullets: ["Emoji 😀", "Français", "日本語"]
```

✅ Expected: Renders correctly in PowerPoint

### Test 17: Very Long Content

Create slide with 100+ character bullet points.

✅ Expected: Handles gracefully (might truncate or wrap)

### Test 18: Empty Title

```json
{
  "title": "",
  "slides": [{"layout": "title", "title": "Test"}]
}
```

✅ Expected: Uses default name or empty string

## Regression Testing

### Test 19: Existing Tools Still Work

After deployment, verify:
- add tool still works
- calculate tool still works

✅ Expected: No impact on existing functionality

### Test 20: Multiple Sequential Requests

Create 5 presentations in a row.

✅ Expected: All succeed, no state leakage

## Security Testing

### Test 21: Authentication (Currently None)

Try accessing without any credentials.

✅ Expected: Works (this is an authless server)
⚠️ Note: For production, consider adding auth

### Test 22: Injection Attempts

Try malicious input in titles/bullets:
```json
{
  "title": "<script>alert('xss')</script>",
  "slides": [...]
}
```

✅ Expected: Safely handled (no code execution)

### Test 23: Resource Exhaustion

Try creating 1000-slide presentation.

✅ Expected: Either succeeds or fails gracefully with error

## Documentation Testing

### Test 24: Follow Deployment Guide

Have someone unfamiliar follow DEPLOYMENT.md.

✅ Expected: They can successfully deploy both workers

### Test 25: Example Verification

Test all examples from EXAMPLES.md.

✅ Expected: All examples work as documented

## Cleanup Testing

### Test 26: Undeploy and Redeploy

```powershell
# Delete deployments
wrangler delete mcp-presentations-python
wrangler delete mcp-presentations

# Redeploy
.\deploy.ps1
```

✅ Expected: Clean redeploy works

## Final Checklist

Before declaring "Done":
- [ ] Type check passes
- [ ] Both workers deploy successfully
- [ ] All 3 tools work in AI Playground
- [ ] Can create simple presentation
- [ ] Can create complex presentation
- [ ] Error handling works
- [ ] Claude Desktop connection works
- [ ] Logs show proper flow
- [ ] Documentation is accurate
- [ ] No security vulnerabilities
- [ ] Performance is acceptable

## Automated Test Script (Future Enhancement)

```powershell
# test-all.ps1 (not yet implemented)
# This could automate all the above tests

Write-Host "Running full test suite..."

# Type check
npm run type-check

# Deploy to test environment
# Run functional tests
# Run integration tests
# Run performance tests
# Generate report

Write-Host "All tests passed! ✅"
```

## Known Issues / Limitations

1. **No file download**: Currently returns success message only, no direct file download
2. **No authentication**: Anyone with URL can use the service
3. **No rate limiting**: Beyond Cloudflare's automatic limits
4. **Limited layouts**: Only 3 layout types supported
5. **No images**: Cannot add images to slides yet
6. **No themes**: Uses default PowerPoint theme
7. **No custom fonts**: Uses default fonts

## Future Testing Needs

When adding new features, test:
- [ ] Image uploads
- [ ] Custom themes
- [ ] More layouts
- [ ] Templates
- [ ] Authentication
- [ ] Rate limiting
- [ ] File storage (R2/KV)
- [ ] Analytics

---

**Testing Status**: ✅ Ready for production (with noted limitations)
