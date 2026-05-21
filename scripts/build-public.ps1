# build-public.ps1
# Copies the public site to dist/ — excludes admin panel and dev-only files.
# Usage: .\scripts\build-public.ps1
# Upload the contents of dist/ to your hosting provider.

$distDir = "dist"
$exclude = @(
    "admin",
    "node_modules",
    "scripts",
    "docs",
    "logs",
    ".git",
    ".claude",
    "dist",
    "server.js",
    "package.json",
    "package-lock.json",
    "netlify.toml",
    ".env",
    ".env.local",
    ".gitignore",
    "README.md"
)

if (Test-Path $distDir) {
    Remove-Item $distDir -Recurse -Force
}
New-Item -ItemType Directory -Force $distDir | Out-Null

Get-ChildItem -Force | Where-Object {
    $_.Name -notin $exclude
} | ForEach-Object {
    Copy-Item $_.FullName "$distDir\$($_.Name)" -Recurse -Force
}

Write-Host ""
Write-Host "Build complete -> $distDir/"
Write-Host "Excluded: $($exclude -join ', ')"
Write-Host "Upload the contents of $distDir/ to your host."
Write-Host ""
