PLAN_CONFIGS = {
    "free": {
        "key": "free",
        "label": "Free",
        "host_limit": 2,
        "seat_limit": 1,
        "retention_days": 1,
        "alert_tier": "basic",
        "priority_support": False,
    },
    "pro": {
        "key": "pro",
        "label": "Pro",
        "host_limit": 8,
        "seat_limit": 1,
        "retention_days": 30,
        "alert_tier": "advanced",
        "priority_support": True,
    },
    "team": {
        "key": "team",
        "label": "Team",
        "host_limit": 25,
        "seat_limit": 5,
        "retention_days": 90,
        "alert_tier": "advanced",
        "priority_support": True,
    },
}


def get_plan_config(plan_key: str | None):
    if not plan_key:
        return PLAN_CONFIGS["free"]
    return PLAN_CONFIGS.get(plan_key, PLAN_CONFIGS["free"])


def is_paid_plan(plan_key: str | None):
    return plan_key in {"pro", "team"}
