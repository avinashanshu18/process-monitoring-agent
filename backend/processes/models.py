# from django.db import models
# import secrets

# class Host(models.Model):
#     hostname = models.CharField(max_length=255, unique=True)
#     api_key = models.CharField(max_length=64, blank=True, null=True)

#     def generate_api_key(self):
#         self.api_key = secrets.token_hex(16)
#         self.save()

#     def __str__(self):
#         return self.hostname


# class Snapshot(models.Model):
#     host = models.ForeignKey(Host, on_delete=models.CASCADE, related_name="snapshots")
#     created_at = models.DateTimeField(auto_now_add=True)

#     class Meta:
#         ordering = ["-created_at"]


# class Process(models.Model):
#     snapshot = models.ForeignKey(Snapshot, on_delete=models.CASCADE, related_name="processes")
#     pid = models.IntegerField()
#     ppid = models.IntegerField(null=True, blank=True)
#     name = models.CharField(max_length=512)
#     cpu_percent = models.FloatField(null=True, blank=True)
#     memory_mb = models.FloatField(null=True, blank=True)


#     class Meta:
#         indexes = [
#             models.Index(fields=["snapshot"]),
#             models.Index(fields=["pid", "ppid"]),
#         ]

# class Task(models.Model):
#     name = models.CharField(max_length=512)






"""
Enterprise-Grade Models for Process Monitoring
Includes: Auditing, Soft Deletes, Optimized Queries, Security
"""
from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from django.db.models import Q, Avg, Max, Min
import secrets
import uuid


# ============================================================================
# BASE MODEL (Abstract base for all models)
# ============================================================================

class TimeStampedModel(models.Model):
    """
    Abstract base model with timestamp fields
    """
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        abstract = True


class SoftDeleteModel(models.Model):
    """
    Abstract base model for soft delete functionality
    """
    is_deleted = models.BooleanField(default=False, db_index=True)
    deleted_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        abstract = True
    
    def soft_delete(self):
        """Soft delete the object"""
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save()
    
    def restore(self):
        """Restore soft deleted object"""
        self.is_deleted = False
        self.deleted_at = None
        self.save()


# ============================================================================
# HOST MODELS
# ============================================================================

class Host(TimeStampedModel, SoftDeleteModel):
    """
    Represents a monitored host/device
    """
    class HostStatus(models.TextChoices):
        ONLINE = 'online', 'Online'
        OFFLINE = 'offline', 'Offline'
        WARNING = 'warning', 'Warning'
        CRITICAL = 'critical', 'Critical'
    
    # Identification
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    hostname = models.CharField(max_length=255, unique=True, db_index=True)
    display_name = models.CharField(max_length=255, blank=True, null=True)
    
    # Authentication
    api_key = models.CharField(max_length=64, unique=True, db_index=True)
    
    # Host Information
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    os_name = models.CharField(max_length=100, blank=True, null=True)
    os_version = models.CharField(max_length=100, blank=True, null=True)
    architecture = models.CharField(max_length=50, blank=True, null=True)
    
    # Hardware Info
    cpu_cores = models.IntegerField(null=True, blank=True)
    total_memory_gb = models.FloatField(null=True, blank=True)
    total_disk_gb = models.FloatField(null=True, blank=True)
    
    # Status & Monitoring
    status = models.CharField(
        max_length=20,
        choices=HostStatus.choices,
        default=HostStatus.OFFLINE,
        db_index=True
    )
    last_seen = models.DateTimeField(null=True, blank=True, db_index=True)
    monitoring_enabled = models.BooleanField(default=True)
    
    # Metadata
    tags = models.JSONField(default=list, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    notes = models.TextField(blank=True, null=True)
    
    # Ownership
    owner = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='owned_hosts'
    )
    workspace = models.ForeignKey(
        'workspaces.Workspace',
        on_delete=models.CASCADE,
        related_name='hosts',
        null=True,
        blank=True
    )
    
    class Meta:
        ordering = ['-last_seen', 'hostname']
        indexes = [
            models.Index(fields=['hostname', 'status']),
            models.Index(fields=['last_seen', 'monitoring_enabled']),
            models.Index(fields=['workspace', 'is_deleted']),
        ]
        verbose_name = 'Host'
        verbose_name_plural = 'Hosts'
    
    def __str__(self):
        return f"{self.display_name or self.hostname} ({self.status})"
    
    def save(self, *args, **kwargs):
        if not self.api_key:
            self.generate_api_key()
        if not self.display_name:
            self.display_name = self.hostname
        super().save(*args, **kwargs)
    
    def generate_api_key(self):
        """Generate secure API key"""
        self.api_key = secrets.token_hex(32)
    
    def mark_online(self):
        """Mark host as online"""
        self.status = self.HostStatus.ONLINE
        self.last_seen = timezone.now()
        self.save(update_fields=['status', 'last_seen'])
    
    def mark_offline(self):
        """Mark host as offline"""
        self.status = self.HostStatus.OFFLINE
        self.save(update_fields=['status'])
    
    def get_latest_snapshot(self):
        """Get most recent snapshot"""
        return self.snapshots.filter(is_deleted=False).first()
    
    def get_health_score(self):
        """Calculate health score based on latest metrics"""
        latest = self.get_latest_snapshot()
        if not latest:
            return 0
        
        # Simple health calculation
        cpu_score = 100 - (latest.cpu_percent or 0)
        memory_score = 100 - (latest.memory_percent or 0)
        disk_score = 100 - (latest.disk_percent or 0)
        
        return round((cpu_score + memory_score + disk_score) / 3, 2)


