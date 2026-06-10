CREATE TABLE `candidatos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`vagaId` int NOT NULL,
	`nome` varchar(255) NOT NULL,
	`email` varchar(320),
	`telefone` varchar(20),
	`dataCandidatura` date NOT NULL,
	`status` enum('triagem','entrevista','teste','oferta','contratado','rejeitado') NOT NULL DEFAULT 'triagem',
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `candidatos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `etapasSeletivas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`candidatoId` int NOT NULL,
	`etapa` enum('triagem','entrevista','teste','oferta') NOT NULL,
	`dataEtapa` date NOT NULL,
	`resultado` enum('pendente','aprovado','reprovado') NOT NULL DEFAULT 'pendente',
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `etapasSeletivas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `indicadoresMensais` (
	`id` int AUTO_INCREMENT NOT NULL,
	`mes` int NOT NULL,
	`ano` int NOT NULL,
	`vagasAbertas` int NOT NULL DEFAULT 0,
	`vagasFechadas` int NOT NULL DEFAULT 0,
	`totalCandidatos` int NOT NULL DEFAULT 0,
	`contratacoes` int NOT NULL DEFAULT 0,
	`tempoMedioFechamento` decimal(5,2) DEFAULT '0',
	`taxaAproveitamento` decimal(5,2) DEFAULT '0',
	`resumo` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `indicadoresMensais_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lojas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(255) NOT NULL,
	`cidade` varchar(255),
	`estado` varchar(2),
	`ativa` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lojas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vagas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cargo` varchar(255) NOT NULL,
	`lojaId` int NOT NULL,
	`status` enum('aberta','em_andamento','fechada','cancelada') NOT NULL DEFAULT 'aberta',
	`dataAbertura` date NOT NULL,
	`dataFechamento` date,
	`descricao` text,
	`quantidadeVagas` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vagas_id` PRIMARY KEY(`id`)
);
