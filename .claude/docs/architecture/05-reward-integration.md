# Reward & Gift Card Integration Architecture

## Overview

The reward system enables children to redeem earned coins for real-world rewards, primarily digital gift cards for gaming platforms and retail stores. This system integrates with third-party gift card APIs while maintaining security, compliance, and user experience standards.

## Integration Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────┐
│                   LevelUp Family App                   │
├─────────────────────────────────────────────────────────┤
│  Reward Catalog | Redemption Flow | Approval Workflow  │
└─────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────┐
│                  Reward Orchestration                  │
├─────────────────────────────────────────────────────────┤
│   Gift Card Service | Custom Reward Service | Cache    │
└─────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼────────┐ ┌────────▼────────┐ ┌───────▼───────┐
│   Tremendous   │ │     Rybbon      │ │   Direct      │
│   Gift Cards   │ │   Gift Cards    │ │  Integrations │
│     (Primary)  │ │   (Secondary)   │ │   (Backup)    │
└────────────────┘ └─────────────────┘ └───────────────┘
```

## Gift Card Provider Integration

### Primary Provider: Tremendous API

```typescript
interface TremendousConfig {
  apiKey: string;
  apiSecret: string;
  baseURL: 'https://api.tremendous.com';
  environment: 'production' | 'testflight' | 'sandbox';
  webhookSecret: string;
}

interface TremendousGiftCard {
  id: string;
  amount: number;
  currency: 'USD' | 'CAD' | 'EUR';
  brand: TremendousBrand;
  recipientEmail: string;
  message?: string;
  deliveryMethod: 'email' | 'sms' | 'webhook';
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  createdAt: Date;
  deliveredAt?: Date;
  redemptionUrl?: string;
  giftCardCode?: string;
}

class TremendousService {
  constructor(private config: TremendousConfig) {}
  
  async getCatalog(): Promise<TremendousBrand[]> {
    const response = await this.apiCall('GET', '/rewards');
    return response.data.map(this.mapBrandFromAPI);
  }
  
  async purchaseGiftCard(request: GiftCardPurchaseRequest): Promise<TremendousGiftCard> {
    const payload = {
      reward: {
        amount: request.amount,
        currency: request.currency,
        recipient: { email: request.recipientEmail },
        product: { id: request.productId },
        delivery: { method: 'email' },
        message: request.customMessage,
      }
    };
    
    const response = await this.apiCall('POST', '/rewards', payload);
    return this.mapGiftCardFromAPI(response.data);
  }
  
  async getOrderStatus(orderId: string): Promise<OrderStatus> {
    const response = await this.apiCall('GET', `/rewards/${orderId}`);
    return this.mapOrderStatusFromAPI(response.data);
  }
  
  async handleWebhook(payload: TremendousWebhookPayload): Promise<void> {
    switch (payload.event) {
      case 'reward.delivered':
        await this.handleRewardDelivered(payload.data);
        break;
      case 'reward.failed':
        await this.handleRewardFailed(payload.data);
        break;
      case 'reward.refunded':
        await this.handleRewardRefunded(payload.data);
        break;
    }
  }
  
  private async apiCall(method: string, endpoint: string, data?: any): Promise<any> {
    const auth = Buffer.from(`${this.config.apiKey}:${this.config.apiSecret}`).toString('base64');
    
    const response = await fetch(`${this.config.baseURL}${endpoint}`, {
      method,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });
    
    if (!response.ok) {
      throw new TremendousAPIError(response.status, await response.text());
    }
    
    return response.json();
  }
}
```

### Secondary Provider: Rybbon API

```typescript
interface RybbonConfig {
  clientId: string;
  clientSecret: string;
  baseURL: 'https://app.rybbon.net/api';
  environment: 'production' | 'staging';
}

class RybbonService {
  constructor(private config: RybbonConfig) {}
  
