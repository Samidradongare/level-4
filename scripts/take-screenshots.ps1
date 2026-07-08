# take-screenshots.ps1
# UsagePay - Automated Screenshot Capture Script
# Run this script AFTER starting the frontend dev server (npm run dev in frontend/)
# Usage: .\scripts\take-screenshots.ps1

Write-Host "UsagePay Screenshot Capture Tool" -ForegroundColor Cyan
Write-Host "Make sure the app is running at http://localhost:5173" -ForegroundColor Yellow
Write-Host ""

# Load Windows Forms for screenshot capability
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

# Open the app in Chrome
$url = "http://localhost:5173"
Write-Host "Opening app in browser..." -ForegroundColor Green
Start-Process "chrome.exe" "--start-maximized --window-size=1280,900 $url" -ErrorAction SilentlyContinue
if ($LASTEXITCODE -ne 0) {
    Start-Process "msedge.exe" "--start-maximized --window-size=1280,900 $url" -ErrorAction SilentlyContinue
}

Write-Host "Waiting 5 seconds for page to load..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Helper function to take a screenshot
function Take-Screenshot {
    param([string]$OutputPath, [string]$Label)
    $screen = [System.Windows.Forms.Screen]::PrimaryScreen
    $bitmap = New-Object System.Drawing.Bitmap($screen.Bounds.Width, $screen.Bounds.Height)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.CopyFromScreen($screen.Bounds.Location, [System.Drawing.Point]::Empty, $screen.Bounds.Size)
    $bitmap.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $graphics.Dispose()
    $bitmap.Dispose()
    Write-Host "✓ Captured: $Label -> $OutputPath" -ForegroundColor Green
}

$screenshotsDir = Join-Path $PSScriptRoot "..\screenshots"

# Screenshot 1: Home/Landing page
Write-Host ""
Write-Host "--- SCREENSHOT 1: Product UI (Home Page) ---" -ForegroundColor Cyan
Write-Host "Press ENTER when you can see the UsagePay home page in the browser..."
Read-Host
Take-Screenshot -OutputPath (Join-Path $screenshotsDir "product_ui.png") -Label "Product UI"

# Screenshot 2: Dashboard (after connecting wallet)
Write-Host ""
Write-Host "--- SCREENSHOT 2: Dashboard ---" -ForegroundColor Cyan
Write-Host "1. Click 'Connect Freighter Wallet' in the browser"
Write-Host "2. Wait for the dashboard to load"
Write-Host "Press ENTER when the full dashboard is visible..."
Read-Host
Take-Screenshot -OutputPath (Join-Path $screenshotsDir "product_ui.png") -Label "Dashboard UI"

# Screenshot 3: Analytics
Write-Host ""
Write-Host "--- SCREENSHOT 3: Analytics Dashboard ---" -ForegroundColor Cyan
Write-Host "1. Scroll down to the analytics charts section"
Write-Host "2. Make sure the charts and transaction history are visible"
Write-Host "Press ENTER when ready..."
Read-Host
Take-Screenshot -OutputPath (Join-Path $screenshotsDir "analytics_dashboard.png") -Label "Analytics Dashboard"

# Screenshot 4: Mobile view
Write-Host ""
Write-Host "--- SCREENSHOT 4: Mobile Responsive Design ---" -ForegroundColor Cyan
Write-Host "1. Press F12 to open Chrome DevTools"
Write-Host "2. Press Ctrl+Shift+M to toggle device toolbar"
Write-Host "3. Select 'iPhone 12 Pro' or set width to 390px"
Write-Host "4. Scroll to show the full mobile layout"
Write-Host "Press ENTER when mobile layout is showing..."
Read-Host
Take-Screenshot -OutputPath (Join-Path $screenshotsDir "mobile_design.png") -Label "Mobile Design"

Write-Host ""
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "All screenshots captured!" -ForegroundColor Green
Write-Host "Files saved to: $screenshotsDir" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Review screenshots in the screenshots/ folder"
Write-Host "  2. Run: git add screenshots/ && git commit -m 'screenshots: add real app screenshots'"
Write-Host "  3. git push origin main"
