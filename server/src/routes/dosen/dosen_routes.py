from flask import Blueprint
from server.src.controllers.dosen.dosen_controller import DosenController

dosen_bp = Blueprint('dosen', __name__)

@dosen_bp.route('/dosen', methods=['GET'])
def get_dosen_list():
    return DosenController.get_all_dosen()

@dosen_bp.route('/dosen/<dosen_id>', methods=['GET'])
def get_dosen_detail(dosen_id):
    return DosenController.get_dosen_by_id(dosen_id)
