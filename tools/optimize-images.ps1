<#
  이미지 최적화 — 원본(PNG·JPG)을 웹용 JPG로 줄여 assets/images 아래에 저장합니다.

  - 긴 변 기준이 아니라 '가로' 기준으로 줄입니다. 기본 1600px.
  - 가로가 800px보다 크면 '-800.jpg' 작은 버전을 하나 더 만듭니다(srcset용).
  - 투명 배경(PNG 누끼)은 흰색으로 채웁니다.
  - Windows에 기본으로 있는 System.Drawing만 써서 별도 설치가 필요 없습니다.

  사용법
    powershell -ExecutionPolicy Bypass -File tools/optimize-images.ps1 -Source <원본폴더> -Dest assets/images/2026-10
  원본폴더 안의 하위 폴더 구조는 그대로 유지됩니다. (예: 원본/charge/hero.png → assets/images/2026-10/charge/hero.jpg)
#>
param(
  [Parameter(Mandatory = $true)][string]$Source,
  [Parameter(Mandatory = $true)][string]$Dest,
  [int]$MaxWidth = 1600,
  [int]$SmallWidth = 800,
  [int]$Quality = 78
)

Add-Type -AssemblyName System.Drawing

$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$params = New-Object System.Drawing.Imaging.EncoderParameters 1
$params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), ([long]$Quality)

function Save-Resized([System.Drawing.Image]$img, [int]$width, [string]$path) {
  $w = [Math]::Min($width, $img.Width)
  $h = [int][Math]::Round($img.Height * $w / $img.Width)
  $bmp = New-Object System.Drawing.Bitmap $w, $h
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.Clear([System.Drawing.Color]::White)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.DrawImage($img, 0, 0, $w, $h)
  $bmp.Save($path, $codec, $params)
  $g.Dispose(); $bmp.Dispose()
}

$srcRoot = (Resolve-Path $Source).Path
New-Item -ItemType Directory -Force $Dest | Out-Null
$destRoot = (Resolve-Path $Dest).Path

Get-ChildItem $srcRoot -Recurse -Include *.png, *.jpg, *.jpeg | ForEach-Object {
  $rel = $_.FullName.Substring($srcRoot.Length).TrimStart('\', '/')
  $relDir = Split-Path $rel -Parent
  $outDir = if ($relDir) { Join-Path $destRoot $relDir } else { $destRoot }
  New-Item -ItemType Directory -Force $outDir | Out-Null

  $name = [System.IO.Path]::GetFileNameWithoutExtension($_.Name)
  $img = [System.Drawing.Image]::FromFile($_.FullName)
  $size = "{0}x{1}" -f $img.Width, $img.Height
  try {
    Save-Resized $img $MaxWidth (Join-Path $outDir "$name.jpg")
    if ($img.Width -gt $SmallWidth + 100) {
      Save-Resized $img $SmallWidth (Join-Path $outDir "$name-800.jpg")
    }
  } finally {
    $img.Dispose()
  }
  Write-Output ("{0}  {1}" -f $rel, $size)
}
