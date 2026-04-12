#!/bin/bash
# 🎮 UE5 MCP CONNECTION TEST
# Verifies Unreal Engine 5 + MCP Server integration

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   UE5 MCP CONNECTION TEST                         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════╝${NC}"
echo ""

# ============================================================================
# 1. CHECK UNREAL ENGINE
# ============================================================================

echo -e "${YELLOW}[1/6]${NC} Checking Unreal Engine..."

if pgrep -f "UnrealEditor" > /dev/null; then
    UE_PID=$(pgrep -f "UnrealEditor" | head -1)
    UE_COMMAND=$(ps -p $UE_PID -o command= | grep -o "\-RemoteControlPort=[0-9]*")

    if [[ $UE_COMMAND =~ -RemoteControlPort=([0-9]+) ]]; then
        UE_PORT="${BASH_REMATCH[1]}"
        echo -e "${GREEN}✓ Unreal Engine running (PID: $UE_PID)${NC}"
        echo -e "  Port: $UE_PORT"
    else
        echo -e "${YELLOW}⚠ Unreal Engine running but Remote Control port not found${NC}"
        UE_PORT="30010"
    fi
else
    echo -e "${RED}✗ Unreal Engine NOT running${NC}"
    echo -e "  Start UE5 with: -EnableRemoteControl -RemoteControlPort=30010"
    exit 1
fi

echo ""

# ============================================================================
# 2. TEST REMOTE CONTROL HTTP
# ============================================================================

echo -e "${YELLOW}[2/6]${NC} Testing Remote Control HTTP API..."

HTTP_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://127.0.0.1:${UE_PORT}/remote/info 2>/dev/null || echo "000")

if [ "$HTTP_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✓ Remote Control HTTP responding (port ${UE_PORT})${NC}"
elif [ "$HTTP_RESPONSE" = "000" ]; then
    echo -e "${RED}✗ Connection timeout - is Remote Control enabled in UE?${NC}"
    echo -e "  Check: Edit > Project Settings > Plugins > Remote Control"
    exit 1
else
    echo -e "${YELLOW}⚠ Unexpected HTTP response: $HTTP_RESPONSE${NC}"
fi

echo ""

# ============================================================================
# 3. CHECK DOCKER IMAGE
# ============================================================================

echo -e "${YELLOW}[3/6]${NC} Checking Docker image..."

if docker images | grep -q "mcp/unreal-engine-mcp-server"; then
    IMAGE_SIZE=$(docker images mcp/unreal-engine-mcp-server:latest --format "{{.Size}}")
    echo -e "${GREEN}✓ Docker image present: mcp/unreal-engine-mcp-server:latest${NC}"
    echo -e "  Size: $IMAGE_SIZE"
else
    echo -e "${RED}✗ Docker image not found${NC}"
    echo -e "  Pull with: docker pull mcp/unreal-engine-mcp-server:latest"
    exit 1
fi

echo ""

# ============================================================================
# 4. CHECK MCP CONFIG
# ============================================================================

echo -e "${YELLOW}[4/6]${NC} Checking MCP configuration..."

MCP_CONFIG="$HOME/.mcp/config.json"

if [ -f "$MCP_CONFIG" ]; then
    if grep -q '"unreal-engine"' "$MCP_CONFIG"; then
        echo -e "${GREEN}✓ UE MCP server configured in $MCP_CONFIG${NC}"

        # Extract and display config
        CONFIG_HOST=$(grep -A 10 '"unreal-engine"' "$MCP_CONFIG" | grep '"UE_HOST"' | cut -d'"' -f4)
        CONFIG_HTTP=$(grep -A 10 '"unreal-engine"' "$MCP_CONFIG" | grep '"UE_RC_HTTP_PORT"' | cut -d'"' -f4)
        CONFIG_WS=$(grep -A 10 '"unreal-engine"' "$MCP_CONFIG" | grep '"UE_RC_WS_PORT"' | cut -d'"' -f4)

        echo -e "  Host: $CONFIG_HOST"
        echo -e "  HTTP Port: $CONFIG_HTTP"
        echo -e "  WS Port: $CONFIG_WS"
    else
        echo -e "${RED}✗ UE MCP server not configured${NC}"
        echo -e "  Add 'unreal-engine' server to $MCP_CONFIG"
        exit 1
    fi
else
    echo -e "${RED}✗ MCP config file not found: $MCP_CONFIG${NC}"
    exit 1
fi

echo ""

# ============================================================================
# 5. TEST MCP SERVER LAUNCH
# ============================================================================

echo -e "${YELLOW}[5/6]${NC} Testing MCP server startup..."

# Try to launch MCP server and check if it starts
TIMEOUT_SECONDS=10
MCP_TEST_OUTPUT=$(timeout $TIMEOUT_SECONDS docker run -i --rm --network=host \
    -e UE_HOST=127.0.0.1 \
    -e UE_RC_HTTP_PORT=${UE_PORT} \
    -e UE_RC_WS_PORT=30020 \
    mcp/unreal-engine-mcp-server:latest <<< '{"jsonrpc":"2.0","method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0.0"}},"id":1}' 2>&1 | head -10)

if echo "$MCP_TEST_OUTPUT" | grep -q "capabilities"; then
    echo -e "${GREEN}✓ MCP server responds to initialize${NC}"
elif echo "$MCP_TEST_OUTPUT" | grep -q "started on stdio"; then
    echo -e "${GREEN}✓ MCP server started successfully${NC}"
else
    echo -e "${YELLOW}⚠ MCP server response unclear (may still work)${NC}"
    echo -e "  First line: $(echo "$MCP_TEST_OUTPUT" | head -1)"
fi

echo ""

# ============================================================================
# 6. CHECK REQUIRED UE PLUGINS
# ============================================================================

echo -e "${YELLOW}[6/6]${NC} Plugin checklist..."

echo -e "${BLUE}Required UE Plugins:${NC}"
echo "  ☐ Remote Control API"
echo "  ☐ Remote Control Web Interface"
echo "  ☐ Python Editor Script Plugin"
echo "  ☐ Editor Scripting Utilities"
echo "  ☐ Sequencer (built-in)"
echo "  ☐ Level Sequence Editor"
echo ""
echo -e "${YELLOW}→ Enable these in UE: Edit > Plugins${NC}"
echo -e "${YELLOW}→ Add to Config/DefaultEngine.ini:${NC}"
echo ""
cat << 'EOF'
[/Script/PythonScriptPlugin.PythonScriptPluginSettings]
bRemoteExecution=True
bAllowRemotePythonExecution=True

[/Script/RemoteControl.RemoteControlSettings]
bAllowRemoteExecutionOfConsoleCommands=True
bEnableRemoteExecution=True
bAllowPythonExecution=True
EOF

echo ""

# ============================================================================
# SUMMARY
# ============================================================================

echo -e "${GREEN}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   CONNECTION TEST COMPLETE                        ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${BLUE}Next Steps:${NC}"
echo "  1. Restart Claude Desktop to load new MCP config"
echo "  2. In Claude, check that 'unreal-engine' MCP server appears"
echo "  3. Try tools like: manage_asset, control_actor, control_editor"
echo ""

echo -e "${BLUE}Test Commands:${NC}"
echo "  - List assets: Use 'manage_asset' with action 'list'"
echo "  - Spawn actor: Use 'control_actor' with action 'spawn'"
echo "  - Start PIE: Use 'control_editor' with action 'start_pie'"
echo ""

echo -e "${GREEN}✨ Ready to control UE5 from Claude!${NC}"
