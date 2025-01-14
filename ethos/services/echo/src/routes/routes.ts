import { type Express } from 'express';
import { AuthMiddlewares } from '../middlewares/auth-middlewares.route.js';
import { Activity } from './activity.route.js';
import { Addresses } from './addresses.route.js';
import { Attestation } from './attestation.route.js';
import { Claim } from './claim.route.js';
import { ContractRoute } from './contract.route.js';
import { Contribution } from './contribution.route.js';
import { Ens } from './ens.route.js';
import { Events } from './events.route.js';
import { ExchangeRates } from './exchange-rates.route.js';
import { Fees } from './fees.route.js';
import { FirebaseCloudMessaging } from './firebase-cloud-messaging.route.js';
import { deepCheck, healthCheck } from './healthcheck.js';
import { route } from './init.route.js';
import { InvitationRoute } from './invitation.route.js';
import { Market } from './market.route.js';
import { Migration } from './migration.route.js';
import { PrivyLogins } from './privy-logins.route.js';
import { Profile } from './profile.route.js';
import { Reply } from './reply.route.js';
import { Review } from './review.route.js';
import { Score } from './score.route.js';
import { SearchRoute } from './search.route.js';
import { Signatures } from './signatures.route.js';
import { Transactions } from './transactions.route.js';
import { Twitter } from './twitter.route.js';
import { Vouch } from './vouch.route.js';
import { XpRoute } from './xp.route.js';

