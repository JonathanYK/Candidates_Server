"""
This Python script connects to a PostgreSQL database and creates a table named "users".
It takes arguments for the database: host, port, name, username, and password.
It uses the psycopg2 library to establish the connection and create the table.
If the table already exists, it prints a message. Finally, it closes the connection.
"""
# import sys
import psycopg2

# Get the arguments passed to the Python script
args = sys.argv

db_host = args[1].split(':')[0]
db_port = args[2]
db_name = args[3]
db_user = args[4]
db_password = args[5]

create_table_name = "users"

try:
    # Connect to the database
    connection = psycopg2.connect(
        host=db_host,
        port=str(db_port),
        dbname=db_name,
        user=db_user,
        password=db_password
    )

    # Open a cursor to execute SQL queries
    cursor  = connection.cursor()

    print(f"""Connected to {db_host}, creating "{create_table_name}" table.""")
    createUsersTableQuery = f"""
    CREATE TABLE {create_table_name} (
        candId INTEGER,
        candName character varying(255) NOT NULL,
        candEmail character varying(255) NOT NULL UNIQUE
        )
        """

    # Execute createUsersTableQuery command to create users table
    cursor.execute(createUsersTableQuery)

    # Commit the transaction to save the changes
    connection.commit()

except psycopg2.errors.DuplicateTable:
    print(f"""Table "{create_table_name}" already exists.""")

except (Exception, psycopg2.Error) as error:
    print(f"Error while connecting to PostgreSQL on RDS: {error}")

finally:
    try:
        if cursor:
            cursor.close()
        if connection:
            connection.close()
            print("PostgreSQL RDS connection is closed.")

    except (Exception, psycopg2.Error) as error:
        print(f"Error while closing PostgreSQL RDS connection: {error}")

