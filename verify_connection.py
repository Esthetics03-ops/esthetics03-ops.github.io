import os
from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials

def test_drive_connection():
    try:
        # Check if the token file exists (generated after first login)
        if not os.path.exists('token.json'):
            print("Error: token.json not found. Run your main auth script first.")
            return

        # Load credentials
        creds = Credentials.from_authorized_user_file('token.json', ['https://www.googleapis.com/auth/drive.metadata.readonly'])
        
        # Build service
        service = build('drive', 'v3', credentials=creds)
        
        # Request metadata for the last 5 files
        results = service.files().list(pageSize=5, fields="files(id, name)").execute()
        files = results.get('files', [])
        
        print("Success! Connection established. Found the following files:")
        for file in files:
            print(f"- {file['name']} (ID: {file['id']})")
            
    except Exception as e:
        print(f"Connection test failed: {e}")

if __name__ == "__main__":
    test_drive_connection()
