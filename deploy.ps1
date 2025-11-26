# Quick Start - Deploy Both Workers

Write-Host "🚀 MCP Presentations Deployment Script" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Deploy Python Worker
Write-Host "📦 Step 1: Deploying Python Worker..." -ForegroundColor Yellow
Push-Location python-worker
try {
    wrangler deploy
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Python Worker deployed successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Python Worker deployment failed!" -ForegroundColor Red
        Pop-Location
        exit 1
    }
} catch {
    Write-Host "❌ Error deploying Python Worker: $_" -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location

Write-Host ""

# Step 2: Deploy Main Worker
Write-Host "📦 Step 2: Deploying Main MCP Worker..." -ForegroundColor Yellow
try {
    wrangler deploy
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Main Worker deployed successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Main Worker deployment failed!" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Error deploying Main Worker: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎉 Deployment Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Copy your worker URL from the deployment output above"
Write-Host "2. Add '/sse' to the end of the URL"
Write-Host "3. Connect it to Claude Desktop or AI Playground"
Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "- DEPLOYMENT.md - Detailed deployment guide"
Write-Host "- EXAMPLES.md - Usage examples"
Write-Host "- IMPLEMENTATION.md - Technical details"
Write-Host ""
