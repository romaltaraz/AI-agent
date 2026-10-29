# Building the submission zip

Run this in **PowerShell** from anywhere. It copies the project into a temporary folder named after you (leaving out secrets and generated folders), then zips that folder onto your Desktop.

```powershell
$src  = "C:\Users\Rom\Documents\visual- john bryce\AI-agent"
$name = "Rom Altaraz"
$tmp  = "$env:TEMP\zipbuild"
$zip  = "$([Environment]::GetFolderPath('Desktop'))\$name.zip"

Remove-Item $tmp, $zip -Recurse -Force -ErrorAction SilentlyContinue
robocopy $src "$tmp\$name" /E /XD venv node_modules dist __pycache__ _review .git /XF .env | Out-Null
tar.exe -a -c -f $zip -C $tmp $name
Remove-Item $tmp -Recurse -Force
```

(`$name` is the root folder name of the zip, in English.) (`robocopy` prints exit codes 0-7 for success, so ignore a "failed" look in some terminals.)

## What is inside

```
Rom Altaraz/
  Backend/            code, Dockerfile, requirements.txt, .env.example, postman_collection.json
  Database/           schema.sql, ai_chat_export.sql
  Frontend/           code, Dockerfile, package.json
  docs/               screenshots and this file
  docker-compose.yml
  AGENTS.md, CLAUDE.md, README.md, .gitignore
```

## What is left out on purpose

`.env` (your real key), `venv`, `node_modules`, `dist`, `__pycache__`, `_review`, and `.git`.

## Check before you submit

1. Open the zip and confirm there is no `.env` file anywhere (only `.env.example`).
2. Confirm there is no `venv`, `node_modules` or `_review` folder.
3. Confirm `Database`, `Backend`, `Frontend`, `docker-compose.yml`, `AGENTS.md` and `docs` are there.
