from flask_bcrypt import Bcrypt
from decimal import Decimal, InvalidOperation


bcrypt = Bcrypt()

def has_value(value):
    return not (value is None or (isinstance(value, str) and value.strip() == ''))

def _parse_decimal(val, field, min_value=None, max_value=None, scale="0.0001"):
    if val is None:
        raise ValueError(f'El campo "{field}" es obligatorio')
    try:
        d = Decimal(str(val))
    except (InvalidOperation, TypeError):
        raise ValueError(f'El campo "{field}" debe ser numérico')
    if min_value is not None and d < Decimal(str(min_value)):
        raise ValueError(f'El campo "{field}" debe ser ≥ {min_value}')
    if max_value is not None and d > Decimal(str(max_value)):
        raise ValueError(f'El campo "{field}" debe ser ≤ {max_value}')
    return d.quantize(Decimal(scale))