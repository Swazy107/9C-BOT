var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/bot.ts
import {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  REST,
  Routes,
  EmbedBuilder,
  TextChannel,
  AttachmentBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  MessageFlags,
  ChannelType,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder
} from "discord.js";
import {
  ComponentType,
  ButtonStyle as APIButtonStyle
} from "discord-api-types/v10";
import cron from "node-cron";
import express from "express";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  appBans: () => appBans,
  appeals: () => appeals,
  applicationLogs: () => applicationLogs,
  botSettings: () => botSettings,
  bounties: () => bounties,
  insertAppBanSchema: () => insertAppBanSchema,
  insertAppealSchema: () => insertAppealSchema,
  insertApplicationLogSchema: () => insertApplicationLogSchema,
  insertBountySchema: () => insertBountySchema,
  insertPointsTransactionSchema: () => insertPointsTransactionSchema,
  insertTryoutAttendeeSchema: () => insertTryoutAttendeeSchema,
  insertTryoutSchema: () => insertTryoutSchema,
  insertUserPointsSchema: () => insertUserPointsSchema,
  insertUserSchema: () => insertUserSchema,
  pointsTransactions: () => pointsTransactions,
  tryoutAttendees: () => tryoutAttendees,
  tryouts: () => tryouts,
  userPoints: () => userPoints,
  users: () => users
});
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull()
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});
var bounties = pgTable("bounties", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  robloxUsername: text("roblox_username").notNull(),
  robloxUserId: text("roblox_user_id"),
  robloxAvatarUrl: text("roblox_avatar_url"),
  initialReward: text("initial_reward").notNull(),
  currentReward: text("current_reward").notNull(),
  doublingCount: integer("doubling_count").notNull().default(0),
  messageId: text("message_id"),
  channelId: text("channel_id").notNull(),
  guildId: text("guild_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastDoubledAt: timestamp("last_doubled_at").notNull().defaultNow(),
  nextDoubleAt: timestamp("next_double_at").notNull(),
  isClaimed: boolean("is_claimed").notNull().default(false),
  claimedAt: timestamp("claimed_at"),
  claimedBy: text("claimed_by")
});
var insertBountySchema = createInsertSchema(bounties).omit({
  id: true,
  createdAt: true
});
var userPoints = pgTable("user_points", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  discordUserId: text("discord_user_id").notNull().unique(),
  discordUsername: text("discord_username"),
  totalPoints: integer("total_points").notNull().default(0),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});
var insertUserPointsSchema = createInsertSchema(userPoints).omit({
  id: true,
  updatedAt: true
});
var pointsTransactions = pgTable("points_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  discordUserId: text("discord_user_id").notNull(),
  amount: integer("amount").notNull(),
  reason: text("reason"),
  givenBy: text("given_by"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var insertPointsTransactionSchema = createInsertSchema(pointsTransactions).omit({
  id: true,
  createdAt: true
});
var appBans = pgTable("app_bans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  discordUserId: text("discord_user_id").notNull(),
  discordUsername: text("discord_username"),
  reason: text("reason").notNull(),
  duration: text("duration").notNull(),
  // "1_week", "2_weeks", "permanent"
  bannedBy: text("banned_by").notNull(),
  bannedAt: timestamp("banned_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").notNull().default(true),
  removedBy: text("removed_by"),
  removedAt: timestamp("removed_at")
});
var insertAppBanSchema = createInsertSchema(appBans).omit({
  id: true,
  bannedAt: true,
  removedBy: true,
  removedAt: true
});
var applicationLogs = pgTable("application_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  discordUserId: text("discord_user_id").notNull(),
  discordUsername: text("discord_username"),
  testType: text("test_type").notNull(),
  // "entry_test", "final_test"
  result: text("result").notNull(),
  // "passed", "failed", "incompleted"
  loggedBy: text("logged_by").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var insertApplicationLogSchema = createInsertSchema(applicationLogs).omit({
  id: true,
  createdAt: true
});
var appeals = pgTable("appeals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  appealId: text("appeal_id").notNull().unique(),
  discordUserId: text("discord_user_id").notNull(),
  discordUsername: text("discord_username"),
  appealText: text("appeal_text").notNull(),
  status: text("status").notNull().default("pending"),
  messageId: text("message_id"),
  denialReason: text("denial_reason"),
  handledBy: text("handled_by"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  handledAt: timestamp("handled_at")
});
var insertAppealSchema = createInsertSchema(appeals).omit({
  id: true,
  createdAt: true,
  handledAt: true
});
var tryouts = pgTable("tryouts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tryoutId: integer("tryout_id").notNull().unique(),
  maxPlayers: integer("max_players").notNull(),
  currentPlayers: integer("current_players").notNull().default(0),
  maxWinners: integer("max_winners").notNull().default(3),
  serverCode: text("server_code"),
  language: text("language").notNull(),
  // "english" or "german"
  timeDate: text("time_date").notNull(),
  // Display string like "Tuesday, 23 December 2025 19:00"
  scheduledAt: timestamp("scheduled_at").notNull(),
  hostDiscordId: text("host_discord_id").notNull(),
  hostUsername: text("host_username").notNull(),
  pictureUrl: text("picture_url"),
  messageId: text("message_id"),
  channelId: text("channel_id"),
  guildId: text("guild_id"),
  roleId: text("role_id"),
  tryoutChannelId: text("tryout_channel_id"),
  status: text("status").notNull().default("pending"),
  // "pending", "confirming", "active", "completed", "cancelled"
  confirmationSent: boolean("confirmation_sent").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var insertTryoutSchema = createInsertSchema(tryouts).omit({
  id: true,
  createdAt: true
});
var tryoutAttendees = pgTable("tryout_attendees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tryoutId: varchar("tryout_id").notNull(),
  discordUserId: text("discord_user_id").notNull(),
  discordUsername: text("discord_username"),
  robloxUsername: text("roblox_username").notNull(),
  robloxUserId: text("roblox_user_id").notNull(),
  confirmed: boolean("confirmed").notNull().default(false),
  confirmationMessageId: text("confirmation_message_id"),
  attendedAt: timestamp("attended_at").notNull().defaultNow(),
  confirmedAt: timestamp("confirmed_at")
});
var insertTryoutAttendeeSchema = createInsertSchema(tryoutAttendees).omit({
  id: true,
  attendedAt: true,
  confirmedAt: true
});
var botSettings = pgTable("bot_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

// server/db.ts
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
var { Pool } = pg;
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}
var pool = new Pool({
  connectionString: process.env.DATABASE_URL
});
var db = drizzle(pool, { schema: schema_exports });

// server/storage.ts
import { eq, and, lte, sql as sql2, desc, gte, or, isNull } from "drizzle-orm";
var DatabaseStorage = class {
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async getUserByUsername(username) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  async createUser(insertUser) {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  async createBounty(bounty) {
    const [newBounty] = await db.insert(bounties).values(bounty).returning();
    return newBounty;
  }
  async getBounty(id) {
    const [bounty] = await db.select().from(bounties).where(eq(bounties.id, id));
    return bounty;
  }
  async getBountyByMessageId(messageId) {
    const [bounty] = await db.select().from(bounties).where(eq(bounties.messageId, messageId));
    return bounty;
  }
  async getAllBounties() {
    return db.select().from(bounties).orderBy(bounties.createdAt);
  }
  async getActiveBounties() {
    return db.select().from(bounties).where(eq(bounties.isClaimed, false)).orderBy(bounties.createdAt);
  }
  async getClaimedBounties() {
    return db.select().from(bounties).where(eq(bounties.isClaimed, true)).orderBy(bounties.claimedAt);
  }
  async getBountiesToDouble(currentTime) {
    return db.select().from(bounties).where(
      and(
        eq(bounties.isClaimed, false),
        lte(bounties.nextDoubleAt, currentTime)
      )
    );
  }
  async updateBounty(id, updates) {
    const [updated] = await db.update(bounties).set(updates).where(eq(bounties.id, id)).returning();
    return updated;
  }
  async claimBounty(id, claimedBy, evidenceUrl) {
    const [claimed] = await db.update(bounties).set({
      isClaimed: true,
      claimedAt: /* @__PURE__ */ new Date(),
      claimedBy
    }).where(eq(bounties.id, id)).returning();
    return claimed;
  }
  async deleteBounty(id) {
    const result = await db.delete(bounties).where(eq(bounties.id, id)).returning();
    return result.length > 0;
  }
  // User points operations
  async getUserPoints(discordUserId) {
    const [points] = await db.select().from(userPoints).where(eq(userPoints.discordUserId, discordUserId));
    return points;
  }
  async getOrCreateUserPoints(discordUserId, discordUsername) {
    let existing = await this.getUserPoints(discordUserId);
    if (existing) {
      if (discordUsername && existing.discordUsername !== discordUsername) {
        const [updated] = await db.update(userPoints).set({ discordUsername, updatedAt: /* @__PURE__ */ new Date() }).where(eq(userPoints.discordUserId, discordUserId)).returning();
        return updated;
      }
      return existing;
    }
    const [created] = await db.insert(userPoints).values({
      discordUserId,
      discordUsername,
      totalPoints: 0
    }).returning();
    return created;
  }
  async addPoints(discordUserId, amount, reason, givenBy) {
    const user = await this.getOrCreateUserPoints(discordUserId);
    const newTotal = user.totalPoints + amount;
    const [updated] = await db.update(userPoints).set({ totalPoints: newTotal, updatedAt: /* @__PURE__ */ new Date() }).where(eq(userPoints.discordUserId, discordUserId)).returning();
    await db.insert(pointsTransactions).values({
      discordUserId,
      amount,
      reason,
      givenBy
    });
    return updated;
  }
  async removePoints(discordUserId, amount, reason, givenBy) {
    const user = await this.getOrCreateUserPoints(discordUserId);
    const newTotal = Math.max(0, user.totalPoints - amount);
    const [updated] = await db.update(userPoints).set({ totalPoints: newTotal, updatedAt: /* @__PURE__ */ new Date() }).where(eq(userPoints.discordUserId, discordUserId)).returning();
    await db.insert(pointsTransactions).values({
      discordUserId,
      amount: -amount,
      reason,
      givenBy
    });
    return updated;
  }
  async getPointsTransactions(discordUserId) {
    return db.select().from(pointsTransactions).where(eq(pointsTransactions.discordUserId, discordUserId)).orderBy(pointsTransactions.createdAt);
  }
  // App ban operations
  async createAppBan(ban) {
    const [newBan] = await db.insert(appBans).values(ban).returning();
    return newBan;
  }
  async getActiveAppBan(discordUserId) {
    const [ban] = await db.select().from(appBans).where(and(
      eq(appBans.discordUserId, discordUserId),
      eq(appBans.isActive, true)
    ));
    return ban;
  }
  async getAppBanHistory(discordUserId) {
    return db.select().from(appBans).where(eq(appBans.discordUserId, discordUserId)).orderBy(desc(appBans.bannedAt));
  }
  async removeAppBan(discordUserId, removedBy) {
    const [updated] = await db.update(appBans).set({ isActive: false, removedBy, removedAt: /* @__PURE__ */ new Date() }).where(and(
      eq(appBans.discordUserId, discordUserId),
      eq(appBans.isActive, true)
    )).returning();
    return updated;
  }
  async getExpiredBans() {
    const now = /* @__PURE__ */ new Date();
    return db.select().from(appBans).where(and(
      eq(appBans.isActive, true),
      lte(appBans.expiresAt, now)
    ));
  }
  async expireBan(banId) {
    await db.update(appBans).set({ isActive: false, removedBy: "System", removedAt: /* @__PURE__ */ new Date() }).where(eq(appBans.id, banId));
  }
  // Application log operations
  async createApplicationLog(log) {
    const [newLog] = await db.insert(applicationLogs).values(log).returning();
    return newLog;
  }
  async getApplicationLogs(discordUserId) {
    return db.select().from(applicationLogs).where(eq(applicationLogs.discordUserId, discordUserId)).orderBy(desc(applicationLogs.createdAt));
  }
  // Appeal operations
  async createAppeal(appeal) {
    const [newAppeal] = await db.insert(appeals).values(appeal).returning();
    return newAppeal;
  }
  async getAppeal(appealId) {
    const [appeal] = await db.select().from(appeals).where(eq(appeals.appealId, appealId));
    return appeal;
  }
  async getAppealByMessageId(messageId) {
    const [appeal] = await db.select().from(appeals).where(eq(appeals.messageId, messageId));
    return appeal;
  }
  async getPendingAppeals(discordUserId) {
    return db.select().from(appeals).where(and(
      eq(appeals.discordUserId, discordUserId),
      eq(appeals.status, "pending")
    ));
  }
  async updateAppeal(appealId, updates) {
    const [updated] = await db.update(appeals).set(updates).where(eq(appeals.appealId, appealId)).returning();
    return updated;
  }
  async getNextAppealNumber() {
    const result = await db.select({ count: sql2`count(*)` }).from(appeals);
    return (result[0]?.count || 0) + 1;
  }
  // Tryout operations
  async createTryout(tryout) {
    const [newTryout] = await db.insert(tryouts).values(tryout).returning();
    return newTryout;
  }
  async getTryout(id) {
    const [tryout] = await db.select().from(tryouts).where(eq(tryouts.id, id));
    return tryout;
  }
  async getTryoutByTryoutId(tryoutId) {
    const [tryout] = await db.select().from(tryouts).where(eq(tryouts.tryoutId, tryoutId));
    return tryout;
  }
  async getTryoutByMessageId(messageId) {
    const [tryout] = await db.select().from(tryouts).where(eq(tryouts.messageId, messageId));
    return tryout;
  }
  async getNextTryoutId() {
    const result = await db.select({ maxId: sql2`COALESCE(MAX(tryout_id), 0)` }).from(tryouts);
    return (result[0]?.maxId || 0) + 1;
  }
  async updateTryout(id, updates) {
    const [updated] = await db.update(tryouts).set(updates).where(eq(tryouts.id, id)).returning();
    return updated;
  }
  async getUpcomingTryouts(beforeTime) {
    const now = /* @__PURE__ */ new Date();
    return db.select().from(tryouts).where(
      and(
        eq(tryouts.status, "pending"),
        lte(tryouts.scheduledAt, beforeTime),
        gte(tryouts.scheduledAt, now)
      )
    );
  }
  async getTryoutsNeedingConfirmation(thirtyMinFromNow) {
    const now = /* @__PURE__ */ new Date();
    return db.select().from(tryouts).where(
      and(
        eq(tryouts.status, "open"),
        eq(tryouts.confirmationSent, false),
        lte(tryouts.scheduledAt, thirtyMinFromNow),
        gte(tryouts.scheduledAt, now)
      )
    );
  }
  async getOpenTryouts() {
    return db.select().from(tryouts).where(
      or(eq(tryouts.status, "open"), eq(tryouts.status, "confirming"))
    );
  }
  async getTryoutsStartingNow() {
    const now = /* @__PURE__ */ new Date();
    return db.select().from(tryouts).where(
      and(
        or(eq(tryouts.status, "open"), eq(tryouts.status, "confirming")),
        isNull(tryouts.tryoutChannelId),
        lte(tryouts.scheduledAt, now)
      )
    );
  }
  // Tryout attendee operations
  async addTryoutAttendee(attendee) {
    const [newAttendee] = await db.insert(tryoutAttendees).values(attendee).returning();
    return newAttendee;
  }
  async getTryoutAttendee(tryoutId, discordUserId) {
    const [attendee] = await db.select().from(tryoutAttendees).where(
      and(
        eq(tryoutAttendees.tryoutId, tryoutId),
        eq(tryoutAttendees.discordUserId, discordUserId)
      )
    );
    return attendee;
  }
  async getTryoutAttendees(tryoutId) {
    return db.select().from(tryoutAttendees).where(eq(tryoutAttendees.tryoutId, tryoutId)).orderBy(tryoutAttendees.attendedAt);
  }
  async getConfirmedTryoutAttendees(tryoutId) {
    return db.select().from(tryoutAttendees).where(and(
      eq(tryoutAttendees.tryoutId, tryoutId),
      eq(tryoutAttendees.confirmed, true)
    )).orderBy(tryoutAttendees.attendedAt);
  }
  async updateTryoutAttendee(id, updates) {
    const [updated] = await db.update(tryoutAttendees).set(updates).where(eq(tryoutAttendees.id, id)).returning();
    return updated;
  }
  async clearTryoutAttendees(tryoutId) {
    await db.delete(tryoutAttendees).where(eq(tryoutAttendees.tryoutId, tryoutId));
  }
  // Bot settings operations
  async getBotSetting(key) {
    const [setting] = await db.select().from(botSettings).where(eq(botSettings.key, key));
    return setting?.value;
  }
  async setBotSetting(key, value) {
    await db.insert(botSettings).values({ key, value, updatedAt: /* @__PURE__ */ new Date() }).onConflictDoUpdate({
      target: botSettings.key,
      set: { value, updatedAt: /* @__PURE__ */ new Date() }
    });
  }
};
var storage = new DatabaseStorage();

// server/roblox.ts
async function getRobloxUserByUsername(username) {
  try {
    const response = await fetch("https://users.roblox.com/v1/usernames/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        usernames: [username],
        excludeBannedUsers: false
      })
    });
    if (!response.ok) {
      console.error("Failed to fetch Roblox user:", response.status);
      return null;
    }
    const result = await response.json();
    if (result.data && result.data.length > 0) {
      return result.data[0];
    }
    return null;
  } catch (error) {
    console.error("Error fetching Roblox user:", error);
    return null;
  }
}
async function getRobloxAvatarUrl(userId) {
  try {
    const response = await fetch(
      `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png&isCircular=false`
    );
    if (!response.ok) {
      console.error("Failed to fetch Roblox avatar:", response.status);
      return null;
    }
    const result = await response.json();
    if (result.data && result.data.length > 0 && result.data[0].state === "Completed") {
      return result.data[0].imageUrl;
    }
    return null;
  } catch (error) {
    console.error("Error fetching Roblox avatar:", error);
    return null;
  }
}
async function getRobloxUserWithAvatar(username) {
  const user = await getRobloxUserByUsername(username);
  if (!user) {
    return null;
  }
  const avatarUrl = await getRobloxAvatarUrl(user.id);
  return {
    user,
    avatarUrl: avatarUrl || "https://www.roblox.com/Thumbs/Avatar.ashx?x=150&y=150&format=png"
  };
}
async function checkRobloxInventoryOpen(userId) {
  try {
    const response = await fetch(
      `https://inventory.roblox.com/v1/users/${userId}/can-view-inventory`
    );
    if (!response.ok) {
      console.error("Failed to check Roblox inventory:", response.status);
      return false;
    }
    const result = await response.json();
    return result.canView === true;
  } catch (error) {
    console.error("Error checking Roblox inventory:", error);
    return false;
  }
}
async function getRobloxUserWithInventoryCheck(username) {
  const user = await getRobloxUserByUsername(username);
  if (!user) {
    return null;
  }
  const [avatarUrl, inventoryOpen] = await Promise.all([
    getRobloxAvatarUrl(user.id),
    checkRobloxInventoryOpen(user.id)
  ]);
  return {
    user,
    avatarUrl: avatarUrl || "https://www.roblox.com/Thumbs/Avatar.ashx?x=150&y=150&format=png",
    inventoryOpen
  };
}

