import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const HISTORY_FILE = path.join(__dirname, '../../data/searchHistory.json');

interface HistoryItem {
    id: number;
    city: string;
    timestamp: string;
}

class HistoryService {
    private static async ensureHistoryFile() {
        try {
            await fs.access(HISTORY_FILE);
        } catch {
            await fs.writeFile(HISTORY_FILE, JSON.stringify([]));
        }
    }

    static async getHistory(): Promise<HistoryItem[]> {
        await this.ensureHistoryFile();
        const data = await fs.readFile(HISTORY_FILE, 'utf-8');
        return JSON.parse(data);
    }

    static async saveCity(city: string): Promise<void> {
        await this.ensureHistoryFile();
        const history = await this.getHistory();
        const newItem: HistoryItem = {
            id: history.length > 0 ? Math.max(...history.map(item => item.id)) + 1 : 1,
            city,
            timestamp: new Date().toISOString()
        };
        history.push(newItem);
        await fs.writeFile(HISTORY_FILE, JSON.stringify(history, null, 2));
    }

    static async deleteCity(id: number): Promise<void> {
        await this.ensureHistoryFile();
        const history = await this.getHistory();
        const updatedHistory = history.filter(item => item.id !== id);
        await fs.writeFile(HISTORY_FILE, JSON.stringify(updatedHistory, null, 2));
    }
}

export default HistoryService;
