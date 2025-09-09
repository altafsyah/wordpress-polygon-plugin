<?php
require_once 'core/config.php';
require_once 'core/router.php';
require_once 'handler/building-handler.php';
require_once 'handler/categories-handler.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$router = new Router();
$buildingController = new BuildingHandler($PDO);
$categoryController = new CategoryHandler($PDO);

$router->addRoute('GET', 'buildings', function () use ($buildingController) {
    return $buildingController->getAll();
});
$router->addRoute('POST', 'buildings', function () use ($buildingController) {
    return $buildingController->create();
});

$router->addRoute('DELETE', 'buildings/:id', function ($id) use ($buildingController) {
    return $buildingController->delete($id);
});

$router->addRoute('GET', 'categories', function () use ($categoryController) {
    return $categoryController->getAll();
});
$router->addRoute('POST', 'categories', function () use ($categoryController) {
    return $categoryController->create();
});

$router->addRoute('PUT', 'categories/:id', function ($id) use ($categoryController) {
    return $categoryController->update($id);
});
$router->addRoute('DELETE', 'categories/:id', function ($id) use ($categoryController) {
    return $categoryController->delete($id);
});

echo $router->handleRequest();
