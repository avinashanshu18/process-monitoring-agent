from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("processes", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="host",
            name="architecture",
            field=models.CharField(blank=True, default="", max_length=50),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="host",
            name="display_name",
            field=models.CharField(blank=True, default="", max_length=255),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="host",
            name="last_seen",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="host",
            name="monitoring_enabled",
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name="host",
            name="os_name",
            field=models.CharField(blank=True, default="", max_length=100),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="host",
            name="os_version",
            field=models.CharField(blank=True, default="", max_length=100),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="host",
            name="status",
            field=models.CharField(
                choices=[("online", "Online"), ("offline", "Offline"), ("warning", "Warning")],
                default="offline",
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name="process",
            name="cmdline",
            field=models.TextField(blank=True, default=""),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="process",
            name="status",
            field=models.CharField(blank=True, default="", max_length=32),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="process",
            name="username",
            field=models.CharField(blank=True, default="", max_length=255),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="snapshot",
            name="cpu_percent",
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="snapshot",
            name="disk_percent",
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="snapshot",
            name="memory_percent",
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="snapshot",
            name="total_processes",
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name="snapshot",
            name="uptime_seconds",
            field=models.BigIntegerField(blank=True, null=True),
        ),
    ]
