"""""
import os, secrets
from datetime import datetime, timedelta, timezone
from flask import Blueprint, request, jsonify, current_app
from sqlalchemy import func
from flask_mail import Message
from api.models import db, User, PasswordResetToken
from api.extensions import bcrypt, mail

password_bp = Blueprint('api/password', __name__)



def _frontend_url() -> str:
    return os.getenv("FRONTEND_URL)

def _token_ttl_minutes() -> int:
    try:
        return int(os.getenv("PASSWORD_RESET_TOKEN_MINUTES", "60"))
    except Exception:
        return 60

        
@password_bp.route('/api/password/forgot', methods=['POST'])
def forgot_password():
    data = request.get_json(silent=True) or {}
    email = (data.get('email') or "").strip().lower()
    if not email:
        return jsonify({"msg": "Debes enviar un email"}), 400

    user = User.query.filter(func.lower(User.email) == email).first()

    if user:
        PasswordResetToken.query.filter_by(user_id=user.id, used=False).delete()

       
        token = secrets.token_urlsafe(48)
        ttl = _token_ttl_minutes()
        prt = PasswordResetToken(
            user_id=user.id,
            token=token,
            expires_at=datetime.now(timezone.utc) + timedelta(minutes=ttl),
            used=False
        )
        db.session.add(prt)
        db.session.commit()

        reset_link = f"{_frontend_url().rstrip('/')}/reset-password?token={token}"

       
        msg = Message(
            subject="Restablece tu contraseña",
            recipients=[user.email]  # no uses display names aquí
        )
        msg.html = 
            '<div style="font-family:system-ui,-apple-system,Segoe UI,Roboto;">
                <h2>Restablecer contraseña</h2>
                <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace:</p>
                <p><a href="{reset_link}">Restablecer contraseña</a></p>
                <p>Si no fuiste tú, ignora este mensaje. Este enlace caduca en {ttl} minutos.</p>
            </div>'
        
        try:
            mail.send(msg)
        except Exception as e:
            current_app.logger.exception("Error enviando email de reset: %s", e)

    return jsonify({"msg": "Si el correo existe, recibirás un enlace de recuperación"}), 200

    
@password_bp.route('/api/password/validate', methods=['GET'])
def validate_token():
    token = (request.args.get('token') or "").strip()
    if not token:
        return jsonify({"valid": False, "reason": "token_missing"}), 400

    prt = PasswordResetToken.query.filter_by(token=token).first()
    if not prt or not prt.is_valid():
        return jsonify({"valid": False}), 200

    return jsonify({"valid": True}), 200


@password_bp.route('/api/password/reset', methods=['POST'])
def reset_password():
    data = request.get_json(silent=True) or {}
    token = (data.get('token') or "").strip()
    p1 = data.get('password') or ""
    p2 = data.get('password2') or ""

    if not token or not p1 or not p2:
        return jsonify({"msg": "Faltan campos"}), 400
    if p1 != p2:
        return jsonify({"msg": "Las contraseñas no coinciden"}), 400
    if len(p1) < 8:
        return jsonify({"msg": "La contraseña debe tener al menos 8 caracteres"}), 400

    prt = PasswordResetToken.query.filter_by(token=token).first()
    if not prt or not prt.is_valid():
        return jsonify({"msg": "Token inválido o caducado"}), 400

    user = prt.user
    user.password = bcrypt.generate_password_hash(p1).decode("utf-8")
    prt.used = True
    db.session.commit()

    return jsonify({"msg": "Contraseña actualizada correctamente"}), 200    

    
    
"""