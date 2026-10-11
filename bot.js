const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const { spawn } = require('node:child_process');
const { setTimeout: sleep } = require('node:timers/promises');

const CONFIG = Object.freeze({
  name: 'TNEH PREMIUM HOSTING BOT',
  username: 'TNEH_Hosting_Bot',
  token: process.env.BOT_TOKEN || '8634230724:AAGPFrkl0ZYKQEGVJqgnaWmgoaTRM760uFo',
  admins: new Set((process.env.ADMIN_IDS || '8128648817').split(',').map(x => x.trim()).filter(Boolean)),
  dataDir: path.resolve(process.env.DATA_DIR || './tneh-data'),
  pythonImage: process.env.PYTHON_IMAGE || 'python:3.11-slim',
  maxUploadBytes: 10 * 1024 * 1024,
  maxExtractedBytes: 20 * 1024 * 1024,
  maxFiles: 60,
  pollingTimeout: 30,
  dockerTimeoutMs: 45_000
});

const DATA_FILE = path.join(CONFIG.dataDir, 'database.json');
const HOSTING_DIR = path.join(CONFIG.dataDir, 'Hosting');
const TMP_DIR = path.join(CONFIG.dataDir, 'tmp');

const ICONS = ['🧝‍♀️', '🧙‍♀️', '👸', '💃', '🧚‍♀️', '🧜‍♀️'];

// Emoji suffixes appended to menu labels. They are appended to the label text
// sent by the reply keyboard, then stripped when matching the plain label.
const MENU_SUFFIXES = [
  ' 🧝‍♀️', ' 🧙‍♀️', ' 👸', ' 💃', ' 🧚‍♀️', ' 🧜‍♀️'
];

// Plain labels — callback mapping is done against these.
const MENU = [
  ['🤖 My Bots', '📤 Upload Bot'],
  ['💎 Plans', '🛒 Buy Plan'],
  ['👥 Referral', '👤 Profile'],
  ['💰 Wallet', '🎫 Tickets'],
  ['🎁 Free Trial', '🎟 Coupon'],
  ['❓ Help', '🛠 Support'],
  ['📊 My Stats', '🛍 Shop'],
  ['👑 ADMIN PANEL']
];

const DEFAULT_PLANS = {
  FREE:    { price: 0,   days: 0,  bots: 1,  storageMB: 100,  ramMB: 128, cpu: 0.5 },
  BASIC:   { price: 99,  days: 30, bots: 3,  storageMB: 300,  ramMB: 192, cpu: 0.7 },
  PREMIUM: { price: 299, days: 30, bots: 10, storageMB: 1000, ramMB: 256, cpu: 1   },
  PRO:     { price: 599, days: 30, bots: 20, storageMB: 2000, ramMB: 384, cpu: 1.5 }
};

function initialDatabase() {
  return {
    users: {},
    bots: {},
    payments: {},
    tickets: {},
    coupons: {},
    requirements: [],
    transactions: [],
    audit: [],
    products: [],
    plans: structuredClone(DEFAULT_PLANS),
    methods: {
      bKash: { number: '01869325626', enabled: true },
      Nagad: { number: '01869325626', enabled: true }
    },
    settings: { welcomeMedia: null, support: '', supportChannel: '' },
    next: { bot: 1, payment: 1, ticket: 1024, requirement: 1, product: 1 }
  };
}

function now() { return Date.now(); }
function id() { return crypto.randomUUID(); }
function h(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[c]);
}
function fmtDate(timestamp) {
  return timestamp ? new Date(timestamp).toLocaleString('en-GB', { timeZone: 'Asia/Dhaka' }) : '—';
}
function bytes(value) {
  const n = Number(value) || 0;
  return n < 1024 * 1024 ? `${(n / 1024).toFixed(1)} KB` : `${(n / 1024 / 1024).toFixed(1)} MB`;
}
function button(text, data) { return { text, callback_data: data }; }
function keyboard(rows) { return { inline_keyboard: rows }; }
function back(destination = 'menu') { return [button('🔙 Back', destination)]; }
function short(value, max = 3500) {
  const s = String(value ?? '');
  return s.length > max ? `${s.slice(0, max)}\n…truncated` : s;
}
function safeName(value) {
  return String(value || 'Bot').replace(/[^\w .-]/g, '').trim().slice(0, 48) || 'Bot';
}
function isAdmin(userId) { return CONFIG.admins.has(String(userId)); }
function own(bot, userId) { return bot && String(bot.owner) === String(userId); }

// Strip all emoji/symbol characters so the trailing icon does not affect matching.
function stripEmojis(text) {
  return String(text || '')
    .replace(/[\u{1F000}-\u{1FAFF}\u{1F1E6}-\u{1F1FF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}\u{20E3}\u{E0020}-\u{E007F}\u{2190}-\u{21FF}\u{2300}-\u{23FF}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

class Database {
  constructor() {
    this.data = initialDatabase();
    if (fs.existsSync(DATA_FILE)) {
      try {
        const saved = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        this.data = { ...this.data, ...saved };
        for (const key of ['users', 'bots', 'payments', 'tickets', 'coupons', 'methods', 'settings', 'next']) {
          this.data[key] ||= initialDatabase()[key];
        }
      } catch (error) {
        throw new Error(`Cannot read database ${DATA_FILE}: ${error.message}`);
      }
    }
  }

  save() {
    const temporary = `${DATA_FILE}.${process.pid}.tmp`;
    fs.writeFileSync(temporary, JSON.stringify(this.data, null, 2), { mode: 0o600 });
    fs.renameSync(temporary, DATA_FILE);
  }

  audit(actor, action, detail = '') {
    this.data.audit.push({ at: now(), actor: String(actor), action, detail: String(detail).slice(0, 500) });
    if (this.data.audit.length > 3000) this.data.audit.splice(0, this.data.audit.length - 3000);
    this.save();
  }

  user(telegramUser, referral = '') {
    const uid = String(telegramUser.id);
    let user = this.data.users[uid];
    if (!user) {
      user = {
        id: uid, name: telegramUser.first_name || 'User',
        username: telegramUser.username || '', joined: now(),
        referrer: referral && referral !== uid && this.data.users[referral] ? referral : '',
        referralConfirmed: false, referrals: 0, wallet: 0,
        plan: 'FREE', planUntil: 0, suspended: false,
        couponUses: {}, extraBots: 0, trialUsed: false
      };
      this.data.users[uid] = user;
      this.save();
    } else {
      user.name = telegramUser.first_name || user.name;
      user.username = telegramUser.username || '';
      this.save();
    }
    return user;
  }

  plan(user) {
    if (user.plan !== 'FREE' && user.planUntil && user.planUntil <= now()) {
      user.plan = 'FREE';
      user.planUntil = 0;
      this.save();
    }
    return this.data.plans[user.plan] || this.data.plans.FREE;
  }

  userBots(uid) {
    return Object.values(this.data.bots).filter(bot => String(bot.owner) === String(uid));
  }

  limit(user) {
    const plan = this.plan(user);
    return (Number(plan.bots) || 1) + (Number(user.extraBots) || 0) +
      Math.floor((Number(user.referrals) || 0) / 10);
  }

  transaction(uid, amount, description) {
    this.data.transactions.push({ id: id(), user: String(uid), amount, description, at: now() });
    this.save();
  }
}

class Telegram {
  constructor(token) {
    this.token = token;
    this.base = `https://api.telegram.org/bot${token}/`;
  }

  async call(method, body = {}, timeoutMs = 45_000) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(this.base + method, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal
      });
      const result = await response.json();
      if (!response.ok || !result.ok) {
        const error = new Error(`Telegram ${method}: ${result.description || response.status}`);
        error.errorCode = result.error_code;
        error.retryAfter = result.parameters?.retry_after;
        throw error;
      }
      return result.result;
    } finally {
      clearTimeout(timeout);
    }
  }

  async send(chatId, text, markup) {
    return this.call('sendMessage', {
      chat_id: chatId, text: short(text, 4000),
      parse_mode: 'HTML', reply_markup: markup,
      disable_web_page_preview: true
    });
  }

  async edit(chatId, messageId, text, markup) {
    try {
      return await this.call('editMessageText', {
        chat_id: chatId, message_id: messageId, text: short(text, 4000),
        parse_mode: 'HTML', reply_markup: markup, disable_web_page_preview: true
      });
    } catch (error) {
      if (/message is not modified/i.test(error.message)) return;
      if (/there is no text|can't be edited|message to edit not found/i.test(error.message)) {
        return this.send(chatId, text, markup);
      }
      throw error;
    }
  }

  async show(ctx, text, markup) {
    if (ctx.callback && ctx.message?.text) {
      return this.edit(ctx.chatId, ctx.message.message_id, text, markup);
    }
    return this.send(ctx.chatId, text, markup);
  }

  async answer(callbackId, text = '') {
    try { await this.call('answerCallbackQuery', { callback_query_id: callbackId, text: short(text, 190) }); }
    catch (error) { console.error('Callback answer:', error.message); }
  }

  async document(chatId, filePath, filename) {
    const form = new FormData();
    form.set('chat_id', String(chatId));
    form.set('document', new Blob([await fsp.readFile(filePath)]), filename);
    const response = await fetch(this.base + 'sendDocument', { method: 'POST', body: form });
    const result = await response.json();
    if (!result.ok) throw new Error(result.description || 'Document delivery failed');
    return result.result;
  }

  async download(fileId, destination, expectedSize) {
    const file = await this.call('getFile', { file_id: fileId });
    if ((file.file_size || expectedSize || 0) > CONFIG.maxUploadBytes) throw new Error('File exceeds the 10 MB upload limit.');
    const url = `https://api.telegram.org/file/bot${this.token}/${file.file_path}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Telegram download failed: ${response.status}`);
    const length = Number(response.headers.get('content-length') || 0);
    if (length > CONFIG.maxUploadBytes) throw new Error('File exceeds the upload limit.');
    const array = new Uint8Array(await response.arrayBuffer());
    if (array.byteLength > CONFIG.maxUploadBytes) throw new Error('File exceeds the upload limit.');
    await fsp.writeFile(destination, array, { mode: 0o600 });
  }
}

function command(program, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(program, args, { cwd: options.cwd, env: options.env || process.env, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '', stderr = '';
    const maxOutput = options.maxOutput || 200_000;
    const timer = setTimeout(() => {
      child.kill('SIGKILL');
      reject(new Error(`${program} timed out`));
    }, options.timeout || CONFIG.dockerTimeoutMs);
    child.stdout.on('data', chunk => { stdout = (stdout + chunk).slice(-maxOutput); });
    child.stderr.on('data', chunk => { stderr = (stderr + chunk).slice(-maxOutput); });
    child.once('error', error => { clearTimeout(timer); reject(error); });
    child.once('close', code => {
      clearTimeout(timer);
      if (code === 0) resolve({ stdout: stdout.trim(), stderr: stderr.trim() });
      else reject(new Error(short(stderr || stdout || `${program} exited ${code}`, 700)));
    });
  });
}

const ZIP_INSPECTOR = String.raw`
import os, pathlib, stat, sys, zipfile
archive, destination, max_bytes, max_files = sys.argv[1:]
max_bytes, max_files = int(max_bytes), int(max_files)
root = pathlib.Path(destination).resolve()
allowed = {'.py', '.txt', '.json', '.yaml', '.yml', '.toml', '.ini'}
total = 0
with zipfile.ZipFile(archive) as z:
    files = [x for x in z.infolist() if not x.is_dir()]
    if len(files) > max_files:
        raise ValueError('Too many files in archive')
    for member in files:
        name = member.filename.replace('\\', '/')
        p = pathlib.PurePosixPath(name)
        if not name or name.startswith('/') or '..' in p.parts or p.suffix.lower() not in allowed:
            raise ValueError('Unsafe or unsupported archive entry: ' + name)
        if member.flag_bits & 1 or stat.S_ISLNK(member.external_attr >> 16):
            raise ValueError('Encrypted files and symbolic links are not supported')
        total += member.file_size
        if total > max_bytes or member.file_size > max_bytes:
            raise ValueError('Archive exceeds extracted size limit')
        target = (root / name).resolve()
        if not target.is_relative_to(root):
            raise ValueError('Archive path escapes project directory')
        target.parent.mkdir(parents=True, exist_ok=True)
        with z.open(member) as src, open(target, 'xb') as out:
            copied = 0
            while True:
                block = src.read(65536)
                if not block:
                    break
                copied += len(block)
                if copied > member.file_size or copied > max_bytes:
                    raise ValueError('Archive entry size mismatch')
                out.write(block)
print('Extracted', len(files), 'files')
`;

