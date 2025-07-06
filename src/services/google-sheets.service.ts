import { google } from "googleapis";
import { StoredTariff } from "#types/index.js";

export class GoogleSheetsService {
    private sheets: any;
    private auth: any;

    constructor(
        private serviceAccountEmail: string,
        private privateKey: string,
        private spreadsheetIds: string[],
    ) {
        this.auth = new google.auth.JWT(serviceAccountEmail, undefined, privateKey.replace(/\\n/g, "\n"), ["https://www.googleapis.com/auth/spreadsheets"]);

        this.sheets = google.sheets({ version: "v4", auth: this.auth });
    }

    async updateTariffs(tariffs: StoredTariff[]): Promise<void> {
        const values = [
            [
                "Название",
                "Коэффицент",
                "Доставка 1 литра, ₽",
                "Доставка каждого дополнительного литра, ₽",
                "Хранение 1 литра, ₽",
                "Хранение каждого дополнительного литра, ₽",
                "Дата",
            ],
            ...tariffs.map((tariff) => [
                tariff.warehouse_name ?? "-",
                tariff.box_delivery_and_storage_expr ?? "-",
                tariff.box_delivery_base ?? "-",
                tariff.box_delivery_liter ?? "-",
                tariff.box_storage_base ?? "-",
                tariff.box_storage_liter ?? "-",
                tariff.date ?? "-",
            ]),
        ];

        for (const spreadsheetId of this.spreadsheetIds) {
            try {
                await this.sheets.spreadsheets.values.update({
                    spreadsheetId,
                    range: "stocks_coefs!A1",
                    valueInputOption: "RAW",
                    resource: { values },
                });

                console.log(`Updated spreadsheet ${spreadsheetId}`);
            } catch (error) {
                console.error(`Error updating spreadsheet ${spreadsheetId}:`, error);
            }
        }
    }
}
