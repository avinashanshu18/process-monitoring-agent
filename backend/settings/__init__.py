import os
from pathlib import Path
import environ

BASE_DIR = Path(__file__).resolve().parent.parent.parent  # root project folder

env = environ.Env()
environ.Env.read_env(BASE_DIR / ".env")  # load .env from root

ENVIRONMENT = env("ENVIRONMENT", default="dev")

if ENVIRONMENT == "prod":
    from .prod import *
else:
    from .dev import *
