import { inngest } from "./client";
import { createAgent, createNetwork, createTool, gemini, Tool } from "@inngest/agent-kit";
import {Result, Sandbox} from "@e2b/code-interpreter";
import { getsandbox, lastAssistantTextMessageContent } from "./utils";
import z from "zod";

import { PROMPT } from "@/prompt";
import prisma from "@/lib/db";

interface AgentState {
  summary: string;
  files: { [path: string]: string };
}

export const CodingAgent = inngest.createFunction(
  { id: "code-agent" },
  { event: "code-agent/run" },
  async ({ event ,step}) => {
    const sandboxId = await step.run("get-sandbox-id",async ()=>{
      const sandbox = await Sandbox.create("cn9jfl7vpthtxv69zivu")
      return sandbox.sandboxId;
    })
    const codeAgent = createAgent<AgentState>({
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
              {step,network}:Tool.Options<AgentState>
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
    const network = createNetwork<AgentState>({
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
const isError = !result.state.data.summary || Object.keys(result.state.data.files ||{}).length ===0

    const sandboxurl = await step.run("get-sandbox-url",async ()=>{
      const sandbox = await getsandbox(sandboxId);
      const host =  sandbox.getHost(3000);
      return `https://${host}`
    })

    await step.run("save-result",async()=>{
      if(isError){
        return  await prisma.message.create({
          data:{
            content:"Something went worng. please try again",
            role:"ASSISTANT",
            type:"ERROR"
          }
        });
      }
      return await prisma.message.create({
        data:{
          content:result.state.data.summary,
          role:"ASSISTANT",
          type:"RESULT",
          fragment:{
          create:{
            sandboxUrl:sandboxurl,
            title:"Fragment",
            files:result.state.data.files
          }
          }
        }
      })
    })
    
    return {url:sandboxurl,
       title:"Fragment",
   
      files:result.state.data.files,
      summary:result.state.data.summary
    };
  }
);
