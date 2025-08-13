from django.urls import path
from .views import (
    IngestSnapshotView,
    LatestSnapshotView,
    HostsView,
    SnapshotListView,
    RotateHostKeyView
)

urlpatterns = [
    path("process-snapshots/", IngestSnapshotView.as_view(), name="ingest"),
    path("process-snapshots/latest/", LatestSnapshotView.as_view(), name="latest"),
    path("hosts/", HostsView.as_view(), name="hosts"),
    path("hosts/rotate-key/", RotateHostKeyView.as_view(), name="rotate-key"),
    path("process-snapshots/history/", SnapshotListView.as_view(), name="history"),
]
