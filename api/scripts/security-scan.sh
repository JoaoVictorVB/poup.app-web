#!/bin/bash

# Script de Análise de Segurança - Poup.App
# Executar como root ou com sudo

echo "================================================"
echo "   ANÁLISE DE SEGURANÇA - POUP.APP"
echo "   Data: $(date '+%Y-%m-%d %H:%M:%S')"
echo "================================================"
echo ""

# Criar diretório para relatórios
REPORT_DIR="./security-reports/$(date '+%Y%m%d_%H%M%S')"
mkdir -p "$REPORT_DIR"

echo "[1/8] Verificando atualizações do sistema..."
apt update > "$REPORT_DIR/apt-update.log" 2>&1
apt list --upgradable > "$REPORT_DIR/upgradable-packages.txt"
UPGRADES=$(apt list --upgradable 2>/dev/null | wc -l)
echo "   ✓ $UPGRADES pacotes podem ser atualizados"

echo ""
echo "[2/8] Analisando segurança do sistema (Lynis)..."
if command -v lynis &> /dev/null; then
    lynis audit system --quick --quiet > "$REPORT_DIR/lynis-report.txt" 2>&1
    LYNIS_SCORE=$(grep "Hardening index" "$REPORT_DIR/lynis-report.txt" | grep -oP '\d+')
    echo "   ✓ Índice de hardening: ${LYNIS_SCORE:-N/A}"
else
    echo "   ⚠ Lynis não instalado. Execute: sudo apt install lynis"
fi

echo ""
echo "[3/8] Verificando rootkits (chkrootkit)..."
if command -v chkrootkit &> /dev/null; then
    chkrootkit > "$REPORT_DIR/chkrootkit-report.txt" 2>&1
    INFECTIONS=$(grep -c "INFECTED" "$REPORT_DIR/chkrootkit-report.txt" || echo "0")
    if [ "$INFECTIONS" -eq "0" ]; then
        echo "   ✓ Nenhum rootkit detectado"
    else
        echo "   ⚠ $INFECTIONS possíveis infecções detectadas!"
    fi
else
    echo "   ⚠ chkrootkit não instalado. Execute: sudo apt install chkrootkit"
fi

echo ""
echo "[4/8] Scan de malware (ClamAV)..."
if command -v clamscan &> /dev/null; then
    echo "   Atualizando definições..."
    freshclam > "$REPORT_DIR/freshclam.log" 2>&1
    echo "   Executando scan (pode demorar)..."
    clamscan -r -i --exclude-dir="^/sys" --exclude-dir="^/proc" \
             /home /var/www /opt > "$REPORT_DIR/clamav-report.txt" 2>&1
    INFECTED=$(grep "Infected files:" "$REPORT_DIR/clamav-report.txt" | grep -oP '\d+')
    if [ "${INFECTED:-0}" -eq "0" ]; then
        echo "   ✓ Nenhum malware detectado"
    else
        echo "   ⚠ $INFECTED arquivos infectados!"
    fi
else
    echo "   ⚠ ClamAV não instalado. Execute: sudo apt install clamav clamav-daemon"
fi

echo ""
echo "[5/8] Verificando portas abertas..."
netstat -tulpn | grep LISTEN > "$REPORT_DIR/open-ports.txt" 2>&1
OPEN_PORTS=$(netstat -tulpn | grep LISTEN | wc -l)
echo "   ✓ $OPEN_PORTS portas escutando"

# Verificar portas críticas
echo "   Verificando exposição de serviços críticos..."
MYSQL_EXPOSED=$(netstat -tulpn | grep ":3306" | grep -v "127.0.0.1" | wc -l)
if [ "$MYSQL_EXPOSED" -gt "0" ]; then
    echo "   ⚠ CRÍTICO: MySQL exposto externamente!"
else
    echo "   ✓ MySQL não exposto"
fi

echo ""
echo "[6/8] Verificando firewall..."
if command -v ufw &> /dev/null; then
    ufw status verbose > "$REPORT_DIR/firewall-status.txt" 2>&1
    UFW_STATUS=$(ufw status | grep -oP "Status: \K\w+")
    if [ "$UFW_STATUS" = "active" ]; then
        echo "   ✓ UFW ativo"
    else
        echo "   ⚠ UFW inativo!"
    fi
else
    echo "   ⚠ UFW não instalado"
fi

