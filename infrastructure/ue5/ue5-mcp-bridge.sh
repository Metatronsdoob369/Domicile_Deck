#!/bin/bash
# UE5 MCP Bridge Manager
# Manages socat bridge for Docker → UE5 Remote Control on macOS
# Created: 2026-01-12

set -e

BRIDGE_PORT=30011
UE_PORT=30010
PIDFILE="/tmp/ue5-mcp-bridge.pid"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

function start_bridge() {
    if [ -f "$PIDFILE" ] && kill -0 $(cat "$PIDFILE") 2>/dev/null; then
        echo -e "${YELLOW}⚠️  Bridge already running (PID: $(cat $PIDFILE))${NC}"
        return 1
    fi

    echo -e "${BLUE}Starting UE5 MCP bridge...${NC}"

    # Start socat in background
    socat TCP4-LISTEN:$BRIDGE_PORT,fork,bind=0.0.0.0 TCP4:127.0.0.1:$UE_PORT > /dev/null 2>&1 &
    SOCAT_PID=$!

    # Save PID
    echo $SOCAT_PID > "$PIDFILE"

    # Verify it started
    sleep 1
    if kill -0 $SOCAT_PID 2>/dev/null; then
        echo -e "${GREEN}✅ Bridge started successfully (PID: $SOCAT_PID)${NC}"
        echo -e "   Forwarding: 0.0.0.0:$BRIDGE_PORT → 127.0.0.1:$UE_PORT"
    else
        echo -e "${RED}❌ Failed to start bridge${NC}"
        rm -f "$PIDFILE"
        return 1
    fi
}

function stop_bridge() {
    if [ ! -f "$PIDFILE" ]; then
        echo -e "${YELLOW}⚠️  No PID file found${NC}"
        # Try to kill by pattern anyway
        pkill -f "socat.*$BRIDGE_PORT.*$UE_PORT" && echo -e "${GREEN}✅ Bridge stopped${NC}" || echo -e "${RED}❌ No bridge process found${NC}"
        return
    fi

    PID=$(cat "$PIDFILE")

    if kill -0 $PID 2>/dev/null; then
        kill $PID
        rm -f "$PIDFILE"
        echo -e "${GREEN}✅ Bridge stopped (PID: $PID)${NC}"
    else
        echo -e "${YELLOW}⚠️  Bridge not running (stale PID file removed)${NC}"
        rm -f "$PIDFILE"
    fi
}

function status_bridge() {
    if [ -f "$PIDFILE" ]; then
        PID=$(cat "$PIDFILE")
        if kill -0 $PID 2>/dev/null; then
            echo -e "${GREEN}✅ Bridge is running${NC}"
            echo -e "   PID: $PID"
            echo -e "   Forwarding: 0.0.0.0:$BRIDGE_PORT → 127.0.0.1:$UE_PORT"

            # Check if port is actually listening
            if lsof -nP -iTCP:$BRIDGE_PORT -sTCP:LISTEN 2>/dev/null | grep -q socat; then
                echo -e "   Port $BRIDGE_PORT: ${GREEN}LISTENING${NC}"
            else
                echo -e "   Port $BRIDGE_PORT: ${RED}NOT LISTENING${NC}"
            fi

            # Check if UE5 is reachable
            if curl -s -m 2 http://127.0.0.1:$UE_PORT/remote/info > /dev/null 2>&1; then
                echo -e "   UE5 Remote Control: ${GREEN}RESPONDING${NC}"
            else
                echo -e "   UE5 Remote Control: ${YELLOW}NOT RESPONDING${NC}"
            fi

            return 0
        else
            echo -e "${RED}❌ Bridge not running (stale PID file)${NC}"
            rm -f "$PIDFILE"
            return 1
        fi
    else
        echo -e "${RED}❌ Bridge not running${NC}"
        return 1
    fi
}

function restart_bridge() {
    echo -e "${BLUE}Restarting bridge...${NC}"
    stop_bridge
    sleep 1
    start_bridge
}

function install_launchagent() {
    PLIST="$HOME/Library/LaunchAgents/com.nodeout.ue5-mcp-bridge.plist"

    echo -e "${BLUE}Installing LaunchAgent for auto-start on login...${NC}"

    mkdir -p "$HOME/Library/LaunchAgents"

    cat > "$PLIST" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.nodeout.ue5-mcp-bridge</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/socat</string>
        <string>TCP4-LISTEN:$BRIDGE_PORT,fork,bind=0.0.0.0</string>
        <string>TCP4:127.0.0.1:$UE_PORT</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/tmp/ue5-mcp-bridge.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/ue5-mcp-bridge.error.log</string>
</dict>
</plist>
EOF

    launchctl load "$PLIST" 2>/dev/null || true

    echo -e "${GREEN}✅ LaunchAgent installed${NC}"
    echo -e "   The bridge will now start automatically on login"
    echo -e "   To uninstall: launchctl unload $PLIST && rm $PLIST"
}

# Main command handling
case "${1:-}" in
    start)
        start_bridge
        ;;
    stop)
        stop_bridge
        ;;
    restart)
        restart_bridge
        ;;
    status)
        status_bridge
        ;;
    install)
        install_launchagent
        ;;
    *)
        echo "UE5 MCP Bridge Manager"
        echo ""
        echo "Usage: $0 {start|stop|restart|status|install}"
        echo ""
        echo "Commands:"
        echo "  start    - Start the socat bridge"
        echo "  stop     - Stop the socat bridge"
        echo "  restart  - Restart the bridge"
        echo "  status   - Check bridge status"
        echo "  install  - Install LaunchAgent for auto-start on login"
        echo ""
        exit 1
        ;;
esac
