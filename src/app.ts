import _knex from "knex";
import { WBApiService } from "./services/wb-api.service.js";
import { TariffService } from "./services/tariff.service.js";
import { GoogleSheetsService } from "./services/google-sheets.service.js";
import { SchedulerService } from "./services/scheduler.service.js";
import knex from "#postgres/knex.js";
import env from "#config/env/env.js";

class App {
    private db: _knex.Knex;
    private wbApiService: WBApiService;
    private tariffService: TariffService;
    private googleSheetsService: GoogleSheetsService;
    private schedulerService: SchedulerService;

    constructor() {
        this.db = knex;

        this.wbApiService = new WBApiService(process.env.WB_API_TOKEN || "");

        this.tariffService = new TariffService();

        this.googleSheetsService = new GoogleSheetsService(
            env.GOOGLE_SHEETS_ACCOUNT_EMAIL || "",
            env.GOOGLE_SHEETS_PRIVATE_KEY || "",
            (env.GOOGLE_SHEETS_SPREADSHEET_IDS || "").split(","),
        );

        this.schedulerService = new SchedulerService(this.wbApiService, this.tariffService, this.googleSheetsService);
    }

    async start(): Promise<void> {
        try {
            await this.db.migrate.latest();
            console.log("Database migrations completed");

            this.schedulerService.start();

            console.log("Initial data fetch...");
            const tariffs = await this.wbApiService.getTariffs();
            await this.tariffService.upsertTariffs(tariffs);
            console.log("Initial data saved");

            console.log("Application started successfully");
        } catch (error) {
            console.error("Error starting application:", error);
            process.exit(1);
        }
    }
}

const app = new App();
app.start();