export function initRoutes(app: Express): void {
  app.get('/', healthCheck);
  app.get('/healthcheck', healthCheck);
  app.get('/deepcheck', deepCheck);

  // v0
  app.get('/api/twitter/user', route(Twitter, 'user'));

  // v1
  app.get('/api/v1/exchange-rates/eth-price', route(ExchangeRates, 'getEthPriceInUSD'));
  // activities
  app.get('/api/v1/activities/actor/:userkey', route(Activity, 'getActor')); // order matters; actor is not a :type
  app.get('/api/v1/activities/:type/:id', route(Activity, 'getActivity'));
  app.post('/api/v1/activities', route(Activity, 'getActivities'));
  app.post('/api/v1/activities/unified', route(Activity, 'getUnifiedActivities'));
  app.post('/api/v1/activities/actors', route(Activity, 'getBulkActors'));
  app.post('/api/v1/activities/votes', route(Activity, 'getVotes'));
  app.get(
    '/api/v1/activities/invite/accepted-by/:profileId',
    route(Activity, 'getInvitesAcceptedBy'),
  );
  // attestations
  app.post('/api/v1/attestations', route(Attestation, 'query'));
  app.post('/api/v1/attestations/extended', route(Attestation, 'extendedQuery'));
  // contracts
  app.get('/api/v1/contracts', route(ContractRoute, 'getContractAddresses'));
  // ens
  app.get('/api/v1/ens-details/by-name/:name', route(Ens, 'getDetailsByName'));
  app.get('/api/v1/ens-details/by-address/:address', route(Ens, 'getDetailsByAddress'));
  // invitations
  app.post('/api/v1/invitations', route(InvitationRoute, 'query'));
  app.get('/api/v1/invitations/pending/:address', route(InvitationRoute, 'pending'));
  // profiles
  app.post('/api/v1/profiles', route(Profile, 'query'));
  app.post('/api/v1/profiles/recent', route(Profile, 'recent'));
  app.get('/api/v1/profiles/credibility-leaderboard', route(Profile, 'credibilityLeaderboard'));
  app.get('/api/v1/profiles/xp-leaderboard', route(Profile, 'xpLeaderboard'));

  // xp
  app.get('/api/v1/xp/:userkey/history', route(XpRoute, 'xpHistory'));
  app.post('/api/v1/xp/extension-daily-checkin', route(XpRoute, 'dailyCheckIn'));

  // addresses
  app.get('/api/v1/addresses/:userkey', route(Addresses, 'getByTarget'));
  // replies
  app.post('/api/v1/reply', route(Reply, 'query'));
  app.post('/api/v1/reply/summary', route(Reply, 'summary'));
  // reviews
  app.post('/api/v1/reviews', route(Review, 'query'));
  app.post('/api/v1/reviews/stats', route(Review, 'stats'));
  app.post('/api/v1/reviews/count', route(Review, 'count'));
  // scores
  app.get('/api/v1/score/:userkey', route(Score, 'getScore'));
  app.get('/api/v1/score/:userkey/history', route(Score, 'getScoreHistory'));
  app.get('/api/v1/score/actors/highest-scores', route(Score, 'getHighestScoringActors'));
  app.post('/api/v1/score/simulate', route(Score, 'simulate'));
  // search
  app.get('/api/v1/search', route(SearchRoute, 'search'));
  // transactions
  app.post('/api/v1/transactions/recent', route(Transactions, 'recent'));
  app.post('/api/v1/transactions/interactions', route(Transactions, 'interactions'));
  // vouches
  app.post('/api/v1/vouches', route(Vouch, 'query'));
  app.post('/api/v1/vouches/stats', route(Vouch, 'stats'));
  app.post('/api/v1/vouches/count', route(Vouch, 'count'));
  app.post('/api/v1/vouches/vouched-ethereum', route(Vouch, 'vouchedEthereum'));
  app.post('/api/v1/vouches/most-credible-vouchers', route(Vouch, 'mostCredibleVouchers'));
  app.get('/api/v1/vouches/mutual-vouchers', route(Vouch, 'mutualVouchers'));
  app.post('/api/v1/vouches/rewards', route(Vouch, 'rewards'));

  app.get('/api/v1/markets/search', route(Market, 'search'));
  app.post('/api/v1/markets/bulk', route(Market, 'bulkInfo'));
  app.post('/api/v1/markets/news', route(Market, 'news'));
  app.get('/api/v1/markets/:profileId', route(Market, 'info'));
  app.get('/api/v1/markets/:profileId/price/history', route(Market, 'priceHistory'));
  app.get('/api/v1/markets/:profileId/tx/history', route(Market, 'txHistory'));
  app.get('/api/v1/markets/:profileId/holders', route(Market, 'holders'));
  app.get('/api/v1/markets/activity/:address', route(Market, 'txHistoryByAddress'));
  app.get('/api/v1/markets/holdings/:address', route(Market, 'holdingsByAddress'));
  app.get('/api/v1/markets/holdings/:address/total', route(Market, 'holdingsTotalByAddress'));
  app.get('/api/v1/markets/volume/:address', route(Market, 'volumeTradedByAddress'));
  app.get('/api/v1/markets/tx/history', route(Market, 'txHistory'));
  // Fees
  app.get('/api/v1/fees', route(Fees, 'info'));

  // ProcessBlockchain events
  app.get(
    '/api/v1/events/process',
    route(AuthMiddlewares, 'requirePrivySession'),
    route(Events, 'processEvent'),
  );

  // Contribution
  app.get('/api/v1/contributions/:profileId', route(Contribution, 'query'));
  app.get('/api/v1/contributions/:profileId/stats', route(Contribution, 'stats'));
  app.post(
    '/api/v1/contributions/action',
    route(AuthMiddlewares, 'requirePrivySessionAndProfile'),
    route(Contribution, 'action'),
  );
  app.post(
    '/api/v1/contributions/create',
    route(AuthMiddlewares, 'requirePrivySessionAndProfile'),
    route(Contribution, 'create'),
  );
  app.post(
    '/api/v1/contributions/daily',
    route(AuthMiddlewares, 'requirePrivySessionAndProfile'),
    route(Contribution, 'daily'),
  );

  // Firebase notifications
  app.post(
    '/api/v1/notifications/user-fcm-token',
    route(AuthMiddlewares, 'requirePrivySessionAndProfile'),
    route(FirebaseCloudMessaging, 'updateUserFCMToken'),
  );

  // Privy logins
  app.post(
    '/api/v1/privy-logins',
    route(AuthMiddlewares, 'checkPrivySession'),
    route(PrivyLogins, 'create'),
  );

  // Signatures
  app.post(
    '/api/v1/signatures/create-attestation',
    route(AuthMiddlewares, 'requirePrivySessionAndProfile'),
    route(Signatures, 'createAttestation'),
  );
  app.post(
    '/api/v1/signatures/register-address',
    route(AuthMiddlewares, 'requirePrivySessionAndProfile'),
    route(Signatures, 'registerAddress'),
  );

  // Claim
  app.get('/api/v1/claim/twitter/login', route(Claim, 'twitterLogin'));
  app.get(
    '/api/v1/claim/twitter/callback',
    route(Claim, 'twitterCallback'),
    route(Claim, 'claimXp'),
  );
  app.get('/api/v1/claim/stats', route(Claim, 'checkSession'), route(Claim, 'stats'));
  app.get(
    '/api/v1/claim/accepted-referrals',
    route(Claim, 'checkSession'),
    route(Claim, 'acceptedReferrals'),
  );
  app.delete('/api/v1/claim', route(Claim, 'resetClaim'));

  // Migrate activities from testnet to mainnet
  app.get('/api/v1/migration/activities', route(Migration, 'getActivities'));
}
