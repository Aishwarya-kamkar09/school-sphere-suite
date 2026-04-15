import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: true,
    port: 8080,
    allowedHosts: "all",
  },

  // 🔥 ADD THIS BLOCK (IMPORTANT)
  preview: {
    host: true,
    port: 8080,
    allowedHosts: "all",
  },

  plugins: [
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: true,
    port: 8080,
    allowedHosts: ["inddia-erp.onrender.com"],
  },

  preview: {
    host: true,
    port: 8080,
    allowedHosts: ["inddia-erp.onrender.com"],
  },

  plugins: [
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));