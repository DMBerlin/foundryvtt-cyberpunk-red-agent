@echo off
REM Cyberpunk Agent - Development Copy Script (Windows Batch)
REM This script copies the module to your FoundryVTT modules folder

echo 🚀 Cyberpunk Agent - Development Copy Script
echo ==================================================

REM Check if FOUNDRY_MODULES_PATH environment variable is set
if defined FOUNDRY_MODULES_PATH (
    echo 📁 Using path from FOUNDRY_MODULES_PATH environment variable
    set "TARGET_PATH=%FOUNDRY_MODULES_PATH%\cyberpunk-agent"
) else (
    REM Try common FoundryVTT paths
    set "DEFAULT_PATH=%LOCALAPPDATA%\FoundryVTT\Data\modules"
    if exist "%DEFAULT_PATH%" (
        echo 📁 Found FoundryVTT modules at default location
        set "TARGET_PATH=%DEFAULT_PATH%\cyberpunk-agent"
    ) else (
        echo ❌ Could not find FoundryVTT modules path!
        echo.
        echo 💡 Solutions:
        echo 1. Set FOUNDRY_MODULES_PATH environment variable
        echo 2. Edit this batch file with your path
        echo 3. Use: npm run dev:copy
        pause
        exit /b 1
    )
)

echo 📋 Copying to: %TARGET_PATH%

REM Create target directory if it doesn't exist
if not exist "%TARGET_PATH%" mkdir "%TARGET_PATH%"

REM Use robocopy for efficient copying
robocopy . "%TARGET_PATH%" /MIR /XD node_modules .git __tests__ /XF package*.json .gitignore *.md dev-config.json /NFL /NDL /NJH /NJS

if %ERRORLEVEL% LEQ 1 (
    echo ✅ Files copied successfully!
    echo.
    echo 🎉 Module copied successfully!
    echo 📱 You can now test the Cyberpunk Agent in FoundryVTT
    echo 🔄 Refresh your browser to see the changes
) else (
    echo ❌ Error copying files!
)

pause
