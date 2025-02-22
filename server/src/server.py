from flask import Flask
from flask_restful import Api
from flask_cors import CORS
from flask_bcrypt import Bcrypt
import jwt  
from dotenv import load_dotenv
import sys
from api.config import DEFAULT_SECRET_KEY

# Load environment variables at the start
load_dotenv()

# Handle command-line argument or use default
SECRET_KEY = DEFAULT_SECRET_KEY

# Import your API resources and utilities
from utilities.swen_344_db_utils import exec_sql_file
from api.Signup_api import SignUpApi
from api.character_creation_api import CharacterCreationApi
from api.character_creation_api import CharacterImage
from api.chat_with_character_api import ChatWithCharacter
from api.chat_with_character_api import ProfilePic
from api.profile_api import ProfileAPI
from api.chat_storage_api import StoredCharactersAPI,StoredChatAPI
from api.profile_pic_api import UploadProfilePicAPI
from api.profile_pic_api import UploadCharacterImageAPI
from api.profile_pic_api import BackgroundImageAPI

app = Flask(__name__)
CORS(app)
bcrypt = Bcrypt(app)
app.config['SECRET_KEY'] = 'your_secret_key'
app.config['JWT_SECRET_KEY'] = 'your_jwt_secret_key'
app.config['S3_BUCKET_NAME'] = 'profile-picture-docs'
# Flask app configuration
app.config['SECRET_KEY'] = SECRET_KEY

api = Api(app)

# Add resources to API
api.add_resource(SignUpApi, '/signup', resource_class_kwargs={'bcrypt': bcrypt})
api.add_resource(CharacterCreationApi, '/create_character')
api.add_resource(CharacterImage,'/character_image/<int:character_id>')
api.add_resource(ChatWithCharacter,'/chat_with_character')
api.add_resource(ProfilePic,'/profile_pic/<int:character_id>')
api.add_resource(ProfileAPI,'/profile')
api.add_resource(StoredCharactersAPI,'/getchacters')
api.add_resource(StoredChatAPI,'/stored_chat')
api.add_resource(UploadProfilePicAPI,'/upload_image',resource_class_kwargs={'s3_bucket': app.config['S3_BUCKET_NAME']})
api.add_resource(UploadCharacterImageAPI,'/character_image/<int:character_id>',resource_class_kwargs={'s3_bucket': app.config['S3_BUCKET_NAME']})
api.add_resource(BackgroundImageAPI,'/background_image',resource_class_kwargs={'s3_bucket': app.config['S3_BUCKET_NAME']})


def setup_database():
    print("Setting up the database...")
    exec_sql_file('data/data.sql')

if __name__ == '__main__':
    setup_database()
    app.run(host='0.0.0.0')
    app.run(debug=True)
