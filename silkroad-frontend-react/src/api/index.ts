import axios from "axios";

export async function getPing(): Promise<string> {
    const res = await axios.get("/api/ping");
    return res.data.message;
}