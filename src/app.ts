import { migrate, seed } from "#postgres/knex.js";
import { tariffService } from "#services/tariff.service.js";
import { WBApiService } from "#services/wb-api.service.js";
import env from "#config/env/env.js";

await migrate.latest();
await seed.run();

// console.log("All migrations and seeds have been run");

// Получение всех тарифов
const allTariffs = await tariffService.getAllTariffs();

// console.log("allTariffs", allTariffs);

// Получение тарифов по дате
const todayTariffs = await tariffService.getTariffsByDate(new Date());

// console.log("todayTariffs", todayTariffs);

// Получение последних актуальных тарифов
const latestTariffs = await tariffService.getLatestTariffs();

// console.log("latestTariffs", latestTariffs);

const wbApiService = new WBApiService(env.WB_API_TOKEN);

const wbTariffData = await wbApiService.getTariffs();

console.log("wbTariffData", wbTariffData);

// Сохранение тарифов из API WB
await tariffService.upsertTariffs(wbTariffData);

// console.log("Tariffs saved successfully");

// Получение статистики
const stats = await tariffService.getTariffsStats();

// console.log("stats", stats);
