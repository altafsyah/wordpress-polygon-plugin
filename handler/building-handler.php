<?php

class BuildingHandler
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAll()
    {
        $stmtCat = $this->pdo->query("SELECT * FROM wp_building_category");
        $categories = $stmtCat->fetchAll();

        foreach ($categories as &$category) {
            $stmtBld = $this->pdo->prepare("SELECT * FROM wp_buildings WHERE category_id = ?");
            $stmtBld->execute([$category['id']]);
            $buildings = $stmtBld->fetchAll();

            foreach ($buildings as &$building) {
                if (isset($building['geometry'])) {
                    $decoded = json_decode($building['geometry'], true);
                    $building['geometry'] = $decoded !== null ? $decoded : $building['geometry'];
                }
            }

            $category['buildings'] = $buildings;
        }

        return json_encode(['success' => true, 'data' => $categories]);
    }

    public function create()
    {
        $data = json_decode(file_get_contents('php://input'), true);

        $geometry = is_array($data['geometry']) ? json_encode($data['geometry']) : $data['geometry'];

        $stmt = $this->pdo->prepare("INSERT INTO wp_buildings (name, geometry, category_id) VALUES (:name, :geometry, :category_id)");
        $stmt->execute([
            ':name' => $data['name'],
            ':geometry' => $geometry,
            ':category_id' => $data['category_id']
        ]);
        return json_encode(['success' => true, 'id' => $this->pdo->lastInsertId()]);
    }

    public function delete($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM wp_buildings WHERE id = :id");
        $stmt->execute([':id' => $id]);
        return json_encode(['success' => true]);
    }
}
