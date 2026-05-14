from services.databaseService import get_db

class Model:
    @staticmethod
    def query_one(sql, params=None):
        db = get_db()
        cursor = db.cursor()
        cursor.execute(sql, params or ())
        return cursor.fetchone()
    
    @staticmethod
    def query_all(sql, params=None):
        db = get_db()
        cursor = db.cursor()
        cursor.execute(sql, params or ())
        return cursor.fetchall()
    
    @staticmethod
    def execute(sql, params=None):
        db = get_db()
        cursor = db.cursor()
        cursor.execute(sql, params or ())
        db.commit()
        return cursor.lastrowid