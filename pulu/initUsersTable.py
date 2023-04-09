import sys
import psycopg2

# Get the arguments passed to the Python script
args = sys.argv

db_host = args[1].split(':')[0]
db_port = args[2]
db_name = args[3]
db_user = args[4]
db_password = args[5]

#debug remove:
print("db_host: " + db_host + " db_port:" + db_port + " db_name:" + db_name + " db_user:" + db_user + " db_password:" + db_password)


# Connect to the database
conn = psycopg2.connect(
    host=db_host,
    port=db_port,
    dbname=db_name,
    user=db_user,
    password=db_password
)

# Open a cursor to execute SQL queries
cur = conn.cursor()


createUsersTableQuery = """
CREATE TABLE users (
    candId INTEGER,
    candName character varying(255) NOT NULL,
    candEmail character varying(255) NOT NULL UNIQUE
    )
    """

# Execute createUsersTableQuery command to create users table
cur.execute(createUsersTableQuery)

# Commit the transaction to save the changes
conn.commit()

# Close the cursor and database connection
cur.close()
conn.close()