const PY_ANALYZER = String.raw`
import ast, json, pathlib, sys
root = pathlib.Path(sys.argv[1])
files = sorted(root.rglob('*.py'))
if not files:
    raise ValueError('Project contains no Python files')
if len(files) > 60:
    raise ValueError('Too many Python files')
imports = set()
for file in files:
    text = file.read_text(encoding='utf-8')
    tree = ast.parse(text, filename=str(file))
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            imports.update(x.name.split('.')[0] for x in node.names)
        elif isinstance(node, ast.ImportFrom) and node.module:
            imports.add(node.module.split('.')[0])
preferred = ['main.py', 'bot.py', 'app.py', '__main__.py']
entry = next((root / x for x in preferred if (root / x).is_file()), None)
if not entry:
    entry = next((f for f in files if f.parent == root), files[0])
print(json.dumps({
    'entry': str(entry.relative_to(root)),
    'imports': sorted(imports)[:100],
    'pythonFiles': len(files),
    'requirements': (root / 'requirements.txt').is_file()
}))
`;

class Hosting {
  constructor(database) { this.db = database; }

  async available() {
    try {
      await command('docker', ['image', 'inspect', CONFIG.pythonImage], { timeout: 8_000 });
      return true;
    } catch { return false; }
  }

  directory(bot) {
    return path.join(HOSTING_DIR, `User_${bot.owner}`, `Bot_${bot.id}`);
  }

  container(bot) { return `tneh_hosted_${bot.id}`; }

  async inspect(bot) {
    try {
      const result = await command('docker', ['inspect', '--format', '{{json .State}}', this.container(bot)]);
      return JSON.parse(result.stdout);
    } catch { return null; }
  }

  async status(bot) {
    const state = await this.inspect(bot);
    if (state?.Running) return '🟢 Running';
    if (state?.Status === 'restarting') return '🟡 Restarting';
    return bot.suspended ? '🔴 Suspended' : '⏹ Stopped';
  }

  async validateAndPrepare(bot, source, extension) {
    const directory = this.directory(bot);
    await fsp.mkdir(directory, { recursive: true, mode: 0o755 });

    if (extension === '.py') {
      await fsp.copyFile(source, path.join(directory, 'main.py'));
    } else {
      await command('python3', [
        '-c', ZIP_INSPECTOR, source, directory,
        String(CONFIG.maxExtractedBytes), String(CONFIG.maxFiles)
      ], { timeout: 20_000 });
    }

    const result = await command('python3', ['-c', PY_ANALYZER, directory], { timeout: 15_000 });
    const analysis = JSON.parse(result.stdout);
    const requirementsPath = path.join(directory, 'requirements.txt');

    if (analysis.requirements) await this.validateRequirements(requirementsPath);

    const files = await this.projectFiles(directory);
    for (const file of files) await fsp.chmod(file, 0o644);
    for (const folder of await this.projectDirectories(directory)) await fsp.chmod(folder, 0o755);
    await fsp.chmod(directory, 0o755);

    bot.entry = analysis.entry;
    bot.imports = analysis.imports;
    bot.requirements = analysis.requirements;
    bot.size = await this.size(bot);
    this.db.save();
    return analysis;
  }

  async projectFiles(root) {
    const output = [];
    async function visit(folder) {
      for (const item of await fsp.readdir(folder, { withFileTypes: true })) {
        const target = path.join(folder, item.name);
        if (item.isSymbolicLink()) throw new Error('Symbolic links are not permitted.');
        if (item.isDirectory()) await visit(target);
        else if (item.isFile()) output.push(target);
      }
    }
    await visit(root);
    return output;
  }

  async projectDirectories(root) {
    const output = [root];
    async function visit(folder) {
      for (const item of await fsp.readdir(folder, { withFileTypes: true })) {
        if (item.isDirectory()) {
          const target = path.join(folder, item.name);
          output.push(target);
          await visit(target);
        }
      }
    }
    await visit(root);
    return output;
  }

  async size(bot) {
    let total = 0;
    try {
      for (const file of await this.projectFiles(this.directory(bot))) total += (await fsp.stat(file)).size;
    } catch { /* A not-yet-created directory has size zero. */ }
    return total;
  }

  async validateRequirements(filename) {
    const text = await fsp.readFile(filename, 'utf8');
    if (text.length > 8_000) throw new Error('requirements.txt is too large.');
    const lines = text.split(/\r?\n/).map(x => x.trim()).filter(x => x && !x.startsWith('#'));
    if (lines.length > 25) throw new Error('Maximum 25 Python packages per bot.');
    for (const line of lines) {
      if (!/^[a-zA-Z][a-zA-Z0-9_.-]*(?:\[[a-zA-Z0-9_,.-]+\])?(?:[=<>!~]{1,2}[a-zA-Z0-9.*+_-]+)?$/.test(line)) {
        throw new Error(`Unsupported requirement: ${short(line, 80)}. Only standard package names and version constraints are allowed.`);
      }
    }
    return lines.length;
  }

  async removeContainer(bot) {
    try { await command('docker', ['rm', '-f', this.container(bot)], { timeout: 20_000 }); }
    catch { /* A missing container requires no cleanup. */ }
  }

  async start(bot) {
    if (bot.suspended) throw new Error('This bot is suspended.');
    if (!await this.available()) throw new Error(`Docker or the local ${CONFIG.pythonImage} image is unavailable. Hosting is disabled until the server is configured.`);

    await this.removeContainer(bot);

    const plan = this.db.plan(this.db.data.users[String(bot.owner)]);
    const ram = Math.max(64, Math.min(512, Number(plan.ramMB) || 128));
    const cpu = Math.max(0.2, Math.min(2, Number(plan.cpu) || 0.5));
    const directory = this.directory(bot);
    const envFile = path.join(directory, '.docker-env');
    const values = Object.entries(bot.env || {}).map(([key, value]) => `${key}=${String(value).replace(/[\r\n]/g, '')}`);
    await fsp.writeFile(envFile, values.join('\n') + '\n', { mode: 0o600 });

    const python = [
      'import os,subprocess,sys',
      'entry=os.environ["TNEH_ENTRY"]',
      'requirements="/app/requirements.txt"',
      'if os.path.isfile(requirements):',
      '  subprocess.check_call([sys.executable,"-m","pip","install","--disable-pip-version-check","--no-cache-dir","--no-input","--target","/tmp/deps","-r",requirements],timeout=120)',
      'os.environ["PYTHONPATH"]="/tmp/deps"+os.pathsep+os.environ.get("PYTHONPATH","")',
      'os.chdir("/app")',
      'os.execv(sys.executable,[sys.executable,"-u",entry])'
    ].join('\n');

    try {
      await command('docker', [
        'run', '-d', '--name', this.container(bot),
        '--restart', 'unless-stopped',
        '--network', 'bridge',
        '--read-only',
        '--cap-drop', 'ALL',
        '--security-opt', 'no-new-privileges:true',
        '--pids-limit', '64',
        '--memory', `${ram}m`,
        '--memory-swap', `${ram}m`,
        '--cpus', String(cpu),
        '--ulimit', 'nofile=256:256',
        '--log-driver', 'json-file',
        '--log-opt', 'max-size=2m',
        '--log-opt', 'max-file=2',
        '--tmpfs', '/tmp:rw,nosuid,nodev,noexec,size=128m,mode=1777',
        '--user', '65534:65534',
        '-v', `${directory}:/app:ro`,
        '--env-file', envFile,
        '-e', `TNEH_ENTRY=${bot.entry}`,
        '-e', 'HOME=/tmp',
        '-e', 'PYTHONDONTWRITEBYTECODE=1',
        '-e', 'PIP_CACHE_DIR=/tmp/pip-cache',
        CONFIG.pythonImage,
        'python', '-u', '-c', python
      ], { timeout: 35_000 });
    } catch (error) {
      throw new Error(`Container start failed: ${error.message}`);
    }

    bot.started = now();
    bot.restarts = (bot.restarts || 0) + 1;
    this.db.save();
    await sleep(1800);
    const state = await this.inspect(bot);
    if (!state?.Running) {
      const logs = await this.logs(bot);
      throw new Error(`Bot exited during startup.\n${short(logs, 900)}`);
    }
  }

  async stop(bot) {
    await command('docker', ['stop', '--time', '8', this.container(bot)], { timeout: 20_000 });
  }

  async restart(bot) {
    await this.start(bot);
  }

  async logs(bot) {
    try {
      return (await command('docker', ['logs', '--timestamps', '--tail', '45', this.container(bot)], {
        timeout: 12_000, maxOutput: 20_000
      })).stdout || 'No logs yet.';
    } catch (error) {
      return `Logs unavailable: ${error.message}`;
    }
  }

  async stats(bot) {
    try {
      return (await command('docker', [
        'stats', '--no-stream', '--format', '{{.CPUPerc}} | {{.MemUsage}}',
        this.container(bot)
      ], { timeout: 12_000 })).stdout;
    } catch { return 'Not available'; }
  }

  async remove(bot) {
    await this.removeContainer(bot);
    await fsp.rm(this.directory(bot), { recursive: true, force: true });
  }

  async archive(bot) {
    const output = path.join(TMP_DIR, `bot_${bot.id}_${Date.now()}.zip`);
    const source = this.directory(bot);
    const script = String.raw`
import os, pathlib, sys, zipfile
source, target = map(pathlib.Path, sys.argv[1:])
with zipfile.ZipFile(target, 'w', zipfile.ZIP_DEFLATED) as z:
    for root, dirs, files in os.walk(source):
        dirs[:] = [d for d in dirs if not d.startswith('.')]
        for file in files:
            if file.startswith('.') or file == '.docker-env':
                continue
            p = pathlib.Path(root) / file
            if p.is_file() and not p.is_symlink():
                z.write(p, p.relative_to(source))
`;
    await command('python3', ['-c', script, source, output], { timeout: 20_000 });
    return output;
  }
}

class Application {
  constructor() {
    this.db = new Database();
    this.api = new Telegram(CONFIG.token);
    this.hosting = new Hosting(this.db);
    this.sessions = new Map();
    this.offset = 0;
    this.username = CONFIG.username;
    this.botId = '';
  }

  session(uid, kind, extra = {}) {
    this.sessions.set(String(uid), { kind, ...extra, at: now() });
  }

  clear(uid) { this.sessions.delete(String(uid)); }

  async notifyAdmins(message, markup) {
    for (const admin of CONFIG.admins) {
      try { await this.api.send(admin, message, markup); }
      catch (error) { console.error(`Admin notification ${admin}:`, error.message); }
    }
  }

  async gate(user, ctx) {
    if (isAdmin(user.id)) return true;
    const active = this.db.data.requirements.filter(r => r.active);
    if (!active.length) {
      await this.confirmReferral(user);
      return true;
    }

    const missing = [];
    for (const requirement of active) {
      try {
        const member = await this.api.call('getChatMember', {
          chat_id: requirement.chatId, user_id: Number(user.id)
        });
        if (!['creator', 'administrator', 'member'].includes(member.status) &&
            !(member.status === 'restricted' && member.is_member)) missing.push(requirement);
      } catch (error) {
        console.error('Membership verification:', requirement.chatId, error.message);
        missing.push(requirement);
      }
    }

    if (!missing.length) {
      await this.confirmReferral(user);
      return true;
    }

    const rows = missing.map((r, index) => r.link
      ? [{ text: `${r.type === 'channel' ? '📢' : '👥'} Join ${short(r.name, 25)} ${ICONS[index % ICONS.length]}`, url: r.link }]
      : []);
    rows.push([button('🔄 Verify Membership 🧚‍♀️', 'verify')]);
    await this.api.show(ctx,
      `🔐 <b>JOIN REQUIRED</b>\n\nJoin all required channels and groups before using the bot.\n\n${missing.map(r =>
        `${r.type === 'channel' ? '📢' : '👥'} ${h(r.name)} — ❌ Not joined`).join('\n')}\n\nAfter joining, tap Verify Membership.`,
      keyboard(rows.filter(row => row.length)));
    return false;
  }

  async confirmReferral(user) {
    if (!user.referrer || user.referralConfirmed) return;
    const referrer = this.db.data.users[user.referrer];
    if (!referrer) return;
    user.referralConfirmed = true;
    referrer.referrals = (referrer.referrals || 0) + 1;
    this.db.save();
    try {
      await this.api.send(referrer.id,
        `🎉 New verified referral!\n\n👥 Total referrals: <b>${referrer.referrals}</b>\n🎁 Every 10 referrals add one free bot slot.`);
    } catch { /* The referrer may have blocked the bot. */ }
  }

