#!/bin/bash
# UE5 MCP Direct Test Script
# Tests MCP tools without Claude Desktop

set -e

DOCKER_IMAGE="mcp/unreal-engine-mcp-server:latest"

echo "🎮 UE5 MCP Direct Test"
echo ""

# Function to send MCP command
send_mcp_command() {
    local tool_name=$1
    local params=$2

    echo "📤 Sending: $tool_name"
    echo "   Params: $params"
    echo ""

    # Initialize + List Tools + Call Tool
    cat <<EOF | docker run -i --rm \
      -v "/Users/joewales/Library/Logs/Unreal Engine:/ue-logs:ro" \
      -e UE_HOST=host.docker.internal \
      -e UE_RC_HTTP_PORT=30011 \
      -e UE_RC_WS_PORT=30020 \
      -e UE_LOG_PATH=/ue-logs/StormCommand_BhamEditor/StormCommand_Bham.log \
      $DOCKER_IMAGE 2>&1 | tail -20
{"jsonrpc":"2.0","method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test-client","version":"1.0.0"}},"id":1}
{"jsonrpc":"2.0","method":"tools/call","params":{"name":"$tool_name","arguments":$params},"id":2}
EOF
}

# Test 1: List assets in /Game
echo "═══════════════════════════════════════════════════════"
echo "Test 1: List Assets in /Game"
echo "═══════════════════════════════════════════════════════"
send_mcp_command "manage_asset" '{"action":"list","directory":"/Game"}'
echo ""
echo ""

# Test 2: Get UE5 log
echo "═══════════════════════════════════════════════════════"
echo "Test 2: Read UE5 Log (10 lines)"
echo "═══════════════════════════════════════════════════════"
send_mcp_command "system_control" '{"action":"read_log","lines":10}'
echo ""
echo ""

# Test 3: Take screenshot
echo "═══════════════════════════════════════════════════════"
echo "Test 3: Take Screenshot"
echo "═══════════════════════════════════════════════════════"
send_mcp_command "system_control" '{"action":"screenshot","filename":"mcp-test-screenshot.png"}'
echo ""
echo ""

echo "✅ Tests complete!"
echo ""
echo "📋 Summary:"
echo "   - If you see JSON responses with 'success':true, it's working!"
echo "   - If you see error messages, check:"
echo "     1. UE5 is running: pgrep -f UnrealEditor"
echo "     2. Bridge is running: ue5-bridge-status"
echo "     3. UE5 Remote Control responding: curl localhost:30011/remote/info"
