# {{TOOL_NAME}}

> 一個陽光伏特家 DEDO 工具 / A Sunnyfounder DEDO tool

這個工具是用 DEDO scaffolder 建立的。它要做什麼、為什麼這樣做，請看 `BUSINESS_LOGIC.md`。
This tool was created with the DEDO scaffolder. For what it does and why, see `BUSINESS_LOGIC.md`.

---

## 快速開始 / Quick start

### Windows 使用者先看這個 / Windows users read this first

這套工具預設是為 macOS / Linux 環境設計的。**如果你是 Windows 使用者，強烈建議用 WSL（Windows Subsystem for Linux）來跑**，原因是 `better-sqlite3` 這個套件在原生 Windows 上安裝需要 Visual Studio Build Tools，設定起來很麻煩。WSL 給你一個真正的 Linux 環境，所有東西會像在 Mac 上一樣順。

**設定 WSL**（只要做一次）：

1. 打開 PowerShell（以系統管理員身分）
2. 執行：`wsl --install`
3. 重開機
4. 開啟 "Ubuntu"（WSL 預設發行版），跟著指示設定使用者名稱和密碼
5. 在 Ubuntu 裡安裝 Node.js：`curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash - && sudo apt-get install -y nodejs`

之後所有關於這個工具的 terminal 操作都在 Ubuntu（WSL）裡做，不是在 PowerShell 或 CMD 裡做。

---

This tool's default setup targets macOS / Linux. **If you're on Windows, strongly prefer WSL (Windows Subsystem for Linux)** because `better-sqlite3` on native Windows requires Visual Studio Build Tools and is fiddly to install. WSL gives you a real Linux environment and everything works like on a Mac.

**WSL setup** (one time):

1. Open PowerShell as Administrator
2. Run: `wsl --install`
3. Reboot
4. Open "Ubuntu" from the Start menu and follow the prompts
5. Install Node.js inside Ubuntu: `curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash - && sudo apt-get install -y nodejs`

All subsequent terminal operations for this tool happen inside Ubuntu (WSL), not in PowerShell or CMD.

---

### 第一次安裝 / First-time setup

```bash
# 1. 進入工具資料夾 / Go into the tool folder
cd ~/workspace/{{TOOL_NAME}}

# 2. 安裝套件 / Install dependencies
npm install

# 3. 複製環境變數範本 / Copy the env template
cp .env.example .env

# 4. 編輯 .env 填入需要的值（如果有的話）
#    Edit .env to fill in any values you need (if any)
```

### 啟動工具 / Run the tool

```bash
# 啟動網頁介面 / Start the web UI
npm run dev
```

然後打開瀏覽器到 <http://localhost:3000>
Then open your browser to <http://localhost:3000>

### 從命令列執行 / Run from the command line

有些工具有命令列模式（例如排程任務、批次處理）。如果這個工具有，可以這樣跑：
Some tools have a CLI mode (e.g. for scheduled tasks or batch jobs). If this tool does, run:

```bash
npm run cli
```

---

## 資料夾結構 / Folder layout

```
{{TOOL_NAME}}/
├── CLAUDE.md            ← 給 Claude 看的修改規則 / Rules for Claude when editing
├── BUSINESS_LOGIC.md    ← 業務邏輯文件 / What and why
├── README.md            ← 本檔案 / This file
├── data/                ← SQLite 資料（不進 git）/ SQLite data (not in git)
├── logs/                ← 每日日誌（不進 git）/ Daily logs (not in git)
└── src/                 ← 程式碼 / Source code
```

---

## 要修改這個工具？/ Want to modify this tool?

**不要自己改程式碼** — 請用 Claude Code 幫你改。步驟：
**Don't edit the code directly** — use Claude Code to make changes. Steps:

1. 在 terminal 進到這個資料夾 / Open a terminal in this folder
2. 執行 `claude` / Run `claude`
3. 描述你想改什麼 / Describe what you want to change
4. Claude 會先讀 `BUSINESS_LOGIC.md` 再開始改 / Claude will read `BUSINESS_LOGIC.md` before making any changes

這樣做的原因是：如果你改了一條業務規則但沒更新 `BUSINESS_LOGIC.md`，下一個使用這個工具的人（或下一個 Claude session）會不知道規則變了。Claude 會幫你在同一次改動中同時更新文件和程式碼。
The reason: if you change a business rule but don't update `BUSINESS_LOGIC.md`, the next person using this tool (or the next Claude session) won't know the rule changed. Claude will update the doc and the code in the same commit.

---

## 遇到問題？/ Something broken?

1. 先看 `logs/` 裡當天的 `.jsonl` 檔 — 大部分問題都會在日誌裡。
   Check the current day's `.jsonl` file in `logs/` first — most problems show up in the logs.
2. 如果是新裝的工具跑不起來，確認 `.env` 已經從 `.env.example` 複製好、並填好必要的欄位。
   If it's a fresh install that won't start, make sure you copied `.env` from `.env.example` and filled in the required fields.
3. 還是不行的話，用 Claude Code 在這個資料夾開一個 session，貼上錯誤訊息給它。
   Still broken? Open a Claude Code session in this folder and paste the error.
