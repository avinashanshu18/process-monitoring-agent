# admin.py
from django.contrib import admin
from .models import Host, Snapshot, Process

admin.site.register(Host)
admin.site.register(Snapshot)
admin.site.register(Process)
