from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import SVC
from sklearn.model_selection import train_test_split, GridSearchCV
import joblib
import logging
app = Flask(__name__)
CORS(app)
logging.basicConfig(level=logging.DEBUG)
relationship_dict = {
    'user1': ['user2', 'user3'],
    'user2': ['user1'],
    'user3': ['user1'],
}

def are_users_related(user1, user2, relationship_dict):
    return user2 in relationship_dict.get(user1, [])

df = pd.read_excel("training_xldataset.xlsx")
tfidf_vectorizer = TfidfVectorizer(max_features=1000)
X = tfidf_vectorizer.fit_transform(df['tweet'])
y = df['class']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.20, random_state=42)
param_grid = {'C': [0.1, 1, 10, 100], 'kernel': ['linear', 'rbf']}
svc = SVC()
grid_search = GridSearchCV(svc, param_grid, cv=3)
grid_search.fit(X_train, y_train)
joblib.dump(grid_search, 'svm_model.pkl')
joblib.dump(tfidf_vectorizer, 'tfidf_vectorizer.pkl')
model = joblib.load('svm_model.pkl')
vectorizer = joblib.load('tfidf_vectorizer.pkl')
@app.route('/check_relationship', methods=['POST'])
def check_relationship():
    try:
        data = request.json
        user1 = data['user1']
        user2 = data['user2']
        related = are_users_related(user1, user2, relationship_dict)
        return jsonify({'related': related})
    except KeyError as e:
        logging.error(f'Missing key: {e}')
        return jsonify({'error': f'Missing key: {e}'}), 400
    except Exception as e:
        logging.error(f'Error: {e}')
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/check_cyberbullying', methods=['POST'])
def check_cyberbullying():
    try:
        data = request.json
        text = data['text']
        text_vectorized = vectorizer.transform([text])
        predicted_class = model.predict(text_vectorized)
        return jsonify({'predicted_class': int(predicted_class[0])}) 
    except KeyError as e:
        logging.error(f'Missing key: {e}')
        return jsonify({'error': f'Missing key: {e}'}), 400
    except Exception as e:
        logging.error(f'Error: {e}')
        return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    app.run()
