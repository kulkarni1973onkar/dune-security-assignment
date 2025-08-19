// Middleware for API key authentication via X-API-Key header.

package middleware

import (
	"os"

	"github.com/gofiber/fiber/v2"
)

func APIKey() fiber.Handler {
	key := os.Getenv("API_KEY")
	return func(c *fiber.Ctx) error {
		if key == "" {
			return c.Next()
		}
		if c.Get("X-API-Key") != key {
			return c.Status(401).JSON(fiber.Map{"error": "unauthorized"})
		}
		return c.Next()
	}
}
