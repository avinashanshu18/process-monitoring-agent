# from rest_framework import serializers
# from .models import Host, Snapshot, Process

# class ProcessInSerializer(serializers.Serializer):
#     pid = serializers.IntegerField()
#     ppid = serializers.IntegerField(allow_null=True, required=False)
#     name = serializers.CharField()
#     cpu_percent = serializers.FloatField(required=False, allow_null=True)
#     memory_mb = serializers.FloatField(required=False, allow_null=True)

# class SnapshotInSerializer(serializers.Serializer):
#     hostname = serializers.CharField()
#     processes = ProcessInSerializer(many=True)

# class ProcessOutSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Process
#         fields = ["pid", "ppid", "name", "cpu_percent", "memory_mb"]



# class SnapshotOutSerializer(serializers.ModelSerializer):
#     hostname = serializers.SerializerMethodField()
#     processes = ProcessOutSerializer(many=True)  # fixed: removed redundant source

#     class Meta:
#         model = Snapshot
#         fields = ["id", "hostname", "created_at", "processes"]

#     def get_hostname(self, obj):
#         return obj.host.hostname



"""
Production-Grade Serializers
Includes: Validation, Nested Serialization, Custom Fields, Performance Optimization
"""
from rest_framework import serializers
from django.contrib.auth.models import User
from django.db.models import Avg, Max, Min, Count
from django.utils import timezone
from datetime import timedelta
from .models import Host, Snapshot, Process, Task


# ============================================================================
# USER SERIALIZERS
# ============================================================================

class UserSerializer(serializers.ModelSerializer):
    """Basic user serializer"""
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = ['id']


# ============================================================================
# HOST SERIALIZERS
# ============================================================================

class HostListSerializer(serializers.ModelSerializer):
    """
    Lightweight host serializer for list views
    """
    owner = UserSerializer(read_only=True)
    health_score = serializers.SerializerMethodField()
    is_online = serializers.SerializerMethodField()
    uptime_hours = serializers.SerializerMethodField()
    
    class Meta:
        model = Host
        fields = [
            'id', 'hostname', 'display_name', 'ip_address',
            'status', 'last_seen', 'monitoring_enabled',
            'os_name', 'os_version', 'cpu_cores', 'total_memory_gb',
            'owner', 'health_score', 'is_online', 'uptime_hours',
            'tags', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'last_seen']
    
    def get_health_score(self, obj):
        """Calculate health score"""
        return obj.get_health_score()
    
    def get_is_online(self, obj):
        """Check if host is online (last seen < 5 minutes)"""
        if not obj.last_seen:
            return False
        return (timezone.now() - obj.last_seen) < timedelta(minutes=5)
    
    def get_uptime_hours(self, obj):
        """Get uptime in hours"""
        latest_snapshot = obj.get_latest_snapshot()
        if latest_snapshot and latest_snapshot.uptime_seconds:
            return round(latest_snapshot.uptime_seconds / 3600, 2)
        return None


