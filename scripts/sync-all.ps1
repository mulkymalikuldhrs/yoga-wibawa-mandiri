# sync-all.ps1 - Sinkronisasi canonical lokal -> 4 remote
# Remote: origin (Codeberg), gh-org, gh1, gitlab
# Fail-closed: jika remote berisi commit yang tidak ada di lokal main -> ABORT, tanpa auto-merge.
# Usage: powershell -ExecutionPolicy Bypass -File scripts\sync-all.ps1

$ErrorActionPreference = 'Continue'
$remotes = @('origin', 'gh-org', 'gh1', 'gitlab')
$repoRoot = Split-Path $PSScriptRoot -Parent
Set-Location $repoRoot
$env:GIT_TERMINAL_PROMPT = '0'

function Log($msg) { Write-Host ("[{0}] {1}" -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'), $msg) }

Log "fetch --all --prune ..."
git fetch --all --prune 2>$null
if ($LASTEXITCODE -ne 0) { Log "FETCH GAGAL"; exit 2 }

foreach ($r in $remotes) {
    if (git rev-parse --verify --quiet "refs/remotes/$r/main") {
        git merge-base --is-ancestor "$r/main" HEAD
        if ($LASTEXITCODE -ne 0) {
            $ahead = git rev-list --count "HEAD..$r/main"
            Log ("ABORT: {0}/main lebih depan {1} commit dari lokal. Review manual. TIDAK ADA push." -f $r, $ahead)
            exit 1
        }
    }
}
Log "guard lolos: semua remote ancestor dari lokal"

$failed = @()
foreach ($r in $remotes) {
    git push $r main --follow-tags 2>$null
    if ($LASTEXITCODE -eq 0) { Log "OK   -> $r" } else { Log "FAIL -> $r"; $failed += $r }
}

$head = git rev-parse --short HEAD
$stamp = Get-Date -Format 'yyyy-MM-dd HH:mm'
$status = if ($failed.Count -eq 0) { 'ALL OK' } else { 'FAIL: ' + ($failed -join ',') }
Add-Content -Path (Join-Path $repoRoot 'sync-log.md') -Value "| $stamp | $head | $status |"

if ($failed.Count -gt 0) { exit 3 }
Log "SYNC SELESAI - semua remote di $head"
