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
        cnpj: z.string().optional(),
        endereco: z.string().optional(),
        nomeResponsavel: z.string().optional(),
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
        cnpj: z.string().optional(),
        endereco: z.string().optional(),
        nomeResponsavel: z.string().optional(),
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
        dataAbertura: z.union([z.date(), z.string()]),
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
        dataAbertura: z.union([z.date(), z.string()]).optional(),
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
    list: protectedProcedure
      .input(z.object({
        mes: z.number().optional(),
        ano: z.number().optional(),
      }))
      .query(async ({ input }) => {
        if (input.mes !== undefined && input.ano !== undefined) {
          return db.getCandidatosByPeriod(input.mes, input.ano);
        }
        return db.getAllCandidatos();
      }),
    create: protectedProcedure
      .input(z.object({
        nome: z.string().min(1),
        email: z.string().email(),
        vagaId: z.number(),
        dataCandidatura: z.union([z.date(), z.string()]),
        status: z.enum(["triagem", "entrevista", "teste", "oferta", "contratado", "rejeitado"]).optional(),
      }))
      .mutation(async ({ input }) => {
        return db.createCandidato(input);
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        nome: z.string().optional(),
        email: z.string().email().optional(),
        vagaId: z.number().optional(),
        status: z.enum(["triagem", "entrevista", "teste", "oferta", "contratado", "rejeitado"]).optional(),
        dataCandidatura: z.union([z.date(), z.string()]).optional(),
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
    list: protectedProcedure
      .input(z.object({ candidatoId: z.number() }))
      .query(async ({ input }) => {
        return db.getEtapasByCandidato(input.candidatoId);
      }),
    create: protectedProcedure
      .input(z.object({
        candidatoId: z.number(),
        etapa: z.enum(["triagem", "entrevista", "teste", "oferta", "contratado", "rejeitado"]),
        dataEtapa: z.date(),
        resultado: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return db.createEtapaSeletiva(input);
      }),
  }),

  // ============= INDICADORES =============
  indicadores: router({
    getMensal: protectedProcedure
      .input(z.object({
        mes: z.number(),
        ano: z.number(),
      }))
      .query(async ({ input }) => {
        return db.getIndicadorMensal(input.mes, input.ano);
      }),
    create: protectedProcedure
      .input(z.object({
        mes: z.number(),
        ano: z.number(),
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
        lojaId: z.number().optional(),
      }))
      .query(async ({ input }) => {
        let vagasAbertas = await db.getVagasAbertasPorPeriodo(input.mes, input.ano);
        let vagasFechadas = await db.getVagasFechadasPorPeriodo(input.mes, input.ano);
        let candidatos = await db.getCandidatosByPeriod(input.mes, input.ano);
        
        if (input.lojaId) {
          const vagas = await db.getVagasByPeriod(input.mes, input.ano);
          const vagasLoja = vagas.filter(v => v.lojaId === input.lojaId);
          vagasAbertas = vagasLoja.filter(v => v.status === "aberta").length;
          vagasFechadas = vagasLoja.filter(v => v.status === "fechada").length;
          candidatos = candidatos.filter(c => {
            const vaga = vagasLoja.find(v => v.id === c.vagaId);
            return vaga !== undefined;
          });
        }
        const indicador = await db.getIndicadorMensal(input.mes, input.ano);

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
          { name: "Aberta", value: aberta },
          { name: "Em Andamento", value: emAndamento },
          { name: "Fechada", value: fechada },
          { name: "Cancelada", value: cancelada },
        ];
      }),

    relatorioMensal: protectedProcedure
      .input(z.object({
        mes: z.number(),
        ano: z.number(),
      }))
      .query(async ({ input }) => {
        const vagas = await db.getVagasByPeriod(input.mes, input.ano);
        const candidatos = await db.getCandidatosByPeriod(input.mes, input.ano);
        const lojas = await db.getAllLojas();

        const relatorioLoja = lojas.map(loja => {
          const vagasLoja = vagas.filter(v => v.lojaId === loja.id);
          const candidatosLoja = candidatos.filter(c => {
            const vaga = vagasLoja.find(v => v.id === c.vagaId);
            return vaga !== undefined;
          });

          return {
            loja: loja.nome,
            vagasAbertas: vagasLoja.filter(v => v.status === "aberta").length,
            vagasFechadas: vagasLoja.filter(v => v.status === "fechada").length,
            totalVagas: vagasLoja.length,
            totalCandidatos: candidatosLoja.length,
            contratados: candidatosLoja.filter(c => c.status === "contratado").length,
          };
        });

        const totais = {
          vagasAbertas: vagas.filter(v => v.status === "aberta").length,
          vagasFechadas: vagas.filter(v => v.status === "fechada").length,
          totalVagas: vagas.length,
          totalCandidatos: candidatos.length,
          contratados: candidatos.filter(c => c.status === "contratado").length,
        };

        return {
          relatorioLoja,
          totais,
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
