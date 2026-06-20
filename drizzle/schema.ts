import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, date } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Lojas/Unidades
 */
export const lojas = mysqlTable("lojas", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  cnpj: varchar("cnpj", { length: 18 }),
  endereco: text("endereco"),
  nomeResponsavel: varchar("nomeResponsavel", { length: 255 }),
  cidade: varchar("cidade", { length: 255 }),
  estado: varchar("estado", { length: 2 }),
  ativa: int("ativa").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Loja = typeof lojas.$inferSelect;
export type InsertLoja = typeof lojas.$inferInsert;

/**
 * Vagas de Recrutamento
 */
export const vagas = mysqlTable("vagas", {
  id: int("id").autoincrement().primaryKey(),
  cargo: varchar("cargo", { length: 255 }).notNull(),
  lojaId: int("lojaId").notNull(),
  status: mysqlEnum("status", ["aberta", "em_andamento", "fechada", "cancelada"]).default("aberta").notNull(),
  dataAbertura: date("dataAbertura").notNull(),
  dataFechamento: date("dataFechamento"),
  descricao: text("descricao"),
  quantidadeVagas: int("quantidadeVagas").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Vaga = typeof vagas.$inferSelect;
export type InsertVaga = typeof vagas.$inferInsert;

/**
 * Candidatos
 */
export const candidatos = mysqlTable("candidatos", {
  id: int("id").autoincrement().primaryKey(),
  vagaId: int("vagaId").notNull(),
  nome: varchar("nome", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  telefone: varchar("telefone", { length: 20 }),
  dataCandidatura: date("dataCandidatura").notNull(),
  status: mysqlEnum("status", ["triagem", "entrevista", "teste", "oferta", "contratado", "rejeitado"]).default("triagem").notNull(),
  recrutador: varchar("recrutador", { length: 255 }),
  observacoes: text("observacoes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Candidato = typeof candidatos.$inferSelect;
export type InsertCandidato = typeof candidatos.$inferInsert;

/**
 * Etapas do Processo Seletivo
 */
export const etapasSeletivas = mysqlTable("etapasSeletivas", {
  id: int("id").autoincrement().primaryKey(),
  candidatoId: int("candidatoId").notNull(),
  etapa: mysqlEnum("etapa", ["triagem", "entrevista", "teste", "oferta"]).notNull(),
  dataEtapa: date("dataEtapa").notNull(),
  resultado: mysqlEnum("resultado", ["pendente", "aprovado", "reprovado"]).default("pendente").notNull(),
  observacoes: text("observacoes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EtapaSeletiva = typeof etapasSeletivas.$inferSelect;
export type InsertEtapaSeletiva = typeof etapasSeletivas.$inferInsert;

/**
 * Indicadores Mensais (Relatório Editável)
 */
export const indicadoresMensais = mysqlTable("indicadoresMensais", {
  id: int("id").autoincrement().primaryKey(),
  mes: int("mes").notNull(),
  ano: int("ano").notNull(),
  vagasAbertas: int("vagasAbertas").default(0).notNull(),
  vagasFechadas: int("vagasFechadas").default(0).notNull(),
  totalCandidatos: int("totalCandidatos").default(0).notNull(),
  contratacoes: int("contratacoes").default(0).notNull(),
  tempoMedioFechamento: decimal("tempoMedioFechamento", { precision: 5, scale: 2 }).default("0"),
  taxaAproveitamento: decimal("taxaAproveitamento", { precision: 5, scale: 2 }).default("0"),
  resumo: text("resumo"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type IndicadorMensal = typeof indicadoresMensais.$inferSelect;
export type InsertIndicadorMensal = typeof indicadoresMensais.$inferInsert;
