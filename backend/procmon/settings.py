from datetime import timedelta
from pathlib import Path

import environ
from django.core.exceptions import ImproperlyConfigured


BACKEND_DIR = Path(__file__).resolve().parent.parent
ROOT_DIR = BACKEND_DIR.parent

env = environ.Env(
    DEBUG=(bool, False),
    CORS_ALLOW_ALL_ORIGINS=(bool, False),
    SECURE_SSL_REDIRECT=(bool, False),
    SESSION_COOKIE_SECURE=(bool, False),
    CSRF_COOKIE_SECURE=(bool, False),
    USE_X_FORWARDED_HOST=(bool, False),
)
environ.Env.read_env(ROOT_DIR / ".env")

DEBUG = env.bool("DEBUG", default=True)
SECRET_KEY = env("DJANGO_SECRET_KEY", default="dev-secret-key")
PROC_MONITOR_API_KEY = env("PROC_MONITOR_API_KEY", default="change-me")
SUPER_ADMIN_KEY = env("SUPER_ADMIN_KEY", default="admin-change-me")
HOSTLENS_APP_URL = env("HOSTLENS_APP_URL", default="http://127.0.0.1:3001").rstrip("/")
HOSTLENS_AGENT_ENDPOINT = env(
    "HOSTLENS_AGENT_ENDPOINT",
    default="http://127.0.0.1:8001/api/v1/process-snapshots/",
)
HOSTLENS_RELEASE_MANIFEST_URL = env(
    "HOSTLENS_RELEASE_MANIFEST_URL",
    default=f"{HOSTLENS_APP_URL}/downloads/release-manifest.json",
)
HOSTLENS_RELEASE_CHANNEL = env("HOSTLENS_RELEASE_CHANNEL", default="stable")
HOSTLENS_OFFLINE_WARNING_SECONDS = env.int("HOSTLENS_OFFLINE_WARNING_SECONDS", default=180)
HOSTLENS_OFFLINE_CRITICAL_SECONDS = env.int("HOSTLENS_OFFLINE_CRITICAL_SECONDS", default=300)
HOSTLENS_NOTIFICATION_TIMEOUT_SECONDS = env.int(
    "HOSTLENS_NOTIFICATION_TIMEOUT_SECONDS",
    default=6,
)
HOSTLENS_NOTIFICATION_MAX_RETRIES = env.int(
    "HOSTLENS_NOTIFICATION_MAX_RETRIES",
    default=2,
)
HOSTLENS_NOTIFICATION_BACKOFF_SECONDS = env.float(
    "HOSTLENS_NOTIFICATION_BACKOFF_SECONDS",
    default=0.5,
)
HOSTLENS_NOTIFICATION_RETRYABLE_STATUS_CODES = env.list(
    "HOSTLENS_NOTIFICATION_RETRYABLE_STATUS_CODES",
    default=["408", "409", "425", "429", "500", "502", "503", "504"],
)
HOSTLENS_WEBHOOK_SIGNING_SECRET = env("HOSTLENS_WEBHOOK_SIGNING_SECRET", default="")
STRIPE_SECRET_KEY = env("STRIPE_SECRET_KEY", default="")
STRIPE_PUBLISHABLE_KEY = env("STRIPE_PUBLISHABLE_KEY", default="")
STRIPE_WEBHOOK_SECRET = env("STRIPE_WEBHOOK_SECRET", default="")
STRIPE_PRICE_PRO = env("STRIPE_PRICE_PRO", default="")
STRIPE_PRICE_TEAM = env("STRIPE_PRICE_TEAM", default="")

EMAIL_BACKEND = env(
    "EMAIL_BACKEND",
    default="django.core.mail.backends.console.EmailBackend",
)
EMAIL_HOST = env("EMAIL_HOST", default="")
EMAIL_PORT = env.int("EMAIL_PORT", default=587)
EMAIL_HOST_USER = env("EMAIL_HOST_USER", default="")
EMAIL_HOST_PASSWORD = env("EMAIL_HOST_PASSWORD", default="")
EMAIL_USE_TLS = env.bool("EMAIL_USE_TLS", default=True)
DEFAULT_FROM_EMAIL = env(
    "DEFAULT_FROM_EMAIL",
    default="HostLens Alerts <alerts@hostlens.local>",
)

