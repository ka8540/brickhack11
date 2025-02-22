from flask import Flask, request, jsonify, make_response
from flask_restful import Resource, reqparse
from db.character_creation import create_character, get_character_description, image_storage, get_user_id, get_image_by_id,set_profile_pic
import cognitojwt  

REGION = 'us-east-1' 
USERPOOL_ID = 'us-east-1_EJkY3NEF3' 
APP_CLIENT_ID = None  

class CharacterCreationApi(Resource):
    
    def post(self):
        token = request.headers.get('Authorization', '').split(' ')[1]
        try:
            jwt_user = cognitojwt.decode(
                token,
                REGION,
                USERPOOL_ID,
                app_client_id=APP_CLIENT_ID,
                testmode=False  
            )

            user_id = get_user_id(jwt_user['email'])
            if not user_id:
                return make_response(jsonify({"message": "User not found"}), 404)

            parser = reqparse.RequestParser()
            fields = ['name', 'gender', 'personalityTraits', 'backgroundStory', 'ageRange',
                      'occupation', 'skills', 'hobbies', 'physicalCharacteristics',
                      'relationshipDynamics', 'personalGoals', 'strengthsWeaknesses']
            for field in fields:
                parser.add_argument(field, type=str, required=True, help=f"{field} is required", location='json')
            args = parser.parse_args()

            prompt = f"Create a detailed character description for a {args['gender']} named {args['name']} with the following traits: {args['personalityTraits']}. Background story: {args['backgroundStory']}. This character is a {args['ageRange']} {args['occupation']} with skills in {args['skills']} and hobbies including {args['hobbies']}. They have {args['physicalCharacteristics']} and {args['relationshipDynamics']} relationships. Their personal goals are {args['personalGoals']}, and they have these strengths and weaknesses: {args['strengthsWeaknesses']}."

            user_data = {field: args[field] for field in fields}
            result = create_character(**user_data, user_id=user_id)
            if not result:
                return make_response(jsonify({"Error": "Error storing the data"}), 401)

            image = get_character_description(prompt)
            if not image:
                return make_response(jsonify({"Error": "Failed to generate Image"}), 500)

            store_image = image_storage(result, image)
            if not store_image:
                return make_response(jsonify({"Error": "Failed to store the images"}), 404)

            return make_response(jsonify(store_image), 200)

        except cognitojwt.exceptions.CognitoJWTException as e:
            # Handle specific cognitojwt exceptions or general exceptions
            return make_response(jsonify({'message': str(e)}), 401)
        except Exception as e:
            return make_response(jsonify({'message': str(e)}), 500)
        
class CharacterImage(Resource):
    def get(self,character_id):
        token = request.headers.get('Authorization', '').split(' ')[1]
        jwt_user = cognitojwt.decode(
            token,
            REGION,
            USERPOOL_ID,
            app_client_id=APP_CLIENT_ID,
            testmode = False
        )
        user_id = get_user_id(jwt_user['email'])
        if not user_id:
            return make_response(jsonify({"message": "User not found"}), 404)
        get_image = get_image_by_id(character_id)
        if not get_image:
            return make_response(jsonify({"message":"No images found"}),201)
        return jsonify(get_image)  

    def put(self,character_id):
        token = request.headers.get('Authorization', '').split(' ')[1]
        jwt_user = cognitojwt.decode(
            token,
            REGION,
            USERPOOL_ID,
            app_client_id=APP_CLIENT_ID,
            testmode = False
        )
        user_id = get_user_id(jwt_user['email'])
        if not user_id:
            return make_response(jsonify({"message": "User not found"}), 404)
        
        parser = reqparse.RequestParser()
        parser.add_argument('profile_pic', type=str, required=True, help="message is required", location='json')
        args = parser.parse_args()
        profile_pic = args['profile_pic']
        response = set_profile_pic(character_id,profile_pic)
        if not response:
            return make_response(jsonify({"Message":"Error setting up Profile Picture"}),404)
        return make_response(jsonify({"message":"Profile Pic updated"}),200)
    


