import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Bounty table for tracking bounties
export const bounties = pgTable("bounties", {
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
  claimedBy: text("claimed_by"),
});

export const insertBountySchema = createInsertSchema(bounties).omit({
  id: true,
  createdAt: true,
});

export type InsertBounty = z.infer<typeof insertBountySchema>;
export type Bounty = typeof bounties.$inferSelect;

// User points (CP) tracking table
export const userPoints = pgTable("user_points", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  discordUserId: text("discord_user_id").notNull().unique(),
  discordUsername: text("discord_username"),
  totalPoints: integer("total_points").notNull().default(0),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertUserPointsSchema = createInsertSchema(userPoints).omit({
  id: true,
  updatedAt: true,
});

export type InsertUserPoints = z.infer<typeof insertUserPointsSchema>;
export type UserPoints = typeof userPoints.$inferSelect;

// Points transaction history
export const pointsTransactions = pgTable("points_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  discordUserId: text("discord_user_id").notNull(),
  amount: integer("amount").notNull(),
  reason: text("reason"),
  givenBy: text("given_by"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPointsTransactionSchema = createInsertSchema(pointsTransactions).omit({
  id: true,
  createdAt: true,
});

export type InsertPointsTransaction = z.infer<typeof insertPointsTransactionSchema>;
export type PointsTransaction = typeof pointsTransactions.$inferSelect;

// Application bans table
export const appBans = pgTable("app_bans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  discordUserId: text("discord_user_id").notNull(),
  discordUsername: text("discord_username"),
  reason: text("reason").notNull(),
  duration: text("duration").notNull(), // "1_week", "2_weeks", "permanent"
  bannedBy: text("banned_by").notNull(),
  bannedAt: timestamp("banned_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").notNull().default(true),
  removedBy: text("removed_by"),
  removedAt: timestamp("removed_at"),
});

export const insertAppBanSchema = createInsertSchema(appBans).omit({
  id: true,
  bannedAt: true,
  removedBy: true,
  removedAt: true,
});

export type InsertAppBan = z.infer<typeof insertAppBanSchema>;
export type AppBan = typeof appBans.$inferSelect;

// Application test logs
export const applicationLogs = pgTable("application_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  discordUserId: text("discord_user_id").notNull(),
  discordUsername: text("discord_username"),
  testType: text("test_type").notNull(), // "entry_test", "final_test"
  result: text("result").notNull(), // "passed", "failed", "incompleted"
  loggedBy: text("logged_by").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertApplicationLogSchema = createInsertSchema(applicationLogs).omit({
  id: true,
  createdAt: true,
});

export type InsertApplicationLog = z.infer<typeof insertApplicationLogSchema>;
export type ApplicationLog = typeof applicationLogs.$inferSelect;

// Appeals table for app ban appeals
export const appeals = pgTable("appeals", {
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
  handledAt: timestamp("handled_at"),
});

export const insertAppealSchema = createInsertSchema(appeals).omit({
  id: true,
  createdAt: true,
  handledAt: true,
});

export type InsertAppeal = z.infer<typeof insertAppealSchema>;
export type Appeal = typeof appeals.$inferSelect;

// Tryouts table
export const tryouts = pgTable("tryouts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tryoutId: integer("tryout_id").notNull().unique(),
  maxPlayers: integer("max_players").notNull(),
  currentPlayers: integer("current_players").notNull().default(0),
  maxWinners: integer("max_winners").notNull().default(3),
  serverCode: text("server_code"),
  language: text("language").notNull(), // "english" or "german"
  timeDate: text("time_date").notNull(), // Display string like "Tuesday, 23 December 2025 19:00"
  scheduledAt: timestamp("scheduled_at").notNull(),
  hostDiscordId: text("host_discord_id").notNull(),
  hostUsername: text("host_username").notNull(),
  pictureUrl: text("picture_url"),
  messageId: text("message_id"),
  channelId: text("channel_id"),
  guildId: text("guild_id"),
  roleId: text("role_id"),
  tryoutChannelId: text("tryout_channel_id"),
  status: text("status").notNull().default("pending"), // "pending", "confirming", "active", "completed", "cancelled"
  confirmationSent: boolean("confirmation_sent").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTryoutSchema = createInsertSchema(tryouts).omit({
  id: true,
  createdAt: true,
});

export type InsertTryout = z.infer<typeof insertTryoutSchema>;
export type Tryout = typeof tryouts.$inferSelect;

// Tryout attendees table
export const tryoutAttendees = pgTable("tryout_attendees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tryoutId: varchar("tryout_id").notNull(),
  discordUserId: text("discord_user_id").notNull(),
  discordUsername: text("discord_username"),
  robloxUsername: text("roblox_username").notNull(),
  robloxUserId: text("roblox_user_id").notNull(),
  confirmed: boolean("confirmed").notNull().default(false),
  confirmationMessageId: text("confirmation_message_id"),
  attendedAt: timestamp("attended_at").notNull().defaultNow(),
  confirmedAt: timestamp("confirmed_at"),
});

export const insertTryoutAttendeeSchema = createInsertSchema(tryoutAttendees).omit({
  id: true,
  attendedAt: true,
  confirmedAt: true,
});

export type InsertTryoutAttendee = z.infer<typeof insertTryoutAttendeeSchema>;
export type TryoutAttendee = typeof tryoutAttendees.$inferSelect;

// Bot settings table for persistent data like message IDs
export const botSettings = pgTable("bot_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type BotSetting = typeof botSettings.$inferSelect;
