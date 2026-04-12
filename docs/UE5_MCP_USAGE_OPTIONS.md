# 🎮 UE5 MCP - All Usage Options

**You can control UE5 via MCP in MULTIPLE ways, not just Claude Desktop!**

---

## 1️⃣ Claude Desktop (GUI - Easiest)

**Setup:** Already configured!

**Usage:**
1. Open Claude Desktop app
2. Type commands like:
   ```
   Using manage_asset, list all assets in /Game
   Using control_actor, spawn a cube at (0, 0, 200)
   ```
3. Click "Always allow" when prompted

**Pros:** Visual, conversational, easy
**Cons:** Requires Claude Desktop app

---

## 2️⃣ Python CLI (Terminal - Interactive)

**Setup:** Done! Just run it.

**Usage:**
```bash
# Interactive menu
ue5-mcp

# Or direct commands:
ue5-mcp list /Game
ue5-mcp spawn
ue5-mcp logs 20
ue5-mcp screenshot test.png
```

**Pros:** Fast, scriptable, no GUI needed
**Cons:** Terminal-based

---

## 3️⃣ Direct Docker (Power User)

**Usage:**
```bash
cat <<'EOF' | docker run -i --rm \
  -v "/Users/joewales/Library/Logs/Unreal Engine:/ue-logs:ro" \
  -e UE_HOST=host.docker.internal \
  -e UE_RC_HTTP_PORT=30011 \
  mcp/unreal-engine-mcp-server:latest
{"jsonrpc":"2.0","method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0.0"}},"id":1}
{"jsonrpc":"2.0","method":"tools/call","params":{"name":"manage_asset","arguments":{"action":"list","directory":"/Game"}},"id":2}
EOF
```

**Pros:** Full control, no dependencies
**Cons:** Requires JSON-RPC knowledge

---

## 4️⃣ Custom Scripts (Automation)

**Example: Automated asset import**
```python
from ue5_mcp_client import call_mcp_tool

# Import multiple FBX files
for fbx in fbx_files:
    call_mcp_tool("manage_asset", {
        "action": "import",
        "sourcePath": fbx,
        "destinationPath": "/Game/ImportedAssets"
    })
```

**Pros:** Fully automated workflows
**Cons:** Requires programming

---

## 5️⃣ HTTP/REST Wrapper (API - Future)

**Concept:** Wrap MCP in REST API
```bash
curl -X POST http://localhost:8080/ue5/spawn \
  -d '{"actor":"Cube","location":{"x":0,"y":0,"z":200}}'
```

**Status:** Not implemented yet (but possible!)

---

## 📋 Available MCP Tools (All Methods)

All 13 tools work with any method:

| Tool | Actions | Example Use |
|------|---------|-------------|
| `manage_asset` | list, import, create_material | Browse content, import FBX |
| `control_actor` | spawn, delete, apply_force | Spawn actors, apply physics |
| `control_editor` | play, stop, set_camera, set_view_mode | Start PIE, move camera |
| `manage_level` | load, save, create_light, build_lighting | Level operations |
| `animation_physics` | create_animation_bp, play_montage, setup_ragdoll | Animations |
| `create_effect` | particle, niagara, debug_shape | VFX, debug shapes |
| `manage_blueprint` | create, add_component | Blueprint creation |
| `build_environment` | create_landscape, sculpt, add_foliage | Terrain, foliage |
| `system_control` | screenshot, read_log, set_quality, profile | System operations |
| `console_command` | (any console command) | Run console commands |
| `manage_rc` | create_preset, expose_actor, set_property | Remote Control presets |
| `manage_sequence` | create, open, add_actor, play | Sequencer/cinematics |
| `inspect` | (inspect objects) | Object introspection |

---

## 🚀 Quick Start Examples

### Claude Desktop:
```
Using control_actor, spawn a StaticMeshActor with cube mesh at (0, 0, 200)
```

### Python CLI:
```bash
ue5-mcp  # Interactive menu
```

### Python Script:
```python
python3 ~/NODE_OUT_Master/ue5_mcp_client.py list /Game
```

### Direct Docker:
```bash
~/NODE_OUT_Master/ue5-mcp-test.sh
```

---

## ⚡ Which Method to Use?

| Use Case | Best Method |
|----------|-------------|
| Learning / Exploring | Claude Desktop (conversational) |
| Quick tasks | Python CLI (`ue5-mcp`) |
| Automation / CI/CD | Python scripts + cron/GitHub Actions |
| Integration with tools | Direct Docker + JSON-RPC |
| Complex workflows | Custom Python scripts |

---

## 🔧 Prerequisites (All Methods)

**Required for ALL methods:**
1. ✅ UE5 running with Remote Control
2. ✅ socat bridge running (`ue5-bridge-status`)
3. ✅ Docker installed

**Commands:**
```bash
# Start UE5
ue5

# Start bridge
ue5-bridge-start

# Check status
ue5-bridge-status
```

---

## 📚 More Info

- **Full setup:** `UE5_MCP_FINAL_STATUS.md`
- **Quick start:** `UE5_MCP_QUICK_START.md`
- **Python client:** `ue5_mcp_client.py`
- **Test script:** `ue5-mcp-test.sh`
- **Bridge manager:** `ue5-mcp-bridge.sh`

---

**Bottom Line:** You have MULTIPLE ways to control UE5 via MCP. Choose what works best for your workflow! 🚀
