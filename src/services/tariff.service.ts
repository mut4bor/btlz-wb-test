import knex from "#postgres/knex.js";
import { StoredTariff, WBTariff } from "#types/index.js";

const parseFloatNumber = (stringifiedNumber: string) => {
    const parsedNumber = parseFloat(stringifiedNumber.replace(",", "."));

    if (isNaN(parsedNumber)) {
        return null;
    }
    return parsedNumber;
};

export class TariffService {
    private tableName = "tariffs";

    /** Получить все тарифы */
    async getAllTariffs(): Promise<StoredTariff[]> {
        return await knex(this.tableName).select("*").orderBy("date", "desc");
    }

    /** Получить тарифы по дате */
    async getTariffsByDate(date: Date): Promise<StoredTariff[]> {
        return await knex(this.tableName).where("date", date.toISOString().split("T")[0]).orderBy("box_delivery_and_storage_expr", "asc");
    }

    /** Получить тарифы по названию склада */
    async getTariffsByWarehouse(warehouseName: string): Promise<StoredTariff[]> {
        return await knex(this.tableName).where("warehouse_name", warehouseName).orderBy("date", "desc");
    }

    /** Получить последние актуальные тарифы (по последней дате) */
    async getLatestTariffs(): Promise<StoredTariff[]> {
        const latestDate = await knex(this.tableName).max("date as latest_date").first();

        if (!latestDate?.latest_date) {
            return [];
        }

        return await knex(this.tableName).where("date", latestDate.latest_date).orderBy("box_delivery_and_storage_expr", "asc");
    }

    /** Сохранить или обновить тарифы */
    async upsertTariffs(wbTariff: WBTariff): Promise<void> {
        const date = new Date(wbTariff.dtTillMax);
        const dateString = date.toISOString().split("T")[0];

        const tariffs = wbTariff.warehouseList.map((warehouse) => {
            return {
                warehouse_name: warehouse.warehouseName,
                box_delivery_and_storage_expr: parseFloatNumber(warehouse.boxDeliveryAndStorageExpr),
                box_delivery_base: parseFloatNumber(warehouse.boxDeliveryBase),
                box_delivery_liter: parseFloatNumber(warehouse.boxDeliveryLiter),
                box_storage_base: parseFloatNumber(warehouse.boxStorageBase),
                box_storage_liter: parseFloatNumber(warehouse.boxStorageLiter),
                date: dateString,
            };
        });

        await knex.transaction(async (trx) => {
            for (const tariff of tariffs) {
                await trx(this.tableName).insert(tariff).onConflict(["warehouse_name", "date"]).merge({
                    box_delivery_and_storage_expr: tariff.box_delivery_and_storage_expr,
                    box_delivery_base: tariff.box_delivery_base,
                    box_delivery_liter: tariff.box_delivery_liter,
                    box_storage_base: tariff.box_storage_base,
                    box_storage_liter: tariff.box_storage_liter,
                    updated_at: knex.fn.now(),
                });
            }
        });
    }

    /** Удалить тарифы по дате */
    async deleteTariffsByDate(date: Date): Promise<number> {
        return await knex(this.tableName).where("date", date.toISOString().split("T")[0]).del();
    }

    /** Получить статистику по тарифам */
    async getTariffsStats(): Promise<{
        totalRecords: number;
        uniqueWarehouses: number;
        dateRange: { earliest: Date; latest: Date };
    }> {
        const stats = await knex(this.tableName)
            .select([
                knex.raw("COUNT(*) as total_records"),
                knex.raw("COUNT(DISTINCT warehouse_name) as unique_warehouses"),
                knex.raw("MIN(date) as earliest_date"),
                knex.raw("MAX(date) as latest_date"),
            ])
            .first();

        return {
            totalRecords: parseInt(stats.total_records),
            uniqueWarehouses: parseInt(stats.unique_warehouses),
            dateRange: {
                earliest: new Date(stats.earliest_date),
                latest: new Date(stats.latest_date),
            },
        };
    }

    /** Получить тарифы для Google Sheets (отсортированные по коэффициенту) */
    async getTariffsForGoogleSheets(date?: Date): Promise<StoredTariff[]> {
        let query = knex(this.tableName);

        if (date) {
            query = query.where("date", date.toISOString().split("T")[0]);
        } else {
            // Получаем последние актуальные тарифы
            const latestDate = await knex(this.tableName).max("date as latest_date").first();

            if (latestDate?.latest_date) {
                query = query.where("date", latestDate.latest_date);
            }
        }

        return await query.orderBy("box_delivery_and_storage_expr", "asc");
    }

    /** Очистить старые данные (старше N дней) */
    async cleanupOldData(daysToKeep: number = 30): Promise<number> {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

        return await knex(this.tableName).where("date", "<", cutoffDate.toISOString().split("T")[0]).del();
    }
}
