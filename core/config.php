<?php

$HOST = 'localhost';
$DB = 'wordpress';
$DB_USERNAME = 'root';
$DB_PASSWORD = '';
$CHARSET = 'utf8mb4';

$DSN = "mysql:host=$HOST;dbname=$DB;charset=$CHARSET";
$OPTIONS = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $PDO = new PDO($DSN, $DB_USERNAME, $DB_PASSWORD, $OPTIONS);
} catch (\PDOException $e) {
    throw new \PDOException($e->getMessage(), (int)$e->getCode());
}
