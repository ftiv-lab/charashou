param(
    [Parameter(Mandatory = $true, Position = 0)]
    [string] $Path
)

$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$resolved = Resolve-Path -LiteralPath $Path
[System.Text.Encoding]::UTF8.GetString([System.IO.File]::ReadAllBytes($resolved))
