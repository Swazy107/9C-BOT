import { type User, type InsertUser, type Bounty, type InsertBounty, type UserPoints, type InsertUserPoints, type PointsTransaction, type InsertPointsTransaction, type AppBan, type InsertAppBan, type ApplicationLog, type InsertApplicationLog, type Appeal, type InsertAppeal, type Tryout, type InsertTryout, type TryoutAttendee, type InsertTryoutAttendee, type BotSetting, users, bounties, userPoints, pointsTransactions, appBans, applicationLogs, appeals, tryouts, tryoutAttendees, botSettings } from "@shared/schema";
import { db } from "./db";
import { eq, and, lte, sql, desc, gte, or, isNull } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Bounty operations
  createBounty(bounty: InsertBounty): Promise<Bounty>;
  getBounty(id: string): Promise<Bounty | undefined>;
  getBountyByMessageId(messageId: string): Promise<Bounty | undefined>;
  getAllBounties(): Promise<Bounty[]>;
  getActiveBounties(): Promise<Bounty[]>;
  getClaimedBounties(): Promise<Bounty[]>;
  getBountiesToDouble(currentTime: Date): Promise<Bounty[]>;
  updateBounty(id: string, updates: Partial<Bounty>): Promise<Bounty | undefined>;
  claimBounty(id: string, claimedBy: string, evidenceUrl?: string): Promise<Bounty | undefined>;
  deleteBounty(id: string): Promise<boolean>;
  
  // User points operations
  getUserPoints(discordUserId: string): Promise<UserPoints | undefined>;
  getOrCreateUserPoints(discordUserId: string, discordUsername?: string): Promise<UserPoints>;
  addPoints(discordUserId: string, amount: number, reason?: string, givenBy?: string): Promise<UserPoints>;
  removePoints(discordUserId: string, amount: number, reason?: string, givenBy?: string): Promise<UserPoints>;
  getPointsTransactions(discordUserId: string): Promise<PointsTransaction[]>;
  
  // App ban operations
  createAppBan(ban: InsertAppBan): Promise<AppBan>;
  getActiveAppBan(discordUserId: string): Promise<AppBan | undefined>;
  getAppBanHistory(discordUserId: string): Promise<AppBan[]>;
  removeAppBan(discordUserId: string, removedBy: string): Promise<AppBan | undefined>;
  getExpiredBans(): Promise<AppBan[]>;
  expireBan(banId: string): Promise<void>;
  
  // Application log operations
  createApplicationLog(log: InsertApplicationLog): Promise<ApplicationLog>;
  getApplicationLogs(discordUserId: string): Promise<ApplicationLog[]>;
  
  // Appeal operations
  createAppeal(appeal: InsertAppeal): Promise<Appeal>;
  getAppeal(appealId: string): Promise<Appeal | undefined>;
  getAppealByMessageId(messageId: string): Promise<Appeal | undefined>;
  getPendingAppeals(discordUserId: string): Promise<Appeal[]>;
  updateAppeal(appealId: string, updates: Partial<Appeal>): Promise<Appeal | undefined>;
  getNextAppealNumber(): Promise<number>;
  
  // Tryout operations
  createTryout(tryout: InsertTryout): Promise<Tryout>;
  getTryout(id: string): Promise<Tryout | undefined>;
  getTryoutByTryoutId(tryoutId: number): Promise<Tryout | undefined>;
  getTryoutByMessageId(messageId: string): Promise<Tryout | undefined>;
  getNextTryoutId(): Promise<number>;
  updateTryout(id: string, updates: Partial<Tryout>): Promise<Tryout | undefined>;
  getUpcomingTryouts(beforeTime: Date): Promise<Tryout[]>;
  getTryoutsNeedingConfirmation(thirtyMinFromNow: Date): Promise<Tryout[]>;
  getOpenTryouts(): Promise<Tryout[]>;
  
  // Tryout attendee operations
  addTryoutAttendee(attendee: InsertTryoutAttendee): Promise<TryoutAttendee>;
  getTryoutAttendee(tryoutId: string, discordUserId: string): Promise<TryoutAttendee | undefined>;
  getTryoutAttendees(tryoutId: string): Promise<TryoutAttendee[]>;
  getConfirmedTryoutAttendees(tryoutId: string): Promise<TryoutAttendee[]>;
  updateTryoutAttendee(id: string, updates: Partial<TryoutAttendee>): Promise<TryoutAttendee | undefined>;
  clearTryoutAttendees(tryoutId: string): Promise<void>;
  
  // Bot settings operations
  getBotSetting(key: string): Promise<string | undefined>;
  setBotSetting(key: string, value: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async createBounty(bounty: InsertBounty): Promise<Bounty> {
    const [newBounty] = await db.insert(bounties).values(bounty).returning();
    return newBounty;
  }

  async getBounty(id: string): Promise<Bounty | undefined> {
    const [bounty] = await db.select().from(bounties).where(eq(bounties.id, id));
    return bounty;
  }

  async getBountyByMessageId(messageId: string): Promise<Bounty | undefined> {
    const [bounty] = await db.select().from(bounties).where(eq(bounties.messageId, messageId));
    return bounty;
  }

  async getAllBounties(): Promise<Bounty[]> {
    return db.select().from(bounties).orderBy(bounties.createdAt);
  }

  async getActiveBounties(): Promise<Bounty[]> {
    return db.select().from(bounties).where(eq(bounties.isClaimed, false)).orderBy(bounties.createdAt);
  }

  async getClaimedBounties(): Promise<Bounty[]> {
    return db.select().from(bounties).where(eq(bounties.isClaimed, true)).orderBy(bounties.claimedAt);
  }

  async getBountiesToDouble(currentTime: Date): Promise<Bounty[]> {
    return db.select().from(bounties).where(
      and(
        eq(bounties.isClaimed, false),
        lte(bounties.nextDoubleAt, currentTime)
      )
    );
  }

  async updateBounty(id: string, updates: Partial<Bounty>): Promise<Bounty | undefined> {
    const [updated] = await db.update(bounties).set(updates).where(eq(bounties.id, id)).returning();
    return updated;
  }

  async claimBounty(id: string, claimedBy: string, evidenceUrl?: string): Promise<Bounty | undefined> {
    const [claimed] = await db.update(bounties).set({
      isClaimed: true,
      claimedAt: new Date(),
      claimedBy,
    }).where(eq(bounties.id, id)).returning();
    return claimed;
  }

  async deleteBounty(id: string): Promise<boolean> {
    const result = await db.delete(bounties).where(eq(bounties.id, id)).returning();
    return result.length > 0;
  }

  // User points operations
  async getUserPoints(discordUserId: string): Promise<UserPoints | undefined> {
    const [points] = await db.select().from(userPoints).where(eq(userPoints.discordUserId, discordUserId));
    return points;
  }

  async getOrCreateUserPoints(discordUserId: string, discordUsername?: string): Promise<UserPoints> {
    let existing = await this.getUserPoints(discordUserId);
    if (existing) {
      if (discordUsername && existing.discordUsername !== discordUsername) {
        const [updated] = await db.update(userPoints)
          .set({ discordUsername, updatedAt: new Date() })
          .where(eq(userPoints.discordUserId, discordUserId))
          .returning();
        return updated;
      }
      return existing;
    }
    const [created] = await db.insert(userPoints).values({
      discordUserId,
      discordUsername,
      totalPoints: 0,
    }).returning();
    return created;
  }

  async addPoints(discordUserId: string, amount: number, reason?: string, givenBy?: string): Promise<UserPoints> {
    const user = await this.getOrCreateUserPoints(discordUserId);
    const newTotal = user.totalPoints + amount;
    
    const [updated] = await db.update(userPoints)
      .set({ totalPoints: newTotal, updatedAt: new Date() })
      .where(eq(userPoints.discordUserId, discordUserId))
      .returning();
    
    await db.insert(pointsTransactions).values({
      discordUserId,
      amount,
      reason,
      givenBy,
    });
    
    return updated;
  }

  async removePoints(discordUserId: string, amount: number, reason?: string, givenBy?: string): Promise<UserPoints> {
    const user = await this.getOrCreateUserPoints(discordUserId);
    const newTotal = Math.max(0, user.totalPoints - amount);
    
    const [updated] = await db.update(userPoints)
      .set({ totalPoints: newTotal, updatedAt: new Date() })
      .where(eq(userPoints.discordUserId, discordUserId))
      .returning();
    
    await db.insert(pointsTransactions).values({
      discordUserId,
      amount: -amount,
      reason,
      givenBy,
    });
    
    return updated;
  }

  async getPointsTransactions(discordUserId: string): Promise<PointsTransaction[]> {
    return db.select().from(pointsTransactions)
      .where(eq(pointsTransactions.discordUserId, discordUserId))
      .orderBy(pointsTransactions.createdAt);
  }

  // App ban operations
  async createAppBan(ban: InsertAppBan): Promise<AppBan> {
    const [newBan] = await db.insert(appBans).values(ban).returning();
    return newBan;
  }

  async getActiveAppBan(discordUserId: string): Promise<AppBan | undefined> {
    const [ban] = await db.select().from(appBans)
      .where(and(
        eq(appBans.discordUserId, discordUserId),
        eq(appBans.isActive, true)
      ));
    return ban;
  }

  async getAppBanHistory(discordUserId: string): Promise<AppBan[]> {
    return db.select().from(appBans)
      .where(eq(appBans.discordUserId, discordUserId))
      .orderBy(desc(appBans.bannedAt));
  }

  async removeAppBan(discordUserId: string, removedBy: string): Promise<AppBan | undefined> {
    const [updated] = await db.update(appBans)
      .set({ isActive: false, removedBy, removedAt: new Date() })
      .where(and(
        eq(appBans.discordUserId, discordUserId),
        eq(appBans.isActive, true)
      ))
      .returning();
    return updated;
  }

  async getExpiredBans(): Promise<AppBan[]> {
    const now = new Date();
    return db.select().from(appBans)
      .where(and(
        eq(appBans.isActive, true),
        lte(appBans.expiresAt, now)
      ));
  }

  async expireBan(banId: string): Promise<void> {
    await db.update(appBans)
      .set({ isActive: false, removedBy: "System", removedAt: new Date() })
      .where(eq(appBans.id, banId));
  }

  // Application log operations
  async createApplicationLog(log: InsertApplicationLog): Promise<ApplicationLog> {
    const [newLog] = await db.insert(applicationLogs).values(log).returning();
    return newLog;
  }

  async getApplicationLogs(discordUserId: string): Promise<ApplicationLog[]> {
    return db.select().from(applicationLogs)
      .where(eq(applicationLogs.discordUserId, discordUserId))
      .orderBy(desc(applicationLogs.createdAt));
  }

  // Appeal operations
  async createAppeal(appeal: InsertAppeal): Promise<Appeal> {
    const [newAppeal] = await db.insert(appeals).values(appeal).returning();
    return newAppeal;
  }

  async getAppeal(appealId: string): Promise<Appeal | undefined> {
    const [appeal] = await db.select().from(appeals).where(eq(appeals.appealId, appealId));
    return appeal;
  }

  async getAppealByMessageId(messageId: string): Promise<Appeal | undefined> {
    const [appeal] = await db.select().from(appeals).where(eq(appeals.messageId, messageId));
    return appeal;
  }

  async getPendingAppeals(discordUserId: string): Promise<Appeal[]> {
    return db.select().from(appeals)
      .where(and(
        eq(appeals.discordUserId, discordUserId),
        eq(appeals.status, "pending")
      ));
  }

  async updateAppeal(appealId: string, updates: Partial<Appeal>): Promise<Appeal | undefined> {
    const [updated] = await db.update(appeals)
      .set(updates)
      .where(eq(appeals.appealId, appealId))
      .returning();
    return updated;
  }

  async getNextAppealNumber(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` }).from(appeals);
    return (result[0]?.count || 0) + 1;
  }

  // Tryout operations
  async createTryout(tryout: InsertTryout): Promise<Tryout> {
    const [newTryout] = await db.insert(tryouts).values(tryout).returning();
    return newTryout;
  }

  async getTryout(id: string): Promise<Tryout | undefined> {
    const [tryout] = await db.select().from(tryouts).where(eq(tryouts.id, id));
    return tryout;
  }

  async getTryoutByTryoutId(tryoutId: number): Promise<Tryout | undefined> {
    const [tryout] = await db.select().from(tryouts).where(eq(tryouts.tryoutId, tryoutId));
    return tryout;
  }

  async getTryoutByMessageId(messageId: string): Promise<Tryout | undefined> {
    const [tryout] = await db.select().from(tryouts).where(eq(tryouts.messageId, messageId));
    return tryout;
  }

  async getNextTryoutId(): Promise<number> {
    const result = await db.select({ maxId: sql<number>`COALESCE(MAX(tryout_id), 0)` }).from(tryouts);
    return (result[0]?.maxId || 0) + 1;
  }

  async updateTryout(id: string, updates: Partial<Tryout>): Promise<Tryout | undefined> {
    const [updated] = await db.update(tryouts).set(updates).where(eq(tryouts.id, id)).returning();
    return updated;
  }

  async getUpcomingTryouts(beforeTime: Date): Promise<Tryout[]> {
    const now = new Date();
    return db.select().from(tryouts).where(
      and(
        eq(tryouts.status, "pending"),
        lte(tryouts.scheduledAt, beforeTime),
        gte(tryouts.scheduledAt, now)
      )
    );
  }

  async getTryoutsNeedingConfirmation(thirtyMinFromNow: Date): Promise<Tryout[]> {
    const now = new Date();
    return db.select().from(tryouts).where(
      and(
        eq(tryouts.status, "open"),
        eq(tryouts.confirmationSent, false),
        lte(tryouts.scheduledAt, thirtyMinFromNow),
        gte(tryouts.scheduledAt, now)
      )
    );
  }

  async getOpenTryouts(): Promise<Tryout[]> {
    return db.select().from(tryouts).where(
      or(eq(tryouts.status, "open"), eq(tryouts.status, "confirming"))
    );
  }

  async getTryoutsStartingNow(): Promise<Tryout[]> {
    const now = new Date();
    return db.select().from(tryouts).where(
      and(
        or(eq(tryouts.status, "open"), eq(tryouts.status, "confirming")),
        isNull(tryouts.tryoutChannelId),
        lte(tryouts.scheduledAt, now)
      )
    );
  }

  // Tryout attendee operations
  async addTryoutAttendee(attendee: InsertTryoutAttendee): Promise<TryoutAttendee> {
    const [newAttendee] = await db.insert(tryoutAttendees).values(attendee).returning();
    return newAttendee;
  }

  async getTryoutAttendee(tryoutId: string, discordUserId: string): Promise<TryoutAttendee | undefined> {
    const [attendee] = await db.select().from(tryoutAttendees).where(
      and(
        eq(tryoutAttendees.tryoutId, tryoutId),
        eq(tryoutAttendees.discordUserId, discordUserId)
      )
    );
    return attendee;
  }

  async getTryoutAttendees(tryoutId: string): Promise<TryoutAttendee[]> {
    return db.select().from(tryoutAttendees)
      .where(eq(tryoutAttendees.tryoutId, tryoutId))
      .orderBy(tryoutAttendees.attendedAt);
  }

  async getConfirmedTryoutAttendees(tryoutId: string): Promise<TryoutAttendee[]> {
    return db.select().from(tryoutAttendees)
      .where(and(
        eq(tryoutAttendees.tryoutId, tryoutId),
        eq(tryoutAttendees.confirmed, true)
      ))
      .orderBy(tryoutAttendees.attendedAt);
  }

  async updateTryoutAttendee(id: string, updates: Partial<TryoutAttendee>): Promise<TryoutAttendee | undefined> {
    const [updated] = await db.update(tryoutAttendees).set(updates).where(eq(tryoutAttendees.id, id)).returning();
    return updated;
  }

  async clearTryoutAttendees(tryoutId: string): Promise<void> {
    await db.delete(tryoutAttendees).where(eq(tryoutAttendees.tryoutId, tryoutId));
  }

  // Bot settings operations
  async getBotSetting(key: string): Promise<string | undefined> {
    const [setting] = await db.select().from(botSettings).where(eq(botSettings.key, key));
    return setting?.value;
  }

  async setBotSetting(key: string, value: string): Promise<void> {
    await db.insert(botSettings)
      .values({ key, value, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: botSettings.key,
        set: { value, updatedAt: new Date() }
      });
  }
}

export const storage = new DatabaseStorage();
