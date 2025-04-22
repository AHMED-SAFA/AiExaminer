from rest_framework import generics, permissions
from rest_framework.response import Response
from auth_app.serializers import UserSerializer

class UpdateUserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def patch(self, request, *args, **kwargs):
        partial = True  
        instance = self.get_object()

        # If email is not provided, add the current user's email to the request data
        mutable_data = (
            request.data.copy() if hasattr(request.data, "copy") else dict(request.data)
        )

        if "email" not in mutable_data or not mutable_data["email"]:
            mutable_data["email"] = instance.email

        # Remove password from the data if it exists
        if "password" in mutable_data:
            mutable_data.pop("password")

        serializer = self.get_serializer(instance, data=mutable_data, partial=partial,)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response(serializer.data, status=200)
