interface Props{
    params:Promise<{
        projectId:string
    }>
}
const Page= async({params}:Props)=>{
const {projectId}= await params;
return(<>
Project id: {projectId}
</>)
}

export default Page;