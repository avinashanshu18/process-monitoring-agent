from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("processes", "0002_mvp_fields"),
    ]

    operations = [
        migrations.AddField(
            model_name="host",
            name="owner",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="owned_hosts",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
    ]
