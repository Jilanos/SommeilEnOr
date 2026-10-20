"""Request contracts. Enumerations are the fixed MVP factor list.

``unknown`` always means "not answered" and is distinct from an explicit ``no``
or ``absent``.
"""

from datetime import date
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field

YesNoUnknown = Literal["yes", "no", "unknown"]
StressLevel = Literal["absent", "medium", "high", "unknown"]
DinnerQuantity = Literal["small", "medium", "big", "massive", "unknown"]
DrinkType = Literal["green_tea", "black_tea", "mate", "infusion"]
ActivityType = Literal["walking", "running", "cycling", "strength", "other"]
Intensity = Literal["low", "medium", "high"]
EventKind = Literal["drink", "activity", "nap"]

# Upper bounds are sanity limits for typing mistakes, not domain rules.
MAX_VOLUME_ML = 5000
MAX_DURATION_MINUTES = 24 * 60
HHMM = r"^([01]\d|2[0-3]):[0-5]\d$"


class Strict(BaseModel):
    model_config = ConfigDict(extra="forbid")


class Credentials(Strict):
    email: EmailStr
    password: str = Field(min_length=10, max_length=256)


class LoginRequest(Strict):
    email: str = Field(max_length=320)
    password: str = Field(max_length=256)


class MomentInput(Strict):
    """``at`` is ISO 8601: offset-aware instant, or naive Europe/Paris wall time."""

    at: str = Field(max_length=40)
    utc_offset_minutes: int | None = None


class EventCreate(Strict):
    kind: EventKind
    occurred_at: MomentInput
    drink_type: DrinkType | None = None
    volume_ml: float | None = Field(default=None, gt=0, le=MAX_VOLUME_ML)
    activity_type: ActivityType | None = None
    intensity: Intensity | None = None
    duration_minutes: int | None = Field(default=None, gt=0, le=MAX_DURATION_MINUTES)
    night_start_date: date | None = None


class EventPatch(Strict):
    occurred_at: MomentInput | None = None
    drink_type: DrinkType | None = None
    volume_ml: float | None = Field(default=None, gt=0, le=MAX_VOLUME_ML)
    activity_type: ActivityType | None = None
    intensity: Intensity | None = None
    duration_minutes: int | None = Field(default=None, gt=0, le=MAX_DURATION_MINUTES)
    # Explicit date = manual night override; explicit null = back to the 04:00 default.
    night_start_date: date | None = None


class DayPatch(Strict):
    alcohol: YesNoUnknown | None = None
    gluten: YesNoUnknown | None = None
    experienced_stress: StressLevel | None = None
    evening_noncaffeinated_drink: YesNoUnknown | None = None
    late_sugar: YesNoUnknown | None = None
    late_sugar_at: MomentInput | None = None
    dinner_at: MomentInput | None = None
    dinner_quantity: DinnerQuantity | None = None


class NightPatch(Strict):
    cat_presence: YesNoUnknown | None = None
    anticipated_stress: StressLevel | None = None
    early_wake_planned: YesNoUnknown | None = None
    early_wake_target_time: str | None = Field(default=None, pattern=HHMM)
    early_wake_reason: str | None = Field(default=None, max_length=500)


class FavoriteCreate(Strict):
    label: str = Field(min_length=1, max_length=80)
    drink_type: DrinkType
    volume_ml: float = Field(gt=0, le=MAX_VOLUME_ML)


class FavoritePatch(Strict):
    label: str | None = Field(default=None, min_length=1, max_length=80)
    drink_type: DrinkType | None = None
    volume_ml: float | None = Field(default=None, gt=0, le=MAX_VOLUME_ML)


class FavoriteUse(Strict):
    occurred_at: MomentInput


class SuggestionCreate(Strict):
    action_context: str = Field(min_length=1, max_length=80, pattern=r"^[a-z0-9_.-]+$")
    text: str = Field(min_length=1, max_length=4000)
