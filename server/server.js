
import express from "express";
import cors from "cors";
import Database from "better-sqlite3";

import { mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ============================================
// CONFIGURAÇÕES
// ============================================

const PORT = 3001;

const DATA_DIR = join(__dirname, "data");
const DATABASE_PATH = join(DATA_DIR, "ranking.db");

mkdirSync(DATA_DIR, { recursive: true });

// ============================================
// BANCO DE DADOS SQLITE
// ============================================

const db = new Database(DATABASE_PATH);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
    CREATE TABLE IF NOT EXISTS ranking (
        id INTEGER PRIMARY KEY AUTOINCREMENT,

        name TEXT NOT NULL,
        room TEXT NOT NULL,

        name_key TEXT NOT NULL,
        room_key TEXT NOT NULL,

        points INTEGER NOT NULL,
        elapsed REAL NOT NULL,

        classification TEXT NOT NULL,
        scenario TEXT NOT NULL,
        difficulty TEXT NOT NULL,

        success INTEGER NOT NULL DEFAULT 0,

        created_at TEXT DEFAULT CURRENT_TIMESTAMP,

        UNIQUE(name_key, room_key)
    );
`);

// ============================================
// SERVIDOR EXPRESS
// ============================================

const app = express();

app.use(cors());

app.use(express.json({ limit: "20kb" }));

// ============================================
// ROTA: VERIFICAR SERVIDOR
// ============================================

app.get("/api/health", (req, res) => {
    res.json({
        ok: true,
        message: "Servidor do ranking funcionando!",
        port: PORT
    });
});

// ============================================
// ROTA: CARREGAR RANKING
// ============================================

app.get("/api/ranking", (req, res) => {
    try {
        const ranking = db.prepare(`
            SELECT
                id,
                name,
                room,
                points,
                elapsed,
                classification,
                scenario,
                difficulty,
                created_at
            FROM ranking
            WHERE success = 1
            ORDER BY points DESC, elapsed ASC
            LIMIT 100
        `).all();

        res.set("Cache-Control", "no-store");
        res.json(ranking);

    } catch (error) {
        console.error("Erro ao carregar ranking:", error);

        res.status(500).json({
            ok: false,
            error: "Não foi possível carregar o ranking."
        });
    }
});

// ============================================
// ROTA: REGISTRAR RESULTADO
// ============================================

app.post("/api/ranking", (req, res) => {
    try {
        const {
            name,
            room,
            points,
            elapsed,
            classification,
            scenario,
            difficulty,
            success
        } = req.body || {};

        // VALIDAÇÃO

        if (
            typeof name !== "string" ||
            !name.trim() ||

            typeof room !== "string" ||
            !room.trim() ||

            typeof points !== "number" ||
            !Number.isFinite(points) ||
            points < 0 ||
            points > 1000 ||

            typeof elapsed !== "number" ||
            !Number.isFinite(elapsed) ||
            elapsed < 0 ||

            typeof success !== "boolean"
        ) {
            return res.status(400).json({
                ok: false,
                error: "Dados da partida inválidos."
            });
        }

        if (!success) {
            return res.status(400).json({
                ok: false,
                error: "Somente missões concluídas podem entrar no ranking."
            });
        }

        // LIMPEZA DOS DADOS

        const cleanName = name.trim().slice(0, 60);
        const cleanRoom = room.trim().slice(0, 60);

        const nameKey = cleanName.toLocaleLowerCase("pt-BR");
        const roomKey = cleanRoom.toLocaleLowerCase("pt-BR");

        const cleanPoints = Math.round(points);
        const cleanElapsed = Number(elapsed.toFixed(2));

        const cleanClassification = String(
            classification || "SEM CLASSIFICAÇÃO"
        ).trim().slice(0, 40);

        const cleanScenario = String(
            scenario || "CENÁRIO"
        ).trim().slice(0, 80);

        const cleanDifficulty = String(
            difficulty || "medium"
        ).trim().slice(0, 30);

        // SALVAR OU ATUALIZAR O MELHOR RESULTADO

        const saveResult = db.prepare(`
            INSERT INTO ranking (
                name,
                room,
                name_key,
                room_key,
                points,
                elapsed,
                classification,
                scenario,
                difficulty,
                success
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)

            ON CONFLICT(name_key, room_key)
            DO UPDATE SET
                name = excluded.name,
                room = excluded.room,
                points = excluded.points,
                elapsed = excluded.elapsed,
                classification = excluded.classification,
                scenario = excluded.scenario,
                difficulty = excluded.difficulty,
                success = 1,
                created_at = CURRENT_TIMESTAMP

            WHERE
                ranking.success = 0
                OR excluded.points > ranking.points
                OR (
                    excluded.points = ranking.points
                    AND excluded.elapsed < ranking.elapsed
                )
        `);

        const result = saveResult.run(
            cleanName,
            cleanRoom,
            nameKey,
            roomKey,
            cleanPoints,
            cleanElapsed,
            cleanClassification,
            cleanScenario,
            cleanDifficulty
        );

        // CONSULTAR RESULTADO ATUAL DO JOGADOR

        const savedPlayer = db.prepare(`
            SELECT
                id,
                name,
                room,
                points,
                elapsed,
                classification,
                scenario,
                difficulty,
                created_at
            FROM ranking
            WHERE name_key = ? AND room_key = ?
        `).get(nameKey, roomKey);

        res.json({
            ok: true,
            updated: result.changes > 0,
            message: result.changes > 0
                ? "Resultado registrado no ranking!"
                : "Seu recorde anterior continua sendo o melhor!",
            player: savedPlayer
        });

    } catch (error) {
        console.error("Erro ao registrar resultado:", error);

        res.status(500).json({
            ok: false,
            error: "Não foi possível registrar o resultado."
        });
    }
});

// ============================================
// ROTA: CONSULTAR UM JOGADOR
// ============================================

app.get("/api/ranking/player", (req, res) => {
    try {
        const name = String(req.query.name || "").trim();
        const room = String(req.query.room || "").trim();

        if (!name || !room) {
            return res.status(400).json({
                ok: false,
                error: "Informe o nome e a turma do jogador."
            });
        }

        const nameKey = name.toLocaleLowerCase("pt-BR");
        const roomKey = room.toLocaleLowerCase("pt-BR");

        const player = db.prepare(`
            SELECT
                id,
                name,
                room,
                points,
                elapsed,
                classification,
                scenario,
                difficulty,
                created_at
            FROM ranking
            WHERE name_key = ?
              AND room_key = ?
              AND success = 1
        `).get(nameKey, roomKey);

        if (!player) {
            return res.status(404).json({
                ok: false,
                error: "Jogador ainda não possui resultado no ranking."
            });
        }

        res.json({
            ok: true,
            player
        });

    } catch (error) {
        console.error("Erro ao consultar jogador:", error);

        res.status(500).json({
            ok: false,
            error: "Não foi possível consultar o jogador."
        });
    }
});

// ============================================
// INICIAR SERVIDOR
// ============================================

const server = app.listen(PORT, "0.0.0.0", () => {
    console.log("---------------------------------------");
    console.log("          FOGO EM ALERTA");
    console.log("---------------------------------------");
    console.log(`Servidor: http://localhost:${PORT}`);
    console.log(`Ranking:  http://localhost:${PORT}/api/ranking`);
    console.log(`Status:   http://localhost:${PORT}/api/health`);
    console.log("---------------------------------------");
});

// ============================================
// ENCERRAMENTO SEGURO
// ============================================

let shuttingDown = false;

function shutdown() {
    if (shuttingDown) return;

    shuttingDown = true;

    console.log("\nEncerrando servidor do ranking...");

    server.close(() => {
        db.close();
        console.log("Banco de dados fechado.");
        process.exit(0);
    });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
