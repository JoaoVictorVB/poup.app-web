#!/bin/bash

#############################################################
# Script de Hardening Automático - Poup.App
# Versão: 1.0
# Data: 17/11/2025
# 
# ATENÇÃO: Execute como root
# IMPORTANTE: Faça backup antes de executar!
#############################################################

set -e  # Parar em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funções auxiliares
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[OK]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se é root
if [[ $EUID -ne 0 ]]; then
   log_error "Este script deve ser executado como root (use sudo)"
   exit 1
fi

echo "============================================================"
echo "   HARDENING AUTOMÁTICO - POUP.APP"
echo "   Data: $(date '+%Y-%m-%d %H:%M:%S')"
echo "============================================================"
echo ""

log_warning "Este script fará alterações significativas no sistema!"
log_warning "Certifique-se de ter um backup antes de continuar."
echo ""
read -p "Deseja continuar? (s/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[SsYy]$ ]]; then
    log_info "Operação cancelada pelo usuário"
    exit 0
fi

# Criar diretório de backup
BACKUP_DIR="/root/hardening-backup-$(date '+%Y%m%d_%H%M%S')"
mkdir -p "$BACKUP_DIR"
log_info "Backups serão salvos em: $BACKUP_DIR"

echo ""
echo "============================================================"
echo "   FASE 1: ATUALIZAÇÃO DO SISTEMA"
echo "============================================================"
echo ""

log_info "Atualizando repositórios..."
apt update > "$BACKUP_DIR/apt-update.log" 2>&1
log_success "Repositórios atualizados"

log_info "Instalando atualizações de segurança..."
DEBIAN_FRONTEND=noninteractive apt upgrade -y > "$BACKUP_DIR/apt-upgrade.log" 2>&1
log_success "Sistema atualizado"

log_info "Configurando updates automáticos..."
apt install -y unattended-upgrades apt-listchanges > /dev/null 2>&1

cat > /etc/apt/apt.conf.d/50unattended-upgrades << 'EOF'
Unattended-Upgrade::Allowed-Origins {
    "${distro_id}:${distro_codename}-security";
};
Unattended-Upgrade::AutoFixInterruptedDpkg "true";
Unattended-Upgrade::MinimalSteps "true";
Unattended-Upgrade::Remove-Unused-Dependencies "true";
Unattended-Upgrade::Automatic-Reboot "false";
EOF

cat > /etc/apt/apt.conf.d/20auto-upgrades << 'EOF'
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
APT::Periodic::AutocleanInterval "7";
EOF

systemctl enable unattended-upgrades
systemctl start unattended-upgrades
log_success "Updates automáticos configurados"

echo ""
echo "============================================================"
echo "   FASE 2: FIREWALL (UFW)"
echo "============================================================"
echo ""

log_info "Instalando UFW..."
apt install -y ufw > /dev/null 2>&1

# Backup de regras existentes (se houver)
if [ -f /etc/ufw/user.rules ]; then
    cp /etc/ufw/user.rules "$BACKUP_DIR/ufw-user.rules.backup"
fi

log_info "Configurando regras de firewall..."
ufw --force reset > /dev/null 2>&1

# Regras padrão
ufw default deny incoming
ufw default allow outgoing

# Permitir SSH (WARNING: não bloquear sua própria conexão!)
ufw allow 22/tcp comment 'SSH'

# HTTP/HTTPS
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'

# Proteções adicionais
cat >> /etc/ufw/before.rules << 'EOF'

# Proteção contra port scan
-A ufw-before-input -p tcp --tcp-flags ALL NONE -j DROP
-A ufw-before-input -p tcp ! --syn -m state --state NEW -j DROP
-A ufw-before-input -p tcp --tcp-flags ALL ALL -j DROP

# Proteção contra ping flood
-A ufw-before-input -p icmp --icmp-type echo-request -m limit --limit 1/s -j ACCEPT
-A ufw-before-input -p icmp --icmp-type echo-request -j DROP

# Proteção SYN flood
-A ufw-before-input -p tcp --syn -m limit --limit 1/s -j ACCEPT
-A ufw-before-input -p tcp --syn -j DROP
EOF

ufw --force enable
log_success "Firewall configurado e ativado"

echo ""
echo "============================================================"
echo "   FASE 3: SSH HARDENING"
echo "============================================================"
echo ""

cp /etc/ssh/sshd_config "$BACKUP_DIR/sshd_config.backup"
log_info "Backup SSH criado"