  async welcome(ctx, verified = false) {
    const user = ctx.user;
    const activeUsers = Object.keys(this.db.data.users).length;
    const activeBots = Object.values(this.db.data.bots).length;
    const text = `${verified ? '🎉 <b>MEMBERSHIP VERIFIED!</b>\n\n' : ''}🤖 <b>${h(CONFIG.name)}</b>\n\n` +
      `👤 Username: ${user.username ? '@' + h(user.username) : h(user.name)}\n` +
      `🆔 User ID: <code>${h(user.id)}</code>\n` +
      `👥 Total Referral: <b>${user.referrals || 0}</b>\n` +
      `🤖 Total Active Bot: <b>${activeBots}</b>\n` +
      `👤 Total Active User: <b>${activeUsers}</b>\n\n` +
      `✨ Choose an option from the main menu below.`;
    const media = this.db.data.settings.welcomeMedia;

    if (media?.fileId) {
      try {
        await this.api.call(media.type === 'video' ? 'sendVideo' : 'sendPhoto', {
          chat_id: ctx.chatId,
          [media.type === 'video' ? 'video' : 'photo']: media.fileId,
          caption: short(text, 1000),
          parse_mode: 'HTML'
        });
      } catch (error) {
        console.error('Welcome media:', error.message);
      }
    }

    // Attach one emoji suffix per label from MENU_SUFFIXES (cycling).
    const rows = MENU.map((row, rowIndex) => row.map((label, colIndex) =>
      `${label}${MENU_SUFFIXES[(rowIndex * 2 + colIndex) % MENU_SUFFIXES.length]}`
    ));

    await this.api.send(ctx.chatId, text, {
      keyboard: rows.filter((row, idx) => row.length === 2 || isAdmin(user.id) || idx < MENU.length - 1)
        .map(row => row.map(text => ({ text }))),
      resize_keyboard: true,
      is_persistent: true
    });
  }

  botButtons(bot) {
    return keyboard([
      [button('🟢 Start 🧝‍♀️', `bot:start:${bot.id}`), button('⏹ Stop 🧙‍♀️', `bot:stopAsk:${bot.id}`)],
      [button('🔄 Restart 👸', `bot:restart:${bot.id}`), button('📊 Status 💃', `bot:info:${bot.id}`)],
      [button('⚡ Live Logs 🧚‍♀️', `bot:logs:${bot.id}`), button('📦 Files 🧜‍♀️', `bot:files:${bot.id}`)],
      [button('⚙️ Env Vars 🧝‍♀️', `bot:env:${bot.id}`), button('⏰ Cron 🧙‍♀️', `bot:cron:${bot.id}`)],
      [button('📦 Install Pkg 👸', `bot:pkg:${bot.id}`), button('🔗 Clone 💃', `bot:clone:${bot.id}`)],
      [button('⬇️ Download 🧚‍♀️', `bot:download:${bot.id}`), button('❌ Delete 🧜‍♀️', `bot:deleteAsk:${bot.id}`)],
      [button('🤖 My Bots', 'bots'), button('🏠 Main Menu', 'menu')]
    ]);
  }

  async listBots(ctx) {
    const bots = this.db.userBots(ctx.user.id);
    const lines = await Promise.all(bots.map(async (bot, i) =>
      `${i + 1}. 🤖 <b>${h(bot.name)}</b>\n${await this.hosting.status(bot)} · 🐍 Python · 💾 ${bytes(await this.hosting.size(bot))}`));
    await this.api.show(ctx,
      `🤖 <b>MY BOTS</b>\n\n${lines.join('\n\n') || 'No hosted bots yet.'}`,
      keyboard([...bots.map(bot => [button(`🤖 ${short(bot.name, 32)}`, `bot:panel:${bot.id}`)]),
        [button('📤 Upload Bot', 'upload')], back()]));
  }

  async botPanel(ctx, bot) {
    await this.api.show(ctx,
      `🎛 <b>BOT CONTROL PANEL</b>\n\n🤖 ${h(bot.name)}\n🆔 ${bot.id}\n${await this.hosting.status(bot)}\n` +
      `🐍 Python · 📁 ${h(bot.entry || 'main.py')}\n💾 ${bytes(await this.hosting.size(bot))}`,
      this.botButtons(bot));
  }

  async uploadPrompt(ctx) {
    const user = ctx.user;
    const plan = this.db.plan(user);
    const bots = this.db.userBots(user.id);
    const used = (await Promise.all(bots.map(b => this.hosting.size(b)))).reduce((a, b) => a + b, 0);
    const limit = this.db.limit(user);
    if (bots.length >= limit) {
      await this.api.show(ctx,
        `⚠️ Bot limit reached: <b>${bots.length}/${limit}</b>.\n\nUpgrade your plan or earn an extra bot slot for every 10 verified referrals.`,
        keyboard([[button('🛒 Buy Plan', 'buy')], back()]));
      return;
    }
    if (!await this.hosting.available()) {
      await this.api.show(ctx,
        `🛑 Hosting is temporarily unavailable: Docker or the local Python image is not ready.\nPlease contact support. Uploaded code will not run on the host.`,
        keyboard([back()]));
      return;
    }
    this.session(user.id, 'upload');
    await this.api.show(ctx,
      `📤 <b>UPLOAD BOT</b>\n\n💎 Plan: ${h(user.plan)}\n🤖 Bots: ${bots.length}/${limit}\n` +
      `💾 Storage: ${bytes(used)}/${plan.storageMB} MB\n\n` +
      `Send a <b>.py</b> file or a <b>.zip</b> project containing Python files. ` +
      `A project ZIP may include requirements.txt.\n\n` +
      `✅ Maximum upload: 10 MB\n🔒 Execution requires an isolated Docker container.\n\n` +
      `For a single .py upload, you can add requirements.txt later from its Files panel.`,
      keyboard([back()]));
  }

  async handleUpload(ctx, document) {
    const user = ctx.user;
    this.clear(user.id);
    const filename = path.basename(document.file_name || '');
    const extension = path.extname(filename).toLowerCase();
    if (!['.py', '.zip'].includes(extension)) throw new Error('Upload a .py file or a .zip Python project.');
    if (document.file_size > CONFIG.maxUploadBytes) throw new Error('Maximum upload size is 10 MB.');
    if (!await this.hosting.available()) throw new Error('Docker hosting is currently unavailable.');

    const plan = this.db.plan(user);
    const existing = this.db.userBots(user.id);
    if (existing.length >= this.db.limit(user)) throw new Error('Your plan bot limit has been reached.');
    const used = (await Promise.all(existing.map(b => this.hosting.size(b)))).reduce((a, b) => a + b, 0);
    if (used + document.file_size > plan.storageMB * 1024 * 1024) throw new Error('Storage limit exceeded.');

    const bot = {
      id: this.db.data.next.bot++, owner: user.id,
      name: safeName(filename.replace(/\.(py|zip)$/i, '')),
      created: now(), started: 0, restarts: 0,
      entry: '', size: 0, imports: [], env: {}, requirements: false, suspended: false
    };
    this.db.data.bots[bot.id] = bot;
    this.db.save();

    const temporary = path.join(TMP_DIR, `${id()}${extension}`);
    const progress = await this.api.send(ctx.chatId,
      `📥 <b>FILE RECEIVED</b>\n📁 ${h(filename)}\n\n🔍 Validating file...\n▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️ 0%`);

    try {
      await this.api.download(document.file_id, temporary, document.file_size);
      await this.api.edit(ctx.chatId, progress.message_id,
        `🔍 <b>BOT ANALYSIS</b>\n📁 ${h(filename)}\n\n🐍 Checking Python syntax...\n▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️ 40%`);
      const analysis = await this.hosting.validateAndPrepare(bot, temporary, extension);
      if (used + bot.size > plan.storageMB * 1024 * 1024) throw new Error('Extracted project exceeds your storage limit.');
      await this.api.edit(ctx.chatId, progress.message_id,
        `🔍 <b>BOT ANALYSIS</b>\n\n🐍 Runtime: Python 3\n🚀 Entry: ${h(analysis.entry)}\n` +
        `📦 requirements.txt: ${analysis.requirements ? 'Found' : 'Not found'}\n` +
        `🔧 Imported modules: ${analysis.imports.length}\n✅ Validation passed\n\n` +
        `🚀 Creating isolated environment...\n▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️ 80%`);
      await this.hosting.start(bot);
      this.db.audit(user.id, 'bot_upload', `Bot ${bot.id}: ${filename}`);
      await this.api.edit(ctx.chatId, progress.message_id,
        `🎉 <b>BOT HOSTED SUCCESSFULLY!</b>\n\n🤖 ${h(bot.name)}\n🐍 Python 3\n` +
        `🟢 Status: Running\n💾 Storage: ${bytes(bot.size)}\n` +
        `📦 requirements.txt: ${analysis.requirements ? 'Found' : 'Not found'}\n\n▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️ 100%`,
        keyboard([[button('⚙️ Open Control Panel', `bot:panel:${bot.id}`)]]));
    } catch (error) {
      await this.hosting.remove(bot).catch(() => {});
      delete this.db.data.bots[bot.id];
      this.db.save();
      await this.api.edit(ctx.chatId, progress.message_id,
        `❌ <b>UPLOAD FAILED</b>\n\n${h(short(error.message, 1500))}`,
        keyboard([[button('📤 Try Again', 'upload')]]));
    } finally {
      await fsp.rm(temporary, { force: true }).catch(() => {});
    }
  }

