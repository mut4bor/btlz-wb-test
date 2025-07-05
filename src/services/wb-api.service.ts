import axios from "axios";
import {
    WBTariffResponse,
    WBTariff,
    WBTariffSuccessResponseSchema,
    Error400ResponseSchema,
    Error401ResponseSchema,
    Error429ResponseSchema,
} from "#types/index.js";

export class WBApiService {
    private readonly apiUrl = "https://common-api.wildberries.ru/api/v1/tariffs/box";
    private readonly token: string;

    constructor(token: string) {
        this.token = token;
    }

    async getTariffs(): Promise<WBTariff> {
        try {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, "0");
            const day = String(today.getDate()).padStart(2, "0");
            const dateString = `${year}-${month}-${day}`;

            const response = await axios.get<WBTariffResponse>(this.apiUrl, {
                headers: {
                    "Authorization": `Bearer ${this.token}`,
                    "Content-Type": "application/json",
                },
                params: {
                    date: dateString,
                },
            });

            const parsedResponse = WBTariffSuccessResponseSchema.safeParse(response.data);

            if (parsedResponse.success) {
                return parsedResponse.data.response.data;
            } else {
                const error400 = Error400ResponseSchema.safeParse(response.data);
                if (error400.success) {
                    throw new Error(`WB API Error (400): ${error400.data.detail || error400.data.title}`);
                }

                const error401 = Error401ResponseSchema.safeParse(response.data);
                if (error401.success) {
                    throw new Error(`WB API Error (401): ${error401.data.detail || error401.data.title}`);
                }

                const error429 = Error429ResponseSchema.safeParse(response.data);
                if (error429.success) {
                    throw new Error(`WB API Error (429): ${error429.data.detail || error429.data.title}`);
                }

                console.error("Received an error response or unexpected data format:", response.data);
                throw new Error(`WB API Error: Unexpected response format or API errore. Details: ${JSON.stringify(response.data)}`);
            }
        } catch (error) {
            console.error("Error fetching WB tariffs:", error);
            throw error;
        }
    }
}
