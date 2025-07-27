# Authentication & Family Invitation System

## Authentication Architecture

### Overview

The authentication system is designed with family-centric security, COPPA compliance, and seamless user experience. It supports multiple user roles, secure invitation flows, and comprehensive session management.

### Authentication Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Authentication Layer                │
├─────────────────────────────────────────────────────────┤
│  Identity Provider (Firebase Auth / Supabase Auth)     │
│  ├─ Email/Password Authentication                       │
│  ├─ Social Login (Google, Apple)                       │
│  ├─ Multi-Factor Authentication (Parents)              │
│  └─ Session Management & Token Refresh                 │
└─────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────┐
│                   Authorization Layer                  │
├─────────────────────────────────────────────────────────┤
│  Role-Based Access Control (RBAC)                      │
│  ├─ Parent Permissions                                 │
│  ├─ Child Permissions                                  │
│  ├─ Guardian Permissions                               │
│  └─ Family-Scoped Data Access                          │
└─────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────┐
│                     Application Layer                  │
├─────────────────────────────────────────────────────────┤
│  Family Management | User Profiles | Session State     │
└─────────────────────────────────────────────────────────┘
```

## User Registration Flows

### Parent Registration

```typescript
interface ParentRegistrationFlow {
  step1: EmailPasswordRegistration;
  step2: EmailVerification;
  step3: ProfileCompletion;
  step4: FamilySetup;
  step5: MFASetup; // Optional but recommended
}

interface EmailPasswordRegistration {
  email: string;
  password: string; // Min 8 chars, 1 uppercase, 1 number, 1 special
  confirmPassword: string;
  termsAccepted: boolean;
  privacyPolicyAccepted: boolean;
  marketingOptIn?: boolean;
}

interface ProfileCompletion {
  displayName: string;
  timezone: string;
  dateOfBirth?: Date; // Optional for parents
  avatar?: string; // Upload or select from gallery
  phoneNumber?: string; // For MFA and notifications
}

interface FamilySetup {
  action: 'create' | 'join';
  // For create
  familyName?: string;
  familyDescription?: string;
  currency?: string;
  // For join
  familyCode?: string;
  invitationCode?: string;
}
```

### Child Registration (via Invitation)

```typescript
interface ChildRegistrationFlow {
  step1: InvitationValidation;
  step2: AgeVerification;
  step3: ChildProfileCreation;
  step4: ParentApproval;
  step5: WelcomeFlow;
}

interface InvitationValidation {
  invitationCode: string;
  familyInfo: {
    familyName: string;
    parentName: string;
    memberCount: number;
  };
}

interface AgeVerification {
  dateOfBirth: Date;
  isCoppaCompliant: boolean; // Auto-calculated
  parentConsentRequired: boolean;
}

interface ChildProfileCreation {
  username: string; // Unique within family
  displayName: string;
  avatar: string; // Kid-friendly avatars only
  pin?: string; // Simple PIN for quick access
  parentEmail: string; // Auto-filled from invitation
}
```

## Authentication Security

### Password Requirements

```typescript
const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  prohibitedPasswords: [
    'password', '12345678', 'qwerty',
    // Common passwords list
  ],
  personalInfoCheck: true, // No name, email, username in password
};

const validatePassword = (password: string, userInfo: UserInfo): ValidationResult => {
  const checks = [
    checkLength(password),
    checkComplexity(password),
    checkCommonPasswords(password),
    checkPersonalInfo(password, userInfo),
  ];
  
  return {
    isValid: checks.every(check => check.passed),
    failedChecks: checks.filter(check => !check.passed),
    strength: calculatePasswordStrength(password),
  };
};
```

### Multi-Factor Authentication (MFA)

```typescript
interface MFAConfiguration {
  enabled: boolean;
  methods: MFAMethod[];
  backupCodes: string[];
  gracePeriod: number; // Days before MFA is enforced
}

type MFAMethod = 
  | { type: 'sms'; phoneNumber: string }
  | { type: 'email'; email: string }
  | { type: 'authenticator'; secret: string }
  | { type: 'backup_codes'; codes: string[] };