  async handleBot(ctx, parts) {
    const [action, identifier] = parts;
    const bot = this.db.data.bots[identifier];
    if (!bot || (!own(bot, ctx.user.id) && !isAdmin(ctx.user.id))) {
      throw new Error('Bot not found or access denied.');
    }
    const bid = bot.id;

    if (action === 'panel') return this.botPanel(ctx, bot);
    if (action === 'start') {
      await this.hosting.start(bot);
      this.db.audit(ctx.user.id, 'bot_start', bid);
      return this.botPanel(ctx, bot);
    }
    if (action === 'stopAsk') {
      return this.api.show(ctx, `⏹ <b>STOP BOT?</b>\n\n🤖 ${h(bot.name)}`,
        keyboard([[button('⏹ Confirm Stop', `bot:stop:${bid}`)], [button('↩️ Cancel', `bot:panel:${bid}`)]]));
    }
    if (action === 'stop') {
      await this.hosting.stop(bot);
      this.db.audit(ctx.user.id, 'bot_stop', bid);
      return this.botPanel(ctx, bot);
    }
    if (action === 'restart') {
      await this.api.show(ctx, '🔄 <b>RESTARTING...</b>\n\n⏹ Stopping old process...\n🚀 Starting new process...');
      await this.hosting.restart(bot);
      this.db.audit(ctx.user.id, 'bot_restart', bid);
      return this.api.send(ctx.chatId, '🟢 Bot restarted successfully.', keyboard([[button('⚙️ Control Panel', `bot:panel:${bid}`)]]));
    }
    if (action === 'logs') {
      const logs = await this.hosting.logs(bot);
      return this.api.show(ctx, `⚡ <b>LIVE LOGS</b>\n\n<pre>${h(short(logs, 3200))}</pre>`,
        keyboard([[button('🔄 Refresh', `bot:logs:${bid}`)], [button('🔙 Control Panel', `bot:panel:${bid}`)]]));
    }
    if (action === 'info') {
      const state = await this.hosting.inspect(bot);
      const uptime = state?.Running && state.StartedAt
        ? Math.max(0, Math.floor((now() - new Date(state.StartedAt).getTime()) / 60_000)) + ' minutes'
        : '—';
      const owner = this.db.data.users[String(bot.owner)];
      return this.api.show(ctx,
        `ℹ️ <b>BOT INFORMATION</b>\n\n🤖 Name: ${h(bot.name)}\n${await this.hosting.status(bot)}\n` +
        `👤 Owner: ${owner?.username ? '@' + h(owner.username) : h(owner?.name || bot.owner)}\n` +
        `🆔 Bot ID: ${bid}\n🐍 Python: 3.11\n⏱ Uptime: ${uptime}\n` +
        `💾 Storage: ${bytes(await this.hosting.size(bot))}\n` +
        `⚡ CPU | 🧠 RAM: ${h(await this.hosting.stats(bot))}\n` +
        `🔄 Restarts: ${bot.restarts || 0}\n📅 Created: ${fmtDate(bot.created)}`,
        keyboard([[button('🔄 Refresh', `bot:info:${bid}`)], [button('🔙 Control Panel', `bot:panel:${bid}`)]]));
    }
    if (action === 'files') {
      const files = (await this.hosting.projectFiles(this.hosting.directory(bot)))
        .map(file => path.relative(this.hosting.directory(bot), file))
        .filter(file => file !== '.docker-env');
      return this.api.show(ctx,
        `📦 <b>BOT FILES</b>\n\n${h(files.join('\n') || 'No files')}\n\n` +
        `Send a requirements.txt document after tapping Add Requirements to install standard Python packages. Restarting will reinstall them in the container.`,
        keyboard([[button('📋 Add Requirements', `bot:req:${bid}`)], [button('🔙 Control Panel', `bot:panel:${bid}`)]]));
    }
    if (action === 'req') {
      this.session(ctx.user.id, 'requirements', { botId: bid });
      return this.api.show(ctx, `📋 Send a <b>requirements.txt</b> document for ${h(bot.name)}.`,
        keyboard([[button('🔙 Control Panel', `bot:panel:${bid}`)]]));
    }
    if (action === 'env') {
      const entries = Object.keys(bot.env || {}).map(key => `${h(key)} = ${key === 'MODE' ? h(bot.env[key]) : '••••••••'}`);
      return this.api.show(ctx, `⚙️ <b>ENVIRONMENT VARIABLES</b>\n\n${entries.join('\n') || 'No variables.'}\n\nValues are masked.`,
        keyboard([
          [button('➕ Add / Edit', `bot:envAdd:${bid}`), button('🗑 Delete Variable', `bot:envDel:${bid}`)],
          [button('🔙 Control Panel', `bot:panel:${bid}`)]
        ]));
    }
    if (action === 'envAdd' || action === 'envDel') {
      this.session(ctx.user.id, action, { botId: bid });
      return this.api.show(ctx,
        action === 'envAdd'
          ? '⚙️ Send <code>VARIABLE_NAME=value</code>.\n\nExample: <code>BOT_TOKEN=your-token</code>\nThe container will restart after saving.'
          : '🗑 Send the variable name to delete. The container will restart afterward.',
        keyboard([[button('🔙 Control Panel', `bot:panel:${bid}`)]]));
    }
    if (action === 'pkg') {
      this.session(ctx.user.id, 'package', { botId: bid });
      return this.api.show(ctx,
        `📦 <b>INSTALL PACKAGE</b>\n\nSend a standard PyPI package name, optionally with a version constraint, such as <code>requests==2.32.3</code>.\n\nPackages are installed inside the isolated container.`,
        keyboard([[button('🔙 Control Panel', `bot:panel:${bid}`)]]));
    }
    if (action === 'cron') {
      return this.api.show(ctx,
        '⏰ <b>CRON JOBS</b>\n\nScheduled jobs are unavailable in this deployment. No commands will be scheduled or run on the host.',
        keyboard([[button('🔙 Control Panel', `bot:panel:${bid}`)]]));
    }
    if (action === 'clone') {
      this.session(ctx.user.id, 'clone', { botId: bid });
      return this.api.show(ctx, `🔗 <b>CLONE BOT</b>\n\nOriginal: ${h(bot.name)}\n\nSend a name for the copy.`,
        keyboard([[button('🔙 Control Panel', `bot:panel:${bid}`)]]));
    }
    if (action === 'download') {
      await this.api.show(ctx, '⬇️ Preparing your project archive...');
      const archive = await this.hosting.archive(bot);
      try { await this.api.document(ctx.chatId, archive, `${safeName(bot.name)}.zip`); }
      finally { await fsp.rm(archive, { force: true }).catch(() => {}); }
      return;
    }
    if (action === 'deleteAsk') {
      return this.api.show(ctx,
        `⚠️ <b>DELETE BOT?</b>\n\n🤖 ${h(bot.name)}\n\nFiles, environment, packages, and logs will be permanently removed.`,
        keyboard([[button('❌ Delete Permanently', `bot:delete:${bid}`)],
          [button('↩️ Cancel', `bot:panel:${bid}`)]]));
    }
    if (action === 'delete') {
      await this.hosting.remove(bot);
      delete this.db.data.bots[bid];
      this.db.audit(ctx.user.id, 'bot_delete', bid);
      return this.listBots(ctx);
    }
  }

  async plans(ctx, purchase = false) {
    const rows = Object.entries(this.db.data.plans).map(([name, plan]) => [
      button(`${name === 'FREE' ? '🎁' : '💎'} ${name} · ৳${plan.price}`, `${purchase ? 'choose' : 'plan'}:${name}`)
    ]);
    await this.api.show(ctx,
      `💎 <b>${purchase ? 'SELECT A PLAN' : 'HOSTING PLANS'}</b>\n\n` +
      Object.entries(this.db.data.plans).map(([name, p]) =>
        `<b>${h(name)}</b> — ৳${p.price}\n🤖 ${p.bots} bots · 💾 ${p.storageMB} MB · 🧠 ${p.ramMB} MB\n` +
        `⏱ ${p.days ? `${p.days} days` : 'Free'}`).join('\n\n'),
      keyboard([...rows, back()]));
  }

  async choosePlan(ctx, name) {
    const plan = this.db.data.plans[name];
    if (!plan || name === 'FREE') throw new Error('Select a paid plan.');
    const methods = Object.entries(this.db.data.methods)
      .filter(([, method]) => method.enabled)
      .map(([key]) => [button(`📱 ${key}`, `pay:${name}:${encodeURIComponent(key)}`)]);
    await this.api.show(ctx,
      `💎 <b>${h(name)} PLAN</b>\n\n💰 Price: ৳${plan.price}\n🤖 Bot limit: ${plan.bots}\n` +
      `💾 Storage: ${plan.storageMB} MB\n⏱ Duration: ${plan.days} days\n\nSelect your payment method.`,
      keyboard([...methods, [button('💰 Pay With Wallet', `walletBuy:${name}`)], back('buy')]));
  }

  async paymentPrompt(ctx, planName, methodName, kind = 'plan') {
    const method = this.db.data.methods[methodName];
    const plan = this.db.data.plans[planName];
    if (!method?.enabled || (kind === 'plan' && (!plan || planName === 'FREE'))) throw new Error('Payment option unavailable.');
    this.session(ctx.user.id, 'payment', { planName, methodName, paymentKind: kind, amount: plan?.price || 0 });
    await this.api.show(ctx,
      `📱 <b>${h(methodName)} PAYMENT</b>\n\n💰 Amount: ৳${plan.price}\n📞 Number: <code>${h(method.number)}</code>\n\n` +
      `Send the exact amount using the payment provider, then send your transaction ID here.\n\n` +
      `⚠️ A transaction ID is not proof of payment. An admin must verify the payment manually.`,
      keyboard([back('buy')]));
  }

  async wallet(ctx) {
    const transactions = this.db.data.transactions.filter(t => t.user === ctx.user.id).slice(-10).reverse();
    await this.api.show(ctx,
      `💰 <b>WALLET</b>\n\n💳 Balance: <b>৳${ctx.user.wallet || 0}</b>\n\n` +
      `<b>Recent transactions</b>\n${transactions.map(t =>
        `${t.amount >= 0 ? '➕' : '➖'} ৳${Math.abs(t.amount)} — ${h(t.description)}`).join('\n') || 'None'}`,
      keyboard([[button('➕ Add Balance', 'topup')], back()]));
  }

  async topupMethods(ctx) {
    const rows = Object.entries(this.db.data.methods).filter(([, method]) => method.enabled)
      .map(([name]) => [button(`📱 ${name}`, `topupMethod:${encodeURIComponent(name)}`)]);
    await this.api.show(ctx, '➕ <b>ADD BALANCE</b>\n\nSelect a payment method.', keyboard([...rows, back('wallet')]));
  }

  async referral(ctx) {
    const link = `https://t.me/${this.username}?start=ref_${ctx.user.id}`;
    await this.api.show(ctx,
      `👥 <b>REFERRAL</b>\n\n🔗 Your link:\n<code>${h(link)}</code>\n\n` +
      `👤 Verified referrals: ${ctx.user.referrals || 0}\n` +
      `🎁 Extra bot slots: ${Math.floor((ctx.user.referrals || 0) / 10)}\n\n` +
      `Invite 10 verified users to unlock one additional free bot slot.`,
      keyboard([[{ text: '📤 Share Referral Link', url: `https://t.me/share/url?url=${encodeURIComponent(link)}` }], back()]));
  }

  async profile(ctx) {
    const user = ctx.user;
    this.db.plan(user);
    await this.api.show(ctx,
      `👤 <b>PROFILE</b>\n\nName: ${h(user.name)}\nUsername: ${user.username ? '@' + h(user.username) : '—'}\n` +
      `Telegram ID: <code>${user.id}</code>\n\n💎 Plan: ${h(user.plan)}\n` +
      `⏱ Valid until: ${user.planUntil ? fmtDate(user.planUntil) : 'No expiry'}\n` +
      `🤖 Bots: ${this.db.userBots(user.id).length}/${this.db.limit(user)}\n` +
      `💰 Wallet: ৳${user.wallet || 0}\n📅 Joined: ${fmtDate(user.joined)}`,
      keyboard([back()]));
  }

  async myStats(ctx) {
    const bots = this.db.userBots(ctx.user.id);
    const statuses = await Promise.all(bots.map(b => this.hosting.status(b)));
    const storage = (await Promise.all(bots.map(b => this.hosting.size(b)))).reduce((a, b) => a + b, 0);
    await this.api.show(ctx,
      `📊 <b>MY STATISTICS</b>\n\n🤖 Total bots: ${bots.length}\n` +
      `🟢 Running: ${statuses.filter(s => s.includes('Running')).length}\n` +
      `⏹ Stopped: ${statuses.filter(s => !s.includes('Running')).length}\n` +
      `💾 Storage: ${bytes(storage)}\n💎 Plan: ${h(ctx.user.plan)}\n` +
      `👥 Referrals: ${ctx.user.referrals || 0}\n💰 Wallet: ৳${ctx.user.wallet || 0}`,
      keyboard([back()]));
  }

