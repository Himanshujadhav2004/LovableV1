import { inngest } from "./client";
import { createAgent, createNetwork, createTool, gemini } from "@inngest/agent-kit";
import {Result, Sandbox} from "@e2b/code-interpreter";
import { getsandbox, lastAssistantTextMessageContent } from "./utils";
import z from "zod";

import { PROMPT } from "@/prompt";

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
      description:"An Expert coding Agent",
      system:  PROMPT,
      model: gemini({
        model: "gemini-2.5-flash-lite"  }),
            tools:[
          createTool({
            name:"terminal",
            description:"use the terminal to run commnads",
            parameters:z.object({
              command:z.string()
            }),
            handler:async ({command},{step})=>{
              return await step?.run("terminal",async()=>{
                const buffers = {stdout:"",stderr:""
                };
                try{
                  const sandbox = await getsandbox(sandboxId);
const result = await sandbox.commands.run(command,{
onStdout :(data:string)=>{
  buffers.stdout+=data; 
},
onStderr:(data:string) =>{
  buffers.stderr+=data;
}  
});
return result.stdout;
}
                catch(e){
                  console.error(`Command failed:${e} \nstdout: ${buffers.stdout}\nstderror: ${buffers.stderr}`)
                  return `Command failed:${e} \nstdout: ${buffers.stdout}\nstderror: ${buffers.stderr}`
                }
              });
            },
          }),
          createTool({name:"createOrUpdateFiles",
            description:"Create or update files in the sandbox",
            parameters: z.object({
            files:z.array(
              z.object({
                path:z.string(),
                content: z.string(),
              }),
            ),

            }),
            handler : async(
              {files},
              {step,network}
            )=>{

                 
const newFiles = await step?.run("createOrUpdate",async()=>{
  try{
const updatedFiles = network.state.data.files || {};
const sandbox = await getsandbox(sandboxId);
for(const file of files){
  await sandbox.files.write(file.path,file.content);
  updatedFiles[file.path]=file.content;
}
return updatedFiles;
  }
  catch(e){
    return "Error"+e;

  }
});
if(typeof newFiles ==="object"){
  network.state.data.files = newFiles;
}
            }

          })
,
          createTool({
            name:"readFiles",
            description:"Read files from the sandbox",
            parameters:z.object({
              files:z.array(z.string()),
            }),
            handler: async ({files},{step})=>{
              return await step?.run("readFiles",async ()=>{
                try{

                  const sandbox = await getsandbox(sandboxId);
                  const contents = [];
                  for(const file of files){
const content = await sandbox.files.read(file);
contents.push({path:file,content});

                  }
                  return JSON.stringify(contents);
                }
              
                catch(e){
                return "Error"+e;
                }
              })
            }
          })
        ],
    lifecycle:{
      onResponse:async ({result,network})=>{
        const lastAssistantTextMessagetext = 
        lastAssistantTextMessageContent(result);
        if(lastAssistantTextMessagetext && network ){
          if(lastAssistantTextMessagetext.includes("<task_summary")){
            network.state.data.summary = lastAssistantTextMessagetext;

          }
        }
        return result;
      },
    },
    });
    const network = createNetwork({
      name:"coding-agent-network",
      agents:[codeAgent],
      maxIter:15,
      router:async ({network})=>{
        const summary = network.state.data.summary;
        if(summary){
          return;
        }
        return codeAgent;
      }
    })
const result = await network.run(event.data.value);


    const sandboxurl = await step.run("get-sandbox-url",async ()=>{
      const sandbox = await getsandbox(sandboxId);
      const host =  sandbox.getHost(3000);
      return `https://${host}`
    })

    
    return {url:sandboxurl,
       title:"Fragment",
   
      files:result.state.data.files,
      summary:result.state.data.summary
    };
  }
);
