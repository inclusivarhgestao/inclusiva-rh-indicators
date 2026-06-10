import { eq, and, gte, lte, desc, asc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, lojas, vagas, candidatos, etapasSeletivas, indicadoresMensais } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============= LOJAS =============

export async function getAllLojas() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(lojas).where(eq(lojas.ativa, 1)).orderBy(asc(lojas.nome));
}

export async function createLoja(data: { nome: string; cidade?: string; estado?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(lojas).values(data);
  return result;
}

export async function updateLoja(id: number, data: Partial<{ nome: string; cidade?: string; estado?: string }>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(lojas).set(data).where(eq(lojas.id, id));
}

export async function deleteLoja(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(lojas).set({ ativa: 0 }).where(eq(lojas.id, id));
}

// ============= VAGAS =============

export async function createVaga(data: {
  cargo: string;
  lojaId: number;
  dataAbertura: Date | string;
  descricao?: string;
  quantidadeVagas?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Se for string (YYYY-MM-DD), converter para Date sem alterar
  let dateValue: Date = data.dataAbertura instanceof Date ? data.dataAbertura : new Date(data.dataAbertura + 'T00:00:00Z');
  return db.insert(vagas).values({
    cargo: data.cargo,
    lojaId: data.lojaId,
    dataAbertura: dateValue,
    descricao: data.descricao,
    quantidadeVagas: data.quantidadeVagas,
  });
}

export async function updateVaga(id: number, data: Partial<{
  cargo: string;
  lojaId: number;
  status: string;
  dataAbertura: Date | string;
  dataFechamento: Date | null;
  descricao: string;
  quantidadeVagas: number;
}>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updateData: any = {};
  if (data.cargo !== undefined) updateData.cargo = data.cargo;
  if (data.lojaId !== undefined) updateData.lojaId = data.lojaId;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.dataAbertura !== undefined) {
    if (typeof data.dataAbertura === 'string') {
      updateData.dataAbertura = new Date(data.dataAbertura + 'T00:00:00Z');
    } else {
      updateData.dataAbertura = data.dataAbertura;
    }
  }
  if (data.dataFechamento !== undefined) updateData.dataFechamento = data.dataFechamento;
  if (data.descricao !== undefined) updateData.descricao = data.descricao;
  if (data.quantidadeVagas !== undefined) updateData.quantidadeVagas = data.quantidadeVagas;
  return db.update(vagas).set(updateData).where(eq(vagas.id, id));
}

export async function deleteVaga(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(vagas).set({ status: "cancelada" }).where(eq(vagas.id, id));
}

export async function getVagasByPeriod(mes: number, ano: number) {
  const db = await getDb();
  if (!db) return [];
  
  const startDate = new Date(ano, mes, 1);
  const endDate = new Date(ano, mes + 1, 0);
  
  return db.select().from(vagas)
    .where(and(
      gte(vagas.dataAbertura, startDate),
      lte(vagas.dataAbertura, endDate)
    ))
    .orderBy(desc(vagas.dataAbertura));
}

export async function getAllVagas() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(vagas).orderBy(desc(vagas.dataAbertura));
}

// ============= CANDIDATOS =============

export async function createCandidato(data: {
  vagaId: number;
  nome: string;
  email?: string;
  telefone?: string;
  dataCandidatura: Date | string;
  observacoes?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Se for string (YYYY-MM-DD), converter para Date sem alterar
  let dateValue: Date = data.dataCandidatura instanceof Date ? data.dataCandidatura : new Date(data.dataCandidatura + 'T00:00:00Z');
  return db.insert(candidatos).values({
    vagaId: data.vagaId,
    nome: data.nome,
    email: data.email,
    telefone: data.telefone,
    dataCandidatura: dateValue,
    observacoes: data.observacoes,
  });
}

export async function updateCandidato(id: number, data: Partial<{
  vagaId: number;
  nome: string;
  email: string;
  telefone: string;
  status: string;
  observacoes: string;
}>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updateData: any = {};
  if (data.vagaId !== undefined) updateData.vagaId = data.vagaId;
  if (data.nome !== undefined) updateData.nome = data.nome;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.telefone !== undefined) updateData.telefone = data.telefone;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.observacoes !== undefined) updateData.observacoes = data.observacoes;
  return db.update(candidatos).set(updateData).where(eq(candidatos.id, id));
}

