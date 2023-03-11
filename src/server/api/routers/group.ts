import { z } from "zod";

import {
    createTRPCRouter,
    // publicProcedure,
    protectedProcedure,
  } from "~/server/api/trpc";

const groupRouter = createTRPCRouter({
    create: protectedProcedure
        .input(z.object({
            name: z.string(),
            role: z.string().default('admin'),
        }))
        .mutation(({ ctx, input }) => {
            return ctx.prisma.groups.create({ data: {
                name: input.name,
                users: { 
                    create:  [
                        {
                            role: input.role,
                            userId: ctx.session.user.id,
                        }
                    ]
                }
            }});
        }),
    
    delete: protectedProcedure.input(z.object({
            id: z.string(),
        }))
        .mutation(({ ctx, input }) => {
            return ctx.prisma.groups.delete({where: {id: input.id}})
        }),
    
    addUsers: protectedProcedure.input(z.object({
            groupId: z.string(),
            usersToAdd: z.array(z.object({email: z.string()}))
        }))
        .mutation(({ ctx, input }) => {
            // ctx.prisma.usersInGroups.create({data: {
            //     role:'user',
            //     group: { connect: {id: 'clf449m600000ull8payhhh9w'} },
            //     user: { connect: {id: 'clf3zl7tl001sulzc6c0n5fax'} }
            // }}).catch(e => console.error(e))

            return Promise.all([
                ctx.prisma.groups.findFirst({where: {id: {equals: input.groupId}}}),
                ctx.prisma.user.findMany({where: {email: { in: input.usersToAdd.map(user => user.email)}}})
            ]).then(([group, usersToAdd]) => { 
                usersToAdd.forEach(user => { 
                    ctx.prisma.usersInGroups.create({data: {
                        role:'user',
                        group: { connect: {id: group?.id} },
                        user: { connect: {id: user?.id} }
                    }}).catch(e => console.error(e))
                })
            }).catch(e => console.error(e))
        }),
    
  });

export default groupRouter