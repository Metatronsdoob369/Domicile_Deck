# 🎮 UE5 MCP - CHEATSHEET

## 🚀 START EVERYTHING
```bash
ue5-bridge-start  # Start socat bridge (REQUIRED on macOS)
ue5               # Start Unreal Engine 5
ue5-bridge-status # Verify everything
```

## 💻 USAGE

### Claude Desktop (GUI)
```
Using manage_asset, list all assets in /Game
Using control_actor, spawn a cube at (0, 0, 200)
```

### Python CLI (Terminal)
```bash
ue5-mcp              # Interactive menu
ue5-mcp list /Game   # List assets
ue5-mcp spawn        # Spawn cube
ue5-mcp logs 20      # Read logs
```

### Claude Code (After Restart)
Look for `mcp__unreal-engine__*` tools

## 🔧 BRIDGE COMMANDS
```bash
ue5-bridge-start    # Start
ue5-bridge-stop     # Stop
ue5-bridge-status   # Check status
ue5-bridge-restart  # Restart
```

## 🛠️ 13 MCP TOOLS
1. `manage_asset` - List/import assets
2. `control_actor` - Spawn/manipulate actors
3. `control_editor` - PIE, camera, viewmodes
4. `manage_level` - Load/save levels, lighting
5. `animation_physics` - Animations, ragdolls
6. `create_effect` - Particles, VFX
7. `manage_blueprint` - Create blueprints
8. `build_environment` - Landscapes, foliage
9. `system_control` - Screenshot, logs, profiling
10. `console_command` - Run console commands
11. `manage_rc` - Remote Control presets
12. `manage_sequence` - Sequencer/cinematics
13. `inspect` - Object introspection

## 🔍 TROUBLESHOOTING
```bash
# Check status
ue5-bridge-status

# Test UE5
curl http://localhost:30011/remote/info

# Restart everything
ue5-bridge-restart
kill $(pgrep -f UnrealEditor) && ue5
```

## 📁 KEY FILES
- `~/NODE_OUT_Master/ue5-mcp-bridge.sh` - Bridge manager
- `~/NODE_OUT_Master/ue5_mcp_client.py` - Python CLI
- `~/.mcp/config.json` - MCP server config
- `UE5_MCP_INTEGRATION_COMPLETE.md` - Full docs

## 🏗️ ARCHITECTURE
```
AI → Docker (host.docker.internal:30011)
    → socat (0.0.0.0:30011)
      → UE5 (127.0.0.1:30010)
```

## ⚠️ AFTER REBOOT
```bash
ue5-bridge-start  # Bridge doesn't auto-start
```

**Quick Test:** `ue5-bridge-status && ue5-mcp list /Game`
