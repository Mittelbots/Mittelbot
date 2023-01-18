#!/bin/bash

# import env variables
. ./.env

#----------------------------------------
# OPTIONS
#----------------------------------------
USER=$DB_USER # MySQL User
PASSWORD=$DB_PASSWORD # MySQL Password
DB_NAME=$DB_DATABASE # Database Name
HOST=$DB_HOST # MySQL Hostname

#----------------------------------------

echo "Dumping database $DB_NAME to backup.sql"

while true
do
  YEAR=$(date +"%Y")
  MONTH=$(date +"%m")
  DAY=$(date +"%d")
  BACKUP_FILE="$YEAR-$MONTH-$DAY.sql"

  echo "Creating backup file $BACKUP_FILE"

  mkdir -p ./backups/$YEAR/$MONTH/$DAY

  mysqldump -u $USER -p $PASSWORD $DB_NAME > ./backups/$BACKUP_FILE
  cat ./backups/$BACKUP_FILE
  if [ ! -s ./backups/$BACKUP_FILE ]
  then
    echo "Backup file is empty, deleting"
    rm ./backups/$BACKUP_FILE
  else 
    echo "-------Backup complete-------"
  fi
    
  sleep 86400
done