const setupMFA = async (userId: string, method: MFAMethod): Promise<MFASetupResult> => {
  switch (method.type) {
    case 'sms':
      return await setupSMSAuth(userId, method.phoneNumber);
    case 'email':
      return await setupEmailAuth(userId, method.email);
    case 'authenticator':
      return await setupTOTP(userId);
    case 'backup_codes':
      return await generateBackupCodes(userId);
  }
};
```

### Session Management

```typescript
interface SessionConfiguration {
  accessTokenTTL: number; // 15 minutes
  refreshTokenTTL: number; // 7 days
  sessionInactivityLimit: number; // 30 minutes
  maxConcurrentSessions: number; // 3 devices
  deviceTrustPeriod: number; // 30 days
}

interface SessionState {
  userId: string;
  familyId: string;
  role: FamilyRole;
  permissions: Permission[];
  deviceId: string;
  lastActivity: Date;
  location?: GeoLocation;
  userAgent: string;
}

const sessionManager = {
  createSession: async (user: User, device: DeviceInfo): Promise<SessionTokens> => {
    const session = await createUserSession(user, device);
    const accessToken = generateJWT(session, ACCESS_TOKEN_TTL);
    const refreshToken = generateRefreshToken(session.id);
    
    await storeSession(session);
    return { accessToken, refreshToken, expiresIn: ACCESS_TOKEN_TTL };
  },
  
  refreshSession: async (refreshToken: string): Promise<SessionTokens> => {
    const session = await validateRefreshToken(refreshToken);
    if (!session || isSessionExpired(session)) {
      throw new Error('Invalid or expired refresh token');
    }
    
    const newAccessToken = generateJWT(session, ACCESS_TOKEN_TTL);
    await updateSessionActivity(session.id);
    
    return { accessToken: newAccessToken, refreshToken, expiresIn: ACCESS_TOKEN_TTL };
  },
  
  revokeSession: async (sessionId: string): Promise<void> => {
    await invalidateSession(sessionId);
    await revokeAllTokens(sessionId);
  }
};
```

## Family Invitation System

### Invitation Generation

```typescript
interface FamilyInvitation {
  id: string;
  familyId: string;
  invitedBy: string;
  invitationType: 'child' | 'parent' | 'guardian';
  invitationCode: string; // 8-character alphanumeric
  deepLinkUrl: string;
  qrCodeData: string;
  email?: string;
  phoneNumber?: string;
  maxUses: number;
  currentUses: number;
  expiresAt: Date;
  metadata: {
    customMessage?: string;
    suggestedRole?: FamilyRole;
    permissions?: Permission[];
  };
}

const generateInvitation = async (
  familyId: string,
  invitedBy: string,
  options: InvitationOptions
): Promise<FamilyInvitation> => {
  const invitation: FamilyInvitation = {
    id: generateUUID(),
    familyId,
    invitedBy,
    invitationType: options.type,
    invitationCode: generateInvitationCode(), // 8 chars: ABC12XYZ
    deepLinkUrl: generateDeepLink(options),
    qrCodeData: generateQRCode(options),
    email: options.email,
    phoneNumber: options.phoneNumber,
    maxUses: options.maxUses || 1,
    currentUses: 0,
    expiresAt: new Date(Date.now() + (options.expiryDays || 7) * 24 * 60 * 60 * 1000),
    metadata: options.metadata || {},
  };
  
  await storeInvitation(invitation);
  return invitation;
};

const generateInvitationCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789'; // No O, 0, I, l
  return Array.from({ length: 8 }, () => 
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join('');
};
```

### Deep Linking & Sharing

```typescript
interface DeepLinkConfiguration {
  baseUrl: string; // levelupfamily://
  webFallback: string; // https://app.levelupfamily.com
  customScheme: string; // levelupfamily
}

const generateDeepLink = (invitation: FamilyInvitation): string => {
  const params = new URLSearchParams({
    code: invitation.invitationCode,
    family: invitation.familyId,
    type: invitation.invitationType,
  });
  
  return `levelupfamily://invite?${params.toString()}`;
};

const generateWebFallback = (invitation: FamilyInvitation): string => {
  return `https://app.levelupfamily.com/invite/${invitation.invitationCode}`;
};

