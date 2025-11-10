from flask_bcrypt import Bcrypt

bcrypt = Bcrypt()

def has_value(value):
    return not (value is None or (isinstance(value, str) and value.strip() == ''))
