import { z } from "zod";

export const WBWarehouseNameSchema = z.object({
    boxDeliveryAndStorageExpr: z
        .string()
        .describe("Коэффициент, %. На него умножается стоимость доставки и хранения. Во всех тарифах этот коэффициент уже учтён"),
    boxDeliveryBase: z.string().describe("Доставка 1 литра, ₽"),
    boxDeliveryLiter: z.string().describe("Доставка каждого дополнительного литра, ₽"),
    boxStorageBase: z.string().describe("Хранение 1 литра, ₽"),
    boxStorageLiter: z.string().describe("Хранение каждого дополнительного литра, ₽"),
    warehouseName: z.string().describe("Название склада"),
});

export type WBWarehouseName = z.infer<typeof WBWarehouseNameSchema>;

export const WBTariffSchema = z.object({
    dtNextBox: z.string().describe("Дата начала следующего тарифа"),
    dtTillMax: z.string().describe("Дата окончания последнего установленного тарифа"),
    warehouseList: z.array(WBWarehouseNameSchema).describe("Тарифы для коробов, сгруппированные по складам"),
});

export type WBTariff = z.infer<typeof WBTariffSchema>;

export const WBTariffSuccessResponseSchema = z.object({
    response: z.object({
        data: WBTariffSchema,
    }),
});

export const Error400ResponseSchema = z.object({
    detail: z.string().optional().describe("Детали ошибки"),
    origin: z.string().optional().describe("ID внутреннего сервиса WB"),
    requestId: z.string().optional().describe("Уникальный ID запроса"),
    title: z.string().optional().describe("Заголовок ошибки"),
});

export const Error401ResponseSchema = z.object({
    title: z.string().optional().describe("Заголовок ошибки"),
    detail: z.string().optional().describe("Детали ошибки"),
    code: z.string().optional().describe("Внутренний код ошибки"),
    requestId: z.string().optional().describe("Уникальный ID запроса"),
    origin: z.string().optional().describe("ID внутреннего сервиса WB"),
    status: z.number().optional().describe("HTTP статус-код"),
    statusText: z.string().optional().describe("Расшифровка HTTP статус-кода"),
    timestamp: z.string().datetime().optional().describe("Дата и время запроса (формат date-time)"),
});

export const Error429ResponseSchema = z.object({
    title: z.string().optional().describe("Заголовок ошибки"),
    detail: z.string().optional().describe("Детали ошибки"),
    code: z.string().optional().describe("Внутренний код ошибки"),
    requestId: z.string().optional().describe("Уникальный ID запроса"),
    origin: z.string().optional().describe("ID внутреннего сервиса WB"),
    status: z.number().optional().describe("HTTP статус-код"),
    statusText: z.string().optional().describe("Расшифровка HTTP статус-кода"),
    timestamp: z.string().datetime().optional().describe("Дата и время запроса (формат date-time)"),
});

export const WBTariffResponseSchema = z.union([WBTariffSuccessResponseSchema, Error400ResponseSchema, Error401ResponseSchema, Error429ResponseSchema]);

export type WBTariffResponse = z.infer<typeof WBTariffResponseSchema>;

export const StoredTariffSchema = z.object({
    id: z.number().optional(),
    warehouse_name: z.string(),
    box_delivery_and_storage_expr: z.number(),
    box_delivery_base: z.number(),
    box_delivery_liter: z.number(),
    box_storage_base: z.number(),
    box_storage_liter: z.number(),
    date: z.date(),
    created_at: z.date().optional(),
    updated_at: z.date().optional(),
});

export type StoredTariff = z.infer<typeof StoredTariffSchema>;

export const GoogleSheetsValueRangeSchema = z.object({
    range: z.string(),
    majorDimension: z.enum(["ROWS", "COLUMNS"]),
    values: z.array(z.array(z.any())).optional(),
});

export type GoogleSheetsValueRange = z.infer<typeof GoogleSheetsValueRangeSchema>;

export type GoogleSheetsResponse = GoogleSheetsValueRange;

export const GoogleSheetsUpdateResponseSchema = z.object({
    spreadsheetId: z.string(),
    updatedRange: z.string(),
    updatedRows: z.number(),
    updatedColumns: z.number(),
    updatedCells: z.number(),
});

export type GoogleSheetsUpdateResponse = z.infer<typeof GoogleSheetsUpdateResponseSchema>;

export const GoogleSheetsErrorSchema = z.object({
    code: z.number(),
    message: z.string(),
    status: z.string(),
});

export const GoogleSheetsErrorResponseSchema = z.object({
    error: GoogleSheetsErrorSchema,
});

export type GoogleSheetsErrorResponse = z.infer<typeof GoogleSheetsErrorResponseSchema>;