const generateShareContent = (invitation: FamilyInvitation, family: Family): ShareContent => {
  const parentName = getUserDisplayName(invitation.invitedBy);
  
  return {
    title: `Join ${family.name} on LevelUp Family!`,
    message: `${parentName} invited you to join their family on LevelUp Family. Complete tasks, earn rewards, and level up together!`,
    url: generateWebFallback(invitation),
    deepLink: generateDeepLink(invitation),
  };
};

// Native sharing integration
const shareInvitation = async (invitation: FamilyInvitation): Promise<void> => {
  const shareContent = generateShareContent(invitation);
  
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    await Share.share({
      title: shareContent.title,
      message: `${shareContent.message}\n\n${shareContent.url}`,
      url: shareContent.url,
    });
  } else {
    // Web fallback
    await navigator.share(shareContent);
  }
};
```

### Invitation Validation & Processing

```typescript
const processInvitation = async (
  invitationCode: string,
  userInfo: PartialUserInfo
): Promise<InvitationProcessResult> => {
  // Step 1: Validate invitation
  const invitation = await getInvitationByCode(invitationCode);
  if (!invitation) {
    throw new Error('Invalid invitation code');
  }
  
  if (invitation.expiresAt < new Date()) {
    throw new Error('Invitation has expired');
  }
  
  if (invitation.currentUses >= invitation.maxUses) {
    throw new Error('Invitation has reached maximum uses');
  }
  
  // Step 2: Get family information
  const family = await getFamilyById(invitation.familyId);
  if (!family || !family.is_active) {
    throw new Error('Family is not available');
  }
  
  // Step 3: Check if user already exists in family
  const existingMember = await getFamilyMember(family.id, userInfo.email);
  if (existingMember) {
    throw new Error('User is already a member of this family');
  }
  
  // Step 4: Validate COPPA compliance for children
  if (invitation.invitationType === 'child') {
    const age = calculateAge(userInfo.dateOfBirth);
    if (age < 13) {
      return {
        requiresParentConsent: true,
        parentEmail: invitation.metadata.parentEmail,
        family,
        invitation,
      };
    }
  }
  
  return {
    requiresParentConsent: false,
    family,
    invitation,
  };
};

const acceptInvitation = async (
  invitationCode: string,
  newUser: NewUserInfo
): Promise<FamilyMember> => {
  const processResult = await processInvitation(invitationCode, newUser);
  
  // Create user account
  const user = await createUser(newUser);
  
  // Add to family
  const familyMember = await addFamilyMember({
    familyId: processResult.family.id,
    userId: user.id,
    role: processResult.invitation.invitationType,
    status: processResult.requiresParentConsent ? 'pending' : 'active',
    invitedBy: processResult.invitation.invitedBy,
  });
  
  // Update invitation usage
  await incrementInvitationUsage(invitationCode);
  
  // Send notifications
  if (processResult.requiresParentConsent) {
    await sendParentApprovalNotification(processResult.invitation.invitedBy, user);
  } else {
    await sendWelcomeNotification(user, processResult.family);
    await sendNewMemberNotification(processResult.family.id, user);
  }
  
  return familyMember;
};
```

## Role-Based Access Control (RBAC)

### Permission System

```typescript
enum Permission {
  // Family management
  MANAGE_FAMILY = 'family:manage',
  INVITE_MEMBERS = 'family:invite',
  REMOVE_MEMBERS = 'family:remove',
  VIEW_FAMILY_ANALYTICS = 'family:analytics',
  
  // Task management
  CREATE_TASKS = 'tasks:create',
  EDIT_TASKS = 'tasks:edit',
  DELETE_TASKS = 'tasks:delete',
  ASSIGN_TASKS = 'tasks:assign',
  APPROVE_TASKS = 'tasks:approve',
  VIEW_ALL_TASKS = 'tasks:view_all',
  
  // Reward management
  CREATE_REWARDS = 'rewards:create',
  EDIT_REWARDS = 'rewards:edit',
  DELETE_REWARDS = 'rewards:delete',
  APPROVE_REDEMPTIONS = 'rewards:approve',
  PROCESS_PAYMENTS = 'rewards:payments',
  
  // User management
  VIEW_USER_PROFILES = 'users:view',
  EDIT_USER_PROFILES = 'users:edit',
  MANAGE_USER_PERMISSIONS = 'users:permissions',
  
