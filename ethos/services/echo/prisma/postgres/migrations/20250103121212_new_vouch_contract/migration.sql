-- AlterTable
TRUNCATE TABLE vouches CASCADE;
TRUNCATE TABLE vouch_events CASCADE;
DELETE FROM blockchain_event_polls WHERE contract='vouch';
DELETE FROM blockchain_events WHERE contract='vouch';
