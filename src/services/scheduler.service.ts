import cron from "node-cron";
import { WBApiService } from "./wb-api.service.js";
import { TariffService } from "./tariff.service.js";
import { GoogleSheetsService } from "./google-sheets.service.js";

export class SchedulerService {
    constructor(
        private wbApiService: WBApiService,
        private tariffService: TariffService,
        private googleSheetsApiService: GoogleSheetsService,
    ) {}

    start(): void {
        cron.schedule("0 * * * *", async () => {
            console.log("Fetching WB tariffs...");
            try {
                const tariffs = await this.wbApiService.getTariffs();
                await this.tariffService.upsertTariffs(tariffs);
                console.log("WB tariffs saved successfully");
            } catch (error) {
                console.error("Error fetching/saving WB tariffs:", error);
            }
        });

        cron.schedule("0 */6 * * *", async () => {
            console.log("Updating Google Sheets...");
            try {
                const tariffs = await this.tariffService.getLatestTariffs();
                await this.googleSheetsApiService.updateTariffs(tariffs);
                console.log("Google Sheets updated successfully");
            } catch (error) {
                console.error("Error updating Google Sheets:", error);
            }
        });

        console.log("Scheduler started");
    }
}