  async tickets(ctx) {
    const tickets = Object.values(this.db.data.tickets).filter(t => t.user === ctx.user.id).slice(-12).reverse();
    await this.api.show(ctx,
      `🎫 <b>SUPPORT TICKETS</b>\n\n${tickets.map(t =>
        `#${t.id} · ${t.status === 'resolved' ? '🟢 Resolved' : '🟡 Pending'}\n${h(short(t.message, 100))}`).
        join('\n\n') || 'No tickets yet.'}`,
      keyboard([[button('➕ New Ticket', 'ticketNew')], back()]));
  }

  async couponPrompt(ctx) {
    this.session(ctx.user.id, 'coupon');
    await this.api.show(ctx, '🎟 <b>COUPON</b>\n\nSend your coupon code to redeem it.', keyboard([back()]));
  }

  async handleCoupon(ctx, codeInput) {
    const code = codeInput.toUpperCase().trim();
    const coupon = this.db.data.coupons[code];
    if (!coupon || (coupon.expires && coupon.expires <= now()) ||
        (coupon.limit && coupon.used >= coupon.limit) ||
        (ctx.user.couponUses[code] || 0) >= 1) throw new Error('Invalid, expired, or already used coupon.');
    if (coupon.type === 'BALANCE') {
      ctx.user.wallet += coupon.value;
      this.db.transaction(ctx.user.id, coupon.value, `Coupon ${code}`);
    } else if (coupon.type === 'BOTS') {
      ctx.user.extraBots += coupon.value;
    } else {
      throw new Error('Unsupported coupon type.');
    }
    coupon.used = (coupon.used || 0) + 1;
    ctx.user.couponUses[code] = 1;
    this.db.audit(ctx.user.id, 'coupon_redeem', code);
    await this.api.send(ctx.chatId,
      `✅ Coupon applied!\n🎁 Reward: ${coupon.type === 'BALANCE' ? `৳${coupon.value} wallet balance` : `${coupon.value} extra bot slot(s)`}.`);
  }

  async adminPanel(ctx) {
    if (!isAdmin(ctx.user.id)) throw new Error('Admin access required.');
    const actions = [
      ['👥 Users', 'admin:users', '🤖 All Bots', 'admin:bots'],
      ['💎 Plans', 'admin:plans', '💳 Payments', 'admin:payments'],
      ['💰 Wallet / Topups', 'admin:topups', '🎟 Coupons', 'admin:coupons'],
      ['📢 Join Requirements', 'admin:reqs', '🎫 Tickets', 'admin:tickets'],
      ['👥 Referrals', 'admin:referrals', '📢 Broadcast', 'admin:broadcast'],
      ['📊 System Stats', 'admin:stats', '🖥 Server Monitor', 'admin:server'],
      ['📋 Logs', 'admin:logs', '⚙️ Settings', 'admin:settings'],
      ['🛡 Security', 'admin:security', '🛍 Bot Shop', 'admin:shop'],
      ['💳 Pay Methods', 'admin:methods', '🖼 Welcome Media', 'admin:media']
    ];
    return this.api.show(ctx, `👑 <b>ADMIN PANEL</b>\n\nProtected admin ID: <code>${ctx.user.id}</code>`,
      keyboard([...actions.map((row, i) => [
        button(`${row[0]} ${ICONS[i % ICONS.length]}`, row[1]),
        button(`${row[2]} ${ICONS[(i + 1) % ICONS.length]}`, row[3])
      ]), back()]));
  }

  async admin(ctx, parts) {
    if (!isAdmin(ctx.user.id)) throw new Error('Admin access required.');
    const [action, arg, extra] = parts;
    const d = this.db.data;
    const adminBack = [button('🔙 Admin Panel', 'admin:panel')];

    if (action === 'panel') return this.adminPanel(ctx);
    if (action === 'users') {
      const users = Object.values(d.users).slice(-30).reverse();
      return this.api.show(ctx,
        `👥 <b>USERS</b> (${Object.keys(d.users).length})\n\n` +
        users.map(u => `${u.suspended ? '🔴' : '🟢'} <code>${u.id}</code> ${h(u.name)} · ${h(u.plan)} · ৳${u.wallet}`).join('\n') +
        '\n\nSend a user ID after choosing a management action.',
        keyboard([
          [button('🔍 Manage User', 'admin:userPrompt'), button('💎 Change Plan', 'admin:planUserPrompt')],
          [button('💰 Adjust Balance', 'admin:balancePrompt')], adminBack
        ]));
    }
    if (['userPrompt', 'planUserPrompt', 'balancePrompt'].includes(action)) {
      this.session(ctx.user.id, action);
      return this.api.show(ctx, '👤 Send the Telegram user ID.', keyboard([adminBack]));
    }
    if (action === 'user') {
      const target = d.users[arg];
      if (!target) throw new Error('User not found.');
      return this.api.show(ctx,
        `👤 ${h(target.name)}\n🆔 <code>${target.id}</code>\n💎 ${h(target.plan)}\n💰 ৳${target.wallet}\n` +
        `🤖 Bots: ${this.db.userBots(arg).length}\n${target.suspended ? '🔴 Suspended' : '🟢 Active'}`,
        keyboard([
          [button(target.suspended ? '✅ Unsuspend' : '🛡 Suspend', `admin:toggleUser:${arg}`)],
          [button('💎 Change Plan', `admin:planUser:${arg}`), button('💰 Balance', `admin:balanceUser:${arg}`)],
          adminBack
        ]));
    }
    if (action === 'toggleUser') {
      const target = d.users[arg];
      if (!target || isAdmin(arg)) throw new Error('Cannot change this account.');
      target.suspended = !target.suspended;
      this.db.audit(ctx.user.id, 'user_suspension', `${arg}: ${target.suspended}`);
      return this.admin(ctx, ['user', arg]);
    }
    if (action === 'planUser') {
      if (!d.users[arg]) throw new Error('User not found.');
      return this.api.show(ctx, `💎 Select a plan for <code>${arg}</code>.`,
        keyboard([...Object.keys(d.plans).map(name => [button(name, `admin:setPlan:${arg}:${name}`)]), adminBack]));
    }
    if (action === 'setPlan') {
      const target = d.users[arg], plan = d.plans[extra];
      if (!target || !plan) throw new Error('User or plan not found.');
      target.plan = extra;
      target.planUntil = plan.days ? now() + plan.days * 86_400_000 : 0;
      this.db.audit(ctx.user.id, 'manual_plan', `${arg} => ${extra}`);
      await this.api.send(arg, `💎 Your hosting plan is now ${h(extra)}.`).catch(() => {});
      return this.admin(ctx, ['user', arg]);
    }
    if (action === 'balanceUser') {
      if (!d.users[arg]) throw new Error('User not found.');
      this.session(ctx.user.id, 'balanceAmount', { targetId: arg });
      return this.api.show(ctx, `💰 Send the balance adjustment for <code>${arg}</code>.\nExamples: <code>100</code> or <code>-50</code>.`,
        keyboard([adminBack]));
    }
    if (action === 'bots') {
      const bots = Object.values(d.bots).slice(-35).reverse();
      const statuses = await Promise.all(bots.map(b => this.hosting.status(b)));
      return this.api.show(ctx,
        `🤖 <b>ALL BOTS</b> (${Object.keys(d.bots).length})\n\n` +
        bots.map((b, i) => `${statuses[i]} #${b.id} ${h(b.name)} · Owner <code>${b.owner}</code>`).join('\n') +
        '\n\nChoose a bot to manage it.',
        keyboard([...bots.slice(0, 15).map(b => [button(`#${b.id} ${short(b.name, 25)}`, `admin:manageBot:${b.id}`)]), adminBack]));
    }
    if (action === 'manageBot') {
      const bot = d.bots[arg];
      if (!bot) throw new Error('Bot not found.');
      return this.api.show(ctx,
        `🤖 #${bot.id} ${h(bot.name)}\n👤 Owner: <code>${bot.owner}</code>\n${await this.hosting.status(bot)}`,
        keyboard([
          [button('🟢 Start', `admin:botAction:${arg}:start`), button('⏹ Stop', `admin:botAction:${arg}:stop`)],
          [button('🔄 Restart', `admin:botAction:${arg}:restart`), button('📋 Logs', `bot:logs:${arg}`)],
          [button(bot.suspended ? '✅ Unsuspend' : '🔴 Suspend', `admin:botAction:${arg}:suspend`)],
          [button('🗑 Delete', `admin:botDeleteAsk:${arg}`)], adminBack
        ]));
    }
    if (action === 'botAction') {
      const bot = d.bots[arg];
      if (!bot) throw new Error('Bot not found.');
      if (extra === 'start') await this.hosting.start(bot);
      else if (extra === 'stop') await this.hosting.stop(bot);
      else if (extra === 'restart') await this.hosting.restart(bot);
      else if (extra === 'suspend') {
        bot.suspended = !bot.suspended;
        if (bot.suspended) await this.hosting.removeContainer(bot);
        this.db.save();
      }
      this.db.audit(ctx.user.id, 'admin_bot_action', `${arg}: ${extra}`);
      return this.admin(ctx, ['manageBot', arg]);
    }
    if (action === 'botDeleteAsk') {
      return this.api.show(ctx, `⚠️ Delete bot #${arg} permanently?`,
        keyboard([[button('❌ Confirm Delete', `admin:botDelete:${arg}`)], [button('↩️ Cancel', `admin:manageBot:${arg}`)]]));
    }
    if (action === 'botDelete') {
      const bot = d.bots[arg];
      if (!bot) throw new Error('Bot not found.');
      await this.hosting.remove(bot);
      delete d.bots[arg];
      this.db.audit(ctx.user.id, 'admin_bot_delete', arg);
      return this.admin(ctx, ['bots']);
    }
    if (action === 'plans') {
      return this.api.show(ctx,
        `💎 <b>MANAGE PLANS</b>\n\n${Object.entries(d.plans).map(([name, p]) =>
          `${name}: ৳${p.price}, ${p.days} days, ${p.bots} bots, ${p.storageMB} MB, ${p.ramMB} MB RAM`).join('\n')}\n\n` +
        `To edit, send:\n<code>PLAN PRICE DAYS BOTS STORAGE_MB RAM_MB CPU</code>`,
        keyboard([[button('✏️ Edit Plan', 'admin:editPlan')], adminBack]));
    }
    if (action === 'editPlan') {
      this.session(ctx.user.id, 'editPlan');
      return this.api.show(ctx,
        'Send: <code>PREMIUM 299 30 10 1000 256 1</code>\n\nFields: plan, price, duration days, bot limit, storage MB, RAM MB, CPU cores.',
        keyboard([adminBack]));
    }
    if (action === 'payments' || action === 'topups') {
      const payments = Object.values(d.payments).filter(p => p.status === 'pending' &&
        (action === 'topups' ? p.kind === 'topup' : p.kind === 'plan'));
      return this.api.show(ctx,
        `💳 <b>${action === 'topups' ? 'PENDING TOPUPS' : 'PENDING PLAN PAYMENTS'}</b>\n\n` +
        payments.slice(-15).map(p =>
          `#${p.id} · User <code>${p.user}</code> · ৳${p.amount}\n${h(p.method)} · TxID: <code>${h(p.txid)}</code>`).
          join('\n\n') || 'No pending requests.',
        keyboard([...payments.slice(-15).map(p => [
          button(`✅ #${p.id}`, `admin:approve:${p.id}`),
          button(`❌ #${p.id}`, `admin:reject:${p.id}`)
        ]), adminBack]));
    }
    if (action === 'approve' || action === 'reject') {
      const payment = d.payments[arg];
      if (!payment || payment.status !== 'pending') throw new Error('Payment has already been processed.');
      payment.status = action === 'approve' ? 'approved' : 'rejected';
      payment.reviewedBy = ctx.user.id;
      payment.reviewedAt = now();
      const target = d.users[payment.user];
      if (action === 'approve' && target) {
        if (payment.kind === 'topup') {
          target.wallet += payment.amount;
          this.db.transaction(target.id, payment.amount, `${payment.method} deposit`);
        } else {
          const plan = d.plans[payment.plan];
          if (!plan) throw new Error('Plan no longer exists.');
          const wasActive = target.plan === payment.plan && target.planUntil > now();
          target.plan = payment.plan;
          target.planUntil = (wasActive ? target.planUntil : now()) + plan.days * 86_400_000;
          this.db.transaction(target.id, -payment.amount, `External payment for ${payment.plan}`);
        }
      }
      this.db.audit(ctx.user.id, `payment_${action}`, `#${arg} ${payment.txid}`);
      await this.api.send(payment.user,
        action === 'approve'
          ? `🎉 <b>PAYMENT APPROVED!</b>\n\n${payment.kind === 'topup'
            ? `💰 ৳${payment.amount} added to your wallet.`
            : `💎 ${h(payment.plan)} plan activated.\n⏱ Valid until: ${fmtDate(target?.planUntil)}`}`
          : '❌ <b>PAYMENT REJECTED</b>\n\nContact support if you believe this is a mistake.').catch(() => {});
      return this.admin(ctx, [payment.kind === 'topup' ? 'topups' : 'payments']);
    }
    if (action === 'coupons') {
      return this.api.show(ctx,
        `🎟 <b>COUPONS</b>\n\n${Object.entries(d.coupons).slice(-25).map(([code, c]) =>
          `${h(code)} · ${c.type} ${c.value} · ${c.used || 0}/${c.limit || '∞'} uses`).join('\n') || 'None'}\n\n` +
        `Available reward types: BALANCE and BOTS.`,
        keyboard([[button('➕ Create Coupon', 'admin:newCoupon')], adminBack]));
    }
    if (action === 'newCoupon') {
      this.session(ctx.user.id, 'newCoupon');
      return this.api.show(ctx,
        'Send coupon details:\n<code>CODE BALANCE 50 100 30</code>\n\nFields: code, reward type, reward value, use limit, expiry in days.\nUse BOTS instead of BALANCE for extra bot slots.',
        keyboard([adminBack]));
    }
    if (action === 'reqs') {
      const reqs = d.requirements;
      return this.api.show(ctx,
        `📢 <b>JOIN REQUIREMENTS</b>\n\n📢 Channels: ${reqs.filter(r => r.type === 'channel').length}\n` +
        `👥 Groups: ${reqs.filter(r => r.type === 'group').length}\n\n` +
        reqs.map(r => `#${r.id} ${r.active ? '🟢' : '⏸'} ${r.type === 'channel' ? '📢' : '👥'} ` +
          `${h(r.name)} · <code>${h(r.chatId)}</code>`).join('\n'),
        keyboard([
          [button('➕ Add Channel', 'admin:addReq:channel'), button('➕ Add Group', 'admin:addReq:group')],
          ...reqs.slice(-15).map(r => [button(`⚙️ #${r.id} ${short(r.name, 22)}`, `admin:requirement:${r.id}`)]),
          adminBack
        ]));
    }
    if (action === 'addReq') {
      if (!['channel', 'group'].includes(arg)) throw new Error('Invalid requirement type.');
      this.session(ctx.user.id, 'reqId', { type: arg });
      return this.api.show(ctx,
        `➕ <b>ADD ${arg.toUpperCase()}</b>\n\nSend its numeric chat ID.\nExample: <code>-1001234567890</code>\n\n` +
        `The bot needs administrator access to check memberships reliably.`,
        keyboard([adminBack]));
    }
    if (action === 'requirement') {
      const r = d.requirements.find(x => String(x.id) === String(arg));
      if (!r) throw new Error('Requirement not found.');
      return this.api.show(ctx,
        `📢 <b>REQUIREMENT #${r.id}</b>\n\n${h(r.name)}\nID: <code>${h(r.chatId)}</code>\n` +
        `Link: ${h(r.link || 'Not set')}\nStatus: ${r.active ? '🟢 Active' : '⏸ Disabled'}`,
        keyboard([
          [button(r.active ? '⏸ Disable' : '🟢 Enable', `admin:toggleReq:${r.id}`)],
          [button('🔗 Change Link', `admin:linkReq:${r.id}`), button('✏️ Rename', `admin:renameReq:${r.id}`)],
          [button('🗑 Delete', `admin:delReqAsk:${r.id}`)], [button('🔙 Requirements', 'admin:reqs')]
        ]));
    }
    if (action === 'toggleReq') {
      const r = d.requirements.find(x => String(x.id) === String(arg));
      if (!r) throw new Error('Requirement not found.');
      r.active = !r.active;
      this.db.audit(ctx.user.id, 'requirement_toggle', `${arg}: ${r.active}`);
      return this.admin(ctx, ['requirement', arg]);
    }
    if (action === 'linkReq' || action === 'renameReq') {
      this.session(ctx.user.id, action, { requirementId: arg });
      return this.api.show(ctx, action === 'linkReq'
        ? '🔗 Send a public <code>https://t.me/...</code> URL or an invite link.'
        : '✏️ Send the new display name.', keyboard([adminBack]));
    }
    if (action === 'delReqAsk') {
      return this.api.show(ctx, `⚠️ Delete join requirement #${arg}?`,
        keyboard([[button('🗑 Confirm Delete', `admin:delReq:${arg}`)], [button('↩️ Cancel', `admin:requirement:${arg}`)]]));
    }
    if (action === 'delReq') {
      d.requirements = d.requirements.filter(r => String(r.id) !== String(arg));
      this.db.audit(ctx.user.id, 'requirement_delete', arg);
      return this.admin(ctx, ['reqs']);
    }
    if (action === 'tickets') {
      const tickets = Object.values(d.tickets).slice(-20).reverse();
      return this.api.show(ctx,
        `🎫 <b>SUPPORT TICKETS</b>\n\n${tickets.map(t =>
          `#${t.id} ${t.status === 'resolved' ? '🟢' : '🟡'} User <code>${t.user}</code>\n${h(short(t.message, 120))}`).
          join('\n\n') || 'No tickets.'}`,
        keyboard([...tickets.map(t => [button(`🎫 Reply #${t.id}`, `admin:replyTicket:${t.id}`)]), adminBack]));
    }
    if (action === 'replyTicket') {
      if (!d.tickets[arg]) throw new Error('Ticket not found.');
      this.session(ctx.user.id, 'replyTicket', { ticketId: arg });
      return this.api.show(ctx, `🎫 Send your reply to ticket #${arg}. The ticket will be marked resolved.`,
        keyboard([adminBack]));
    }
    if (action === 'broadcast') {
      this.session(ctx.user.id, 'broadcast');
      return this.api.show(ctx, '📢 Send the broadcast text. It will be delivered to every registered user.',
        keyboard([adminBack]));
    }
    if (action === 'referrals') {
      const leaders = Object.values(d.users).sort((a, b) => b.referrals - a.referrals).slice(0, 15);
      return this.api.show(ctx,
        `👥 <b>REFERRAL LEADERS</b>\n\n${leaders.map(u =>
          `${h(u.name)} · <code>${u.id}</code> · ${u.referrals || 0}`).join('\n') || 'No users.'}`,
        keyboard([adminBack]));
    }
    if (action === 'stats' || action === 'server') {
      const bots = Object.values(d.bots);
      const states = await Promise.all(bots.map(b => this.hosting.inspect(b)));
      const mem = process.memoryUsage();
      const load = os.loadavg();
      return this.api.show(ctx,
        `📊 <b>SYSTEM STATISTICS</b>\n\n👥 Users: ${Object.keys(d.users).length}\n` +
        `🤖 Bots: ${bots.length}\n🟢 Running: ${states.filter(s => s?.Running).length}\n` +
        `⏹ Stopped: ${states.filter(s => !s?.Running).length}\n` +
        `💎 Paid active plans: ${Object.values(d.users).filter(u => u.plan !== 'FREE' && u.planUntil > now()).length}\n` +
        `💳 Pending payments: ${Object.values(d.payments).filter(p => p.status === 'pending').length}\n` +
        `📢 Required channels: ${d.requirements.filter(r => r.active && r.type === 'channel').length}\n` +
        `👥 Required groups: ${d.requirements.filter(r => r.active && r.type === 'group').length}\n\n` +
        `🧠 Node RSS: ${bytes(mem.rss)}\n🧠 Host free RAM: ${bytes(os.freemem())}\n` +
        `⚡ Load average: ${load[0].toFixed(2)}\n` +
        `🖥 Docker image: ${await this.hosting.available() ? '🟢 Available' : '🔴 Unavailable'}\n` +
        `📡 Service: 🟢 Online`,
        keyboard([adminBack]));
    }
    if (action === 'logs') {
      return this.api.show(ctx,
        `📋 <b>AUDIT LOGS</b>\n\n${d.audit.slice(-25).reverse().map(a =>
          `${fmtDate(a.at)} · ${h(a.actor)} · ${h(a.action)}\n${h(short(a.detail, 80))}`).join('\n\n') || 'No events.'}`,
        keyboard([adminBack]));
    }
    if (action === 'settings') {
      return this.api.show(ctx,
        `⚙️ <b>SETTINGS</b>\n\nSupport: ${h(d.settings.support || 'Not configured')}\n` +
        `Support channel: ${h(d.settings.supportChannel || 'Not configured')}\n` +
        `Welcome media: ${d.settings.welcomeMedia ? 'Configured' : 'Not configured'}`,
        keyboard([
          [button('🛠 Set Support Contact', 'admin:setSupport')],
          [button('📢 Set Support Channel', 'admin:setSupportChannel')],
          [button('🖼 Set Welcome Photo/Video', 'admin:media')],
          adminBack
        ]));
    }
    if (action === 'setSupport' || action === 'setSupportChannel' || action === 'media') {
      this.session(ctx.user.id, action);
      return this.api.show(ctx,
        action === 'media' ? '🖼 Send a photo or video to display at /start.'
          : action === 'setSupport' ? '🛠 Send a support @username or HTTPS URL.'
            : '📢 Send the support channel HTTPS URL.',
        keyboard([adminBack]));
    }
    if (action === 'methods') {
      return this.api.show(ctx,
        `💳 <b>PAYMENT SETTINGS</b>\n\n${Object.entries(d.methods).map(([name, m]) =>
          `${m.enabled ? '🟢' : '⏸'} ${h(name)} · <code>${h(m.number)}</code>`).join('\n')}`,
        keyboard([
          [button('➕ Add / Edit Method', 'admin:addMethod')],
          ...Object.keys(d.methods).map(name => [button(`🔄 Toggle ${short(name, 20)}`,
            `admin:toggleMethod:${encodeURIComponent(name)}`)]),
          adminBack
        ]));
    }
    if (action === 'addMethod') {
      this.session(ctx.user.id, 'addMethod');
      return this.api.show(ctx, '💳 Send <code>Method Name | Payment Number</code>.\nExample: <code>bKash | 01869325626</code>',
        keyboard([adminBack]));
    }
    if (action === 'toggleMethod') {
      const method = d.methods[decodeURIComponent(arg)];
      if (!method) throw new Error('Payment method not found.');
      method.enabled = !method.enabled;
      this.db.audit(ctx.user.id, 'payment_method_toggle', arg);
      return this.admin(ctx, ['methods']);
    }
    if (action === 'shop') {
      return this.api.show(ctx,
        `🛍 <b>BOT SHOP</b>\n\n${d.products.map(p =>
          `#${p.id} ${h(p.name)} · ৳${p.price}\n${h(short(p.description, 100))}`).join('\n\n') || 'No products.'}`,
        keyboard([[button('➕ Add Product', 'admin:addProduct')], adminBack]));
    }
    if (action === 'addProduct') {
      this.session(ctx.user.id, 'addProduct');
      return this.api.show(ctx, '🛍 Send <code>Product Name | Price | Description</code>.',
        keyboard([adminBack]));
    }
    if (action === 'security') {
      return this.api.show(ctx,
        `🛡 <b>SECURITY</b>\n\n✅ Admin ID allowlist\n✅ Membership gate\n` +
        `✅ Manual payment verification\n✅ Duplicate transaction-ID protection\n` +
        `✅ ZIP traversal and symlink rejection\n✅ Python syntax validation\n` +
        `✅ Docker resource limits and read-only app mount\n✅ Masked environment variables\n` +
        `✅ Admin action audit log\n\n⚠️ Docker isolation is not a guarantee against all vulnerabilities.`,
        keyboard([adminBack]));
    }
  }

  async handleSession(ctx, text, document, media) {
    const uid = ctx.user.id;
    const state = this.sessions.get(uid);
    if (!state) return false;
    if (now() - state.at > 30 * 60_000) {
      this.clear(uid);
      throw new Error('This request expired. Please start again.');
    }
    const d = this.db.data;
    if (state.kind === 'upload' && document) {
      await this.handleUpload(ctx, document);
      return true;
    }
    if (state.kind === 'requirements' && document) {
      const bot = d.bots[state.botId];
      if (!own(bot, uid)) throw new Error('Bot not found.');
      if (document.file_name !== 'requirements.txt') throw new Error('Send a document named requirements.txt.');
      if (document.file_size > 8_000) throw new Error('requirements.txt must be under 8 KB.');
      const temporary = path.join(TMP_DIR, `${id()}.txt`);
      try {
        await this.api.download(document.file_id, temporary, document.file_size);
        await this.hosting.validateRequirements(temporary);
        await fsp.copyFile(temporary, path.join(this.hosting.directory(bot), 'requirements.txt'));
        await fsp.chmod(path.join(this.hosting.directory(bot), 'requirements.txt'), 0o644);
        bot.requirements = true;
        bot.size = await this.hosting.size(bot);
        this.db.save();
        this.clear(uid);
        await this.api.send(ctx.chatId, '✅ Requirements saved. Restarting the isolated bot container...');
        await this.hosting.restart(bot);
        await this.api.send(ctx.chatId, '📦 Dependencies installed and bot restarted.',
          keyboard([[button('⚙️ Control Panel', `bot:panel:${bot.id}`)]]));
      } finally { await fsp.rm(temporary, { force: true }).catch(() => {}); }
      return true;
    }
    if (state.kind === 'media' && media && isAdmin(uid)) {
      d.settings.welcomeMedia = media;
      this.db.audit(uid, 'welcome_media_updated', media.type);
      this.clear(uid);
      await this.api.send(ctx.chatId, '✅ Welcome media saved.');
      return true;
    }
    if (!text) return false;
    this.clear(uid);

    if (state.kind === 'payment') {
      const txid = text.trim().toUpperCase();
      if (!/^[A-Z0-9_-]{6,80}$/.test(txid)) throw new Error('Transaction ID must contain 6–80 letters, numbers, underscores, or hyphens.');
      if (Object.values(d.payments).some(p =>
        p.method.toLowerCase() === state.methodName.toLowerCase() && p.txid === txid)) {
        throw new Error('This transaction ID has already been submitted.');
      }
      const payment = {
        id: d.next.payment++, user: uid, kind: 'plan',
        plan: state.planName, method: state.methodName,
        amount: state.amount, txid, status: 'pending', created: now()
      };
      d.payments[payment.id] = payment;
      this.db.audit(uid, 'payment_submitted', `#${payment.id} ${txid}`);
      await this.api.send(ctx.chatId,
        `⏳ <b>PAYMENT SUBMITTED</b>\n\n💳 ${h(payment.method)}\n💰 ৳${payment.amount}\n` +
        `🧾 <code>${h(txid)}</code>\n🟡 Pending manual admin verification.`);
      await this.notifyAdmins(
        `💳 <b>NEW PLAN PAYMENT #${payment.id}</b>\n\n👤 <code>${uid}</code>\n💎 ${h(payment.plan)}\n` +
        `💰 ৳${payment.amount}\n📱 ${h(payment.method)}\n🧾 <code>${h(txid)}</code>`,
        keyboard([[button('✅ Approve', `admin:approve:${payment.id}`),
          button('❌ Reject', `admin:reject:${payment.id}`)]]));
      return true;
    }
    if (state.kind === 'topupAmount') {
      const amount = Number(text.trim());
      if (!Number.isInteger(amount) || amount < 10 || amount > 100_000) throw new Error('Enter an amount from ৳10 to ৳100,000.');
      this.session(uid, 'topupTxid', { methodName: state.methodName, amount });
      await this.api.send(ctx.chatId,
        `📱 Send <b>৳${amount}</b> to ${h(state.methodName)} number ` +
        `<code>${h(d.methods[state.methodName].number)}</code>.\n\nThen send your transaction ID.`);
      return true;
    }
    if (state.kind === 'topupTxid') {
      const txid = text.trim().toUpperCase();
      if (!/^[A-Z0-9_-]{6,80}$/.test(txid)) throw new Error('Invalid transaction ID.');
      if (Object.values(d.payments).some(p =>
        p.method.toLowerCase() === state.methodName.toLowerCase() && p.txid === txid)) {
        throw new Error('This transaction ID was already submitted.');
      }
      const payment = {
        id: d.next.payment++, user: uid, kind: 'topup', method: state.methodName,
        amount: state.amount, txid, status: 'pending', created: now()
      };
      d.payments[payment.id] = payment;
      this.db.audit(uid, 'topup_submitted', `#${payment.id} ${txid}`);
      await this.api.send(ctx.chatId, `⏳ Topup request #${payment.id} submitted for manual verification.`);
      await this.notifyAdmins(
        `💰 <b>NEW TOPUP #${payment.id}</b>\n👤 <code>${uid}</code>\n` +
        `💰 ৳${payment.amount}\n📱 ${h(payment.method)}\n🧾 <code>${h(txid)}</code>`,
        keyboard([[button('✅ Approve', `admin:approve:${payment.id}`),
          button('❌ Reject', `admin:reject:${payment.id}`)]]));
      return true;
    }
    if (state.kind === 'coupon') {
      await this.handleCoupon(ctx, text);
      return true;
    }
    if (state.kind === 'ticket') {
      if (text.length < 5 || text.length > 1800) throw new Error('Ticket message must contain 5–1,800 characters.');
      const ticket = { id: d.next.ticket++, user: uid, message: text, status: 'pending', created: now() };
      d.tickets[ticket.id] = ticket;
      this.db.audit(uid, 'ticket_create', ticket.id);
      await this.api.send(ctx.chatId, `🎫 Ticket #${ticket.id} created. Support will reply here.`);
      await this.notifyAdmins(`🎫 <b>NEW TICKET #${ticket.id}</b>\n👤 <code>${uid}</code>\n\n${h(text)}`,
        keyboard([[button('✏️ Reply', `admin:replyTicket:${ticket.id}`)]]));
      return true;
    }
    if (state.kind === 'clone') {
      const original = d.bots[state.botId];
      if (!own(original, uid)) throw new Error('Original bot not found.');
      if (this.db.userBots(uid).length >= this.db.limit(ctx.user)) throw new Error('Bot limit reached.');
      const copy = {
        ...structuredClone(original), id: d.next.bot++, name: safeName(text),
        created: now(), started: 0, restarts: 0, suspended: false
      };
      d.bots[copy.id] = copy;
      this.db.save();
      try {
        const src = this.hosting.directory(original);
        const dest = this.hosting.directory(copy);
        await fsp.cp(src, dest, {
          recursive: true,
          filter: (item) => path.basename(item) !== '.docker-env'
        });
        copy.size = await this.hosting.size(copy);
        const other = this.db.userBots(uid).filter(b => b.id !== copy.id);
        const used = (await Promise.all(other.map(b => this.hosting.size(b)))).reduce((a, b) => a + b, 0);
        if (used + copy.size > this.db.plan(ctx.user).storageMB * 1024 * 1024) throw new Error('Storage limit reached.');
        await this.hosting.start(copy);
        this.db.audit(uid, 'bot_clone', `${original.id} => ${copy.id}`);
        await this.api.send(ctx.chatId, `✅ Bot cloned as ${h(copy.name)}.`,
          keyboard([[button('⚙️ Control Panel', `bot:panel:${copy.id}`)]]));
      } catch (error) {
        await this.hosting.remove(copy).catch(() => {});
        delete d.bots[copy.id];
        this.db.save();
        throw error;
      }
      return true;
    }
    if (state.kind === 'envAdd' || state.kind === 'envDel' || state.kind === 'package') {
      const bot = d.bots[state.botId];
      if (!own(bot, uid)) throw new Error('Bot not found.');
      if (state.kind === 'envAdd') {
        const separator = text.indexOf('=');
        const key = text.slice(0, separator).trim();
        const value = text.slice(separator + 1);
        if (separator < 1 || !/^[A-Za-z_][A-Za-z0-9_]{0,63}$/.test(key) ||
            value.length > 2000 || /[\r\n]/.test(value)) throw new Error('Use VARIABLE_NAME=value, without line breaks.');
        bot.env[key] = value;
        this.db.save();
        await this.api.send(ctx.chatId, `✅ ${h(key)} saved. Restarting container...`);
      } else if (state.kind === 'envDel') {
        const key = text.trim();
        if (!(key in bot.env)) throw new Error('Variable not found.');
        delete bot.env[key];
        this.db.save();
        await this.api.send(ctx.chatId, `✅ ${h(key)} deleted. Restarting container...`);
      } else {
        const line = text.trim();
        const file = path.join(this.hosting.directory(bot), 'requirements.txt');
        const existing = fs.existsSync(file) ? await fsp.readFile(file, 'utf8') : '';
        const temporary = path.join(TMP_DIR, `${id()}.txt`);
        try {
          await fsp.writeFile(temporary, existing.trim() + '\n' + line + '\n');
          await this.hosting.validateRequirements(temporary);
          await fsp.copyFile(temporary, file);
          await fsp.chmod(file, 0o644);
          bot.requirements = true;
          bot.size = await this.hosting.size(bot);
          this.db.save();
        } finally { await fsp.rm(temporary, { force: true }).catch(() => {}); }
        await this.api.send(ctx.chatId, `📦 ${h(line)} added. Rebuilding container dependencies...`);
      }
      await this.hosting.restart(bot);
      this.db.audit(uid, state.kind, `Bot ${bot.id}`);
      await this.api.send(ctx.chatId, '✅ Container restarted.',
        keyboard([[button('⚙️ Control Panel', `bot:panel:${bot.id}`)]]));
      return true;
    }

    if (!isAdmin(uid)) throw new Error('Admin access required.');

    if (state.kind === 'userPrompt' || state.kind === 'planUserPrompt' || state.kind === 'balancePrompt') {
      const target = text.trim();
      if (!d.users[target]) throw new Error('User ID not found.');
      const action = state.kind === 'userPrompt' ? 'user' :
        state.kind === 'planUserPrompt' ? 'planUser' : 'balanceUser';
      await this.admin(ctx, [action, target]);
      return true;
    }
    if (state.kind === 'balanceAmount') {
      const amount = Number(text.trim());
      const target = d.users[state.targetId];
      if (!target || !Number.isInteger(amount) || !amount || Math.abs(amount) > 100_000 ||
          target.wallet + amount < 0) throw new Error('Invalid amount or insufficient balance.');
      target.wallet += amount;
      this.db.transaction(target.id, amount, 'Admin balance adjustment');
      this.db.audit(uid, 'balance_adjust', `${target.id}: ${amount}`);
      await this.api.send(ctx.chatId, `✅ Balance: ৳${target.wallet}`);
      await this.api.send(target.id, `💰 Your wallet balance was adjusted by ৳${amount}.`).catch(() => {});
      return true;
    }
    if (state.kind === 'editPlan') {
      const fields = text.trim().split(/\s+/);
      if (fields.length !== 7 || !d.plans[fields[0].toUpperCase()]) throw new Error('Expected: PLAN PRICE DAYS BOTS STORAGE_MB RAM_MB CPU');
      const [name, ...values] = fields;
      const [price, days, bots, storageMB, ramMB, cpu] = values.map(Number);
      if (![price, days, bots, storageMB, ramMB, cpu].every(Number.isFinite) ||
          price < 0 || days < 0 || bots < 1 || bots > 100 || storageMB < 10 ||
          ramMB < 64 || ramMB > 512 || cpu < 0.2 || cpu > 2) throw new Error('Plan values are out of range.');
      d.plans[name.toUpperCase()] = { price, days, bots, storageMB, ramMB, cpu };
      this.db.audit(uid, 'plan_edit', text);
      await this.api.send(ctx.chatId, '✅ Plan updated.');
      return true;
    }
    if (state.kind === 'newCoupon') {
      const [codeInput, type, rawValue, rawLimit, rawDays] = text.trim().split(/\s+/);
      const code = codeInput?.toUpperCase();
      const [value, limit, days] = [rawValue, rawLimit, rawDays].map(Number);
      if (!/^[A-Z0-9_-]{3,30}$/.test(code || '') || !['BALANCE', 'BOTS'].includes(type) ||
          !Number.isInteger(value) || value < 1 || value > 10_000 ||
          !Number.isInteger(limit) || limit < 1 || !Number.isInteger(days) || days < 1 ||
          d.coupons[code]) throw new Error('Invalid coupon details or code already exists.');
      d.coupons[code] = { type, value, limit, used: 0, expires: now() + days * 86_400_000 };
      this.db.audit(uid, 'coupon_create', code);
      await this.api.send(ctx.chatId, `✅ Coupon ${h(code)} created.`);
      return true;
    }
    if (state.kind === 'reqId') {
      const chatId = text.trim();
      if (!/^-100\d{5,20}$/.test(chatId)) throw new Error('Send a numeric -100… channel/group ID.');
      const chat = await this.api.call('getChat', { chat_id: chatId });
      const membership = await this.api.call('getChatMember', {
        chat_id: chatId, user_id: Number(this.botId)
      });
      if (!['administrator', 'creator'].includes(membership.status)) {
        throw new Error('Make the bot an administrator in this channel/group first.');
      }
      this.session(uid, 'reqLink', {
        type: state.type, chatId, name: chat.title || 'Required Chat',
        username: chat.username || ''
      });
      await this.api.send(ctx.chatId,
        `✅ Chat detected: ${h(chat.title || chatId)}\n\nSend its invite link, or send <code>auto</code> for a public @username link.`);
      return true;
    }
    if (state.kind === 'reqLink') {
      const link = text.trim().toLowerCase() === 'auto' && state.username
        ? `https://t.me/${state.username}` : text.trim();
      if (!/^https:\/\/t\.me\/[A-Za-z0-9_+/-]{3,150}$/.test(link)) {
        throw new Error('Send a valid https://t.me/... link.');
      }
      if (d.requirements.some(r => r.chatId === state.chatId)) throw new Error('This chat is already required.');
      const requirement = {
        id: d.next.requirement++, type: state.type, chatId: state.chatId,
        name: state.name, link, active: true
      };
      d.requirements.push(requirement);
      this.db.audit(uid, 'requirement_add', `${state.chatId} ${state.type}`);
      await this.api.send(ctx.chatId, `✅ ${h(state.type)} added: ${h(state.name)}.`,
        keyboard([[button('⚙️ Manage', `admin:requirement:${requirement.id}`)]]));
      return true;
    }
    if (state.kind === 'linkReq' || state.kind === 'renameReq') {
      const r = d.requirements.find(x => String(x.id) === String(state.requirementId));
      if (!r) throw new Error('Requirement not found.');
      if (state.kind === 'linkReq') {
        if (!/^https:\/\/t\.me\/[A-Za-z0-9_+/-]{3,150}$/.test(text.trim())) throw new Error('Invalid Telegram URL.');
        r.link = text.trim();
      } else {
        if (text.trim().length < 2 || text.trim().length > 80) throw new Error('Name must be 2–80 characters.');
        r.name = text.trim();
      }
      this.db.audit(uid, 'requirement_edit', r.id);
      await this.admin(ctx, ['requirement', String(r.id)]);
      return true;
    }
    if (state.kind === 'replyTicket') {
      const ticket = d.tickets[state.ticketId];
      if (!ticket) throw new Error('Ticket not found.');
      ticket.reply = text.slice(0, 1800);
      ticket.status = 'resolved';
      ticket.repliedAt = now();
      this.db.audit(uid, 'ticket_reply', ticket.id);
      await this.api.send(ticket.user,
        `🎫 <b>SUPPORT REPLY #${ticket.id}</b>\n\n${h(ticket.reply)}`).catch(() => {});
      await this.api.send(ctx.chatId, '✅ Reply sent; ticket marked resolved.');
      return true;
    }
    if (state.kind === 'broadcast') {
      if (text.length > 3500) throw new Error('Broadcast exceeds 3,500 characters.');
      let delivered = 0, failed = 0;
      await this.api.send(ctx.chatId, `📢 Broadcasting to ${Object.keys(d.users).length} users...`);
      for (const target of Object.values(d.users)) {
        try {
          await this.api.send(target.id, `📢 <b>ANNOUNCEMENT</b>\n\n${h(text)}`);
          delivered++;
        } catch { failed++; }
        await sleep(60);
      }
      this.db.audit(uid, 'broadcast', `Delivered ${delivered}, failed ${failed}`);
      await this.api.send(ctx.chatId, `✅ Broadcast complete: ${delivered} delivered, ${failed} failed.`);
      return true;
    }
    if (state.kind === 'setSupport' || state.kind === 'setSupportChannel') {
      const value = text.trim();
      if (!/^(@[A-Za-z0-9_]{5,32}|https:\/\/\S{5,200})$/.test(value)) throw new Error('Send a valid @username or HTTPS URL.');
      d.settings[state.kind === 'setSupport' ? 'support' : 'supportChannel'] = value;
      this.db.audit(uid, 'support_setting', state.kind);
      await this.api.send(ctx.chatId, '✅ Support setting saved.');
      return true;
    }
    if (state.kind === 'addMethod') {
      const [name, number] = text.split('|').map(x => x?.trim());
      if (!name || !number || name.length > 25 || !/^[+0-9 -]{8,25}$/.test(number)) {
        throw new Error('Use: Method Name | Payment Number');
      }
      d.methods[name] = { number, enabled: true };
      this.db.audit(uid, 'payment_method_edit', name);
      await this.api.send(ctx.chatId, `✅ ${h(name)} saved.`);
      return true;
    }
    if (state.kind === 'addProduct') {
      const [name, rawPrice, description] = text.split('|').map(x => x?.trim());
      const price = Number(rawPrice);
      if (!name || name.length > 70 || !Number.isInteger(price) || price < 0 ||
          !description || description.length > 500) throw new Error('Use: Product Name | Integer Price | Description');
      d.products.push({ id: d.next.product++, name, price, description });
      this.db.audit(uid, 'product_add', name);
      await this.api.send(ctx.chatId, '✅ Shop product added.');
      return true;
    }
    return false;
  }

  async callback(ctx, data) {
    const [section, action, ...rest] = data.split(':');
    const user = ctx.user;
    if (section !== 'verify' && !await this.gate(user, ctx)) return;
    if (user.suspended && !isAdmin(user.id)) throw new Error('Your account is suspended. Contact support.');
    if (section !== 'admin') this.clear(user.id);

    if (section === 'verify') {
      if (await this.gate(user, ctx)) await this.welcome(ctx, true);
      return;
    }
    if (section === 'menu') return this.welcome(ctx);
    if (section === 'bots') return this.listBots(ctx);
    if (section === 'upload') return this.uploadPrompt(ctx);
    if (section === 'plan') return this.choosePlan(ctx, action);
    if (section === 'plans') return this.plans(ctx);
    if (section === 'buy') return this.plans(ctx, true);
    if (section === 'choose') return this.choosePlan(ctx, action);
    if (section === 'pay') return this.paymentPrompt(ctx, action, decodeURIComponent(rest[0]));
    if (section === 'walletBuy') {
      const plan = this.db.data.plans[action];
      if (!plan || action === 'FREE') throw new Error('Invalid plan.');
      if (user.wallet < plan.price) throw new Error('Insufficient wallet balance.');
      user.wallet -= plan.price;
      user.plan = action;
      user.planUntil = Math.max(now(), user.planUntil || 0) + plan.days * 86_400_000;
      this.db.transaction(user.id, -plan.price, `${action} plan purchase`);
      this.db.audit(user.id, 'wallet_plan_purchase', action);
      return this.api.show(ctx, `🎉 ${h(action)} activated!\nValid until: ${fmtDate(user.planUntil)}`, keyboard([back()]));
    }
    if (section === 'topup') return this.topupMethods(ctx);
    if (section === 'topupMethod') {
      const method = decodeURIComponent(action);
      if (!this.db.data.methods[method]?.enabled) throw new Error('Payment method unavailable.');
      this.session(user.id, 'topupAmount', { methodName: method });
      return this.api.show(ctx, `➕ Send the amount to deposit using ${h(method)}.`, keyboard([back('wallet')]));
    }
    if (section === 'wallet') return this.wallet(ctx);
    if (section === 'referral') return this.referral(ctx);
    if (section === 'profile') return this.profile(ctx);
    if (section === 'stats') return this.myStats(ctx);
    if (section === 'tickets') return this.tickets(ctx);
    if (section === 'ticketNew') {
      this.session(user.id, 'ticket');
      return this.api.show(ctx, '🎫 Send your support request (5–1,800 characters).', keyboard([back('tickets')]));
    }
    if (section === 'coupon') return this.couponPrompt(ctx);
    if (section === 'bot') return this.handleBot(ctx, [action, rest[0]]);
    if (section === 'admin') return this.admin(ctx, [action, ...rest]);
    if (section === 'shop') {
      return this.api.show(ctx,
        `🛍 <b>SHOP</b>\n\n${this.db.data.products.map(p =>
          `🛍 <b>${h(p.name)}</b> — ৳${p.price}\n${h(p.description)}`).join('\n\n') || 'No products are listed yet.'}\n\n` +
        `To order a service, create a support ticket. No automatic shop payment is charged.`,
        keyboard([[button('🎫 Create Ticket', 'ticketNew')], back()]));
    }
    if (section === 'trial') {
      return this.api.show(ctx,
        `🎁 <b>FREE TRIAL</b>\n\nYour FREE plan already includes one bot slot with no expiry. ` +
        `Earn another slot for every 10 verified referrals.`,
        keyboard([[button('📤 Upload Bot', 'upload')], back()]));
    }
    if (section === 'support') {
      const contact = this.db.data.settings.support;
      const channel = this.db.data.settings.supportChannel;
      return this.api.show(ctx,
        `🛠 <b>SUPPORT</b>\n\n${contact ? `💬 Contact: ${h(contact)}\n` : ''}` +
        `${channel ? `📢 Channel: ${h(channel)}\n` : ''}` +
        `🎫 Create a support ticket for help.`,
        keyboard([[button('🎫 New Ticket', 'ticketNew')], back()]));
    }
    if (section === 'help') {
      return this.api.show(ctx,
        `❓ <b>HELP</b>\n\n` +
        `📤 Upload a .py file or a .zip Python project containing a Python entry file.\n` +
        `📦 Add requirements.txt inside the ZIP or through Files after upload.\n` +
        `🚀 Bots start automatically in resource-limited Docker containers.\n` +
        `⏹ Use the control panel to stop, start, or restart a bot.\n` +
        `⚡ Refresh Live Logs to view recent output and startup errors.\n` +
        `⚙️ Set environment variables as NAME=value; sensitive values are masked.\n` +
        `📦 Install Pkg updates requirements.txt and rebuilds the container.\n` +
        `🔗 Clone copies your bot without changing the original.\n` +
        `⬇️ Download exports project files as a ZIP archive.\n` +
        `❌ Delete requires confirmation and permanently removes the bot.\n` +
        `💎 Plan limits apply to bot count, storage, RAM, and CPU.\n` +
        `💳 bKash/Nagad payment requests require manual admin approval.\n` +
        `⏰ Cron jobs are not enabled in this deployment.`,
        keyboard([back()]));
    }
  }

  async message(ctx) {
    const message = ctx.message;
    const text = message.text?.trim() || '';
    const document = message.document;
    const media = message.photo?.length
      ? { type: 'photo', fileId: message.photo.at(-1).file_id }
      : message.video ? { type: 'video', fileId: message.video.file_id } : null;

    if (/^\/(start|cancel)(?:@\w+)?(?:\s|$)/i.test(text)) {
      this.clear(ctx.user.id);
      if (/^\/cancel/i.test(text)) {
        await this.api.send(ctx.chatId, '✅ Current action cancelled.');
        return;
      }
      const match = text.match(/^\/start(?:@\w+)?(?:\s+ref_(\d+))?/i);
      if (match?.[1] && !ctx.user.referrer && !ctx.user.referralConfirmed &&
          match[1] !== ctx.user.id && this.db.data.users[match[1]]) {
        ctx.user.referrer = match[1];
        this.db.save();
      }
      if (await this.gate(ctx.user, ctx)) await this.welcome(ctx);
      return;
    }

    if (!await this.gate(ctx.user, ctx)) return;
    if (ctx.user.suspended && !isAdmin(ctx.user.id)) {
      await this.api.send(ctx.chatId, '🔴 Your account is suspended. Contact support.');
      return;
    }

    if (await this.handleSession(ctx, text, document, media)) return;

    if (document) {
      await this.api.send(ctx.chatId, '📤 Tap Upload Bot first, then send your .py or .zip document.');
      return;
    }

    // Strip emojis and whitespace to obtain a plain label, then match against
    // the known plain menu labels.
    const label = stripEmojis(text);
    const choices = {
      'My Bots': 'bots',
      'Upload Bot': 'upload',
      'Plans': 'plans',
      'Buy Plan': 'buy',
      'Referral': 'referral',
      'Profile': 'profile',
      'Wallet': 'wallet',
      'Tickets': 'tickets',
      'Free Trial': 'trial',
      'Coupon': 'coupon',
      'Help': 'help',
      'Support': 'support',
      'My Stats': 'stats',
      'Shop': 'shop',
      'ADMIN PANEL': 'admin:panel'
    };
    // Accept exact match, or label that contains/endswith a known key.
    const key = Object.keys(choices).find(k => label === k || label.endsWith(k) || label.startsWith(k));
    if (key) {
      return this.callback(ctx, choices[key]);
    }
    await this.api.send(ctx.chatId, 'Choose an option from the menu, or send /start to reopen it.');
  }

  async update(update) {
    const callback = update.callback_query;
    const message = callback?.message || update.message;
    const from = callback?.from || message?.from;
    if (!message || !from || message.chat?.type !== 'private') {
      if (callback) await this.api.answer(callback.id, 'Use the bot in a private chat.');
      return;
    }

    const user = this.db.user(from);
    const ctx = { user, chatId: message.chat.id, message, callback };
    if (callback) await this.api.answer(callback.id);

    try {
      if (callback) await this.callback(ctx, callback.data || '');
      else await this.message(ctx);
    } catch (error) {
      console.error(`Update ${update.update_id}:`, error);
      try {
        await this.api.send(ctx.chatId, `❌ ${h(short(error.message, 1200))}`);
      } catch (sendError) {
        console.error('Could not report error to user:', sendError.message);
      }
    }
  }

  async run() {
    const me = await this.api.call('getMe');
    this.username = me.username || CONFIG.username;
    this.botId = String(me.id);
    await this.api.call('deleteWebhook', { drop_pending_updates: false });
    console.log(`${CONFIG.name} started as @${this.username}. Docker ready: ${await this.hosting.available()}`);

    let errors = 0;
    while (true) {
      try {
        const updates = await this.api.call('getUpdates', {
          offset: this.offset, timeout: CONFIG.pollingTimeout,
          allowed_updates: ['message', 'callback_query']
        }, 42_000);
        errors = 0;
        for (const update of updates) {
          this.offset = update.update_id + 1;
          await this.update(update);
        }
      } catch (error) {
        console.error('Polling:', error.message);
        errors++;
        await sleep(error.retryAfter
          ? Math.min(60_000, error.retryAfter * 1000)
          : Math.min(30_000, 1000 * 2 ** Math.min(errors, 5)));
      }
    }
  }
}

async function main() {
  if (!CONFIG.token || !/^\d+:[A-Za-z0-9_-]+$/.test(CONFIG.token)) {
    throw new Error('Set a valid BOT_TOKEN environment variable before starting.');
  }
  await fsp.mkdir(CONFIG.dataDir, { recursive: true, mode: 0o700 });
  await fsp.mkdir(HOSTING_DIR, { recursive: true, mode: 0o700 });
  await fsp.mkdir(TMP_DIR, { recursive: true, mode: 0o700 });
  const app = new Application();
  await app.run();
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exitCode = 1;
});
