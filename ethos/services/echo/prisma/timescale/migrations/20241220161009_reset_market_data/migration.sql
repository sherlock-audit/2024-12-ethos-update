-- New markets smart contract reset.
TRUNCATE TABLE market_prices RESTART IDENTITY CASCADE;
TRUNCATE TABLE market_votes RESTART IDENTITY CASCADE;
