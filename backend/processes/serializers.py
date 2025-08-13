from rest_framework import serializers
from .models import Host, Snapshot, Process

class ProcessInSerializer(serializers.Serializer):
    pid = serializers.IntegerField()
    ppid = serializers.IntegerField(allow_null=True, required=False)
    name = serializers.CharField()
    cpu_percent = serializers.FloatField(required=False, allow_null=True)
    memory_mb = serializers.FloatField(required=False, allow_null=True)

class SnapshotInSerializer(serializers.Serializer):
    hostname = serializers.CharField()
    processes = ProcessInSerializer(many=True)

class ProcessOutSerializer(serializers.ModelSerializer):
    class Meta:
        model = Process
        fields = ["pid", "ppid", "name", "cpu_percent", "memory_mb"]
#
# class SnapshotOutSerializer(serializers.ModelSerializer):
#     hostname = serializers.SerializerMethodField()
#     processes = ProcessOutSerializer(many=True, source="processes")
#
#     class Meta:
#         model = Snapshot
#         fields = ["id", "hostname", "created_at", "processes"]
#
#     def get_hostname(self, obj):
#         return obj.host.hostname



class SnapshotOutSerializer(serializers.ModelSerializer):
    hostname = serializers.SerializerMethodField()
    processes = ProcessOutSerializer(many=True)  # fixed: removed redundant source

    class Meta:
        model = Snapshot
        fields = ["id", "hostname", "created_at", "processes"]

    def get_hostname(self, obj):
        return obj.host.hostname

