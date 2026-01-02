from django.apps import AppConfig


class AuthSystemConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'auth_system'
    verbose_name = 'Authentication & Authorization'
    
    def ready(self):
        # Import signals if any
        pass
