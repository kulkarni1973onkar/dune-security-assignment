package main

import (
	"log"
	"net/http"

	"backend/config"
)

func main() {
	// connect to MongoDB
	config.ConnectDB()

	// test server
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("API is running 🚀"))
	})

	log.Println("Server running on port 8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