echo ""
echo "[7/8] Verificando usuários e permissões..."
# Usuários com shell
awk -F: '$7 !~ /(nologin|false)/ {print $1}' /etc/passwd > "$REPORT_DIR/users-with-shell.txt"
USERS_WITH_SHELL=$(wc -l < "$REPORT_DIR/users-with-shell.txt")
echo "   ℹ $USERS_WITH_SHELL usuários com shell"

# Arquivos SUID
find / -perm /6000 -type f 2>/dev/null > "$REPORT_DIR/suid-files.txt"
SUID_FILES=$(wc -l < "$REPORT_DIR/suid-files.txt")
echo "   ℹ $SUID_FILES arquivos com SUID/SGID"

# Arquivos world-writable
find / -xdev -type f -perm -0002 2>/dev/null > "$REPORT_DIR/world-writable.txt"
WRITABLE=$(wc -l < "$REPORT_DIR/world-writable.txt")
if [ "$WRITABLE" -gt "0" ]; then
    echo "   ⚠ $WRITABLE arquivos world-writable encontrados"
else
    echo "   ✓ Nenhum arquivo world-writable"
fi

echo ""
echo "[8/8] Analisando dependências NPM..."
cd /path/to/poup.app-web/api || exit
npm audit --json > "$REPORT_DIR/npm-audit.json" 2>&1
npm audit > "$REPORT_DIR/npm-audit.txt" 2>&1

CRITICAL=$(grep -oP '"critical":\K\d+' "$REPORT_DIR/npm-audit.json" | head -1)
HIGH=$(grep -oP '"high":\K\d+' "$REPORT_DIR/npm-audit.json" | head -1)
MODERATE=$(grep -oP '"moderate":\K\d+' "$REPORT_DIR/npm-audit.json" | head -1)
LOW=$(grep -oP '"low":\K\d+' "$REPORT_DIR/npm-audit.json" | head -1)

echo "   Vulnerabilidades encontradas:"
echo "   - Críticas: ${CRITICAL:-0}"
echo "   - Altas: ${HIGH:-0}"
echo "   - Médias: ${MODERATE:-0}"
echo "   - Baixas: ${LOW:-0}"

echo ""
echo "================================================"
echo "   RESUMO DA ANÁLISE"
echo "================================================"
echo ""
echo "Relatórios salvos em: $REPORT_DIR"
echo ""
echo "Próximos passos:"
echo "1. Revisar arquivos de relatório"
echo "2. Atualizar pacotes: sudo apt upgrade"
echo "3. Corrigir vulnerabilidades NPM: npm audit fix"
echo "4. Verificar configurações de firewall"
echo "5. Revisar usuários e permissões suspeitas"
echo ""
echo "================================================"

# Gerar resumo
cat > "$REPORT_DIR/SUMMARY.txt" << EOF
RESUMO DA ANÁLISE DE SEGURANÇA
Data: $(date '+%Y-%m-%d %H:%M:%S')

SISTEMA:
- Pacotes desatualizados: $UPGRADES
- Índice Lynis: ${LYNIS_SCORE:-N/A}
- Rootkits detectados: ${INFECTIONS:-N/A}
- Malware detectado: ${INFECTED:-0}

REDE:
- Portas abertas: $OPEN_PORTS
- MySQL exposto: $([ "$MYSQL_EXPOSED" -gt "0" ] && echo "SIM (CRÍTICO)" || echo "NÃO")
- Firewall: ${UFW_STATUS:-N/A}

PERMISSÕES:
- Usuários com shell: $USERS_WITH_SHELL
- Arquivos SUID: $SUID_FILES
- Arquivos world-writable: $WRITABLE

DEPENDÊNCIAS:
- Vulnerabilidades críticas: ${CRITICAL:-0}
- Vulnerabilidades altas: ${HIGH:-0}
- Vulnerabilidades médias: ${MODERATE:-0}
- Vulnerabilidades baixas: ${LOW:-0}

AÇÕES RECOMENDADAS:
$([ "$UPGRADES" -gt "10" ] && echo "- Atualizar sistema operacional" || echo "")
$([ "$MYSQL_EXPOSED" -gt "0" ] && echo "- URGENTE: Proteger MySQL (bind-address = 127.0.0.1)" || echo "")
$([ "$UFW_STATUS" != "active" ] && echo "- Ativar firewall UFW" || echo "")
$([ "${CRITICAL:-0}" -gt "0" ] && echo "- URGENTE: Corrigir vulnerabilidades críticas NPM" || echo "")
$([ "$WRITABLE" -gt "0" ] && echo "- Corrigir permissões de arquivos world-writable" || echo "")
EOF

cat "$REPORT_DIR/SUMMARY.txt"