class HostDetailSerializer(serializers.ModelSerializer):
    """
    Detailed host serializer with nested data
    """
    owner = UserSerializer(read_only=True)
    latest_snapshot = serializers.SerializerMethodField()
    stats_24h = serializers.SerializerMethodField()
    top_processes = serializers.SerializerMethodField()
    alert_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Host
        fields = [
            'id', 'hostname', 'display_name', 'ip_address',
            'api_key', 'status', 'last_seen', 'monitoring_enabled',
            'os_name', 'os_version', 'architecture',
            'cpu_cores', 'total_memory_gb', 'total_disk_gb',
            'owner', 'workspace', 'tags', 'metadata', 'notes',
            'latest_snapshot', 'stats_24h', 'top_processes', 'alert_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'api_key', 'created_at', 'updated_at', 'last_seen']
    
    def get_latest_snapshot(self, obj):
        """Get latest snapshot data"""
        snapshot = obj.get_latest_snapshot()
        if snapshot:
            return SnapshotSerializer(snapshot).data
        return None
    
    def get_stats_24h(self, obj):
        """Get 24-hour statistics"""
        time_24h_ago = timezone.now() - timedelta(hours=24)
        snapshots = obj.snapshots.filter(
            created_at__gte=time_24h_ago,
            is_deleted=False
        )
        
        if not snapshots.exists():
            return None
        
        stats = snapshots.aggregate(
            avg_cpu=Avg('cpu_percent'),
            max_cpu=Max('cpu_percent'),
            avg_memory=Avg('memory_percent'),
            max_memory=Max('memory_percent'),
            avg_disk=Avg('disk_percent'),
            snapshot_count=Count('id')
        )
        
        return {
            'avg_cpu_percent': round(stats['avg_cpu'] or 0, 2),
            'max_cpu_percent': round(stats['max_cpu'] or 0, 2),
            'avg_memory_percent': round(stats['avg_memory'] or 0, 2),
            'max_memory_percent': round(stats['max_memory'] or 0, 2),
            'avg_disk_percent': round(stats['avg_disk'] or 0, 2),
            'snapshot_count': stats['snapshot_count']
        }
    
    def get_top_processes(self, obj):
        """Get top 5 processes by CPU from latest snapshot"""
        latest = obj.get_latest_snapshot()
        if not latest:
            return []
        
        top_procs = latest.processes.order_by('-cpu_percent')[:5]
        return ProcessListSerializer(top_procs, many=True).data
    
    def get_alert_count(self, obj):
        """Get active alert count"""
        # This will be implemented when we create the alerts app
        return 0


class HostCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating hosts
    """
    
    class Meta:
        model = Host
        fields = [
            'hostname', 'display_name', 'ip_address',
            'os_name', 'os_version', 'architecture',
            'cpu_cores', 'total_memory_gb', 'total_disk_gb',
            'tags', 'metadata', 'notes', 'monitoring_enabled'
        ]
    
    def create(self, validated_data):
        """Create host with auto-generated API key"""
        host = Host.objects.create(**validated_data)
        host.generate_api_key()
        
        # Set owner from request user
        request = self.context.get('request')
        if request and request.user:
            host.owner = request.user
            host.save()
        
        return host


# ============================================================================
# SNAPSHOT SERIALIZERS
# ============================================================================

class SnapshotListSerializer(serializers.ModelSerializer):
    """
    Lightweight snapshot serializer for list views
    """
    host_name = serializers.CharField(source='host.hostname', read_only=True)
    process_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Snapshot
        fields = [
            'id', 'host', 'host_name', 'created_at',
            'cpu_percent', 'memory_percent', 'disk_percent',
            'network_sent_mb', 'network_recv_mb',
            'total_processes', 'process_count', 'uptime_seconds'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_process_count(self, obj):
        """Get process count"""
        return obj.processes.count()


class SnapshotSerializer(serializers.ModelSerializer):
    """
    Detailed snapshot serializer
    """
    host_name = serializers.CharField(source='host.hostname', read_only=True)
    is_healthy = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Snapshot
        fields = [
            'id', 'host', 'host_name', 'created_at',
            # CPU & Memory
            'cpu_percent', 'memory_percent', 'memory_used_gb', 'memory_available_gb',
            # Disk
            'disk_percent', 'disk_used_gb', 'disk_free_gb',
            # Network
            'network_sent_mb', 'network_recv_mb', 'network_connections',
            # Load
            'load_avg_1min', 'load_avg_5min', 'load_avg_15min',
            # Processes
            'total_processes', 'running_processes', 'sleeping_processes',
            # Uptime
            'uptime_seconds', 'boot_time',
            # Other
            'swap_percent', 'temperature_celsius',
            'is_healthy', 'snapshot_metadata'
        ]
        read_only_fields = ['id', 'created_at', 'is_healthy']


class SnapshotCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating snapshots (from agents)
    """
    
    class Meta:
        model = Snapshot
        fields = [
            'host', 'cpu_percent', 'memory_percent', 'memory_used_gb', 'memory_available_gb',
            'disk_percent', 'disk_used_gb', 'disk_free_gb',
            'network_sent_mb', 'network_recv_mb', 'network_connections',
            'load_avg_1min', 'load_avg_5min', 'load_avg_15min',
            'total_processes', 'running_processes', 'sleeping_processes',
            'uptime_seconds', 'boot_time', 'swap_percent', 'temperature_celsius',
            'snapshot_metadata'
        ]
    
    def validate_cpu_percent(self, value):
        """Validate CPU percentage"""
        if value is not None and (value < 0 or value > 100):
            raise serializers.ValidationError("CPU percent must be between 0 and 100")
        return value
    
    def validate_memory_percent(self, value):
        """Validate memory percentage"""
        if value is not None and (value < 0 or value > 100):
            raise serializers.ValidationError("Memory percent must be between 0 and 100")
        return value
    
    def create(self, validated_data):
        """Create snapshot and update host status"""
        snapshot = super().create(validated_data)
        
        # Update host last_seen and status
        host = snapshot.host
        host.mark_online()
        
        return snapshot


# ============================================================================
# PROCESS SERIALIZERS
# ============================================================================

class ProcessListSerializer(serializers.ModelSerializer):
    """
    Lightweight process serializer for list views
    """
    
    class Meta:
        model = Process
        fields = [
            'id', 'pid', 'ppid', 'name', 'username',
            'cpu_percent', 'memory_mb', 'memory_percent',
            'status', 'num_threads', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class ProcessSerializer(serializers.ModelSerializer):
    """
    Detailed process serializer
    """
    parent = serializers.SerializerMethodField()
    children_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Process
        fields = [
            'id', 'snapshot', 'pid', 'ppid', 'name', 'cmdline', 'exe',
            'username', 'uid', 'gid',
            'cpu_percent', 'memory_mb', 'memory_percent',
            'status', 'num_threads', 'num_fds',
            'create_time', 'io_read_mb', 'io_write_mb',
            'nice', 'priority', 'process_metadata',
            'parent', 'children_count', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_parent(self, obj):
        """Get parent process info"""
        parent = obj.get_parent()
        if parent:
            return {
                'pid': parent.pid,
                'name': parent.name
            }
        return None
    
    def get_children_count(self, obj):
        """Get count of child processes"""
        return obj.get_children().count()


class ProcessBulkCreateSerializer(serializers.Serializer):
    """
    Serializer for bulk creating processes
    """
    processes = serializers.ListField(
        child=serializers.DictField(),
        allow_empty=False
    )
    
    def validate_processes(self, value):
        """Validate process data"""
        required_fields = ['pid', 'name']
        
        for process_data in value:
            for field in required_fields:
                if field not in process_data:
                    raise serializers.ValidationError(
                        f"Missing required field: {field}"
                    )
        
        return value
    
    def create(self, validated_data):
        """Bulk create processes"""
        snapshot = self.context.get('snapshot')
        if not snapshot:
            raise serializers.ValidationError("Snapshot context required")
        
        processes_data = validated_data['processes']
        processes = []
        
        for proc_data in processes_data:
            proc_data['snapshot'] = snapshot
            processes.append(Process(**proc_data))
        
        # Bulk create for performance
        created_processes = Process.objects.bulk_create(
            processes,
            ignore_conflicts=True
        )
        
        return created_processes


# ============================================================================
# TASK SERIALIZERS
# ============================================================================

class TaskSerializer(serializers.ModelSerializer):
    """
    Task serializer
    """
    host_name = serializers.CharField(source='host.hostname', read_only=True)
    user_name = serializers.CharField(source='user.username', read_only=True)
    duration_seconds = serializers.FloatField(read_only=True)
    
    class Meta:
        model = Task
        fields = [
            'id', 'name', 'task_type', 'status', 'celery_task_id',
            'started_at', 'completed_at', 'duration_seconds',
            'host', 'host_name', 'user', 'user_name',
            'result', 'error_message', 'retry_count', 'max_retries',
            'task_args', 'task_kwargs', 'metadata',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'celery_task_id', 'duration_seconds',
            'created_at', 'updated_at'
        ]


# ============================================================================
# STATISTICS SERIALIZERS
# ============================================================================

class HostStatsSerializer(serializers.Serializer):
    """
    Host statistics serializer
    """
    total_hosts = serializers.IntegerField()
    online_hosts = serializers.IntegerField()
    offline_hosts = serializers.IntegerField()
    warning_hosts = serializers.IntegerField()
    critical_hosts = serializers.IntegerField()
    avg_cpu_percent = serializers.FloatField()
    avg_memory_percent = serializers.FloatField()
    avg_disk_percent = serializers.FloatField()


class TimeSeriesDataSerializer(serializers.Serializer):
    """
    Time series data serializer
    """
    timestamp = serializers.DateTimeField()
    value = serializers.FloatField()
    label = serializers.CharField(required=False)


class MetricsTrendSerializer(serializers.Serializer):
    """
    Metrics trend serializer
    """
    metric_name = serializers.CharField()
    data_points = TimeSeriesDataSerializer(many=True)
    avg_value = serializers.FloatField()
    min_value = serializers.FloatField()
    max_value = serializers.FloatField()
