import { McpServer } from "skybridge/server";
import { z } from "zod";

const CODETALE_API_BASE_URL = "https://pdsjlioujbfvkfmeoiwe.supabase.co/functions/v1";

const server = new McpServer(
  {
    name: "codetale-skybridge-app",
    version: "1.0.0",
  },
  { capabilities: {} },
)
  .registerWidget(
    "analyze-repository",
    {
      description: "Analyze a GitHub repository",
    },
    {
      description: "Analyzes a GitHub repository and returns a structured summary.",
      inputSchema: {
        repo_url: z.string().describe("The full URL of the GitHub repository (e.g., https://github.com/owner/repo)"),
        target_audience: z.enum(["developer", "manager", "investor", "all"]).optional().default("developer").describe("The intended audience for the analysis"),
      },
    },
    async ({ repo_url, target_audience }) => {
      try {
        const response = await fetch(`${CODETALE_API_BASE_URL}/analyze-repo`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            repo_url,
            options: {
              max_files: 30,
              include_narrative: true,
              include_mermaid: false, // Widget will handle visualization if needed, or we can fetch it
              target_audience,
            },
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();

        return {
          structuredContent: data,
          content: [{ type: "text", text: `Analysis for ${repo_url} complete. See detailed view.` }],
          isError: false,
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${error}` }],
          isError: true,
        };
      }
    },
  )
  .registerWidget(
    "explain-architecture",
    {
      description: "Explain repository architecture",
    },
    {
      description: "Explains the internal architecture of a GitHub repository with diagrams.",
      inputSchema: {
        repo_url: z.string().describe("The full URL of the GitHub repository"),
      },
    },
    async ({ repo_url }) => {
      try {
        const response = await fetch(`${CODETALE_API_BASE_URL}/analyze-repo`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            repo_url,
            options: {
              max_files: 30,
              include_narrative: false,
              include_mermaid: true,
              target_audience: "developer",
            },
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();

        return {
          structuredContent: data,
          content: [{ type: "text", text: `Architecture explanation for ${repo_url} ready.` }],
          isError: false,
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${error}` }],
          isError: true,
        };
      }
    },
  )
  .registerWidget(
    "generate-pitch-deck",
    {
      description: "Generate a pitch deck",
    },
    {
      description: "Generates a slide presentation for a GitHub repository.",
      inputSchema: {
        githubUrl: z.string().describe("The full URL of the GitHub repository"),
        mode: z.enum(["developer", "manager", "investor"]).optional().default("investor").describe("The style of the presentation"),
        language: z.enum(["en", "fr", "es", "de"]).optional().default("en").describe("The language for the presentation"),
      },
    },
    async ({ githubUrl, mode, language }) => {
      try {
        const response = await fetch(`${CODETALE_API_BASE_URL}/generate-presentation`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            githubUrl,
            mode,
            language,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();

        return {
          structuredContent: data, // Should contain slides data
          content: [{ type: "text", text: `Pitch deck generated for ${githubUrl}.` }],
          isError: false,
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${error}` }],
          isError: true,
        };
      }
    }
  )
  .registerWidget(
    "compare-repositories",
    {
      description: "Compare two repositories",
    },
    {
      description: "Compares two GitHub repositories side-by-side based on analysis results.",
      inputSchema: {
        repo_url_1: z.string().describe("The full URL of the first GitHub repository."),
        repo_url_2: z.string().describe("The full URL of the second GitHub repository."),
      },
    },
    async ({ repo_url_1, repo_url_2 }) => {
      try {
        // Parallel requests for better performance
        const [response1, response2] = await Promise.all([
          fetch(`${CODETALE_API_BASE_URL}/analyze-repo`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              repo_url: repo_url_1,
              options: { max_files: 20, include_narrative: true, target_audience: "developer" },
            }),
          }),
          fetch(`${CODETALE_API_BASE_URL}/analyze-repo`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              repo_url: repo_url_2,
              options: { max_files: 20, include_narrative: true, target_audience: "developer" },
            }),
          }),
        ]);

        if (!response1.ok || !response2.ok) {
          throw new Error(`API Error: One or both analysis requests failed.`);
        }

        const data1 = await response1.json();
        const data2 = await response2.json();

        return {
          structuredContent: {
            repo1: { url: repo_url_1, data: data1 },
            repo2: { url: repo_url_2, data: data2 }
          },
          content: [{ type: "text", text: `Comparison between ${repo_url_1} and ${repo_url_2} ready.` }],
          isError: false,
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${error}` }],
          isError: true,
        };
      }
    }
  );

export default server;
export type AppType = typeof server;
