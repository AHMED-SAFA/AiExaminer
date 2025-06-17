import os
import uuid
from supabase import create_client, Client
from django.conf import settings
from django.core.files.base import ContentFile
import tempfile

class SupabaseStorage:
    def __init__(self):
        self.supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
    
    def upload_file(self, file, bucket_name, file_path=None):
        """
        Upload file to Supabase storage
        
        Args:
            file: Django file object or file-like object
            bucket_name: Name of the Supabase bucket
            file_path: Optional custom file path, if None generates UUID-based path
            
        Returns:
            Public URL of uploaded file or None if failed
        """
        try:
            # Generate unique filename if not provided
            if file_path is None:
                file_extension = os.path.splitext(file.name)[1] if hasattr(file, 'name') else '.pdf'
                file_path = f"{uuid.uuid4()}{file_extension}"
            
            # Read file content
            if hasattr(file, 'read'):
                file_content = file.read()
                file.seek(0)  # Reset file pointer
            else:
                with open(file, 'rb') as f:
                    file_content = f.read()
            
            # Upload to Supabase
            response = self.supabase.storage.from_(bucket_name).upload(
                path=file_path,
                file=file_content,
                file_options={"content-type": "application/pdf"}
            )
            
            if response:
                # Get public URL
                public_url = self.supabase.storage.from_(bucket_name).get_public_url(file_path)
                return {
                    'url': public_url,
                    'path': file_path,
                    'bucket': bucket_name
                }
            
            return None
            
        except Exception as e:
            print(f"Error uploading to Supabase: {str(e)}")
            return None
    
    def delete_file(self, bucket_name, file_path):
        """
        Delete file from Supabase storage
        
        Args:
            bucket_name: Name of the Supabase bucket
            file_path: Path of the file to delete
            
        Returns:
            True if successful, False otherwise
        """
        try:
            response = self.supabase.storage.from_(bucket_name).remove([file_path])
            return True
        except Exception as e:
            print(f"Error deleting from Supabase: {str(e)}")
            return False
    
    def download_file(self, bucket_name, file_path):
        """
        Download file from Supabase storage
        
        Args:
            bucket_name: Name of the Supabase bucket
            file_path: Path of the file to download
            
        Returns:
            File content as bytes or None if failed
        """
        try:
            response = self.supabase.storage.from_(bucket_name).download(file_path)
            return response
        except Exception as e:
            print(f"Error downloading from Supabase: {str(e)}")
            return None