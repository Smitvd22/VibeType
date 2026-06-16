// vite.config.ts
import { defineConfig } from "file:///C:/Users/acer/Desktop/VibeType/extension/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/acer/Desktop/VibeType/extension/node_modules/@vitejs/plugin-react/dist/index.js";
import { crx } from "file:///C:/Users/acer/Desktop/VibeType/extension/node_modules/@crxjs/vite-plugin/dist/index.mjs";
import tailwindcss from "file:///C:/Users/acer/Desktop/VibeType/extension/node_modules/@tailwindcss/vite/dist/index.mjs";

// manifest.json
var manifest_default = {
  manifest_version: 3,
  name: "VibeType",
  version: "1.0.0",
  description: "Voice -> Text | Facial Expressions -> Emojis | Anywhere",
  permissions: [
    "storage",
    "activeTab",
    "scripting",
    "commands"
  ],
  host_permissions: [
    "http://localhost:3000/*",
    "https://vibetype.com/*",
    "<all_urls>"
  ],
  background: {
    service_worker: "src/background/index.ts",
    type: "module"
  },
  content_scripts: [
    {
      matches: ["<all_urls>"],
      js: ["src/content/index.tsx"],
      run_at: "document_end"
    }
  ],
  action: {
    default_popup: "src/popup/index.html"
  },
  commands: {
    "toggle-vibe": {
      suggested_key: {
        default: "Alt+Space",
        mac: "Alt+Space"
      },
      description: "Toggle VibeType recording"
    }
  },
  web_accessible_resources: [
    {
      resources: [
        "assets/*"
      ],
      matches: ["<all_urls>"]
    }
  ]
};

