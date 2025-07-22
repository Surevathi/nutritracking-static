var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// shared/achievement-system.ts
var ACHIEVEMENT_DEFINITIONS;
var init_achievement_system = __esm({
  "shared/achievement-system.ts"() {
    ACHIEVEMENT_DEFINITIONS = [
      // Vitamin Achievements
      {
        id: "vitamin_champion",
        name: "Vitamin Champion",
        description: "Reach optimal levels for all 13 essential vitamins",
        icon: "\u{1F3C6}",
        category: "vitamin",
        requirements: { type: "target_reached", percentage: 100 },
        rarity: "legendary",
        points: 500
      },
      {
        id: "vitamin_d_master",
        name: "Sunshine Warrior",
        description: "Maintain optimal Vitamin D levels for 7 consecutive days",
        icon: "\u2600\uFE0F",
        category: "vitamin",
        requirements: { type: "streak", nutrient: "vitamin_d", days: 7, percentage: 80 },
        rarity: "epic",
        points: 200
      },
      {
        id: "b_vitamin_boost",
        name: "Energy Booster",
        description: "Achieve optimal B-vitamin complex levels",
        icon: "\u26A1",
        category: "vitamin",
        requirements: { type: "target_reached", percentage: 90 },
        rarity: "rare",
        points: 150
      },
      {
        id: "vitamin_c_defender",
        name: "Immune Defender",
        description: "Reach 100% Vitamin C target for 5 consecutive days",
        icon: "\u{1F6E1}\uFE0F",
        category: "vitamin",
        requirements: { type: "streak", nutrient: "vitamin_c", days: 5, percentage: 100 },
        rarity: "rare",
        points: 120
      },
      // Mineral Achievements
      {
        id: "mineral_master",
        name: "Mineral Master",
        description: "Achieve optimal levels for all essential minerals",
        icon: "\u{1F48E}",
        category: "mineral",
        requirements: { type: "target_reached", percentage: 100 },
        rarity: "legendary",
        points: 500
      },
      {
        id: "calcium_builder",
        name: "Bone Builder",
        description: "Maintain optimal calcium levels for 7 days",
        icon: "\u{1F9B4}",
        category: "mineral",
        requirements: { type: "streak", nutrient: "calcium", days: 7, percentage: 80 },
        rarity: "epic",
        points: 180
      },
      {
        id: "iron_warrior",
        name: "Iron Warrior",
        description: "Achieve optimal iron levels consistently",
        icon: "\u2694\uFE0F",
        category: "mineral",
        requirements: { type: "consistency", nutrient: "iron", days: 5, percentage: 85 },
        rarity: "rare",
        points: 140
      },
      {
        id: "zinc_guardian",
        name: "Immunity Guardian",
        description: "Maintain optimal zinc levels for immune support",
        icon: "\u{1F6E1}\uFE0F",
        category: "mineral",
        requirements: { type: "streak", nutrient: "zinc", days: 7, percentage: 80 },
        rarity: "rare",
        points: 130
      },
      // Macro Achievements
      {
        id: "macro_balance",
        name: "Perfect Balance",
        description: "Achieve ideal macronutrient ratios for 7 days",
        icon: "\u2696\uFE0F",
        category: "macro",
        requirements: { type: "consistency", days: 7, percentage: 90 },
        rarity: "epic",
        points: 250
      },
      {
        id: "protein_power",
        name: "Protein Powerhouse",
        description: "Meet protein targets consistently for a week",
        icon: "\u{1F4AA}",
        category: "macro",
        requirements: { type: "streak", nutrient: "protein", days: 7, percentage: 85 },
        rarity: "rare",
        points: 160
      },
      // Milestone Achievements
      {
        id: "nutrition_newbie",
        name: "Nutrition Newbie",
        description: "Complete your first day of food logging",
        icon: "\u{1F331}",
        category: "milestone",
        requirements: { type: "target_reached", days: 1 },
        rarity: "common",
        points: 50
      },
      {
        id: "week_warrior",
        name: "Week Warrior",
        description: "Log meals consistently for 7 days",
        icon: "\u{1F4C5}",
        category: "milestone",
        requirements: { type: "consistency", days: 7 },
        rarity: "rare",
        points: 200
      },
      {
        id: "month_master",
        name: "Monthly Master",
        description: "Complete 30 days of consistent nutrition tracking",
        icon: "\u{1F4CA}",
        category: "milestone",
        requirements: { type: "consistency", days: 30 },
        rarity: "epic",
        points: 500
      },
      // Streak Achievements
      {
        id: "streak_starter",
        name: "Streak Starter",
        description: "Maintain a 3-day nutrition streak",
        icon: "\u{1F525}",
        category: "streak",
        requirements: { type: "streak", days: 3 },
        rarity: "common",
        points: 75
      },
      {
        id: "consistency_king",
        name: "Consistency King",
        description: "Achieve a 14-day perfect nutrition streak",
        icon: "\u{1F451}",
        category: "streak",
        requirements: { type: "streak", days: 14 },
        rarity: "epic",
        points: 300
      },
      {
        id: "nutrition_legend",
        name: "Nutrition Legend",
        description: "Maintain a 30-day perfect streak",
        icon: "\u{1F31F}",
        category: "streak",
        requirements: { type: "streak", days: 30 },
        rarity: "legendary",
        points: 1e3
      }
    ];
  }
});

// shared/achievement-logic.ts
var achievement_logic_exports = {};
__export(achievement_logic_exports, {
  AchievementEngine: () => AchievementEngine,
  calculateUserStatsFromData: () => calculateUserStatsFromData
});
function calculateUserStatsFromData(vitaminStatus, mineralStatus, foodLogs2, userProgress2) {
  const vitaminsSufficient = Object.values(vitaminStatus || {}).filter((v) => v?.status === "sufficient" || v?.percentage >= 100).length;
  const mineralsSufficient = Object.values(mineralStatus || {}).filter((m) => m?.status === "sufficient" || m?.percentage >= 100).length;
  const consecutiveDays = userProgress2?.currentStreak || 0;
  const totalFoodEntries = foodLogs2?.length || 0;
  const today = /* @__PURE__ */ new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  const thisWeekLogs = foodLogs2?.filter((log2) => {
    const logDate = new Date(log2.loggedAt || log2.createdAt);
    return logDate >= weekStart;
  }) || [];
  const uniqueDaysThisWeek = new Set(
    thisWeekLogs.map((log2) => {
      const logDate = new Date(log2.loggedAt || log2.createdAt);
      return logDate.toDateString();
    })
  ).size;
  return {
    consecutiveDays,
    vitaminsSufficient,
    mineralsSufficient,
    totalFoodEntries,
    weeklyConsistency: uniqueDaysThisWeek
  };
}
var AchievementEngine;
var init_achievement_logic = __esm({
  "shared/achievement-logic.ts"() {
    init_achievement_system();
    AchievementEngine = class {
      static checkUserAchievements(userStats, currentProgress, existingAchievements) {
        const results = [];
        const unlockedIds = new Set(existingAchievements.map((a) => a.achievementId));
        for (const achievement of ACHIEVEMENT_DEFINITIONS) {
          const isUnlocked = unlockedIds.has(achievement.id);
          const progress = this.calculateAchievementProgress(achievement.id, userStats, currentProgress);
          results.push({
            achievementId: achievement.id,
            unlocked: isUnlocked || progress >= 100,
            progress: Math.min(progress, 100)
          });
        }
        return results;
      }
      static calculateAchievementProgress(achievementId, userStats, currentProgress) {
        switch (achievementId) {
          case "first_log":
            return userStats.totalFoodEntries > 0 ? 100 : 0;
          case "week_warrior":
            return Math.min(userStats.consecutiveDays / 7 * 100, 100);
          case "consistency_champion":
            return Math.min(userStats.consecutiveDays / 30 * 100, 100);
          case "vitamin_master":
            return Math.min(userStats.vitaminsSufficient / 13 * 100, 100);
          // 13 essential vitamins
          case "mineral_expert":
            return Math.min(userStats.mineralsSufficient / 10 * 100, 100);
          // 10 essential minerals
          case "balanced_nutrition":
            const vitaminProgress = userStats.vitaminsSufficient / 13;
            const mineralProgress = userStats.mineralsSufficient / 10;
            return Math.min((vitaminProgress + mineralProgress) / 2 * 100, 100);
          case "nutrition_scholar":
            return Math.min(userStats.totalFoodEntries / 100 * 100, 100);
          case "wellness_pioneer":
            const totalNutrients = userStats.vitaminsSufficient + userStats.mineralsSufficient;
            return Math.min(totalNutrients / 23 * 100, 100);
          // All vitamins + minerals
          case "streak_legend":
            return Math.min(userStats.consecutiveDays / 100 * 100, 100);
          case "perfect_week":
            return userStats.weeklyConsistency >= 7 ? 100 : userStats.weeklyConsistency / 7 * 100;
          default:
            return 0;
        }
      }
      static calculateUserLevel(totalPoints) {
        if (totalPoints < 1e3) {
          return Math.floor(totalPoints / 100) + 1;
        } else {
          return Math.floor((totalPoints - 1e3) / 200) + 11;
        }
      }
      static calculatePointsForNextLevel(currentLevel) {
        if (currentLevel <= 10) {
          return currentLevel * 100;
        } else {
          return 1e3 + (currentLevel - 10) * 200;
        }
      }
      static awardPointsForAchievement(achievementId) {
        const achievement = ACHIEVEMENT_DEFINITIONS.find((a) => a.id === achievementId);
        switch (achievement?.category) {
          case "consistency":
            return 25;
          case "nutrition":
            return 50;
          case "milestone":
            return 100;
          default:
            return 10;
        }
      }
      static calculateStreakPoints(consecutiveDays) {
        if (consecutiveDays >= 100) return 200;
        if (consecutiveDays >= 30) return 100;
        if (consecutiveDays >= 7) return 50;
        if (consecutiveDays >= 3) return 20;
        return 10;
      }
      static generateProgressSummary(userStats, currentProgress) {
        const level = this.calculateUserLevel(currentProgress?.totalPoints || 0);
        const streak = userStats.consecutiveDays;
        let summary = `Level ${level} Nutrition Tracker`;
        if (streak > 0) {
          summary += ` \u2022 ${streak} day${streak === 1 ? "" : "s"} streak`;
        }
        if (userStats.vitaminsSufficient > 0 || userStats.mineralsSufficient > 0) {
          summary += ` \u2022 ${userStats.vitaminsSufficient + userStats.mineralsSufficient} nutrients on track`;
        }
        return summary;
      }
    };
  }
});

