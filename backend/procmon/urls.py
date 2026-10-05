# from django.contrib import admin
# from django.urls import path, include

# urlpatterns = [
#     path("admin/", admin.site.urls),
#     path("api/v1/", include("processes.urls")),
# ]



from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/auth/", include("auth_system.urls")),
    path("api/v1/", include("processes.urls")),
]
