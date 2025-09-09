<?php

class Router
{
    private $routes = [];

    public function addRoute($method, $path, $handler)
    {
        $this->routes[] = [
            'method' => $method,
            'path' => $path,
            'handler' => $handler
        ];
    }

    public function handleRequest()
    {
        $method = $_SERVER['REQUEST_METHOD'];
        $uri = $_SERVER['REQUEST_URI'];
        $path = trim(parse_url($uri, PHP_URL_PATH), '/');
        $path = str_replace('api-map/', '', $path);
        $path = rtrim($path, '/');

        foreach ($this->routes as $route) {
            // Check for parameterized route like categories/:id
            if (preg_match('#^' . preg_replace('/:\w+/', '(\d+)', $route['path']) . '$#', $path, $matches)) {
                if ($route['method'] === $method) {
                    // If there is a parameter, pass it to the handler
                    array_shift($matches); // Remove full match
                    return $route['handler'](...$matches);
                }
            } elseif ($route['method'] === $method && $route['path'] === $path) {
                return $route['handler']();
            }
        }

        http_response_code(404);
        return json_encode([
            'error' => 'Route not found',
            'requested_path' => $path,
            'requested_method' => $method
        ]);
    }
}