// server/bot.ts
import path from "path";
var BOUNTY_CHANNEL_ID = "1447154326190690430";
var POINTS_LOG_CHANNEL_ID = "1447154325813071897";
var APP_BAN_ROLE_ID = "1447185942103199919";
var LOG_CHANNEL_ID = "1448591591316127755";
var APPLICATION_LOG_CHANNEL_ID = "1448715502427050074";
var APPEAL_CHANNEL_ID = "1448721859251142776";
var PANIC_ALARM_CHANNEL_ID = "1447154326190690428";
var MEDIC_ALARM_CHANNEL_ID = "1447154326190690429";
var TRYOUT_LOG_CHANNEL_ID = "1449323817066565675";
var TRYOUT_PING_ROLE_ID = "1447297135476215932";
var PUBLIC_RULES_CHANNEL_ID = "1447154325330853932";
var TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1e3;
var ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1e3;
var THIRTY_MINUTES_MS = 30 * 60 * 1e3;
var panicAlarmEnroute = /* @__PURE__ */ new Map();
var medicAlarmEnroute = /* @__PURE__ */ new Map();
var GREEN_COLOR = 65280;
var RED_COLOR = 13369344;
var RULES_COLOR = 16711680;
var POINTS_ADDED_IMAGE = path.join(process.cwd(), "attached_assets/8E4B145C-D17C-4CB6-A1ED-C7EC3910E81E_1765482052324.jpg");
var POINTS_REMOVED_IMAGE = path.join(process.cwd(), "attached_assets/6A05ABCE-624C-4B5A-A02D-915E46E2E907_1765482389947.jpg");
var RULES_IMAGE = path.join(process.cwd(), "attached_assets/DAFAB8BD-1C6A-4C79-B4D2-8BE3115B9E91_1765486225520.jpg");
var RADIO_CODES_IMAGE = path.join(process.cwd(), "attached_assets/C4497725-EDAB-4E59-BB03-3306AD16D649_1765486597752.jpg");
var APPLICATION_BANNER_IMAGE = path.join(process.cwd(), "attached_assets/application_banner.jpg");
var TRYOUT_BANNER_IMAGE = "https://cdn.discordapp.com/attachments/1447154325330853937/1449408211886149722/D882F61E-B0CE-448B-8A42-6FBF07EBFB5E.jpg";
var TRYOUT_MAP_IMAGE = "https://cdn.discordapp.com/attachments/1424294947095576697/1449411284343849204/C623D252-C0EE-418B-A9C6-1DC7D1697046.jpg";
var REQUIREMENTS_CHANNEL_ID = "1447154325330853931";
var TRYOUT_CANCELLATION_CHANNEL_ID = "1447168004642050068";
var PERSISTENT_TRYOUT_EMBED_CHANNEL_ID = "1447168004642050068";
var TRYOUT_ATTENDEES_CHANNEL_ID = "1449435863762342029";
var PERSISTENT_TRYOUT_MESSAGE_KEY = "persistent_tryout_embed_message_id";
var TEST_PAGE_1_IMAGE = path.join(process.cwd(), "attached_assets/CD7EC93E-EE6C-445D-B342-F720DE098791_1765553577595.jpg");
var TEST_PAGE_2_IMAGE = path.join(process.cwd(), "attached_assets/234FE5E0-856E-4581-8E5C-D51039F7EE7B_1765553621184.jpg");
var TEST_PAGE_3_IMAGE = path.join(process.cwd(), "attached_assets/6EFFF009-AD73-4A91-BBA0-3C594CA44951_1765553644856.jpg");
var TEST_PAGE_4_IMAGE = path.join(process.cwd(), "attached_assets/6EFFF009-AD73-4A91-BBA0-3C594CA44951-1_1765553665962.jpg");
var PUBLIC_RULES_IMAGE = path.join(process.cwd(), "attached_assets/AF28F99C-FAC4-4006-8C19-404017F9CED4_1765650878245.jpeg");
var BLACK_COLOR = 0;
var APPBAN_ROLE_IDS = ["1447154323456004112", "1447154323862585346", "1447154323456004115"];
var APPLICATION_LOG_ROLE_IDS = ["1447154323456004112", "1447154323862585346", "1447154323456004115"];
var BOUNTY_ROLE_IDS = ["1447154323456004112", "1447154323456004115"];
var POINTS_ROLE_IDS = ["1447154323456004112", "1447154323456004115"];
var PROFILE_ROLE_IDS = ["1447154323456004112", "1447154323913179174", "1447154323913179175"];
var SETUP_APPLICATION_STATUS_ROLE_IDS = ["1447154323456004112"];
var TEST_INFO_ROLE_IDS = ["1447154323456004112", "1447154323900469325"];
var PANIC_ALARM_ROLE_IDS = ["1447154323456004112"];
var PROFILE_VISIBLE_ROLE_ID = "1447154323913179175";
var client = null;
function parseReward(reward) {
  const match = reward.match(/^([\d,]+\.?\d*)\s*(.*)$/);
  if (match) {
    const value = parseFloat(match[1].replace(/,/g, ""));
    const suffix = match[2] || "CP";
    return { value, suffix };
  }
  return { value: 0, suffix: "CP" };
}
function doubleReward(reward) {
  const { value, suffix } = parseReward(reward);
  if (value > 0) {
    const doubled = value * 2;
    const formatted = doubled.toLocaleString("en-US");
    return suffix ? `${formatted} ${suffix}` : `${formatted} CP`;
  }
  return reward;
}
function hasRoleFromList(interaction, roleIds) {
  const member = interaction.member;
  if (!member) return false;
  const roles = member.roles;
  if (Array.isArray(roles)) {
    return roles.some((roleId) => roleIds.includes(roleId));
  } else {
    return roleIds.some((roleId) => roles.cache.has(roleId));
  }
}
function hasAppBanRole(interaction) {
  return hasRoleFromList(interaction, APPBAN_ROLE_IDS);
}
function hasApplicationLogRole(interaction) {
  return hasRoleFromList(interaction, APPLICATION_LOG_ROLE_IDS);
}
function hasBountyRole(interaction) {
  return hasRoleFromList(interaction, BOUNTY_ROLE_IDS);
}
function hasPointsRole(interaction) {
  return hasRoleFromList(interaction, POINTS_ROLE_IDS);
}
function hasProfileRole(interaction) {
  return hasRoleFromList(interaction, PROFILE_ROLE_IDS);
}
function hasSetupApplicationStatusRole(interaction) {
  return hasRoleFromList(interaction, SETUP_APPLICATION_STATUS_ROLE_IDS);
}
function hasTestInfoRole(interaction) {
  return hasRoleFromList(interaction, TEST_INFO_ROLE_IDS);
}
function hasPanicAlarmRole(interaction) {
  return hasRoleFromList(interaction, PANIC_ALARM_ROLE_IDS);
}
function createNoPermissionEmbed() {
  return new EmbedBuilder().setDescription("You do not have permission to use this command.");
}
function createSuccessEmbed(description) {
  return new EmbedBuilder().setDescription(description);
}
function createErrorEmbed(description) {
  return new EmbedBuilder().setDescription(description);
}
function createBountyEmbed(robloxUsername, reward, avatarUrl, nextDoubleDate) {
  const embed = new EmbedBuilder().setTitle(robloxUsername).setDescription(
    `:flag_gb: Redeem by going https://discord.com/channels/1447154323456004108/1447154326190690431 and post an image of them dead or arrested.

:flag_de: Wiederholen Sie https://discord.com/channels/1447154323456004108/1447154326190690431 und posten Sie ein Bild von ihnen tot oder verhaftet.

Rewards: **${reward}**`
  );
  if (avatarUrl) {
    embed.setThumbnail(avatarUrl);
  }
  return embed;
}
function createClaimedEmbed(robloxUsername, finalReward, avatarUrl, claimedBy, evidenceUrl) {
  const embed = new EmbedBuilder().setTitle("BOUNTY CLAIMED").setDescription(
    `~~**${robloxUsername}**~~

**Final Reward: ${finalReward}**

This bounty has been claimed by ${claimedBy}.

[Evidence](${evidenceUrl})`
  ).setTimestamp();
  if (avatarUrl) {
    embed.setThumbnail(avatarUrl);
  }
  return embed;
}
function createRewardDoubledEmbed(robloxUsername, previousReward, newReward, avatarUrl, doublingCount) {
  const embed = new EmbedBuilder().setTitle("BOUNTY REWARD DOUBLED").setDescription(
    `**${robloxUsername}**

${previousReward} -> **${newReward}**

This bounty has doubled ${doublingCount} time${doublingCount > 1 ? "s" : ""}! Claim it before it grows even larger!`
  ).setTimestamp();
  if (avatarUrl) {
    embed.setThumbnail(avatarUrl);
  }
  return embed;
}
function formatDateTime() {
  const now = /* @__PURE__ */ new Date();
  const date = now.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
  const time = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
  return `${date} at ${time}`;
}
function createPointsReceivedEmbed(userNickname, amount, givenByNickname) {
  return new EmbedBuilder().setTitle("You have received CP").setDescription(
    `**${userNickname}** :white_check_mark: + **${amount.toLocaleString()}** CP

Rewarded by ${givenByNickname}
${formatDateTime()}`
  ).setColor(GREEN_COLOR).setImage("attachment://points_added.jpg");
}
function createPointsLostEmbed(userNickname, amount, removedByNickname) {
  return new EmbedBuilder().setTitle("Points Removed").setDescription(
    `${userNickname} :no_entry: - ${amount.toLocaleString()} CP

Removed from ${removedByNickname}
${formatDateTime()}`
  ).setColor(RED_COLOR).setImage("attachment://points_removed.jpg");
}
function createBountyClaimedDMEmbed(userNickname, reward) {
  return new EmbedBuilder().setTitle("Bounty Reward Claimed").setDescription(
    `${userNickname} :white_check_mark: + ${reward}

Rewarded by Bounty
${formatDateTime()}`
  ).setColor(GREEN_COLOR).setImage("attachment://points_added.jpg");
}
function extractCallsign(nickname) {
  if (!nickname) return "N/A";
  const match = nickname.match(/^\[([A-Za-z0-9-]+)\]/);
  if (match) {
    return `[${match[1]}]`;
  }
  return "N/A";
}
function createProfileEmbed(username, displayName, userId, totalPoints, callsign) {
  return new EmbedBuilder().setTitle(displayName).setDescription(
    `**User:** ${username}
**ID:** ${userId}
**Total Conduct Points:** ${totalPoints.toLocaleString()}
**Callsign:** ${callsign}

**Note:** Every action counts, keep participating and your points will rise quickly.`
  ).setColor(RULES_COLOR).setFooter({ text: "9C System" }).setTimestamp();
}
function createRulesEmbedEnglish() {
  return new EmbedBuilder().setDescription(
    `1. **Respect all members** \u2013 Always be polite to fellow members and staff. Harassment, insults, or discrimination are not allowed.

2. **Follow orders from leaders** \u2013 Staff and unit leaders may give instructions in text or voice channels. You must follow them unless it conflicts with your principles.

3. **Use channels appropriately** \u2013 Post messages in the correct channels according to their purpose (operations, missions, general chat, announcements, etc.).

4. **Report issues properly** \u2013 If you see rule violations or conflicts, report them to a leader or staff member instead of handling it yourself.

5. **No sensitive content** \u2013 Do not post NSFW content, illegal content, or anything damaging to the unit's image.

6. **Stay active** \u2013 Members are expected to participate in events, trainings, and unit-related activities.

7. **No impersonation** \u2013 Do not pretend to be staff, leaders, or other members.

8. **Voice channels** \u2013 Avoid background noise, speak clearly, and follow instructions during operations or trainings.

10. **Respect privacy** \u2013 Never share personal information, yours or others'.

:warning: **Important rules** :warning:

**11. Confidentiality rule \u2013 If you share internal information, leaks, screenshots, or reveal private server channels to outsiders, you will be permanently banned without warning**`
  ).setColor(16711680).setImage("attachment://rules.jpg").setFooter({ text: "9C System" }).setTimestamp();
}
function createRulesEmbedGerman() {
  return new EmbedBuilder().setDescription(
    `1. **Respektieren Sie alle Mitglieder** - Seien Sie immer h\xF6flich zu Kollegen und Mitarbeitern. Bel\xE4stigung, Beleidigungen oder Diskriminierung sind nicht erlaubt.

2. **Befolgen Sie Befehle von F\xFChrungskr\xE4ften** \u2013 Mitarbeiter und Abteilungsleiter k\xF6nnen Anweisungen in Text- oder Sprachkan\xE4len geben. Sie m\xFCssen sie befolgen, es sei denn, es widerspricht Ihren Prinzipien.

3. **Kan\xE4le angemessen nutzen** - Posten Sie Nachrichten in den richtigen Kan\xE4len entsprechend ihrem Zweck (Operationen, Missionen, allgemeiner Chat, Ank\xFCndigungen usw.).

4. **Probleme ordnungsgem\xE4\xDF melden** \u2013 Wenn Sie Regelverst\xF6\xDFe oder Konflikte feststellen, melden Sie sie einem Leader oder Mitarbeiter, anstatt sie selbst zu erledigen.

5. **Keine sensiblen Inhalte** - Verposten Sie keine NSFW-Inhalte, illegale Inhalte oder irgendetwas, das dem Image des Ger\xE4ts schadet.

6. **Aktiv bleiben** \u2013 Von Mitgliedern wird erwartet, dass sie an Veranstaltungen, Schulungen und einheitenbezogenen Aktivit\xE4ten teilnehmen.

7. **Keine Nachahmung** \u2013 Geben Sie nicht vor, Mitarbeiter, F\xFChrungskr\xE4fte oder andere Mitglieder zu sein.

8. **Sprachkan\xE4le** \u2013 Vermeiden Sie Hintergrundger\xE4usche, sprechen Sie deutlich und befolgen Sie Anweisungen w\xE4hrend Operationen oder Schulungen.

10. **Respektieren Sie die Privatsph\xE4re** - Teilen Sie niemals pers\xF6nliche Informationen, Ihre oder andere.

:warning: **Wichtige Regeln** :warning:

**11. Vertraulichkeitsregel - Wenn Sie interne Informationen, Lecks, Screenshots oder private Serverkan\xE4le an Au\xDFenstehende weitergeben, werden Sie ohne Vorwarnung dauerhaft gesperrt**`
  ).setColor(16711680).setImage("attachment://rules.jpg").setFooter({ text: "9C System" }).setTimestamp();
}
function createRulesButtonEnglish() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("rules_german").setLabel("German Version").setEmoji("\u{1F1E9}\u{1F1EA}").setStyle(ButtonStyle.Secondary)
  );
}
function createRulesButtonGerman() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("rules_english").setLabel("English Version").setEmoji("\u{1F1EC}\u{1F1E7}").setStyle(ButtonStyle.Secondary)
  );
}
function createRadioCodesEmbedEnglish() {
  return new EmbedBuilder().setTitle("9C Radio-Codes").setDescription(
    `\u2022 **Code 1:** Available / On standby
\u2022 **Code 2:** Ready for deployment
\u2022 **Code 3:** En route / Heading to scene
\u2022 **Code 4:** Arrived at the scene
\u2022 **Code 5:** Busy / Engaged
\u2022 **Code 6:** Off duty / Not available
\u2022 **Code 99:** Panic alert / Emergency \u2192 All available units respond immediately with highest priority

***Others T-Codes:***

\u2022 **T-01:** No further action required
\u2022 **T-04:** Acknowledged / Message received
\u2022 **T-10:** Suspicious person or vehicle {Example: T-10, blue VW Passat at jewelry store}
\u2022 **T-20:** Location / Area check {Example: T-20, inside the bank}
\u2022 **T-35:** Request location of unit {Example: Canoo, please give your T-35}
\u2022 **T-45:** Speed check / Traffic control
\u2022 **T-60:** Prisoner transport needed {Example: T-60, required at harbor entrance}
\u2022 **T-70:** Arrest made {Example: T-70, jewelry store robber}
\u2022 **T-80:** Pursuit in progress {Example: T-80, towards police station, white Porsche}
\u2022 **T-85:** Pursuit discontinued / Suspect escaped`
  ).setColor(16711680).setImage("attachment://radiocodes.jpg").setFooter({ text: "9C System" }).setTimestamp();
}
function createRadioCodesEmbedGerman() {
  return new EmbedBuilder().setTitle("9C Radio-Codes").setDescription(
    `\u2022 **Code 1:** Verf\xFCgbar / In Bereitschaft
\u2022 **Code 2:** Bereit f\xFCr die Bereitstellung
\u2022 **Code 3:** Unterwegs / Auf dem Weg zur Szene
\u2022 **Code 4:** Am Tatort angekommen
\u2022 **Code 5:** Besch\xE4ftigt / Engagier
\u2022 **Code 6:** Nicht im Dienst / Nicht verf\xFCgbar
\u2022 **Code 99:** Panikalarm / Notfall \u2192 Alle verf\xFCgbaren Einheiten reagieren sofort mit h\xF6chster Priorit\xE4t

***Andere T-Codes:***

\u2022 **T-01:** Keine weiteren Ma\xDFnahmen erforderlich
\u2022 **T-04:** Best\xE4tigt / Nachricht erhalten
\u2022 **T-10:** Verd\xE4chtige Person oder Fahrzeug {Beispiel: T-10, blauer VW Passat im Juweliergesch\xE4ft}
\u2022 **T-20:** Standort- / Gebietspr\xFCfung {Beispiel: T-20, innerhalb der Bank}
\u2022 **T-35:** Fordern Sie den Standort der Einheit an {Beispiel: Canoo, bitte geben Sie Ihr T-35}
\u2022 **T-45:** Geschwindigkeitskontrolle
\u2022 **T-60:** Gefangenentransport erforderlich {Beispiel: T-60, erforderlich am Hafeneingang}
\u2022 **T-70:** Verhaftung {Beispiel: T-70, Juweliergesch\xE4ftsr\xE4uber}
\u2022 **T-80:** Verfolgung im Gange {Beispiel: T-80, in Richtung Polizeistation, wei\xDFer Porsche}
\u2022 **T-85:** Verfolgungsjagd eingestellt / Verd\xE4chtiger entkommen`
  ).setColor(16711680).setImage("attachment://radiocodes.jpg").setFooter({ text: "9C System" }).setTimestamp();
}
function createRadioCodesButtonEnglish() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("radiocodes_german").setLabel("German Version").setEmoji("\u{1F1E9}\u{1F1EA}").setStyle(ButtonStyle.Secondary)
  );
}
function createRadioCodesButtonGerman() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("radiocodes_english").setLabel("English Version").setEmoji("\u{1F1EC}\u{1F1E7}").setStyle(ButtonStyle.Secondary)
  );
}
function createPublicRulesEmbedEnglish() {
  return new EmbedBuilder().setDescription(
    `# PUBLIC-RULES

**Be respectful**
Treat all members with professionalism. Harassment, insults, and discrimination are not tolerated. Keep discussions civil.

**No spam or disruption**
Avoid repeated messages, unnecessary pings, loud soundboard use, or anything that disrupts conversations.

**Keep content appropriate**
No NSFW, graphic violence, hate content, or otherwise unsafe material. If you are unsure, do not post it.

**Follow Discord's ToS**
All activity must comply with Discord's Terms of Service and Community Guidelines.

**No advertising**
Do not promote other servers, social platforms, or products without staff approval.

**Use channels properly**
Keep messages relevant to the topic of each channel to maintain order and clarity.

**Protect privacy**
Do not share your own or others' personal information. Doxxing or leaking info leads to immediate action.

**No illegal or harmful behavior**
Do not discuss or encourage hacking, piracy, scams, or any unlawful activity.

**Respect staff decisions**
Moderators have final say. Arguing, avoiding punishment, or disrespecting staff can lead to further action.

**No impersonation**
Do not pretend to be staff, bots, or other users.

**Use common sense**
All ban appeals must be done by the following site.
https://appeal.gg/tqSDDWGh
Other moderation purposes cannot be appealed.`
  ).setColor(BLACK_COLOR).setImage("attachment://publicrules.jpeg").setFooter({ text: "9C System" }).setTimestamp();
}
function createPublicRulesEmbedGerman() {
  return new EmbedBuilder().setDescription(
    `# \xD6FFENTLICHE REGELN

**Sei respektvoll**
Behandle alle Mitglieder mit Professionalit\xE4t. Bel\xE4stigung, Beleidigungen und Diskriminierung werden nicht toleriert. Halte Diskussionen zivilisiert.

**Kein Spam oder St\xF6rungen**
Vermeide wiederholte Nachrichten, unn\xF6tige Pings, laute Soundboard-Nutzung oder alles, was Gespr\xE4che st\xF6rt.

**Halte Inhalte angemessen**
Kein NSFW, grafische Gewalt, Hass-Inhalte oder anderweitig unsicheres Material. Wenn du unsicher bist, poste es nicht.

**Befolge Discord's ToS**
Alle Aktivit\xE4ten m\xFCssen den Discord-Nutzungsbedingungen und Community-Richtlinien entsprechen.

**Keine Werbung**
Bewerbe keine anderen Server, sozialen Plattformen oder Produkte ohne Genehmigung des Teams.

**Nutze Kan\xE4le richtig**
Halte Nachrichten relevant zum Thema jedes Kanals, um Ordnung und Klarheit zu bewahren.

**Sch\xFCtze Privatsph\xE4re**
Teile weder deine eigenen noch die pers\xF6nlichen Informationen anderer. Doxxing oder Informationslecks f\xFChren zu sofortigen Ma\xDFnahmen.

**Kein illegales oder sch\xE4dliches Verhalten**
Diskutiere oder ermutige kein Hacking, Piraterie, Betrug oder andere rechtswidrige Aktivit\xE4ten.

**Respektiere Team-Entscheidungen**
Moderatoren haben das letzte Wort. Widerspruch, Strafvermeidung oder Respektlosigkeit gegen\xFCber dem Team kann zu weiteren Ma\xDFnahmen f\xFChren.

**Keine Nachahmung**
Gib dich nicht als Team-Mitglied, Bot oder andere Benutzer aus.

**Benutze gesunden Menschenverstand**
Alle Bann-Einspr\xFCche m\xFCssen \xFCber die folgende Seite eingereicht werden.
https://appeal.gg/tqSDDWGh
Andere Moderationszwecke k\xF6nnen nicht angefochten werden.`
  ).setColor(BLACK_COLOR).setImage("attachment://publicrules.jpeg").setFooter({ text: "9C System" }).setTimestamp();
}
function createPublicRulesButtonEnglish() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("publicrules_german").setLabel("German Version").setEmoji("\u{1F1E9}\u{1F1EA}").setStyle(ButtonStyle.Secondary)
  );
}
function createPublicRulesButtonGerman() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("publicrules_english").setLabel("English Version").setEmoji("\u{1F1EC}\u{1F1E7}").setStyle(ButtonStyle.Secondary)
  );
}
async function registerCommands(clientId, token) {
  const commands = [
    new SlashCommandBuilder().setName("bounty-add").setDescription("Add a new bounty").addStringOption(
      (option) => option.setName("roblox-username").setDescription("The Roblox username of the target").setRequired(true)
    ).addStringOption(
      (option) => option.setName("reward").setDescription("The reward amount in CP (e.g., 1000 CP)").setRequired(true)
    ),
    new SlashCommandBuilder().setName("bounty-claim").setDescription("Claim a bounty").addStringOption(
      (option) => option.setName("bounty").setDescription("The Roblox username of the bounty target").setRequired(true)
    ).addAttachmentOption(
      (option) => option.setName("evidence").setDescription("Evidence image for the bounty claim").setRequired(true)
    ),
    new SlashCommandBuilder().setName("bounty-list").setDescription("List all active bounties"),
    new SlashCommandBuilder().setName("bounty-remove").setDescription("Remove a bounty").addStringOption(
      (option) => option.setName("roblox-username").setDescription("The Roblox username of the bounty to remove").setRequired(true)
    ),
    new SlashCommandBuilder().setName("points").setDescription("Manage user points (CP)").addSubcommand(
      (subcommand) => subcommand.setName("add").setDescription("Add CP to a member").addUserOption(
        (option) => option.setName("user").setDescription("The user to give points to").setRequired(true)
      ).addIntegerOption(
        (option) => option.setName("points").setDescription("The amount of CP to give").setRequired(true).setMinValue(1)
      ).addStringOption(
        (option) => option.setName("reason").setDescription("The reason for giving points").setRequired(true)
      )
    ).addSubcommand(
      (subcommand) => subcommand.setName("bulk-add").setDescription("Add CP to multiple members").addStringOption(
        (option) => option.setName("members").setDescription("Mention the users (e.g., @user1 @user2)").setRequired(true)
      ).addIntegerOption(
        (option) => option.setName("points").setDescription("The amount of CP to give each member").setRequired(true).setMinValue(1)
      ).addStringOption(
        (option) => option.setName("reason").setDescription("The reason for giving points").setRequired(true)
      )
    ).addSubcommand(
      (subcommand) => subcommand.setName("bulk-remove").setDescription("Remove CP from multiple members").addStringOption(
        (option) => option.setName("members").setDescription("Mention the users (e.g., @user1 @user2)").setRequired(true)
      ).addIntegerOption(
        (option) => option.setName("points").setDescription("The amount of CP to remove from each member").setRequired(true).setMinValue(1)
      ).addStringOption(
        (option) => option.setName("reason").setDescription("The reason for removing points").setRequired(true)
      )
    ),
    new SlashCommandBuilder().setName("profile").setDescription("View a 9C member's profile").addUserOption(
      (option) => option.setName("user").setDescription("The member to view").setRequired(true)
    ),
    new SlashCommandBuilder().setName("appban").setDescription("Apply an application ban to a user").addUserOption(
      (option) => option.setName("user").setDescription("The user to ban").setRequired(true)
    ).addStringOption(
      (option) => option.setName("reason").setDescription("The reason for the ban").setRequired(true)
    ).addStringOption(
      (option) => option.setName("duration").setDescription("The duration of the ban").setRequired(true).addChoices(
        { name: "1 Week", value: "1_week" },
        { name: "2 Weeks", value: "2_weeks" },
        { name: "Permanent", value: "permanent" }
      )
    ),
    new SlashCommandBuilder().setName("appban-remove").setDescription("Remove an application ban from a user").addUserOption(
      (option) => option.setName("user").setDescription("The user to unban").setRequired(true)
    ),
    new SlashCommandBuilder().setName("appban-history").setDescription("View a user's application ban history").addUserOption(
      (option) => option.setName("user").setDescription("The user to view history for").setRequired(true)
    ),
    new SlashCommandBuilder().setName("application-log").setDescription("Log application test results").addUserOption(
      (option) => option.setName("user").setDescription("The user being tested").setRequired(true)
    ).addStringOption(
      (option) => option.setName("test-type").setDescription("The type of test").setRequired(true).addChoices(
        { name: "Entry Test", value: "entry_test" },
        { name: "Final Test", value: "final_test" }
      )
    ).addStringOption(
      (option) => option.setName("result").setDescription("The test result").setRequired(true).addChoices(
        { name: "Passed", value: "passed" },
        { name: "Failed", value: "failed" },
        { name: "Incompleted", value: "incompleted" }
      )
    ).addStringOption(
      (option) => option.setName("notes").setDescription("Additional notes (optional)").setRequired(false)
    ),
    new SlashCommandBuilder().setName("test").setDescription("Test information commands").addSubcommand(
      (subcommand) => subcommand.setName("info").setDescription("Shows information about a selected test").addStringOption(
        (option) => option.setName("type").setDescription("The type of test").setRequired(true).addChoices(
          { name: "Entry Test", value: "entry_test" },
          { name: "Final Test", value: "final_test" }
        )
      ).addStringOption(
        (option) => option.setName("language").setDescription("The language for the information").setRequired(true).addChoices(
          { name: "English", value: "english" },
          { name: "German", value: "german" }
        )
      )
    ),
    new SlashCommandBuilder().setName("setup-application-status").setDescription("Set the application status (open/closed)").addStringOption(
      (option) => option.setName("status").setDescription("The application status").setRequired(true).addChoices(
        { name: "Open", value: "open" },
        { name: "Closed", value: "closed" }
      )
    ),
    new SlashCommandBuilder().setName("panic").setDescription("Panic alarm system commands").addSubcommand(
      (subcommand) => subcommand.setName("alarm").setDescription("Set up the panic alarm button in the designated channel")
    ),
    new SlashCommandBuilder().setName("medic").setDescription("Medic alarm system commands").addSubcommand(
      (subcommand) => subcommand.setName("alarm").setDescription("Set up the medic alarm button in the designated channel")
    ),
    new SlashCommandBuilder().setName("tryout").setDescription("Create a new tryout session").addIntegerOption(
      (option) => option.setName("max_players").setDescription("Maximum number of players").setRequired(true).addChoices(
        { name: "20 Players", value: 20 },
        { name: "25 Players", value: 25 },
        { name: "30 Players", value: 30 }
      )
    ).addStringOption(
      (option) => option.setName("time_date").setDescription("Date and time (e.g., Tuesday, 23 December 2025 19:00)").setRequired(true)
    ).addStringOption(
      (option) => option.setName("language").setDescription("Language for the tryout").setRequired(true).addChoices(
        { name: "English", value: "english" },
        { name: "German", value: "german" }
      )
    ).addStringOption(
      (option) => option.setName("server_code").setDescription("The server code for attendees to join").setRequired(true)
    ).addIntegerOption(
      (option) => option.setName("max_winners").setDescription("Maximum number of players that can win").setRequired(true).setMinValue(1).setMaxValue(30)
    ).addStringOption(
      (option) => option.setName("picture_url").setDescription("URL of the tryout banner image").setRequired(false)
    ),
    new SlashCommandBuilder().setName("tryout-cancel").setDescription("Cancel an existing tryout").addIntegerOption(
      (option) => option.setName("tryout_id").setDescription("The Tryout ID to cancel").setRequired(true).setAutocomplete(true)
    ).addStringOption(
      (option) => option.setName("reason").setDescription("Reason for cancellation").setRequired(true)
    ),
    new SlashCommandBuilder().setName("setup-public-rules").setDescription("Send the public rules embed to the designated channel")
  ].map((command) => command.toJSON());
  const rest = new REST({ version: "10" }).setToken(token);
  try {
    console.log("Started refreshing application (/) commands.");
    await rest.put(Routes.applicationCommands(clientId), { body: commands });
    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error("Error registering commands:", error);
  }
}
async function handleBountyAdd(interaction) {
  if (!hasBountyRole(interaction)) {
    await interaction.reply({ embeds: [createNoPermissionEmbed()], ephemeral: true });
    return;
  }
  const robloxUsername = interaction.options.getString("roblox-username", true);
  const reward = interaction.options.getString("reward", true);
  await interaction.deferReply({ ephemeral: true });
  const robloxData = await getRobloxUserWithAvatar(robloxUsername);
  if (!robloxData) {
    await interaction.editReply({
      embeds: [createErrorEmbed(`Could not find Roblox user "${robloxUsername}". Please check the username and try again.`)]
    });
    return;
  }
  const nextDoubleAt = new Date(Date.now() + TWO_WEEKS_MS);
  const rewardWithCP = reward.toLowerCase().includes("cp") ? reward : `${reward} CP`;
  const embed = createBountyEmbed(
    robloxData.user.name,
    rewardWithCP,
    robloxData.avatarUrl,
    nextDoubleAt
  );
  const channel = await client?.channels.fetch(BOUNTY_CHANNEL_ID);
  if (!channel || !(channel instanceof TextChannel)) {
    await interaction.editReply({
      embeds: [createErrorEmbed("Could not find the bounty channel. Please check the channel ID.")]
    });
    return;
  }
  const message = await channel.send({ embeds: [embed] });
  await storage.createBounty({
    robloxUsername: robloxData.user.name,
    robloxUserId: robloxData.user.id.toString(),
    robloxAvatarUrl: robloxData.avatarUrl,
    initialReward: rewardWithCP,
    currentReward: rewardWithCP,
    doublingCount: 0,
    messageId: message.id,
    channelId: BOUNTY_CHANNEL_ID,
    guildId: interaction.guildId || void 0,
    lastDoubledAt: /* @__PURE__ */ new Date(),
    nextDoubleAt,
    isClaimed: false
  });
  await interaction.editReply({
    embeds: [createSuccessEmbed(`Bounty created successfully for **${robloxData.user.name}** with reward **${rewardWithCP}**!
The reward will double every 2 weeks.`)]
  });
}
async function handleBountyClaim(interaction) {
  if (!hasBountyRole(interaction)) {
    await interaction.reply({ embeds: [createNoPermissionEmbed()], ephemeral: true });
    return;
  }
  const bountyName = interaction.options.getString("bounty", true);
  const evidence = interaction.options.getAttachment("evidence", true);
  await interaction.deferReply({ ephemeral: true });
  const activeBounties = await storage.getActiveBounties();
  const bounty = activeBounties.find(
    (b) => b.robloxUsername.toLowerCase() === bountyName.toLowerCase()
  );
  if (!bounty) {
    await interaction.editReply({
      embeds: [createErrorEmbed(`No active bounty found for "${bountyName}".`)]
    });
    return;
  }
  const claimerId = interaction.user.id;
  const claimerUsername = interaction.user.username;
  const rewardValue = parseReward(bounty.currentReward).value;
  const updatedPoints = await storage.addPoints(claimerId, rewardValue, `Bounty claim: ${bounty.robloxUsername}`, "System");
  await storage.claimBounty(bounty.id, `<@${claimerId}>`, evidence.url);
  if (bounty.messageId) {
    try {
      const channel = await client?.channels.fetch(bounty.channelId);
      if (channel instanceof TextChannel) {
        const message = await channel.messages.fetch(bounty.messageId);
        const claimedEmbed = createClaimedEmbed(
          bounty.robloxUsername,
          bounty.currentReward,
          bounty.robloxAvatarUrl,
          `<@${claimerId}>`,
          evidence.url
        );
        await message.edit({ embeds: [claimedEmbed] });
      }
    } catch (error) {
      console.error("Error updating bounty message:", error);
    }
  }
  const claimerMember = interaction.guild?.members.cache.get(claimerId);
  const claimerNickname = claimerMember?.nickname || interaction.user.displayName || interaction.user.username;
  const dmEmbed = createBountyClaimedDMEmbed(claimerNickname, bounty.currentReward);
  const attachment = new AttachmentBuilder(POINTS_ADDED_IMAGE, { name: "points_added.jpg" });
  try {
    const user = await client?.users.fetch(claimerId);
    if (user) {
      await user.send({ embeds: [dmEmbed], files: [attachment] });
    }
  } catch (error) {
    console.error("Error sending DM to claimer:", error);
  }
  try {
    const logChannel = await client?.channels.fetch(POINTS_LOG_CHANNEL_ID);
    if (logChannel instanceof TextChannel) {
      const logAttachment = new AttachmentBuilder(POINTS_ADDED_IMAGE, { name: "points_added.jpg" });
      await logChannel.send({ embeds: [dmEmbed], files: [logAttachment] });
    }
  } catch (error) {
    console.error("Error sending to log channel:", error);
  }
  await interaction.editReply({
    embeds: [createSuccessEmbed(`Bounty for **${bounty.robloxUsername}** has been claimed!

**Reward:** ${bounty.currentReward}
**Current CP:** ${updatedPoints.totalPoints.toLocaleString()}`)]
  });
}
async function handleBountyList(interaction) {
  if (!hasBountyRole(interaction)) {
    await interaction.reply({ embeds: [createNoPermissionEmbed()], ephemeral: true });
    return;
  }
  await interaction.deferReply({ ephemeral: true });
  const activeBounties = await storage.getActiveBounties();
  if (activeBounties.length === 0) {
    await interaction.editReply({
      embeds: [createSuccessEmbed("No active bounties at this time.")]
    });
    return;
  }
  const description = activeBounties.map((bounty, index) => {
    const nextDouble = new Date(bounty.nextDoubleAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric"
    });
    return `**${index + 1}. ${bounty.robloxUsername}**
Reward: ${bounty.currentReward}
Next Double: ${nextDouble}`;
  }).join("\n\n");
  const embed = new EmbedBuilder().setTitle("Active Bounties").setDescription(description).setTimestamp();
  await interaction.editReply({ embeds: [embed] });
}
async function handleBountyRemove(interaction) {
  if (!hasBountyRole(interaction)) {
    await interaction.reply({ embeds: [createNoPermissionEmbed()], ephemeral: true });
    return;
  }
  const robloxUsername = interaction.options.getString("roblox-username", true);
  await interaction.deferReply({ ephemeral: true });
  const activeBounties = await storage.getActiveBounties();
  const bounty = activeBounties.find(
    (b) => b.robloxUsername.toLowerCase() === robloxUsername.toLowerCase()
  );
  if (!bounty) {
    await interaction.editReply({
      embeds: [createErrorEmbed(`No active bounty found for "${robloxUsername}".`)]
    });
    return;
  }
  if (bounty.messageId) {
    try {
      const channel = await client?.channels.fetch(bounty.channelId);
      if (channel instanceof TextChannel) {
        const message = await channel.messages.fetch(bounty.messageId);
        await message.delete();
      }
    } catch (error) {
      console.error("Error deleting bounty message:", error);
    }
  }
  await storage.deleteBounty(bounty.id);
  await interaction.editReply({
    embeds: [createSuccessEmbed(`Bounty for **${bounty.robloxUsername}** has been removed.`)]
  });
}
async function handlePointsAdd(interaction) {
  if (!hasPointsRole(interaction)) {
    await interaction.reply({ embeds: [createNoPermissionEmbed()], ephemeral: true });
    return;
  }
  const user = interaction.options.getUser("user", true);
  const points = interaction.options.getInteger("points", true);
  const reason = interaction.options.getString("reason", true);
  await interaction.deferReply({ ephemeral: true });
  const updatedPoints = await storage.addPoints(user.id, points, reason, interaction.user.username);
  const member = interaction.guild?.members.cache.get(user.id);
  const userNickname = member?.nickname || user.displayName || user.username;
  const adminMember = interaction.guild?.members.cache.get(interaction.user.id);
  const adminNickname = adminMember?.nickname || interaction.user.displayName || interaction.user.username;
  const dmEmbed = createPointsReceivedEmbed(userNickname, points, adminNickname);
  const attachment = new AttachmentBuilder(POINTS_ADDED_IMAGE, { name: "points_added.jpg" });
  try {
    await user.send({ embeds: [dmEmbed], files: [attachment] });
  } catch (error) {
    console.error("Error sending DM:", error);
  }
  try {
    const logChannel = await client?.channels.fetch(POINTS_LOG_CHANNEL_ID);
    if (logChannel instanceof TextChannel) {
      const logAttachment = new AttachmentBuilder(POINTS_ADDED_IMAGE, { name: "points_added.jpg" });
      await logChannel.send({ embeds: [dmEmbed], files: [logAttachment] });
    }
  } catch (error) {
    console.error("Error sending to log channel:", error);
  }
  await interaction.editReply({
    embeds: [createSuccessEmbed(`Added **${points.toLocaleString()} CP** to ${user}.

**Reason:** ${reason}
**Their Current CP:** ${updatedPoints.totalPoints.toLocaleString()}`)]
  });
}
async function handlePointsBulkAdd(interaction) {
  if (!hasPointsRole(interaction)) {
    await interaction.reply({ embeds: [createNoPermissionEmbed()], ephemeral: true });
    return;
  }
  const membersString = interaction.options.getString("members", true);
  const points = interaction.options.getInteger("points", true);
  const reason = interaction.options.getString("reason", true);
  await interaction.deferReply({ ephemeral: true });
  const userIdMatches = membersString.match(/<@!?(\d+)>/g) || [];
  const userIds = userIdMatches.map((match) => match.replace(/<@!?/, "").replace(">", ""));
  if (userIds.length === 0) {
    await interaction.editReply({
      embeds: [createErrorEmbed("No valid user mentions found. Please mention users like @user1 @user2.")]
    });
    return;
  }
  const adminMember = interaction.guild?.members.cache.get(interaction.user.id);
  const adminNickname = adminMember?.nickname || interaction.user.displayName || interaction.user.username;
  const results = [];
  for (const userId of userIds) {
    try {
      const user = await client?.users.fetch(userId);
      if (user) {
        const updatedPoints = await storage.addPoints(userId, points, reason, interaction.user.username);
        const member = interaction.guild?.members.cache.get(userId);
        const userNickname = member?.nickname || user.displayName || user.username;
        const dmEmbed = createPointsReceivedEmbed(userNickname, points, adminNickname);
        const attachment = new AttachmentBuilder(POINTS_ADDED_IMAGE, { name: "points_added.jpg" });
        try {
          await user.send({ embeds: [dmEmbed], files: [attachment] });
        } catch (error) {
          console.error(`Error sending DM to ${user.username}:`, error);
        }
        try {
          const logChannel = await client?.channels.fetch(POINTS_LOG_CHANNEL_ID);
          if (logChannel instanceof TextChannel) {
            const logAttachment = new AttachmentBuilder(POINTS_ADDED_IMAGE, { name: "points_added.jpg" });
            await logChannel.send({ embeds: [dmEmbed], files: [logAttachment] });
          }
        } catch (error) {
          console.error("Error sending to log channel:", error);
        }
        results.push(`${user}: ${updatedPoints.totalPoints.toLocaleString()} CP`);
      }
    } catch (error) {
      console.error(`Error adding points to ${userId}:`, error);
      results.push(`<@${userId}>: Failed`);
    }
  }
  await interaction.editReply({
    embeds: [createSuccessEmbed(`Added **${points.toLocaleString()} CP** to ${userIds.length} member(s).

**Reason:** ${reason}

**Results:**
${results.join("\n")}`)]
  });
}
async function handlePointsBulkRemove(interaction) {
  if (!hasPointsRole(interaction)) {
    await interaction.reply({ embeds: [createNoPermissionEmbed()], ephemeral: true });
    return;
  }
  const membersString = interaction.options.getString("members", true);
  const points = interaction.options.getInteger("points", true);
  const reason = interaction.options.getString("reason", true);
  await interaction.deferReply({ ephemeral: true });
  const userIdMatches = membersString.match(/<@!?(\d+)>/g) || [];
  const userIds = userIdMatches.map((match) => match.replace(/<@!?/, "").replace(">", ""));
  if (userIds.length === 0) {
    await interaction.editReply({
      embeds: [createErrorEmbed("No valid user mentions found. Please mention users like @user1 @user2.")]
    });
    return;
  }
  const adminMember = interaction.guild?.members.cache.get(interaction.user.id);
  const adminNickname = adminMember?.nickname || interaction.user.displayName || interaction.user.username;
  const results = [];
  for (const userId of userIds) {
    try {
      const user = await client?.users.fetch(userId);
      if (user) {
        const updatedPoints = await storage.removePoints(userId, points, reason, interaction.user.username);
        const member = interaction.guild?.members.cache.get(userId);
        const userNickname = member?.nickname || user.displayName || user.username;
        const dmEmbed = createPointsLostEmbed(userNickname, points, adminNickname);
        const attachment = new AttachmentBuilder(POINTS_REMOVED_IMAGE, { name: "points_removed.jpg" });
        try {
          await user.send({ embeds: [dmEmbed], files: [attachment] });
        } catch (error) {
          console.error(`Error sending DM to ${user.username}:`, error);
        }
        try {
          const logChannel = await client?.channels.fetch(POINTS_LOG_CHANNEL_ID);
          if (logChannel instanceof TextChannel) {
            const logAttachment = new AttachmentBuilder(POINTS_REMOVED_IMAGE, { name: "points_removed.jpg" });
            await logChannel.send({ embeds: [dmEmbed], files: [logAttachment] });
          }
        } catch (error) {
          console.error("Error sending to log channel:", error);
        }
        results.push(`${user}: ${updatedPoints.totalPoints.toLocaleString()} CP`);
      }
    } catch (error) {
      console.error(`Error removing points from ${userId}:`, error);
      results.push(`<@${userId}>: Failed`);
    }
  }
  await interaction.editReply({
    embeds: [createSuccessEmbed(`Removed **${points.toLocaleString()} CP** from ${userIds.length} member(s).

**Reason:** ${reason}

**Results:**
${results.join("\n")}`)]
  });
}
async function handleProfile(interaction) {
  if (!hasProfileRole(interaction)) {
    await interaction.reply({ embeds: [createNoPermissionEmbed()], ephemeral: true });
    return;
  }
  const targetUser = interaction.options.getUser("user", true);
  await interaction.deferReply({ ephemeral: true });
  try {
    const guild = interaction.guild;
    if (!guild) {
      await interaction.editReply({
        embeds: [createErrorEmbed("This command can only be used in a server.")]
      });
      return;
    }
    const member = await guild.members.fetch(targetUser.id);
    if (!member.roles.cache.has(PROFILE_VISIBLE_ROLE_ID)) {
      await interaction.editReply({
        embeds: [createErrorEmbed("This user is not a 9C member.")]
      });
      return;
    }
    const userPoints2 = await storage.getUserPoints(targetUser.id);
    const totalPoints = userPoints2?.totalPoints || 0;
    const nickname = member.nickname || member.user.displayName;
    const callsign = extractCallsign(member.nickname);
    const embed = createProfileEmbed(
      targetUser.tag,
      nickname,
      targetUser.id,
      totalPoints,
      callsign
    );
    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error("Error fetching profile:", error);
    await interaction.editReply({
      embeds: [createErrorEmbed("Failed to fetch user profile.")]
    });
  }
}
async function handleAppBan(interaction) {
  if (!hasAppBanRole(interaction)) {
    await interaction.reply({ embeds: [createNoPermissionEmbed()], ephemeral: true });
    return;
  }
  const targetUser = interaction.options.getUser("user", true);
  const reason = interaction.options.getString("reason", true);
  const duration = interaction.options.getString("duration", true);
  await interaction.deferReply({ ephemeral: true });
  try {
    const guild = interaction.guild;
    if (!guild) {
      await interaction.editReply({
        embeds: [createErrorEmbed("This command can only be used in a server.")]
      });
      return;
    }
    const member = await guild.members.fetch(targetUser.id);
    const existingBan = await storage.getActiveAppBan(targetUser.id);
    if (existingBan) {
      await interaction.editReply({
        embeds: [createErrorEmbed("This user already has an active application ban.")]
      });
      return;
    }
    let expiresAt;
    let durationText;
    if (duration === "1_week") {
      expiresAt = new Date(Date.now() + ONE_WEEK_MS);
      durationText = "1 Week";
    } else if (duration === "2_weeks") {
      expiresAt = new Date(Date.now() + TWO_WEEKS_MS);
      durationText = "2 Weeks";
    } else {
      durationText = "Permanent";
    }
    try {
      const role = interaction.guild?.roles.cache.get(APP_BAN_ROLE_ID);
      if (!role) {
        await interaction.editReply({
          embeds: [createErrorEmbed("App ban role not found in this server. Please check the configuration.")]
        });
        return;
      }
      await member.roles.add(APP_BAN_ROLE_ID);
    } catch (roleError) {
      console.error("Error adding app ban role:", roleError);
      await interaction.editReply({
        embeds: [createErrorEmbed("Failed to add the app ban role. Make sure the bot has permission to manage roles.")]
      });
      return;
    }
    await storage.createAppBan({
      discordUserId: targetUser.id,
      discordUsername: targetUser.username,
      reason,
      duration,
      bannedBy: interaction.user.username,
      expiresAt,
      isActive: true
    });
    const permanentBanText = duration === "permanent" ? `
**Reapply After**
You may not reapply (Permanent Ban)` : "";
    const dmEmbed = new EmbedBuilder().setTitle("Application Ban Notice").setDescription(
      `**Reason:** Your application has been declined because an automated check of your account showed that you did not meet the minimum security requirements.

To pass the security check, you'll need to:
**Additional Information**
**Reason**: ${reason}${permanentBanText}`
    );
    const components = [];
    if (duration === "permanent") {
      const appealButton = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("appeal_ban").setLabel("Appeal").setStyle(ButtonStyle.Secondary)
      );
      components.push(appealButton);
    }
    try {
      await targetUser.send({ embeds: [dmEmbed], components });
    } catch (error) {
      console.error("Could not send DM to banned user:", error);
    }
    const logEmbed = new EmbedBuilder().setTitle("Application Ban Notice").setDescription(
      `**User:** ${targetUser} (${targetUser.username})
**Reason:** Your application has been declined because an automated check of your account showed that you did not meet the minimum security requirements.

To pass the security check, you'll need to:
**Additional Information**
**Reason**: ${reason}
**Banned By:** ${interaction.user}
**Duration:** ${durationText}${expiresAt ? `
**Expires:** <t:${Math.floor(expiresAt.getTime() / 1e3)}:F>` : ""}${permanentBanText}`
    );
    try {
      const logChannel = await client?.channels.fetch(LOG_CHANNEL_ID);
      if (logChannel instanceof TextChannel) {
        await logChannel.send({ embeds: [logEmbed] });
      }
    } catch (error) {
      console.error("Error sending to log channel:", error);
    }
    await interaction.editReply({
      embeds: [createSuccessEmbed(`Application ban applied to ${targetUser} for **${durationText}**.`)]
    });
  } catch (error) {
    console.error("Error applying app ban:", error);
    await interaction.editReply({
      embeds: [createErrorEmbed("Failed to apply application ban.")]
    });
  }
}
async function handleAppBanRemove(interaction) {
  if (!hasAppBanRole(interaction)) {
    await interaction.reply({ embeds: [createNoPermissionEmbed()], ephemeral: true });
    return;
  }
  const targetUser = interaction.options.getUser("user", true);
  await interaction.deferReply({ ephemeral: true });
  try {
    const guild = interaction.guild;
    if (!guild) {
      await interaction.editReply({
        embeds: [createErrorEmbed("This command can only be used in a server.")]
      });
      return;
    }
    const member = await guild.members.fetch(targetUser.id);
    const existingBan = await storage.getActiveAppBan(targetUser.id);
    if (!existingBan) {
      await interaction.editReply({
        embeds: [createErrorEmbed("This user does not have an active application ban.")]
      });
      return;
    }
    try {
      await member.roles.remove(APP_BAN_ROLE_ID);
    } catch (roleError) {
      console.error("Error removing app ban role:", roleError);
      await interaction.editReply({
        embeds: [createErrorEmbed("Failed to remove the app ban role. Make sure the bot has permission to manage roles.")]
      });
      return;
    }
    await storage.removeAppBan(targetUser.id, interaction.user.username);
    const dmEmbed = new EmbedBuilder().setTitle("Application Ban Removed").setDescription(`Your application ban has been removed.`).setColor(GREEN_COLOR).setTimestamp();
    try {
      await targetUser.send({ embeds: [dmEmbed] });
    } catch (error) {
      console.error("Could not send DM to unbanned user:", error);
    }
    const logEmbed = new EmbedBuilder().setTitle("Application Ban Removed").setDescription(
      `**User:** ${targetUser} (${targetUser.username})
**Removed By:** ${interaction.user}`
    ).setColor(GREEN_COLOR).setTimestamp();
    try {
      const logChannel = await client?.channels.fetch(LOG_CHANNEL_ID);
      if (logChannel instanceof TextChannel) {
        await logChannel.send({ embeds: [logEmbed] });
      }
    } catch (error) {
      console.error("Error sending to log channel:", error);
    }
    await interaction.editReply({
      embeds: [createSuccessEmbed(`Application ban removed from ${targetUser}.`)]
    });
  } catch (error) {
    console.error("Error removing app ban:", error);
    await interaction.editReply({
      embeds: [createErrorEmbed("Failed to remove application ban.")]
    });
  }
}
async function handleAppBanHistory(interaction) {
  if (!hasAppBanRole(interaction)) {
    await interaction.reply({ embeds: [createNoPermissionEmbed()], ephemeral: true });
    return;
  }
  const targetUser = interaction.options.getUser("user", true);
  await interaction.deferReply({ ephemeral: true });
  try {
    const history = await storage.getAppBanHistory(targetUser.id);
    if (history.length === 0) {
      await interaction.editReply({
        embeds: [createSuccessEmbed(`${targetUser} has no application ban history.`)]
      });
      return;
    }
    const historyText = history.map((ban, index) => {
      const durationText = ban.duration === "1_week" ? "1 Week" : ban.duration === "2_weeks" ? "2 Weeks" : "Permanent";
      const status = ban.isActive ? "Active" : "Expired/Removed";
      return `**${index + 1}.** ${durationText} - ${status}
   Reason: ${ban.reason}
   Banned by: ${ban.bannedBy}
   Date: <t:${Math.floor(new Date(ban.bannedAt).getTime() / 1e3)}:D>`;
    }).join("\n\n");
    const embed = new EmbedBuilder().setTitle(`Application Ban History - ${targetUser.username}`).setDescription(historyText).setColor(RULES_COLOR).setTimestamp();
    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error("Error fetching app ban history:", error);
    await interaction.editReply({
      embeds: [createErrorEmbed("Failed to fetch application ban history.")]
    });
  }
}
async function handleApplicationLog(interaction) {
  if (!hasApplicationLogRole(interaction)) {
    await interaction.reply({ embeds: [createNoPermissionEmbed()], ephemeral: true });
    return;
  }
  const targetUser = interaction.options.getUser("user", true);
  const testType = interaction.options.getString("test-type", true);
  const result = interaction.options.getString("result", true);
  const notes = interaction.options.getString("notes") || void 0;
  await interaction.deferReply({ ephemeral: true });
  try {
    await storage.createApplicationLog({
      discordUserId: targetUser.id,
      discordUsername: targetUser.username,
      testType,
      result,
      loggedBy: interaction.user.username,
      notes
    });
    const testTypeText = testType === "entry_test" ? "Entry Test" : "Final Test";
    const resultText = result.charAt(0).toUpperCase() + result.slice(1);
    const resultColor = result === "passed" ? GREEN_COLOR : result === "failed" ? RED_COLOR : RULES_COLOR;
    const logEmbed = new EmbedBuilder().setTitle("Application Test Result").setDescription(
      `**User:** ${targetUser} (${targetUser.username})
**Test Type:** ${testTypeText}
**Result:** ${resultText}
**Logged By:** ${interaction.user}
${notes ? `**Notes:** ${notes}` : ""}`
    ).setColor(resultColor).setTimestamp();
    try {
      const logChannel = await client?.channels.fetch(APPLICATION_LOG_CHANNEL_ID);
      if (logChannel instanceof TextChannel) {
        await logChannel.send({ embeds: [logEmbed] });
      }
    } catch (error) {
      console.error("Error sending to application log channel:", error);
    }
    await interaction.editReply({
      embeds: [createSuccessEmbed(`Application log created for ${targetUser}.
**Test:** ${testTypeText}
**Result:** ${resultText}`)]
    });
  } catch (error) {
    console.error("Error creating application log:", error);
    await interaction.editReply({
      embeds: [createErrorEmbed("Failed to create application log.")]
    });
  }
}
function getEntryTestPagesEnglish() {
  return [
    {
      title: "Entry Test: 9C",
      description: "This command explains the requirements to take the entry test. All tests are identical and applied fairly to every candidate.\n\nTo pass, you must complete each step, although the test will continue even if you fail a particular step.\n\nYou must always follow the host's instructions. Upon joining the entry test server, you will need to go to the police department and register as a police officer to begin the test.",
      image: TEST_PAGE_1_IMAGE
    },
    {
      title: "Stage 1: Driving",
      description: "For the first step of the entry test, you must drive from the front of the police department to the Harbor. A line will be drawn on the road to guide you.\n\nYou must complete this test within 35 seconds. If you exceed this time, you will fail the entry test.",
      image: TEST_PAGE_2_IMAGE
    },
    {
      title: "Stage 2: 1v1",
      description: "For the second step of the entry test, you must enter the Harbor area for 3 rounds of a 1v1.\n\n**Conditions:**\n\u2022 You may use all available tools (you must use undercover unless you don't have the Gamepass).\n\u2022 The criminal may only use the Sniper Rifle, Metal Bat, Machete, and G36.\n\u2022 You cannot leave the designated area.\n\u2022 You may shoot through vehicles.\n\u2022 You must win at least one round to pass, although this may be overridden by the host.",
      image: TEST_PAGE_3_IMAGE
    },
    {
      title: "Stage 3: Taser",
      description: "For the third stage of the test, you will remain in the same area and position as the 1v1, but this time, it's a turn. You must tase the target or kill it with a melee weapon to win this turn.\n\n**Conditions:**\n\u2022 You can only use the Taser, the Baton and all consumables.\n\u2022 The criminal can only use the metal bat and consumables.\n\u2022 You must tase the criminal within 3 minutes.\n\nOnce the test is complete, you will have to leave the server. Your results will be given in the ticket you have opened.",
      image: TEST_PAGE_4_IMAGE
    }
  ];
}
function getEntryTestPagesGerman() {
  return [
    {
      title: "Aufnahmetest: 9C",
      description: "Dieser Befehl erkl\xE4rt die Anforderungen f\xFCr den Aufnahmetest. Alle Tests sind identisch und werden fair auf jeden Kandidaten angewendet.\n\nUm zu bestehen, m\xFCssen Sie jeden Schritt abschlie\xDFen, obwohl der Test auch dann fortgesetzt wird, wenn Sie einen bestimmten Schritt nicht bestehen.\n\nSie m\xFCssen immer den Anweisungen des Gastgebers folgen. Nach dem Beitritt zum Aufnahmetest-Server m\xFCssen Sie zur Polizeistation gehen und sich als Polizist registrieren, um den Test zu beginnen.",
      image: TEST_PAGE_1_IMAGE
    },
    {
      title: "Stufe 1: Fahren",
      description: "F\xFCr den ersten Schritt des Aufnahmetests m\xFCssen Sie von der Vorderseite der Polizeistation zum Hafen fahren. Eine Linie wird auf der Stra\xDFe gezeichnet, um Sie zu f\xFChren.\n\nSie m\xFCssen diesen Test innerhalb von 35 Sekunden abschlie\xDFen. Wenn Sie diese Zeit \xFCberschreiten, werden Sie den Aufnahmetest nicht bestehen.",
      image: TEST_PAGE_2_IMAGE
    },
    {
      title: "Stufe 2: 1v1",
      description: "F\xFCr den zweiten Schritt des Aufnahmetests m\xFCssen Sie den Hafenbereich f\xFCr 3 Runden eines 1v1 betreten.\n\n**Bedingungen:**\n\u2022 Sie d\xFCrfen alle verf\xFCgbaren Werkzeuge verwenden (Sie m\xFCssen Undercover verwenden, es sei denn, Sie haben den Gamepass nicht).\n\u2022 Der Kriminelle darf nur das Scharfsch\xFCtzengewehr, den Metallschl\xE4ger, die Machete und G36 verwenden.\n\u2022 Sie d\xFCrfen den vorgesehenen Bereich nicht verlassen.\n\u2022 Sie d\xFCrfen durch Fahrzeuge schie\xDFen.\n\u2022 Sie m\xFCssen mindestens eine Runde gewinnen, um zu bestehen, obwohl dies vom Gastgeber \xFCberschrieben werden kann.",
      image: TEST_PAGE_3_IMAGE
    },
    {
      title: "Stufe 3: Taser",
      description: "F\xFCr die dritte Stufe des Tests bleiben Sie in demselben Bereich und derselben Position wie beim 1v1, aber diesmal ist es eine Runde. Sie m\xFCssen das Ziel mit dem Taser treffen oder es mit einer Nahkampfwaffe t\xF6ten, um diese Runde zu gewinnen.\n\n**Bedingungen:**\n\u2022 Sie k\xF6nnen nur den Taser, den Schlagstock und alle Verbrauchsg\xFCter verwenden.\n\u2022 Der Kriminelle kann nur den Metallschl\xE4ger und Verbrauchsg\xFCter verwenden.\n\u2022 Sie m\xFCssen den Kriminellen innerhalb von 3 Minuten mit dem Taser treffen.\n\nSobald der Test abgeschlossen ist, m\xFCssen Sie den Server verlassen. Ihre Ergebnisse werden in dem von Ihnen ge\xF6ffneten Ticket mitgeteilt.",
      image: TEST_PAGE_4_IMAGE
    }
  ];
}
function getFinalTestPagesEnglish() {
  return [
    {
      title: "Final Test: 9C",
      description: "This command explains the requirements for the final test. The final test is the last step before becoming a full member of 9C.\n\nYou must demonstrate advanced skills and knowledge of our procedures.\n\nFollow all instructions from your host carefully. Failure to comply may result in immediate disqualification."
    },
    {
      title: "Final Test: Ending",
      description: "Once the final test is complete, you will receive your results in the ticket you have opened.\n\nCongratulations on making it this far!"
    }
  ];
}
function getFinalTestPagesGerman() {
  return [
    {
      title: "Abschlusstest: 9C",
      description: "Dieser Befehl erkl\xE4rt die Anforderungen f\xFCr den Abschlusstest. Der Abschlusstest ist der letzte Schritt, bevor Sie Vollmitglied von 9C werden.\n\nSie m\xFCssen fortgeschrittene F\xE4higkeiten und Kenntnisse unserer Verfahren demonstrieren.\n\nFolgen Sie allen Anweisungen Ihres Gastgebers sorgf\xE4ltig. Die Nichteinhaltung kann zur sofortigen Disqualifikation f\xFChren."
    },
    {
      title: "Abschlusstest: Ende",
      description: "Sobald der Abschlusstest abgeschlossen ist, erhalten Sie Ihre Ergebnisse in dem von Ihnen ge\xF6ffneten Ticket.\n\nHerzlichen Gl\xFCckwunsch, dass Sie es so weit geschafft haben!"
    }
  ];
}
function createTestInfoEmbed(page, currentPage, totalPages) {
  const embed = new EmbedBuilder().setTitle(page.title).setDescription(page.description).setFooter({ text: `Page ${currentPage + 1} of ${totalPages}` }).setColor(RULES_COLOR);
  if (page.image) {
    embed.setImage(`attachment://test_page_${currentPage + 1}.jpg`);
  }
  return embed;
}
function createTestInfoButtons(currentPage, totalPages, testType, language) {
  const row = new ActionRowBuilder();
  if (currentPage > 0) {
    row.addComponents(
      new ButtonBuilder().setCustomId(`test_prev_${testType}_${language}_${currentPage}`).setLabel("Previous").setEmoji("\u2B05\uFE0F").setStyle(ButtonStyle.Secondary)
    );
  }
  if (currentPage < totalPages - 1) {
    row.addComponents(
      new ButtonBuilder().setCustomId(`test_next_${testType}_${language}_${currentPage}`).setLabel("Next").setEmoji("\u27A1\uFE0F").setStyle(ButtonStyle.Secondary)
    );
  }
  return row;
}
function getTestPages(testType, language) {
  if (testType === "entry_test") {
    return language === "german" ? getEntryTestPagesGerman() : getEntryTestPagesEnglish();
  } else {
    return language === "german" ? getFinalTestPagesGerman() : getFinalTestPagesEnglish();
  }
}
async function handleTestInfo(interaction) {
  if (!hasTestInfoRole(interaction)) {
    await interaction.reply({ embeds: [createNoPermissionEmbed()], ephemeral: true });
    return;
  }
  const testType = interaction.options.getString("type", true);
  const language = interaction.options.getString("language", true);
  const pages = getTestPages(testType, language);
  const currentPage = 0;
  const embed = createTestInfoEmbed(pages[currentPage], currentPage, pages.length);
  const buttons = createTestInfoButtons(currentPage, pages.length, testType, language);
  const components = buttons.components.length > 0 ? [buttons] : [];
  const replyOptions = {
    embeds: [embed],
    components,
    ephemeral: true
  };
  if (pages[currentPage].image) {
    const attachment = new AttachmentBuilder(pages[currentPage].image, { name: `test_page_${currentPage + 1}.jpg` });
    replyOptions.files = [attachment];
  }
  await interaction.reply(replyOptions);
}
async function handleSetupApplicationStatus(interaction) {
  if (!hasSetupApplicationStatusRole(interaction)) {
    await interaction.reply({ embeds: [createNoPermissionEmbed()], ephemeral: true });
    return;
  }
  const status = interaction.options.getString("status", true);
  await interaction.deferReply({ ephemeral: true });
  try {
    const isOpen = status === "open";
    const embedColor = isOpen ? GREEN_COLOR : RED_COLOR;
    const embed = new EmbedBuilder().setColor(embedColor).setDescription(
      `\u{1F1E9}\u{1F1EA}
${isOpen ? "Die Bewerbungen sind derzeit ge\xF6ffnet." : "Die Bewerbungen sind derzeit geschlossen."}

\u{1F1EC}\u{1F1E7}
${isOpen ? "The applications are currently open." : "The applications are currently closed."}`
    ).setImage("attachment://application_banner.jpg");
    const guildId = interaction.guildId;
    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setLabel("Requirements / Anforderungen").setEmoji("\u2139\uFE0F").setStyle(ButtonStyle.Link).setURL(`https://discord.com/channels/${guildId}/${REQUIREMENTS_CHANNEL_ID}`),
      new ButtonBuilder().setCustomId("app_appeal_ban").setLabel("Appeal Application Ban").setEmoji("\u{1F6AB}").setStyle(ButtonStyle.Secondary)
    );
    const targetChannelId = "1447161897010073652";
    const targetChannel = await interaction.client.channels.fetch(targetChannelId);
    if (targetChannel && targetChannel instanceof TextChannel) {
      const attachment = new AttachmentBuilder(APPLICATION_BANNER_IMAGE, { name: "application_banner.jpg" });
      await targetChannel.send({
        content: "@everyone",
        embeds: [embed],
        components: [buttons],
        files: [attachment]
      });
      await interaction.editReply({
        embeds: [createSuccessEmbed(`Application status has been set to **${isOpen ? "Open" : "Closed"}**.`)]
      });
    } else {
      await interaction.editReply({
        embeds: [createErrorEmbed("Could not find the application status channel.")]
      });
    }
  } catch (error) {
    console.error("Error setting application status:", error);
    await interaction.editReply({
      embeds: [createErrorEmbed("Failed to set application status.")]
    });
  }
}
async function handleSetupPublicRules(interaction) {
  if (!hasSetupApplicationStatusRole(interaction)) {
    await interaction.reply({ embeds: [createNoPermissionEmbed()], ephemeral: true });
    return;
  }
  await interaction.deferReply({ ephemeral: true });
  try {
    const embed = createPublicRulesEmbedEnglish();
    const button = createPublicRulesButtonEnglish();
    const attachment = new AttachmentBuilder(PUBLIC_RULES_IMAGE, { name: "publicrules.jpeg" });
    const targetChannel = await interaction.client.channels.fetch(PUBLIC_RULES_CHANNEL_ID);
    if (targetChannel && targetChannel instanceof TextChannel) {
      await targetChannel.send({
        embeds: [embed],
        components: [button],
        files: [attachment]
      });
      await interaction.editReply({
        embeds: [createSuccessEmbed("Public rules embed has been sent successfully.")]
      });
    } else {
      await interaction.editReply({
        embeds: [createErrorEmbed("Could not find the public rules channel.")]
      });
    }
  } catch (error) {
    console.error("Error sending public rules:", error);
    await interaction.editReply({
      embeds: [createErrorEmbed("Failed to send public rules embed.")]
    });
  }
}
async function handlePanicAlarm(interaction) {
  if (!hasPanicAlarmRole(interaction)) {
    await interaction.reply({ embeds: [createNoPermissionEmbed()], ephemeral: true });
    return;
  }
  await interaction.deferReply({ ephemeral: true });
  try {
    const embed = new EmbedBuilder().setTitle("9C Panic Button").setDescription(
      `\u{1F1EC}\u{1F1E7} Press the panic button when you need emergency assistance.
Need a server, abuse is punished.

\u{1F1E9}\u{1F1EA} Dr\xFCcken Sie die Paniktaste, wenn Sie Notfallhilfe ben\xF6tigen.
Brauchen Sie einen Server, Missbrauch wird bestraft.`
    ).setColor(RULES_COLOR).setFooter({ text: "9C Panic System" }).setTimestamp();
    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("panic_alarm_button").setLabel("Panic Alarm").setEmoji("\u{1F514}").setStyle(ButtonStyle.Danger)
    );
    const panicChannel = await client?.channels.fetch(PANIC_ALARM_CHANNEL_ID);
    if (panicChannel instanceof TextChannel) {
      await panicChannel.send({ embeds: [embed], components: [buttons] });
      await interaction.editReply({
        embeds: [createSuccessEmbed("Panic alarm button has been set up in the designated channel.")]
      });
    } else {
      await interaction.editReply({
        embeds: [createErrorEmbed("Failed to find the panic alarm channel.")]
      });
    }
  } catch (error) {
    console.error("Error setting up panic alarm:", error);
    await interaction.editReply({
      embeds: [createErrorEmbed("Failed to set up panic alarm.")]
    });
  }
}
async function handleMedicAlarm(interaction) {
  if (!hasPanicAlarmRole(interaction)) {
    await interaction.reply({ embeds: [createNoPermissionEmbed()], ephemeral: true });
    return;
  }
  await interaction.deferReply({ ephemeral: true });
  try {
    const embed = new EmbedBuilder().setTitle("9C Medic Button").setDescription(
      `\u{1F1EC}\u{1F1E7} Press the medic button when you need medical assistance.
Need a server, abuse is punished.

\u{1F1E9}\u{1F1EA} Dr\xFCcken Sie die Medic-Taste, wenn Sie medizinische Hilfe ben\xF6tigen.
Brauchen Sie einen Server, Missbrauch wird bestraft.`
    ).setColor(RULES_COLOR).setFooter({ text: "9C Medic System" }).setTimestamp();
    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("medic_alarm_button").setLabel("Medic Alarm").setEmoji("\u{1F3E5}").setStyle(ButtonStyle.Danger)
    );
    const medicChannel = await client?.channels.fetch(MEDIC_ALARM_CHANNEL_ID);
    if (medicChannel instanceof TextChannel) {
      await medicChannel.send({ embeds: [embed], components: [buttons] });
      await interaction.editReply({
        embeds: [createSuccessEmbed("Medic alarm button has been set up in the designated channel.")]
      });
    } else {
      await interaction.editReply({
        embeds: [createErrorEmbed("Failed to find the medic alarm channel.")]
      });
    }
  } catch (error) {
    console.error("Error setting up medic alarm:", error);
    await interaction.editReply({
      embeds: [createErrorEmbed("Failed to set up medic alarm.")]
    });
  }
}
var TRYOUT_AUTHORIZED_ROLE_ID = "1447303025273081896";
function buildIdleTryoutComponents() {
  const YELLOW_COLOR = 16766720;
  const introText = `The **9C Tryouts** are a recruitment process to join the unit.
This event is designed to evaluate candidates' combat and operational skills, either individually or as a team.

**The top-performing players will be selected to continue the recruitment process within 9C**,
Instructions and objectives will be announced shortly before the trials begin.`;
  const noActiveText = `# No Active Tryout
There is currently no active tryout session. Check back later or enable notifications to be notified when a new tryout is hosted.`;
  return [
    // Info container
    {
      type: ComponentType.Container,
      accent_color: YELLOW_COLOR,
      components: [
        {
          type: ComponentType.MediaGallery,
          items: [{
            media: {
              url: TRYOUT_BANNER_IMAGE
            }
          }]
        },
        {
          type: ComponentType.TextDisplay,
          content: introText
        },
        {
          type: ComponentType.TextDisplay,
          content: "-# If all slots are filled, additional spots may become available 30 minutes before the start, depending on unconfirmed participants."
        },
        {
          type: ComponentType.ActionRow,
          components: [
            {
              type: ComponentType.Button,
              style: APIButtonStyle.Primary,
              label: "Toggle Tryout Ping",
              custom_id: "toggle_tryout_ping"
            }
          ]
        }
      ]
    },
    // No active tryout container
    {
      type: ComponentType.Container,
      accent_color: YELLOW_COLOR,
      components: [
        {
          type: ComponentType.TextDisplay,
          content: noActiveText
        }
      ]
    }
  ];
}
function buildActiveTryoutComponents(tryout) {
  const YELLOW_COLOR = 16766720;
  const languageFlag = tryout.language === "english" ? ":flag_gb:" : ":flag_de:";
  const languageText = tryout.language === "english" ? "EN" : "DE";
  const discordTimestamp = `<t:${Math.floor(tryout.scheduledAt.getTime() / 1e3)}:F>`;
  const discordRelativeTime = `<t:${Math.floor(tryout.scheduledAt.getTime() / 1e3)}:R>`;
  const introText = tryout.language === "english" ? `The **9C Tryouts** are a recruitment process to join the unit.
This event is designed to evaluate candidates' combat and operational skills, either individually or as a team.

**The top-performing players will be selected to continue the recruitment process within 9C**,
Instructions and objectives will be announced shortly before the trials begin.` : `Die **9C-Tryouts** sind ein Rekrutierungsprozess, um der Einheit beizutreten.
Diese Veranstaltung dient dazu, die Kampf- und Einsatzf\xE4higkeiten der Kandidaten zu bewerten, entweder einzeln oder als Team.

**Die besten Spieler werden ausgew\xE4hlt, um den Rekrutierungsprozess innerhalb von 9C fortzusetzen.**
Anweisungen und Ziele werden kurz vor Beginn der Pr\xFCfungen bekannt gegeben.`;
  const detailsText = tryout.language === "english" ? `**Tryout ID:** ${tryout.tryoutId}
**Language:** ${languageFlag} (${languageText})
**Time:** ${discordTimestamp} (${discordRelativeTime})
**Host:** <@${tryout.hostDiscordId}>
**Server Code:** ${tryout.serverCode}
**Max Winners:** ${tryout.maxWinners}` : `**Tryout ID:** ${tryout.tryoutId}
**Sprache:** ${languageFlag} (${languageText})
**Zeit:** ${discordTimestamp} (${discordRelativeTime})
**Host:** <@${tryout.hostDiscordId}>
**Server-Code:** ${tryout.serverCode}
**Max. Gewinner:** ${tryout.maxWinners}`;
  const remainingPlaces = tryout.maxPlayers - tryout.currentPlayers;
  const placesText = tryout.language === "english" ? `# Places Remaining:
# ${remainingPlaces}/${tryout.maxPlayers}` : `# Verbleibende Pl\xE4tze:
# ${remainingPlaces}/${tryout.maxPlayers}`;
  const noteText = tryout.language === "english" ? "-# If all slots are filled, additional spots may become available 30 minutes before the start, depending on unconfirmed participants." : "-# Wenn alle Pl\xE4tze belegt sind, k\xF6nnen 30 Minuten vor dem Start zus\xE4tzliche Pl\xE4tze verf\xFCgbar werden, abh\xE4ngig von unbest\xE4tigten Teilnehmern.";
  const tryoutContainerComponents = [];
  if (tryout.pictureUrl) {
    tryoutContainerComponents.push({
      type: ComponentType.MediaGallery,
      items: [{
        media: {
          url: tryout.pictureUrl
        }
      }]
    });
  }
  tryoutContainerComponents.push(
    {
      type: ComponentType.TextDisplay,
      content: detailsText
    },
    {
      type: ComponentType.Separator,
      spacing: 1
    },
    {
      type: ComponentType.TextDisplay,
      content: placesText
    },
    {
      type: ComponentType.ActionRow,
      components: [
        {
          type: ComponentType.Button,
          style: APIButtonStyle.Danger,
          label: tryout.language === "english" ? "Attend Tryout" : "Am Tryout teilnehmen",
          custom_id: `attend_tryout_${tryout.tryoutId}`
        }
      ]
    }
  );
  return [
    // Info container
    {
      type: ComponentType.Container,
      accent_color: YELLOW_COLOR,
      components: [
        {
          type: ComponentType.MediaGallery,
          items: [{
            media: {
              url: TRYOUT_BANNER_IMAGE
            }
          }]
        },
        {
          type: ComponentType.TextDisplay,
          content: introText
        },
        {
          type: ComponentType.TextDisplay,
          content: noteText
        },
        {
          type: ComponentType.ActionRow,
          components: [
            {
              type: ComponentType.Button,
              style: APIButtonStyle.Primary,
              label: "Toggle Tryout Ping",
              custom_id: "toggle_tryout_ping"
            }
          ]
        }
      ]
    },
    // Tryout details container
    {
      type: ComponentType.Container,
      accent_color: YELLOW_COLOR,
      components: tryoutContainerComponents
    }
  ];
}
async function initializePersistentTryoutEmbed() {
  if (!client) return null;
  try {
    const channel = await client.channels.fetch(PERSISTENT_TRYOUT_EMBED_CHANNEL_ID);
    if (!(channel instanceof TextChannel)) {
      console.error("Persistent tryout embed channel not found or is not a text channel");
      return null;
    }
    const existingMessageId = await storage.getBotSetting(PERSISTENT_TRYOUT_MESSAGE_KEY);
    if (existingMessageId) {
      try {
        const existingMessage = await channel.messages.fetch(existingMessageId);
        if (existingMessage) {
          const openTryouts = await storage.getOpenTryouts();
          const activeTryout = openTryouts[0];
          const components = activeTryout ? buildActiveTryoutComponents({
            tryoutId: activeTryout.tryoutId,
            language: activeTryout.language,
            timeDate: activeTryout.timeDate,
            scheduledAt: activeTryout.scheduledAt,
            hostDiscordId: activeTryout.hostDiscordId,
            maxPlayers: activeTryout.maxPlayers,
            currentPlayers: activeTryout.currentPlayers,
            pictureUrl: activeTryout.pictureUrl
          }) : buildIdleTryoutComponents();
          await existingMessage.edit({
            components,
            flags: MessageFlags.IsComponentsV2
          });
          console.log("Updated existing persistent tryout embed");
          return existingMessageId;
        }
      } catch (error) {
        console.log("Existing persistent tryout embed message not found, skipping (will not create new on restart)");
        await storage.setBotSetting(PERSISTENT_TRYOUT_MESSAGE_KEY, "");
        return null;
      }
    }
    console.log("No persistent tryout embed exists, skipping initialization (create one with /tryout command)");
    return null;
  } catch (error) {
    console.error("Error initializing persistent tryout embed:", error);
    return null;
  }
}
async function updatePersistentTryoutEmbed(tryout) {
  if (!client) return false;
  try {
    const channel = await client.channels.fetch(PERSISTENT_TRYOUT_EMBED_CHANNEL_ID);
    if (!(channel instanceof TextChannel)) return false;
    const messageId = await storage.getBotSetting(PERSISTENT_TRYOUT_MESSAGE_KEY);
    if (!messageId) {
      console.log("No persistent tryout embed message ID found, skipping update");
      return false;
    }
    try {
      const message = await channel.messages.fetch(messageId);
      const components = tryout ? buildActiveTryoutComponents(tryout) : buildIdleTryoutComponents();
      await message.edit({
        components,
        flags: MessageFlags.IsComponentsV2
      });
      return true;
    } catch (error) {
      console.error("Error updating persistent tryout embed:", error);
      console.log("Persistent tryout embed message not found, skipping update");
      return false;
    }
  } catch (error) {
    console.error("Error in updatePersistentTryoutEmbed:", error);
    return false;
  }
}
async function handleTryout(interaction) {
  const memberRoles = interaction.member?.roles;
  const hasAuthorizedRole = Array.isArray(memberRoles) ? memberRoles.includes(TRYOUT_AUTHORIZED_ROLE_ID) : memberRoles?.cache.has(TRYOUT_AUTHORIZED_ROLE_ID);
  if (!hasAuthorizedRole) {
    await interaction.reply({ embeds: [createNoPermissionEmbed()], ephemeral: true });
    return;
  }
  await interaction.deferReply({ ephemeral: true });
  try {
    const maxPlayers = interaction.options.getInteger("max_players", true);
    const timeDate = interaction.options.getString("time_date", true);
    const language = interaction.options.getString("language", true);
    const serverCode = interaction.options.getString("server_code", true);
    const maxWinners = interaction.options.getInteger("max_winners", true);
    const pictureUrl = interaction.options.getString("picture_url") || null;
    const tryoutId = await storage.getNextTryoutId();
    const hostDiscordId = interaction.user.id;
    const member = interaction.guild?.members.cache.get(interaction.user.id);
    const hostName = member?.nickname || interaction.user.username;
    const roleName = `Tryout (${tryoutId})`;
    const tryoutRole = await interaction.guild?.roles.create({
      name: roleName,
      color: 0,
      reason: `Tryout session ${tryoutId}`
    });
    if (!tryoutRole) {
      await interaction.editReply({
        embeds: [createErrorEmbed("Failed to create tryout role.")]
      });
      return;
    }
    let scheduledAt;
    try {
      scheduledAt = new Date(timeDate);
      if (isNaN(scheduledAt.getTime())) {
        const parts = timeDate.match(/(\d{1,2})\s+(\w+)\s+(\d{4})\s+(\d{1,2}):(\d{2})/i);
        if (parts) {
          const [, day, month, year, hour, minute] = parts;
          const monthNames = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
          const monthIndex = monthNames.indexOf(month.toLowerCase());
          if (monthIndex !== -1) {
            scheduledAt = new Date(parseInt(year), monthIndex, parseInt(day), parseInt(hour), parseInt(minute));
          } else {
            scheduledAt = /* @__PURE__ */ new Date();
            scheduledAt.setHours(scheduledAt.getHours() + 24);
          }
        } else {
          scheduledAt = /* @__PURE__ */ new Date();
          scheduledAt.setHours(scheduledAt.getHours() + 24);
        }
      }
    } catch {
      scheduledAt = /* @__PURE__ */ new Date();
      scheduledAt.setHours(scheduledAt.getHours() + 24);
    }
    const newTryout = await storage.createTryout({
      tryoutId,
      messageId: null,
      // We use the persistent embed, not individual messages
      channelId: PERSISTENT_TRYOUT_EMBED_CHANNEL_ID,
      guildId: interaction.guildId,
      hostDiscordId: interaction.user.id,
      hostUsername: hostName,
      maxPlayers,
      maxWinners,
      serverCode,
      timeDate,
      scheduledAt,
      language,
      pictureUrl,
      roleId: tryoutRole.id,
      tryoutChannelId: null,
      currentPlayers: 0,
      status: "open"
    });
    await updatePersistentTryoutEmbed({
      tryoutId,
      language,
      timeDate,
      scheduledAt,
      hostDiscordId,
      maxPlayers,
      maxWinners,
      serverCode,
      currentPlayers: 0,
      pictureUrl
    });
    await interaction.editReply({
      embeds: [createSuccessEmbed(`Tryout session ${tryoutId} has been created successfully.

Role: <@&${tryoutRole.id}>
Announcement: <#${PERSISTENT_TRYOUT_EMBED_CHANNEL_ID}>

*The persistent embed has been updated. The tryout channel will be created when the tryout starts.*`)]
    });
  } catch (error) {
    console.error("Error creating tryout:", error);
    await interaction.editReply({
      embeds: [createErrorEmbed("Failed to create tryout session.")]
    });
  }
}
async function handleAutocomplete(interaction) {
  const { commandName, options } = interaction;
  try {
    if (commandName === "tryout-cancel") {
      const focusedOption = options.getFocused(true);
      if (focusedOption.name === "tryout_id") {
        const openTryouts = await storage.getOpenTryouts();
        const choices = openTryouts.map((tryout) => ({
          name: `Tryout #${tryout.tryoutId} - ${tryout.timeDate} (${tryout.language})`,
          value: tryout.tryoutId
        }));
        await interaction.respond(choices.slice(0, 25));
      }
    }
  } catch (error) {
    console.error("Error handling autocomplete:", error);
    await interaction.respond([]);
  }
}
async function handleTryoutCancel(interaction) {
  const memberRoles = interaction.member?.roles;
  const hasAuthorizedRole = Array.isArray(memberRoles) ? memberRoles.includes(TRYOUT_AUTHORIZED_ROLE_ID) : memberRoles?.cache.has(TRYOUT_AUTHORIZED_ROLE_ID);
  if (!hasAuthorizedRole) {
    await interaction.reply({ embeds: [createNoPermissionEmbed()], ephemeral: true });
    return;
  }
  await interaction.deferReply({ ephemeral: true });
  try {
    const tryoutId = interaction.options.getInteger("tryout_id", true);
    const reason = interaction.options.getString("reason", true);
    const tryout = await storage.getTryoutByTryoutId(tryoutId);
    if (!tryout) {
      await interaction.editReply({
        embeds: [createErrorEmbed(`Tryout #${tryoutId} not found.`)]
      });
      return;
    }
    if (tryout.status !== "open") {
      await interaction.editReply({
        embeds: [createErrorEmbed(`Tryout #${tryoutId} is not open and cannot be cancelled.`)]
      });
      return;
    }
    await storage.updateTryout(tryout.id, { status: "cancelled" });
    if (tryout.guildId && tryout.roleId && client) {
      try {
        const guild = await client.guilds.fetch(tryout.guildId);
        const attendees = await storage.getTryoutAttendees(tryout.id);
        for (const attendee of attendees) {
          try {
            const member = await guild.members.fetch(attendee.discordUserId);
            if (member && tryout.roleId) {
              await member.roles.remove(tryout.roleId);
            }
          } catch (error) {
            console.error(`Could not remove role from ${attendee.discordUsername}:`, error);
          }
        }
        try {
          const role = await guild.roles.fetch(tryout.roleId);
          if (role) {
            await role.delete("Tryout cancelled");
          }
        } catch (error) {
          console.error("Could not delete tryout role:", error);
        }
      } catch (error) {
        console.error("Error managing tryout cancellation:", error);
      }
    }
    await updatePersistentTryoutEmbed(null);
    const cancellationChannel = await client?.channels.fetch(TRYOUT_CANCELLATION_CHANNEL_ID);
    if (cancellationChannel instanceof TextChannel) {
      await cancellationChannel.send({ content: `<@&${TRYOUT_PING_ROLE_ID}>` });
      const cancellationEmbed = new EmbedBuilder().setTitle("Tryout Cancelled").setDescription(
        `**Tryout ID:** ${tryoutId}
**Reason:** ${reason}

We have cancelled this current tryout, please understand that we had reasons that caused the cancellation. Stay tuned for more tryouts!`
      ).setColor(RED_COLOR).setTimestamp();
      const cancellationMessage = await cancellationChannel.send({ embeds: [cancellationEmbed] });
      const THREE_HOURS_MS = 3 * 60 * 60 * 1e3;
      setTimeout(async () => {
        try {
          await cancellationMessage.delete();
          console.log(`Deleted cancellation embed for tryout ${tryoutId} after 3 hours`);
        } catch (error) {
          console.error(`Error deleting cancellation embed for tryout ${tryoutId}:`, error);
        }
      }, THREE_HOURS_MS);
    }
    await storage.clearTryoutAttendees(tryout.id);
    await interaction.editReply({
      embeds: [createSuccessEmbed(`Tryout #${tryoutId} has been cancelled successfully.`)]
    });
  } catch (error) {
    console.error("Error cancelling tryout:", error);
    await interaction.editReply({
      embeds: [createErrorEmbed("Failed to cancel tryout.")]
    });
  }
}
async function checkAndExpireBans() {
  console.log("Checking for expired bans...");
  const expiredBans = await storage.getExpiredBans();
  for (const ban of expiredBans) {
    try {
      if (client) {
        const guilds = client.guilds.cache;
        for (const [, guild] of guilds) {
          try {
            const member = await guild.members.fetch(ban.discordUserId);
            if (member.roles.cache.has(APP_BAN_ROLE_ID)) {
              await member.roles.remove(APP_BAN_ROLE_ID);
              console.log(`Removed app ban role from ${ban.discordUsername}`);
            }
          } catch (e) {
          }
        }
      }
      await storage.expireBan(ban.id);
      try {
        const user = await client?.users.fetch(ban.discordUserId);
        if (user) {
          const dmEmbed = new EmbedBuilder().setTitle("Application Ban Expired").setDescription("Your application ban has expired. You may now apply again.").setColor(GREEN_COLOR).setTimestamp();
          await user.send({ embeds: [dmEmbed] });
        }
      } catch (error) {
        console.error("Could not send DM to user:", error);
      }
    } catch (error) {
      console.error(`Error expiring ban for ${ban.discordUsername}:`, error);
    }
  }
}
async function handleButtonInteraction(interaction) {
  const { customId } = interaction;
  try {
    if (customId === "toggle_tryout_ping") {
      const member = interaction.guild?.members.cache.get(interaction.user.id) || await interaction.guild?.members.fetch(interaction.user.id);
      if (!member) {
        await interaction.reply({ content: "Could not find your member data.", ephemeral: true });
        return;
      }
      const hasRole = member.roles.cache.has(TRYOUT_PING_ROLE_ID);
      try {
        if (hasRole) {
          await member.roles.remove(TRYOUT_PING_ROLE_ID);
          await interaction.reply({
            content: "You have been removed from the Tryout Ping role. You will no longer receive notifications for tryouts.",
            ephemeral: true
          });
        } else {
          await member.roles.add(TRYOUT_PING_ROLE_ID);
          await interaction.reply({
            content: "You have been added to the Tryout Ping role. You will now receive notifications for tryouts!",
            ephemeral: true
          });
        }
      } catch (error) {
        console.error("Error toggling tryout ping role:", error);
        await interaction.reply({
          content: "Failed to toggle the Tryout Ping role. Please try again later.",
          ephemeral: true
        });
      }
      return;
    }
    if (customId === "appeal_ban") {
      const modal = new ModalBuilder().setCustomId("appeal_modal").setTitle("Appeal Application Ban");
      const appealInput = new TextInputBuilder().setCustomId("appeal_reason").setLabel("Why should your application ban be removed?").setStyle(TextInputStyle.Paragraph).setRequired(true).setMaxLength(1e3);
      const actionRow = new ActionRowBuilder().addComponents(appealInput);
      modal.addComponents(actionRow);
      await interaction.showModal(modal);
      return;
    }
    if (customId === "app_requirements") {
      await interaction.reply({
        content: `Please check the requirements here: <#${REQUIREMENTS_CHANNEL_ID}>`,
        ephemeral: true
      });
      return;
    }
    if (customId === "app_appeal_ban") {
      const activeBan = await storage.getActiveAppBan(interaction.user.id);
      if (!activeBan) {
        await interaction.reply({
          content: "You do not have an active application ban to appeal.",
          ephemeral: true
        });
        return;
      }
      if (activeBan.duration !== "permanent") {
        await interaction.reply({
          content: "Only permanent application bans can be appealed. Your ban is temporary and will expire automatically.",
          ephemeral: true
        });
        return;
      }
      const pendingAppeals = await storage.getPendingAppeals(interaction.user.id);
      if (pendingAppeals.length > 0) {
        await interaction.reply({
          content: "You already have a pending appeal.",
          ephemeral: true
        });
        return;
      }
      const modal = new ModalBuilder().setCustomId("appeal_modal").setTitle("Appeal Application Ban");
      const appealInput = new TextInputBuilder().setCustomId("appeal_reason").setLabel("Why should your application ban be removed?").setStyle(TextInputStyle.Paragraph).setRequired(true).setMaxLength(1e3);
      const actionRow = new ActionRowBuilder().addComponents(appealInput);
      modal.addComponents(actionRow);
      await interaction.showModal(modal);
      return;
    }
    if (customId.startsWith("test_prev_") || customId.startsWith("test_next_")) {
      const parts = customId.split("_");
      const direction = parts[1];
      const testType = parts[2] + "_" + parts[3];
      const language = parts[4];
      const currentPage = parseInt(parts[5]);
      const pages = getTestPages(testType, language);
      const newPage = direction === "next" ? currentPage + 1 : currentPage - 1;
      if (newPage < 0 || newPage >= pages.length) {
        await interaction.reply({ content: "Invalid page.", ephemeral: true });
        return;
      }
      const embed = createTestInfoEmbed(pages[newPage], newPage, pages.length);
      const buttons = createTestInfoButtons(newPage, pages.length, testType, language);
      const components = buttons.components.length > 0 ? [buttons] : [];
      const updateOptions = { embeds: [embed], components };
      if (pages[newPage].image) {
        const attachment = new AttachmentBuilder(pages[newPage].image, { name: `test_page_${newPage + 1}.jpg` });
        updateOptions.files = [attachment];
      }
      await interaction.update(updateOptions);
      return;
    }
    if (customId.startsWith("appeal_accept_")) {
      const appealId = customId.replace("appeal_accept_", "");
      const appeal = await storage.getAppeal(appealId);
      if (!appeal) {
        await interaction.reply({ content: "Appeal not found.", ephemeral: true });
        return;
      }
      if (appeal.status !== "pending") {
        await interaction.reply({ content: "This appeal has already been handled.", ephemeral: true });
        return;
      }
      await storage.removeAppBan(appeal.discordUserId, interaction.user.username);
      try {
        const guilds = client?.guilds.cache;
        if (guilds) {
          for (const guild of guilds.values()) {
            try {
              const member = await guild.members.fetch(appeal.discordUserId);
              if (member.roles.cache.has(APP_BAN_ROLE_ID)) {
                await member.roles.remove(APP_BAN_ROLE_ID);
              }
            } catch (e) {
            }
          }
        }
      } catch (error) {
        console.error("Error removing role:", error);
      }
      await storage.updateAppeal(appealId, {
        status: "accepted",
        handledBy: interaction.user.username,
        handledAt: /* @__PURE__ */ new Date()
      });
      try {
        const user = await client?.users.fetch(appeal.discordUserId);
        if (user) {
          const dmEmbed = new EmbedBuilder().setTitle("Appeal Accepted").setDescription(`**${appealId}**`);
          await user.send({ embeds: [dmEmbed] });
        }
      } catch (error) {
        console.error("Could not send DM to user:", error);
      }
      const updatedEmbed = new EmbedBuilder().setTitle("Appeal").setDescription(
        `[${appealId}]

**Appeal**: ${appeal.appealText}

**Status**: Accepted by ${interaction.user.username}`
      );
      await interaction.update({ embeds: [updatedEmbed], components: [] });
      return;
    }
    if (customId.startsWith("appeal_deny_")) {
      const appealId = customId.replace("appeal_deny_", "");
      const modal = new ModalBuilder().setCustomId(`deny_reason_modal_${appealId}`).setTitle("Deny Appeal");
      const reasonInput = new TextInputBuilder().setCustomId("deny_reason").setLabel("Reason for denial").setStyle(TextInputStyle.Paragraph).setRequired(true).setMaxLength(500);
      const actionRow = new ActionRowBuilder().addComponents(reasonInput);
      modal.addComponents(actionRow);
      await interaction.showModal(modal);
      return;
    }
    if (customId === "rules_german" || customId === "rules_english") {
      const attachment = new AttachmentBuilder(RULES_IMAGE, { name: "rules.jpg" });
      if (customId === "rules_german") {
        const embed = createRulesEmbedGerman();
        const button = createRulesButtonGerman();
        await interaction.reply({
          embeds: [embed],
          components: [button],
          files: [attachment],
          ephemeral: true
        });
      } else {
        const embed = createRulesEmbedEnglish();
        const button = createRulesButtonEnglish();
        await interaction.reply({
          embeds: [embed],
          components: [button],
          files: [attachment],
          ephemeral: true
        });
      }
      return;
    }
    if (customId === "radiocodes_german" || customId === "radiocodes_english") {
      const attachment = new AttachmentBuilder(RADIO_CODES_IMAGE, { name: "radiocodes.jpg" });
      if (customId === "radiocodes_german") {
        const embed = createRadioCodesEmbedGerman();
        const button = createRadioCodesButtonGerman();
        await interaction.reply({
          embeds: [embed],
          components: [button],
          files: [attachment],
          ephemeral: true
        });
      } else {
        const embed = createRadioCodesEmbedEnglish();
        const button = createRadioCodesButtonEnglish();
        await interaction.reply({
          embeds: [embed],
          components: [button],
          files: [attachment],
          ephemeral: true
        });
      }
      return;
    }
    if (customId === "publicrules_german" || customId === "publicrules_english") {
      const attachment = new AttachmentBuilder(PUBLIC_RULES_IMAGE, { name: "publicrules.jpeg" });
      if (customId === "publicrules_german") {
        const embed = createPublicRulesEmbedGerman();
        const button = createPublicRulesButtonGerman();
        await interaction.reply({
          embeds: [embed],
          components: [button],
          files: [attachment],
          ephemeral: true
        });
      } else {
        const embed = createPublicRulesEmbedEnglish();
        const button = createPublicRulesButtonEnglish();
        await interaction.reply({
          embeds: [embed],
          components: [button],
          files: [attachment],
          ephemeral: true
        });
      }
      return;
    }
    if (customId === "panic_alarm_button") {
      const modal = new ModalBuilder().setCustomId("panic_alarm_modal").setTitle("9C Panic Alarm");
      const locationInput = new TextInputBuilder().setCustomId("panic_location").setLabel("Location?").setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(200).setPlaceholder("Enter your current location");
      const medicInput = new TextInputBuilder().setCustomId("panic_medic").setLabel("Medic needed? (yes/no)").setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(10).setPlaceholder("yes or no");
      const locationRow = new ActionRowBuilder().addComponents(locationInput);
      const medicRow = new ActionRowBuilder().addComponents(medicInput);
      modal.addComponents(locationRow, medicRow);
      await interaction.showModal(modal);
      return;
    }
    if (customId.startsWith("panic_enroute_")) {
      const messageId = customId.replace("panic_enroute_", "");
      if (!panicAlarmEnroute.has(messageId)) {
        panicAlarmEnroute.set(messageId, /* @__PURE__ */ new Set());
      }
      const enrouteUsers = panicAlarmEnroute.get(messageId);
      if (enrouteUsers.has(interaction.user.id)) {
        await interaction.reply({
          content: "You have already marked yourself as enroute for this alarm.",
          ephemeral: true
        });
        return;
      }
      enrouteUsers.add(interaction.user.id);
      const updatedPoints = await storage.addPoints(interaction.user.id, 2, "Panic Alarm Response", "System");
      const member = interaction.guild?.members.cache.get(interaction.user.id);
      const userNickname = member?.nickname || interaction.user.displayName || interaction.user.username;
      try {
        const logChannel = await client?.channels.fetch(POINTS_LOG_CHANNEL_ID);
        if (logChannel instanceof TextChannel) {
          const logEmbed = createPointsReceivedEmbed(userNickname, 2, "Panic Alarm Response");
          const logAttachment = new AttachmentBuilder(POINTS_ADDED_IMAGE, { name: "points_added.jpg" });
          await logChannel.send({ embeds: [logEmbed], files: [logAttachment] });
        }
      } catch (error) {
        console.error("Error sending to points log channel:", error);
      }
      await interaction.reply({
        content: `You are now enroute! You have received **+2 CP** for responding. Your total: **${updatedPoints.totalPoints.toLocaleString()} CP**`,
        ephemeral: true
      });
      return;
    }
    if (customId.startsWith("panic_solved_")) {
      const messageId = customId.replace("panic_solved_", "");
      panicAlarmEnroute.delete(messageId);
      try {
        await interaction.message.delete();
        await interaction.reply({
          content: "Panic alarm has been marked as solved and the message has been deleted.",
          ephemeral: true
        });
      } catch (error) {
        console.error("Error deleting panic alarm message:", error);
        await interaction.reply({
          content: "Failed to delete the panic alarm message.",
          ephemeral: true
        });
      }
      return;
    }
    if (customId === "medic_alarm_button") {
      const modal = new ModalBuilder().setCustomId("medic_alarm_modal").setTitle("9C Medic Alarm");
      const locationInput = new TextInputBuilder().setCustomId("medic_location").setLabel("Location?").setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(200).setPlaceholder("Enter your current location");
      const detailsInput = new TextInputBuilder().setCustomId("medic_details").setLabel("Do you need a medic?").setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(200).setPlaceholder("yes or no");
      const locationRow = new ActionRowBuilder().addComponents(locationInput);
      const detailsRow = new ActionRowBuilder().addComponents(detailsInput);
      modal.addComponents(locationRow, detailsRow);
      await interaction.showModal(modal);
      return;
    }
    if (customId.startsWith("medic_enroute_")) {
      const messageId = customId.replace("medic_enroute_", "");
      if (!medicAlarmEnroute.has(messageId)) {
        medicAlarmEnroute.set(messageId, /* @__PURE__ */ new Set());
      }
      const enrouteUsers = medicAlarmEnroute.get(messageId);
      if (enrouteUsers.has(interaction.user.id)) {
        await interaction.reply({
          content: "You have already marked yourself as enroute for this alarm.",
          ephemeral: true
        });
        return;
      }
      enrouteUsers.add(interaction.user.id);
      const updatedPoints = await storage.addPoints(interaction.user.id, 2, "Medic Alarm Response", "System");
      const member = interaction.guild?.members.cache.get(interaction.user.id);
      const userNickname = member?.nickname || interaction.user.displayName || interaction.user.username;
      try {
        const logChannel = await client?.channels.fetch(POINTS_LOG_CHANNEL_ID);
        if (logChannel instanceof TextChannel) {
          const logEmbed = createPointsReceivedEmbed(userNickname, 2, "Medic Alarm Response");
          const logAttachment = new AttachmentBuilder(POINTS_ADDED_IMAGE, { name: "points_added.jpg" });
          await logChannel.send({ embeds: [logEmbed], files: [logAttachment] });
        }
      } catch (error) {
        console.error("Error sending to points log channel:", error);
      }
      await interaction.reply({
        content: `You are now enroute! You have received **+2 CP** for responding. Your total: **${updatedPoints.totalPoints.toLocaleString()} CP**`,
        ephemeral: true
      });
      return;
    }
    if (customId.startsWith("medic_solved_")) {
      const messageId = customId.replace("medic_solved_", "");
      medicAlarmEnroute.delete(messageId);
      try {
        await interaction.message.delete();
        await interaction.reply({
          content: "Medic alarm has been marked as solved and the message has been deleted.",
          ephemeral: true
        });
      } catch (error) {
        console.error("Error deleting medic alarm message:", error);
        await interaction.reply({
          content: "Failed to delete the medic alarm message.",
          ephemeral: true
        });
      }
      return;
    }
    if (customId.startsWith("attend_tryout_")) {
      const tryoutId = customId.replace("attend_tryout_", "");
      try {
        const logChannel = await client?.channels.fetch(TRYOUT_LOG_CHANNEL_ID);
        if (logChannel instanceof TextChannel) {
          const logEmbed = new EmbedBuilder().setTitle("Tryout Button Pressed").setDescription(
            `**User:** ${interaction.user} (${interaction.user.username})
**Tryout ID:** ${tryoutId}
**Action:** Attend button clicked`
          ).setColor(8421504).setTimestamp();
          await logChannel.send({ embeds: [logEmbed] });
        }
      } catch (error) {
        console.error("Error logging tryout button press:", error);
      }
      const memberRoles = interaction.member?.roles;
      const hasAppBan = Array.isArray(memberRoles) ? memberRoles.includes(APP_BAN_ROLE_ID) : memberRoles?.cache.has(APP_BAN_ROLE_ID);
      if (hasAppBan) {
        const errorEmbed = new EmbedBuilder().setTitle("Failed to Attend").setDescription("You currently have an active application ban, you cannot join 9C with an application ban.").setColor(RED_COLOR);
        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        return;
      }
      const tryout = await storage.getTryoutByTryoutId(parseInt(tryoutId));
      if (!tryout) {
        const errorEmbed = new EmbedBuilder().setTitle("Tryout Not Found").setDescription("This tryout session no longer exists.").setColor(RED_COLOR);
        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        return;
      }
      if (tryout.status !== "open" && tryout.status !== "confirming") {
        const errorEmbed = new EmbedBuilder().setTitle("Tryout Closed").setDescription("This tryout session is no longer accepting attendees.").setColor(RED_COLOR);
        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        return;
      }
      if (tryout.currentPlayers >= tryout.maxPlayers) {
        const errorEmbed = new EmbedBuilder().setTitle("Tryout Full").setDescription("There are no places left in this tryout session.").setColor(RED_COLOR);
        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        return;
      }
      const existingAttendee = await storage.getTryoutAttendee(tryout.id, interaction.user.id);
      if (existingAttendee) {
        const errorEmbed = new EmbedBuilder().setTitle("Already Registered").setDescription("You have already registered for this tryout.").setColor(RED_COLOR);
        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        return;
      }
      const modal = new ModalBuilder().setCustomId(`tryout_roblox_modal_${tryoutId}`).setTitle(tryout.language === "english" ? "Please insert your Roblox username" : "Bitte gib deinen Roblox-Benutzernamen ein");
      const robloxInput = new TextInputBuilder().setCustomId("roblox_username").setLabel(tryout.language === "english" ? "Roblox Username" : "Roblox Benutzername").setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(50).setPlaceholder(tryout.language === "english" ? "Enter your Roblox username" : "Gib deinen Roblox-Benutzernamen ein");
      const actionRow = new ActionRowBuilder().addComponents(robloxInput);
      modal.addComponents(actionRow);
      await interaction.showModal(modal);
      return;
    }
    if (customId.startsWith("confirm_tryout_")) {
      const parts = customId.split("_");
      const tryoutId = parseInt(parts[2]);
      const attendeeId = parts[3];
      const tryout = await storage.getTryoutByTryoutId(tryoutId);
      if (!tryout) {
        await interaction.reply({
          content: "This tryout session no longer exists.",
          ephemeral: true
        });
        return;
      }
      await storage.updateTryoutAttendee(attendeeId, { confirmed: true, confirmedAt: /* @__PURE__ */ new Date() });
      if (tryout.roleId && tryout.guildId) {
        try {
          const guild = await client?.guilds.fetch(tryout.guildId);
          const member = await guild?.members.fetch(interaction.user.id);
          if (member && tryout.roleId) {
            await member.roles.add(tryout.roleId);
          }
        } catch (error) {
          console.error("Error adding tryout role:", error);
        }
      }
      try {
        const logChannel = await client?.channels.fetch(TRYOUT_LOG_CHANNEL_ID);
        if (logChannel instanceof TextChannel) {
          const logEmbed = new EmbedBuilder().setTitle("Tryout Attendance Confirmed").setDescription(
            `**User:** ${interaction.user} (${interaction.user.username})
**Tryout ID:** ${tryoutId}
**Status:** Confirmed`
          ).setColor(GREEN_COLOR).setTimestamp();
          await logChannel.send({ embeds: [logEmbed] });
        }
      } catch (error) {
        console.error("Error logging confirmation:", error);
      }
      await interaction.reply({
        content: "You have confirmed your attendance! You have received the tryout role.",
        ephemeral: true
      });
      return;
    }
    if (customId.startsWith("tryout_winners_")) {
      const tryoutId = parseInt(customId.replace("tryout_winners_", ""));
      const tryout = await storage.getTryoutByTryoutId(tryoutId);
      if (!tryout) {
        await interaction.reply({ content: "Tryout not found.", ephemeral: true });
        return;
      }
      const attendees = await storage.getTryoutAttendees(tryout.id);
      if (attendees.length === 0) {
        await interaction.reply({ content: "No attendees found for this tryout.", ephemeral: true });
        return;
      }
      const options = attendees.map(
        (attendee, index) => new StringSelectMenuOptionBuilder().setLabel(`${index + 1}# ${attendee.robloxUsername}`).setDescription(`Discord: ${attendee.discordUsername}`).setValue(`${attendee.id}:${index + 1}`)
      );
      const selectMenu = new StringSelectMenuBuilder().setCustomId(`tryout_select_winners_${tryoutId}`).setPlaceholder("Select winners...").setMinValues(1).setMaxValues(Math.min(attendees.length, tryout.maxWinners || 3)).addOptions(options);
      const row = new ActionRowBuilder().addComponents(selectMenu);
      await interaction.reply({
        content: `Select the winners for Tryout ${tryoutId} (max ${tryout.maxWinners || 3} winners):`,
        components: [row],
        ephemeral: true
      });
      return;
    }
    if (customId.startsWith("tryout_end_")) {
      const tryoutId = customId.replace("tryout_end_", "");
      try {
        await interaction.message.delete();
        await interaction.reply({
          content: `Tryout ${tryoutId} attendees list has been deleted.`,
          ephemeral: true
        });
      } catch (error) {
        console.error("Error deleting tryout attendees message:", error);
        await interaction.reply({
          content: "Failed to delete the message.",
          ephemeral: true
        });
      }
      return;
    }
  } catch (error) {
    console.error("Error handling button:", error);
  }
}
async function handleStringSelectMenu(interaction) {
  const { customId } = interaction;
  try {
    if (customId.startsWith("tryout_select_winners_")) {
      const tryoutId = parseInt(customId.replace("tryout_select_winners_", ""));
      const selectedValues = interaction.values;
      const tryout = await storage.getTryoutByTryoutId(tryoutId);
      if (!tryout) {
        await interaction.reply({ content: "Tryout not found.", ephemeral: true });
        return;
      }
      const attendees = await storage.getTryoutAttendees(tryout.id);
      const winnerIds = new Set(selectedValues.map((v) => v.split(":")[0]));
      let winnerCount = 0;
      let loserCount = 0;
      for (const attendee of attendees) {
        const isWinner = winnerIds.has(attendee.id);
        const attendeeNumber = attendees.indexOf(attendee) + 1;
        try {
          const user = await client?.users.fetch(attendee.discordUserId);
          if (user) {
            if (isWinner) {
              const winnerEmbed = new EmbedBuilder().setDescription(
                `Congratulations tryout **${attendeeNumber}#** you won tryout **${tryoutId}** Please open a ticket for more information.`
              );
              await user.send({ embeds: [winnerEmbed] });
              winnerCount++;
            } else {
              const loserEmbed = new EmbedBuilder().setDescription(
                `Unfortunately you did not pass Tryout **${attendeeNumber}#** Thank you for participating.`
              );
              await user.send({ embeds: [loserEmbed] });
              loserCount++;
            }
          }
        } catch (error) {
          console.error(`Failed to DM user ${attendee.discordUsername}:`, error);
        }
      }
      await storage.updateTryout(tryout.id, { status: "completed" });
      try {
        const logChannel = await client?.channels.fetch(TRYOUT_LOG_CHANNEL_ID);
        if (logChannel instanceof TextChannel) {
          const winnerNames = attendees.filter((a) => winnerIds.has(a.id)).map((a, i) => `${attendees.indexOf(a) + 1}# ${a.robloxUsername}`).join(", ");
          const logEmbed = new EmbedBuilder().setTitle("Tryout Completed").setDescription(
            `**Tryout ID:** ${tryoutId}
**Winners:** ${winnerNames || "None"}
**Winners notified:** ${winnerCount}
**Non-winners notified:** ${loserCount}
**Completed by:** ${interaction.user}`
          ).setColor(GREEN_COLOR).setTimestamp();
          await logChannel.send({ embeds: [logEmbed] });
        }
      } catch (error) {
        console.error("Error logging tryout completion:", error);
      }
      await interaction.update({
        content: `Winners selected successfully! Notified ${winnerCount} winner(s) and ${loserCount} non-winner(s).`,
        components: []
      });
      return;
    }
  } catch (error) {
    console.error("Error handling select menu:", error);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ content: "An error occurred.", ephemeral: true });
    }
  }
}
async function handleModalSubmit(interaction) {
  const { customId } = interaction;
  try {
    if (customId === "appeal_modal") {
      const appealText = interaction.fields.getTextInputValue("appeal_reason");
      const appealNumber = await storage.getNextAppealNumber();
      const appealId = `APEL-${appealNumber}`;
      const activeBan = await storage.getActiveAppBan(interaction.user.id);
      if (!activeBan) {
        await interaction.reply({ content: "You do not have an active application ban to appeal.", ephemeral: true });
        return;
      }
      const pendingAppeals = await storage.getPendingAppeals(interaction.user.id);
      if (pendingAppeals.length > 0) {
        await interaction.reply({ content: "You already have a pending appeal.", ephemeral: true });
        return;
      }
      const appeal = await storage.createAppeal({
        appealId,
        discordUserId: interaction.user.id,
        discordUsername: interaction.user.username,
        appealText,
        status: "pending"
      });
      const appealChannel = await client?.channels.fetch(APPEAL_CHANNEL_ID);
      if (appealChannel instanceof TextChannel) {
        const appealEmbed = new EmbedBuilder().setTitle("Appeal").setDescription(
          `[${appealId}]

**User:** ${interaction.user} (${interaction.user.username})

**Appeal**: ${appealText}`
        );
        const buttons = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId(`appeal_accept_${appealId}`).setLabel("Accept").setStyle(ButtonStyle.Success),
          new ButtonBuilder().setCustomId(`appeal_deny_${appealId}`).setLabel("Deny").setStyle(ButtonStyle.Danger)
        );
        const message = await appealChannel.send({ embeds: [appealEmbed], components: [buttons] });
        await storage.updateAppeal(appealId, { messageId: message.id });
      }
      const dmEmbed = new EmbedBuilder().setTitle("Appeal Submitted").setDescription(
        `[${appealId}]

**Appeal**: ${appealText}`
      );
      await interaction.reply({ embeds: [dmEmbed], ephemeral: true });
      return;
    }
    if (customId.startsWith("deny_reason_modal_")) {
      const appealId = customId.replace("deny_reason_modal_", "");
      const denyReason = interaction.fields.getTextInputValue("deny_reason");
      const appeal = await storage.getAppeal(appealId);
      if (!appeal) {
        await interaction.reply({ content: "Appeal not found.", ephemeral: true });
        return;
      }
      if (appeal.status !== "pending") {
        await interaction.reply({ content: "This appeal has already been handled.", ephemeral: true });
        return;
      }
      await storage.updateAppeal(appealId, {
        status: "denied",
        denialReason: denyReason,
        handledBy: interaction.user.username,
        handledAt: /* @__PURE__ */ new Date()
      });
      try {
        const user = await client?.users.fetch(appeal.discordUserId);
        if (user) {
          const dmEmbed = new EmbedBuilder().setTitle("Appeal Denied").setDescription(
            `**${appealId}**

**Reason**: ${denyReason}`
          );
          await user.send({ embeds: [dmEmbed] });
        }
      } catch (error) {
        console.error("Could not send DM to user:", error);
      }
      if (appeal.messageId) {
        try {
          const appealChannel = await client?.channels.fetch(APPEAL_CHANNEL_ID);
          if (appealChannel instanceof TextChannel) {
            const message = await appealChannel.messages.fetch(appeal.messageId);
            const updatedEmbed = new EmbedBuilder().setTitle("Appeal").setDescription(
              `[${appealId}]

**Appeal**: ${appeal.appealText}

**Status**: Denied by ${interaction.user.username}
**Reason**: ${denyReason}`
            );
            await message.edit({ embeds: [updatedEmbed], components: [] });
          }
        } catch (error) {
          console.error("Error updating appeal message:", error);
        }
      }
      await interaction.reply({ content: `Appeal ${appealId} has been denied.`, ephemeral: true });
      return;
    }
    if (customId === "panic_alarm_modal") {
      const location = interaction.fields.getTextInputValue("panic_location");
      const medicNeeded = interaction.fields.getTextInputValue("panic_medic").toLowerCase();
      const medicText = medicNeeded === "yes" || medicNeeded === "ja" ? "Yes" : "No";
      const member = interaction.guild?.members.cache.get(interaction.user.id);
      const userNickname = member?.nickname || interaction.user.displayName || interaction.user.username;
      const panicEmbed = new EmbedBuilder().setTitle("9C Panic Alarm Activated").setDescription(
        `\u{1F1EC}\u{1F1E7} ${interaction.user} needs help on emergency hamburg, **read the following information:**
- Location: ${location}
- Medic: ${medicText}

\u{1F1E9}\u{1F1EA} ${interaction.user} braucht Hilfe bei einem Notfall in Hamburg, **lies die folgenden Informationen:**
- Standort: ${location}
- Sanit\xE4ter: ${medicText}`
      ).setColor(RED_COLOR).setFooter({ text: "9C Panic System" }).setTimestamp();
      try {
        const panicChannel = await client?.channels.fetch(PANIC_ALARM_CHANNEL_ID);
        if (panicChannel instanceof TextChannel) {
          const tempMessageId = Date.now().toString();
          const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`panic_enroute_${tempMessageId}`).setLabel("Enroute").setEmoji("\u{1F6A8}").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId(`panic_solved_${tempMessageId}`).setLabel("Solved").setEmoji("\u2705").setStyle(ButtonStyle.Success)
          );
          const sentMessage = await panicChannel.send({ embeds: [panicEmbed], components: [buttons] });
          const updatedButtons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`panic_enroute_${sentMessage.id}`).setLabel("Enroute").setEmoji("\u{1F6A8}").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId(`panic_solved_${sentMessage.id}`).setLabel("Solved").setEmoji("\u2705").setStyle(ButtonStyle.Success)
          );
          await sentMessage.edit({ embeds: [panicEmbed], components: [updatedButtons] });
          panicAlarmEnroute.set(sentMessage.id, /* @__PURE__ */ new Set());
          await interaction.reply({
            content: "Your panic alarm has been activated! Help is on the way.",
            ephemeral: true
          });
        } else {
          await interaction.reply({
            content: "Failed to send panic alarm. Channel not found.",
            ephemeral: true
          });
        }
      } catch (error) {
        console.error("Error sending panic alarm:", error);
        await interaction.reply({
          content: "Failed to send panic alarm.",
          ephemeral: true
        });
      }
      return;
    }
    if (customId === "medic_alarm_modal") {
      const location = interaction.fields.getTextInputValue("medic_location");
      const medicNeeded = interaction.fields.getTextInputValue("medic_details").toLowerCase();
      const medicText = medicNeeded === "yes" || medicNeeded === "ja" ? "Yes" : "No";
      const member = interaction.guild?.members.cache.get(interaction.user.id);
      const userNickname = member?.nickname || interaction.user.displayName || interaction.user.username;
      const medicEmbed = new EmbedBuilder().setTitle("9C Medic Alarm Activated").setDescription(
        `\u{1F1EC}\u{1F1E7} ${interaction.user} needs medical assistance on emergency hamburg, **read the following information:**
- Location: ${location}
- Medic: ${medicText}

\u{1F1E9}\u{1F1EA} ${interaction.user} braucht medizinische Hilfe bei einem Notfall in Hamburg, **lies die folgenden Informationen:**
- Standort: ${location}
- Sanit\xE4ter: ${medicText}`
      ).setColor(RED_COLOR).setFooter({ text: "9C Medic System" }).setTimestamp();
      try {
        const medicChannel = await client?.channels.fetch(MEDIC_ALARM_CHANNEL_ID);
        if (medicChannel instanceof TextChannel) {
          const tempMessageId = Date.now().toString();
          const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`medic_enroute_${tempMessageId}`).setLabel("Enroute").setEmoji("\u{1F6A8}").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId(`medic_solved_${tempMessageId}`).setLabel("Solved").setEmoji("\u2705").setStyle(ButtonStyle.Success)
          );
          const sentMessage = await medicChannel.send({ embeds: [medicEmbed], components: [buttons] });
          const updatedButtons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`medic_enroute_${sentMessage.id}`).setLabel("Enroute").setEmoji("\u{1F6A8}").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId(`medic_solved_${sentMessage.id}`).setLabel("Solved").setEmoji("\u2705").setStyle(ButtonStyle.Success)
          );
          await sentMessage.edit({ embeds: [medicEmbed], components: [updatedButtons] });
          medicAlarmEnroute.set(sentMessage.id, /* @__PURE__ */ new Set());
          await interaction.reply({
            content: "Your medic alarm has been activated! Help is on the way.",
            ephemeral: true
          });
        } else {
          await interaction.reply({
            content: "Failed to send medic alarm. Channel not found.",
            ephemeral: true
          });
        }
      } catch (error) {
        console.error("Error sending medic alarm:", error);
        await interaction.reply({
          content: "Failed to send medic alarm.",
          ephemeral: true
        });
      }
      return;
    }
    if (customId.startsWith("tryout_roblox_modal_")) {
      const tryoutId = customId.replace("tryout_roblox_modal_", "");
      const robloxUsername = interaction.fields.getTextInputValue("roblox_username");
      await interaction.deferReply({ ephemeral: true });
      try {
        const logChannel = await client?.channels.fetch(TRYOUT_LOG_CHANNEL_ID);
        if (logChannel instanceof TextChannel) {
          const logEmbed = new EmbedBuilder().setTitle("Tryout Username Submitted").setDescription(
            `**User:** ${interaction.user} (${interaction.user.username})
**Tryout ID:** ${tryoutId}
**Roblox Username:** ${robloxUsername}`
          ).setColor(8421504).setTimestamp();
          await logChannel.send({ embeds: [logEmbed] });
        }
      } catch (error) {
        console.error("Error logging tryout submission:", error);
      }
      const tryout = await storage.getTryoutByTryoutId(parseInt(tryoutId));
      if (!tryout) {
        await interaction.editReply({ content: "This tryout session no longer exists." });
        return;
      }
      if (tryout.currentPlayers >= tryout.maxPlayers) {
        await interaction.editReply({ content: "This tryout session is now full." });
        return;
      }
      const robloxData = await getRobloxUserWithInventoryCheck(robloxUsername);
      if (!robloxData) {
        const errorEmbed = new EmbedBuilder().setTitle("Roblox User Not Found").setDescription(`Could not find Roblox user "${robloxUsername}". Please check the username and try again.`).setColor(RED_COLOR);
        await interaction.editReply({ embeds: [errorEmbed] });
        return;
      }
      if (!robloxData.inventoryOpen) {
        const errorEmbed = new EmbedBuilder().setTitle("Security Check Failed").setDescription("Your inventory is closed, to attend you have to open it.").setColor(RED_COLOR);
        await interaction.editReply({ embeds: [errorEmbed] });
        return;
      }
      const attendee = await storage.addTryoutAttendee({
        tryoutId: tryout.id,
        discordUserId: interaction.user.id,
        discordUsername: interaction.user.username,
        robloxUserId: robloxData.user.id.toString(),
        robloxUsername: robloxData.user.name,
        confirmed: false
      });
      const newCount = tryout.currentPlayers + 1;
      await storage.updateTryout(tryout.id, { currentPlayers: newCount });
      await updatePersistentTryoutEmbed({
        tryoutId: tryout.tryoutId,
        language: tryout.language,
        timeDate: tryout.timeDate,
        scheduledAt: tryout.scheduledAt,
        hostDiscordId: tryout.hostDiscordId,
        maxPlayers: tryout.maxPlayers,
        currentPlayers: newCount,
        pictureUrl: tryout.pictureUrl
      });
      try {
        const user = await client?.users.fetch(interaction.user.id);
        if (user) {
          const dmEmbed = new EmbedBuilder().setTitle("Tryout Attendance Confirmation").setDescription(`Please confirm that you're attending by pressing the "Confirm" button below.`);
          const confirmButton = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`confirm_tryout_${tryout.tryoutId}_${attendee.id}`).setLabel("Confirm").setStyle(ButtonStyle.Success)
          );
          await user.send({ embeds: [dmEmbed], components: [confirmButton] });
        }
      } catch (error) {
        console.error("Could not send DM to user:", error);
      }
      const successEmbed = new EmbedBuilder().setTitle("Attended Successfully").setDescription("You have successfully attended.").setColor(GREEN_COLOR);
      await interaction.editReply({ embeds: [successEmbed] });
      return;
    }
  } catch (error) {
    console.error("Error handling modal submit:", error);
    await interaction.reply({ content: "An error occurred while processing your submission.", ephemeral: true });
  }
}
async function checkAndSendTryoutReconfirmations() {
  console.log("Checking for tryouts needing reconfirmation...");
  const now = /* @__PURE__ */ new Date();
  const thirtyMinFromNow = new Date(now.getTime() + THIRTY_MINUTES_MS);
  const tryoutsNeedingConfirmation = await storage.getTryoutsNeedingConfirmation(thirtyMinFromNow);
  for (const tryout of tryoutsNeedingConfirmation) {
    try {
      const attendees = await storage.getTryoutAttendees(tryout.id);
      const attendeeData = attendees.map((a) => ({
        discordUserId: a.discordUserId,
        discordUsername: a.discordUsername,
        robloxUsername: a.robloxUsername,
        robloxUserId: a.robloxUserId
      }));
      if (tryout.guildId && tryout.roleId && client) {
        const guild = await client.guilds.fetch(tryout.guildId);
        for (const attendee of attendees) {
          try {
            const member = await guild.members.fetch(attendee.discordUserId);
            if (member) {
              await member.roles.remove(tryout.roleId);
            }
          } catch (error) {
            console.error(`Error removing role from ${attendee.discordUserId}:`, error);
          }
        }
      }
      await storage.clearTryoutAttendees(tryout.id);
      await storage.updateTryout(tryout.id, {
        currentPlayers: 0,
        confirmationSent: true,
        status: "confirming"
      });
      for (const attendeeInfo of attendeeData) {
        try {
          const user = await client?.users.fetch(attendeeInfo.discordUserId);
          if (user) {
            const dmEmbed = new EmbedBuilder().setTitle("Tryout Reconfirmation Required").setDescription(
              `The tryout session is starting in 30 minutes!

**Time:** ${tryout.timeDate}
**Your Roblox Username:** ${attendeeInfo.robloxUsername}

Your spot has been reset. Please click the **Attend Tryout** button on the original tryout message to reconfirm your attendance.

If you do not reconfirm, your spot may be given to someone else.`
            ).setColor(16766720);
            await user.send({ embeds: [dmEmbed] });
          }
        } catch (error) {
          console.error(`Error sending reconfirmation DM to ${attendeeInfo.discordUserId}:`, error);
        }
      }
      await updatePersistentTryoutEmbed({
        tryoutId: tryout.tryoutId,
        language: tryout.language,
        timeDate: tryout.timeDate,
        scheduledAt: tryout.scheduledAt,
        hostDiscordId: tryout.hostDiscordId,
        maxPlayers: tryout.maxPlayers,
        currentPlayers: 0,
        pictureUrl: tryout.pictureUrl
      });
      if (client) {
        try {
          const logChannel = await client.channels.fetch(TRYOUT_LOG_CHANNEL_ID);
          if (logChannel instanceof TextChannel) {
            const logEmbed = new EmbedBuilder().setTitle("Tryout Reconfirmation Reset").setDescription(
              `**Tryout ID:** ${tryout.tryoutId}
**Time:** ${tryout.timeDate}
**Host:** ${tryout.hostUsername}
**Previous Attendees Notified:** ${attendeeData.length}
**Slots Reset To:** ${tryout.maxPlayers}/${tryout.maxPlayers}

All attendees have been removed and notified to reconfirm their attendance.`
            ).setColor(16766720).setTimestamp();
            await logChannel.send({ embeds: [logEmbed] });
          }
        } catch (error) {
          console.error("Error logging reconfirmation:", error);
        }
      }
      console.log(`Sent reconfirmation for tryout ${tryout.tryoutId} to ${attendeeData.length} attendees`);
    } catch (error) {
      console.error(`Error processing tryout ${tryout.tryoutId} for reconfirmation:`, error);
    }
  }
}
async function checkAndCreateTryoutChannels() {
  console.log("Checking for tryouts starting now...");
  const tryoutsStarting = await storage.getTryoutsStartingNow();
  for (const tryout of tryoutsStarting) {
    try {
      if (!tryout.tryoutChannelId && tryout.guildId && client) {
        const guild = await client.guilds.fetch(tryout.guildId);
        const channelName = `tryout-${tryout.tryoutId}`;
        const tryoutChannel = await guild.channels.create({
          name: channelName,
          type: ChannelType.GuildText,
          reason: `Tryout session ${tryout.tryoutId} starting`
        });
        await storage.updateTryout(tryout.id, {
          tryoutChannelId: tryoutChannel.id,
          status: "started"
        });
        await updatePersistentTryoutEmbed(null);
        const attendees = await storage.getTryoutAttendees(tryout.id);
        const serverCode = tryout.serverCode || "N/A";
        const maxWinners = tryout.maxWinners || 3;
        const languageFlag = tryout.language === "english" ? ":flag_gb:" : ":flag_de:";
        const languageText = tryout.language === "english" ? "EN" : "DE";
        const YELLOW_COLOR = 16766720;
        const tryoutInfoText = `# Tryout Informations
**Tryout ID:** ${tryout.tryoutId}
**Language:** ${languageFlag} (${languageText})
**Host:** <@${tryout.hostDiscordId}>`;
        const readBeforeJoiningText = `# Read Before Joining

Upon joining the server, you must purchase the following as a criminal:
\u2022    G36
\u2022    Sniper rifle (if available)
\u2022    Any consumables (energy drinks, cookies, apples, juice)

**You must not shoot anyone during this preparation phase.**

Once you have purchased the required equipment, proceed to the Meeting Point shown on the map below.
Park in one of the designated parking spots and wait for instructions from the host.

When instructed to move to the combat zone, choose an appropriate starting position and wait until the host says "GO".
\u2022    Combat is ONLY allowed inside the designated combat zone
\u2022    Leaving the zone at any time is strictly prohibited
\u2022    A dealer will be available inside the zone.

**Desqualification Rules:**
> \u2022 Hiding for the entire combat phase will result in removal
> \u2022 Leaving the combat zone will result in removal
> \u2022 If you die, you fail the trial and will be removed
> \u2022 The bot will send results once the trial has ended

When the number of remaining participants becomes low, a host will announce "STOP".
You must immediately cease all combat or risk removal from the event.

Follow all host instructions and maintain respectful behavior throughout the event.
Toxic behavior or failure to comply with the rules will result in immediate removal.

When there is ${maxWinners} or less players the host will tell you to STOP. You must stop fighting immediately or risk removal from the event.

**Server Code:** ${serverCode}
Do not share this code.
Sharing the server code will result in a permanent ban from 9C for both you and any unauthorized participants.`;
        let successCount = 0;
        let failCount = 0;
        for (const attendee of attendees) {
          try {
            const user = await client?.users.fetch(attendee.discordUserId);
            if (user) {
              const components = [
                {
                  type: ComponentType.Container,
                  accent_color: YELLOW_COLOR,
                  components: [
                    {
                      type: ComponentType.TextDisplay,
                      content: tryoutInfoText
                    }
                  ]
                },
                {
                  type: ComponentType.Container,
                  accent_color: YELLOW_COLOR,
                  components: [
                    {
                      type: ComponentType.MediaGallery,
                      items: [{
                        media: {
                          url: TRYOUT_MAP_IMAGE
                        }
                      }]
                    },
                    {
                      type: ComponentType.TextDisplay,
                      content: readBeforeJoiningText
                    }
                  ]
                }
              ];
              await user.send({
                components,
                flags: MessageFlags.IsComponentsV2
              });
              successCount++;
            }
          } catch (error) {
            console.error(`Could not send tryout start DM to ${attendee.discordUsername}:`, error);
            failCount++;
          }
        }
        const notificationEmbed = new EmbedBuilder().setTitle("Tryout Starting Now!").setDescription(
          `All Information will be here. Please check your DMs for important information.

**Time:** ${tryout.timeDate}
**Host:** <@${tryout.hostDiscordId}>
**Max Winners:** ${maxWinners}

**Attendees notified:** ${successCount}
**Failed to notify:** ${failCount}`
        ).setColor(16766720);
        if (tryout.pictureUrl) {
          notificationEmbed.setImage(tryout.pictureUrl);
        }
        await tryoutChannel.send({
          content: `<@&${TRYOUT_PING_ROLE_ID}>`,
          embeds: [notificationEmbed]
        });
        try {
          const attendeesChannel = await client.channels.fetch(TRYOUT_ATTENDEES_CHANNEL_ID);
          if (attendeesChannel instanceof TextChannel) {
            const attendeesList = attendees.map(
              (attendee, index) => `${index + 1}# ${attendee.robloxUsername} (${attendee.discordUsername})`
            ).join("\n");
            const attendeesText = `# TRYOUT (${tryout.tryoutId}) ATTENDEES

${attendeesList || "No attendees"}`;
            const attendeesComponents = [
              {
                type: ComponentType.Container,
                components: [
                  {
                    type: ComponentType.TextDisplay,
                    content: attendeesText
                  },
                  {
                    type: ComponentType.ActionRow,
                    components: [
                      {
                        type: ComponentType.Button,
                        style: APIButtonStyle.Success,
                        label: "Winners",
                        custom_id: `tryout_winners_${tryout.tryoutId}`
                      },
                      {
                        type: ComponentType.Button,
                        style: APIButtonStyle.Danger,
                        label: "End",
                        custom_id: `tryout_end_${tryout.tryoutId}`
                      }
                    ]
                  }
                ]
              }
            ];
            await attendeesChannel.send({
              components: attendeesComponents,
              flags: MessageFlags.IsComponentsV2
            });
            console.log(`Sent attendees list for tryout ${tryout.tryoutId} to attendees channel`);
          }
        } catch (error) {
          console.error(`Error sending attendees list for tryout ${tryout.tryoutId}:`, error);
        }
        console.log(`Created tryout channel ${channelName} for tryout ${tryout.tryoutId}, notified ${successCount} attendees`);
      }
    } catch (error) {
      console.error(`Error creating tryout channel for ${tryout.tryoutId}:`, error);
    }
  }
}
async function checkAndDoubleBounties() {
  console.log("Checking for bounties to double...");
  const now = /* @__PURE__ */ new Date();
  const bountiesToDouble = await storage.getBountiesToDouble(now);
  for (const bounty of bountiesToDouble) {
    const previousReward = bounty.currentReward;
    const newReward = doubleReward(bounty.currentReward);
    const nextDoubleAt = new Date(Date.now() + TWO_WEEKS_MS);
    const newDoublingCount = bounty.doublingCount + 1;
    await storage.updateBounty(bounty.id, {
      currentReward: newReward,
      doublingCount: newDoublingCount,
      lastDoubledAt: now,
      nextDoubleAt
    });
    if (bounty.messageId && client) {
      try {
        const channel = await client.channels.fetch(bounty.channelId);
        if (channel instanceof TextChannel) {
          const message = await channel.messages.fetch(bounty.messageId);
          const updatedEmbed = createBountyEmbed(
            bounty.robloxUsername,
            newReward,
            bounty.robloxAvatarUrl,
            nextDoubleAt
          );
          await message.edit({ embeds: [updatedEmbed] });
          const notificationEmbed = createRewardDoubledEmbed(
            bounty.robloxUsername,
            previousReward,
            newReward,
            bounty.robloxAvatarUrl,
            newDoublingCount
          );
          await channel.send({ embeds: [notificationEmbed] });
          console.log(`Doubled bounty for ${bounty.robloxUsername}: ${previousReward} -> ${newReward}`);
        }
      } catch (error) {
        console.error(`Error updating bounty message for ${bounty.robloxUsername}:`, error);
      }
    }
  }
}
async function startBot() {
  const token = process.env.BOT_TOKEN || process.env.DISCORD_BOT_TOKEN;
  if (!token) {
    console.error("BOT_TOKEN is not set. Bot will not start.");
    return null;
  }
  client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildMembers
    ]
  });
  client.once("ready", async () => {
    console.log(`Discord bot logged in as ${client?.user?.tag}`);
    if (client?.user?.id) {
      await registerCommands(client.user.id, token);
    }
    cron.schedule("0 * * * *", () => {
      checkAndDoubleBounties();
      checkAndExpireBans();
    });
    cron.schedule("* * * * *", () => {
      checkAndSendTryoutReconfirmations();
      checkAndCreateTryoutChannels();
    });
    await checkAndDoubleBounties();
    await checkAndExpireBans();
    await checkAndSendTryoutReconfirmations();
    await initializePersistentTryoutEmbed();
  });
  client.on("interactionCreate", async (interaction) => {
    if (interaction.isButton()) {
      await handleButtonInteraction(interaction);
      return;
    }
    if (interaction.isStringSelectMenu()) {
      await handleStringSelectMenu(interaction);
      return;
    }
    if (interaction.isModalSubmit()) {
      await handleModalSubmit(interaction);
      return;
    }
    if (interaction.isAutocomplete()) {
      await handleAutocomplete(interaction);
      return;
    }
    if (!interaction.isChatInputCommand()) return;
    const { commandName } = interaction;
    try {
      if (commandName === "points") {
        const subcommand = interaction.options.getSubcommand();
        switch (subcommand) {
          case "add":
            await handlePointsAdd(interaction);
            break;
          case "bulk-add":
            await handlePointsBulkAdd(interaction);
            break;
          case "bulk-remove":
            await handlePointsBulkRemove(interaction);
            break;
        }
        return;
      }
      if (commandName === "test") {
        const subcommand = interaction.options.getSubcommand();
        if (subcommand === "info") {
          await handleTestInfo(interaction);
        }
        return;
      }
      if (commandName === "panic") {
        const subcommand = interaction.options.getSubcommand();
        if (subcommand === "alarm") {
          await handlePanicAlarm(interaction);
        }
        return;
      }
      if (commandName === "medic") {
        const subcommand = interaction.options.getSubcommand();
        if (subcommand === "alarm") {
          await handleMedicAlarm(interaction);
        }
        return;
      }
      switch (commandName) {
        case "bounty-add":
          await handleBountyAdd(interaction);
          break;
        case "bounty-claim":
          await handleBountyClaim(interaction);
          break;
        case "bounty-list":
          await handleBountyList(interaction);
          break;
        case "bounty-remove":
          await handleBountyRemove(interaction);
          break;
        case "profile":
          await handleProfile(interaction);
          break;
        case "appban":
          await handleAppBan(interaction);
          break;
        case "appban-remove":
          await handleAppBanRemove(interaction);
          break;
        case "appban-history":
          await handleAppBanHistory(interaction);
          break;
        case "application-log":
          await handleApplicationLog(interaction);
          break;
        case "setup-application-status":
          await handleSetupApplicationStatus(interaction);
          break;
        case "setup-public-rules":
          await handleSetupPublicRules(interaction);
          break;
        case "tryout":
          await handleTryout(interaction);
          break;
        case "tryout-cancel":
          await handleTryoutCancel(interaction);
          break;
      }
    } catch (error) {
      console.error(`Error handling command ${commandName}:`, error);
      const errorEmbed = createErrorEmbed("An error occurred while processing your command.");
      if (interaction.deferred) {
        await interaction.editReply({ embeds: [errorEmbed] });
      } else {
        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      }
    }
  });
  await client.login(token);
  return client;
}
function getClient() {
  return client;
}
var app = express();
var PORT = process.env.PORT || 5e3;
app.get("/", (req, res) => {
  res.json({ status: "ok", bot: client ? "running" : "starting" });
});
app.get("/health", (req, res) => {
  res.json({ status: "ok", bot: client ? "running" : "starting" });
});
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Health check server running on port ${PORT}`);
});
startBot().then(() => {
  console.log("Bot startup initiated");
}).catch((error) => {
  console.error("Failed to start bot:", error);
  process.exit(1);
});
export {
  getClient,
  startBot
};
