import { DataSource } from "typeorm"
// import { ExhaustQuality } from "./entities/ExhaustQuality"

export const AppDataSource = new DataSource({
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

})