if not DEBUG:
    if SECRET_KEY == "dev-secret-key":
        raise ImproperlyConfigured("Set DJANGO_SECRET_KEY before running in production.")
    if PROC_MONITOR_API_KEY == "change-me":
        raise ImproperlyConfigured("Set PROC_MONITOR_API_KEY before running in production.")
    if SUPER_ADMIN_KEY == "admin-change-me":
        raise ImproperlyConfigured("Set SUPER_ADMIN_KEY before running in production.")

ALLOWED_HOSTS = env.list("ALLOWED_HOSTS", default=["127.0.0.1", "localhost"])
CSRF_TRUSTED_ORIGINS = env.list("CSRF_TRUSTED_ORIGINS", default=[])

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "rest_framework_simplejwt.token_blacklist",
    "django_filters",
    "corsheaders",
    "channels",
    "auth_system",
    "processes",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "procmon.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ]
        },
    }
]

WSGI_APPLICATION = "procmon.wsgi.application"
ASGI_APPLICATION = "procmon.asgi.application"

database_url = env("DATABASE_URL", default="sqlite:///db.sqlite3")
if database_url.startswith("sqlite:///") and not database_url.startswith("sqlite:////"):
    relative_sqlite_path = database_url.removeprefix("sqlite:///")
    if relative_sqlite_path and not relative_sqlite_path.startswith("/"):
        database_url = f"sqlite:///{(BACKEND_DIR / relative_sqlite_path).resolve()}"

DATABASES = {"default": env.db_url_config(database_url)}

STATIC_URL = "/static/"
STATIC_ROOT = ROOT_DIR / "staticfiles"
STORAGES = {
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    }
}

TIME_ZONE = env("TIME_ZONE", default="Asia/Kolkata")
USE_TZ = True

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
        "processes.auth.HeaderApiKeyAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.AllowAny",
    ],
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "anon": env("API_THROTTLE_ANON", default="300/minute"),
        "user": env("API_THROTTLE_USER", default="600/minute"),
    },
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(
        seconds=env.int("JWT_ACCESS_TOKEN_LIFETIME_SECONDS", default=900)
    ),
    "REFRESH_TOKEN_LIFETIME": timedelta(
        seconds=env.int("JWT_REFRESH_TOKEN_LIFETIME_SECONDS", default=604800)
    ),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "UPDATE_LAST_LOGIN": True,
}

CORS_ALLOW_ALL_ORIGINS = env.bool("CORS_ALLOW_ALL_ORIGINS", default=DEBUG)
CORS_ALLOWED_ORIGINS = env.list("CORS_ALLOWED_ORIGINS", default=[])
CORS_ALLOW_CREDENTIALS = env.bool("CORS_ALLOW_CREDENTIALS", default=False)

REDIS_URL = env("REDIS_URL", default="")
if REDIS_URL:
    CHANNEL_LAYERS = {
        "default": {
            "BACKEND": "channels_redis.core.RedisChannelLayer",
            "CONFIG": {"hosts": [REDIS_URL]},
        }
    }
else:
    CHANNEL_LAYERS = {
        "default": {"BACKEND": "channels.layers.InMemoryChannelLayer"}
    }

DATA_UPLOAD_MAX_MEMORY_SIZE = env.int("DATA_UPLOAD_MAX_MEMORY_SIZE", default=10 * 1024 * 1024)
MAX_PROCESSES_PER_SNAPSHOT = env.int("MAX_PROCESSES_PER_SNAPSHOT", default=5000)
MAX_CMDLINE_LENGTH = env.int("MAX_CMDLINE_LENGTH", default=2048)

SECURE_SSL_REDIRECT = env.bool("SECURE_SSL_REDIRECT", default=not DEBUG)
SESSION_COOKIE_SECURE = env.bool("SESSION_COOKIE_SECURE", default=not DEBUG)
CSRF_COOKIE_SECURE = env.bool("CSRF_COOKIE_SECURE", default=not DEBUG)
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
USE_X_FORWARDED_HOST = env.bool("USE_X_FORWARDED_HOST", default=not DEBUG)
SECURE_HSTS_SECONDS = env.int("SECURE_HSTS_SECONDS", default=0 if DEBUG else 31536000)
SECURE_HSTS_INCLUDE_SUBDOMAINS = env.bool(
    "SECURE_HSTS_INCLUDE_SUBDOMAINS",
    default=not DEBUG,
)
SECURE_HSTS_PRELOAD = env.bool("SECURE_HSTS_PRELOAD", default=not DEBUG)
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "standard": {
            "format": "%(asctime)s %(levelname)s %(name)s %(message)s",
        }
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "standard",
        }
    },
    "root": {"handlers": ["console"], "level": env("LOG_LEVEL", default="INFO")},
}

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
