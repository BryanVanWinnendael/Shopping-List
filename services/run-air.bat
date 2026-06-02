@echo off

set folders=api-gateway category-model cron logs notifications products-search recipes storage

for %%f in (%folders%) do (
    echo Starting %%f...
    pushd %%f
    start /b air -c .air.windows.toml
    popd
)

echo All services started in this terminal.
pause