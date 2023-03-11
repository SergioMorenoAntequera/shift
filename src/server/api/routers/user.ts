import { z } from "zod";

import {
    createTRPCRouter,
    publicProcedure,
    protectedProcedure,
  } from "~/server/api/trpc";

const userRouter = createTRPCRouter({
    getById: publicProcedure
        .input(z.string())
        .query(({ ctx, input }) => {
            return ctx.prisma.user.findFirst({
                where: { id: input },
            });
        }),

    getGroups: protectedProcedure
        .query(({ ctx }) => {
            return ctx.prisma.groups.findMany({
                select: { users: true, id: true, name: true },
                where: { users:{some:{userId: ctx.session.user.id}} },
            });
        }),
  });

export default userRouter