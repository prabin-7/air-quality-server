"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
exports.AppDataSource = new typeorm_1.DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "12345",
    database: "air_quality_monitor",
    synchronize: true,
    logging: true,
    entities: ["dist/entities/**/*.js"],
    migrationsTableName: "air_quality_data_migration",
    migrations: ["src/migrations/*.ts"],
});
//# sourceMappingURL=data-source.js.map