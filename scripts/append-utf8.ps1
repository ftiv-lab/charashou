[CmdletBinding()]
param(
    [Parameter(Mandatory = $true, Position = 0)]
    [string] $Path,

    [Parameter(Position = 1, ValueFromRemainingArguments = $true)]
    [string[]] $Text,

    [Parameter(ValueFromPipeline = $true)]
    [AllowNull()]
    [string] $InputObject,

    [switch] $NoNewline
)

begin {
    $ErrorActionPreference = 'Stop'
    [Console]::InputEncoding = [System.Text.Encoding]::UTF8
    [Console]::OutputEncoding = [System.Text.Encoding]::UTF8
    $encoding = New-Object System.Text.UTF8Encoding($false)
    $pipelineLines = New-Object System.Collections.Generic.List[string]
}

process {
    if ($PSBoundParameters.ContainsKey('InputObject')) {
        $pipelineLines.Add($InputObject)
    }
}

end {
    if ($Text.Count -gt 0) {
        $content = $Text -join ' '
    }
    elseif ($pipelineLines.Count -gt 0) {
        $content = $pipelineLines -join [Environment]::NewLine
    }
    else {
        $lines = New-Object System.Collections.Generic.List[string]
        while ($null -ne ($line = [Console]::In.ReadLine())) {
            $lines.Add($line)
        }

        $content = $lines -join [Environment]::NewLine
    }

    if (-not $NoNewline -and -not $content.EndsWith([Environment]::NewLine)) {
        $content += [Environment]::NewLine
    }

    if (Test-Path -LiteralPath $Path) {
        $resolved = (Resolve-Path -LiteralPath $Path).Path
    }
    else {
        $resolved = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($Path)
        $directory = [System.IO.Path]::GetDirectoryName($resolved)
        if (-not [string]::IsNullOrWhiteSpace($directory)) {
            [System.IO.Directory]::CreateDirectory($directory) | Out-Null
        }
    }

    [System.IO.File]::AppendAllText($resolved, $content, $encoding)
}
