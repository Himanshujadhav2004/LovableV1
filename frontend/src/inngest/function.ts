import { inngest } from "./client";
import { createAgent, gemini } from "@inngest/agent-kit";
import {Sandbox} from "@e2b/code-interpreter";
import { getsandbox } from "./utils";
export const helloWorld = inngest.createFunction(
  { id: "hello-world2" },
  { event: "test/hello.world" },
  async ({ event ,step}) => {
    const sandboxId = await step.run("get-sandbox-id",async ()=>{
      const sandbox = await Sandbox.create("cn9jfl7vpthtxv69zivu")
      return sandbox.sandboxId;
    })
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

    const sandboxurl = await step.run("get-sandbox-url",async ()=>{
      const sandbox = await getsandbox(sandboxId);
      const host =  sandbox.getHost(3000);
      return `https://${host}`
    })

    console.log(output);
    return { output ,sandboxurl};
  }
);
