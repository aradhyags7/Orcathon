import subprocess
import re

p = subprocess.run(['git', 'log', '-p', '--all'], capture_output=True, text=True, errors='replace')
diff = p.stdout

patterns = [
    r'apt_[a-zA-Z0-9_\-]{16,}',
    r'pt_live_[a-zA-Z0-9_\-]{16,}',
    r'sk-[a-zA-Z0-9]{20,}',
    r'api_key\s*[:=]\s*["\'][a-zA-Z0-9_\-]{16,}["\']',
]

hits = []
current_commit = 'unknown'
current_file = 'unknown'

for line in diff.splitlines():
    if line.startswith('commit '):
        current_commit = line.split()[1]
    elif line.startswith('diff --git '):
        parts = line.split()
        if len(parts) >= 3:
            current_file = parts[2]
    for pat in patterns:
        m = re.search(pat, line, re.IGNORECASE)
        if m:
            val = m.group(0)
            if 'ADAPTION_API_KEY' in line or 'your_adaption' in line or 'placeholder' in line:
                continue
            hits.append((current_commit, current_file, val[:6] + '...[REDACTED]'))

print(f"Total secret hits found: {len(hits)}")
for c, f, r in hits:
    print(f"Commit: {c[:8]} | File: {f} | Match: {r}")
