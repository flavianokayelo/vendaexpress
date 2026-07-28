#!/bin/bash
killall mysqld 2>/dev/null
sleep 2
mkdir -p /var/run/mysqld
chown mysql:mysql /var/run/mysqld
mysqld --user=mysql --datadir=/var/lib/mysql &
sleep 3
echo "MySQL restarted"
