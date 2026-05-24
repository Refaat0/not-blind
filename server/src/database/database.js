// Author: Refaat
import sqlite from "node:sqlite";
import path from "path";

const DevelopmentDatabase = new sqlite.DatabaseSync(path.join(process.cwd(), "/database/development.db"));
const ProductionDatabase = new sqlite.DatabaseSync(path.join(process.cwd(), "/database/production.db"));
const TestingDatabase = new sqlite.DatabaseSync(path.join(process.cwd(), "/database/testing.db"));

export default DevelopmentDatabase;
