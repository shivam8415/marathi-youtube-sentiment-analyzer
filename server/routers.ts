import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { createDemoAnalysis, fetchYouTubeAnalysis } from "./analyzer";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  analyzer: router({
    analyze: publicProcedure
      .input(z.object({
        url: z.string().trim().min(1, "Enter a YouTube URL."),
        demo: z.boolean().optional().default(false),
        maxComments: z.number().int().min(20).max(200).optional().default(150),
      }))
      .mutation(async ({ input }) => {
        try {
          return input.demo ? createDemoAnalysis(input.url) : await fetchYouTubeAnalysis(input.url, input.maxComments);
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unable to analyze this YouTube video.";
          throw new TRPCError({ code: "BAD_REQUEST", message });
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
