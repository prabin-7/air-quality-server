import { DataSource } from "typeorm"
// import { ExhaustQuality } from "./entities/ExhaustQuality"

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    port: process.env.DB_PORT as any,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: true,
    logging: true,
    entities: ["dist/entities/**/*.js"],
    migrationsTableName: "air_quality_data_migration",
    migrations: ["src/migrations/*.ts"],

})
