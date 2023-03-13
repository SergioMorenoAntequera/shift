import { type Groups } from "@prisma/client";
import { useSession, signIn } from "next-auth/react";
import { prisma } from "~/server/db";

type TPathParams = {params: { groupId: string }}[] 
export async function getStaticPaths() {
  const allGroups = await prisma.groups.findMany()

  const paths:TPathParams = allGroups.map((group) => ({
    params: { groupId: group.id },
  }))
  
  return { paths, fallback: 'blocking' }
}

type TPropsParams = { params: { groupId: string } }
export async function getStaticProps(props: TPropsParams) {
  const groupId = props.params.groupId 
  if(!groupId) return { props: {group: null}}
  
  const group = await prisma.groups.findFirst({where: {id: {equals: groupId}}})
  console.log(group)

  return { props: { group }, revalidate: 300 }
}
  
type Props = {group: Groups} 
function InvitationPage({ group }:Props) {
  const { data: sessionData }= useSession()
  
  if(!group) return 'oopss'
  return (<div> 
    Has sido invitado a { group?.name }

    {sessionData && <div>
      <button onClick={()=> { console.log('join group')}}> Unete aquí </button>
    </div>}
    {!sessionData && <div>
      
      <button
        className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
        onClick={() => void signIn()}
      ></button>
    </div>} 
  </div>)
}

export default InvitationPage