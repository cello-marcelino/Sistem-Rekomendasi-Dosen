from flask import Blueprint
from server.src.controllers.client.client_auth_controller import ClientAuthController

client_bp = Blueprint("client", __name__)

@client_bp.route("/register", methods=["POST"])
def register():
    return ClientAuthController.register()

@client_bp.route("/login", methods=["POST"])
def login():
    return ClientAuthController.login()

@client_bp.route("/me", methods=["GET"])
def get_me():
    return ClientAuthController.get_me()

@client_bp.route("/verify", methods=["GET", "POST"])
def verify_key():
    return ClientAuthController.verify_key()

@client_bp.route("/regenerate-key", methods=["POST"])
def regenerate_key():
    return ClientAuthController.regenerate_key()

