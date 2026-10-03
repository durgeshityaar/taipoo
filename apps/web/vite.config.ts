import tailwindcss from "@tailwindcss/vite";
import adapter from "@sveltejs/adapter-auto";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const { API_URL = "http://localhost:3000" } = loadEnv(
    mode,
    process.cwd(),
    "",
  );

  return {
    plugins: [
      tailwindcss(),
      sveltekit({
        compilerOptions: {
          // Force runes mode for the project, except for libraries. Can be removed in svelte 6.
          runes: ({ filename }) =>
            filename.split(/[/\\]/).includes("node_modules") ? undefined : true,
        },

        // adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
        // If your environment is not supported, or you settled on a specific environment, switch out the adapter.
        // See https://svelte.dev/docs/kit/adapters for more information about adapters.
        adapter: adapter(),
      }),
    ],
    server: {
      port: 5173,
      strictPort: true,

      // and no CORS preflights. Host stays localhost:5173 (no changeOrigin) so the API sees the real origin.
      // In production a reverse proxy does the same job.
      proxy: { "/api": API_URL },
    },
  };
});
