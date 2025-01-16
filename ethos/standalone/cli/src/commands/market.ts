import { isValidAddress } from '@ethos/helpers';
import { formatEther, parseEther } from 'ethers';
import { type ArgumentsCamelCase, type Argv } from 'yargs';
import { Validator } from '../utils/input.js';
import { error, out, txn } from '../utils/output.js';
import { type WalletManager } from '../utils/walletManager.js';
import { Command, Subcommand } from './command.js';

class CreateMarket extends Subcommand {
  public readonly name = 'create';
  public readonly description = 'Create a new reputation market';
  public readonly arguments = (yargs: Argv): Argv =>
    yargs.options({
      initialLiquidity: {
        type: 'string',
        alias: 'l',
        describe: 'Initial liquidity to provide (in ETH)',
        demandOption: true,
      },
    });

  public async method(user: WalletManager, argv: ArgumentsCamelCase<unknown>): Promise<void> {
    const initialLiquidity = new Validator(argv).Float('initialLiquidity');

    out(`🏗️ Creating market for wallet's profile...`);
    await txn(user.connect.reputationMarket.createMarket(parseEther(initialLiquidity.toString())));
  }
}

class BuyVotes extends Subcommand {
  public readonly name = 'buy';
  public readonly description = 'Buy votes in a reputation market';
  public readonly arguments = (yargs: Argv): Argv =>
    yargs.options({
      profileId: {
        type: 'number',
        alias: 'p',
        describe: 'Profile ID of the market',
        demandOption: true,
      },
      isPositive: {
        type: 'boolean',
        alias: 'i',
        describe: 'Buy positive votes (true) or negative votes (false)',
        demandOption: true,
      },
      amount: {
        type: 'string',
        alias: 'a',
        describe: 'Amount to spend (in ETH)',
        demandOption: true,
      },
      slippagePercent: {
        type: 'number',
        alias: 's',
        default: 10,
        describe:
          'The maximum slippage percentage you are willing to accept (.01 = 1%, .05 = 5%, .1 = 10%)',
        demandOption: false,
      },
    });

  public async method(user: WalletManager, argv: ArgumentsCamelCase<unknown>): Promise<void> {
    const profileId = new Validator(argv).Integer('profileId');
    const isPositive = new Validator(argv).Boolean('isPositive');
    const amount = new Validator(argv).Float('amount');
    const slippagePercent = new Validator(argv).Float('slippagePercent');

    const buyFeePercentage = await user.connect.reputationMarket.getBuyFeePercentage();

    const { maxVotesToBuy, minVotesToBuy } =
      await user.connect.reputationMarket.calculateVotesToBuy(
        profileId,
        isPositive ? 'trust' : 'distrust',
        parseEther(amount.toString()),
        slippagePercent,
        buyFeePercentage,
      );

    out(`💰 Buying ${isPositive ? 'positive' : 'negative'} votes for profile ID: ${profileId}`);
    await txn(
      user.connect.reputationMarket.buyVotes(
        profileId,
        parseEther(amount.toString()),
        isPositive,
        maxVotesToBuy,
        minVotesToBuy,
      ),
    );
  }
}

class SellVotes extends Subcommand {
  public readonly name = 'sell';
  public readonly description = 'Sell votes in a reputation market';
  public readonly arguments = (yargs: Argv): Argv =>
    yargs.options({
      profileId: {
        type: 'number',
        alias: 'p',
        describe: 'Profile ID of the market',
        demandOption: true,
      },
      isPositive: {
        type: 'boolean',
        alias: 'i',
        describe: 'Sell positive votes (true) or negative votes (false)',
        demandOption: true,
      },
      amount: {
        type: 'number',
        alias: 'a',
        describe: 'Number of votes to sell',
        demandOption: true,
      },
    });

  public async method(user: WalletManager, argv: ArgumentsCamelCase<unknown>): Promise<void> {
    const profileId = new Validator(argv).Integer('profileId');
    const isPositive = new Validator(argv).Boolean('isPositive');
    const amount = new Validator(argv).Integer('amount');

    out(
      `💱 Selling ${amount} ${isPositive ? 'positive' : 'negative'} votes for profile ID: ${profileId}`,
    );
    await txn(user.connect.reputationMarket.sellVotes(profileId, isPositive, amount, 0n));
  }
}

class GetMarketInfo extends Subcommand {
  public readonly name = 'info';
  public readonly description = 'Get information about a reputation market';
  public readonly arguments = (yargs: Argv): Argv =>
    yargs.options({
      profileId: {
        type: 'number',
        alias: 'p',
        describe: 'Profile ID of the market',
        demandOption: true,
      },
    });

  public async method(user: WalletManager, argv: ArgumentsCamelCase<unknown>): Promise<void> {
    const profileId = new Validator(argv).Integer('profileId');

    const wallet = await user.getActiveWallet();

    if (!isValidAddress(wallet.address)) {
      error('No active wallet found');
      process.exit(0);
    }

    const market = await user.connect.reputationMarket.getMarket(profileId);
    const positivePrice = await user.connect.reputationMarket.getVotePrice(profileId, true);
    const negativePrice = await user.connect.reputationMarket.getVotePrice(profileId, false);
    const { trustVotes, distrustVotes } = await user.connect.reputationMarket.getUserVotes(
      wallet.address,
      profileId,
    );

    out(`📊 Market Info for Profile ID: ${profileId}`);
    out(`   Positive Votes: ${market.trustVotes}`);
    out(`   Negative Votes: ${market.distrustVotes}`);
    out(`   Positive Vote Price: ${formatEther(positivePrice)} ETH`);
    out(`   Negative Vote Price: ${formatEther(negativePrice)} ETH`);
    out(`   My Positive Votes: ${trustVotes}`);
    out(`   My Negative Votes: ${distrustVotes}`);
  }
}

export class MarketCommand extends Command {
  public readonly name = 'market';
  public readonly description = 'Manage reputation markets';
  public readonly subcommands = [
    new CreateMarket(),
    new BuyVotes(),
    new SellVotes(),
    new GetMarketInfo(),
  ];
}
