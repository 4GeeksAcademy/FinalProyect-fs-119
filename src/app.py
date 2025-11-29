import os
from datetime import timedelta
from flask import Flask, jsonify, send_from_directory
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from api.utils import APIException, generate_sitemap
from api.models import db
from api.admin import setup_admin
from api.commands import setup_commands
from api.extensions import bcrypt, mail
import api.routes.user as api_user
import api.routes.rest as api_rest
import api.routes.cat as api_cat
import api.routes.ingr as api_ingr
import api.routes.dish as api_dish
import api.routes.dising as api_dising

from flask_mail import Message

ENV = "development" if os.getenv("FLASK_DEBUG") == "1" else "production"
static_file_dir = os.path.join(os.path.dirname(
    os.path.realpath(__file__)), '../dist/')
app = Flask(__name__)
app.url_map.strict_slashes = False


app.config.update(dict(
    DEBUG=False,
    MAIL_SERVER='smtp.gmail.com', #Dia 44 - Recuperación de Contraseña pt1-- min:13:13
    MAIL_PORT=587,
    MAIL_USE_TLS=True,
    MAIL_USE_SSL=False,
    MAIL_USERNAME='setadish@gmail.com', #AÑADIR CORREO EXISTENTE
    MAIL_PASSWORD=os.getenv('MAIL_PASSWORD')

))

#mail = Mail(app)

# JWT config
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "supersecretkey")
ACCESS_MIN = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES_MIN", "60"))
REFRESH_DAYS = int(os.getenv("JWT_REFRESH_TOKEN_EXPIRES_DAYS", "30"))
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(minutes=ACCESS_MIN)
app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(days=REFRESH_DAYS)

app.config["ACCESS_MIN"] = ACCESS_MIN
app.config["REFRESH_DAYS"] = REFRESH_DAYS


db_url = os.getenv("DATABASE_URL")
if db_url:
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url.replace(
        "postgres://", "postgresql://")
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:////tmp/test.db"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

MIGRATE = Migrate(app, db, compare_type=True)
db.init_app(app)
bcrypt.init_app(app)            # <-- NUEVO
CORS(app)
jwt = JWTManager(app)
mail.init_app(app)

setup_admin(app)
setup_commands(app)

app.register_blueprint(api_user.auth_bp, url_prefix='/api/user')
app.register_blueprint(api_rest.rest_bp)
app.register_blueprint(api_cat.cat_bp)
app.register_blueprint(api_ingr.ingr_bp)
app.register_blueprint(api_dish.dish_bp)
app.register_blueprint(api_dising.dising_bp)

@app.errorhandler(APIException)
def handle_invalid_usage(error):
    return jsonify(error.to_dict()), error.status_code


@app.route('/')
def sitemap():
    if ENV == "development":
        return generate_sitemap(app)
    return send_from_directory(static_file_dir, 'index.html')


@app.route('/<path:path>', methods=['GET'])
def serve_any_other_file(path):
    if not os.path.isfile(os.path.join(static_file_dir, path)):
        path = 'index.html'
    response = send_from_directory(static_file_dir, path)
    response.cache_control.max_age = 0
    return response


if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 3001))
    app.run(host='0.0.0.0', port=PORT, debug=True)
