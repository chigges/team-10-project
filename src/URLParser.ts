import { readFileSync } from 'fs';

class URLParser {
    private filePath: string;

    constructor(filePath: string) {
        this.filePath = filePath;
    }

    getUrls(): string[] {
        const fileContent = readFileSync(this.filePath, 'utf-8');
        const urls = fileContent.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        return urls;
    }
}

export default URLParser;