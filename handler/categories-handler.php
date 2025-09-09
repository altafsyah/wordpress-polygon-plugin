<?php

class CategoryHandler
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAll()
    {
        $stmt = $this->pdo->query("SELECT * FROM wp_building_category");
        $categories = $stmt->fetchAll();
        return json_encode(['success' => true, 'data' => $categories]);
    }

    public function create()
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $this->pdo->prepare("INSERT INTO wp_building_category (name, color) VALUES (:name, :color)");
        $stmt->execute([':name' => $data['name'], ':color' => $data['color']]);
        return json_encode(['success' => true, 'id' => $this->pdo->lastInsertId()]);
    }


    public function update($id)
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $this->pdo->prepare("UPDATE wp_building_category SET name = :name, color = :color WHERE id = :id");
        $stmt->execute([
            ':name' => $data['name'],
            ':color' => $data['color'],
            ':id' => $id
        ]);
        return json_encode(['success' => true]);
    }

    public function delete($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM wp_building_category WHERE id = :id");
        $stmt->execute([':id' => $id]);
        return json_encode(['success' => true]);
    }
}
