@echo off
setlocal EnableDelayedExpansion

set folders=api-gateway category-model cron logs notifications products-search recipes storage

set failed=0

for %%f in (%folders%) do (
    echo.
    echo ==========================================
    echo Checking %%f
    echo ==========================================

    pushd %%f

    REM ==========================
    REM Handlers coverage
    REM ==========================
    if exist handlers (

        set handlersCoverage=
        set hInt=0

        go test ./handlers -coverprofile=handlers.out
        if errorlevel 1 (
            echo [FAIL] Handler tests failed
            set failed=1
        ) else (

            for /f "tokens=3" %%a in ('go tool cover -func=handlers.out ^| findstr total:') do (
                set handlersCoverage=%%a
            )

            echo Handlers: !handlersCoverage!

            set h=!handlersCoverage:%%=!
            for /f "tokens=1 delims=." %%a in ("!h!") do set hInt=%%a

            if !hInt! LSS 80 (
                echo [FAIL] Handlers coverage below 80%%
                set failed=1
            ) else (
                echo [PASS] Handlers coverage
            )
        )

        if exist handlers.out del handlers.out >nul 2>&1

    ) else (
        echo Handlers folder not found
    )

    REM ==========================
    REM Services coverage
    REM ==========================
    if exist services (

        set servicesCoverage=
        set sInt=0

        go test ./services -coverprofile=services.out
        if errorlevel 1 (
            echo [FAIL] Service tests failed
            set failed=1
        ) else (

            for /f "tokens=3" %%a in ('go tool cover -func=services.out ^| findstr total:') do (
                set servicesCoverage=%%a
            )

            echo Services: !servicesCoverage!

            set s=!servicesCoverage:%%=!
            for /f "tokens=1 delims=." %%a in ("!s!") do set sInt=%%a

            if !sInt! LSS 80 (
                echo [FAIL] Services coverage below 80%%
                set failed=1
            ) else (
                echo [PASS] Services coverage
            )
        )

        if exist services.out del services.out >nul 2>&1

    ) else (
        echo Services folder not found
    )

    popd
)

echo.
echo ==========================================
if %failed% EQU 1 (
    echo COVERAGE CHECK FAILED
    exit /b 1
) else (
    echo ALL COVERAGE CHECKS PASSED
    exit /b 0
)