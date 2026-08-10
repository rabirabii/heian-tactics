import type { InventoryResourceType } from "@/types/domain/inventory";
import type { DomainProject, ProjectStatus } from "@/types/domain/project";

export const resourceOrder: InventoryResourceType[] = [
  "mysteryAmulet",
  "brokenAmulet",
  "blackDaruma",
  "blackDarumaShards",
  "jade",
  "ap",
  "coins",
  "realmRaidTickets",
  "exp",
  "souls",
  "eventCurrency",
];

export const resourceLabels: Record<InventoryResourceType, string> = {
  mysteryAmulet: "Mystery Amulets",
  brokenAmulet: "Broken Amulets",
  blackDaruma: "Black Daruma",
  blackDarumaShards: "Black Daruma Shards",
  jade: "Jade",
  ap: "AP",
  coins: "Coins",
  realmRaidTickets: "Realm Raid Tickets",
  exp: "EXP",
  souls: "Souls",
  eventCurrency: "Event Currency",
  g2Fodder: "G2 Fodder",
  g3Fodder: "G3 Fodder",
  g4Fodder: "G4 Fodder",
  g5Fodder: "G5 Fodder",
};

export const resourceUnits: Record<InventoryResourceType, string> = {
  mysteryAmulet: "Mystery Amulet",
  brokenAmulet: "Broken Amulet",
  blackDaruma: "Black Daruma",
  blackDarumaShards: "BD Shards",
  jade: "Jade",
  ap: "AP (Sushi)",
  coins: "Coins",
  realmRaidTickets: "Raid Tickets",
  exp: "Total EXP",
  souls: "Souls",
  eventCurrency: "Event Currency",
  g2Fodder: "G2 Fodder",
  g3Fodder: "G3 Fodder",
  g4Fodder: "G4 Fodder",
  g5Fodder: "G5 Fodder",
};

export const resourceColors: Record<InventoryResourceType, string> = {
  mysteryAmulet: "#0099ff",
  brokenAmulet: "var(--text-secondary)",
  blackDaruma: "var(--foreground)",
  blackDarumaShards: "var(--foreground)",
  jade: "var(--text-secondary)",
  ap: "#ff7a59",
  coins: "#d4af37",
  realmRaidTickets: "#ff4d4d",
  exp: "var(--border-ink)",
  souls: "var(--surface)",
  eventCurrency: "var(--color-ink)",
  g2Fodder: "var(--surface)",
  g3Fodder: "var(--border-ink)",
  g4Fodder: "var(--text-secondary)",
  g5Fodder: "var(--text-secondary)",
};

export const statusColumns: ProjectStatus[] = ["Planning", "Building", "Ready", "Completed"];

export const pieColors = ["var(--foreground)", "var(--text-secondary)", "var(--text-secondary)", "var(--border-ink)", "var(--border-ink)", "var(--surface)"];