# Development Mode - Run Both Workers Locally

Write-Host "🔧 Starting Development Environment" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This will start TWO workers:" -ForegroundColor Yellow
Write-Host "1. Python Worker on http://localhost:8788" -ForegroundColor White
Write-Host "2. Main MCP Worker on http://localhost:8787" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  You need to run these in TWO separate terminals:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Terminal 1 (Python Worker):" -ForegroundColor Cyan
Write-Host "  cd python-worker" -ForegroundColor White
Write-Host "  wrangler dev --port 8788" -ForegroundColor White
Write-Host ""
Write-Host "Terminal 2 (Main Worker):" -ForegroundColor Cyan
Write-Host "  wrangler dev --port 8787" -ForegroundColor White
Write-Host ""
Write-Host "Then connect to: http://localhost:8787/sse" -ForegroundColor Green
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
