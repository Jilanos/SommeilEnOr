import type { ActivityType, DinnerQuantity, DrinkType, EventKind, Intensity, Stress, YesNo } from "./api";
import { t } from "./i18n";

export const YES_NO: YesNo[] = ["yes", "no", "unknown"];
export const STRESS: Stress[] = ["absent", "medium", "high", "unknown"];
export const DINNER_QUANTITIES: DinnerQuantity[] = ["small", "medium", "big", "massive", "unknown"];

export const yesNoLabel = (value: YesNo) =>
  ({ yes: t("answer.yes"), no: t("answer.no"), unknown: t("answer.unknown") })[value];

export const stressLabel = (value: Stress) =>
  ({
    absent: t("stress.absent"),
    medium: t("stress.medium"),
    high: t("stress.high"),
    unknown: t("answer.unknown"),
  })[value];

export const dinnerLabel = (value: DinnerQuantity) =>
  ({
    small: t("dinner.small"),
    medium: t("dinner.medium"),
    big: t("dinner.big"),
    massive: t("dinner.massive"),
    unknown: t("answer.unknown"),
  })[value];

export const drinkLabel = (value: DrinkType) =>
  ({
    green_tea: t("drink.green_tea"),
    black_tea: t("drink.black_tea"),
    mate: t("drink.mate"),
    infusion: t("drink.infusion"),
  })[value];

export const activityLabel = (value: ActivityType) =>
  ({
    walking: t("activity.walking"),
    running: t("activity.running"),
    cycling: t("activity.cycling"),
    strength: t("activity.strength"),
    other: t("activity.other"),
  })[value];

export const intensityLabel = (value: Intensity) =>
  ({ low: t("intensity.low"), medium: t("intensity.medium"), high: t("intensity.high") })[value];

export const kindLabel = (value: EventKind) =>
  ({ drink: t("kind.drink"), activity: t("kind.activity"), nap: t("kind.nap") })[value];
