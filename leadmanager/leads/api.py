from leads.models import User
from rest_framework import viewsets, permissions
from .serializers import LeadSerializer 

# Lead Viewset 
# Viewser: Allows us to create a full CRUD API 
# Viewsets in the Django Documentation. We can just use a DefaultRouter 


class LeadViewSet(viewsets.ModelViewSet): 
    queryset = User.objects.all()
    permission_classes = [
        permissions.AllowAny
        # wide open right now 
    ]
    serializer_class = LeadSerializer