  async getAccessToken(): Promise<string> {
    const response = await fetch(`${this.config.baseURL}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
      }),
    });
    
    const data = await response.json();
    return data.access_token;
  }
  
  async getProducts(): Promise<RybbonProduct[]> {
    const token = await this.getAccessToken();
    const response = await this.apiCall('GET', '/products', token);
    return response.data;
  }
  
  async sendGiftCard(request: GiftCardPurchaseRequest): Promise<RybbonGiftCard> {
    const token = await this.getAccessToken();
    const payload = {
      product_id: request.productId,
      amount: request.amount,
      recipient_email: request.recipientEmail,
      sender_name: 'LevelUp Family',
      message: request.customMessage,
    };
    
    const response = await this.apiCall('POST', '/gifts', token, payload);
    return this.mapGiftCardFromAPI(response.data);
  }
}
```

## Reward Catalog Management

### Dynamic Catalog System

```typescript
interface RewardCatalog {
  giftCards: GiftCardBrand[];
  customRewards: CustomReward[];
  physicalRewards: PhysicalReward[];
  experienceRewards: ExperienceReward[];
  lastUpdated: Date;
  version: string;
}

interface GiftCardBrand {
  id: string;
  name: string;
  description: string;
  category: 'gaming' | 'retail' | 'entertainment' | 'food' | 'general';
  logoUrl: string;
  provider: 'tremendous' | 'rybbon' | 'direct';
  providerProductId: string;
  
  // Availability
  isActive: boolean;
  ageRestrictions?: { min?: number; max?: number };
  regionRestrictions?: string[];
  
  // Denominations
  fixedDenominations?: number[];
  minAmount?: number;
  maxAmount?: number;
  amountStep?: number; // For custom amounts
  
  // Pricing
  coinCost: number; // Base cost in coins
  realWorldValue: number; // USD value
  markup: number; // Percentage markup for LevelUp
  
  // Metadata
  estimatedDeliveryTime: string;
  termsAndConditions: string;
  redemptionInstructions: string;
  tags: string[];
}

// Supported gift card brands
const GIFT_CARD_BRANDS: GiftCardBrand[] = [
  {
    id: 'steam',
    name: 'Steam',
    description: 'Digital games and content on Steam',
    category: 'gaming',
    provider: 'tremendous',
    fixedDenominations: [5, 10, 20, 25, 50, 100],
    coinCost: 500, // $5 = 500 coins (1:100 ratio + markup)
    realWorldValue: 5,
    markup: 0, // No markup for MVP
    ageRestrictions: { min: 8 },
  },
  
  {
    id: 'xbox',
    name: 'Xbox Live',
    description: 'Xbox games, add-ons, and subscriptions',
    category: 'gaming',
    provider: 'tremendous',
    fixedDenominations: [10, 15, 25, 50, 100],
    coinCost: 1000,
    realWorldValue: 10,
    markup: 0,
    ageRestrictions: { min: 8 },
  },
  
  {
    id: 'playstation',
    name: 'PlayStation Store',
    description: 'PlayStation games and content',
    category: 'gaming',
    provider: 'tremendous',
    fixedDenominations: [10, 20, 50, 100],
    coinCost: 1000,
    realWorldValue: 10,
    markup: 0,
    ageRestrictions: { min: 8 },
  },
  
  {
    id: 'amazon',
    name: 'Amazon',
    description: 'Millions of items on Amazon',
    category: 'retail',
    provider: 'tremendous',
    fixedDenominations: [5, 10, 15, 25, 50, 100],
    coinCost: 500,
    realWorldValue: 5,
    markup: 0,
  },
  
  {
    id: 'target',
    name: 'Target',
    description: 'Toys, games, and more at Target',
    category: 'retail',
    provider: 'rybbon',
    fixedDenominations: [5, 10, 25, 50],
    coinCost: 500,
    realWorldValue: 5,
    markup: 0,
  },
];

class RewardCatalogService {
  async getCatalog(familyId: string, userId: string): Promise<RewardCatalog> {
    const user = await getUserById(userId);
    const family = await getFamilyById(familyId);
    
    // Filter based on age, family settings, and availability
    const filteredGiftCards = GIFT_CARD_BRANDS.filter(brand => {
      if (!brand.isActive) return false;
      if (brand.ageRestrictions?.min && user.age < brand.ageRestrictions.min) return false;
      if (brand.ageRestrictions?.max && user.age > brand.ageRestrictions.max) return false;
      return true;
    });
    
    // Add custom family rewards
    const customRewards = await getCustomFamilyRewards(familyId);
    
    return {
      giftCards: filteredGiftCards,
      customRewards,
      physicalRewards: [],
      experienceRewards: [],
      lastUpdated: new Date(),
      version: '1.0',
    };
  }
  
  async updateCatalogFromProviders(): Promise<void> {
    // Sync with Tremendous
    const tremendousProducts = await tremendousService.getCatalog();
    
    // Sync with Rybbon
    const rybbonProducts = await rybbonService.getProducts();
    
    // Update database with latest offerings
    await updateGiftCardCatalog(tremendousProducts, rybbonProducts);
  }
}
```

## Redemption Flow

### Redemption Process

```typescript
interface RedemptionRequest {
  userId: string;
  familyId: string;
  rewardId: string;
  denomination: number;
  recipientEmail: string;
  customMessage?: string;
  parentApprovalRequired: boolean;
}

interface RedemptionResult {
  redemptionId: string;
  status: RedemptionStatus;
  estimatedDelivery?: Date;
  approvalRequired: boolean;
  coinBalance: number;
  transactionId: string;
}

enum RedemptionStatus {
  REQUESTED = 'requested',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  PROCESSING = 'processing',
  FULFILLED = 'fulfilled',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

class RedemptionService {
  async requestRedemption(request: RedemptionRequest): Promise<RedemptionResult> {
    // Validate request
    await this.validateRedemptionRequest(request);
    
    // Check coin balance
    const user = await getUserById(request.userId);
    const reward = await getRewardById(request.rewardId);
    const totalCost = reward.coinCost * (request.denomination / reward.realWorldValue);
    
    if (user.totalCoins < totalCost) {
      throw new InsufficientCoinsError(user.totalCoins, totalCost);
    }
    
    // Create redemption record
    const redemption = await createRedemption({
      ...request,
      coinCost: totalCost,
      status: request.parentApprovalRequired ? 
        RedemptionStatus.PENDING_APPROVAL : 
        RedemptionStatus.APPROVED,
    });
    
    // Reserve coins
    await createCoinTransaction({
      userId: request.userId,
      familyId: request.familyId,
      type: 'spent',
      amount: -totalCost,
      description: `Gift card redemption: ${reward.name}`,
      redemptionId: redemption.id,
    });
    
    // Process immediately if no approval required
    if (!request.parentApprovalRequired) {
      await this.processRedemption(redemption.id);
    } else {
      await this.sendApprovalNotification(request.familyId, redemption);
    }
    
    return {
      redemptionId: redemption.id,
      status: redemption.status,
      approvalRequired: request.parentApprovalRequired,
      coinBalance: user.totalCoins - totalCost,
      transactionId: redemption.transactionId,
    };
  }
  
  async approveRedemption(redemptionId: string, parentId: string): Promise<void> {
    const redemption = await getRedemptionById(redemptionId);
    
    // Verify parent has permission
    await this.verifyParentPermission(parentId, redemption.familyId);
    
    // Update status and process
    await updateRedemptionStatus(redemptionId, RedemptionStatus.APPROVED);
    await this.processRedemption(redemptionId);
    
    // Notify child
    await sendNotification(redemption.userId, 'redemption_approved', {
      redemptionId,
      rewardName: redemption.reward.name,
    });
  }
  
  async processRedemption(redemptionId: string): Promise<void> {
    const redemption = await getRedemptionById(redemptionId);
    
    try {
      await updateRedemptionStatus(redemptionId, RedemptionStatus.PROCESSING);
      
      // Purchase gift card from provider
      const giftCard = await this.purchaseFromProvider(redemption);
      
      // Update redemption with gift card details
      await updateRedemption(redemptionId, {
        status: RedemptionStatus.FULFILLED,
        giftCardCode: giftCard.code,
        giftCardUrl: giftCard.redemptionUrl,
        fulfilledAt: new Date(),
        providerTransactionId: giftCard.id,
      });
      
      // Send delivery notification
      await this.sendDeliveryNotification(redemption);
      
    } catch (error) {
      await this.handleRedemptionFailure(redemptionId, error);
    }
  }
  
  private async purchaseFromProvider(redemption: RedemptionRecord): Promise<GiftCard> {
    const reward = redemption.reward;
    
    switch (reward.provider) {
      case 'tremendous':
        return await tremendousService.purchaseGiftCard({
          productId: reward.providerProductId,
          amount: redemption.denomination,
          currency: 'USD',
          recipientEmail: redemption.recipientEmail,
          customMessage: redemption.customMessage,
        });
        
      case 'rybbon':
        return await rybbonService.sendGiftCard({
          productId: reward.providerProductId,
          amount: redemption.denomination,
          recipientEmail: redemption.recipientEmail,
          customMessage: redemption.customMessage,
        });
        
      default:
        throw new UnsupportedProviderError(reward.provider);
    }
  }
  
  private async handleRedemptionFailure(redemptionId: string, error: Error): Promise<void> {
    await updateRedemptionStatus(redemptionId, RedemptionStatus.FAILED);
    
    // Refund coins
    const redemption = await getRedemptionById(redemptionId);
    await createCoinTransaction({
      userId: redemption.userId,
      familyId: redemption.familyId,
      type: 'refund',
      amount: redemption.coinCost,
      description: `Refund for failed redemption: ${redemption.reward.name}`,
      redemptionId: redemptionId,
    });
    
    // Notify user and parents
    await this.sendFailureNotification(redemption, error);
    
    // Log for investigation
    await logRedemptionFailure(redemptionId, error);
  }
}
```

## Custom Family Rewards

### Parent-Created Rewards

```typescript
interface CustomReward {
  id: string;
  familyId: string;
  createdBy: string;
  name: string;
  description: string;
  type: 'privilege' | 'experience' | 'physical_item' | 'activity';
  coinCost: number;
  
  // Availability
  isActive: boolean;
  stock?: number; // Null for unlimited
  ageRestrictions?: { min?: number; max?: number };
  
  // Fulfillment
  requiresParentAction: boolean;
  fulfillmentInstructions: string;
  estimatedFulfillmentTime: string;
  
  // Metadata
  imageUrl?: string;
  tags: string[];
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

// Example custom rewards
const CUSTOM_REWARD_TEMPLATES = [
  {
    name: 'Extra Screen Time',
    description: '30 minutes of extra screen time',
    type: 'privilege',
    suggestedCoinCost: 50,
    fulfillmentInstructions: 'Grant 30 minutes of additional screen time',
  },
  
  {
    name: 'Choose Family Movie',
    description: 'Pick the movie for family movie night',
    type: 'privilege',
    suggestedCoinCost: 100,
    fulfillmentInstructions: 'Let child choose the next family movie',
  },
  
  {
    name: 'Ice Cream Trip',
    description: 'Trip to get ice cream',
    type: 'experience',
    suggestedCoinCost: 200,
    fulfillmentInstructions: 'Take child out for ice cream',
  },
  
  {
    name: 'Stay Up Late',
    description: 'Stay up 30 minutes past bedtime',
    type: 'privilege',
    suggestedCoinCost: 75,
    fulfillmentInstructions: 'Allow 30 minutes past normal bedtime',
  },
];

class CustomRewardService {
  async createCustomReward(familyId: string, parentId: string, reward: CreateCustomRewardInput): Promise<CustomReward> {
    // Validate parent permissions
    await this.validateParentPermission(parentId, familyId);
    
    const customReward: CustomReward = {
      id: generateUUID(),
      familyId,
      createdBy: parentId,
      ...reward,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await saveCustomReward(customReward);
    
    // Notify family members
    await notifyFamilyMembers(familyId, 'new_custom_reward', customReward);
    
    return customReward;
  }
  
  async redeemCustomReward(redemptionRequest: CustomRewardRedemptionRequest): Promise<CustomRewardRedemption> {
    const reward = await getCustomRewardById(redemptionRequest.rewardId);
    const user = await getUserById(redemptionRequest.userId);
    
    // Validate redemption
    if (user.totalCoins < reward.coinCost) {
      throw new InsufficientCoinsError(user.totalCoins, reward.coinCost);
    }
    
    if (reward.stock !== null && reward.stock <= 0) {
      throw new RewardOutOfStockError(reward.id);
    }
    
    // Create redemption
    const redemption = await createCustomRewardRedemption({
      ...redemptionRequest,
      status: 'pending_fulfillment',
      coinCost: reward.coinCost,
    });
    
    // Deduct coins
    await createCoinTransaction({
      userId: redemptionRequest.userId,
      familyId: redemptionRequest.familyId,
      type: 'spent',
      amount: -reward.coinCost,
      description: `Custom reward: ${reward.name}`,
      redemptionId: redemption.id,
    });
    
    // Update stock
    if (reward.stock !== null) {
      await updateCustomRewardStock(reward.id, reward.stock - 1);
    }
    
    // Notify parent for fulfillment
    await sendFulfillmentNotification(reward.createdBy, redemption);
    
    return redemption;
  }
  
  async markFulfilled(redemptionId: string, parentId: string): Promise<void> {
    const redemption = await getCustomRewardRedemptionById(redemptionId);
    
    // Verify parent permission
    await this.validateParentPermission(parentId, redemption.familyId);
    
    // Update status
    await updateCustomRewardRedemption(redemptionId, {
      status: 'fulfilled',
      fulfilledAt: new Date(),
      fulfilledBy: parentId,
    });
    
    // Notify child
    await sendNotification(redemption.userId, 'custom_reward_fulfilled', {
      redemptionId,
      rewardName: redemption.reward.name,
    });
  }
}
```

## Security & Compliance

### Financial Security

```typescript
interface SecurityMeasures {
  // PCI Compliance (even though we don't store cards)
  pciCompliance: {
    noCardDataStorage: boolean;
    encryptedCommunication: boolean;
    regularSecurityScans: boolean;
  };
  
  // Fraud Prevention
  fraudPrevention: {
    dailyRedemptionLimits: Map<string, number>; // Per user
    familyMonthlyLimits: Map<string, number>;   // Per family
    suspiciousActivityDetection: boolean;
    velocityChecking: boolean;
  };
  
  // Data Protection
  dataProtection: {
    giftCardCodeEncryption: boolean;
    auditLogging: boolean;
    accessControls: boolean;
    dataRetentionPolicies: boolean;
  };
}

class SecurityService {
  async validateRedemptionSecurity(request: RedemptionRequest): Promise<SecurityValidationResult> {
    // Check daily limits
    const dailyRedemptions = await getDailyRedemptions(request.userId);
    if (dailyRedemptions.total > DAILY_REDEMPTION_LIMIT) {
      throw new DailyLimitExceededError();
    }
    
    // Check velocity
    if (dailyRedemptions.count > VELOCITY_LIMIT) {
      throw new VelocityLimitExceededError();
    }
    
    // Check family monthly limits
    const monthlyFamily = await getMonthlyFamilyRedemptions(request.familyId);
    if (monthlyFamily.total > FAMILY_MONTHLY_LIMIT) {
      throw new FamilyLimitExceededError();
    }
    
    return { isValid: true, requiresAdditionalApproval: false };
  }
  
  async encryptGiftCardData(giftCardData: GiftCardData): Promise<EncryptedGiftCardData> {
    const key = await getEncryptionKey();
    return {
      encryptedCode: encrypt(giftCardData.code, key),
      encryptedUrl: giftCardData.url ? encrypt(giftCardData.url, key) : null,
      keyId: key.id,
    };
  }
  
  async logRedemptionEvent(event: RedemptionEvent): Promise<void> {
    await auditLog.log({
      type: 'redemption',
      action: event.action,
      userId: event.userId,
      familyId: event.familyId,
      metadata: event.metadata,
      timestamp: new Date(),
    });
  }
}
```

### Compliance Requirements

```typescript
interface ComplianceRequirements {
  // COPPA (Children's Online Privacy)
  coppa: {
    parentalConsentRequired: boolean;
    dataMinimization: boolean;
    parentalAccessRights: boolean;
    safeDeletion: boolean;
  };
  
  // Financial Regulations
  financial: {
    antimoney_laundering: boolean;
    sanctionsChecking: boolean;
    recordKeeping: boolean;
    reportingSuspiciousActivity: boolean;
  };
  
  // Data Privacy (GDPR, CCPA)
  privacy: {
    dataProcessingConsent: boolean;
    rightToErasure: boolean;
    dataPortability: boolean;
    privacyByDesign: boolean;
  };
}
```

## Monitoring & Analytics

### Business Intelligence

```typescript
interface RedemptionAnalytics {
  // Revenue metrics
  revenue: {
    totalRedemptionValue: number;
    averageRedemptionValue: number;
    conversionRate: number; // Coins earned to coins spent
    profitMargin: number;
  };
  
  // User behavior
  userBehavior: {
    preferredRewardTypes: string[];
    redemptionFrequency: number;
    saveVsSpendRatio: number;
    abandonmentRate: number;
  };
  
  // Operational metrics
  operational: {
    fulfillmentTime: number;
    failureRate: number;
    customerSatisfaction: number;
    supportTicketVolume: number;
  };
}

class RedemptionAnalyticsService {
  async generateRedemptionReport(familyId: string, period: 'week' | 'month' | 'quarter'): Promise<RedemptionReport> {
    const redemptions = await getRedemptionsByFamily(familyId, period);
    
    return {
      totalRedemptions: redemptions.length,
      totalValue: redemptions.reduce((sum, r) => sum + r.realWorldValue, 0),
      popularRewards: this.calculatePopularRewards(redemptions),
      userEngagement: this.calculateEngagement(redemptions),
      trends: this.calculateTrends(redemptions),
    };
  }
}
```

This comprehensive reward and gift card integration architecture provides a secure, scalable foundation for the MVP while maintaining the flexibility to add more providers and reward types as the platform grows.