from flask import Flask, request, jsonify
from google.oauth2 import service_account
from googleapiclient.discovery import build
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import json
import sys

app = Flask(__name__)
CORS(app)

# Initialize Flask-Limiter
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["200 per day", "50 per hour"]
)

SERVICE_ACCOUNT_FILE = 'dulcet-fortress-429800-t7-81cb0c48be67.json'
SCOPES = ['https://www.googleapis.com/auth/spreadsheets']

# Charger les informations d'identification
try:
    credentials = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=SCOPES)
    print("Credentials successfully created.", file=sys.stderr)
except Exception as e:
    print(f"Failed to create credentials: {e}", file=sys.stderr)
    sys.exit(1)

SPREADSHEET_ID = '14fJ9BUFKBT2Jmj3yn52LfB3fJ4WLuQVPpshgm1lOnv8'

# Construire le service Google Sheets
try:
    service = build('sheets', 'v4', credentials=credentials)
    print("Service successfully built.", file=sys.stderr)
except Exception as e:
    print(f"Failed to build service: {e}", file=sys.stderr)
    sys.exit(1)

# Fonction pour recevoir une valeur dans la feuille de calcul
def get_value(cellLocation):
    try:
        result = service.spreadsheets().values().get(
            spreadsheetId=SPREADSHEET_ID, range=cellLocation).execute()
        values = result.get('values', [])
        if not values:
            return None
        return values[0][0]
    except Exception as e:
        print(f"Failed to get values: {e}", file=sys.stderr)
        return None


# Fonction pour mettre à jour une valeur dans la feuille de calcul
def update_value(cellLocation, value):
    try:
        body = {
            'range': cellLocation,
            'values': [
                [value]
            ],
            'majorDimension': 'ROWS'
        }
        result = service.spreadsheets().values().update(
            spreadsheetId=SPREADSHEET_ID, range=cellLocation, body=body, valueInputOption='RAW').execute()
        print(f"{result.get('updatedCells')} cells updated.", file=sys.stderr)
    except Exception as e:
        print(f"Failed to update values: {e}", file=sys.stderr)
        sys.exit(1)


# Route pour mettre à jour le score
@app.route('/update_score', methods=['POST'])
@limiter.limit("2 per 1 second")  # Rate limit this endpoint
def update_score():
    data = request.json
    cell_location = data['cell_location']
    new_value = data['new_value']

    try:
        update_value(cell_location, new_value)
        return jsonify({'status': 'success'}), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500
    

# Route pour mettre à jour les commentaires
@app.route('/append_value', methods=['POST'])
def append_value():
    data = request.json
    cell_location = data['cell_location']
    new_value = data['new_value']

    try:
        current_value = get_value(cell_location)
        if current_value:
            json_data = json.loads(current_value)
            if isinstance(json_data, list):
                json_data.append(new_value)
            else:
                json_data = [json_data, new_value]
            updated_value = json.dumps(json_data)
        else:
            updated_value = json.dumps([new_value])
        
        update_value(cell_location, updated_value)
        return jsonify({'status': 'success'}), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)

# Bonjour!
# Cela fait déjà quelques semaines que je travaille sur un projet pour polygossip et j'ai besoin de votre permission pour accéder aux données (les réponses du google sheet). C'est un peu comme reddit, mais tout est anonyme. Mon site ne fait qu'afficher les réponses, like, dislike et commentaires des réponses. Je remarquais que les élèves s'ennuyait beaucoup
# lorsque vous ne publiez pas sur la page Instagram, donc j'ai voulu palier au problème! Si jamais vous avez des questions,
# je suis tout ouïe.

# Je peux vous fournir le code si vous vous y connaissez un peu, le site sera open source de toutes les façons. 
