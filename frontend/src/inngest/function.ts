import { inngest } from "./client";
import { createAgent, gemini } from "@inngest/agent-kit";

export const helloWorld = inngest.createFunction(
  { id: "hello-world2" },
  { event: "test/hello.world" },
  async ({ event }) => {
    const codeAgent = createAgent({
      name: "codeAgent",
      system: "You are an expert next.js developere. you write readable , maintainable and scalable code , you write simple next.js snippet ",
      model: gemini({
        model: "gemini-2.5-flash-lite",
      }),
    });
    const { output } = await codeAgent.run(
      `wite the following snippet: ${event.data.value}`
    );

    console.log(output);
    return { output };
  }
);
