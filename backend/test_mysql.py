import pymysql

def test_conn(user, pwd, db):
    try:
        c = pymysql.connect(host='127.0.0.1', user=user, password=pwd, database=db, port=3306)
        print(f"SUCCESS: {user}@{db}")
        c.close()
    except Exception as e:
        print(f"FAILED: {user}@{db} ({e})")

test_conn('root', '', 'DataletDbLocal')
test_conn('root', '', 'datalethealth')
test_conn('dataletuser', 'Datalet@2026', 'datalethealth')