// server/index.ts
import express2 from "express";
import cookieParser from "cookie-parser";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  MINERALS: () => MINERALS,
  VITAMINS: () => VITAMINS,
  contactMessages: () => contactMessages,
  dashboardSnapshots: () => dashboardSnapshots,
  foodLogs: () => foodLogs,
  foods: () => foods,
  forgotPasswordSchema: () => forgotPasswordSchema,
  insertContactMessageSchema: () => insertContactMessageSchema,
  insertDashboardSnapshotSchema: () => insertDashboardSnapshotSchema,
  insertFoodLogSchema: () => insertFoodLogSchema,
  insertFoodSchema: () => insertFoodSchema,
  insertMacroStatusSchema: () => insertMacroStatusSchema,
  insertSharedMealSchema: () => insertSharedMealSchema,
  insertSharedProgressSchema: () => insertSharedProgressSchema,
  insertSocialCommentSchema: () => insertSocialCommentSchema,
  insertSocialLikeSchema: () => insertSocialLikeSchema,
  insertSymptomSchema: () => insertSymptomSchema,
  insertUserAchievementSchema: () => insertUserAchievementSchema,
  insertUserConnectionSchema: () => insertUserConnectionSchema,
  insertUserProgressSchema: () => insertUserProgressSchema,
  insertUserSchema: () => insertUserSchema,
  loginSchema: () => loginSchema,
  registerSchema: () => registerSchema,
  resetPasswordSchema: () => resetPasswordSchema,
  sharedMeals: () => sharedMeals,
  sharedProgress: () => sharedProgress,
  socialComments: () => socialComments,
  socialLikes: () => socialLikes,
  symptoms: () => symptoms,
  userAchievements: () => userAchievements,
  userConnections: () => userConnections,
  userMacroStatus: () => userMacroStatus,
  userProgress: () => userProgress,
  userVitaminStatus: () => userVitaminStatus,
  users: () => users
});
import { pgTable, text, serial, integer, decimal, timestamp, json, index, varchar, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  hashedPassword: text("password"),
  // Made nullable for Supabase auth users
  age: integer("age").notNull(),
  gender: text("gender").notNull(),
  // 'male', 'female', 'other'
  height: decimal("height", { precision: 5, scale: 2 }),
  // in cm
  weight: decimal("weight", { precision: 5, scale: 2 }),
  // in kg
  activityLevel: text("activity_level").default("moderately_active"),
  // 'sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active'
  dietaryPreferences: text("dietary_preferences").array().default([]),
  // ['vegetarian', 'vegan', 'gluten-free']
  healthGoals: text("health_goals").array().default([]),
  // ['boost_immunity', 'skin_glow', 'energy_boost', 'hair_health']
  country: text("country"),
  // ISO country code for location-based nutrition
  preferredNutritionSource: text("preferred_nutrition_source"),
  // User's preferred primary source
  dataRetentionDays: integer("data_retention_days").default(365),
  // How many days to keep food logs (30, 90, 180, 365, -1 for unlimited)
  resetToken: text("reset_token"),
  resetTokenExpiry: timestamp("reset_token_expiry"),
  createdAt: timestamp("created_at").defaultNow()
});
var foods = pgTable("foods", {
  id: serial("id").primaryKey(),
  usdaId: text("usda_id").unique(),
  name: text("name").notNull(),
  description: text("description"),
  nutrients: json("nutrients").$type().notNull(),
  // vitamin/mineral content per 100g
  category: text("category"),
  createdAt: timestamp("created_at").defaultNow()
});
var foodLogs = pgTable("food_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  foodId: integer("food_id").notNull(),
  portionSize: decimal("portion_size", { precision: 8, scale: 2 }).notNull(),
  // in grams
  mealType: text("meal_type").notNull(),
  // 'breakfast', 'lunch', 'dinner', 'snack'
  loggedAt: timestamp("logged_at").defaultNow()
});
var userVitaminStatus = pgTable("user_vitamin_status", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: text("date").notNull(),
  // YYYY-MM-DD format
  vitaminLevels: json("vitamin_levels").$type().notNull(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var userMacroStatus = pgTable("user_macro_status", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: varchar("date", { length: 10 }).notNull(),
  // YYYY-MM-DD format
  energyIntake: decimal("energy_intake", { precision: 10, scale: 2 }).default("0"),
  energyTarget: decimal("energy_target", { precision: 10, scale: 2 }).default("0"),
  proteinIntake: decimal("protein_intake", { precision: 10, scale: 2 }).default("0"),
  proteinTarget: decimal("protein_target", { precision: 10, scale: 2 }).default("0"),
  carbsIntake: decimal("carbs_intake", { precision: 10, scale: 2 }).default("0"),
  carbsTarget: decimal("carbs_target", { precision: 10, scale: 2 }).default("0"),
  fatIntake: decimal("fat_intake", { precision: 10, scale: 2 }).default("0"),
  fatTarget: decimal("fat_target", { precision: 10, scale: 2 }).default("0"),
  fiberIntake: decimal("fiber_intake", { precision: 10, scale: 2 }).default("0"),
  fiberTarget: decimal("fiber_target", { precision: 10, scale: 2 }).default("0"),
  sugarIntake: decimal("sugar_intake", { precision: 10, scale: 2 }).default("0"),
  sugarTarget: decimal("sugar_target", { precision: 10, scale: 2 }).default("0"),
  updatedAt: timestamp("updated_at").defaultNow()
});
var symptoms = pgTable("symptoms", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  symptomType: text("symptom_type").notNull(),
  severity: integer("severity").notNull(),
  // 1-5 scale
  notes: text("notes"),
  reportedAt: timestamp("reported_at").defaultNow()
});
var userConnections = pgTable("user_connections", {
  id: serial("id").primaryKey(),
  followerId: integer("follower_id").notNull().references(() => users.id),
  followingId: integer("following_id").notNull().references(() => users.id),
  status: text("status").notNull().default("pending"),
  // pending, accepted, blocked
  createdAt: timestamp("created_at").defaultNow()
});
var sharedProgress = pgTable("shared_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  progressData: json("progress_data").notNull(),
  // Contains vitamin/mineral levels, goals achieved
  visibility: text("visibility").notNull().default("public"),
  // public, friends, private
  likes: integer("likes").default(0),
  createdAt: timestamp("created_at").defaultNow()
});
var sharedMeals = pgTable("shared_meals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  mealData: json("meal_data").notNull(),
  // Contains foods, portions, nutrition summary
  tags: text("tags").array(),
  // dietary preferences, health goals
  visibility: text("visibility").notNull().default("public"),
  likes: integer("likes").default(0),
  createdAt: timestamp("created_at").defaultNow()
});
var socialLikes = pgTable("social_likes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  targetType: text("target_type").notNull(),
  // "progress" or "meal"
  targetId: integer("target_id").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var socialComments = pgTable("social_comments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  targetType: text("target_type").notNull(),
  // "progress" or "meal"
  targetId: integer("target_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull().default("feedback"),
  // 'feedback', 'support', 'bug_report', 'feature_request'
  status: text("status").notNull().default("new"),
  // 'new', 'read', 'responded', 'closed'
  userAgent: text("user_agent"),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").defaultNow()
});
var userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  achievementId: text("achievement_id").notNull(),
  unlockedAt: timestamp("unlocked_at").defaultNow(),
  progress_value: decimal("progress_value", { precision: 5, scale: 2 }).default("0")
  // Progress towards achievement (0-100)
}, (table) => [
  index("idx_user_achievements_user_id").on(table.userId),
  index("idx_user_achievements_achievement_id").on(table.achievementId)
]);
var userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  totalPoints: integer("total_points").default(0),
  level: integer("level").default(1),
  consecutiveDays: integer("consecutive_days").default(0),
  longestStreak: integer("longest_streak").default(0),
  totalFoodEntries: integer("total_food_entries").default(0),
  vitaminsSufficientDays: integer("vitamins_sufficient_days").default(0),
  mineralsSufficientDays: integer("minerals_sufficient_days").default(0),
  weeklyConsistencyScore: decimal("weekly_consistency_score", { precision: 5, scale: 2 }).default("0.00"),
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow()
}, (table) => [
  index("idx_user_progress_user_id").on(table.userId)
]);
var dashboardSnapshots = pgTable("dashboard_snapshots", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: text("date").notNull(),
  // YYYY-MM-DD format
  snapshotData: jsonb("snapshot_data").notNull(),
  // Complete dashboard data
  timestamp: timestamp("timestamp").defaultNow()
}, (table) => [
  index("idx_dashboard_snapshots_user_id").on(table.userId),
  index("idx_dashboard_snapshots_date").on(table.date)
]);
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  hashedPassword: true,
  age: true,
  height: true,
  weight: true,
  activityLevel: true,
  gender: true,
  dietaryPreferences: true,
  healthGoals: true
}).extend({
  height: z.union([z.number(), z.string()]).optional().nullable().transform((val) => val ? String(val) : null),
  weight: z.union([z.number(), z.string()]).optional().nullable().transform((val) => val ? String(val) : null)
});
var loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters")
});
var registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  age: z.union([z.string(), z.number()]).transform((val) => {
    const num = typeof val === "string" ? parseInt(val, 10) : val;
    if (isNaN(num) || num < 13) {
      throw new Error("Age must be at least 13 years old");
    }
    return num;
  }),
  gender: z.string(),
  height: z.union([z.number(), z.string()]).optional().nullable().transform((val) => val ? String(val) : null),
  weight: z.union([z.number(), z.string()]).optional().nullable().transform((val) => val ? String(val) : null),
  activityLevel: z.string().optional().default("moderately_active"),
  dietaryPreferences: z.array(z.string()).optional().default([]),
  healthGoals: z.array(z.string()).optional().default([])
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});
var forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address")
});
var resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});
var insertFoodSchema = createInsertSchema(foods).pick({
  usdaId: true,
  name: true,
  description: true,
  nutrients: true,
  category: true
});
var insertFoodLogSchema = createInsertSchema(foodLogs).pick({
  userId: true,
  foodId: true,
  portionSize: true,
  mealType: true
});
var insertSymptomSchema = createInsertSchema(symptoms).pick({
  userId: true,
  symptomType: true,
  severity: true,
  notes: true
});
var insertUserConnectionSchema = createInsertSchema(userConnections).pick({
  followerId: true,
  followingId: true,
  status: true
});
var insertSharedProgressSchema = createInsertSchema(sharedProgress).pick({
  userId: true,
  title: true,
  description: true,
  progressData: true,
  visibility: true
});
var insertSharedMealSchema = createInsertSchema(sharedMeals).pick({
  userId: true,
  title: true,
  description: true,
  mealData: true,
  tags: true,
  visibility: true
});
var insertMacroStatusSchema = createInsertSchema(userMacroStatus).pick({
  userId: true,
  date: true,
  energyIntake: true,
  energyTarget: true,
  proteinIntake: true,
  proteinTarget: true,
  carbsIntake: true,
  carbsTarget: true,
  fatIntake: true,
  fatTarget: true,
  fiberIntake: true,
  fiberTarget: true,
  sugarIntake: true,
  sugarTarget: true
});
var insertSocialLikeSchema = createInsertSchema(socialLikes).pick({
  userId: true,
  targetType: true,
  targetId: true
});
var insertSocialCommentSchema = createInsertSchema(socialComments).pick({
  userId: true,
  targetType: true,
  targetId: true,
  content: true
});
var insertContactMessageSchema = createInsertSchema(contactMessages).pick({
  name: true,
  message: true,
  type: true
});
var insertDashboardSnapshotSchema = createInsertSchema(dashboardSnapshots).pick({
  userId: true,
  date: true,
  snapshotData: true
});
var insertUserAchievementSchema = createInsertSchema(userAchievements).pick({
  userId: true,
  achievementId: true,
  progress: true
});
var insertUserProgressSchema = createInsertSchema(userProgress).pick({
  userId: true,
  consecutiveDays: true,
  longestStreak: true,
  totalPoints: true,
  level: true,
  totalFoodEntries: true,
  vitaminsSufficientDays: true,
  mineralsSufficientDays: true
});
var VITAMINS = {
  "vitamin_a": {
    name: "Vitamin A",
    unit: "mcg",
    rda: { male: 900, female: 700 },
    // NIH RDA (most widely accepted)
    sources: {
      NHS: { male: 700, female: 600 },
      USDA: { male: 900, female: 700 },
      NIH: { male: 900, female: 700 }
    },
    functions: ["Vision", "Immune function", "Cell growth"],
    deficiencySymptoms: ["Night blindness", "Dry eyes", "Frequent infections"]
  },
  "vitamin_c": {
    name: "Vitamin C",
    unit: "mg",
    rda: { male: 90, female: 75 },
    // NIH RDA (higher for antioxidant benefits)
    sources: {
      NHS: { male: 40, female: 40 },
      USDA: { male: 90, female: 75 },
      NIH: { male: 90, female: 75 }
    },
    functions: ["Antioxidant", "Collagen synthesis", "Iron absorption"],
    deficiencySymptoms: ["Scurvy", "Slow wound healing", "Fatigue"]
  },
  "vitamin_d": {
    name: "Vitamin D",
    unit: "mcg",
    rda: { male: 15, female: 15 },
    // NIH RDA (adequate for bone health)
    sources: {
      NHS: { male: 10, female: 10 },
      USDA: { male: 15, female: 15 },
      NIH: { male: 15, female: 15 }
    },
    functions: ["Bone health", "Calcium absorption", "Immune function"],
    deficiencySymptoms: ["Bone pain", "Muscle weakness", "Increased infections"]
  },
  "vitamin_e": {
    name: "Vitamin E",
    unit: "mg",
    rda: { male: 15, female: 15 },
    // NIH RDA (antioxidant protection)
    sources: {
      NHS: { male: 4, female: 3 },
      USDA: { male: 15, female: 15 },
      NIH: { male: 15, female: 15 }
    },
    functions: ["Antioxidant", "Cell membrane protection", "Immune function"],
    deficiencySymptoms: ["Muscle weakness", "Vision problems", "Immune dysfunction"]
  },
  "vitamin_k": {
    name: "Vitamin K",
    unit: "mcg",
    rda: { male: 120, female: 90 },
    // NIH adequate intake
    sources: {
      NHS: { male: 1, female: 1 },
      // Per kg body weight
      USDA: { male: 120, female: 90 },
      NIH: { male: 120, female: 90 }
    },
    functions: ["Blood clotting", "Bone metabolism", "Heart health"],
    deficiencySymptoms: ["Easy bruising", "Excessive bleeding", "Weak bones"]
  },
  "vitamin_b1": {
    name: "Vitamin B1 (Thiamine)",
    unit: "mg",
    rda: { male: 1.2, female: 1.1 },
    // NIH RDA
    sources: {
      NHS: { male: 1, female: 0.8 },
      USDA: { male: 1.2, female: 1.1 },
      NIH: { male: 1.2, female: 1.1 }
    },
    functions: ["Energy metabolism", "Nerve function", "Muscle function"],
    deficiencySymptoms: ["Fatigue", "Irritability", "Muscle weakness"]
  },
  "vitamin_b2": {
    name: "Vitamin B2 (Riboflavin)",
    unit: "mg",
    rda: { male: 1.3, female: 1.1 },
    // NIH RDA
    sources: {
      NHS: { male: 1.3, female: 1.1 },
      USDA: { male: 1.3, female: 1.1 },
      NIH: { male: 1.3, female: 1.1 }
    },
    functions: ["Energy production", "Cell growth", "Red blood cell production"],
    deficiencySymptoms: ["Sore throat", "Cracked lips", "Eye irritation"]
  },
  "vitamin_b3": {
    name: "Vitamin B3 (Niacin)",
    unit: "mg",
    rda: { male: 16, female: 14 },
    // NIH RDA
    sources: {
      NHS: { male: 17, female: 13 },
      USDA: { male: 16, female: 14 },
      NIH: { male: 16, female: 14 }
    },
    functions: ["Energy metabolism", "DNA repair", "Cholesterol production"],
    deficiencySymptoms: ["Pellagra", "Digestive issues", "Skin problems"]
  },
  "vitamin_b5": {
    name: "Vitamin B5 (Pantothenic Acid)",
    unit: "mg",
    rda: { male: 5, female: 5 },
    // NIH adequate intake
    sources: {
      NHS: { male: 3, female: 3 },
      USDA: { male: 5, female: 5 },
      NIH: { male: 5, female: 5 }
    },
    functions: ["Energy metabolism", "Hormone production", "Cholesterol synthesis"],
    deficiencySymptoms: ["Fatigue", "Irritability", "Numbness"]
  },
  "vitamin_b6": {
    name: "Vitamin B6",
    unit: "mg",
    rda: { male: 1.3, female: 1.3 },
    // NIH RDA (under 50 years)
    sources: {
      NHS: { male: 1.4, female: 1.2 },
      USDA: { male: 1.3, female: 1.3 },
      NIH: { male: 1.3, female: 1.3 }
    },
    functions: ["Protein metabolism", "Brain development", "Immune function"],
    deficiencySymptoms: ["Depression", "Confusion", "Weak immune system"]
  },
  "biotin": {
    name: "Vitamin B7 (Biotin)",
    unit: "mcg",
    rda: { male: 30, female: 30 },
    // NIH adequate intake
    sources: {
      NHS: { male: 25, female: 25 },
      USDA: { male: 30, female: 30 },
      NIH: { male: 30, female: 30 }
    },
    functions: ["Metabolism", "Gene regulation", "Cell growth"],
    deficiencySymptoms: ["Hair loss", "Skin rash", "Depression"]
  },
  "vitamin_b12": {
    name: "Vitamin B12",
    unit: "mcg",
    rda: { male: 2.4, female: 2.4 },
    // NIH RDA
    sources: {
      NHS: { male: 1.5, female: 1.5 },
      USDA: { male: 2.4, female: 2.4 },
      NIH: { male: 2.4, female: 2.4 }
    },
    functions: ["Red blood cell formation", "DNA synthesis", "Neurological function"],
    deficiencySymptoms: ["Pernicious anemia", "Fatigue", "Neurological problems"]
  },
  "folate": {
    name: "Vitamin B9 (Folate)",
    unit: "mcg",
    rda: { male: 400, female: 400 },
    // NIH RDA
    sources: {
      NHS: { male: 200, female: 200 },
      USDA: { male: 400, female: 400 },
      NIH: { male: 400, female: 400 }
    },
    functions: ["DNA synthesis", "Red blood cell formation", "Neural tube development"],
    deficiencySymptoms: ["Megaloblastic anemia", "Fatigue", "Birth defects"]
  }
};
var MINERALS = {
  "iron": {
    name: "Iron",
    unit: "mg",
    rda: { male: 8, female: 18 },
    // NIH RDA (accounts for menstruation)
    sources: {
      NHS: { male: 8.7, female: 14.8 },
      USDA: { male: 8, female: 18 },
      NIH: { male: 8, female: 18 }
    },
    functions: ["Oxygen transport", "Energy metabolism", "Immune function"],
    deficiencySymptoms: ["Iron deficiency anemia", "Fatigue", "Pale skin"]
  },
  "calcium": {
    name: "Calcium",
    unit: "mg",
    rda: { male: 1e3, female: 1e3 },
    // NIH RDA (bone health priority)
    sources: {
      NHS: { male: 700, female: 700 },
      USDA: { male: 1e3, female: 1e3 },
      NIH: { male: 1e3, female: 1e3 }
    },
    functions: ["Bone health", "Muscle function", "Blood clotting"],
    deficiencySymptoms: ["Osteoporosis", "Muscle cramps", "Numbness"]
  },
  "zinc": {
    name: "Zinc",
    unit: "mg",
    rda: { male: 11, female: 8 },
    // NIH RDA
    sources: {
      NHS: { male: 9.5, female: 7 },
      USDA: { male: 11, female: 8 },
      NIH: { male: 11, female: 8 }
    },
    functions: ["Immune function", "Wound healing", "Protein synthesis"],
    deficiencySymptoms: ["Slow wound healing", "Hair loss", "Diarrhea"]
  },
  "magnesium": {
    name: "Magnesium",
    unit: "mg",
    rda: { male: 400, female: 310 },
    // NIH RDA
    sources: {
      NHS: { male: 300, female: 270 },
      USDA: { male: 400, female: 310 },
      NIH: { male: 400, female: 310 }
    },
    functions: ["Bone health", "Muscle function", "Energy metabolism"],
    deficiencySymptoms: ["Muscle cramps", "Fatigue", "Irregular heartbeat"]
  },
  "potassium": {
    name: "Potassium",
    unit: "mg",
    rda: { male: 3400, female: 2600 },
    // NIH adequate intake
    sources: {
      NHS: { male: 3500, female: 3500 },
      USDA: { male: 3400, female: 2600 },
      NIH: { male: 3400, female: 2600 }
    },
    functions: ["Blood pressure regulation", "Muscle function", "Nerve transmission"],
    deficiencySymptoms: ["High blood pressure", "Muscle weakness", "Kidney stones"]
  },
  "phosphorus": {
    name: "Phosphorus",
    unit: "mg",
    rda: { male: 700, female: 700 },
    // NIH RDA
    sources: {
      NHS: { male: 550, female: 550 },
      USDA: { male: 700, female: 700 },
      NIH: { male: 700, female: 700 }
    },
    functions: ["Bone health", "Energy storage", "Cell membrane structure"],
    deficiencySymptoms: ["Bone pain", "Muscle weakness", "Breathing difficulties"]
  },
  "sodium": {
    name: "Sodium",
    unit: "mg",
    rda: { male: 2300, female: 2300 },
    // NIH upper limit (USDA guideline)
    sources: {
      NHS: { male: 1600, female: 1600 },
      USDA: { male: 2300, female: 2300 },
      // Upper limit
      NIH: { male: 1500, female: 1500 }
      // Adequate intake
    },
    functions: ["Fluid balance", "Nerve transmission", "Muscle function"],
    deficiencySymptoms: ["Muscle cramps", "Nausea", "Fatigue"]
  },
  "copper": {
    name: "Copper",
    unit: "mg",
    rda: { male: 0.9, female: 0.9 },
    // NIH RDA
    sources: {
      NHS: { male: 1.2, female: 1.2 },
      USDA: { male: 0.9, female: 0.9 },
      NIH: { male: 0.9, female: 0.9 }
    },
    functions: ["Iron metabolism", "Connective tissue formation", "Antioxidant function"],
    deficiencySymptoms: ["Anemia", "Bone abnormalities", "Cardiovascular disease"]
  },
  "selenium": {
    name: "Selenium",
    unit: "mcg",
    rda: { male: 55, female: 55 },
    // NIH RDA
    sources: {
      NHS: { male: 75, female: 60 },
      USDA: { male: 55, female: 55 },
      NIH: { male: 55, female: 55 }
    },
    functions: ["Antioxidant function", "Thyroid hormone metabolism", "Immune function"],
    deficiencySymptoms: ["Muscle weakness", "Cardiomyopathy", "Hair loss"]
  },
  "manganese": {
    name: "Manganese",
    unit: "mg",
    rda: { male: 2.3, female: 1.8 },
    // NIH adequate intake
    sources: {
      NHS: { male: 2.3, female: 1.8 },
      USDA: { male: 2.3, female: 1.8 },
      NIH: { male: 2.3, female: 1.8 }
    },
    functions: ["Bone development", "Metabolism", "Antioxidant function"],
    deficiencySymptoms: ["Poor bone formation", "Skin rash", "Mood changes"]
  }
};

