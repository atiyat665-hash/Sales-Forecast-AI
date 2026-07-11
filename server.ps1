# Simple PowerShell Web Server
$port = 8000
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
try {
    $listener.Start()
    Write-Host "Server started on http://localhost:$port/"
    
    # Open browser automatically
    Start-Process "http://localhost:$port/login.html"
    
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        # Determine file path
        $urlPath = $request.Url.LocalPath
        if ($urlPath -eq "/" -or $urlPath -eq "") {
            $urlPath = "/login.html"
        }
        
        $localPath = Join-Path (Get-Location) $urlPath.TrimStart('/')
        
        if (Test-Path $localPath -PathType Leaf) {
            $bytes = [System.IO.File]::ReadAllBytes($localPath)
            
            # Content-Type header
            if ($localPath.EndsWith(".html")) { $response.ContentType = "text/html" }
            elseif ($localPath.EndsWith(".css")) { $response.ContentType = "text/css" }
            elseif ($localPath.EndsWith(".js")) { $response.ContentType = "application/javascript" }
            
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $err = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
            $response.ContentLength64 = $err.Length
            $response.OutputStream.Write($err, 0, $err.Length)
        }
        $response.OutputStream.Close()
    }
} finally {
    $listener.Stop()
}