export async function deleteCandidato(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(candidatos).where(eq(candidatos.id, id));
}

export async function getCandidatosByVaga(vagaId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(candidatos).where(eq(candidatos.vagaId, vagaId)).orderBy(desc(candidatos.dataCandidatura));
}

export async function getCandidatosByPeriod(mes: number, ano: number) {
  const db = await getDb();
  if (!db) return [];
  
  const startDate = new Date(ano, mes, 1);
  const endDate = new Date(ano, mes + 1, 0);
  
  return db.select().from(candidatos)
    .where(and(
      gte(candidatos.dataCandidatura, startDate),
      lte(candidatos.dataCandidatura, endDate)
    ))
    .orderBy(desc(candidatos.dataCandidatura));
}

export async function getAllCandidatos() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(candidatos).orderBy(desc(candidatos.dataCandidatura));
}

// ============= ETAPAS SELETIVAS =============

export async function createEtapaSeletiva(data: {
  candidatoId: number;
  etapa: string;
  dataEtapa: Date;
  resultado?: string;
  observacoes?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(etapasSeletivas).values({
    candidatoId: data.candidatoId,
    etapa: data.etapa as any,
    dataEtapa: data.dataEtapa,
    resultado: (data.resultado as any) ?? 'pendente',
    observacoes: data.observacoes,
  });
}

export async function getEtapasByCandidato(candidatoId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(etapasSeletivas).where(eq(etapasSeletivas.candidatoId, candidatoId)).orderBy(asc(etapasSeletivas.dataEtapa));
}

// ============= INDICADORES MENSAIS =============

export async function getIndicadorMensal(mes: number, ano: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(indicadoresMensais)
    .where(and(eq(indicadoresMensais.mes, mes), eq(indicadoresMensais.ano, ano)))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

export async function createOrUpdateIndicadorMensal(mes: number, ano: number, data: Partial<{
  vagasAbertas: number;
  vagasFechadas: number;
  totalCandidatos: number;
  contratacoes: number;
  tempoMedioFechamento: string | number;
  taxaAproveitamento: string | number;
  resumo: string;
}>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await getIndicadorMensal(mes, ano);
  
  const updateData: Record<string, any> = {};
  if (data.vagasAbertas !== undefined) updateData.vagasAbertas = data.vagasAbertas;
  if (data.vagasFechadas !== undefined) updateData.vagasFechadas = data.vagasFechadas;
  if (data.contratacoes !== undefined) updateData.contratacoes = data.contratacoes;
  if (data.tempoMedioFechamento !== undefined) updateData.tempoMedioFechamento = data.tempoMedioFechamento;
  if (data.taxaAproveitamento !== undefined) updateData.taxaAproveitamento = data.taxaAproveitamento;
  if (data.resumo !== undefined) updateData.resumo = data.resumo;
  
  if (existing) {
    return db.update(indicadoresMensais).set(updateData).where(and(
      eq(indicadoresMensais.mes, mes),
      eq(indicadoresMensais.ano, ano)
    ));
  } else {
    const insertData: any = {
      mes,
      ano,
      vagasAbertas: data.vagasAbertas ?? 0,
      vagasFechadas: data.vagasFechadas ?? 0,
      totalCandidatos: data.totalCandidatos ?? 0,
      contratacoes: data.contratacoes ?? 0,
      tempoMedioFechamento: data.tempoMedioFechamento ?? 0,
      taxaAproveitamento: data.taxaAproveitamento ?? 0,
      resumo: data.resumo,
    };
    return db.insert(indicadoresMensais).values([insertData]);
  }
}

export async function getIndicadoresByAno(ano: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(indicadoresMensais).where(eq(indicadoresMensais.ano, ano)).orderBy(asc(indicadoresMensais.mes));
}
