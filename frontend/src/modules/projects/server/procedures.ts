import { inngest } from "@/inngest/client";
import prisma from "@/lib/db";
import { createTRPCRouter ,baseProcedure} from "@/trpc/init";
import z from "zod";
import {generateSlug} from "random-word-slugs"
import { TRPCError } from "@trpc/server";
export const ProjectRouter=createTRPCRouter({
    getOne:baseProcedure
    .input(z.object({
        id:z.string().min(1,{message:"ID is required"}),
    }))
    .query(async({input})=>{
        const existingprojects = await prisma.project.findUnique({
           where:{
            id:input.id,
           }
        })
        if(!existingprojects){
            throw new TRPCError({code:"NOT_FOUND",message:"Project not found"})
        }
        return existingprojects ;
    }),
    getMany:baseProcedure
    .query(async()=>{
        const projects = await prisma.project.findMany({
            orderBy:{
                updatedAt:"asc"
,            }
        })
        return projects;
    }),
create: baseProcedure
.input(
    z.object({
        value:z.string().min(1,{message:"message is required"})
        
    })
)
.mutation(async({input})=>{
    const createdProject = await prisma.project.create({
        data:{
            name:generateSlug(2,{
                format:"kebab"
            }),
            messages:{
                create:{
                        content:input.value,
        role:"USER",
        type:"RESULT"
                }
            }
        }
    })
  
     await inngest.send({name:"code-agent/run",data:{
        value:input.value,
        projectId:createdProject.id
            }})
            return createdProject ;
})
});