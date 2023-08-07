from flask import Flask,jsonify
from flask import request
from flask_cors import CORS
import nltk
from nltk.stem import PorterStemmer
from nltk.corpus import stopwords
import demoji
import re
import qalsadi.lemmatizer
import tensorflow as tf
from tensorflow.keras.preprocessing.sequence import pad_sequences
import emoji
import pickle
App = Flask(__name__)
CORS(App)
# Arabic model
modelAr=tf.keras.models.load_model('Models/arab_model')
with open('Models/tokenizer.pkl', 'rb') as f:
    tokenizer=pickle.load(f)
with open('Models/english_model.pkl', 'rb') as f:
    modelEn=pickle.load(f)
with open('Models/vectorizer.pkl', 'rb') as f:
    vectorizer = pickle.load(f)
    
def arab_model(text):
    
    text=re.sub(r'http\S+', '', text)
    text=re.sub(r'^@[^ ]*', '', text)
    text=re.sub('[%s]' % re.escape("""0123456789!»"#$%&'()*+,،-./:;<=>؟?@[\]^_`{|}~"""), ' ', text)
    text=re.sub(r'\s+',' ', text)   
    stopWords=list(set(stopwords.words("arabic")))
    text=" ".join([word for word in text.split() if word not in stopWords])
    text=demoji.replace(text,'')
    lemmer = qalsadi.lemmatizer.Lemmatizer()
    text=lemmer.lemmatize_text(text)
    text=" ".join(text)
    encoded_docs = tokenizer.texts_to_sequences([text])
    max_length = 100
    padded_docs = pad_sequences(encoded_docs, maxlen=max_length, padding='post')
    return padded_docs

def english_model(text):
    stemmer = PorterStemmer()
    text = text.lower()
    text = str(emoji.demojize(text))
    text = re.sub("https://t.co/[a-zA-Z0-9]+"," ", text)
    text = re.sub("[^\w]"," ",text)
    stop_words = set(stopwords.words('english'))
    stop_words.add("amp")
    text = nltk.word_tokenize(text)
    text = [word for word in text if word.lower() not in stop_words]
    text = [stemmer.stem(token) for token in text]
    result = ' '.join(text)
    test_features = vectorizer.transform([result])
    test_features_array = test_features.toarray()
    test_features_reshaped = test_features_array.reshape((test_features_array.shape[0], 1, test_features_array.shape[1]))
    return test_features_reshaped
    
@App.route('/test',methods=['POST'])
def test():
    if request.method == 'POST':
        data=request.get_json()
        text=data.get('text')
        lang=data.get('lang')
    
        if lang=="ar":
            pred=modelAr.predict(arab_model(text))
        else:
            pred=modelEn.predict(english_model(text))

        return jsonify({'percentage':pred[0][0]*100})

if __name__ == '__main__':
    App.run(debug=True)