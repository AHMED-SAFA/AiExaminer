from rest_framework import generics, permissions
from rest_framework.response import Response
from auth_app.serializers import UserSerializer
from auth_app.utils import upload_to_cloudinary


class UpdateUserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def patch(self, request, *args, **kwargs):
        partial = True
        instance = self.get_object()

        # Create mutable data
        mutable_data = (
            request.data.copy() if hasattr(request.data, "copy") else dict(request.data)
        )

        # Handle image upload to Cloudinary
        if "image" in request.FILES:
            image_url, public_id = upload_to_cloudinary(
                request.FILES["image"], public_id=instance.image_public_id
            )
            if image_url and public_id:
                mutable_data["image"] = image_url
                instance.image_public_id = public_id
                instance.save()

        # If email is not provided, add the current user's email
        if "email" not in mutable_data or not mutable_data["email"]:
            mutable_data["email"] = instance.email

        # Remove password if it exists
        if "password" in mutable_data:
            mutable_data.pop("password")

        serializer = self.get_serializer(instance, data=mutable_data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response(serializer.data, status=200)
