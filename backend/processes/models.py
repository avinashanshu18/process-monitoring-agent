from django.db import models
import secrets

class Host(models.Model):
    hostname = models.CharField(max_length=255, unique=True)
    api_key = models.CharField(max_length=64, blank=True, null=True)

    def generate_api_key(self):
        self.api_key = secrets.token_hex(16)
        self.save()

    def __str__(self):
        return self.hostname


class Snapshot(models.Model):
    host = models.ForeignKey(Host, on_delete=models.CASCADE, related_name="snapshots")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]


class Process(models.Model):
    snapshot = models.ForeignKey(Snapshot, on_delete=models.CASCADE, related_name="processes")
    pid = models.IntegerField()
    ppid = models.IntegerField(null=True, blank=True)
    name = models.CharField(max_length=512)
    cpu_percent = models.FloatField(null=True, blank=True)
    memory_mb = models.FloatField(null=True, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=["snapshot"]),
            models.Index(fields=["pid", "ppid"]),
        ]