log_info "Aplicando configurações SSH seguras..."

# Criar configuração hardened
cat > /etc/ssh/sshd_config << 'EOF'
# Porta SSH
Port 22

# Protocolo
Protocol 2

# Autenticação
PubkeyAuthentication yes
PasswordAuthentication yes
PermitEmptyPasswords no
ChallengeResponseAuthentication no
UsePAM yes

# Root login
PermitRootLogin no

# Limites
MaxAuthTries 3
MaxSessions 2
LoginGraceTime 30
MaxStartups 10:30:60

# Recursos desabilitados
X11Forwarding no
AllowTcpForwarding no
PermitTunnel no

# Logging
SyslogFacility AUTH
LogLevel VERBOSE

# Cifras seguras
Ciphers chacha20-poly1305@openssh.com,aes256-gcm@openssh.com,aes128-gcm@openssh.com
MACs hmac-sha2-512-etm@openssh.com,hmac-sha2-256-etm@openssh.com
KexAlgorithms curve25519-sha256,curve25519-sha256@libssh.org,diffie-hellman-group-exchange-sha256

# Timeout
ClientAliveInterval 300
ClientAliveCountMax 2

# Banner
Banner /etc/ssh/banner

# Subsystems
Subsystem sftp /usr/lib/openssh/sftp-server
EOF

cat > /etc/ssh/banner << 'EOF'
***************************************************************************
                    ACESSO AUTORIZADO APENAS
        Acesso não autorizado é proibido por lei
***************************************************************************
EOF

# Validar configuração
if sshd -t; then
    systemctl restart sshd
    log_success "SSH configurado com segurança"
else
    log_error "Erro na configuração SSH! Restaurando backup..."
    cp "$BACKUP_DIR/sshd_config.backup" /etc/ssh/sshd_config
    systemctl restart sshd
    log_warning "Configuração SSH não aplicada"
fi

echo ""
echo "============================================================"
echo "   FASE 4: FAIL2BAN"
echo "============================================================"
echo ""

log_info "Instalando Fail2Ban..."
apt install -y fail2ban > /dev/null 2>&1

log_info "Configurando Fail2Ban..."
cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5
destemail = admin@poup.app
sendername = Fail2Ban-PoupApp
action = %(action_mwl)s

[sshd]
enabled = true
port = 22
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 86400
EOF

systemctl enable fail2ban
systemctl restart fail2ban
log_success "Fail2Ban configurado"

echo ""
echo "============================================================"
echo "   FASE 5: ANTIVÍRUS (ClamAV)"
echo "============================================================"
echo ""

log_info "Instalando ClamAV..."
apt install -y clamav clamav-daemon > /dev/null 2>&1

log_info "Atualizando definições de vírus..."
systemctl stop clamav-freshclam
freshclam > "$BACKUP_DIR/freshclam.log" 2>&1 || true
systemctl start clamav-freshclam
systemctl enable clamav-freshclam
log_success "ClamAV instalado"

# Script de scan diário
cat > /usr/local/bin/clamav-scan.sh << 'EOF'
#!/bin/bash
LOG="/var/log/clamav/daily-scan.log"
mkdir -p /var/log/clamav
echo "=== Scan $(date) ===" >> $LOG
clamscan -r -i /home /var/www /opt 2>&1 | grep -E "FOUND|Infected" >> $LOG || echo "Clean" >> $LOG
EOF

chmod +x /usr/local/bin/clamav-scan.sh

# Agendar scan diário
cat > /etc/cron.d/clamav-daily << 'EOF'
0 2 * * * root /usr/local/bin/clamav-scan.sh
EOF

log_success "Scan diário agendado (02:00)"

echo ""
echo "============================================================"
echo "   FASE 6: PROTEÇÃO DO BANCO DE DADOS"
echo "============================================================"
echo ""

if systemctl is-active --quiet mysql; then
    log_info "MySQL detectado, aplicando hardening..."
    
    cp /etc/mysql/mysql.conf.d/mysqld.cnf "$BACKUP_DIR/mysqld.cnf.backup" 2>/dev/null || true
    
    # Verificar se já está configurado
    if ! grep -q "^bind-address.*127.0.0.1" /etc/mysql/mysql.conf.d/mysqld.cnf; then
        cat >> /etc/mysql/mysql.conf.d/mysqld.cnf << 'EOF'

