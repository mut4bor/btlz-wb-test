/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
export async function up(knex) {
    return knex.schema.createTable("tariffs", (table) => {
        table.increments("id").primary();
        table.string("warehouse_name").notNullable();
        table.decimal("box_delivery_and_storage_expr", 10, 2).notNullable();
        table.decimal("box_delivery_base", 10, 2).notNullable();
        table.decimal("box_delivery_liter", 10, 2).notNullable();
        table.decimal("box_storage_base", 10, 2);
        table.decimal("box_storage_liter", 10, 2);
        table.date("date").notNullable();
        table.timestamps(true, true);

        table.index(["warehouse_name", "date"]);
        table.index(["date"]);
        table.index(["box_delivery_and_storage_expr"]);

        table.unique(["warehouse_name", "date"]);
    });
}

/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
export async function down(knex) {
    return knex.schema.dropTable("tariffs");
}