// server/db.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var connectionString = process.env.DATABASE_URL;
var client = postgres(connectionString, {
  prepare: false,
  max: 10,
  max_lifetime: 60 * 30
  // 30 minutes
});
var db = drizzle(client, { schema: schema_exports });

// server/storage.ts
import { eq, and, gte, lte, desc, ilike, lt } from "drizzle-orm";
var DatabaseStorage = class {
  constructor() {
  }
  // Users
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async getUserByUsername(username) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  async getUserByEmail(email) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
  async createUser(insertUser) {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  async updateUser(id, updates) {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user;
  }
  async getUserByResetToken(token) {
    const [user] = await db.select().from(users).where(and(
      eq(users.resetToken, token),
      gte(users.resetTokenExpiry, /* @__PURE__ */ new Date())
    ));
    return user;
  }
  async updateUserPassword(id, hashedPassword) {
    const [user] = await db.update(users).set({
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null
    }).where(eq(users.id, id)).returning();
    return user;
  }
  async setPasswordResetToken(userId, token, expiryDate) {
    const [user] = await db.update(users).set({
      resetToken: token,
      resetTokenExpiry: expiryDate
    }).where(eq(users.id, userId)).returning();
    return user;
  }
  // Foods
  async getFood(id) {
    const [food] = await db.select().from(foods).where(eq(foods.id, id));
    return food;
  }
  async getFoodByUsdaId(usdaId) {
    const [food] = await db.select().from(foods).where(eq(foods.usdaId, usdaId));
    return food;
  }
  async createFood(insertFood) {
    const [food] = await db.insert(foods).values(insertFood).returning();
    return food;
  }
  async updateFood(id, updates) {
    const [food] = await db.update(foods).set(updates).where(eq(foods.id, id)).returning();
    return food;
  }
  async searchFoods(query) {
    return await db.select().from(foods).where(ilike(foods.name, `%${query}%`)).limit(20);
  }
  // Food Logs
  async getFoodLog(id) {
    const [log2] = await db.select().from(foodLogs).where(eq(foodLogs.id, id));
    return log2;
  }
  async getFoodLogsByUser(userId, date) {
    if (date) {
      return await db.select().from(foodLogs).where(
        and(
          eq(foodLogs.userId, userId),
          gte(foodLogs.loggedAt, new Date(date)),
          lte(foodLogs.loggedAt, /* @__PURE__ */ new Date(date + "T23:59:59"))
        )
      ).orderBy(desc(foodLogs.loggedAt));
    } else {
      return await db.select().from(foodLogs).where(eq(foodLogs.userId, userId)).orderBy(desc(foodLogs.loggedAt));
    }
  }
  async getFoodLogsByUserDateRange(userId, startDate, endDate) {
    return await db.select().from(foodLogs).where(
      and(
        eq(foodLogs.userId, userId),
        gte(foodLogs.loggedAt, new Date(startDate)),
        lte(foodLogs.loggedAt, /* @__PURE__ */ new Date(endDate + "T23:59:59"))
      )
    ).orderBy(desc(foodLogs.loggedAt));
  }
  async createFoodLog(insertLog) {
    const [log2] = await db.insert(foodLogs).values(insertLog).returning();
    return log2;
  }
  async deleteFoodLog(id) {
    const result = await db.delete(foodLogs).where(eq(foodLogs.id, id));
    return result.rowCount > 0;
  }
  // Vitamin Status
  async getUserVitaminStatus(userId, date) {
    const [status] = await db.select().from(userVitaminStatus).where(
      and(
        eq(userVitaminStatus.userId, userId),
        eq(userVitaminStatus.date, date)
      )
    );
    return status;
  }
  async createOrUpdateVitaminStatus(status) {
    const existing = await this.getUserVitaminStatus(status.userId, status.date);
    if (existing) {
      const [result] = await db.update(userVitaminStatus).set({
        vitaminLevels: status.vitaminLevels,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(
        and(
          eq(userVitaminStatus.userId, status.userId),
          eq(userVitaminStatus.date, status.date)
        )
      ).returning();
      return result;
    } else {
      const [result] = await db.insert(userVitaminStatus).values({
        ...status,
        updatedAt: /* @__PURE__ */ new Date()
      }).returning();
      return result;
    }
  }
  // Macro Status
  async getUserMacroStatus(userId, date) {
    const [status] = await db.select().from(userMacroStatus).where(
      and(
        eq(userMacroStatus.userId, userId),
        eq(userMacroStatus.date, date)
      )
    );
    return status;
  }
  async createOrUpdateMacroStatus(status) {
    const existing = await this.getUserMacroStatus(status.userId, status.date);
    if (existing) {
      const [result] = await db.update(userMacroStatus).set({
        energyIntake: status.energyIntake,
        energyTarget: status.energyTarget,
        proteinIntake: status.proteinIntake,
        proteinTarget: status.proteinTarget,
        carbsIntake: status.carbsIntake,
        carbsTarget: status.carbsTarget,
        fatIntake: status.fatIntake,
        fatTarget: status.fatTarget,
        fiberIntake: status.fiberIntake,
        fiberTarget: status.fiberTarget,
        sugarIntake: status.sugarIntake,
        sugarTarget: status.sugarTarget,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(
        and(
          eq(userMacroStatus.userId, status.userId),
          eq(userMacroStatus.date, status.date)
        )
      ).returning();
      return result;
    } else {
      const [result] = await db.insert(userMacroStatus).values({
        ...status,
        updatedAt: /* @__PURE__ */ new Date()
      }).returning();
      return result;
    }
  }
  // Symptoms
  async getSymptomsByUser(userId, days = 30) {
    const startDate = /* @__PURE__ */ new Date();
    startDate.setDate(startDate.getDate() - days);
    return await db.select().from(symptoms).where(
      and(
        eq(symptoms.userId, userId),
        gte(symptoms.reportedAt, startDate)
      )
    ).orderBy(desc(symptoms.reportedAt));
  }
  async createSymptom(insertSymptom) {
    const [symptom] = await db.insert(symptoms).values(insertSymptom).returning();
    return symptom;
  }
  // Social features implementation
  async getUserConnections(userId) {
    return await db.select().from(userConnections).where(eq(userConnections.followerId, userId));
  }
  async getConnectionStatus(followerId, followingId) {
    const [connection] = await db.select().from(userConnections).where(and(
      eq(userConnections.followerId, followerId),
      eq(userConnections.followingId, followingId)
    ));
    return connection;
  }
  async createConnection(connection) {
    const [newConnection] = await db.insert(userConnections).values(connection).returning();
    return newConnection;
  }
  async updateConnectionStatus(connectionId, status) {
    const [updated] = await db.update(userConnections).set({ status }).where(eq(userConnections.id, connectionId)).returning();
    return updated;
  }
  async getSharedProgress(visibility = "public", userId) {
    const query = db.select({
      id: sharedProgress.id,
      userId: sharedProgress.userId,
      title: sharedProgress.title,
      description: sharedProgress.description,
      progressData: sharedProgress.progressData,
      visibility: sharedProgress.visibility,
      likes: sharedProgress.likes,
      createdAt: sharedProgress.createdAt,
      user: {
        id: users.id,
        username: users.username,
        email: users.email,
        age: users.age,
        gender: users.gender,
        dietaryPreferences: users.dietaryPreferences,
        healthGoals: users.healthGoals,
        createdAt: users.createdAt
      }
    }).from(sharedProgress).innerJoin(users, eq(sharedProgress.userId, users.id)).orderBy(desc(sharedProgress.createdAt));
    if (visibility !== "all") {
      query.where(eq(sharedProgress.visibility, visibility));
    }
    return await query;
  }
  async getSharedProgressByUser(userId) {
    return await db.select().from(sharedProgress).where(eq(sharedProgress.userId, userId)).orderBy(desc(sharedProgress.createdAt));
  }
  async createSharedProgress(progress) {
    const [newProgress] = await db.insert(sharedProgress).values(progress).returning();
    return newProgress;
  }
  async deleteSharedProgress(id, userId) {
    const result = await db.delete(sharedProgress).where(and(
      eq(sharedProgress.id, id),
      eq(sharedProgress.userId, userId)
    ));
    return result.rowCount > 0;
  }
  async getSharedMeals(visibility = "public", userId) {
    const query = db.select({
      id: sharedMeals.id,
      userId: sharedMeals.userId,
      title: sharedMeals.title,
      description: sharedMeals.description,
      mealData: sharedMeals.mealData,
      tags: sharedMeals.tags,
      visibility: sharedMeals.visibility,
      likes: sharedMeals.likes,
      createdAt: sharedMeals.createdAt,
      user: {
        id: users.id,
        username: users.username,
        email: users.email,
        age: users.age,
        gender: users.gender,
        dietaryPreferences: users.dietaryPreferences,
        healthGoals: users.healthGoals,
        createdAt: users.createdAt
      }
    }).from(sharedMeals).innerJoin(users, eq(sharedMeals.userId, users.id)).orderBy(desc(sharedMeals.createdAt));
    if (visibility !== "all") {
      query.where(eq(sharedMeals.visibility, visibility));
    }
    return await query;
  }
  async getSharedMealsByUser(userId) {
    return await db.select().from(sharedMeals).where(eq(sharedMeals.userId, userId)).orderBy(desc(sharedMeals.createdAt));
  }
  async createSharedMeal(meal) {
    const [newMeal] = await db.insert(sharedMeals).values(meal).returning();
    return newMeal;
  }
  async deleteSharedMeal(id, userId) {
    const result = await db.delete(sharedMeals).where(and(
      eq(sharedMeals.id, id),
      eq(sharedMeals.userId, userId)
    ));
    return result.rowCount > 0;
  }
  async toggleLike(like) {
    const [existingLike] = await db.select().from(socialLikes).where(and(
      eq(socialLikes.userId, like.userId),
      eq(socialLikes.targetType, like.targetType),
      eq(socialLikes.targetId, like.targetId)
    ));
    if (existingLike) {
      await db.delete(socialLikes).where(eq(socialLikes.id, existingLike.id));
      return false;
    } else {
      await db.insert(socialLikes).values(like);
      return true;
    }
  }
  async getLikesCount(targetType, targetId) {
    const result = await db.select({ count: socialLikes.id }).from(socialLikes).where(and(
      eq(socialLikes.targetType, targetType),
      eq(socialLikes.targetId, targetId)
    ));
    return result.length;
  }
  async hasUserLiked(userId, targetType, targetId) {
    const [like] = await db.select().from(socialLikes).where(and(
      eq(socialLikes.userId, userId),
      eq(socialLikes.targetType, targetType),
      eq(socialLikes.targetId, targetId)
    ));
    return !!like;
  }
  async getComments(targetType, targetId) {
    return await db.select({
      id: socialComments.id,
      userId: socialComments.userId,
      targetType: socialComments.targetType,
      targetId: socialComments.targetId,
      content: socialComments.content,
      createdAt: socialComments.createdAt,
      user: {
        id: users.id,
        username: users.username,
        email: users.email,
        age: users.age,
        gender: users.gender,
        dietaryPreferences: users.dietaryPreferences,
        healthGoals: users.healthGoals,
        createdAt: users.createdAt
      }
    }).from(socialComments).innerJoin(users, eq(socialComments.userId, users.id)).where(and(
      eq(socialComments.targetType, targetType),
      eq(socialComments.targetId, targetId)
    )).orderBy(socialComments.createdAt);
  }
  async createComment(comment) {
    const [newComment] = await db.insert(socialComments).values(comment).returning();
    return newComment;
  }
  // Contact message operations
  async createContactMessage(message) {
    const [newMessage] = await db.insert(contactMessages).values(message).returning();
    return newMessage;
  }
  async getContactMessages() {
    return await db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
  }
  async updateContactMessageStatus(id, status) {
    const [updatedMessage] = await db.update(contactMessages).set({ status }).where(eq(contactMessages.id, id)).returning();
    return updatedMessage;
  }
  async cleanupOldFoodLogs(userId, cutoffDate) {
    try {
      const result = await db.delete(foodLogs).where(
        and(
          eq(foodLogs.userId, userId),
          lt(foodLogs.loggedAt, cutoffDate)
        )
      );
      return result.rowCount || 0;
    } catch (error) {
      console.error("Error cleaning up old food logs:", error);
      throw error;
    }
  }
  // Achievement system operations
  async getUserProgress(userId) {
    const [progress] = await db.select().from(userProgress).where(eq(userProgress.userId, userId));
    return progress;
  }
  async createOrUpdateUserProgress(progress) {
    const existing = await this.getUserProgress(progress.userId);
    if (existing) {
      const [updated] = await db.update(userProgress).set({
        ...progress,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq(userProgress.userId, progress.userId)).returning();
      return updated;
    } else {
      const [created] = await db.insert(userProgress).values({
        userId: progress.userId,
        currentStreak: progress.currentStreak || 0,
        longestStreak: progress.longestStreak || 0,
        totalPoints: progress.totalPoints || 0,
        level: progress.level || 1,
        weeklyVitaminsOnTrack: progress.weeklyVitaminsOnTrack || 0,
        weeklyMineralsOnTrack: progress.weeklyMineralsOnTrack || 0,
        weeklyConsistentLogging: progress.weeklyConsistentLogging || 0
      }).returning();
      return created;
    }
  }
  async getUserAchievements(userId) {
    return await db.select().from(userAchievements).where(eq(userAchievements.userId, userId)).orderBy(desc(userAchievements.unlockedAt));
  }
  async unlockAchievement(userId, achievementId) {
    const [achievement] = await db.insert(userAchievements).values({
      userId,
      achievementId,
      progress: "100.00"
    }).returning();
    return achievement;
  }
  async updateAchievementProgress(userId, achievementId, progress) {
    const [existing] = await db.select().from(userAchievements).where(and(
      eq(userAchievements.userId, userId),
      eq(userAchievements.achievementId, achievementId)
    ));
    if (existing) {
      const [updated] = await db.update(userAchievements).set({ progress: progress.toString() }).where(and(
        eq(userAchievements.userId, userId),
        eq(userAchievements.achievementId, achievementId)
      )).returning();
      return updated;
    } else {
      const [created] = await db.insert(userAchievements).values({
        userId,
        achievementId,
        progress: progress.toString()
      }).returning();
      return created;
    }
  }
  async checkAndUnlockAchievements(userId) {
    try {
      const { AchievementEngine: AchievementEngine2, calculateUserStatsFromData: calculateUserStatsFromData2 } = await Promise.resolve().then(() => (init_achievement_logic(), achievement_logic_exports));
      const [currentProgress, existingAchievements] = await Promise.all([
        this.getUserProgress(userId),
        this.getUserAchievements(userId)
      ]);
      const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      const [vitaminStatus, mineralStatus, recentLogs] = await Promise.all([
        // Get vitamin status (placeholder - would normally fetch from vitamin status API)
        Promise.resolve({}),
        // Get mineral status (placeholder - would normally fetch from mineral status API) 
        Promise.resolve({}),
        // Get recent food logs for streak calculation
        this.getFoodLogsByUser(userId)
      ]);
      const userStats = calculateUserStatsFromData2(
        vitaminStatus,
        mineralStatus,
        recentLogs,
        currentProgress
      );
      const achievementResults = AchievementEngine2.checkUserAchievements(
        userStats,
        currentProgress,
        existingAchievements
      );
      const newAchievements = [];
      for (const result of achievementResults) {
        if (result.unlocked && !existingAchievements.find((a) => a.achievementId === result.achievementId)) {
          const achievement = await this.unlockAchievement(userId, result.achievementId);
          newAchievements.push(achievement);
          const points = AchievementEngine2.awardPointsForAchievement(result.achievementId);
          await this.createOrUpdateUserProgress({
            userId,
            totalPoints: (currentProgress?.totalPoints || 0) + points
          });
        }
      }
      return newAchievements;
    } catch (error) {
      console.error("Error checking achievements:", error);
      return [];
    }
  }
  // Dashboard snapshot operations
  async createDashboardSnapshot(snapshot) {
    const [createdSnapshot] = await db.insert(dashboardSnapshots).values(snapshot).returning();
    return createdSnapshot;
  }
  async getDashboardSnapshots(userId) {
    const snapshots = await db.select().from(dashboardSnapshots).where(eq(dashboardSnapshots.userId, userId)).orderBy(dashboardSnapshots.timestamp);
    return snapshots;
  }
  async deleteDashboardSnapshot(snapshotId, userId) {
    await db.delete(dashboardSnapshots).where(
      and(
        eq(dashboardSnapshots.id, snapshotId),
        eq(dashboardSnapshots.userId, userId)
      )
    );
  }
};
var storage = new DatabaseStorage();

// server/auth.ts
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// supabaseClient.ts
import { createClient } from "@supabase/supabase-js";
var supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
var supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase configuration missing. Using fallback database connection.");
}
var supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

// server/auth.ts
var JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-here";
async function registerUser(email, password) {
  try {
    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      return { success: false, message: "User already exists" };
    }
    if (!password || password.length < 6) {
      return { success: false, message: "Password must be at least 6 characters" };
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    return { success: true, hashedPassword, useLocalAuth: true };
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, message: "Registration failed" };
  }
}
async function loginUser(email, password) {
  try {
    const user = await storage.getUserByEmail(email);
    if (user && user.hashedPassword && user.hashedPassword !== "supabase_auth") {
      const isValidPassword = await bcrypt.compare(password, user.hashedPassword);
      if (isValidPassword) {
        const token = jwt.sign(
          { userId: user.id, email: user.email },
          JWT_SECRET,
          { expiresIn: "7d" }
        );
        return {
          success: true,
          token,
          user: {
            id: user.id,
            email: user.email,
            username: user.username
          }
        };
      }
    }
    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) {
        console.error("Supabase login error:", error);
        if (error.code === "email_not_confirmed") {
          return { success: false, message: "Please check your email and confirm your account" };
        }
        return { success: false, message: "Invalid email or password" };
      }
      return {
        success: true,
        session: data.session,
        user: data.user,
        token: data.session?.access_token
      };
    }
    return { success: false, message: "Invalid email or password" };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, message: "Login failed" };
  }
}
async function authenticateUser(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await storage.getUser(decoded.userId);
      if (user) {
        req.user = user;
        next();
        return;
      }
    } catch (jwtError) {
      if (token.startsWith("token-")) {
        const userId = parseInt(token.replace("token-", ""));
        const user = await storage.getUser(userId);
        if (user) {
          req.user = user;
          next();
          return;
        }
      }
    }
    if (supabase) {
      try {
        const { data, error } = await supabase.auth.getUser(token);
        if (!error && data?.user) {
          let user = await storage.getUserByEmail(data.user.email);
          if (user) {
            req.user = user;
            next();
            return;
          } else {
            return res.status(401).json({ message: "User not found. Please register first." });
          }
        }
      } catch (supabaseError) {
        console.error("Supabase authentication failed, falling back to local auth:", supabaseError);
      }
    }
    const cookieToken = req.cookies?.nutritrack_token;
    if (cookieToken) {
      try {
        const decoded = jwt.verify(cookieToken, JWT_SECRET);
        const user = await storage.getUser(decoded.userId);
        if (user) {
          req.user = user;
          next();
          return;
        }
      } catch (cookieError) {
      }
    }
    return res.status(401).json({ message: "Invalid or expired token" });
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({ message: "Invalid token" });
  }
}
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1];
    if (token) {
      if (supabase) {
        const { data, error } = await supabase.auth.getUser(token);
        if (!error && data?.user) {
          let user = await storage.getUserByEmail(data.user.email);
          if (user) {
            req.user = user;
          }
        }
      } else {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await storage.getUser(decoded.userId);
        if (user) {
          req.user = user;
        }
      }
    }
  } catch (error) {
  }
  next();
}

