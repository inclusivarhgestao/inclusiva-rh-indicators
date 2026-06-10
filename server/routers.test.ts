import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock user context
const mockUser = {
  id: 1,
  openId: "test-user",
  email: "test@example.com",
  name: "Test User",
  loginMethod: "manus",
  role: "user" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

function createMockContext(): TrpcContext {
  return {
    user: mockUser,
    req: {
      protocol: "https",
      headers: {},
    } as any,
    res: {
      clearCookie: () => {},
    } as any,
  };
}

describe("Routers", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeAll(() => {
    const ctx = createMockContext();
    caller = appRouter.createCaller(ctx);
  });

  describe("Lojas", () => {
    it("should list lojas", async () => {
      const result = await caller.lojas.list();
      expect(Array.isArray(result)).toBe(true);
    });

    it("should create a loja", async () => {
      const result = await caller.lojas.create({
        nome: "Test Loja",
        cidade: "São Paulo",
        estado: "SP",
      });
      expect(result).toBeDefined();
    });
  });

  describe("Vagas", () => {
    it("should list vagas", async () => {
      const result = await caller.vagas.list({
        mes: new Date().getMonth(),
        ano: new Date().getFullYear(),
      });
      expect(Array.isArray(result)).toBe(true);
    });

    it("should create a vaga", async () => {
      const result = await caller.vagas.create({
        cargo: "Developer",
        lojaId: 1,
        dataAbertura: new Date(),
        descricao: "Test vaga",
        quantidadeVagas: 1,
      });
      expect(result).toBeDefined();
    });
  });

  describe("Candidatos", () => {
    it("should list candidatos by period", async () => {
      const result = await caller.candidatos.listByPeriod({
        mes: new Date().getMonth(),
        ano: new Date().getFullYear(),
      });
      expect(Array.isArray(result)).toBe(true);
    });

    it("should create a candidato", async () => {
      const result = await caller.candidatos.create({
        vagaId: 1,
        nome: "Test Candidato",
        email: "candidato@test.com",
        telefone: "11999999999",
        dataCandidatura: new Date(),
      });
      expect(result).toBeDefined();
    });
  });

  describe("Dashboard", () => {
    it("should get dashboard metrics", async () => {
      const result = await caller.dashboard.metrics({
        mes: new Date().getMonth(),
        ano: new Date().getFullYear(),
      });
      expect(result).toHaveProperty("vagasAbertas");
      expect(result).toHaveProperty("totalCandidatos");
      expect(result).toHaveProperty("contratados");
    });

    it("should get funil de selecao", async () => {
      const result = await caller.dashboard.funilSelecao({
        mes: new Date().getMonth(),
        ano: new Date().getFullYear(),
      });
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it("should get vagas por status", async () => {
      const result = await caller.dashboard.vagasPorStatus({
        mes: new Date().getMonth(),
        ano: new Date().getFullYear(),
      });
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("Indicadores", () => {
    it("should get indicador mensal", async () => {
      const result = await caller.indicadores.getMensal({
        mes: new Date().getMonth(),
        ano: new Date().getFullYear(),
      });
      // Result can be null if not created yet
      expect(result === null || typeof result === "object").toBe(true);
    });

    it("should update indicador mensal", async () => {
      const result = await caller.indicadores.update({
        mes: new Date().getMonth(),
        ano: new Date().getFullYear(),
        vagasAbertas: 5,
        vagasFechadas: 2,
        totalCandidatos: 10,
        contratacoes: 1,
        tempoMedioFechamento: 15,
        taxaAproveitamento: 80,
        resumo: "Test resumo",
      });
      expect(result).toBeDefined();
    });
  });
});
