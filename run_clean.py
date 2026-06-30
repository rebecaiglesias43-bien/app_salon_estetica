"""Clean server startup - no bytecode cache."""
import sys
print("RUNNING AT:", __file__, flush=True)
sys.dont_write_bytecode = True

# Verify router file
import os
router_path = os.path.join(os.path.dirname(__file__), "routers", "citasRouter.py")
print("ROUTER PATH:", router_path, flush=True)
with open(router_path) as f:
    router_content = f.read()
print("HAS _get_proximas:", "_get_proximas" in router_content, flush=True)
print("HAS _source:", "_source" in router_content, flush=True)

from app import app

if __name__ == "__main__":
    import os
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False, use_reloader=False)
