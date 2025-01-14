import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers.js';
import { expect } from 'chai';
import hre from 'hardhat';
import { type ReputationMarket } from '../../typechain-types/index.js';
import { createDeployer, type EthosDeployer } from '../utils/deployEthos.js';
import { type EthosUser } from '../utils/ethosUser.js';
import { DEFAULT, MarketUser } from './utils.js';

const { ethers } = hre;

describe('ReputationMarket Base Price Tests', () => {
  let deployer: EthosDeployer;
  let userA: MarketUser;
  let ethosUserA: EthosUser;
  let reputationMarket: ReputationMarket;
  const DEFAULT_PRICE = 0.01;

  beforeEach(async () => {
    deployer = await loadFixture(createDeployer);

    if (!deployer.reputationMarket.contract) {
      throw new Error('ReputationMarket contract not found');
    }
    ethosUserA = await deployer.createUser();
    await ethosUserA.setBalance('5000000000');

    userA = new MarketUser(ethosUserA.signer);
    reputationMarket = deployer.reputationMarket.contract;
    DEFAULT.reputationMarket = reputationMarket;
    DEFAULT.profileId = ethosUserA.profileId;
  });

  describe('Market Configuration Base Price', () => {
    it('should initialize with correct default base price', async () => {
      const config = await reputationMarket.marketConfigs(0);
      expect(config.basePrice).to.equal(ethers.parseEther(DEFAULT_PRICE.toString()));
    });

    it('should allow adding market config with higher base price', async () => {
      const higherBasePrice = ethers.parseEther((DEFAULT_PRICE * 2).toString());
      const liquidity = ethers.parseEther((DEFAULT_PRICE * 4).toString());
      await reputationMarket
        .connect(deployer.ADMIN)
        .addMarketConfig(liquidity, higherBasePrice, DEFAULT.creationCost);

      const newConfigIndex = (await reputationMarket.getMarketConfigCount()) - 1n;
      const config = await reputationMarket.marketConfigs(newConfigIndex);
      expect(config.basePrice).to.equal(higherBasePrice);
    });

    it('should revert when adding config with base price below DEFAULT_PRICE', async () => {
      const minimumBasePrice = await reputationMarket.MINIMUM_BASE_PRICE();

      await expect(
        reputationMarket
          .connect(deployer.ADMIN)
          .addMarketConfig(DEFAULT.liquidity, 1000n, minimumBasePrice - 1n),
      ).to.be.revertedWithCustomError(reputationMarket, 'InvalidMarketConfigOption');
    });

    it('should allow buying votes with a non-default base price', async () => {
      const doubleBasePrice = ethers.parseEther((DEFAULT_PRICE * 2).toString());
      await reputationMarket
        .connect(deployer.ADMIN)
        .addMarketConfig(DEFAULT.liquidity, doubleBasePrice, DEFAULT.creationCost);
      const configCount = await reputationMarket.getMarketConfigCount();
      await reputationMarket
        .connect(deployer.ADMIN)
        .createMarketWithConfigAdmin(userA.signer.address, configCount - 1n, {
          value: DEFAULT.creationCost,
        });
      const trustPrice = await reputationMarket.getVotePrice(DEFAULT.profileId, true);
      expect(trustPrice).to.equal(doubleBasePrice / 2n);
      const result = await userA.buyOneVote({
        profileId: DEFAULT.profileId,
        buyAmount: DEFAULT.buyAmount * 5n,
      });
      expect(result.fundsPaid).to.greaterThan(doubleBasePrice / 2n);
      expect(result.fundsPaid).to.lessThan(doubleBasePrice);
    });
  });

  describe('Market Creation with Different Base Prices', () => {
    let users: EthosUser[];
    const prices: bigint[] = [];
    let configCount: bigint;

    beforeEach(async () => {
      prices.push(ethers.parseEther(DEFAULT_PRICE.toString()));
      prices.push(ethers.parseEther((DEFAULT_PRICE * 2).toString()));
      prices.push(ethers.parseEther((DEFAULT_PRICE * 5).toString()));
      // remove two default configs
      await reputationMarket.connect(deployer.ADMIN).removeMarketConfig(2n);
      await reputationMarket.connect(deployer.ADMIN).removeMarketConfig(1n);
      // add new configs
      await reputationMarket
        .connect(deployer.ADMIN)
        .addMarketConfig(DEFAULT.liquidity, prices[1], DEFAULT.creationCost);
      await reputationMarket
        .connect(deployer.ADMIN)
        .addMarketConfig(DEFAULT.liquidity, prices[2], DEFAULT.creationCost);
      configCount = await reputationMarket.getMarketConfigCount();
      users = await Promise.all(
        Array.from({ length: Number(configCount) }, async () => await deployer.createUser()),
      );
      // Create markets with different base prices
      await Promise.all(
        users.map(async (user, i) => {
          await reputationMarket
            .connect(deployer.ADMIN)
            .createMarketWithConfigAdmin(user.signer.address, i, {
              value: DEFAULT.creationCost * 10n,
            });
        }),
      );
    });

    it('should create markets with different base prices and verify initial vote prices', async () => {
      for (let i = 0; i < users.length; i++) {
        const trustPrice = await reputationMarket.getVotePrice(users[i].profileId, true);
        expect(trustPrice).to.equal(prices[i] / 2n);
      }
    });

    it('should show proportional price changes across different base prices', async () => {
      // Get initial prices
      const initialPrices = await Promise.all(
        users.map(async (user) => await reputationMarket.getVotePrice(user.profileId, true)),
      );

      for (let i = 0; i < users.length; i++) {
        expect(initialPrices[i]).to.equal(prices[i] / 2n);
      }

      // Buy one vote in each market
      for (const user of users) {
        const marketUser = new MarketUser(user.signer);
        await marketUser.buyOneVote({
          profileId: user.profileId,
          buyAmount: DEFAULT.buyAmount * 5n,
        });
      }
      const afterPrices = await Promise.all(
        users.map(async (user) => await reputationMarket.getVotePrice(user.profileId, true)),
      );

      // Calculate percentage changes
      const percentageChanges = initialPrices.map((initialPrice, i) => {
        const priceChange = afterPrices[i] - initialPrice;

        // Convert to percentage (multiplied by 100_000 for precision since we're working with BigInts)
        return (priceChange * 100_000n) / initialPrice;
      });

      for (let i = 1; i < percentageChanges.length; i++) {
        const difference = percentageChanges[i] - percentageChanges[0];
        // allow 5 / 100,000 = 0.005% difference to account for rounding
        expect(difference).to.be.within(
          -5n,
          5n,
          `Price change not proportional: market 0: ${percentageChanges[0]}%, market ${i}: ${percentageChanges[i]}%`,
        );
      }
    });
  });

  describe('Very high price limits', () => {
    let basePrice100x: bigint;
    beforeEach(async () => {
      basePrice100x = ethers.parseEther((DEFAULT_PRICE * 100).toString());
      await reputationMarket
        .connect(deployer.ADMIN)
        .addMarketConfig(DEFAULT.liquidity, basePrice100x, DEFAULT.creationCost);
      const configCount = await reputationMarket.getMarketConfigCount();

      await reputationMarket
        .connect(deployer.ADMIN)
        .createMarketWithConfigAdmin(userA.signer.address, configCount - 1n, {
          value: DEFAULT.creationCost,
        });
    });

    it('should respect a high base price as maximum for trust votes', async () => {
      const billionEth = ethers.parseEther('1000000000');
      const maxVotes = 133000n - 1n;
      // buy many votes to push price up
      await userA.buyVotes({ votesToBuy: maxVotes, buyAmount: billionEth });
      const currentPrice = await reputationMarket.getVotePrice(DEFAULT.profileId, true);

      expect(Number(currentPrice)).to.be.lte(Number(basePrice100x), 'Price is too high'); // less than maximum
      expect(Number(currentPrice)).to.be.gt(
        Number((basePrice100x * 99n) / 100n),
        'Price is too low',
      ); // more than 99% of maximum
    });

    it('should maintain zero as minimum price for distrust votes', async () => {
      const billionEth = ethers.parseEther('1000000000');
      const maxVotes = 133000n - 1n;
      // Buy many distrust votes to push trust price down
      await userA.buyVotes({
        votesToBuy: maxVotes,
        buyAmount: billionEth,
        isPositive: false,
      });
      const trustPrice = await reputationMarket.getVotePrice(DEFAULT.profileId, true);
      expect(Number(trustPrice)).to.be.gte(0, 'Price is too low');
      expect(Number(trustPrice)).to.be.lte(
        Number((basePrice100x * 1n) / 100n),
        'Price is too high',
      ); // less than 1% of base price
    });

    it('should sell the last distrust vote', async () => {
      const range = 100n;
      const initialContractBalance = await ethers.provider.getBalance(reputationMarket.target);
      const oneEth = ethers.parseEther('1');
      const oddBasePrice = ethers.parseEther('0.16325');

      // Create market setup
      const userC = await deployer.createUser();
      await userC.setBalance((range * oneEth).toString());
      const marketC = new MarketUser(userC.signer);

      await reputationMarket
        .connect(deployer.ADMIN)
        .addMarketConfig(DEFAULT.liquidity, oddBasePrice, 0n);

      const configCount = await reputationMarket.getMarketConfigCount();

      await reputationMarket
        .connect(deployer.ADMIN)
        .createMarketWithConfigAdmin(userC.signer.address, configCount - 1n, {
          value: 0n,
        });

      // Check initial market funds
      expect(await reputationMarket.marketFunds(userC.profileId)).to.equal(0n);

      // Buy votes and check funds increased
      await marketC.buyVotes({
        votesToBuy: range,
        buyAmount: oneEth * range,
        isPositive: false,
        profileId: userC.profileId,
      });

      const afterBuyFunds = await reputationMarket.marketFunds(userC.profileId);
      expect(afterBuyFunds).to.be.gt(0n, 'Market funds should increase after buying');

      // Sell votes in batches and track funds
      const beforeFirstSellFunds = await reputationMarket.marketFunds(userC.profileId);
      await marketC.sellVotes({ sellVotes: 9n, isPositive: false, profileId: userC.profileId });
      const afterFirstSellFunds = await reputationMarket.marketFunds(userC.profileId);
      expect(afterFirstSellFunds).to.be.lt(
        beforeFirstSellFunds,
        'Funds should decrease after first sell',
      );

      const beforeSecondSellFunds = await reputationMarket.marketFunds(userC.profileId);
      await marketC.sellVotes({ sellVotes: 11n, isPositive: false, profileId: userC.profileId });
      const afterSecondSellFunds = await reputationMarket.marketFunds(userC.profileId);
      expect(afterSecondSellFunds).to.be.lt(
        beforeSecondSellFunds,
        'Funds should decrease after second sell',
      );

      await marketC.sellVotes({ sellVotes: 80n, isPositive: false, profileId: userC.profileId });
      const afterFinalSellFunds = await reputationMarket.marketFunds(userC.profileId);
      expect(afterFinalSellFunds).to.be.lte(
        2n,
        'Market funds should be dust after selling all votes',
      );

      // Buy two distrust votes
      await marketC.buyVotes({
        votesToBuy: 2n,
        buyAmount: oneEth * 2n,
        isPositive: false,
        profileId: userC.profileId,
      });

      const afterTwoVotesBuyFunds = await reputationMarket.marketFunds(userC.profileId);
      expect(afterTwoVotesBuyFunds).to.be.gt(0n, 'Market funds should increase after buying');

      // Sell first vote
      await marketC.sellVotes({
        sellVotes: 1n,
        isPositive: false,
        profileId: userC.profileId,
      });
      const afterFirstVoteSellFunds = await reputationMarket.marketFunds(userC.profileId);
      expect(afterFirstVoteSellFunds).to.be.lt(
        afterTwoVotesBuyFunds,
        'Funds should decrease after selling first vote',
      );

      // Sell second vote
      await marketC.sellVotes({
        sellVotes: 1n,
        isPositive: false,
        profileId: userC.profileId,
      });
      const afterSecondVoteSellFunds = await reputationMarket.marketFunds(userC.profileId);
      expect(afterSecondVoteSellFunds).to.be.lte(
        2n,
        'Market funds should be dust after selling all votes',
      );

      // Verify final contract balance still matches initial
      const finalContractBalance = await ethers.provider.getBalance(reputationMarket.target);
      expect(finalContractBalance).to.be.closeTo(initialContractBalance, 2n);
    });
  });

  it('should allow maximum spread between votesToBuy and minVotesToBuy', async () => {
    const basePrice = ethers.parseEther(DEFAULT_PRICE.toString());
    const votesToBuy = 10000n;
    await ethosUserA.setBalance((votesToBuy * basePrice * 2n).toString());

    // Create market first
    await reputationMarket.connect(deployer.ADMIN).createMarketWithConfigAdmin(
      userA.signer.address,
      0n, // use default config (index 0)
      { value: DEFAULT.creationCost },
    );

    // Now buy votes to move the market until trust price is less than 0.001 eth
    await userA.buyVotes({
      votesToBuy,
      isPositive: false,
      buyAmount: votesToBuy * basePrice * 2n,
    });
    const trustPrice = await reputationMarket.getVotePrice(DEFAULT.profileId, true);
    const expectedPrice = basePrice / 10n;
    expect(trustPrice).to.be.lt(expectedPrice);

    // user wants to buy the maximum number of votes
    const maxVotesToBuy = 133000n - 1n; // this is the max safe number of votes to buy given LMSR liquidity constraints
    const minVotesToBuy = 1n;

    // Simulate the buy to get the actual cost
    const simulation = await reputationMarket.simulateBuy(
      DEFAULT.profileId,
      true, // buying trust votes
      minVotesToBuy,
    );

    // user cannot buy more than the max number of votes
    await expect(
      userA.buyVotes({
        votesToBuy: maxVotesToBuy + 1n,
        minVotesToBuy,
        buyAmount: simulation.totalCostIncludingFees, // Use simulated cost
      }),
    ).to.be.revertedWithCustomError(deployer.lmsrLibrary.contract, 'VotesExceedSafeLimit');

    // user can request the maximum number of votes, but end up buying just one
    const result = await userA.buyVotes({
      votesToBuy: maxVotesToBuy,
      minVotesToBuy,
      buyAmount: simulation.totalCostIncludingFees, // Use simulated cost
    });

    // user has one vote
    expect(result.trustVotes).to.equal(1n);
    // console.log(`User used ${result.gas} gas`);
  });
});