# Hardening
bind-address = 127.0.0.1
skip-name-resolve = 1
local-infile = 0
max_connections = 50
EOF
        systemctl restart mysql
        log_success "MySQL configurado (bind localhost)"
    else
        log_info "MySQL já está protegido"
    fi
else
    log_info "MySQL não detectado, pulando..."
fi

echo ""
echo "============================================================"
echo "   FASE 7: PERMISSÕES DE ARQUIVOS"
echo "============================================================"
echo ""

log_info "Corrigindo permissões de arquivos críticos..."

# Sistema
chmod 644 /etc/passwd 2>/dev/null
chmod 644 /etc/group 2>/dev/null
chmod 640 /etc/shadow 2>/dev/null
chmod 640 /etc/gshadow 2>/dev/null

# SSH
if [ -d /root/.ssh ]; then
    chmod 700 /root/.ssh
    chmod 600 /root/.ssh/* 2>/dev/null || true
fi

# Logs
chmod 750 /var/log 2>/dev/null

log_success "Permissões corrigidas"

echo ""
echo "============================================================"
echo "   FASE 8: OTIMIZAÇÕES DE KERNEL"
echo "============================================================"
echo ""

log_info "Aplicando otimizações de segurança no kernel..."

cp /etc/sysctl.conf "$BACKUP_DIR/sysctl.conf.backup"

cat >> /etc/sysctl.conf << 'EOF'

# === HARDENING POUP.APP ===
# Proteção IP spoofing
net.ipv4.conf.all.rp_filter = 1
net.ipv4.conf.default.rp_filter = 1

# Ignorar ICMP redirects
net.ipv4.conf.all.accept_redirects = 0
net.ipv4.conf.all.secure_redirects = 0
net.ipv4.conf.all.send_redirects = 0

# Proteção SYN flood
net.ipv4.tcp_syncookies = 1
net.ipv4.tcp_max_syn_backlog = 2048
net.ipv4.tcp_synack_retries = 2

# Log packets suspeitos
net.ipv4.conf.all.log_martians = 1

# Desabilitar source routing
net.ipv4.conf.all.accept_source_route = 0

# ASLR
kernel.randomize_va_space = 2
EOF

sysctl -p > /dev/null 2>&1
log_success "Kernel otimizado"

echo ""
echo "============================================================"
echo "   FASE 9: DESABILITAR SERVIÇOS DESNECESSÁRIOS"
echo "============================================================"
echo ""

SERVICES=("bluetooth" "cups" "avahi-daemon")

for service in "${SERVICES[@]}"; do
    if systemctl is-active --quiet $service 2>/dev/null; then
        systemctl stop $service
        systemctl disable $service
        log_success "$service desabilitado"
    fi
done

echo ""
echo "============================================================"
echo "   RESUMO DO HARDENING"
echo "============================================================"
echo ""

log_success "Hardening concluído com sucesso!"
echo ""
echo "Componentes configurados:"
echo "  ✓ Sistema atualizado"
echo "  ✓ Updates automáticos ativados"
echo "  ✓ Firewall UFW configurado"
echo "  ✓ SSH hardened"
echo "  ✓ Fail2Ban ativo"
echo "  ✓ ClamAV instalado"
echo "  ✓ MySQL protegido (se instalado)"
echo "  ✓ Permissões corrigidas"
echo "  ✓ Kernel otimizado"
echo "  ✓ Serviços desnecessários desabilitados"
echo ""
echo "Backups salvos em: $BACKUP_DIR"
echo ""

log_warning "PRÓXIMOS PASSOS MANUAIS:"
echo ""
echo "1. Configurar chaves SSH:"
echo "   ssh-keygen -t ed25519"
echo "   Copiar chave pública para ~/.ssh/authorized_keys"
echo ""
echo "2. Desabilitar senha SSH (após configurar chaves):"
echo "   Editar /etc/ssh/sshd_config"
echo "   PasswordAuthentication no"
echo "   systemctl restart sshd"
echo ""
echo "3. Executar mysql_secure_installation"
echo ""
echo "4. Verificar status:"
echo "   sudo ufw status"
echo "   sudo fail2ban-client status"
echo "   sudo systemctl status clamav-daemon"
echo ""
echo "5. Executar análise de segurança:"
echo "   sudo bash security-scan.sh"
echo ""

log_info "Hardening finalizado em $(date '+%Y-%m-%d %H:%M:%S')"