// server/routes.ts
import { z as z2 } from "zod";
import { fromZodError } from "zod-validation-error";
import jwt2 from "jsonwebtoken";

// server/usda-api.ts
var USDAFoodService = class {
  constructor() {
    this.baseUrl = "https://api.nal.usda.gov/fdc/v1";
    if (!process.env.USDA_API_KEY) {
      throw new Error("USDA_API_KEY environment variable is required");
    }
    this.apiKey = process.env.USDA_API_KEY;
  }
  // Search foods in USDA database
  async searchFoods(query, pageNumber = 1, pageSize = 50) {
    const url = `${this.baseUrl}/foods/search`;
    const params = new URLSearchParams({
      api_key: this.apiKey,
      query,
      pageNumber: pageNumber.toString(),
      pageSize: pageSize.toString(),
      dataType: "Survey (FNDDS),Foundation,SR Legacy,Branded",
      // All data types
      sortBy: "relevance",
      sortOrder: "desc"
    });
    try {
      const response = await fetch(`${url}?${params}`);
      if (!response.ok) {
        throw new Error(`USDA API error: ${response.status} ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error("USDA API search error:", error);
      throw error;
    }
  }
  // Get detailed food information by FDC ID
  async getFoodDetails(fdcId) {
    const url = `${this.baseUrl}/food/${fdcId}`;
    const params = new URLSearchParams({
      api_key: this.apiKey,
      nutrients: "203,204,205,208,269,291,301,303,304,305,306,307,401,404,405,406,410,415,418,421,431,435,578,601,606,645,851"
      // Key nutrients
    });
    try {
      const response = await fetch(`${url}?${params}`);
      if (!response.ok) {
        throw new Error(`USDA API error: ${response.status} ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error("USDA API details error:", error);
      throw error;
    }
  }
  // Convert USDA food to our internal format
  convertToInternalFormat(usdaFood) {
    const nutrients = {};
    const nutrientMapping = {
      208: "Energy",
      // kcal
      203: "Protein",
      // g
      204: "Total Fat",
      // g
      205: "Carbohydrates",
      // g
      269: "Sugar",
      // g
      291: "Fiber",
      // g
      301: "Calcium",
      // mg
      303: "Iron",
      // mg
      304: "Magnesium",
      // mg
      305: "Phosphorus",
      // mg
      306: "Potassium",
      // mg
      307: "Sodium",
      // mg
      401: "Vitamin C",
      // mg
      404: "Vitamin B1",
      // mg
      405: "Vitamin B2",
      // mg
      406: "Vitamin B3",
      // mg
      410: "Vitamin B5",
      // mg
      415: "Vitamin B6",
      // mg
      418: "Vitamin B12",
      // µg
      421: "Choline",
      // mg
      431: "Folate",
      // µg
      435: "Vitamin B9",
      // µg (folate DFE)
      578: "Vitamin B7",
      // µg (biotin)
      601: "Cholesterol",
      // mg
      606: "Saturated Fat",
      // g
      645: "Monounsaturated Fat",
      // g
      851: "Vitamin D"
      // µg
    };
    usdaFood.foodNutrients.forEach((nutrient) => {
      const internalName = nutrientMapping[nutrient.nutrientId];
      if (internalName && nutrient.value !== null && nutrient.value !== void 0) {
        nutrients[internalName] = nutrient.value;
      }
    });
    const essentialNutrients = ["Energy", "Protein", "Total Fat", "Carbohydrates"];
    essentialNutrients.forEach((nutrient) => {
      if (!nutrients[nutrient]) {
        nutrients[nutrient] = 0;
      }
    });
    return {
      id: `usda_${usdaFood.fdcId}`,
      name: usdaFood.description,
      nutrients,
      category: usdaFood.foodCategory?.description || "Other",
      origin: "USDA Food Data Central",
      servingSize: 100,
      // USDA data is typically per 100g
      servingUnit: "g",
      fdcId: usdaFood.fdcId
    };
  }
  // Get popular foods by category
  async getPopularFoods(category, limit = 20) {
    const queries = [
      "chicken breast",
      "salmon",
      "broccoli",
      "rice",
      "apple",
      "banana",
      "egg",
      "milk",
      "bread",
      "potato",
      "spinach",
      "beef",
      "orange",
      "yogurt",
      "oats",
      "avocado",
      "tomato",
      "cheese",
      "pasta",
      "quinoa"
    ];
    const results = [];
    for (const query of queries.slice(0, Math.min(limit / 2, queries.length))) {
      try {
        const searchResult = await this.searchFoods(query, 1, 2);
        if (searchResult.foods && searchResult.foods.length > 0) {
          results.push(...searchResult.foods.slice(0, 2));
        }
      } catch (error) {
        console.warn(`Failed to fetch popular food: ${query}`, error);
      }
    }
    return results.slice(0, limit);
  }
};
var usdaFoodService = new USDAFoodService();

// server/routes.ts
var USDA_API_KEY = process.env.USDA_API_KEY;
async function registerRoutes(app2) {
  app2.post("/api/register", async (req, res) => {
    try {
      const validatedData = registerSchema.parse(req.body);
      const result = await registerUser(validatedData.email, validatedData.password);
      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }
      const user = await storage.createUser({
        email: validatedData.email,
        username: validatedData.username,
        age: validatedData.age,
        gender: validatedData.gender,
        height: validatedData.height,
        weight: validatedData.weight,
        activityLevel: validatedData.activityLevel,
        hashedPassword: result.hashedPassword || (result.useLocalAuth ? result.hashedPassword : "supabase_auth")
      });
      if (result.useLocalAuth) {
        const JWT_SECRET2 = process.env.JWT_SECRET || "your-secret-key-here";
        const token = jwt2.sign(
          { userId: user.id, email: user.email },
          JWT_SECRET2,
          { expiresIn: "7d" }
        );
        res.cookie("nutritrack_token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60 * 1e3
          // 7 days
        });
        return res.status(201).json({
          message: "User registered successfully",
          user: {
            id: user.id,
            email: user.email,
            username: user.username
          },
          token
        });
      }
      res.status(201).json({
        message: "User registered successfully",
        user: {
          id: user.id,
          email: user.email,
          username: user.username
        },
        session: result.session,
        token: result.session?.access_token
      });
    } catch (error) {
      console.error("Registration error:", error);
      if (error instanceof z2.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Registration failed" });
    }
  });
  app2.post("/api/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const result = await loginUser(email, password);
      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }
      res.cookie("nutritrack_token", result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1e3
        // 7 days
      });
      res.status(200).json({
        message: "Login successful",
        token: result.token,
        user: result.user
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });
  app2.post("/api/logout", async (req, res) => {
    try {
      res.status(200).json({ message: "Logout successful" });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Logout failed" });
    }
  });
  app2.get("/api/user", authenticateUser, async (req, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  app2.patch("/api/user", authenticateUser, async (req, res) => {
    try {
      const { username, age, gender, height, weight, activityLevel, country } = req.body;
      const updatedUser = await storage.updateUser(req.user.id, {
        username,
        age: parseInt(age),
        gender,
        height: parseFloat(height),
        weight: parseFloat(weight),
        activityLevel,
        country
      });
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });
  app2.post("/api/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.json({
          message: "If an account with this email exists, a password reset link has been sent.",
          success: true
        });
      }
      const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const expiryDate = new Date(Date.now() + 36e5);
      await storage.setPasswordResetToken(user.id, resetToken, expiryDate);
      const resetLink = `${req.protocol}://${req.get("host")}/reset-password?token=${resetToken}`;
      console.log(`Password reset link for ${email}: ${resetLink}`);
      res.json({
        message: "Password reset link has been sent. Please check your email or console for the link.",
        success: true,
        // Include development info for testing
        developmentInfo: {
          resetUrl: resetLink,
          token: resetToken,
          note: "In production, this would be sent via email"
        }
      });
    } catch (error) {
      console.error("Password reset error:", error);
      res.status(500).json({ message: "Password reset failed", success: false });
    }
  });
  app2.post("/api/reset-password", async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      if (!token || !newPassword) {
        return res.status(400).json({ message: "Token and new password are required" });
      }
      const user = await storage.getUserByResetToken(token);
      if (!user) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }
      if (user.resetTokenExpiry && /* @__PURE__ */ new Date() > user.resetTokenExpiry) {
        return res.status(400).json({ message: "Reset token has expired" });
      }
      const bcrypt2 = __require("bcrypt");
      const hashedPassword = await bcrypt2.hash(newPassword, 10);
      await storage.updateUserPassword(user.id, hashedPassword);
      res.json({ message: "Password reset successful" });
    } catch (error) {
      console.error("Password reset error:", error);
      res.status(500).json({ message: "Password reset failed" });
    }
  });
  app2.get("/api/foods/search", async (req, res) => {
    try {
      const { q: query, page = "1", pageSize = "50" } = req.query;
      if (!query || typeof query !== "string") {
        return res.status(400).json({ message: "Search query is required" });
      }
      const localFoods = await storage.searchFoods(query);
      try {
        const pageNum = parseInt(page) || 1;
        const size = parseInt(pageSize) || 50;
        const usdaResult = await usdaFoodService.searchFoods(query, pageNum, size);
        const convertedUsdaFoods = usdaResult.foods.map(
          (food) => usdaFoodService.convertToInternalFormat(food)
        );
        const allFoods = [...localFoods, ...convertedUsdaFoods];
        const uniqueFoods = allFoods.filter(
          (food, index2, self) => index2 === self.findIndex((f) => f.name.toLowerCase() === food.name.toLowerCase())
        );
        console.log(`USDA search for "${query}" returned ${uniqueFoods.length} foods`);
        return res.json({
          foods: uniqueFoods.slice(0, size),
          totalHits: usdaResult.totalHits + localFoods.length,
          currentPage: pageNum,
          totalPages: usdaResult.totalPages
        });
      } catch (usdaError) {
        console.error("USDA API error:", usdaError);
        const commonFoods = [
          // Vegetables
          { id: 314, name: "Beetroot, raw", description: "Beetroot, red, raw", fdcId: 748967, nutrients: { energy_kcal: 43, protein: 1.61, total_lipid_fat: 0.17, carbohydrate_by_difference: 9.56, fiber_total_dietary: 2.8, calcium: 16, iron: 0.8, magnesium: 23, potassium: 325, vitamin_c: 4.9, folate: 109 } },
          { id: 315, name: "Beetroot, cooked", description: "Beetroot, cooked, boiled, drained", fdcId: 748968, nutrients: { energy_kcal: 44, protein: 1.68, total_lipid_fat: 0.18, carbohydrate_by_difference: 9.96, fiber_total_dietary: 2, calcium: 16, iron: 0.79, potassium: 305, vitamin_c: 3.9, folate: 80 } },
          { id: 316, name: "Carrots, raw", description: "Carrots, raw", fdcId: 748969, nutrients: { energy_kcal: 41, protein: 0.93, total_lipid_fat: 0.24, carbohydrate_by_difference: 9.58, fiber_total_dietary: 2.8, calcium: 33, iron: 0.3, vitamin_a: 835, vitamin_c: 5.9 } },
          { id: 317, name: "Spinach, raw", description: "Spinach, raw", fdcId: 748970, nutrients: { energy_kcal: 23, protein: 2.86, total_lipid_fat: 0.39, carbohydrate_by_difference: 3.63, fiber_total_dietary: 2.2, calcium: 99, iron: 2.71, vitamin_a: 469, vitamin_k: 483, folate: 194 } },
          { id: 318, name: "Broccoli, raw", description: "Broccoli, raw", fdcId: 748971, nutrients: { energy_kcal: 34, protein: 2.82, total_lipid_fat: 0.37, carbohydrate_by_difference: 6.64, fiber_total_dietary: 2.6, calcium: 47, iron: 0.73, vitamin_c: 89.2, vitamin_k: 101.6 } },
          { id: 319, name: "Kale, raw", description: "Kale, raw", fdcId: 748972, nutrients: { energy_kcal: 49, protein: 4.28, total_lipid_fat: 0.93, carbohydrate_by_difference: 8.75, fiber_total_dietary: 3.6, calcium: 150, iron: 1.47, vitamin_a: 681, vitamin_c: 120, vitamin_k: 704.8 } },
          { id: 320, name: "Sweet potato, raw", description: "Sweet potato, raw, unprepared", fdcId: 748973, nutrients: { energy_kcal: 86, protein: 1.57, total_lipid_fat: 0.05, carbohydrate_by_difference: 20.12, fiber_total_dietary: 3, calcium: 30, iron: 0.61, vitamin_a: 709, vitamin_c: 2.4 } },
          // Proteins
          { id: 321, name: "Egg, whole, raw, fresh", description: "Egg, whole, raw, fresh", fdcId: 748974, nutrients: { energy_kcal: 155, protein: 12.56, total_lipid_fat: 10.61, carbohydrate_by_difference: 0.72, calcium: 56, iron: 1.75, vitamin_a: 540, vitamin_d: 2 } },
          { id: 322, name: "Chicken breast, cooked", description: "Chicken breast, meat only, cooked, roasted", fdcId: 748975, nutrients: { energy_kcal: 165, protein: 31.02, total_lipid_fat: 3.57, carbohydrate_by_difference: 0, iron: 0.9, vitamin_b3: 14.8 } },
          { id: 323, name: "Salmon, cooked", description: "Salmon, Atlantic, cooked", fdcId: 748976, nutrients: { energy_kcal: 206, protein: 22.1, total_lipid_fat: 12.35, carbohydrate_by_difference: 0, calcium: 9, iron: 0.8, vitamin_d: 11 } },
          // Fruits
          { id: 324, name: "Banana, raw", description: "Banana, raw", fdcId: 748977, nutrients: { energy_kcal: 89, protein: 1.09, total_lipid_fat: 0.33, carbohydrate_by_difference: 22.84, fiber_total_dietary: 2.6, potassium: 358, vitamin_c: 8.7 } },
          { id: 325, name: "Apple, raw", description: "Apple, raw, with skin", fdcId: 748978, nutrients: { energy_kcal: 52, protein: 0.26, total_lipid_fat: 0.17, carbohydrate_by_difference: 13.81, fiber_total_dietary: 2.4, vitamin_c: 4.6 } },
          // Grains
          { id: 326, name: "Rice, white, cooked", description: "Rice, white, long-grain, regular, cooked", fdcId: 748979, nutrients: { energy_kcal: 130, protein: 2.69, total_lipid_fat: 0.28, carbohydrate_by_difference: 28.17, iron: 0.2 } }
        ];
        const searchQuery = query.toLowerCase();
        const matchingFoods = commonFoods.filter(
          (food) => food.name.toLowerCase().includes(searchQuery) || food.description.toLowerCase().includes(searchQuery)
        );
        const allFallbackFoods = [...localFoods, ...matchingFoods];
        return res.json({
          foods: allFallbackFoods.slice(0, 50),
          totalHits: allFallbackFoods.length,
          currentPage: 1,
          totalPages: 1,
          warning: "USDA API temporarily unavailable, showing cached foods"
        });
      }
    } catch (error) {
      console.error("Food search error:", error);
      res.status(500).json({ message: "Food search failed" });
    }
  });
  app2.get("/api/foods/popular", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 20;
      const popularFoods = await usdaFoodService.getPopularFoods(void 0, limit);
      const convertedFoods = popularFoods.map(
        (food) => usdaFoodService.convertToInternalFormat(food)
      );
      res.json({ foods: convertedFoods });
    } catch (error) {
      console.error("USDA popular foods error:", error);
      const localFoods = await storage.getAllFoods();
      res.json({
        foods: localFoods.slice(0, 20),
        warning: "USDA API unavailable, showing local foods only"
      });
    }
  });
  app2.post("/api/food-logs", authenticateUser, async (req, res) => {
    try {
      const validatedData = insertFoodLogSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      const foodLog = await storage.createFoodLog(validatedData);
      res.status(201).json(foodLog);
    } catch (error) {
      console.error("Food log creation error:", error);
      if (error instanceof z2.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create food log" });
    }
  });
  app2.get("/api/food-logs", authenticateUser, async (req, res) => {
    try {
      const { date, startDate, endDate } = req.query;
      let foodLogs2;
      if (startDate && endDate) {
        foodLogs2 = await storage.getFoodLogsByUserDateRange(req.user.id, startDate, endDate);
      } else {
        foodLogs2 = await storage.getFoodLogsByUser(req.user.id, date);
      }
      res.json(foodLogs2);
    } catch (error) {
      console.error("Food logs fetch error:", error);
      res.status(500).json({ message: "Failed to fetch food logs" });
    }
  });
  app2.delete("/api/food-logs/:id", authenticateUser, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteFoodLog(id);
      if (success) {
        res.json({ message: "Food log deleted successfully" });
      } else {
        res.status(404).json({ message: "Food log not found" });
      }
    } catch (error) {
      console.error("Food log deletion error:", error);
      res.status(500).json({ message: "Failed to delete food log" });
    }
  });
  app2.get("/api/vitamin-status", authenticateUser, async (req, res) => {
    try {
      const { date } = req.query;
      const status = await storage.getUserVitaminStatus(req.user.id, date);
      res.json(status);
    } catch (error) {
      console.error("Vitamin status fetch error:", error);
      res.status(500).json({ message: "Failed to fetch vitamin status" });
    }
  });
  app2.get("/api/macro-status", authenticateUser, async (req, res) => {
    try {
      const { date } = req.query;
      const status = await storage.getUserMacroStatus(req.user.id, date);
      res.json(status);
    } catch (error) {
      console.error("Macro status fetch error:", error);
      res.status(500).json({ message: "Failed to fetch macro status" });
    }
  });
  app2.post("/api/symptoms", authenticateUser, async (req, res) => {
    try {
      const validatedData = insertSymptomSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      const symptom = await storage.createSymptom(validatedData);
      res.status(201).json(symptom);
    } catch (error) {
      console.error("Symptom creation error:", error);
      if (error instanceof z2.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create symptom" });
    }
  });
  app2.get("/api/symptoms", authenticateUser, async (req, res) => {
    try {
      const { days } = req.query;
      const symptoms2 = await storage.getSymptomsByUser(req.user.id, days ? parseInt(days) : void 0);
      res.json(symptoms2);
    } catch (error) {
      console.error("Symptoms fetch error:", error);
      res.status(500).json({ message: "Failed to fetch symptoms" });
    }
  });
  app2.get("/api/shared-progress", optionalAuth, async (req, res) => {
    try {
      const { visibility } = req.query;
      const progress = await storage.getSharedProgress(visibility, req.user?.id);
      res.json(progress);
    } catch (error) {
      console.error("Shared progress fetch error:", error);
      res.status(500).json({ message: "Failed to fetch shared progress" });
    }
  });
  app2.post("/api/shared-progress", authenticateUser, async (req, res) => {
    try {
      const validatedData = insertSharedProgressSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      const sharedProgress2 = await storage.createSharedProgress(validatedData);
      res.status(201).json(sharedProgress2);
    } catch (error) {
      console.error("Shared progress creation error:", error);
      if (error instanceof z2.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create shared progress" });
    }
  });
  app2.get("/api/shared-meals", optionalAuth, async (req, res) => {
    try {
      const { visibility } = req.query;
      const meals = await storage.getSharedMeals(visibility, req.user?.id);
      res.json(meals);
    } catch (error) {
      console.error("Shared meals fetch error:", error);
      res.status(500).json({ message: "Failed to fetch shared meals" });
    }
  });
  app2.post("/api/shared-meals", authenticateUser, async (req, res) => {
    try {
      const validatedData = insertSharedMealSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      const sharedMeal = await storage.createSharedMeal(validatedData);
      res.status(201).json(sharedMeal);
    } catch (error) {
      console.error("Shared meal creation error:", error);
      if (error instanceof z2.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create shared meal" });
    }
  });
  app2.post("/api/likes", authenticateUser, async (req, res) => {
    try {
      const validatedData = insertSocialLikeSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      const liked = await storage.toggleLike(validatedData);
      res.json({ liked });
    } catch (error) {
      console.error("Like toggle error:", error);
      if (error instanceof z2.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to toggle like" });
    }
  });
  app2.get("/api/comments", async (req, res) => {
    try {
      const { targetType, targetId } = req.query;
      const comments = await storage.getComments(targetType, parseInt(targetId));
      res.json(comments);
    } catch (error) {
      console.error("Comments fetch error:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });
  app2.post("/api/comments", authenticateUser, async (req, res) => {
    try {
      const validatedData = insertSocialCommentSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      const comment = await storage.createComment(validatedData);
      res.status(201).json(comment);
    } catch (error) {
      console.error("Comment creation error:", error);
      if (error instanceof z2.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create comment" });
    }
  });
  app2.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertContactMessageSchema.parse(req.body);
      const message = await storage.createContactMessage(validatedData);
      res.status(201).json({ message: "Message sent successfully" });
    } catch (error) {
      console.error("Contact message creation error:", error);
      if (error instanceof z2.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to send message" });
    }
  });
  app2.get("/api/admin/contact-messages", authenticateUser, async (req, res) => {
    try {
      if (req.user.id !== 3) {
        return res.status(403).json({ message: "Unauthorized access" });
      }
      const messages = await storage.getContactMessages();
      res.json(messages);
    } catch (error) {
      console.error("Contact messages fetch error:", error);
      res.status(500).json({ message: "Failed to fetch contact messages" });
    }
  });
  app2.patch("/api/admin/contact-messages/:id", authenticateUser, async (req, res) => {
    try {
      if (req.user.id !== 3) {
        return res.status(403).json({ message: "Unauthorized access" });
      }
      const id = parseInt(req.params.id);
      const { status } = req.body;
      const updatedMessage = await storage.updateContactMessageStatus(id, status);
      if (updatedMessage) {
        res.json(updatedMessage);
      } else {
        res.status(404).json({ message: "Message not found" });
      }
    } catch (error) {
      console.error("Contact message update error:", error);
      res.status(500).json({ message: "Failed to update contact message" });
    }
  });
  app2.post("/api/dashboard-snapshots", authenticateUser, async (req, res) => {
    try {
      const validatedData = insertDashboardSnapshotSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      const snapshot = await storage.createDashboardSnapshot(validatedData);
      res.status(201).json(snapshot);
    } catch (error) {
      console.error("Dashboard snapshot creation error:", error);
      if (error instanceof z2.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create dashboard snapshot" });
    }
  });
  app2.get("/api/dashboard-snapshots", authenticateUser, async (req, res) => {
    try {
      const snapshots = await storage.getDashboardSnapshots(req.user.id);
      res.json(snapshots);
    } catch (error) {
      console.error("Dashboard snapshots fetch error:", error);
      res.status(500).json({ message: "Failed to fetch dashboard snapshots" });
    }
  });
  app2.delete("/api/dashboard-snapshots/:id", authenticateUser, async (req, res) => {
    try {
      const snapshotId = parseInt(req.params.id);
      await storage.deleteDashboardSnapshot(snapshotId, req.user.id);
      res.json({ message: "Dashboard snapshot deleted successfully" });
    } catch (error) {
      console.error("Dashboard snapshot deletion error:", error);
      res.status(500).json({ message: "Failed to delete dashboard snapshot" });
    }
  });
  app2.get("/api/achievements", authenticateUser, async (req, res) => {
    try {
      const achievements = await storage.getUserAchievements(req.user.id);
      res.json(achievements);
    } catch (error) {
      console.error("Achievements fetch error:", error);
      res.status(500).json({ message: "Failed to fetch achievements" });
    }
  });
  app2.get("/api/user-progress", authenticateUser, async (req, res) => {
    try {
      const progress = await storage.getUserProgress(req.user.id);
      res.json(progress);
    } catch (error) {
      console.error("User progress fetch error:", error);
      res.status(500).json({ message: "Failed to fetch user progress" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use(cookieParser());
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const PORT = parseInt(process.env.PORT || "5000", 10);
  server.listen(PORT, "0.0.0.0", () => {
    log(`serving on port ${PORT}`);
  });
})();
var createApp = async () => {
  const appInstance = express2();
  appInstance.use(express2.json());
  appInstance.use(express2.urlencoded({ extended: false }));
  appInstance.use((req, res, next) => {
    const start = Date.now();
    const path3 = req.path;
    res.on("finish", () => {
      const duration = Date.now() - start;
      if (path3.startsWith("/api")) {
        console.log(`${req.method} ${path3} ${res.statusCode} in ${duration}ms`);
      }
    });
    next();
  });
  await registerRoutes(appInstance);
  appInstance.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
  });
  return appInstance;
};
export {
  createApp
};
