import json
import pandas as pd
from pathlib import Path
from datetime import datetime

# Paths to data saved by the bot
DATA_DIR = Path(__file__).parent.parent / 'data'
HISTORICAL_DIR = DATA_DIR / 'historical'
TRADES_FILE = DATA_DIR / 'trades' / 'trades.jsonl'
LOGS_DIR = DATA_DIR / 'logs'


def load_latest_tokens():
    """
    Load the latest token snapshot saved by the bot
    
    Returns:
        dict: Token data with timestamp
    """
    latest_file = HISTORICAL_DIR / 'latest_tokens.json'
    
    if not latest_file.exists():
        print("⚠️  No token data found. Run the bot first to collect data.")
        return None
    
    with open(latest_file, 'r') as f:
        data = json.load(f)
    
    print(f"📊 Loaded {len(data['tokens'])} tokens from {data['timestamp']}")
    return data


def load_trades():
    """
    Load all trades from the JSONL file
    
    Returns:
        pd.DataFrame: Trades as a DataFrame
    """
    if not TRADES_FILE.exists():
        print("⚠️  No trades found yet.")
        return pd.DataFrame()
    
    trades = []
    with open(TRADES_FILE, 'r') as f:
        for line in f:
            trades.append(json.loads(line))
    
    df = pd.DataFrame(trades)
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    
    print(f"📈 Loaded {len(df)} trades")
    return df


def load_analysis_logs():
    """
    Load all analysis logs
    
    Returns:
        list: All analysis logs
    """
    if not LOGS_DIR.exists():
        return []
    
    logs = []
    for log_file in sorted(LOGS_DIR.glob('analysis_*.json')):
        with open(log_file, 'r') as f:
            logs.append(json.load(f))
    
    print(f"📋 Loaded {len(logs)} analysis logs")
    return logs


def analyze_token_performance():
    """
    Analyze token performance from saved data
    """
    # Load latest tokens
    token_data = load_latest_tokens()
    if not token_data:
        return
    
    tokens = token_data['tokens']
    df = pd.DataFrame(tokens)
    
    # Basic statistics
    print("\n📊 Token Statistics:")
    print(f"Average Market Cap: ${df['mcap'].mean():,.2f}")
    print(f"Average Liquidity: ${df['liquidity'].mean():,.2f}")
    print(f"Average Holders: {df['holderCount'].mean():.0f}")
    
    # Top tokens by volume
    if 'stats24h' in df.columns:
        df['volume_24h'] = df['stats24h'].apply(
            lambda x: (x.get('buyVolume', 0) + x.get('sellVolume', 0)) if isinstance(x, dict) else 0
        )
        
        print("\n🔥 Top 5 by 24h Volume:")
        top_volume = df.nlargest(5, 'volume_24h')[['symbol', 'name', 'volume_24h', 'mcap']]
        print(top_volume.to_string(index=False))


def analyze_trades():
    """
    Analyze trading performance
    """
    df = load_trades()
    if df.empty:
        print("\n⚠️  No trades to analyze yet. Bot hasn't executed any trades.")
        return
    
    print("\n💰 Trading Performance:")
    
    # Group by action
    print(f"Total Buys: {len(df[df['action'] == 'buy'])}")
    print(f"Total Sells: {len(df[df['action'] == 'sell'])}")
    
    # Calculate P&L (if we have matching buy/sell pairs)
    # This is a simplified example
    total_spent = df[df['action'] == 'buy']['amount'].sum() * df[df['action'] == 'buy']['price'].sum()
    total_earned = df[df['action'] == 'sell']['amount'].sum() * df[df['action'] == 'sell']['price'].sum()
    
    print(f"Total Spent: ${total_spent:,.2f}")
    print(f"Total Earned: ${total_earned:,.2f}")
    print(f"Net P&L: ${(total_earned - total_spent):,.2f}")


if __name__ == "__main__":
    print("🐍 Python Data Analysis\n")
    print("=" * 50)
    
    # Analyze tokens
    analyze_token_performance()
    
    # Analyze trades
    analyze_trades()
    
    print("\n" + "=" * 50)
    print("\n💡 Tip: Use Jupyter notebooks for deeper analysis!")
    print("   Run: jupyter notebook analysis/notebooks/")

