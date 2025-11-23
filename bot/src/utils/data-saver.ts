import fs from 'fs';
import path from 'path';

export interface SavedTokenData {
  timestamp: string;
  tokens: any[];
}

export class DataSaver {
  private dataDir: string;

  constructor(dataDir: string = '../../data') {
    this.dataDir = path.join(__dirname, dataDir);
    this.ensureDirectories();
  }

  /**
   * Ensure data directories exist
   */
  private ensureDirectories() {
    const dirs = [
      path.join(this.dataDir, 'trades'),
      path.join(this.dataDir, 'historical'),
      path.join(this.dataDir, 'logs'),
    ];

    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Save token data snapshot
   */
  saveTokenSnapshot(tokens: any[], filename?: string) {
    const timestamp = new Date().toISOString();
    const data: SavedTokenData = {
      timestamp,
      tokens,
    };

    const fileName = filename || `tokens_${Date.now()}.json`;
    const filePath = path.join(this.dataDir, 'historical', fileName);

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`💾 Saved ${tokens.length} tokens to ${fileName}`);
  }

  /**
   * Save trade execution data
   */
  saveTrade(trade: {
    symbol: string;
    address: string;
    action: 'buy' | 'sell';
    amount: number;
    price: number;
    reason: string;
  }) {
    const timestamp = new Date().toISOString();
    const tradeData = {
      timestamp,
      ...trade,
    };

    const filePath = path.join(this.dataDir, 'trades', 'trades.jsonl');
    
    // Append to JSONL file (one JSON object per line)
    fs.appendFileSync(filePath, JSON.stringify(tradeData) + '\n');
    console.log(`📝 Logged trade: ${trade.action} ${trade.symbol}`);
  }

  /**
   * Log analysis results
   */
  logAnalysis(analysis: {
    topTokens: any[];
    scores: Record<string, number>;
    metadata: any;
  }) {
    const timestamp = new Date().toISOString();
    const data = {
      timestamp,
      ...analysis,
    };

    const fileName = `analysis_${Date.now()}.json`;
    const filePath = path.join(this.dataDir, 'logs', fileName);

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`📊 Saved analysis to ${fileName}`);
  }
}

// Export singleton instance
export const dataSaver = new DataSaver();