// vite.config.ts
import path from "path";
var __vite_injected_original_dirname = "C:\\Users\\acer\\Desktop\\VibeType\\extension";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    crx({ manifest: manifest_default })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "../src")
    }
  },
  define: {
    "process.env.NEXT_PUBLIC_STT_BACKEND_URL": JSON.stringify("http://localhost:10000"),
    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || "development")
  },
  server: {
    port: 5173,
    strictPort: true,
    hmr: {
      port: 5173
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAibWFuaWZlc3QuanNvbiJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXGFjZXJcXFxcRGVza3RvcFxcXFxWaWJlVHlwZVxcXFxleHRlbnNpb25cIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXGFjZXJcXFxcRGVza3RvcFxcXFxWaWJlVHlwZVxcXFxleHRlbnNpb25cXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL2FjZXIvRGVza3RvcC9WaWJlVHlwZS9leHRlbnNpb24vdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5pbXBvcnQgeyBjcnggfSBmcm9tICdAY3J4anMvdml0ZS1wbHVnaW4nO1xuaW1wb3J0IHRhaWx3aW5kY3NzIGZyb20gJ0B0YWlsd2luZGNzcy92aXRlJztcbmltcG9ydCBtYW5pZmVzdCBmcm9tICcuL21hbmlmZXN0Lmpzb24nO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtcbiAgICByZWFjdCgpLFxuICAgIHRhaWx3aW5kY3NzKCksXG4gICAgY3J4KHsgbWFuaWZlc3QgfSlcbiAgXSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICAnQCc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLi9zcmMnKVxuICAgIH1cbiAgfSxcbiAgZGVmaW5lOiB7XG4gICAgJ3Byb2Nlc3MuZW52Lk5FWFRfUFVCTElDX1NUVF9CQUNLRU5EX1VSTCc6IEpTT04uc3RyaW5naWZ5KCdodHRwOi8vbG9jYWxob3N0OjEwMDAwJyksXG4gICAgJ3Byb2Nlc3MuZW52Lk5PREVfRU5WJzogSlNPTi5zdHJpbmdpZnkocHJvY2Vzcy5lbnYuTk9ERV9FTlYgfHwgJ2RldmVsb3BtZW50JylcbiAgfSxcbiAgc2VydmVyOiB7XG4gICAgcG9ydDogNTE3MyxcbiAgICBzdHJpY3RQb3J0OiB0cnVlLFxuICAgIGhtcjoge1xuICAgICAgcG9ydDogNTE3MyxcbiAgICB9LFxuICB9LFxufSk7XG4iLCAie1xuICBcIm1hbmlmZXN0X3ZlcnNpb25cIjogMyxcbiAgXCJuYW1lXCI6IFwiVmliZVR5cGVcIixcbiAgXCJ2ZXJzaW9uXCI6IFwiMS4wLjBcIixcbiAgXCJkZXNjcmlwdGlvblwiOiBcIlZvaWNlIC0+IFRleHQgfCBGYWNpYWwgRXhwcmVzc2lvbnMgLT4gRW1vamlzIHwgQW55d2hlcmVcIixcbiAgXCJwZXJtaXNzaW9uc1wiOiBbXG4gICAgXCJzdG9yYWdlXCIsXG4gICAgXCJhY3RpdmVUYWJcIixcbiAgICBcInNjcmlwdGluZ1wiLFxuICAgIFwiY29tbWFuZHNcIlxuICBdLFxuICBcImhvc3RfcGVybWlzc2lvbnNcIjogW1xuICAgIFwiaHR0cDovL2xvY2FsaG9zdDozMDAwLypcIixcbiAgICBcImh0dHBzOi8vdmliZXR5cGUuY29tLypcIixcbiAgICBcIjxhbGxfdXJscz5cIlxuICBdLFxuICBcImJhY2tncm91bmRcIjoge1xuICAgIFwic2VydmljZV93b3JrZXJcIjogXCJzcmMvYmFja2dyb3VuZC9pbmRleC50c1wiLFxuICAgIFwidHlwZVwiOiBcIm1vZHVsZVwiXG4gIH0sXG4gIFwiY29udGVudF9zY3JpcHRzXCI6IFtcbiAgICB7XG4gICAgICBcIm1hdGNoZXNcIjogW1wiPGFsbF91cmxzPlwiXSxcbiAgICAgIFwianNcIjogW1wic3JjL2NvbnRlbnQvaW5kZXgudHN4XCJdLFxuICAgICAgXCJydW5fYXRcIjogXCJkb2N1bWVudF9lbmRcIlxuICAgIH1cbiAgXSxcbiAgXCJhY3Rpb25cIjoge1xuICAgIFwiZGVmYXVsdF9wb3B1cFwiOiBcInNyYy9wb3B1cC9pbmRleC5odG1sXCJcbiAgfSxcbiAgXCJjb21tYW5kc1wiOiB7XG4gICAgXCJ0b2dnbGUtdmliZVwiOiB7XG4gICAgICBcInN1Z2dlc3RlZF9rZXlcIjoge1xuICAgICAgICBcImRlZmF1bHRcIjogXCJBbHQrU3BhY2VcIixcbiAgICAgICAgXCJtYWNcIjogXCJBbHQrU3BhY2VcIlxuICAgICAgfSxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJUb2dnbGUgVmliZVR5cGUgcmVjb3JkaW5nXCJcbiAgICB9XG4gIH0sXG4gIFwid2ViX2FjY2Vzc2libGVfcmVzb3VyY2VzXCI6IFtcbiAgICB7XG4gICAgICBcInJlc291cmNlc1wiOiBbXG4gICAgICAgIFwiYXNzZXRzLypcIlxuICAgICAgXSxcbiAgICAgIFwibWF0Y2hlc1wiOiBbXCI8YWxsX3VybHM+XCJdXG4gICAgfVxuICBdXG59XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXNULFNBQVMsb0JBQW9CO0FBQ25WLE9BQU8sV0FBVztBQUNsQixTQUFTLFdBQVc7QUFDcEIsT0FBTyxpQkFBaUI7OztBQ0h4QjtBQUFBLEVBQ0Usa0JBQW9CO0FBQUEsRUFDcEIsTUFBUTtBQUFBLEVBQ1IsU0FBVztBQUFBLEVBQ1gsYUFBZTtBQUFBLEVBQ2YsYUFBZTtBQUFBLElBQ2I7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxFQUNGO0FBQUEsRUFDQSxrQkFBb0I7QUFBQSxJQUNsQjtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsRUFDRjtBQUFBLEVBQ0EsWUFBYztBQUFBLElBQ1osZ0JBQWtCO0FBQUEsSUFDbEIsTUFBUTtBQUFBLEVBQ1Y7QUFBQSxFQUNBLGlCQUFtQjtBQUFBLElBQ2pCO0FBQUEsTUFDRSxTQUFXLENBQUMsWUFBWTtBQUFBLE1BQ3hCLElBQU0sQ0FBQyx1QkFBdUI7QUFBQSxNQUM5QixRQUFVO0FBQUEsSUFDWjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFFBQVU7QUFBQSxJQUNSLGVBQWlCO0FBQUEsRUFDbkI7QUFBQSxFQUNBLFVBQVk7QUFBQSxJQUNWLGVBQWU7QUFBQSxNQUNiLGVBQWlCO0FBQUEsUUFDZixTQUFXO0FBQUEsUUFDWCxLQUFPO0FBQUEsTUFDVDtBQUFBLE1BQ0EsYUFBZTtBQUFBLElBQ2pCO0FBQUEsRUFDRjtBQUFBLEVBQ0EsMEJBQTRCO0FBQUEsSUFDMUI7QUFBQSxNQUNFLFdBQWE7QUFBQSxRQUNYO0FBQUEsTUFDRjtBQUFBLE1BQ0EsU0FBVyxDQUFDLFlBQVk7QUFBQSxJQUMxQjtBQUFBLEVBQ0Y7QUFDRjs7O0FEMUNBLE9BQU8sVUFBVTtBQUxqQixJQUFNLG1DQUFtQztBQU96QyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixZQUFZO0FBQUEsSUFDWixJQUFJLEVBQUUsMkJBQVMsQ0FBQztBQUFBLEVBQ2xCO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLLEtBQUssUUFBUSxrQ0FBVyxRQUFRO0FBQUEsSUFDdkM7QUFBQSxFQUNGO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDTiwyQ0FBMkMsS0FBSyxVQUFVLHdCQUF3QjtBQUFBLElBQ2xGLHdCQUF3QixLQUFLLFVBQVUsUUFBUSxJQUFJLFlBQVksYUFBYTtBQUFBLEVBQzlFO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixZQUFZO0FBQUEsSUFDWixLQUFLO0FBQUEsTUFDSCxNQUFNO0FBQUEsSUFDUjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