# ============================================================================
# SNAPSHOT MODELS
# ============================================================================

class Snapshot(TimeStampedModel, SoftDeleteModel):
    """
    Point-in-time snapshot of system metrics
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    host = models.ForeignKey(
        Host,
        on_delete=models.CASCADE,
        related_name='snapshots'
    )
    
    # System Metrics
    cpu_percent = models.FloatField(
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        null=True,
        blank=True
    )
    memory_percent = models.FloatField(
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        null=True,
        blank=True
    )
    memory_used_gb = models.FloatField(null=True, blank=True)
    memory_available_gb = models.FloatField(null=True, blank=True)
    
    disk_percent = models.FloatField(
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        null=True,
        blank=True
    )
    disk_used_gb = models.FloatField(null=True, blank=True)
    disk_free_gb = models.FloatField(null=True, blank=True)
    
    # Network Metrics
    network_sent_mb = models.FloatField(null=True, blank=True)
    network_recv_mb = models.FloatField(null=True, blank=True)
    network_connections = models.IntegerField(null=True, blank=True)
    
    # Load Average
    load_avg_1min = models.FloatField(null=True, blank=True)
    load_avg_5min = models.FloatField(null=True, blank=True)
    load_avg_15min = models.FloatField(null=True, blank=True)
    
    # Process Count
    total_processes = models.IntegerField(default=0)
    running_processes = models.IntegerField(default=0)
    sleeping_processes = models.IntegerField(default=0)
    
    # Uptime
    uptime_seconds = models.BigIntegerField(null=True, blank=True)
    boot_time = models.DateTimeField(null=True, blank=True)
    
    # Additional Metrics
    swap_percent = models.FloatField(
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        null=True,
        blank=True
    )
    temperature_celsius = models.FloatField(null=True, blank=True)
    
    # Metadata
    snapshot_metadata = models.JSONField(default=dict, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['host', '-created_at']),
            models.Index(fields=['created_at', 'is_deleted']),
            models.Index(fields=['host', 'cpu_percent']),
        ]
        verbose_name = 'Snapshot'
        verbose_name_plural = 'Snapshots'
    
    def __str__(self):
        return f"Snapshot for {self.host.hostname} at {self.created_at}"
    
    @property
    def is_healthy(self):
        """Check if system is healthy"""
        return all([
            (self.cpu_percent or 0) < 80,
            (self.memory_percent or 0) < 85,
            (self.disk_percent or 0) < 90,
        ])


# ============================================================================
# PROCESS MODELS
# ============================================================================

class Process(TimeStampedModel):
    """
    Individual process information within a snapshot
    """
    class ProcessStatus(models.TextChoices):
        RUNNING = 'running', 'Running'
        SLEEPING = 'sleeping', 'Sleeping'
        STOPPED = 'stopped', 'Stopped'
        ZOMBIE = 'zombie', 'Zombie'
        DEAD = 'dead', 'Dead'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    snapshot = models.ForeignKey(
        Snapshot,
        on_delete=models.CASCADE,
        related_name='processes'
    )
    
    # Process Identification
    pid = models.IntegerField(db_index=True)
    ppid = models.IntegerField(null=True, blank=True, db_index=True)
    name = models.CharField(max_length=512, db_index=True)
    cmdline = models.TextField(blank=True, null=True)
    exe = models.CharField(max_length=1024, blank=True, null=True)
    
    # Process Ownership
    username = models.CharField(max_length=255, blank=True, null=True)
    uid = models.IntegerField(null=True, blank=True)
    gid = models.IntegerField(null=True, blank=True)
    
    # Resource Usage
    cpu_percent = models.FloatField(
        validators=[MinValueValidator(0)],
        null=True,
        blank=True,
        db_index=True
    )
    memory_mb = models.FloatField(
        validators=[MinValueValidator(0)],
        null=True,
        blank=True,
        db_index=True
    )
    memory_percent = models.FloatField(
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        null=True,
        blank=True
    )
    
    # Process Details
    status = models.CharField(
        max_length=20,
        choices=ProcessStatus.choices,
        default=ProcessStatus.RUNNING
    )
    num_threads = models.IntegerField(null=True, blank=True)
    num_fds = models.IntegerField(null=True, blank=True)  # File descriptors
    
    # Timing
    create_time = models.DateTimeField(null=True, blank=True)
    
    # I/O Stats
    io_read_mb = models.FloatField(null=True, blank=True)
    io_write_mb = models.FloatField(null=True, blank=True)
    
    # Priority
    nice = models.IntegerField(null=True, blank=True)
    priority = models.IntegerField(null=True, blank=True)
    
    # Additional Info
    process_metadata = models.JSONField(default=dict, blank=True)
    
    class Meta:
        ordering = ['-cpu_percent', '-memory_mb']
        indexes = [
            models.Index(fields=['snapshot', 'pid']),
            models.Index(fields=['pid', 'ppid']),
            models.Index(fields=['name', 'snapshot']),
            models.Index(fields=['-cpu_percent']),
            models.Index(fields=['-memory_mb']),
        ]
        unique_together = [['snapshot', 'pid']]
        verbose_name = 'Process'
        verbose_name_plural = 'Processes'
    
    def __str__(self):
        return f"{self.name} (PID: {self.pid})"
    
    def get_children(self):
        """Get child processes"""
        return Process.objects.filter(
            snapshot=self.snapshot,
            ppid=self.pid
        )
    
    def get_parent(self):
        """Get parent process"""
        if self.ppid:
            return Process.objects.filter(
                snapshot=self.snapshot,
                pid=self.ppid
            ).first()
        return None


# ============================================================================
# TASK MODELS (Background Jobs)
# ============================================================================

class Task(TimeStampedModel):
    """
    Background task tracking
    """
    class TaskStatus(models.TextChoices):
        PENDING = 'pending', 'Pending'
        RUNNING = 'running', 'Running'
        SUCCESS = 'success', 'Success'
        FAILED = 'failed', 'Failed'
        RETRY = 'retry', 'Retry'
        CANCELLED = 'cancelled', 'Cancelled'
    
    class TaskType(models.TextChoices):
        SNAPSHOT = 'snapshot', 'Snapshot Collection'
        ALERT = 'alert', 'Alert Processing'
        REPORT = 'report', 'Report Generation'
        CLEANUP = 'cleanup', 'Data Cleanup'
        ANALYTICS = 'analytics', 'Analytics Processing'
        BACKUP = 'backup', 'Backup'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Task Identification
    name = models.CharField(max_length=512, db_index=True)
    task_type = models.CharField(
        max_length=50,
        choices=TaskType.choices,
        default=TaskType.SNAPSHOT,
        db_index=True
    )
    celery_task_id = models.CharField(max_length=255, unique=True, null=True, blank=True)
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=TaskStatus.choices,
        default=TaskStatus.PENDING,
        db_index=True
    )
    
    # Timing
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    # Related Objects
    host = models.ForeignKey(
        Host,
        on_delete=models.CASCADE,
        related_name='tasks',
        null=True,
        blank=True
    )
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='tasks'
    )
    
    # Results & Errors
    result = models.JSONField(default=dict, blank=True)
    error_message = models.TextField(blank=True, null=True)
    stack_trace = models.TextField(blank=True, null=True)
    
    # Retry Logic
    retry_count = models.IntegerField(default=0)
    max_retries = models.IntegerField(default=3)
    
    # Metadata
    task_args = models.JSONField(default=dict, blank=True)
    task_kwargs = models.JSONField(default=dict, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', '-created_at']),
            models.Index(fields=['host', 'task_type']),
            models.Index(fields=['celery_task_id']),
        ]
        verbose_name = 'Task'
        verbose_name_plural = 'Tasks'
    
    def __str__(self):
        return f"{self.name} - {self.status}"
    
    @property
    def duration_seconds(self):
        """Calculate task duration"""
        if self.started_at and self.completed_at:
            return (self.completed_at - self.started_at).total_seconds()
        return None
    
    def mark_running(self):
        """Mark task as running"""
        self.status = self.TaskStatus.RUNNING
        self.started_at = timezone.now()
        self.save(update_fields=['status', 'started_at'])
    
    def mark_success(self, result=None):
        """Mark task as successful"""
        self.status = self.TaskStatus.SUCCESS
        self.completed_at = timezone.now()
        if result:
            self.result = result
        self.save(update_fields=['status', 'completed_at', 'result'])
    
    def mark_failed(self, error_message=None, stack_trace=None):
        """Mark task as failed"""
        self.status = self.TaskStatus.FAILED
        self.completed_at = timezone.now()
        if error_message:
            self.error_message = error_message
        if stack_trace:
            self.stack_trace = stack_trace
        self.save(update_fields=['status', 'completed_at', 'error_message', 'stack_trace'])