  // Child-specific
  COMPLETE_TASKS = 'tasks:complete',
  VIEW_REWARDS = 'rewards:view',
  REDEEM_REWARDS = 'rewards:redeem',
  VIEW_PROFILE = 'profile:view',
  EDIT_OWN_PROFILE = 'profile:edit_own',
}

const ROLE_PERMISSIONS: Record<FamilyRole, Permission[]> = {
  parent: [
    Permission.MANAGE_FAMILY,
    Permission.INVITE_MEMBERS,
    Permission.REMOVE_MEMBERS,
    Permission.VIEW_FAMILY_ANALYTICS,
    Permission.CREATE_TASKS,
    Permission.EDIT_TASKS,
    Permission.DELETE_TASKS,
    Permission.ASSIGN_TASKS,
    Permission.APPROVE_TASKS,
    Permission.VIEW_ALL_TASKS,
    Permission.CREATE_REWARDS,
    Permission.EDIT_REWARDS,
    Permission.DELETE_REWARDS,
    Permission.APPROVE_REDEMPTIONS,
    Permission.PROCESS_PAYMENTS,
    Permission.VIEW_USER_PROFILES,
    Permission.EDIT_USER_PROFILES,
    Permission.MANAGE_USER_PERMISSIONS,
  ],
  
  child: [
    Permission.COMPLETE_TASKS,
    Permission.VIEW_REWARDS,
    Permission.REDEEM_REWARDS,
    Permission.VIEW_PROFILE,
    Permission.EDIT_OWN_PROFILE,
  ],
  
  guardian: [
    Permission.VIEW_FAMILY_ANALYTICS,
    Permission.CREATE_TASKS,
    Permission.ASSIGN_TASKS,
    Permission.APPROVE_TASKS,
    Permission.VIEW_ALL_TASKS,
    Permission.VIEW_USER_PROFILES,
  ],
};
```

### Authorization Middleware

```typescript
const createAuthMiddleware = (requiredPermission: Permission) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { user, familyMember } = req;
      
      if (!user || !familyMember) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const hasPermission = await checkPermission(
        familyMember.role,
        familyMember.permissions,
        requiredPermission
      );
      
      if (!hasPermission) {
        return res.status(403).json({ 
          error: 'Insufficient permissions',
          required: requiredPermission,
          current: familyMember.permissions,
        });
      }
      
      next();
    } catch (error) {
      return res.status(500).json({ error: 'Authorization error' });
    }
  };
};

// Usage in API routes
app.post('/api/tasks', 
  authenticateUser,
  createAuthMiddleware(Permission.CREATE_TASKS),
  createTask
);

app.post('/api/rewards/redeem/:id',
  authenticateUser,
  createAuthMiddleware(Permission.REDEEM_REWARDS),
  redeemReward
);
```

## Security Best Practices

### Data Protection

```typescript
// COPPA Compliance
const COPPACompliance = {
  minimumAge: 13,
  parentConsentRequired: true,
  dataMinimization: true,
  limitedDataCollection: true,
  parentalAccessRights: true,
  deleteRightEnforcement: true,
};

// PII Encryption
const encryptPII = (data: any): string => {
  const key = process.env.ENCRYPTION_KEY;
  return encrypt(JSON.stringify(data), key);
};

const decryptPII = (encryptedData: string): any => {
  const key = process.env.ENCRYPTION_KEY;
  return JSON.parse(decrypt(encryptedData, key));
};

// Secure storage of sensitive data
const storeSensitiveData = async (userId: string, data: SensitiveData): Promise<void> => {
  const encryptedData = encryptPII(data);
  await database.secureStore.set(`user:${userId}:sensitive`, encryptedData);
};
```

### Security Headers & Policies

```typescript
const securityConfiguration = {
  // Content Security Policy
  csp: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'", "https://apis.google.com"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:", "https:"],
    connectSrc: ["'self'", "https://api.levelupfamily.com"],
    fontSrc: ["'self'", "https://fonts.gstatic.com"],
  },
  
  // HTTPS enforcement
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  
  // Rate limiting
  rateLimiting: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
  },
};
```

This authentication and family invitation system provides a secure, user-friendly foundation that maintains COPPA compliance while enabling seamless family onboarding and management.