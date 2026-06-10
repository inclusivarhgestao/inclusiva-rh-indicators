import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============= LOJAS =============
  lojas: router({
    list: protectedProcedure.query(async () => {
      return db.getAllLojas();
    }),
    create: protectedProcedure
      .input(z.object({
        nome: z.string().min(1),
        cidade: z.string().optional(),
        estado: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return db.createLoja(input);
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        nome: z.string().optional(),
        cidade: z.string().optional(),
        estado: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateLoja(id, data);
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.deleteLoja(input.id);
      }),
  }),

  // ============= VAGAS =============
  vagas: router({
    list: protectedProcedure
      .input(z.object({
        mes: z.number().optional(),
        ano: z.number().optional(),
      }))
      .query(async ({ input }) => {
        if (input.mes !== undefined && input.ano !== undefined) {
          return db.getVagasByPeriod(input.mes, input.ano);
        }
        return db.getAllVagas();
      }),
    create: protectedProcedure
      .input(z.object({
        cargo: z.string().min(1),
        lojaId: z.number(),
        dataAbertura: z.date(),
        descricao: z.string().optional(),
        quantidadeVagas: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        return db.createVaga(input);
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        cargo: z.string().optional(),
        lojaId: z.number().optional(),
        status: z.enum(["aberta", "em_andamento", "fechada", "cancelada"]).optional(),
        dataAbertura: z.date().optional(),
        dataFechamento: z.date().nullable().optional(),
        descricao: z.string().optional(),
        quantidadeVagas: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateVaga(id, data);
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.deleteVaga(input.id);
      }),
  }),

  // ============= CANDIDATOS =============
  candidatos: router({
    listByVaga: protectedProcedure
      .input(z.object({ vagaId: z.number() }))
      .query(async ({ input }) => {
        return db.getCandidatosByVaga(input.vagaId);
      }),
    listByPeriod: protectedProcedure
      .input(z.object({
        mes: z.number(),
        ano: z.number(),
      }))
      .query(async ({ input }) => {
        return db.getCandidatosByPeriod(input.mes, input.ano);
      }),
    listAll: protectedProcedure.query(async () => {
      return db.getAllCandidatos();
    }),
    create: protectedProcedure
      .input(z.object({
        vagaId: z.number(),
        nome: z.string().min(1),
        email: z.string().email().optional(),
        telefone: z.string().optional(),
        dataCandidatura: z.date(),
        observacoes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return db.createCandidato(input);
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        nome: z.string().optional(),
        email: z.string().optional(),
        telefone: z.string().optional(),
        status: z.enum(["triagem", "entrevista", "teste", "oferta", "contratado", "rejeitado"]).optional(),
        observacoes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateCandidato(id, data);
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.deleteCandidato(input.id);
      }),
  }),

  // ============= ETAPAS SELETIVAS =============
  etapas: router({
    listByCandidato: protectedProcedure
      .input(z.object({ candidatoId: z.number() }))
      .query(async ({ input }) => {
        return db.getEtapasByCandidato(input.candidatoId);
      }),
    create: protectedProcedure
      .input(z.object({
        candidatoId: z.number(),
        etapa: z.enum(["triagem", "entrevista", "teste", "oferta"]),
        dataEtapa: z.date(),
        resultado: z.enum(["pendente", "aprovado", "reprovado"]).optional(),
        observacoes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return db.createEtapaSeletiva(input);
      }),
  }),

  // ============= INDICADORES MENSAIS =============
  indicadores: router({
    getMensal: protectedProcedure
      .input(z.object({
        mes: z.number(),
        ano: z.number(),
      }))
      .query(async ({ input }) => {
        return db.getIndicadorMensal(input.mes, input.ano);
      }),
    getByAno: protectedProcedure
      .input(z.object({ ano: z.number() }))
      .query(async ({ input }) => {
        return db.getIndicadoresByAno(input.ano);
      }),
    update: protectedProcedure
      .input(z.object({
        mes: z.number(),
        ano: z.number(),
        vagasAbertas: z.number().optional(),
        vagasFechadas: z.number().optional(),
        totalCandidatos: z.number().optional(),
        contratacoes: z.number().optional(),
        tempoMedioFechamento: z.number().optional(),
        taxaAproveitamento: z.number().optional(),
        resumo: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { mes, ano, ...data } = input;
        return db.createOrUpdateIndicadorMensal(mes, ano, data);
      }),
  }),

  // ============= DASHBOARD METRICS =============
  dashboard: router({
    metrics: protectedProcedure
      .input(z.object({
        mes: z.number(),
        ano: z.number(),
      }))
      .query(async ({ input }) => {
        const vagas = await db.getVagasByPeriod(input.mes, input.ano);
        const candidatos = await db.getCandidatosByPeriod(input.mes, input.ano);
        const indicador = await db.getIndicadorMensal(input.mes, input.ano);

        const vagasAbertas = vagas.filter(v => v.status === "aberta").length;
        const vagasFechadas = vagas.filter(v => v.status === "fechada").length;
        const totalCandidatos = candidatos.length;
        const contratados = candidatos.filter(c => c.status === "contratado").length;

        return {
          vagasAbertas,
          vagasFechadas,
          totalCandidatos,
          contratados,
          tempoMedioFechamento: indicador?.tempoMedioFechamento ?? 0,
          taxaAproveitamento: indicador?.taxaAproveitamento ?? 0,
        };
      }),

    funilSelecao: protectedProcedure
      .input(z.object({
        mes: z.number(),
        ano: z.number(),
      }))
      .query(async ({ input }) => {
        const candidatos = await db.getCandidatosByPeriod(input.mes, input.ano);

        const triagem = candidatos.filter(c => c.status === "triagem").length;
        const entrevista = candidatos.filter(c => c.status === "entrevista").length;
        const teste = candidatos.filter(c => c.status === "teste").length;
        const oferta = candidatos.filter(c => c.status === "oferta").length;
        const contratado = candidatos.filter(c => c.status === "contratado").length;

        return [
          { name: "Triagem", value: triagem },
          { name: "Entrevista", value: entrevista },
          { name: "Teste", value: teste },
          { name: "Oferta", value: oferta },
          { name: "Contratado", value: contratado },
        ];
      }),

    vagasPorStatus: protectedProcedure
      .input(z.object({
        mes: z.number(),
        ano: z.number(),
      }))
      .query(async ({ input }) => {
        const vagas = await db.getVagasByPeriod(input.mes, input.ano);

        const aberta = vagas.filter(v => v.status === "aberta").length;
        const emAndamento = vagas.filter(v => v.status === "em_andamento").length;
        const fechada = vagas.filter(v => v.status === "fechada").length;
        const cancelada = vagas.filter(v => v.status === "cancelada").length;

        return [
          { name: "Aberta", value: aberta, fill: "#1565C0" },
          { name: "Em Andamento", value: emAndamento, fill: "#F9A825" },
          { name: "Fechada", value: fechada, fill: "#4CAF50" },
          { name: "Cancelada", value: cancelada, fill: "#F44336" },
        ];
      }),
  }),
});

export type AppRouter = typeof appRouter;
